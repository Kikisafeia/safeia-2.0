import React, { useState } from 'react';
import { Loader2, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';
import { assessRisk, getSuggestedTasks, Task, assessTaskRisks, TaskWithRisk, evaluateTaskRisk, RiskEvaluation, determineControls, ControlPlan } from '../services/riskMatrix';
import { getLegalFramework } from '../services/perplexityService';
import DashboardNavbar from '../components/DashboardNavbar';
import { exportToExcel } from '../utils/excelExport';

interface ActionPlan {
  characteristic: string;
  limit: string;
  monitoringMode: string;
  responsible: string;
  performanceDoc: string;
  frequency: string;
}

interface LegalReference {
  name: string;
  description: string;
  url?: string;
}

interface AssessmentResult {
  probability: string;
  severity: string;
  riskLevel: string;
  recommendations: string[];
  operationalControls: string[];
  actionPlan: ActionPlan;
}

interface RiskAssessment {
  associatedRisk: string;
  isCritical: boolean;
  criticalityJustification?: string;
  potentialDamage: string[];
}

interface RiskEvaluation {
  probability: { value: number; description: string };
  exposure: { value: number; description: string };
  consequence: { value: number; description: string };
  severity: { value: number; description: string };
  riskMagnitude: number;
  riskClassification: string;
  justification: string;
}

interface Control {
  type: string;
  priority: number;
  description: string;
  effectiveness: { expected: number; description: string };
  responsibles: string[];
  deadline: { timeframe: string; justification: string };
}

interface ResidualRisk {
  magnitude: number;
  classification: string;
  justification: string;
}

interface ControlPlan {
  controls: Control[];
  residualRisk: ResidualRisk;
  recommendations: string[];
}

interface TaskWithFullEvaluation extends TaskWithRisk {
  evaluation?: RiskEvaluation;
  controlPlan?: ControlPlan;
  legalFramework?: LegalReference[];
}

export default function RiskMatrix() {
  // Estados básicos
  const [processType, setProcessType] = useState<'Operación' | 'Apoyo'>('Operación');
  const [activityName, setActivityName] = useState('');
  const [routineType, setRoutineType] = useState<'Rutinaria' | 'No Rutinaria'>('Rutinaria');
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<TaskWithFullEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingLegal, setLoadingLegal] = useState(false);

  const handleGetSuggestions = async () => {
    if (!processType || !activityName || !routineType) {
      setError('Por favor, complete todos los campos antes de solicitar sugerencias.');
      return;
    }

    setLoadingSuggestions(true);
    setLoadingLegal(true);
    setError(null);
    setSelectedTaskIds(new Set());
    
    try {
      const [tasks, legal] = await Promise.all([
        getSuggestedTasks(processType, activityName, routineType),
        getLegalFramework('Chile', processType, activityName)
      ]);
      setSuggestedTasks(tasks);
      // setLegalFramework(legal);
    } catch (err) {
      setError('Error al obtener datos: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingSuggestions(false);
      setLoadingLegal(false);
    }
  };

  const handleTaskSelection = (taskIndex: number) => {
    const newSelectedTaskIds = new Set(selectedTaskIds);
    if (newSelectedTaskIds.has(taskIndex)) {
      newSelectedTaskIds.delete(taskIndex);
    } else {
      newSelectedTaskIds.add(taskIndex);
    }
    setSelectedTaskIds(newSelectedTaskIds);
  };

  const handleProcessSelectedTasks = async () => {
    if (selectedTaskIds.size === 0) {
      setError('Por favor, seleccione al menos una tarea para evaluar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedTasksList = Array.from(selectedTaskIds).map(index => suggestedTasks[index]);
      const tasksWithEvaluations = await Promise.all(
        selectedTasksList.map(async (task) => {
          const riskAssessment = await assessTaskRisks(task);
          const evaluation = await evaluateTaskRisk({ ...task, riskAssessment });
          const controlPlan = await determineControls({ ...task, riskAssessment }, evaluation);
          const legalFramework = await getLegalFramework('Chile', processType, task.description);
          
          return {
            ...task,
            riskAssessment,
            evaluation,
            controlPlan,
            legalFramework
          };
        })
      );
      setSelectedTasks(tasksWithEvaluations);
    } catch (err) {
      setError('Error al procesar las tareas seleccionadas: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (selectedTasks.length === 0) {
      return;
    }

    const excelData = selectedTasks.map(task => ({
      'Tarea': task.description,
      'Categoría GEMA': task.hazardGEMA.category,
      'Peligro': task.hazardGEMA.hazard,
      'Sub-Peligro': task.hazardGEMA.subHazard || '',
      'Detalle': task.hazardGEMA.detail || '',
      'Riesgo Asociado': task.riskAssessment?.associatedRisk || '',
      'Criticidad': task.riskAssessment?.isCritical ? 'Crítico' : 'No Crítico',
      'Marco Legal': task.legalFramework?.map(legal => `${legal.name}: ${legal.description}`).join('\n') || '',
      'Probabilidad': task.evaluation?.probability.value || '',
      'Exposición': task.evaluation?.exposure.value || '',
      'Consecuencia': task.evaluation?.consequence.value || '',
      'Severidad': task.evaluation?.severity.value || '',
      'Magnitud del Riesgo': task.evaluation?.riskMagnitude || '',
      'Clasificación del Riesgo': task.evaluation?.riskClassification || '',
      'Controles': task.controlPlan?.controls.map(control => 
        `${control.type} (Efectividad: ${control.effectiveness.expected}%)`
      ).join('\n') || '',
      'Riesgo Residual Magnitud': task.controlPlan?.residualRisk.magnitude || '',
      'Riesgo Residual Clasificación': task.controlPlan?.residualRisk.classification || '',
    }));

    exportToExcel(excelData, 'Evaluacion_de_Riesgos');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-6">
          {/* Sección de Formulario Inicial */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Matriz de Riesgos</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Proceso</label>
                <select
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value as 'Operación' | 'Apoyo')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                >
                  <option value="Operación">Operación</option>
                  <option value="Apoyo">Apoyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Actividad</label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                  placeholder="Ej: Mantenimiento de equipos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Rutina</label>
                <select
                  value={routineType}
                  onChange={(e) => setRoutineType(e.target.value as 'Rutinaria' | 'No Rutinaria')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                >
                  <option value="Rutinaria">Rutinaria</option>
                  <option value="No Rutinaria">No Rutinaria</option>
                </select>
              </div>

              <button
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                className="w-full px-4 py-2 bg-safeia-black text-white rounded-md hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingSuggestions ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Cargando...
                  </span>
                ) : (
                  'Obtener Sugerencias'
                )}
              </button>

              {error && (
                <div className="flex items-center text-red-600 text-sm mt-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* Sección de Tareas Sugeridas */}
          {suggestedTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tareas Sugeridas</h3>
                <span className="text-sm text-gray-500">{selectedTaskIds.size} seleccionadas</span>
              </div>
              <div className="space-y-2">
                {suggestedTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.has(index)}
                      onChange={() => handleTaskSelection(index)}
                      className="h-4 w-4 text-safeia-yellow rounded border-gray-300 focus:ring-safeia-yellow"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.description}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {task.hazardGEMA.category} - {task.hazardGEMA.hazard}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleProcessSelectedTasks}
                  disabled={selectedTaskIds.size === 0 || loading}
                  className="w-full px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Procesando...
                    </span>
                  ) : (
                    `Evaluar ${selectedTaskIds.size} ${selectedTaskIds.size === 1 ? 'Tarea' : 'Tareas'}`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Sección de Tareas Evaluadas y Evaluación Detallada */}
          {selectedTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Evaluación de Riesgos</h3>
                <button
                  onClick={handleExportToExcel}
                  className="px-4 py-2 bg-safeia-black text-white text-sm rounded-md hover:bg-safeia-yellow hover:text-safeia-black transition duration-300"
                >
                  Exportar a Excel
                </button>
              </div>

              {/* Tabla de Evaluaciones */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarea
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peligro GEMA
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Riesgo Asociado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marco Legal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Métricas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Magnitud
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Controles
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Riesgo Residual
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedTasks.map((task, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{task.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 font-medium">{task.hazardGEMA.category}</div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Peligro:</span> {task.hazardGEMA.hazard}
                            </div>
                            {task.hazardGEMA.subHazard && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Sub-Peligro:</span> {task.hazardGEMA.subHazard}
                              </div>
                            )}
                            {task.hazardGEMA.detail && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Detalle:</span> {task.hazardGEMA.detail}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.riskAssessment && (
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                task.riskAssessment.isCritical 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {task.riskAssessment.isCritical ? 'Crítico' : 'No Crítico'}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">{task.riskAssessment.associatedRisk}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {task.legalFramework?.map((legal, idx) => (
                              <div key={idx} className="text-xs">
                                {legal.url ? (
                                  <a
                                    href={legal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-safeia-yellow hover:text-safeia-yellow-dark flex items-center"
                                  >
                                    {legal.name}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                ) : (
                                  <span className="font-medium">{legal.name}</span>
                                )}
                                <p className="text-gray-500 mt-0.5 text-xs line-clamp-2" title={legal.description}>
                                  {legal.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.evaluation && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">P:</span> {task.evaluation.probability.value}
                              </div>
                              <div>
                                <span className="text-gray-500">E:</span> {task.evaluation.exposure.value}
                              </div>
                              <div>
                                <span className="text-gray-500">C:</span> {task.evaluation.consequence.value}
                              </div>
                              <div>
                                <span className="text-gray-500">S:</span> {task.evaluation.severity.value}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.evaluation && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.evaluation.riskClassification === 'Bajo' ? 'bg-green-100 text-green-800' :
                              task.evaluation.riskClassification === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                              task.evaluation.riskClassification === 'Alto' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.evaluation.riskMagnitude} - {task.evaluation.riskClassification}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {task.controlPlan && (
                            <div className="space-y-1">
                              {task.controlPlan.controls.map((control, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    control.type === 'Eliminación' ? 'bg-purple-100 text-purple-800' :
                                    control.type === 'Sustitución' ? 'bg-blue-100 text-blue-800' :
                                    control.type === 'Control de Ingeniería' ? 'bg-green-100 text-green-800' :
                                    control.type === 'Control Administrativo' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {control.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {task.controlPlan && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.controlPlan.residualRisk.classification === 'Bajo' ? 'bg-green-100 text-green-800' :
                              task.controlPlan.residualRisk.classification === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                              task.controlPlan.residualRisk.classification === 'Alto' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {task.controlPlan.residualRisk.magnitude} - {task.controlPlan.residualRisk.classification}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedTasks(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
