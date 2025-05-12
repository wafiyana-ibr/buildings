import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Feature routes
import Home from '@/pages/home/Home'
import Bases from '@/pages/base/Bases'
import Base from '@/pages/base/Base'
import BaseScan from '@/pages/base/BaseScan'
import BaseEdit from '@/pages/base/BaseEdit'
import SignIn from '@/pages/auth/SignIn'
import SignUp from '@/pages/auth/SignUp';

// Admin routes
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminBases from '@/pages/admin/Bases';
import AdminUsers from '@/pages/admin/Users';
import AdminCategories from '@/pages/admin/Categories';
import AdminTypes from '@/pages/admin/Types';
import NotFound from '@/pages/NotFound';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route element={<PrivateRoute />}>
                <Route path="/base" element={<Bases />} />
                <Route path="/base/:id" element={<Base />} />
                <Route path="/base/:id/scan" element={<BaseScan />} />
                <Route path="/base/:id/edit" element={<BaseEdit />} />
            </Route>
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bases" element={<AdminBases />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/types" element={<AdminTypes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;