import { neon } from '@netlify/neon';

export const handler = async (event: any) => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing in environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DATABASE_URL not configured' }),
    };
  }

  // Log masked URL for debugging
  const maskedUrl = databaseUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`Connecting to database: ${maskedUrl}`);

  const sql = neon(databaseUrl);
  
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const action = event.queryStringParameters?.action || body.action;

    console.log(`Executing action: ${action}`);

    switch (action) {
      case 'select':
        const results = await sql`SELECT * FROM transactions ORDER BY date DESC`;
        return {
          statusCode: 200,
          body: JSON.stringify(results),
        };

      case 'insert':
        const { date, amount, description, category, type, bank, isInstallment, importance } = body.data;
        await sql`
          INSERT INTO transactions (date, amount, description, category, type, bank, installment, importance)
          VALUES (${date}, ${amount}, ${description}, ${category}, ${type}, ${bank}, ${isInstallment}, ${importance})
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

      case 'save':
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
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Database connection or query failed', 
        details: error.message,
        stack: error.stack 
      }),
    };
  }
};
