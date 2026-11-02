export const d1Service = {
  async executeQuery(sql: string, params: any[] = []) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !databaseId || !apiToken) {
      throw new Error('Cloudflare D1 configuration (Account ID, Database ID, or API Token) is missing');
    }

    console.log(`[D1] EXECUTE START: ${sql.substring(0, 50)}...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
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
            params,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.text();
        console.error(`[D1] API ERROR: ${error}`);
        throw new Error(`D1 API error: ${error}`);
      }

      const result = await response.json();
      if (!result.success) {
        console.error(`[D1] QUERY FAILED: ${JSON.stringify(result.errors)}`);
        throw new Error(`D1 Query failed: ${JSON.stringify(result.errors)}`);
      }

      console.log(`[D1] EXECUTE SUCCESS`);
      return result.result[0];
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error(`[D1] TIMEOUT`);
        throw new Error('D1 request timed out');
      }
      throw error;
    }
  },

  async createSurprise(id: string, data: any) {
    const sql = `
      INSERT INTO surprises (id, data, status, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.executeQuery(sql, [id, JSON.stringify(data), data.status || 'generating']);
  },

  async updateSurprise(id: string, data: any) {
    const sql = `
      UPDATE surprises
      SET data = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await this.executeQuery(sql, [JSON.stringify(data), data.status || 'ready', id]);
  },

  async getSurprise(id: string) {
    const sql = `SELECT data FROM surprises WHERE id = ?`;
    const result = await this.executeQuery(sql, [id]);
    if (result && result.results && result.results.length > 0) {
      return JSON.parse(result.results[0].data);
    }
    return null;
  },

  async deleteSurprise(id: string) {
    console.log(`[D1] AUTO-DELETE: Purging surprise ${id}`);
    const sql = `DELETE FROM surprises WHERE id = ?`;
    await this.executeQuery(sql, [id]);
  },

  async getAllSurprises() {
    const sql = `SELECT id, data FROM surprises LIMIT 200`;
    try {
      const result = await this.executeQuery(sql, []);
      if (result && result.results) {
        return result.results.map((r: any) => ({
          id: r.id,
          data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data
        }));
      }
      return [];
    } catch (e: any) {
      console.warn('[D1] getAllSurprises warning:', e.message);
      return [];
    }
  }
};
