import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg">
                <img 
                  src="/SAFEIA LOGO.jpg" 
                  alt="SAFEIA" 
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link
                  to="/herramientas-sst"
                  className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium"
                >
                  Herramientas SST
                </Link>

                {/* Menú Gestión SST */}
                <Menu as="div" className="relative">
                  <Menu.Button className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                    Gestión SST
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/herramientas-sst/sgsst-pymes"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              SGSST para PyMES
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/herramientas-sst/matriz-riesgos"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Matriz de Riesgos
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* Menú Prevención */}
                <Menu as="div" className="relative">
                  <Menu.Button className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                    Prevención
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/herramientas-sst/pts"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Procedimientos de Trabajo Seguro
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/herramientas-sst/ats"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Análisis de Trabajo Seguro
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                <Link
                  to="/herramientas-sst/agentes-especializados"
                  className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium"
                >
                  Asistente IA
                </Link>

                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium"
                >
                  Planes
                </Link>

                {currentUser.email === 'admin@safeia.com' && (
                  <Link
                    to="/admin/subscriptions"
                    className="text-gray-700 hover:text-safeia-yellow px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Suscripciones
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1 mr-4"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-safeia-black text-white px-4 py-2 rounded-lg hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;