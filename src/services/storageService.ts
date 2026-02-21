import { MonthData } from '../types';

const isPreview = false;
const STORAGE_KEY = 'financas_pro_data';

const handleDatabaseError = (error: any) => {
  const message = error.message || '';
  if (message.toLowerCase().includes('relation') && message.toLowerCase().includes('does not exist')) {
    const tableName = message.match(/"([^"]+)"/)?.[1] || 'desconhecida';
    alert(`ERRO DE BANCO DE DADOS: A tabela "${tableName}" não foi encontrada no Neon. Por favor, crie-a no painel da Neon.`);
  }
};

export const storageService = {
  async getMonths(): Promise<MonthData[]> {
    try {
      if (isPreview) {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
      
      console.log('Fetching data from Netlify Function...');
      const response = await fetch('/.netlify/functions/database?action=select_state');
      
      console.log(`Fetch response status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);
      
      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Servidor retornou HTML em vez de dados. Usando modo local.', text.substring(0, 100));
        throw new Error('Invalid response format (HTML instead of JSON)');
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || errorData.details || 'Failed to fetch data';
        const err = new Error(errorMsg);
        handleDatabaseError(err);
        throw err;
      }
      
      const data = await response.json();
      // If we got data, sync it to localStorage as a backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error getting months, falling back to localStorage:', error);
      const localData = localStorage.getItem(STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    }
  },

  async saveMonths(months: MonthData[]): Promise<void> {
    // Always save to localStorage first as a backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(months));

    try {
      if (isPreview) return;
      
      console.log('Saving data to Netlify Function...');
      const response = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: months }),
      });
      
      console.log(`Save response status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Servidor retornou HTML ao salvar. Dados mantidos localmente.');
        return; // Silent fail for save, since we already saved to localStorage
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Unknown error';
        console.error('Failed to save to cloud:', errorMsg);
        handleDatabaseError(new Error(errorMsg));
      }
    } catch (error) {
      console.error('Error saving months to cloud, data kept in localStorage:', error);
    }
  }
};
