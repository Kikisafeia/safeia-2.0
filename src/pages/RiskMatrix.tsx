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
  const [country, setCountry] = useState<string>('');
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
    if (!processType || !activityName || !routineType || !country) {
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
        getLegalFramework(country, processType, activityName)
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
          const legalFramework = await getLegalFramework(country, processType, task.description);
          
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
      'Marco Legal': task.legalFramework?.map(legal => `${legal.name} - ${legal.description}`).join('\n') || '',
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

  const handleTaskUpdate = (taskIndex: number, field: string, value: any) => {
    const updatedTasks = [...selectedTasks];
    const task = { ...updatedTasks[taskIndex] };

    // Actualizar el campo específico basado en la ruta del campo
    const fieldParts = field.split('.');
    let current: any = task;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      if (!current[fieldParts[i]]) {
        current[fieldParts[i]] = {};
      }
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;

    updatedTasks[taskIndex] = task;
    setSelectedTasks(updatedTasks);
  };

  const handleControlUpdate = (taskIndex: number, controlIndex: number, field: string, value: any) => {
    const updatedTasks = [...selectedTasks];
    const task = { ...updatedTasks[taskIndex] };
    if (!task.controlPlan) return;
    
    const updatedControls = [...task.controlPlan.controls];
    const control = { ...updatedControls[controlIndex] };

    // Actualizar el campo específico del control
    const fieldParts = field.split('.');
    let current: any = control;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      if (!current[fieldParts[i]]) {
        current[fieldParts[i]] = {};
      }
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;

    updatedControls[controlIndex] = control;
    task.controlPlan.controls = updatedControls;
    updatedTasks[taskIndex] = task;
    setSelectedTasks(updatedTasks);
  };

  const handleAddControl = (taskIndex: number) => {
    const updatedTasks = [...selectedTasks];
    const task = { ...updatedTasks[taskIndex] };
    if (!task.controlPlan) {
      task.controlPlan = {
        controls: [],
        residualRisk: { magnitude: 0, classification: '', justification: '' },
        recommendations: []
      };
    }
    
    task.controlPlan.controls.push({
      type: '',
      priority: 1,
      description: '',
      effectiveness: { expected: 0, description: '' },
      responsibles: [],
      deadline: { timeframe: '', justification: '' }
    });
    
    updatedTasks[taskIndex] = task;
    setSelectedTasks(updatedTasks);
  };

  const handleRemoveControl = (taskIndex: number, controlIndex: number) => {
    const updatedTasks = [...selectedTasks];
    const task = { ...updatedTasks[taskIndex] };
    if (!task.controlPlan) return;
    
    task.controlPlan.controls = task.controlPlan.controls.filter((_, index) => index !== controlIndex);
    updatedTasks[taskIndex] = task;
    setSelectedTasks(updatedTasks);
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
                <label className="block text-sm font-medium text-gray-700">País</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                >
                  <option value="">Seleccione un país</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Brasil">Brasil</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="España">España</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Haití">Haití</option>
                  <option value="Honduras">Honduras</option>
                  <option value="México">México</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Perú">Perú</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="República Dominicana">República Dominicana</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Venezuela">Venezuela</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Proceso</label>
                <select
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value as 'Operación' | 'Apoyo')}
                  className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
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
                  className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                  placeholder="Ej: Mantenimiento de equipos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Rutina</label>
                <select
                  value={routineType}
                  onChange={(e) => setRoutineType(e.target.value as 'Rutinaria' | 'No Rutinaria')}
                  className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                >
                  <option value="Rutinaria">Rutinaria</option>
                  <option value="No Rutinaria">No Rutinaria</option>
                </select>
              </div>

              <button
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                className="w-full px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 bg-safeia-yellow text-safeia-black text-sm rounded-md hover:bg-safeia-yellow-dark hover:text-safeia-black transition duration-300"
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
                    {selectedTasks.map((task, taskIndex) => (
                      <tr key={taskIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) => handleTaskUpdate(taskIndex, 'description', e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <select
                              value={task.hazardGEMA.category}
                              onChange={(e) => handleTaskUpdate(taskIndex, 'hazardGEMA.category', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                            >
                              <option value="Gente">Gente</option>
                              <option value="Equipos">Equipos</option>
                              <option value="Materiales">Materiales</option>
                              <option value="Ambiente">Ambiente</option>
                            </select>
                            <input
                              type="text"
                              value={task.hazardGEMA.hazard}
                              onChange={(e) => handleTaskUpdate(taskIndex, 'hazardGEMA.hazard', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                              placeholder="Peligro"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={task.riskAssessment?.associatedRisk || ''}
                              onChange={(e) => handleTaskUpdate(taskIndex, 'riskAssessment.associatedRisk', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                              placeholder="Riesgo asociado"
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={task.riskAssessment?.isCritical || false}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'riskAssessment.isCritical', e.target.checked)}
                                className="rounded border-gray-300 text-safeia-yellow focus:ring-safeia-yellow"
                              />
                              <span className="text-sm text-gray-600">Crítico</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {task.legalFramework?.map((legal, legalIndex) => (
                              <div key={legalIndex} className="flex flex-col space-y-1">
                                <input
                                  type="text"
                                  value={legal.name}
                                  onChange={(e) => handleTaskUpdate(taskIndex, `legalFramework.${legalIndex}.name`, e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                  placeholder="Nombre de la ley"
                                />
                                <input
                                  type="text"
                                  value={legal.description}
                                  onChange={(e) => handleTaskUpdate(taskIndex, `legalFramework.${legalIndex}.description`, e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                  placeholder="Artículos aplicables"
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Probabilidad</label>
                              <input
                                type="number"
                                value={task.evaluation?.probability.value || 0}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'evaluation.probability.value', parseInt(e.target.value))}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                min="0"
                                max="10"
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Exposición</label>
                              <input
                                type="number"
                                value={task.evaluation?.exposure.value || 0}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'evaluation.exposure.value', parseInt(e.target.value))}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                min="0"
                                max="10"
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Consecuencia</label>
                              <input
                                type="number"
                                value={task.evaluation?.consequence.value || 0}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'evaluation.consequence.value', parseInt(e.target.value))}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                min="0"
                                max="10"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Magnitud</label>
                              <input
                                type="number"
                                value={task.evaluation?.riskMagnitude || 0}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'evaluation.riskMagnitude', parseInt(e.target.value))}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                readOnly
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Clasificación</label>
                              <input
                                type="text"
                                value={task.evaluation?.riskClassification || ''}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'evaluation.riskClassification', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-4">
                            {task.controlPlan?.controls.map((control, controlIndex) => (
                              <div key={controlIndex} className="space-y-2 border-b pb-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-xs text-gray-500">Control {controlIndex + 1}</label>
                                  <button
                                    onClick={() => handleRemoveControl(taskIndex, controlIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                                <select
                                  value={control.type}
                                  onChange={(e) => handleControlUpdate(taskIndex, controlIndex, 'type', e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                >
                                  <option value="">Seleccione tipo</option>
                                  <option value="Eliminación">Eliminación</option>
                                  <option value="Sustitución">Sustitución</option>
                                  <option value="Ingeniería">Ingeniería</option>
                                  <option value="Administrativo">Administrativo</option>
                                  <option value="EPP">EPP</option>
                                </select>
                                <input
                                  type="text"
                                  value={control.description}
                                  onChange={(e) => handleControlUpdate(taskIndex, controlIndex, 'description', e.target.value)}
                                  className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                  placeholder="Descripción del control"
                                />
                                <div className="flex space-x-2">
                                  <input
                                    type="number"
                                    value={control.effectiveness.expected}
                                    onChange={(e) => handleControlUpdate(taskIndex, controlIndex, 'effectiveness.expected', parseInt(e.target.value))}
                                    className="w-20 text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                    min="0"
                                    max="100"
                                    placeholder="%"
                                  />
                                  <input
                                    type="text"
                                    value={control.deadline.timeframe}
                                    onChange={(e) => handleControlUpdate(taskIndex, controlIndex, 'deadline.timeframe', e.target.value)}
                                    className="flex-1 text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                                    placeholder="Plazo"
                                  />
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddControl(taskIndex)}
                              className="w-full px-2 py-1 text-sm bg-gray-100 text-safeia-black rounded-md hover:bg-safeia-yellow hover:text-white transition-colors"
                            >
                              + Agregar Control
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Magnitud Residual</label>
                              <input
                                type="number"
                                value={task.controlPlan?.residualRisk.magnitude || 0}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'controlPlan.residualRisk.magnitude', parseInt(e.target.value))}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                              />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <label className="text-xs text-gray-500">Clasificación Residual</label>
                              <input
                                type="text"
                                value={task.controlPlan?.residualRisk.classification || ''}
                                onChange={(e) => handleTaskUpdate(taskIndex, 'controlPlan.residualRisk.classification', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                              />
                            </div>
                          </div>
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
