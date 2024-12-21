import { useState } from 'react';
import { Loader2, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateLegalRequirements } from '../services/legal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LegalRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  applicability: string;
  compliance: {
    status: 'compliant' | 'partial' | 'non-compliant' | 'not-evaluated';
    evidence?: string;
    observations?: string;
  };
  actions: string[];
  references: string[];
}

interface LegalResponse {
  content: string;
  requirements: LegalRequirement[];
  summary: {
    totalRequirements: number;
    compliantCount: number;
    partialCount: number;
    nonCompliantCount: number;
    notEvaluatedCount: number;
    compliancePercentage: number;
    criticalGaps: string[];
    recommendations: string[];
  };
}

export default function Legal() {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    location: '',
    scope: '',
    activities: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LegalResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requirements = await generateLegalRequirements(
        formData.companyName,
        formData.industry,
        formData.location,
        formData.scope,
        formData.activities
      );
      setResult(requirements);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando los requisitos legales. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Cumple';
      case 'partial':
        return 'Cumple Parcialmente';
      case 'non-compliant':
        return 'No Cumple';
      default:
        return 'No Evaluado';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Requisitos Legales SST
            </h1>
            <p className="mt-2 text-gray-600">
              Identifica y evalúa los requisitos legales aplicables en materia de seguridad y salud en el trabajo.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Sector Industrial
                  </label>
                  <input
                    type="text"
                    id="industry"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="scope" className="block text-sm font-medium text-gray-700">
                  Alcance
                </label>
                <textarea
                  id="scope"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  placeholder="Describe el alcance de la evaluación..."
                  required
                />
              </div>

              <div>
                <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
                  Actividades Principales
                </label>
                <textarea
                  id="activities"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  placeholder="Lista las principales actividades de la empresa..."
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Generando Requisitos...
                    </>
                  ) : (
                    'Generar Requisitos Legales'
                  )}
                </button>
              </div>
            </form>

            {result && (
              <div className="mt-8 space-y-6">
                {/* Resumen */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Resumen de Cumplimiento
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Total de Requisitos</div>
                      <div className="mt-1 text-2xl font-semibold">{result.summary.totalRequirements}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Requisitos Cumplidos</div>
                      <div className="mt-1 text-2xl font-semibold text-green-600">{result.summary.compliantCount}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Porcentaje de Cumplimiento</div>
                      <div className="mt-1 text-2xl font-semibold text-blue-600">{result.summary.compliancePercentage}%</div>
                    </div>
                  </div>
                </div>

                {/* Lista de Requisitos */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Requisitos Legales
                    </h3>
                    <div className="space-y-4">
                      {result.requirements.map((req) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{req.title}</h4>
                              <p className="mt-1 text-sm text-gray-500">{req.description}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(req.compliance.status)}`}>
                              {getComplianceText(req.compliance.status)}
                            </span>
                          </div>
                          
                          {req.compliance.evidence && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700"><strong>Evidencia:</strong> {req.compliance.evidence}</p>
                            </div>
                          )}
                          
                          {req.compliance.observations && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700"><strong>Observaciones:</strong> {req.compliance.observations}</p>
                            </div>
                          )}

                          {req.actions.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-900">Acciones Requeridas:</h5>
                              <ul className="mt-2 list-disc pl-5 space-y-1">
                                {req.actions.map((action, index) => (
                                  <li key={index} className="text-sm text-gray-700">{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-3 text-sm text-gray-500">
                            <p><strong>Referencias:</strong> {req.references.join(', ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brechas Críticas */}
                {result.summary.criticalGaps.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-red-800 mb-3">
                      Brechas Críticas
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {result.summary.criticalGaps.map((gap, index) => (
                        <li key={index} className="text-red-700">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendaciones */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-3">
                    Recomendaciones
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {result.summary.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-blue-700">{recommendation}</li>
                    ))}
                  </ul>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([result.content], {type: 'text/markdown'});
                      element.href = URL.createObjectURL(file);
                      element.download = "Requisitos_Legales_SST.md";
                      document.body.appendChild(element);
                      element.click();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Descargar Markdown
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Imprimir Informe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
