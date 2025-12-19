export const authApi = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
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