import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applySchema() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    console.error('Error: Cloudflare D1 configuration (Account ID, Database ID, or API Token) is missing');
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying schema to D1...');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    console.error('D1 API error:', JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log('Schema applied successfully!');
  console.log('Result:', JSON.stringify(result.result, null, 2));
}

applySchema().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
