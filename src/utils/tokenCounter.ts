import { encode } from 'gpt-tokenizer';

export function countTokens(text: string | undefined | null): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  try {
    return encode(text).length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    return 0;
  }
};

export const estimateTokenUsage = (input: string, files: any[] = []): number => {
  // Contamos tokens del mensaje del usuario
  let inputTokens = countTokens(input);
  
  // Agregamos tokens por cada archivo (nombre y contenido)
  files.forEach(file => {
    if (file.content) {
      inputTokens += countTokens(file.content);
    }
    if (file.name) {
      inputTokens += countTokens(file.name);
    }
  });

  // Estimamos tokens de sistema y contexto (prompts, instrucciones, etc)
  const systemTokens = 1000; // Tokens aproximados usados en el prompt del sistema

  // Estimamos tokens máximos de respuesta
  const maxOutputTokens = 2000; // Máximo de tokens que permitimos en la respuesta

  // Total de tokens = entrada + sistema + salida máxima
  return inputTokens + systemTokens + maxOutputTokens;
};
