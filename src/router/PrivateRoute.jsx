import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // While checking authentication status, show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // If authenticated, render the protected routes
  return <Outlet />;
};

export default PrivateRoute;
