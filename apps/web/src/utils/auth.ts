// Authentication utility functions
export const clearUserData = () => {
  try {
    // Clear all user-related data
    localStorage.removeItem('afritrade:user');
    localStorage.removeItem('afritrade:auth');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('cart');

    // Dispatch events to update UI
    window.dispatchEvent(new CustomEvent('auth:logout'));
    window.dispatchEvent(new CustomEvent('wishlist:update', { detail: { count: 0 } }));
    window.dispatchEvent(new CustomEvent('cart:update', { detail: { count: 0 } }));

    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

export const logout = async () => {
  try {
    const { apiPost } = require("./api");
    await apiPost("/api/v1/auth/logout");
  } catch (e) {
    console.error("Logout failed", e);
  }
  clearUserData();
  // Redirect to homepage
  window.location.href = '/';
};

// Get user ID from localStorage
export const getUserId = (): string | null => {
  try {
    const raw = localStorage.getItem('afritrade:user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || user?._id || null;
  } catch {
    return null;
  }
};

// Create auth header for API requests
export const authHeader = (): Record<string, string> => {
  // Use the centralized getAuthHeader to ensure we send the JWT, not the ID
  // We use require here to avoid potential circular dependencies if api.ts imports from auth.ts in the future
  const { getAuthHeader } = require("./api");
  return getAuthHeader();
}; 