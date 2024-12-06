import React, { useState } from 'react';
import { generateAuditFindings } from '../services/audit';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, Loader2, Plus, Trash2, Download } from 'lucide-react';
import { generateAndDownloadPDF } from '../services/pdf';
import DashboardNavbar from '../components/DashboardNavbar';
import type { HallazgoAuditoria } from '../types/audit';

interface Hallazgo {
  descripcion: string;
  proceso_afectado: string;
  evidencia_objetiva: string;
}

export default function Audit() {
  const [companyName, setCompanyName] = useState('');
  const [area, setArea] = useState('');
  const [auditType, setAuditType] = useState('');
  const [auditor, setAuditor] = useState('');
  const [date, setDate] = useState('');
  const [isoStandard, setIsoStandard] = useState('');
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([{ 
    descripcion: '', 
    proceso_afectado: '', 
    evidencia_objetiva: '' 
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HallazgoAuditoria | null>(null);

  const handleAddHallazgo = () => {
    setHallazgos([...hallazgos, { descripcion: '', proceso_afectado: '', evidencia_objetiva: '' }]);
  };

  const handleRemoveHallazgo = (index: number) => {
    const newHallazgos = hallazgos.filter((_, i) => i !== index);
    setHallazgos(newHallazgos);
  };

  const handleHallazgoChange = (index: number, field: keyof Hallazgo, value: string) => {
    const newHallazgos = hallazgos.map((hallazgo, i) => {
      if (i === index) {
        return { ...hallazgo, [field]: value };
      }
      return hallazgo;
    });
    setHallazgos(newHallazgos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateAuditFindings(
        companyName,
        area,
        auditType,
        auditor,
        date,
        isoStandard,
        hallazgos
      );
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Generador de Informes de Auditoría ISO</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información General */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la Empresa
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Área Auditada
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Auditoría
                  <input
                    type="text"
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Auditor
                  <input
                    type="text"
                    value={auditor}
                    onChange={(e) => setAuditor(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Norma ISO
                  <input
                    type="text"
                    value={isoStandard}
                    onChange={(e) => setIsoStandard(e.target.value)}
                    required
                    placeholder="Ej: ISO 45001:2018"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Hallazgos */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Hallazgos de Auditoría</h2>
                <button
                  type="button"
                  onClick={handleAddHallazgo}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Agregar Hallazgo
                </button>
              </div>

              {hallazgos.map((hallazgo, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-md font-medium">Hallazgo #{index + 1}</h3>
                    {hallazgos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHallazgo(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                        <textarea
                          value={hallazgo.descripcion}
                          onChange={(e) => handleHallazgoChange(index, 'descripcion', e.target.value)}
                          required
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Proceso Afectado
                        <input
                          type="text"
                          value={hallazgo.proceso_afectado}
                          onChange={(e) => handleHallazgoChange(index, 'proceso_afectado', e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Evidencia Objetiva
                        <textarea
                          value={hallazgo.evidencia_objetiva}
                          onChange={(e) => handleHallazgoChange(index, 'evidencia_objetiva', e.target.value)}
                          required
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generando...
                  </>
                ) : (
                  'Generar Informe'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-8 flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Informe Generado</h2>
                <button
                  onClick={() => generateAndDownloadPDF(result)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Download size={20} />
                  Descargar PDF
                </button>
              </div>
              <div className="prose max-w-none bg-white shadow-md rounded-lg p-6">
                <ReactMarkdown>
                  {`# Informe de Auditoría ISO

## Información General
- **Empresa:** ${result.informe_hallazgo.informacion_general.empresa}
- **Área Auditada:** ${result.informe_hallazgo.informacion_general.area_auditada}
- **Fecha:** ${result.informe_hallazgo.informacion_general.fecha_auditoria}
- **Tipo de Auditoría:** ${result.informe_hallazgo.informacion_general.tipo_auditoria}
- **Auditor:** ${result.informe_hallazgo.informacion_general.auditor}
- **Norma de Referencia:** ${result.informe_hallazgo.informacion_general.norma_referencia}

## Hallazgos
${result.informe_hallazgo.hallazgos.map((hallazgo, index) => `
### Hallazgo ${hallazgo.id}
- **Tipo:** ${hallazgo.tipo}
- **Proceso Afectado:** ${hallazgo.proceso_afectado}
- **Descripción:** ${hallazgo.descripcion}
- **Evidencia Objetiva:** ${hallazgo.evidencia_objetiva}
- **Cláusula de la Norma:** ${hallazgo.clausula_norma}
- **Requisito Incumplido:** ${hallazgo.requisito_incumplido}

#### Análisis de Causa Raíz
${hallazgo.analisis_causa_raiz.causas_identificadas.map(causa => `- ${causa}`).join('\n')}

#### Acciones Propuestas
${hallazgo.acciones_propuestas.map(accion => `
- **${accion.tipo}:**
  - Descripción: ${accion.descripcion}
  - Responsable: ${accion.responsable}
  - Fecha de Implementación: ${accion.fecha_implementacion}
  - Recursos Necesarios: ${accion.recursos_necesarios}
  - Seguimiento: ${accion.seguimiento.metodo_verificacion} (${accion.seguimiento.frecuencia_seguimiento})
`).join('\n')}

#### Impacto
- **Seguridad y Salud:** ${hallazgo.impacto.seguridad_salud}
- **Operacional:** ${hallazgo.impacto.operacional}
- **Económico:** ${hallazgo.impacto.economico}
`).join('\n')}

## Conclusiones
### Resumen de Hallazgos
- Total: ${result.informe_hallazgo.conclusiones.resumen_hallazgos.total_hallazgos}
- No Conformidades Mayores: ${result.informe_hallazgo.conclusiones.resumen_hallazgos.no_conformidades_mayores}
- No Conformidades Menores: ${result.informe_hallazgo.conclusiones.resumen_hallazgos.no_conformidades_menores}
- Observaciones: ${result.informe_hallazgo.conclusiones.resumen_hallazgos.observaciones}
- Oportunidades de Mejora: ${result.informe_hallazgo.conclusiones.resumen_hallazgos.oportunidades_mejora}

### Recomendaciones Generales
${result.informe_hallazgo.conclusiones.recomendaciones_generales.map(rec => `- ${rec}`).join('\n')}

### Próximos Pasos
${result.informe_hallazgo.conclusiones.proximos_pasos.map(paso => `- ${paso}`).join('\n')}
`}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
