export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con este correo electrónico';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por favor, intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Por favor, verifica tu internet';
    case 'auth/popup-closed-by-user':
      return 'Ventana de inicio de sesión cerrada. Por favor, intenta nuevamente';
    case 'auth/cancelled-popup-request':
      return 'La operación fue cancelada. Por favor, intenta nuevamente';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Esta operación no está soportada en el ambiente actual. Asegúrate de usar HTTPS';
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado para realizar operaciones de autenticación';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Contacta al administrador';
    case 'auth/timeout':
      return 'La operación expiró. Por favor, intenta nuevamente';
    default:
      return `Error en la autenticación: ${code}. Por favor, intenta de nuevo`;
  }
}
