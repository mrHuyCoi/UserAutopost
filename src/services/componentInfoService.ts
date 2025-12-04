// src/services/componentInfoService.ts

export const componentInfoService = {
  // Function to fetch the distinct brands for filtering
  getDistinctBrands: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/brands`);
    const data = await response.json();
    return data; // Ensure this matches the expected format
  },
  // You can add other functions for dealing with component data
};
