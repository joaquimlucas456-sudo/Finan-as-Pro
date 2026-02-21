import { neon } from '@netlify/neon';

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  try {
    // Use NETLIFY_DATABASE_URL as requested
    const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('NETLIFY_DATABASE_URL is UNDEFINED');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'NETLIFY_DATABASE_URL not configured in Netlify panel' }),
      };
    }

    console.log('Database URL found, connecting...');
    const sql = neon(databaseUrl);
    
    const body = event.body ? JSON.parse(event.body) : {};
    const action = event.queryStringParameters?.action || body.action;

    console.log(`Executing action: ${action}`);

    switch (action) {
      case 'select_state':
        // Get the whole app state from app_state table
        // We use app_state as the primary source for the full month/year structure
        const stateResult = await sql`SELECT content FROM app_state WHERE id = 'main'`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stateResult[0]?.content || []),
        };

      case 'select':
        // Rigorous table name: transactions
        const results = await sql`SELECT * FROM transactions ORDER BY date DESC`;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(results),
        };

      case 'insert':
        // Rigorous column names: bank, installment, importance
        const { date, amount, description, category, type, bank, installmentInfo, importance } = body.data;
        await sql`
          INSERT INTO transactions (date, amount, description, category, type, bank, installment, importance)
          VALUES (${date}, ${amount}, ${description}, ${category}, ${type}, ${bank}, ${installmentInfo}, ${importance})
        `;
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ message: 'Inserted successfully into transactions' }),
        };

      case 'insert_savings':
        // Rigorous table name: savings
        const { amount: sAmount, description: sDescription } = body.data;
        await sql`
          INSERT INTO savings (amount, description)
          VALUES (${sAmount}, ${sDescription})
        `;
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ message: 'Inserted successfully into savings' }),
        };

      case 'save':
        // Ensure data is stringified and cast to jsonb to avoid syntax errors
        const jsonData = JSON.stringify(body.data);
        
        console.log('Saving state to app_state and content tables...');
        
        await sql`
          INSERT INTO app_state (id, content) 
          VALUES ('main', ${jsonData}::jsonb)
          ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
        `;
        
        try {
          await sql`
            INSERT INTO content (id, content) 
            VALUES ('main', ${jsonData}::jsonb)
            ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
          `;
        } catch (e) {
          console.warn('Could not save to "content" table:', e);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'State saved successfully' }),
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error: any) {
    console.error('Database Function Error:', error);
    // Return the real error message in the body as requested
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Unknown server error',
        details: error.toString()
      }),
    };
  }
};
