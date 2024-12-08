import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EmailAuthFormProps {
  mode: 'login' | 'signup';
  onSuccess?: () => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ mode, onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, login, loading, error, resetPassword } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Limpiar errores cuando cambia el modo
  useEffect(() => {
    setLocalError(null);
    setResetSent(false);
  }, [mode]);

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setLocalError(
        'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setResetSent(false);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setLocalError('Las contraseñas no coinciden');
          return;
        }
        if (!validatePassword(password)) {
          return;
        }
        await signup(email, password);
      } else {
        await login(email, password);
      }
      
      // Después de un login exitoso, redirigir al dashboard
      navigate('/dashboard');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error en autenticación:', err);
      if (err.code === 'auth/email-already-in-use') {
        setLocalError('Este correo electrónico ya está registrado');
      } else if (err.code === 'auth/invalid-email') {
        setLocalError('Correo electrónico inválido');
      } else if (err.code === 'auth/weak-password') {
        setLocalError('La contraseña es demasiado débil');
      } else if (err.code === 'auth/user-not-found') {
        setLocalError('Usuario no encontrado');
      } else if (err.code === 'auth/wrong-password') {
        setLocalError('Contraseña incorrecta');
      } else {
        setLocalError('Error en la autenticación. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setLocalError('Por favor, ingrese su correo electrónico');
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setLocalError(null);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setLocalError('No existe una cuenta con este correo electrónico');
          break;
        case 'auth/invalid-email':
          setLocalError('El correo electrónico no es válido');
          break;
        default:
          setLocalError('Error al enviar el correo de recuperación');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              error || localError
                ? 'border-red-300 text-red-900'
                : 'border-gray-300 text-gray-900'
            }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError(null);
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              error || localError
                ? 'border-red-300 text-red-900'
                : 'border-gray-300 text-gray-900'
            }`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError(null);
            }}
          />
        </div>
      </div>

      {mode === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                error || localError
                  ? 'border-red-300 text-red-900'
                  : 'border-gray-300 text-gray-900'
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setLocalError(null);
              }}
            />
          </div>
        </div>
      )}

      {(error || localError) && (
        <div className="text-sm text-red-600" role="alert">
          {localError || error}
        </div>
      )}

      {resetSent && (
        <div className="text-sm text-green-600" role="alert">
          Se ha enviado un correo de recuperación a su dirección de email
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {mode === 'signup' ? 'Registrarse' : 'Iniciar sesión'}
        </button>
      </div>

      {mode === 'login' && (
        <div className="text-sm">
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
    </form>
  );
};

export default EmailAuthForm;
