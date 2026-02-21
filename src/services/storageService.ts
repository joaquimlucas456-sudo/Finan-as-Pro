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
        console.warn('Servidor retornou HTML em vez de dados.', text.substring(0, 100));
        throw new Error('O servidor retornou um formato inválido (HTML em vez de JSON). Verifique os logs da Netlify.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || errorData.details || 'Erro desconhecido ao buscar dados.';
        const err = new Error(errorMsg);
        handleDatabaseError(err);
        throw err;
      }
      
      const data = await response.json();
      // Sync to localStorage as a backup, but we rely on the cloud
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('Erro crítico ao buscar meses do banco:', error);
      // We still return local data to prevent the app from crashing, but we alert the user
      const localData = localStorage.getItem(STORAGE_KEY);
      if (!localData) {
        alert(`Erro de Conexão: ${error.message}`);
      }
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
        throw new Error('Servidor retornou formato inválido ao salvar.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Erro ao salvar na nuvem.';
        const err = new Error(errorMsg);
        handleDatabaseError(err);
        throw err;
      }
    } catch (error: any) {
      console.error('Erro ao salvar no banco de dados:', error);
      alert(`Falha na Sincronização: ${error.message}. Seus dados foram salvos apenas localmente neste navegador.`);
    }
  }
};
