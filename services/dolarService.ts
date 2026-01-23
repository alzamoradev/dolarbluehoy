import { DolarRate } from '../types';

export const fetchDollarRates = async (): Promise<DolarRate[]> => {
  try {
    // Standard endpoint for DolarApi Argentina
    const response = await fetch('https://dolarapi.com/v1/dolares');
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