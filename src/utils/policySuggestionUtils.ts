// Utilidades para validar y manejar errores en generación de políticas

export interface PolicyInput {
  sector?: string;
  actividad?: string;
  descripcion?: string;
  // Agrega aquí cualquier otro campo necesario
}

/**
 * Valida que los datos de entrada estén completos y bien formateados.
 * @param input Los datos del formulario de política.
 * @returns true si es válido, o una lista de errores si no lo es.
 */
export function validatePolicyInput(input: PolicyInput): true | string[] {
  const errors: string[] = [];

  if (!input.sector || input.sector.trim() === '') {
    errors.push('El campo "sector" es obligatorio.');
  }

  if (!input.actividad || input.actividad.trim() === '') {
    errors.push('El campo "actividad" es obligatorio.');
  }

  if (!input.descripcion || input.descripcion.trim() === '') {
    errors.push('El campo "descripción" es obligatorio.');
  }

  return errors.length > 0 ? errors : true;
}

/**
 * Mapea errores del backend a mensajes legibles para el usuario.
 * @param error El error capturado en la llamada a generatePoliticaSuggestions.
 * @returns Un mensaje de error amigable.
 */
export function handlePolicyError(error: any): string {
  if (error?.code === 'unknown_model') {
    return 'Error en el servicio de IA. Por favor intente más tarde.';
  }

  if (error?.status === 400) {
    return 'Error en la solicitud. Verifica que todos los campos estén correctamente completados.';
  }

  if (error?.message?.includes('Failed to generate suggestions')) {
    return 'No se pudieron generar sugerencias. Intenta nuevamente o revisa la información ingresada.';
  }

  return 'Ocurrió un error inesperado al generar las sugerencias.';
}
