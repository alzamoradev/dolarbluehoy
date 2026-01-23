import { DolarRate } from '@/types';

export const fetchDollarRates = async (): Promise<DolarRate[]> => {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares', {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Error fetching rates');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch rates:", error);
    return [];
  }
};
