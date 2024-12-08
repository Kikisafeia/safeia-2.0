import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailAuthForm from './EmailAuthForm';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
      className="p-6"
    >
      {value === index && children}
    </div>
  );
}

const AuthComponent: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // La redirección se manejará en el useEffect cuando currentUser se actualice
    } catch (err) {
      console.error('Error during Google login:', err);
      setError('Error al iniciar sesión con Google. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario ya está autenticado, no mostrar el formulario de login
  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Bienvenido a SAFEIA
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setTabValue(0)}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  tabValue === 0
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setTabValue(1)}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  tabValue === 1
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Registrarse
              </button>
            </nav>
          </div>

          <TabPanel value={tabValue} index={0}>
            <EmailAuthForm mode="login" />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <EmailAuthForm mode="signup" />
          </TabPanel>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? (
                  <span>Cargando...</span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Continuar con Google
                  </span>
                )}
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs text-center text-gray-500">
            Al continuar, aceptas nuestros Términos de servicio y Política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
