import dotenv from 'dotenv';

dotenv.config();

async function verifyTable() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    console.error('Error: Cloudflare D1 configuration missing');
    process.exit(1);
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='surprises';",
      }),
    }
  );

  const result = await response.json();
  console.log('Verification Result:', JSON.stringify(result, null, 2));

  if (result.success && result.result[0].results.length > 0) {
    console.log('Success: Table "surprises" exists!');
  } else {
    console.error('Error: Table "surprises" NOT found.');
    process.exit(1);
  }
}

verifyTable().catch(err => {
  console.error(err);
  process.exit(1);
});
