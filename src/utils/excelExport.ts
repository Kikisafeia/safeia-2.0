import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string = 'evaluacion_riesgos') {
  if (!data || data.length === 0) return;

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths (ajustar según el contenido)
  const colWidths = Object.keys(data[0]).map(() => ({ wch: 30 }));
  ws['!cols'] = colWidths;

  // Aplicar estilos
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_address]) continue;

      // Estilo para encabezados
      if (R === 0) {
        ws[cell_address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F81BD" }, patternType: 'solid' },
          alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        };
      }
      // Estilo para datos
      else {
        ws[cell_address].s = {
          font: { color: { rgb: "000000" } },
          alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }
  }

  // Ajustar altura de filas
  ws['!rows'] = Array(range.e.r + 1).fill({ hpt: 30 });
  ws['!rows'][0] = { hpt: 40 }; // Encabezado más alto

  // Crear workbook y agregar la hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Evaluación de Riesgos');

  // Generar archivo Excel
  const now = new Date();
  const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}
