import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  // While checking authentication status, show loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect to home
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin, render the protected routes
  return <Outlet />;
};

export default AdminRoute;
