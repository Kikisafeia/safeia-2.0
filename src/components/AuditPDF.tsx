import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { HallazgoAuditoria } from '../types/audit';

// Definir los estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
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
  hallazgoContainer: {
    marginTop: 15,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
});

interface AuditPDFProps {
  data: HallazgoAuditoria;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const AuditPDFDocument = ({ data }: AuditPDFProps) => {
  const { informe_hallazgo } = data;
  const { informacion_general, hallazgos, conclusiones } = informe_hallazgo;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.section}>
          <Text style={styles.title}>Informe de Auditoría ISO</Text>
          <Text style={styles.text}>Empresa: {informacion_general.empresa}</Text>
          <Text style={styles.text}>Área Auditada: {informacion_general.area_auditada}</Text>
          <Text style={styles.text}>Fecha: {formatDate(informacion_general.fecha_auditoria)}</Text>
          <Text style={styles.text}>Tipo de Auditoría: {informacion_general.tipo_auditoria}</Text>
          <Text style={styles.text}>Auditor: {informacion_general.auditor}</Text>
          <Text style={styles.text}>Norma de Referencia: {informacion_general.norma_referencia}</Text>
        </View>

        {/* Hallazgos */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Hallazgos de Auditoría</Text>
          {hallazgos.map((hallazgo, index) => (
            <View key={`hallazgo-${index}`} style={styles.hallazgoContainer}>
              <Text style={styles.text}>ID: {hallazgo.id}</Text>
              <Text style={styles.text}>Tipo: {hallazgo.tipo}</Text>
              <Text style={styles.text}>Proceso Afectado: {hallazgo.proceso_afectado}</Text>
              <Text style={styles.text}>Descripción: {hallazgo.descripcion}</Text>
              <Text style={styles.text}>Evidencia Objetiva: {hallazgo.evidencia_objetiva}</Text>
              <Text style={styles.text}>Cláusula de la Norma: {hallazgo.clausula_norma}</Text>
              
              {/* Análisis de Causa Raíz */}
              <Text style={styles.text}>Análisis de Causa Raíz:</Text>
              {hallazgo.analisis_causa_raiz.causas_identificadas.map((causa, i) => (
                <Text key={`causa-${i}`} style={styles.text}>• {causa}</Text>
              ))}

              {/* Acciones Propuestas */}
              <Text style={styles.text}>Acciones Propuestas:</Text>
              {hallazgo.acciones_propuestas.map((accion, i) => (
                <View key={`accion-${i}`}>
                  <Text style={styles.text}>Acción {i + 1}:</Text>
                  <Text style={styles.text}>• Tipo: {accion.tipo}</Text>
                  <Text style={styles.text}>• Descripción: {accion.descripcion}</Text>
                  <Text style={styles.text}>• Responsable: {accion.responsable}</Text>
                  <Text style={styles.text}>• Fecha: {formatDate(accion.fecha_implementacion)}</Text>
                </View>
              ))}

              {/* Impacto */}
              <Text style={styles.text}>Impacto:</Text>
              <Text style={styles.text}>• Seguridad y Salud: {hallazgo.impacto.seguridad_salud}</Text>
              <Text style={styles.text}>• Operacional: {hallazgo.impacto.operacional}</Text>
              <Text style={styles.text}>• Económico: {hallazgo.impacto.economico}</Text>
            </View>
          ))}
        </View>

        {/* Conclusiones */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Conclusiones</Text>
          <Text style={styles.text}>Resumen de Hallazgos:</Text>
          <Text style={styles.text}>• Total: {conclusiones.resumen_hallazgos.total_hallazgos}</Text>
          <Text style={styles.text}>• No Conformidades Mayores: {conclusiones.resumen_hallazgos.no_conformidades_mayores}</Text>
          <Text style={styles.text}>• No Conformidades Menores: {conclusiones.resumen_hallazgos.no_conformidades_menores}</Text>
          <Text style={styles.text}>• Observaciones: {conclusiones.resumen_hallazgos.observaciones}</Text>
          <Text style={styles.text}>• Oportunidades de Mejora: {conclusiones.resumen_hallazgos.oportunidades_mejora}</Text>

          <Text style={styles.text}>Recomendaciones Generales:</Text>
          {conclusiones.recomendaciones_generales.map((rec, i) => (
            <Text key={`rec-${i}`} style={styles.text}>• {rec}</Text>
          ))}

          <Text style={styles.text}>Próximos Pasos:</Text>
          {conclusiones.proximos_pasos.map((paso, i) => (
            <Text key={`paso-${i}`} style={styles.text}>• {paso}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};
