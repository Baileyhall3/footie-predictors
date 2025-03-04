/**
 * Utility functions for persisting and retrieving authentication state
 */

// Key for storing auth state in localStorage
const AUTH_STORAGE_KEY = 'footie_predictors_auth_state';

/**
 * Save authentication state to localStorage
 * @param {Object} session - The Supabase session object
 */
export const saveAuthState = (session) => {
  try {
    if (session) {
      // Only store essential information, not the entire session
      const authState = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email
        }
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } else {
      // If session is null, clear the stored state
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

/**
 * Retrieve authentication state from localStorage
 * @returns {Object|null} The stored auth state or null if not found
 */
export const getAuthState = () => {
  try {
    const storedState = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : null;
  } catch (error) {
    console.error('Error retrieving auth state:', error);
    return null;
  }
};

/**
 * Clear authentication state from localStorage
 */
export const clearAuthState = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

/**
 * Check if there is a stored authentication state
 * @returns {boolean} True if auth state exists in localStorage
 */
export const hasAuthState = () => {
  return !!getAuthState();
};
