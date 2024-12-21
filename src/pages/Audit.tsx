import React, { useState } from 'react';
import { generateAuditFindings } from '../services/audit';
import { Loader2, AlertCircle, Plus, Trash2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAndDownloadPDF } from '../services/pdf';
import type { HallazgoAuditoria } from '../types/audit';

interface Hallazgo {
  id: number;
  descripcion: string;
  tipo: 'NC_MAYOR' | 'NC_MENOR' | 'OBSERVACION' | 'OPORTUNIDAD_MEJORA';
  clausulaISO: string;
  recomendacion: string;
}

const Audit = () => {
  const [companyName, setCompanyName] = useState('');
  const [area, setArea] = useState('');
  const [auditType, setAuditType] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        scope
      );
      setResult(response);
    } catch (err) {
      setError('Error al generar el informe de auditoría. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (result) {
      try {
        await generateAndDownloadPDF(result, `Informe_Auditoria_${companyName.replace(/\s+/g, '_')}`);
      } catch (err) {
        console.error('Error al descargar PDF:', err);
        setError('Error al descargar el PDF. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Generador de Informes de Auditoría ISO</h1>
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
                  required
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Área o Proceso Auditado
                </label>
                <input
                  type="text"
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
                  required
                />
              </div>

              <div>
                <label htmlFor="auditType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Auditoría
                </label>
                <select
                  id="auditType"
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="INTERNA">Auditoría Interna</option>
                  <option value="EXTERNA">Auditoría Externa</option>
                  <option value="CERTIFICACION">Auditoría de Certificación</option>
                  <option value="SEGUIMIENTO">Auditoría de Seguimiento</option>
                </select>
              </div>

              <div>
                <label htmlFor="scope" className="block text-sm font-medium text-gray-700 mb-1">
                  Alcance de la Auditoría
                </label>
                <textarea
                  id="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-safeia-yellow focus:border-safeia-yellow"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-safeia-yellow hover:bg-safeia-yellow/90 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Generando...
                  </>
                ) : (
                  'Generar Informe'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Informe de Auditoría</h2>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-safeia-yellow hover:bg-safeia-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </button>
              </div>
              <div className="prose max-w-none bg-white shadow-md rounded-lg p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Audit;
