import React, { useState } from 'react';
import { Download, Wand2, Check, X } from 'lucide-react';
import { BlobProvider, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Sugerencia {
  id: string;
  descripcion: string;
  riesgos: string[];
  selected: boolean;
}

interface ODIDocument {
  introduccion: string;
  medidas_preventivas: string[];
  elementos_proteccion: string[];
  procedimientos_emergencia: string[];
  derechos_obligaciones: string[];
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF', // Keep as hex for PDF generation consistency
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  list: {
    marginLeft: 20,
  }
});

// Componente PDF
const ODIPdf = ({ data, workerInfo }: { data: ODIDocument, workerInfo: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Obligación de Informar (ODI)</Text>
        <Text style={styles.text}>Nombre: {workerInfo.nombre}</Text>
        <Text style={styles.text}>RUT: {workerInfo.rut}</Text>
        <Text style={styles.text}>Cargo: {workerInfo.cargo}</Text>
        <Text style={styles.text}>Área: {workerInfo.area}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Introducción</Text>
        <Text style={styles.text}>{data.introduccion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Medidas Preventivas</Text>
        {data.medidas_preventivas.map((medida, index) => (
          <Text key={index} style={styles.text}>• {medida}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Elementos de Protección Personal</Text>
        {data.elementos_proteccion.map((epp, index) => (
          <Text key={index} style={styles.text}>• {epp}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Procedimientos de Emergencia</Text>
        {data.procedimientos_emergencia.map((proc, index) => (
          <Text key={index} style={styles.text}>• {proc}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Derechos y Obligaciones</Text>
        {data.derechos_obligaciones.map((derecho, index) => (
          <Text key={index} style={styles.text}>• {derecho}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

const ObligacionInformar: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [cargo, setCargo] = useState('');
  const [area, setArea] = useState('');
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [odiDocument, setOdiDocument] = useState<ODIDocument | null>(null);

  const generateSuggestions = async () => {
    if (!cargo) {
      alert('Por favor, ingrese el cargo del trabajador');
      return;
    }

    setLoading(true);
    try {
      const messages = [
        {
          role: "system",
          content: "Eres un experto en prevención de riesgos laborales. Genera tareas y riesgos específicos para el cargo proporcionado."
        },
        {
          role: "user",
          content: `Genera 5 tareas principales con sus riesgos asociados para el cargo de ${cargo}. 
          Formato de respuesta:
          {
            "sugerencias": [
              {
                "descripcion": "Descripción de la tarea",
                "riesgos": ["Riesgo 1", "Riesgo 2"]
              }
            ]
          }`
        }
      ];

      const response = await fetch('/api/azure/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al generar sugerencias desde el servidor');
      }

      const result = await response.json();
      const content = result.choices[0].message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta del servicio de IA');
      }

      const parsedContent = JSON.parse(content);
      const newSugerencias = parsedContent.sugerencias.map((sug: any, index: number) => ({
        ...sug,
        id: `${index}`,
        selected: false
      }));

      setSugerencias(newSugerencias);
    } catch (error) {
      console.error('Error al generar sugerencias:', error);
      alert('Error al generar sugerencias. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSugerencia = (id: string) => {
    setSugerencias(prev => prev.map(sug => 
      sug.id === id ? { ...sug, selected: !sug.selected } : sug
    ));
  };

  const generateODI = async () => {
    if (!nombre || !rut || !cargo || !sugerencias.some(s => s.selected)) {
      alert('Por favor, complete la información del trabajador y seleccione al menos una tarea');
      return;
    }

    setLoading(true);
    try {
      const selectedTareas = sugerencias
        .filter(sug => sug.selected)
        .map((tarea, index) => `
          ${index + 1}. ${tarea.descripcion}
             Riesgos asociados:
             ${tarea.riesgos.map(riesgo => `- ${riesgo}`).join('\n             ')}
        `).join('\n');

      const messages = [
        {
          role: "system",
          content: `Eres un experto en prevención de riesgos laborales que genera documentos de Obligación de Informar (ODI) detallados y profesionales.`
        },
        {
          role: "user",
          content: `Genera un documento ODI para:
          Nombre: ${nombre}
          RUT: ${rut}
          Cargo: ${cargo}
          Área: ${area}

          Tareas y riesgos seleccionados:
          ${selectedTareas}

          Formato de respuesta:
          Introducción:
          [Texto]

          Medidas Preventivas:
          - [Medida 1]
          - [Medida 2]

          Elementos de Protección Personal:
          - [EPP 1]
          - [EPP 2]

          Procedimientos de Emergencia:
          - [Procedimiento 1]
          - [Procedimiento 2]

          Derechos y Obligaciones:
          - [Derecho 1]
          - [Derecho 2]`
        }
      ];

      const response = await fetch('/api/azure/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" } // Request JSON object
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al generar ODI desde el servidor');
      }

      const result = await response.json();
      const content = result.choices[0].message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta del servicio de IA');
      }

      // Assuming the AI now returns a JSON object directly
      const odiDoc: ODIDocument = JSON.parse(content);

      setOdiDocument(odiDoc);
    } catch (error) {
      console.error('Error al generar ODI:', error);
      alert(error instanceof Error ? error.message : 'Error al generar el documento ODI. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-safeia-black">Obligación de Informar (ODI)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de datos del trabajador */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-safeia-black">Datos del Trabajador</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">RUT</label>
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              />
            </div>

            <button
              onClick={generateSuggestions}
              disabled={!cargo || loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {loading ? 'Generando...' : 'Generar Sugerencias'}
            </button>
          </div>
        </div>

        {/* Lista de sugerencias */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-safeia-black">Tareas y Riesgos Sugeridos</h2>
          
          <div className="space-y-4">
            {sugerencias.map((sugerencia) => (
              <div
                key={sugerencia.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  sugerencia.selected
                    ? 'border-safeia-yellow bg-safeia-yellow bg-opacity-10'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{sugerencia.descripcion}</h3>
                    <ul className="mt-2 space-y-1">
                      {sugerencia.riesgos.map((riesgo, index) => (
                        <li key={index} className="text-sm text-gray-600">• {riesgo}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => toggleSugerencia(sugerencia.id)}
                    className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
                      sugerencia.selected
                        ? 'bg-safeia-yellow text-safeia-black'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {sugerencia.selected ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => {
            setNombre('');
            setRut('');
            setCargo('');
            setArea('');
            setSugerencias([]);
            setOdiDocument(null);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
        >
          Limpiar Formulario
        </button>
        <button
          onClick={generateODI}
          disabled={loading || !nombre || !rut || !cargo || !sugerencias.some(s => s.selected)}
          className="px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generando...' : 'Generar ODI'}
        </button>
        {odiDocument && (
          <BlobProvider
            document={
              <ODIPdf
                data={odiDocument}
                workerInfo={{ nombre, rut, cargo, area }}
              />
            }
          >
            {({ url, loading }: { url: string | null, loading: boolean }) => (
              <a
                href={url || '#'}
                download={`ODI_${nombre.replace(/\s+/g, '_')}_${cargo.replace(/\s+/g, '_')}.pdf`}
                className="px-4 py-2 bg-safeia-black text-white rounded-md hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 inline-flex items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Download className="w-4 h-4 inline-block mr-2" />
                    Generando PDF...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="w-4 h-4 inline-block mr-2" />
                    Descargar PDF
                  </span>
                )}
              </a>
            )}
          </BlobProvider>
        )}
      </div>

      {/* Vista previa del documento */}
      {odiDocument && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-safeia-black">Vista Previa del Documento</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-safeia-black">Introducción</h3>
              <p className="text-gray-700">{odiDocument.introduccion}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-safeia-black">Medidas Preventivas</h3>
              <ul className="list-disc list-inside space-y-1">
                {odiDocument.medidas_preventivas.map((medida, index) => (
                  <li key={index} className="text-gray-700">{medida}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-safeia-black">Elementos de Protección Personal</h3>
              <ul className="list-disc list-inside space-y-1">
                {odiDocument.elementos_proteccion.map((epp, index) => (
                  <li key={index} className="text-gray-700">{epp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-safeia-black">Procedimientos de Emergencia</h3>
              <ul className="list-disc list-inside space-y-1">
                {odiDocument.procedimientos_emergencia.map((proc, index) => (
                  <li key={index} className="text-gray-700">{proc}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-safeia-black">Derechos y Obligaciones</h3>
              <ul className="list-disc list-inside space-y-1">
                {odiDocument.derechos_obligaciones.map((derecho, index) => (
                  <li key={index} className="text-gray-700">{derecho}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObligacionInformar;
