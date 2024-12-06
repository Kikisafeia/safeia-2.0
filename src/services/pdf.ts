import { pdf } from '@react-pdf/renderer';
import { HallazgoAuditoria } from '../types/audit';
import { AuditPDFDocument } from '../components/AuditPDF';
import React from 'react';

export const generateAndDownloadPDF = async (data: HallazgoAuditoria) => {
  try {
    // Generar el PDF
    const blob = await pdf(React.createElement(AuditPDFDocument, { data })).toBlob();
    
    // Crear URL para el blob
    const url = URL.createObjectURL(blob);
    
    // Crear elemento anchor temporal
    const link = document.createElement('a');
    link.href = url;
    
    // Generar nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    const empresa = data.informe_hallazgo.informacion_general.empresa
      .toLowerCase()
      .replace(/\s+/g, '_');
    link.download = `informe_auditoria_${empresa}_${fecha}.pdf`;
    
    // Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw new Error('No se pudo generar el PDF del informe');
  }
};
