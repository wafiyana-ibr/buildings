import { createContext, useEffect, useState, useCallback } from "react";
import { userAPI } from "@/api/dbAPI";
import Swal from "sweetalert2"; // Add this import
// Create context with default values
export const AuthContext = createContext({
  user: null,
  loading: true,
  fetchUser: async () => null,
  logout: async () => { }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await userAPI.getUserMe();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Set loading to true immediately
      setLoading(true);

      // Show loading message with SweetAlert
      Swal.fire({
        title: 'Logging out...',
        text: 'Please wait',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Remove relevant items from localStorage
      localStorage.removeItem('pendingBaseAdd');

      // Call logout API
      await userAPI.logout();
      setUser(null);

      // Close the loading alert
      Swal.close();

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Redirect to login page after the success message
        window.location.href = "/sign-in";
      });
    } catch (error) {
      // Close the loading alert if there's an error
      Swal.close();

      console.error("Error logging out:", error);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to log out. Please try again.',
      });

      // Set loading to false
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    loading,
    fetchUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
