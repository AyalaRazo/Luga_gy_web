import * as XLSX from 'xlsx-js-style';

// ─── Paleta de estilos ────────────────────────────────────────────────────────
const C = {
  PINK:      'EC4899',  // header bg
  WHITE:     'FFFFFF',
  ROW_ALT:   'FDF2F8',  // fila alternada (rosa muy suave)
  GREEN_BG:  'DCFCE7',  // fila total
  BORDER:    'E2E8F0',  // gris claro
};

const THIN_BORDER = {
  top:    { style: 'thin', color: { rgb: C.BORDER } },
  bottom: { style: 'thin', color: { rgb: C.BORDER } },
  left:   { style: 'thin', color: { rgb: C.BORDER } },
  right:  { style: 'thin', color: { rgb: C.BORDER } },
};

const HEADER_STYLE = {
  fill:      { fgColor: { rgb: C.PINK } },
  font:      { bold: true, color: { rgb: C.WHITE }, sz: 11, name: 'Calibri' },
  alignment: { vertical: 'center', horizontal: 'center', wrapText: false },
  border:    THIN_BORDER,
};

function dataStyle(rowIdx, align = 'left', bold = false, bgOverride = null) {
  const bg = bgOverride ?? (rowIdx % 2 === 0 ? C.WHITE : C.ROW_ALT);
  return {
    fill:      { fgColor: { rgb: bg } },
    font:      { sz: 10, name: 'Calibri', bold },
    alignment: { vertical: 'center', horizontal: align },
    border:    THIN_BORDER,
  };
}

function mkCell(value, style, numFmt) {
  const t = typeof value === 'number' ? 'n' : 's';
  const c = { v: value ?? '', t, s: style };
  if (numFmt) c.z = numFmt;
  return c;
}

// ─── Construcción de hoja genérica ───────────────────────────────────────────
// headers: string[]
// rows: array of arrays (each inner array = one row, same length as headers)
// colDefs: [{ wch: number, align?: 'left'|'right'|'center', numFmt?: string }]
// totalRow?: array (same length as headers, null values render as empty)
function buildSheet(headers, rows, colDefs, totalRow = null) {
  const ws = {};
  const lastRow = rows.length + (totalRow ? 1 : 0);

  // Header row
  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = mkCell(h, HEADER_STYLE);
  });

  // Data rows
  rows.forEach((row, rIdx) => {
    const r = rIdx + 1;
    row.forEach((val, c) => {
      const def   = colDefs[c] ?? {};
      const align = def.align ?? (typeof val === 'number' ? 'right' : 'left');
      const cell  = mkCell(val, dataStyle(rIdx, align), def.numFmt);
      ws[XLSX.utils.encode_cell({ r, c })] = cell;
    });
  });

  // Total row (green background, bold)
  if (totalRow) {
    const r = rows.length + 1;
    totalRow.forEach((val, c) => {
      const def   = colDefs[c] ?? {};
      const align = def.align ?? (typeof val === 'number' ? 'right' : 'left');
      const cell  = mkCell(val ?? '', dataStyle(0, align, true, C.GREEN_BG), def.numFmt);
      ws[XLSX.utils.encode_cell({ r, c })] = cell;
    });
  }

  ws['!ref']  = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: lastRow } });
  ws['!cols'] = colDefs.map(d => ({ wch: d.wch }));
  ws['!rows'] = [{ hpt: 22 }, ...Array(rows.length + (totalRow ? 1 : 0)).fill({ hpt: 18 })];

  return ws;
}

// ─── Export citas ─────────────────────────────────────────────────────────────
const ESTADO_LABELS = {
  pendiente:             'Pendiente',
  por_confirmar:         'Por confirmar',
  confirmada:            'Confirmada',
  completada:            'Completada',
  cancelada:             'Cancelada',
  solicitud_cancelacion: 'Solicitud cancelación',
  no_show:               'No asistió',
};

export function exportarExcelCitas(citas) {
  const headers = ['Nombre', 'Servicio', 'Fecha', 'Hora', 'Estado', 'Email', 'Teléfono', 'Precio cobrado', 'Notas'];
  const colDefs = [
    { wch: 22 },
    { wch: 28 },
    { wch: 14 },
    { wch: 8,  align: 'center' },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16, align: 'right', numFmt: '"$"#,##0.00' },
    { wch: 32 },
  ];
  const rows = citas.map(c => [
    c.nombre   ?? '',
    c.servicio ?? '',
    c.fecha    ?? '',
    c.hora?.slice(0, 5) ?? '',
    ESTADO_LABELS[c.estado] ?? c.estado ?? '',
    c.email    ?? '',
    c.telefono ?? '',
    c.precio_cobrado != null ? Number(c.precio_cobrado) : '',
    c.notas    ?? '',
  ]);

  const ws = buildSheet(headers, rows, colDefs);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Citas');
  XLSX.writeFile(wb, `citas_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Export ingresos ──────────────────────────────────────────────────────────
export function exportarExcelIngresos(citas, ranking, inicio, fin) {
  const totalMonto  = citas.reduce((s, c) => s + Number(c.precio_cobrado ?? 0), 0);
  const totalCitas  = citas.length;

  // Hoja 1 — Detalle de citas completadas
  const headers1 = ['Fecha', 'Clienta', 'Servicio', 'Cobrado ($)'];
  const colDefs1 = [
    { wch: 14 },
    { wch: 24 },
    { wch: 30 },
    { wch: 16, align: 'right', numFmt: '"$"#,##0.00' },
  ];
  const rows1 = citas.map(c => [
    c.fecha    ?? '',
    c.nombre   ?? '',
    c.servicio ?? '',
    c.precio_cobrado != null ? Number(c.precio_cobrado) : 0,
  ]);
  const total1 = ['', `${totalCitas} citas`, 'TOTAL', totalMonto];
  const ws1 = buildSheet(headers1, rows1, colDefs1, total1);

  // Hoja 2 — Ranking por servicio
  const headers2 = ['Servicio', 'Citas', 'Total ingresado ($)'];
  const colDefs2 = [
    { wch: 30 },
    { wch: 10, align: 'center' },
    { wch: 20, align: 'right', numFmt: '"$"#,##0.00' },
  ];
  const rows2 = ranking
    .filter(r => Number(r.total_ingresado) > 0)
    .map(r => [r.nombre ?? '', Number(r.total_citas), Number(r.total_ingresado)]);
  const ws2 = buildSheet(headers2, rows2, colDefs2);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Citas completadas');
  XLSX.utils.book_append_sheet(wb, ws2, 'Por servicio');
  XLSX.writeFile(wb, `ingresos_${inicio}_${fin}.xlsx`);
}
