import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { generateInvestigation } from '../services/investigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InvestigationResponse {
  content: string;
  images: {
    section: string;
    url: string;
  }[];
  sections: {
    title: string;
    content: string;
    imageUrl?: string;
  }[];
}

export default function Investigation() {
  const [formData, setFormData] = useState({
    incident: '',
    date: '',
    location: '',
    description: '',
    consequences: '',
    witnesses: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const investigation = await generateInvestigation(
        formData.incident,
        formData.date,
        formData.location,
        formData.description,
        formData.consequences,
        formData.witnesses
      );
      setResult(investigation);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando el informe. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Investigación de Accidentes
            </h1>
            <p className="mt-2 text-gray-600">
              Genera un informe detallado de investigación de accidentes con análisis de causas y recomendaciones.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="incident" className="block text-sm font-medium text-gray-700">
                  Tipo de Incidente
                </label>
                <input
                  type="text"
                  id="incident"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.incident}
                  onChange={(e) => setFormData({ ...formData, incident: e.target.value })}
                  placeholder="Ej: Caída desde altura, Golpe con objeto, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Fecha del Incidente
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Lugar del Incidente
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Área de producción, Almacén, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción del Incidente
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe detalladamente cómo ocurrió el incidente..."
                  required
                />
              </div>

              <div>
                <label htmlFor="consequences" className="block text-sm font-medium text-gray-700">
                  Consecuencias
                </label>
                <textarea
                  id="consequences"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.consequences}
                  onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                  placeholder="Describe las lesiones, daños materiales u otras consecuencias..."
                  required
                />
              </div>

              <div>
                <label htmlFor="witnesses" className="block text-sm font-medium text-gray-700">
                  Testigos
                </label>
                <input
                  type="text"
                  id="witnesses"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Nombres de los testigos (si los hay)"
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
                      Generando Informe...
                    </>
                  ) : (
                    'Generar Informe de Investigación'
                  )}
                </button>
              </div>
            </form>

            {result && (
              <div className="mt-8">
                <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: (props) => (
                        <div className="my-4">
                          <img {...props} className="rounded-lg shadow-md max-w-full h-auto" />
                        </div>
                      )
                    }}
                  >
                    {result.content}
                  </ReactMarkdown>
                </div>
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([result.content], {type: 'text/markdown'});
                      element.href = URL.createObjectURL(file);
                      element.download = "Informe_Investigacion.md";
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
