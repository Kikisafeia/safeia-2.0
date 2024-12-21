import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface EmailAuthFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();

  // Limpiar errores cuando el usuario comienza a escribir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim());
    setFormError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setFormError(null);
  };

  const validateForm = () => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFormError('Por favor ingresa tu correo electrónico');
      return false;
    }
    if (!emailRegex.test(email)) {
      setFormError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    // Validar contraseña
    if (!password) {
      setFormError('Por favor ingresa tu contraseña');
      return false;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password.length > 50) {
      setFormError('La contraseña no puede exceder los 50 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Intentando login con email:', email);
      await login(email, password);
      console.log('Login con email exitoso');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje de error:', error.message);
      
      const errorMessage = getErrorMessage(error.code);
      console.log('Mensaje de error para usuario:', errorMessage);
      
      setFormError(errorMessage);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-credential':
        return 'Las credenciales son incorrectas. Por favor, verifica tu correo y contraseña.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Por favor, intenta más tarde.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Por favor, verifica tu internet.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada. Contacta a soporte.';
      case 'auth/operation-not-allowed':
        return 'El inicio de sesión con email no está habilitado. Contacta al administrador.';
      case 'auth/timeout':
        return 'La operación expiró. Por favor, intenta nuevamente.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de inicio de sesión. Por favor, intenta nuevamente.';
      case 'auth/cancelled-popup-request':
        return 'La operación fue cancelada. Por favor, intenta nuevamente.';
      case 'auth/unauthorized-domain':
        return 'Este dominio no está autorizado para operaciones de autenticación.';
      default:
        return `Error al iniciar sesión (${code}). Por favor, intenta de nuevo.`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{formError}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-safeia-black">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateForm()}
            className="appearance-none block w-full px-3 py-2 border border-safeia-gray rounded-md shadow-sm placeholder-safeia-gray focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-safeia-black">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => validateForm()}
            className="appearance-none block w-full px-3 py-2 border border-safeia-gray rounded-md shadow-sm placeholder-safeia-gray focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow disabled:opacity-50"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </div>
    </form>
  );
};

export default EmailAuthForm;
