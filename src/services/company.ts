import { CompanyProfile, CompanyStats, RequisitosSGSST } from '../types/company';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const createCompanyProfile = async (profile: CompanyProfile): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', profile.nit);
    await setDoc(companyRef, {
      ...profile,
      fechaCreacion: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al crear el perfil de la empresa:', error);
    throw new Error('No se pudo crear el perfil de la empresa');
  }
};

export const getCompanyProfile = async (nit: string): Promise<CompanyProfile> => {
  try {
    const companyRef = doc(db, 'companies', nit);
    const companySnap = await getDoc(companyRef);
    
    if (!companySnap.exists()) {
      throw new Error('Empresa no encontrada');
    }

    return companySnap.data() as CompanyProfile;
  } catch (error) {
    console.error('Error al obtener el perfil de la empresa:', error);
    throw new Error('No se pudo obtener el perfil de la empresa');
  }
};

export const updateCompanyProfile = async (
  nit: string,
  updates: Partial<CompanyProfile>
): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', nit);
    await updateDoc(companyRef, {
      ...updates,
      ultimaActualizacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al actualizar el perfil de la empresa:', error);
    throw new Error('No se pudo actualizar el perfil de la empresa');
  }
};

export const getCompanyStats = async (nit: string): Promise<CompanyStats> => {
  try {
    const statsRef = doc(db, 'companies', nit, 'stats', 'general');
    const statsSnap = await getDoc(statsRef);
    
    if (!statsSnap.exists()) {
      return {
        documentosCompletados: 0,
        etapasCompletadas: 0,
        porcentajeProgreso: 0,
        proximasAcciones: []
      };
    }

    return statsSnap.data() as CompanyStats;
  } catch (error) {
    console.error('Error al obtener estadísticas de la empresa:', error);
    throw new Error('No se pudieron obtener las estadísticas de la empresa');
  }
};

export const getRequisitosSGSST = async (nivelRiesgo: string): Promise<RequisitosSGSST> => {
  try {
    const requisitosRef = doc(db, 'requisitos_sgsst', nivelRiesgo);
    const requisitosSnap = await getDoc(requisitosRef);
    
    if (!requisitosSnap.exists()) {
      throw new Error('Requisitos no encontrados para el nivel de riesgo especificado');
    }

    return requisitosSnap.data() as RequisitosSGSST;
  } catch (error) {
    console.error('Error al obtener requisitos SGSST:', error);
    throw new Error('No se pudieron obtener los requisitos SGSST');
  }
};

export const validateCompanyProfile = (profile: Partial<CompanyProfile>): string[] => {
  const errors: string[] = [];

  if (!profile.nombre?.trim()) {
    errors.push('El nombre de la empresa es requerido');
  }

  if (!profile.nit?.trim()) {
    errors.push('El NIT es requerido');
  }

  if (!profile.email?.trim()) {
    errors.push('El email es requerido');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('El email no es válido');
  }

  if (!profile.numEmpleados || profile.numEmpleados < 1) {
    errors.push('El número de empleados debe ser mayor a 0');
  }

  if (!profile.nivelRiesgo?.trim()) {
    errors.push('El nivel de riesgo es requerido');
  }

  if (!profile.responsableSGSST?.trim()) {
    errors.push('El responsable del SG-SST es requerido');
  }

  return errors;
};
