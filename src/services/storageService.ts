import { MonthData } from '../types';

const isPreview = false;
const STORAGE_KEY = 'financas_pro_data';

export const storageService = {
  async getMonths(): Promise<MonthData[]> {
    try {
      if (isPreview) {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
      
      console.log('Fetching data from Netlify Function...');
      const response = await fetch('/.netlify/functions/database?action=select');
      
      console.log(`Fetch response status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting months:', error);
      throw error;
    }
  },

  async saveMonths(months: MonthData[]): Promise<void> {
    try {
      if (isPreview) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
        return;
      }
      
      console.log('Saving data to Netlify Function...');
      const response = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: months }),
      });
      
      console.log(`Save response status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving months:', error);
      throw error;
    }
  }
};
