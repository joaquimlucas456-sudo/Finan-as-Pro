import { neon } from '@netlify/neon';

export const handler = async (event: any) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DATABASE_URL not configured' }),
    };
  }

  const sql = neon(databaseUrl);
  const method = event.httpMethod;
  
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const action = event.queryStringParameters?.action || body.action;

    switch (action) {
      case 'select':
        const results = await sql`SELECT * FROM transactions ORDER BY date DESC`;
        return {
          statusCode: 200,
          body: JSON.stringify(results),
        };

      case 'insert':
        const { date, amount, description, category, type } = body.data;
        await sql`
          INSERT INTO transactions (date, amount, description, category, type)
          VALUES (${date}, ${amount}, ${description}, ${category}, ${type})
        `;
        return {
          statusCode: 201,
          body: JSON.stringify({ message: 'Inserted successfully' }),
        };

      case 'delete':
        const { id } = body;
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Deleted successfully' }),
        };

      case 'save': // Fallback for the whole state if needed
        await sql`
          INSERT INTO app_state (id, content) 
          VALUES ('main', ${JSON.stringify(body.data)})
          ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
        `;
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'State saved successfully' }),
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
