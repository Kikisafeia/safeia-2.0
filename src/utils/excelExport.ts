import ExcelJS from 'exceljs';

export async function exportToExcel(data: any[], filename = "evaluacion_riesgos") {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Evaluación de Riesgos');

  // Obtener las cabeceras del primer objeto
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Agregar los datos
  data.forEach(item => {
    worksheet.addRow(Object.values(item));
  });

  // Dar formato a las cabeceras
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F81BD' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  // Dar formato a los datos
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { color: { argb: '000000' } };
      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      row.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  });

  // Ajustar el ancho de las columnas
  worksheet.columns.forEach((column, columnIndex) => {
    column.width = 30;
  });

  // Ajustar la altura de las filas
  worksheet.eachRow((row, rowNumber) => {
    row.height = 30;
  });
  worksheet.getRow(1).height = 40;

  // Generar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Descargar el archivo
  const now = new Date();
  const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${filename}_${timestamp}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(link.href);
}
