import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getLegalRequirements, Country } from '../services/mcp';

const countryNames: Record<Country, string> = {
  'CL': 'Chile',
  'PE': 'Perú',
  'CO': 'Colombia',
  'MX': 'México',
  'AR': 'Argentina',
  'BR': 'Brasil',
  'ES': 'España',
  'PT': 'Portugal',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'EC': 'Ecuador',
  'VE': 'Venezuela',
  'CR': 'Costa Rica',
  'PA': 'Panamá',
  'DO': 'República Dominicana',
  'GT': 'Guatemala',
  'SV': 'El Salvador',
  'HN': 'Honduras',
  'NI': 'Nicaragua'
};

interface LegalRequirement {
  id: string;
  title: string;
  description: string;
  compliance: {
    status: 'compliant' | 'partial' | 'non-compliant' | 'not-evaluated';
    evidence?: string;
    observations?: string;
  };
  actions: string[];
  references: string[];
}

interface LegalRequirementsResult {
  summary: {
    totalRequirements: number;
    compliantCount: number;
    compliancePercentage: number;
    criticalGaps: string[];
    recommendations: string[];
  };
  requirements: LegalRequirement[];
  content: string;
}

export default function Legal() {
  const [formData, setFormData] = useState({
    companyName: '',
    organizationType: 'private',
    companySize: 'small',
    employeeCount: '',
    sstResponsible: '',
    contactEmail: '',
    country: 'CL' as Country,
    region: '',
    city: '',
    industry: '',
    industryCode: '',
    activities: '',
    criticalProcesses: '',
    frequentRisks: [] as string[],
    hazardousSubstances: false,
    hazardousSubstancesDetail: '',
    equipmentUsed: '',
    hasRiskAssessment: false,
    hasCertifiedSystem: false,
    doesInternalAudits: false,
    hasLegalMatrix: false,
    hasLegalProcedures: false,
    regulationScope: ['national'],
    outputFormat: 'pdf',
    updateFrequency: 'quarterly',
    includeVoluntaryStandards: false,
    useBraveSearch: false,
    searchDepth: 'basic'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; isNetworkError?: boolean } | null>(null);
  const [result, setResult] = useState<LegalRequirementsResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requirements = await getLegalRequirements({
        companyName: formData.companyName,
        industry: formData.industry,
        location: formData.city,
        country: formData.country,
        scope: formData.activities,
        activities: formData.activities,
        useBraveSearch: formData.useBraveSearch,
        searchDepth: formData.searchDepth
      });
      setResult(requirements);
    } catch (error) {
      setError({ 
        message: 'Error generando requisitos legales',
        isNetworkError: error instanceof Error && error.message.includes('network')
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRiskType = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      frequentRisks: prev.frequentRisks.includes(risk)
        ? prev.frequentRisks.filter(r => r !== risk)
        : [...prev.frequentRisks, risk]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Requisitos Legales SST</h1>
            <p className="mt-2 text-gray-600">
              Identifica y evalúa los requisitos legales aplicables en materia de seguridad y salud en el trabajo.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de la Empresa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                    <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700">Tipo de Organización</label>
                    <select id="organizationType" name="organizationType" value={formData.organizationType} onChange={e => setFormData({...formData, organizationType: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="private">Privada</option>
                      <option value="public">Pública</option>
                      <option value="mixed">Mixta</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">Tamaño de la Empresa</label>
                    <select id="companySize" name="companySize" value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="small">Pequeña</option>
                      <option value="medium">Mediana</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">Número de Empleados</label>
                    <input type="number" name="employeeCount" id="employeeCount" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="sstResponsible" className="block text-sm font-medium text-gray-700">Responsable SST</label>
                    <input type="text" name="sstResponsible" id="sstResponsible" value={formData.sstResponsible} onChange={e => setFormData({...formData, sstResponsible: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                    <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ubicación e Industria</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
                    <select id="country" name="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value as Country})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      {Object.entries(countryNames).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">Región</label>
                    <input type="text" name="region" id="region" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" name="city" id="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industria</label>
                    <input type="text" name="industry" id="industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="industryCode" className="block text-sm font-medium text-gray-700">Código de Industria (CIUU)</label>
                    <input type="text" name="industryCode" id="industryCode" value={formData.industryCode} onChange={e => setFormData({...formData, industryCode: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actividades y Riesgos</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="activities" className="block text-sm font-medium text-gray-700">Actividades Principales</label>
                    <textarea id="activities" name="activities" rows={3} value={formData.activities} onChange={e => setFormData({...formData, activities: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                  <div>
                    <label htmlFor="criticalProcesses" className="block text-sm font-medium text-gray-700">Procesos Críticos</label>
                    <textarea id="criticalProcesses" name="criticalProcesses" rows={3} value={formData.criticalProcesses} onChange={e => setFormData({...formData, criticalProcesses: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Riesgos Frecuentes</label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Caídas', 'Golpes', 'Cortes', 'Sobreesfuerzo', 'Exposición Ruido', 'Exposición Químicos'].map(risk => (
                        <div key={risk} className="flex items-center">
                          <input id={`risk-${risk}`} name="frequentRisks" type="checkbox" checked={formData.frequentRisks.includes(risk)} onChange={() => toggleRiskType(risk)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <label htmlFor={`risk-${risk}`} className="ml-2 block text-sm text-gray-900">{risk}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="hazardousSubstances" name="hazardousSubstances" type="checkbox" checked={formData.hazardousSubstances} onChange={e => setFormData({...formData, hazardousSubstances: e.target.checked})} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hazardousSubstances" className="font-medium text-gray-700">Manejo de Sustancias Peligrosas</label>
                    </div>
                  </div>
                  {formData.hazardousSubstances && (
                    <div>
                      <label htmlFor="hazardousSubstancesDetail" className="block text-sm font-medium text-gray-700">Detalle de Sustancias Peligrosas</label>
                      <textarea id="hazardousSubstancesDetail" name="hazardousSubstancesDetail" rows={2} value={formData.hazardousSubstancesDetail} onChange={e => setFormData({...formData, hazardousSubstancesDetail: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                  )}
                  <div>
                    <label htmlFor="equipmentUsed" className="block text-sm font-medium text-gray-700">Equipamiento Utilizado</label>
                    <textarea id="equipmentUsed" name="equipmentUsed" rows={3} value={formData.equipmentUsed} onChange={e => setFormData({...formData, equipmentUsed: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión SST Actual</h2>
                <div className="space-y-4">
                  {[
                    { id: 'hasRiskAssessment', label: '¿Cuenta con evaluación de riesgos?' },
                    { id: 'hasCertifiedSystem', label: '¿Tiene sistema de gestión certificado (ISO 45001, etc.)?' },
                    { id: 'doesInternalAudits', label: '¿Realiza auditorías internas de SST?' },
                    { id: 'hasLegalMatrix', label: '¿Posee matriz de requisitos legales actualizada?' },
                    { id: 'hasLegalProcedures', label: '¿Tiene procedimientos documentados para cumplimiento legal?' },
                  ].map(item => (
                    <div key={item.id} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input id={item.id} name={item.id} type="checkbox" checked={formData[item.id as keyof typeof formData] as boolean} onChange={e => setFormData({...formData, [item.id]: e.target.checked})} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={item.id} className="font-medium text-gray-700">{item.label}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración de Salida</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alcance de Regulación</label>
                    <div className="mt-2 space-y-2">
                      {['national', 'regional', 'local', 'international'].map(scope => (
                        <div key={scope} className="flex items-center">
                          <input id={`scope-${scope}`} name="regulationScope" type="checkbox" checked={formData.regulationScope.includes(scope)} onChange={() => {
                            const newScope = formData.regulationScope.includes(scope)
                              ? formData.regulationScope.filter(s => s !== scope)
                              : [...formData.regulationScope, scope];
                            setFormData({...formData, regulationScope: newScope});
                          }} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <label htmlFor={`scope-${scope}`} className="ml-2 block text-sm text-gray-900">{scope.charAt(0).toUpperCase() + scope.slice(1)}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700">Formato de Salida</label>
                    <select id="outputFormat" name="outputFormat" value={formData.outputFormat} onChange={e => setFormData({...formData, outputFormat: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                      <option value="online">Visualización Online</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="updateFrequency" className="block text-sm font-medium text-gray-700">Frecuencia de Actualización</label>
                    <select id="updateFrequency" name="updateFrequency" value={formData.updateFrequency} onChange={e => setFormData({...formData, updateFrequency: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="quarterly">Trimestral</option>
                      <option value="semiannual">Semestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id="includeVoluntaryStandards" name="includeVoluntaryStandards" type="checkbox" checked={formData.includeVoluntaryStandards} onChange={e => setFormData({...formData, includeVoluntaryStandards: e.target.checked})} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="includeVoluntaryStandards" className="font-medium text-gray-700">Incluir Estándares Voluntarios</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Opciones Avanzadas</h2>
                 <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                        <input id="useBraveSearch" name="useBraveSearch" type="checkbox" checked={formData.useBraveSearch} onChange={e => setFormData({...formData, useBraveSearch: e.target.checked})} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                        <label htmlFor="useBraveSearch" className="font-medium text-gray-700">Utilizar Brave Search para información actualizada</label>
                        </div>
                    </div>
                    {formData.useBraveSearch && (
                        <div>
                        <label htmlFor="searchDepth" className="block text-sm font-medium text-gray-700">Profundidad de Búsqueda</label>
                        <select id="searchDepth" name="searchDepth" value={formData.searchDepth} onChange={e => setFormData({...formData, searchDepth: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="basic">Básica</option>
                            <option value="advanced">Avanzada</option>
                        </select>
                        </div>
                    )}
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Generar Requisitos Legales
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error.message}
                    </h3>
                    {error.isNetworkError && (
                      <div className="mt-2 text-sm text-red-700">
                        <button
                          onClick={handleSubmit}
                          className="font-medium text-red-800 hover:text-red-700"
                        >
                          Reintentar →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Cumplimiento</h3>
                  <div className="bg-gray-50 p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total de Requisitos</p>
                      <p className="text-2xl font-bold text-gray-900">{result.summary.totalRequirements}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cumplidos</p>
                      <p className="text-2xl font-bold text-green-600">{result.summary.compliantCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Porcentaje de Cumplimiento</p>
                      <p className="text-2xl font-bold text-indigo-600">{result.summary.compliancePercentage.toFixed(1)}%</p>
                    </div>
                    {result.summary.criticalGaps.length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Brechas Críticas Identificadas</p>
                        <ul className="list-disc list-inside mt-1">
                          {result.summary.criticalGaps.map((gap, index) => (
                            <li key={index} className="text-sm text-red-600">{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.summary.recommendations.length > 0 && (
                       <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Recomendaciones Generales</p>
                        <ul className="list-disc list-inside mt-1">
                          {result.summary.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Detalle de Requisitos Legales</h3>
                  <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencias</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.requirements && result.requirements.map((req) => (
                          <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{req.title}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{req.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                req.compliance.status === 'compliant' ? 'bg-green-100 text-green-800' :
                                req.compliance.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                req.compliance.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {req.compliance.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{req.compliance.observations || '-'}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{req.actions.join(', ')}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{req.references.join(', ')}</td>
                          </tr>
                        ))}
                        {(!result.requirements || result.requirements.length === 0) && (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No se encontraron requisitos detallados.</td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {result.content && (
                  <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenido Adicional Generado</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded shadow">{result.content}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
