import React from 'react';
import DashboardNavbar from './DashboardNavbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title,
  description 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-safeia-yellow/10">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {(title || description) && (
            <div className="text-center mb-12">
              {title && (
                <h1 className="text-4xl font-bold text-safeia-black mb-4">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-xl text-gray-600">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
