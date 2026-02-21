import { MonthData } from '../types';

const isPreview = true;
const STORAGE_KEY = 'financas_pro_data';

export const storageService = {
  async getMonths(): Promise<MonthData[]> {
    try {
      if (isPreview) {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
      const response = await fetch('/.netlify/functions/database?action=select');
      if (!response.ok) throw new Error('Failed to fetch data');
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
      const response = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', data: months }),
      });
      if (!response.ok) throw new Error('Failed to save data');
    } catch (error) {
      console.error('Error saving months:', error);
      throw error;
    }
  }
};
