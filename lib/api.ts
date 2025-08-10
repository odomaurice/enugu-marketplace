export const authApi = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`https://enugu-state-food-bank.onrender.com/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(responseText || 'Request failed');
    }

    return responseText ? JSON.parse(responseText) : {};
  } catch (error: any) {
    console.error(`Auth API error (${endpoint}):`, error);
    throw error;
  }
};