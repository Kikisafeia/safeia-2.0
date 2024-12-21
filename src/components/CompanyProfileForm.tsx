import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CompanyProfile {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  numEmpleados: number;
  sectorEconomico: string;
  nivelRiesgo: string;
  actividadPrincipal: string;
  representanteLegal: string;
  responsableSGSST: string;
}

const sectoresEconomicos = [
  'Agricultura y ganadería',
  'Minería',
  'Manufactura',
  'Construcción',
  'Comercio',
  'Servicios',
  'Transporte',
  'Tecnología',
  'Otros'
];

const nivelesRiesgo = [
  'I - Riesgo Mínimo',
  'II - Riesgo Bajo',
  'III - Riesgo Medio',
  'IV - Riesgo Alto',
  'V - Riesgo Máximo'
];

const CompanyProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<CompanyProfile>({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    numEmpleados: 0,
    sectorEconomico: '',
    nivelRiesgo: '',
    actividadPrincipal: '',
    representanteLegal: '',
    responsableSGSST: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviará el perfil al backend
    try {
      // TODO: Implementar llamada a API
      navigate('/sgsst-dashboard');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Nombre de la empresa
        </label>
        <input
          type="text"
          name="nombre"
          value={profile.nombre}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          NIT
        </label>
        <input
          type="text"
          name="nit"
          value={profile.nit}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Dirección
        </label>
        <input
          type="text"
          name="direccion"
          value={profile.direccion}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-safeia-black">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={profile.telefono}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-safeia-black">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Número de empleados
        </label>
        <input
          type="number"
          name="numEmpleados"
          value={profile.numEmpleados}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Sector económico
        </label>
        <select
          name="sectorEconomico"
          value={profile.sectorEconomico}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        >
          <option value="">Seleccione un sector</option>
          {sectoresEconomicos.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Nivel de riesgo
        </label>
        <select
          name="nivelRiesgo"
          value={profile.nivelRiesgo}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        >
          <option value="">Seleccione un nivel de riesgo</option>
          {nivelesRiesgo.map(nivel => (
            <option key={nivel} value={nivel}>{nivel}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Actividad principal
        </label>
        <input
          type="text"
          name="actividadPrincipal"
          value={profile.actividadPrincipal}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Representante legal
        </label>
        <input
          type="text"
          name="representanteLegal"
          value={profile.representanteLegal}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-safeia-black">
          Responsable del SG-SST
        </label>
        <input
          type="text"
          name="responsableSGSST"
          value={profile.responsableSGSST}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
          required
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-safeia-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-safeia-black">
              Perfil de la Empresa
            </h2>
            <p className="text-safeia-gray mt-2">
              Complete la información de su empresa para comenzar con la implementación del SG-SST
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-1/3 h-2 rounded-full mx-1 ${
                    s <= step ? 'bg-safeia-yellow' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-safeia-gray">
              <span>Información básica</span>
              <span>Detalles operativos</span>
              <span>Responsables</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-safeia-yellow text-safeia-yellow rounded-md hover:bg-safeia-yellow hover:text-white transition-colors"
                >
                  Anterior
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-safeia-yellow text-white rounded-md hover:bg-safeia-yellow-dark transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-safeia-yellow text-white rounded-md hover:bg-safeia-yellow-dark transition-colors"
                >
                  Comenzar implementación
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileForm;
