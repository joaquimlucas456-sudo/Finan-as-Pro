import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handler as databaseHandler } from './netlify/functions/database';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Netlify Functions path in development
  app.all('/.netlify/functions/database', async (req, res) => {
    // Convert Express request to something similar to Netlify event
    const event = {
      httpMethod: req.method,
      body: JSON.stringify(req.body),
      queryStringParameters: req.query,
      headers: req.headers,
    };

    try {
      const result = await databaseHandler(event);
      const headers = (result as any).headers || {};
      res.status(result.statusCode).set(headers).send(result.body);
    } catch (error: any) {
      console.error('Function execution error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
