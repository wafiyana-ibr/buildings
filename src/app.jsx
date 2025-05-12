// src/app.jsx
import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import UserLayout from './components/layout/UserLayout';
import AppRouter from './router';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './components/layout/AdminLayout';
import ThemeProvider from './context/ThemeProvider';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isAdminRoute = location.pathname.startsWith('/admin');

    if (user?.role === 'admin' && isAdminRoute) {
        return <AdminLayout>{children}</AdminLayout>;
    }
    return <UserLayout>{children}</UserLayout>;
};

const App = () => {
    return (
        <ThemeProvider>
            <Router>
                <Layout>
                    <AppRouter />
                </Layout>
            </Router>
        </ThemeProvider>
    );
};

export default App;