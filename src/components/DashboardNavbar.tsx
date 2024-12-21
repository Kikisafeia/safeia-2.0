import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Wrench,
  User,
  HelpCircle,
  Bot,
  BookOpen,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react';

const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: Home },
    { name: 'Herramientas SST', href: '/herramientas-sst', icon: Wrench },
    { name: 'Mi Cuenta', href: '/mi-cuenta', icon: User },
    { name: 'Asistente IA', href: '/asistente-ia', icon: Bot },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <img
                src="/SAFEIA LOGO.jpg"
                alt="SAFEIA"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActivePath(item.href)
                    ? 'text-safeia-yellow bg-safeia-yellow/10'
                    : 'text-gray-600 hover:text-safeia-yellow hover:bg-safeia-yellow/5'
                }`}
              >
                <item.icon className="h-5 w-5 mr-1.5" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-safeia-yellow rounded-full hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="relative ml-3">
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-safeia-yellow hover:bg-safeia-yellow/5 transition-colors duration-150"
                >
                  <LogOut className="h-5 w-5 mr-1.5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-safeia-yellow hover:bg-gray-100"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(item.href)
                    ? 'text-safeia-yellow bg-safeia-yellow/10'
                    : 'text-gray-600 hover:text-safeia-yellow hover:bg-safeia-yellow/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-safeia-yellow hover:bg-safeia-yellow/5"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
