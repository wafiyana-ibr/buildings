import React from 'react';
import Header from './Header';
import Footer from './Footer';

const UserLayout = ({ children }) => {
    return (
        <div className={`min-h-screen bg-gradient-to-b from-blue-400 flex flex-col to-blue-600 relative overflow-hidden dark:from-neutral-700 dark:to-neutral-900`}>
            <Header />
            <main className='flex-1 relative z-10 container mx-auto px-4 sm:px-8'>{children}</main>
            <Footer />
        </div>
    );
};

export default UserLayout;