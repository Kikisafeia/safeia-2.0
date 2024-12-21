interface ActionPlan {
  characteristic: string;
  limit: string;
  monitoringMode: string;
  responsible: string;
  performanceDoc: string;
  frequency: string;
}

interface RiskAssessment {
  probability: string;
  severity: string;
  riskLevel: string;
  recommendations: string[];
  operationalControls: string[];
  actionPlan: ActionPlan;
  legalFramework: string[];
}

interface Task {
  description: string;
  gender: 'Hombre' | 'Mujer' | 'Ambos';
  riskFamily: string;
  hazardGEMA: {
    category: 'Gente' | 'Equipo' | 'Material' | 'Ambiente';
    hazard: string;
  };
}

interface RiskAssessmentTask {
  associatedRisk: string;
  isCritical: boolean;
  potentialDamage: string[];
  criticalityJustification?: string;
}

interface RiskEvaluation {
  probability: {
    value: number; // 1-3
    description: string;
  };
  exposure: {
    value: number; // 1-3
    description: string;
  };
  consequence: {
    value: number; // 1-3
    description: string;
  };
  severity: {
    value: number; // 1-3
    description: string;
  };
  riskMagnitude: number; // P x C
  riskClassification: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  justification: string;
}

interface TaskWithRisk extends Task {
  riskAssessment?: RiskAssessmentTask;
  riskEvaluation?: RiskEvaluation;
}

interface ProcessActivity {
  processType: 'Operación' | 'Apoyo';
  activityName: string;
  routineType: 'Rutinaria' | 'No Rutinaria';
  tasks: TaskWithRisk[];
}

interface RiskControl {
  type: 'Eliminación' | 'Sustitución' | 'Control de Ingeniería' | 'Control Administrativo' | 'EPP';
  description: string;
  priority: number; // 1-5, donde 1 es la más alta prioridad
  responsibles: string[];
  deadline: {
    timeframe: string; // e.g., "1 semana", "1 mes", "3 meses"
    justification: string;
  };
  effectiveness: {
    expected: number; // 1-100%
    description: string;
  };
}

interface ControlPlan {
  controls: RiskControl[];
  residualRisk: {
    magnitude: number;
    classification: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    justification: string;
  };
  recommendations: string[];
}

export async function assessRisk(
  processType: string,
  processName: string,
  activities: string,
  jobPosition: string,
  country: string
): Promise<RiskAssessment> {
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Actúa como un experto en seguridad industrial y evalúa el siguiente escenario:

Tipo de Proceso: ${processType}
Nombre del Proceso: ${processName}
Actividades: ${activities}
Puesto de Trabajo: ${jobPosition}
País: ${country}

Proporciona una evaluación de riesgos en el siguiente formato JSON (sin usar comillas invertidas ni markdown):
{
  "probability": "[Baja/Media/Alta]",
  "severity": "[Leve/Moderada/Grave]",
  "riskLevel": "[Bajo/Medio/Alto/Extremo]",
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "operationalControls": ["control operacional 1", "control operacional 2", "control operacional 3"],
  "actionPlan": {
    "characteristic": "Característica a verificar",
    "limit": "Límite aceptable",
    "monitoringMode": "Modalidad de seguimiento",
    "responsible": "Responsable del seguimiento",
    "performanceDoc": "Documento de Desempeño",
    "frequency": "Frecuencia de verificación"
  },
  "legalFramework": ["Referencia a normativa legal 1", "Referencia a normativa legal 2"]
}

La respuesta debe ser ÚNICAMENTE el objeto JSON, sin texto adicional ni formato markdown. Incluye las normativas y regulaciones específicas del país indicado que aplican a este tipo de proceso y actividad.`;

  try {
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en seguridad industrial y gestión de riesgos. Tus respuestas deben ser ÚNICAMENTE en formato JSON, sin texto adicional ni formato markdown.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error en la API de Azure OpenAI');
    }

    const data = await response.json();
    let assessment;
    
    try {
      // Primero limpiamos el contenido de markdown
      const cleanContent = data.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Luego intentamos parsear
      assessment = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.log('Contenido recibido:', data.choices[0].message.content);
      throw new Error('No se pudo procesar la respuesta del servicio');
    }

    if (!assessment.probability || !assessment.severity || !assessment.riskLevel || 
        !Array.isArray(assessment.recommendations) || !Array.isArray(assessment.operationalControls) ||
        !assessment.actionPlan || !Array.isArray(assessment.legalFramework)) {
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return {
      probability: assessment.probability,
      severity: assessment.severity,
      riskLevel: assessment.riskLevel,
      recommendations: assessment.recommendations,
      operationalControls: assessment.operationalControls,
      actionPlan: assessment.actionPlan,
      legalFramework: assessment.legalFramework,
    };
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
}

export async function getSuggestions(
  processType: string,
  processName: string,
  jobPosition: string
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Como experto en seguridad ocupacional, sugiere una lista detallada de actividades específicas basadas en:

Tipo de Proceso: ${processType}
Nombre del Proceso: ${processName}
Puesto de Trabajo: ${jobPosition}

Por favor:
1. Lista solo las actividades más relevantes y frecuentes para este puesto específico dentro del proceso mencionado
2. Incluye actividades tanto rutinarias como no rutinarias
3. Considera las interacciones con equipos, materiales y otros trabajadores
4. Ten en cuenta las responsabilidades típicas del puesto
5. Incluye actividades de supervisión o control si el puesto lo requiere

Formato deseado:
- Actividad 1
- Actividad 2
- Actividad 3
...

Proporciona SOLO la lista de actividades, sin texto adicional ni explicaciones.`;

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en seguridad ocupacional con amplio conocimiento en procesos industriales y gestión de riesgos. Responde siempre en español y sé específico al contexto.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener sugerencias');
    }

    const data = await response.json();
    const suggestions = data.choices[0].message.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(1).trim());

    return suggestions;
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    throw error;
  }
}

export async function getSuggestedTasks(
  processType: 'Operación' | 'Apoyo',
  activityName: string,
  routineType: 'Rutinaria' | 'No Rutinaria'
): Promise<TaskWithRisk[]> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Como experto en seguridad ocupacional, analiza la siguiente actividad y sugiere una lista detallada de tareas considerando la metodología GEMA (Gente, Equipo, Material, Ambiente):

Tipo de Proceso: ${processType}
Nombre de la Actividad: ${activityName}
Tipo de Rutina: ${routineType}

Por favor, proporciona la información en formato JSON con la siguiente estructura:
{
  "tasks": [
    {
      "description": "Descripción detallada de la tarea",
      "gender": "Hombre/Mujer/Ambos",
      "riskFamily": "Familia de riesgo (ej: Mecánico, Físico, Químico, Biológico, Ergonómico, Psicosocial)",
      "hazardGEMA": {
        "category": "Una de las categorías GEMA (Gente/Equipo/Material/Ambiente)",
        "hazard": "Descripción específica del peligro según la categoría GEMA"
      }
    }
  ]
}

Considera:
1. El tipo de proceso (${processType}) y si es ${routineType}
2. Las diferentes etapas o momentos de la actividad
3. Los requisitos físicos y cognitivos para cada tarea
4. Las interacciones con equipos, materiales y el ambiente
5. Los peligros potenciales según la metodología GEMA

La respuesta debe ser ÚNICAMENTE el objeto JSON, sin texto adicional ni formato markdown.`;

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en seguridad ocupacional especializado en identificación de peligros y evaluación de riesgos usando la metodología GEMA. Proporciona respuestas detalladas y específicas al contexto.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener sugerencias de tareas');
    }

    const data = await response.json();
    let result;
    
    try {
      // Primero limpiamos el contenido de markdown
      const cleanContent = data.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Luego intentamos parsear
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.log('Contenido recibido:', data.choices[0].message.content);
      throw new Error('No se pudo procesar la respuesta del servicio');
    }

    if (!Array.isArray(result?.tasks)) {
      console.error('Estructura inesperada:', result);
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return result.tasks;
  } catch (error) {
    console.error('Error al obtener sugerencias de tareas:', error);
    throw error;
  }
}

export async function assessTaskRisks(task: Task): Promise<RiskAssessmentTask> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Como experto en seguridad ocupacional, analiza la siguiente tarea y proporciona una evaluación detallada de sus riesgos:

Descripción de la Tarea: ${task.description}
Género: ${task.gender}
Familia de Riesgo: ${task.riskFamily}
Categoría GEMA: ${task.hazardGEMA.category}
Peligro GEMA: ${task.hazardGEMA.hazard}

Por favor, proporciona la información en formato JSON con la siguiente estructura:
{
  "associatedRisk": "Descripción clara del riesgo asociado a la tarea",
  "isCritical": true/false,
  "potentialDamage": [
    "Lista de posibles daños que podrían ocurrir"
  ],
  "criticalityJustification": "Si el riesgo es crítico, explica por qué. Si no es crítico, omite este campo."
}

Considera:
1. El riesgo debe ser específico y relacionado con la tarea y el peligro GEMA identificado
2. La criticidad debe basarse en la severidad potencial y la probabilidad de ocurrencia
3. Los daños potenciales deben ser específicos y realistas
4. Si es crítico, la justificación debe ser clara y basada en evidencia

La respuesta debe ser ÚNICAMENTE el objeto JSON, sin texto adicional ni formato markdown.`;

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en seguridad ocupacional especializado en evaluación de riesgos laborales. Proporciona evaluaciones detalladas y precisas basadas en evidencia.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Temperatura más baja para respuestas más consistentes
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al evaluar riesgos');
    }

    const data = await response.json();
    let result;
    
    try {
      // Primero limpiamos el contenido de markdown
      const cleanContent = data.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Luego intentamos parsear
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.log('Contenido recibido:', data.choices[0].message.content);
      throw new Error('No se pudo procesar la respuesta del servicio');
    }

    if (!result.associatedRisk || !Array.isArray(result.potentialDamage)) {
      console.error('Estructura inesperada:', result);
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return result;
  } catch (error) {
    console.error('Error al evaluar riesgos:', error);
    throw error;
  }
}

export async function evaluateTaskRisk(task: TaskWithRisk): Promise<RiskEvaluation> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Como experto en seguridad ocupacional, realiza una evaluación cuantitativa del riesgo para la siguiente tarea:

Descripción de la Tarea: ${task.description}
Género: ${task.gender}
Familia de Riesgo: ${task.riskFamily}
Categoría GEMA: ${task.hazardGEMA.category}
Peligro GEMA: ${task.hazardGEMA.hazard}
Riesgo Asociado: ${task.riskAssessment?.associatedRisk || 'No especificado'}
Posibles Daños: ${task.riskAssessment?.potentialDamage.join(', ') || 'No especificados'}

Por favor, evalúa los siguientes factores y proporciona la información en formato JSON:

Probabilidad (P):
1 = Poco probable: Podría ocurrir en circunstancias excepcionales
2 = Probable: Podría ocurrir en algún momento
3 = Muy probable: Se espera que ocurra en la mayoría de las circunstancias

Exposición (E):
1 = Esporádica: La exposición al riesgo ocurre rara vez
2 = Ocasional: La exposición al riesgo ocurre ocasionalmente
3 = Permanente: La exposición al riesgo es continua

Consecuencia (C):
1 = Leve: Lesiones o enfermedades menores, sin incapacidad
2 = Moderada: Lesiones o enfermedades con incapacidad temporal
3 = Grave: Lesiones o enfermedades graves con incapacidad permanente o muerte

Severidad (S):
1 = Baja: Impacto mínimo en la salud y seguridad
2 = Media: Impacto moderado en la salud y seguridad
3 = Alta: Impacto significativo en la salud y seguridad

La Magnitud del Riesgo (MR) se calcula como P x C
Clasificación del Riesgo basada en MR:
1-2 = Bajo
3-4 = Medio
6 = Alto
9 = Crítico

Formato de respuesta:
{
  "probability": {
    "value": 1-3,
    "description": "Justificación de la probabilidad asignada"
  },
  "exposure": {
    "value": 1-3,
    "description": "Justificación de la exposición asignada"
  },
  "consequence": {
    "value": 1-3,
    "description": "Justificación de la consecuencia asignada"
  },
  "severity": {
    "value": 1-3,
    "description": "Justificación de la severidad asignada"
  },
  "riskMagnitude": "Valor numérico (P x C)",
  "riskClassification": "Bajo/Medio/Alto/Crítico",
  "justification": "Explicación detallada de la evaluación"
}`;

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en evaluación cuantitativa de riesgos laborales. Proporciona evaluaciones detalladas y precisas basadas en evidencia y metodologías estándar de SST.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al evaluar riesgos');
    }

    const data = await response.json();
    let result;
    
    try {
      // Primero limpiamos el contenido de markdown
      const cleanContent = data.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Luego intentamos parsear
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.log('Contenido recibido:', data.choices[0].message.content);
      throw new Error('No se pudo procesar la respuesta del servicio');
    }

    // Validar la estructura de la respuesta
    if (!result.probability?.value || !result.exposure?.value || 
        !result.consequence?.value || !result.severity?.value) {
      console.error('Estructura inesperada:', result);
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return result;
  } catch (error) {
    console.error('Error al evaluar riesgos:', error);
    throw error;
  }
}

export async function determineControls(task: TaskWithRisk, riskEvaluation: RiskEvaluation): Promise<ControlPlan> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `Como experto en seguridad ocupacional, determina los controles necesarios para la siguiente tarea y su evaluación de riesgo. Responde SOLO con un objeto JSON válido, sin marcadores de código ni texto adicional:

Tarea:
- Descripción: ${task.description}
- Género: ${task.gender}
- Familia de Riesgo: ${task.riskFamily}
- Categoría GEMA: ${task.hazardGEMA.category}
- Peligro GEMA: ${task.hazardGEMA.hazard}
- Riesgo Asociado: ${task.riskAssessment?.associatedRisk || 'No especificado'}
- Posibles Daños: ${task.riskAssessment?.potentialDamage.join(', ') || 'No especificados'}

Evaluación de Riesgo Actual:
- Probabilidad: ${riskEvaluation.probability.value} (${riskEvaluation.probability.description})
- Exposición: ${riskEvaluation.exposure.value} (${riskEvaluation.exposure.description})
- Consecuencia: ${riskEvaluation.consequence.value} (${riskEvaluation.consequence.description})
- Severidad: ${riskEvaluation.severity.value} (${riskEvaluation.severity.description})
- Magnitud del Riesgo: ${riskEvaluation.riskMagnitude}
- Clasificación: ${riskEvaluation.riskClassification}

Proporciona un plan de control siguiendo la jerarquía de controles en este formato exacto:

{
  "controls": [
    {
      "type": "uno de: Eliminación, Sustitución, Control de Ingeniería, Control Administrativo, EPP",
      "description": "descripción detallada",
      "priority": "número del 1 al 5",
      "responsibles": ["lista de responsables"],
      "deadline": {
        "timeframe": "plazo de implementación",
        "justification": "justificación del plazo"
      },
      "effectiveness": {
        "expected": "porcentaje de 1 a 100",
        "description": "descripción de la efectividad"
      }
    }
  ],
  "residualRisk": {
    "magnitude": "número",
    "classification": "uno de: Bajo, Medio, Alto, Crítico",
    "justification": "justificación"
  },
  "recommendations": [
    "lista de recomendaciones"
  ]
}`;

  try {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en seguridad ocupacional. Responde SOLO con JSON válido, sin marcadores de código ni texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al determinar controles');
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Función auxiliar para limpiar el contenido
    const cleanJsonString = (str: string) => {
      // Elimina marcadores de código y espacios en blanco al inicio y final
      return str
        .replace(/^```json\s*/, '')
        .replace(/```\s*$/, '')
        .replace(/^\s+|\s+$/g, '');
    };

    // Intenta parsear diferentes versiones del contenido
    const attempts = [
      content,
      cleanJsonString(content),
      content.replace(/[\u0000-\u001F]+/g, ''), // Elimina caracteres de control
      cleanJsonString(content).replace(/[\u0000-\u001F]+/g, '')
    ];

    let result = null;
    let error = null;

    for (const attempt of attempts) {
      try {
        result = JSON.parse(attempt);
        break;
      } catch (e) {
        error = e;
        continue;
      }
    }

    if (!result) {
      console.error('Contenido que no se pudo parsear:', content);
      throw error || new Error('No se pudo parsear la respuesta JSON');
    }

    // Validar la estructura del resultado
    if (!Array.isArray(result.controls) || !result.residualRisk || !Array.isArray(result.recommendations)) {
      throw new Error('La respuesta no tiene la estructura esperada');
    }

    return result;
  } catch (error) {
    console.error('Error al determinar controles:', error);
    throw error;
  }
}
