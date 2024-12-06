import { Document, Page, Text, View, StyleSheet, Image, PDFViewer } from '@react-pdf/renderer';
import { PTSResponse } from '../services/azureOpenAI';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#112233',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#112233',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#445566',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  image: {
    width: '80%',
    height: 300,
    marginVertical: 15,
    alignSelf: 'center',
  },
});

interface PTSDocumentProps {
  data: PTSResponse;
  title: string;
}

// Componente para el PDF
const PTSDocument = ({ data, title }: PTSDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>

      {data.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.text}>{section.content}</Text>
          {section.imageUrl && (
            <Image
              style={styles.image}
              src={section.imageUrl}
            />
          )}
        </View>
      ))}
    </Page>
  </Document>
);

// Componente envoltorio para la vista previa del PDF
export const PTSPreview = ({ data, title }: PTSDocumentProps) => (
  <PDFViewer style={{ width: '100%', height: '600px' }}>
    <PTSDocument data={data} title={title} />
  </PDFViewer>
);

export default PTSDocument;
