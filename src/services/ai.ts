import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { CompanyProfile } from '../types/company';

const client = new OpenAIClient(
  import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(import.meta.env.VITE_AZURE_OPENAI_API_KEY)
);

const deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

export interface AISuggestion {
  content: string;
  confidence: number;
  category: string;
}

export const getSuggestionsByEtapa = async (
  etapa: string,
  categoria: string,
  companyProfile: CompanyProfile | null
): Promise<AISuggestion[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_AZURE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        etapa,
        categoria,
        companyProfile,
        prompt: generatePrompt(etapa, categoria, companyProfile)
      })
    });

    if (!response.ok) {
      throw new Error('Error al obtener sugerencias');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getSuggestionsByEtapa:', error);
    throw error;
  }
};

const generatePrompt = (
  etapa: string,
  categoria: string,
  companyProfile: CompanyProfile | null
): string => {
  if (!companyProfile) {
    return `Proporciona sugerencias para la etapa ${etapa} en la categoría ${categoria} del SG-SST.`;
  }

  return `
    Como consultor experto en SG-SST, proporciona sugerencias específicas para:
    
    Empresa: ${companyProfile.nombre}
    Sector: ${companyProfile.sectorEconomico}
    Nivel de Riesgo: ${companyProfile.nivelRiesgo}
    Número de Empleados: ${companyProfile.numEmpleados}
    Actividad Principal: ${companyProfile.actividadPrincipal}

    Para la etapa "${etapa}" en la categoría "${categoria}".

    Las sugerencias deben:
    1. Ser específicas para el sector económico y nivel de riesgo de la empresa
    2. Considerar el tamaño de la empresa (${companyProfile.numEmpleados} empleados)
    3. Estar alineadas con la normativa vigente en SST
    4. Ser prácticas y aplicables para una PyME
    5. Incluir ejemplos concretos cuando sea posible
  `;
};
