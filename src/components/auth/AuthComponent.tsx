import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmailAuthForm from './EmailAuthForm';
import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  // inMemoryPersistence, // Removed unused import
  setPersistence
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getAuthErrorMessage } from '../../utils/errorMessages';

interface AuthComponentProps {
  type: 'login' | 'register';
}

const AuthComponent = ({ type }: AuthComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('Usuario autenticado, redirigiendo desde AuthComponent via useEffect...');
      
      const redirectPath = sessionStorage.getItem('redirectPath');
      // Default to '/herramientas-sst' if redirectPath is null, undefined, 
      // or points back to the current auth page (location.pathname).
      const targetPath = (redirectPath && redirectPath !== location.pathname) ? redirectPath : '/herramientas-sst'; 
      
      console.log(`useEffect redirect: Path desde storage: ${redirectPath}, Path actual: ${location.pathname}, Target path: ${targetPath}`);
      navigate(targetPath, { replace: true });
      
      // Limpiar la ruta almacenada después de usarla.
      if (redirectPath) {
          sessionStorage.removeItem('redirectPath');
      }
    }
  }, [currentUser, navigate, location.pathname]); // Added location.pathname to dependencies

  const handleError = (error: any) => {
    console.error('Error en autenticación:', error);
    setError(getAuthErrorMessage(error));
    setIsLoading(false);

    // Limpiar el error después de 5 segundos
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentPath = location.pathname;
      console.log('Guardando ruta actual para redirección:', currentPath);
      sessionStorage.setItem('redirectPath', currentPath);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Detectar navegador y versión
      const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
      const chromeVersion = isChrome ? 
        parseInt(navigator.userAgent.match(/Chrome\/([0-9]+)/)?.[1] || '0') : 0;
      
      console.log('Información del navegador:', {
        isChrome,
        chromeVersion,
        userAgent: navigator.userAgent
      });

      // Usar popup por defecto para Chrome 115+ y otros navegadores modernos
      const shouldUsePopup = isChrome && chromeVersion >= 115;

      if (shouldUsePopup) {
        console.log('Usando popup para Chrome 115+ o superior (con persistencia local)');
        try {
          // No cambiar persistencia aquí, usar la configurada por defecto (local)
          // await setPersistence(auth, inMemoryPersistence); 
          const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
          
          if (result.user) {
            console.log('Login con popup exitoso:', result.user.email);
            // No es necesario restaurar persistencia si no se cambió
            // try {
            //   await setPersistence(auth, browserLocalPersistence);
            // } catch (persistenceError) {
            //   console.warn('No se pudo restaurar persistencia local:', persistenceError);
            // }
            // handlePostLoginRedirect(); // Rely on useEffect watching currentUser
          }
        } catch (popupError: any) {
          console.error('Error en popup:', popupError);
          throw popupError;
        }
      } else {
        // Para otros navegadores o versiones anteriores, intentar redirección primero
        try {
          console.log('Iniciando sign in con redirección...');
          await signInWithRedirect(auth, provider);
          console.log('Redirección iniciada exitosamente');
        } catch (redirectError: any) {
          console.warn('Error en signInWithRedirect:', redirectError);
          
          // Si falla la redirección, usar popup como fallback
          console.log('Usando popup como fallback después de error de redirección');
          const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
          if (result.user) {
            console.log('Login con popup fallback exitoso:', result.user.email);
            // handlePostLoginRedirect(); // Rely on useEffect watching currentUser
          }
        }
      }
    } catch (error: any) {
      console.error('Error en la autenticación:', error);
      setError(getAuthErrorMessage(error));
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el resultado de la redirección al cargar
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('Verificando resultado de redirección...');
        const result = await getRedirectResult(auth, browserPopupRedirectResolver);
        
        if (result?.user) {
          console.log('Usuario autenticado exitosamente por redirección:', result.user.email);
          // Forzar persistencia local para mantener la sesión
          await setPersistence(auth, browserLocalPersistence);
          // await handlePostLoginRedirect(); // Rely on useEffect watching currentUser
        } else {
          console.log('No hay resultado de redirección pendiente');
        }
      } catch (error: any) {
        console.error('Error al procesar resultado de redirección:', error);
        setError(getAuthErrorMessage(error));
        setTimeout(() => setError(null), 5000);
        
        // Intentar redirección de todos modos como fallback
        if (auth.currentUser) {
          // Navigation will be handled by the main useEffect watching currentUser
          // await handlePostLoginRedirect(); 
        }
      }
    };

    // Agregar pequeño delay para asegurar que Firebase complete el flujo
    const timer = setTimeout(() => {
      handleRedirectResult();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-safeia-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-16 w-auto"
          src="/SAFEIA LOGO.jpg"
          alt="SAFEIA"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-safeia-black">
          {type === 'login' ? 'Iniciar sesión' : 'Registrarse'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded relative" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8"
                  onClick={() => setError(null)}
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <EmailAuthForm 
              onSuccess={() => setError(null)} 
              onError={handleError} 
            />
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-safeia-gray" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-safeia-gray">O continuar con</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                      Continuar con Google
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
