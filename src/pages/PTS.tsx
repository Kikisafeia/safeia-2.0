import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { generatePTS, generatePTSActivitySuggestions } from '../services/azureOpenAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileCheck, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import PTSDocument, { PTSPreview } from '../components/PTSDocument';

interface PTSResponse {
  content: string;
  images: {
    section: string;
    url: string;
  }[];
}

export default function PTS() {
  const [sector, setSector] = useState('');
  const [suggestions, setSuggestions] = useState<{ activities: string[]; description: string } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    activity: '',
    riskLevel: 'bajo',
    equipment: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ptsData, setPtsData] = useState<PTSResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState('');

  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sector.trim()) return;
    
    setLoadingSuggestions(true);
    setSuggestions(null);
    setError(null);
    
    try {
      const result = await generatePTSActivitySuggestions(sector);
      setSuggestions(result);
    } catch (err) {
      console.error('Error en handleSectorSubmit:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error obteniendo sugerencias. Por favor intente nuevamente.'
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const selectSuggestedActivity = (activity: string) => {
    setFormData(prev => ({ ...prev, activity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const pts = await generatePTS(
        formData.activity,
        formData.riskLevel,
        formData.equipment,
        formData.location
      );
      setPtsData(pts);
      setTitle(`Procedimiento de Trabajo Seguro para ${formData.activity}`);
    } catch (err) {
      setError('Error generando el PTS. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Función para insertar imágenes en el contenido markdown
  const processMarkdownWithImages = (content: string, images: PTSResponse['images']) => {
    let processedContent = content;
    
    // Insertar imágenes en las secciones correspondientes
    images.forEach(({ section, url }) => {
      const sectionHeaders = {
        "EPP": "## 4. Equipos de Protección Personal",
        "Procedimiento": "## 7. Procedimiento Paso a Paso",
        "Emergencia": "## 8. Medidas de Emergencia"
      };
      
      const header = sectionHeaders[section as keyof typeof sectionHeaders];
      if (header && processedContent.includes(header)) {
        const imageMarkdown = `\n\n![${section}](${url})\n\n`;
        processedContent = processedContent.replace(
          header,
          `${header}${imageMarkdown}`
        );
      }
    });
    
    return processedContent;
  };

  const handleDownloadPDF = async () => {
    if (!ptsData) return;
    
    try {
      const blob = await pdf(<PTSDocument data={ptsData} title={title} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_PTS.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-safeia-black mb-8">
          Procedimiento de Trabajo Seguro (PTS)
        </h1>

        {/* Sector Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-safeia-black mb-4">
            Sector o Actividad Principal
          </h2>
          <form onSubmit={handleSectorSubmit} className="space-y-4">
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                Ingrese el sector o actividad principal
              </label>
              <input
                type="text"
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                placeholder="Ej: Construcción, Minería, Manufactura..."
              />
            </div>
            <button
              type="submit"
              disabled={loadingSuggestions || !sector.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow disabled:bg-gray-400 transition-colors duration-200"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Cargando...
                </>
              ) : (
                'Obtener Sugerencias'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Suggestions Display */}
          {suggestions && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-safeia-black">Descripción del Sector</h3>
                <p className="mt-2 text-gray-600">{suggestions.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-safeia-black">Actividades Sugeridas</h3>
                <div className="mt-2 space-y-2">
                  {suggestions.activities.map((activity, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestedActivity(activity)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-safeia-yellow/10 hover:text-safeia-black rounded-md transition-colors duration-200"
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing PTS Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-8">
            <FileCheck className="h-8 w-8 text-safeia-yellow mr-4" />
            <h2 className="text-2xl font-bold text-safeia-black">
              Formulario PTS
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
                Actividad
              </label>
              <textarea
                id="activity"
                name="activity"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                placeholder="Describe la actividad que se realizará..."
                value={formData.activity}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700">
                Nivel de Riesgo
              </label>
              <select
                id="riskLevel"
                name="riskLevel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                value={formData.riskLevel}
                onChange={handleChange}
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
                <option value="crítico">Crítico</option>
              </select>
            </div>

            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">
                Equipos y Herramientas
              </label>
              <input
                type="text"
                id="equipment"
                name="equipment"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                placeholder="Lista los equipos y herramientas necesarios..."
                value={formData.equipment}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                placeholder="Indica la ubicación donde se realizará el trabajo..."
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow disabled:bg-gray-400 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generando...
                  </>
                ) : (
                  'Generar PTS'
                )}
              </button>
            </div>
          </form>

          {ptsData && (
            <div className="mt-8">
              <div className="prose max-w-none">
                <ReactMarkdown 
                  className="prose max-w-none"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({node, ...props}) => (
                      <div className="my-4">
                        <img {...props} className="rounded-lg shadow-md max-w-full h-auto" />
                      </div>
                    )
                  }}
                >
                  {processMarkdownWithImages(ptsData.content, ptsData.images)}
                </ReactMarkdown>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Exportar a PDF
                </button>
                <button
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([ptsData.content], {type: 'text/markdown'});
                    element.href = URL.createObjectURL(file);
                    element.download = "Procedimiento_de_Trabajo_Seguro.md";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-white px-4 py-2 rounded transition-colors duration-200"
                >
                  Descargar PTS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
