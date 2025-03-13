// src/services/authService.ts

// Default testing credentials
export const TEST_CREDENTIALS = {
  username: "abhiman",
  password: "abhiman"
};

// Function to encode username and password to base64 for Basic Auth
export const encodeBasicAuth = (username: string, password: string): string => {
  const credentials = `${username}:${password}`;
  // Using btoa for base64 encoding in browser
  return `Basic ${btoa(credentials)}`;
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Function to store auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Function to clear auth token (logout)
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Login function
export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    // First validate if credentials match the expected test credentials
    if (username !== TEST_CREDENTIALS.username || password !== TEST_CREDENTIALS.password) {
      console.error('Invalid credentials');
      return false;
    }
    
    const authToken = encodeBasicAuth(username, password);
    
    // For now, we just validate credentials locally
    // In a production environment, we would validate with the server
    setAuthToken(authToken);
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Logout function
export const logout = (): void => {
  clearAuthToken();
};