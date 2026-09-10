import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx-js-style';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export type ExcelRow = Record<string, string | number | null | undefined>;

export interface ExcelSummaryRow {
  label: string;
  value: string;
}

export interface ExcelOptions {
  fileName: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  columns: ExcelColumn[];
  rows: ExcelRow[];
  summary?: ExcelSummaryRow[];
}

const EMERALD = '059669';
const BORDER_COLOR = 'D8E4DE';
const BODY_FILL = 'FFFFFF';
const ZEBRA_FILL = 'F3FAF7';
const SUB_HEAD_FILL = 'E8F3EE';

function emptyRow(n: number): (string | number)[] {
  return new Array(n).fill('');
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/*?:[\]]/g, '-').slice(0, 31);
}

function allBorders(): XLSX.CellStyle['border'] {
  return {
    top: { style: 'thin', color: { rgb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { rgb: BORDER_COLOR } },
    left: { style: 'thin', color: { rgb: BORDER_COLOR } },
    right: { style: 'thin', color: { rgb: BORDER_COLOR } },
  };
}

export async function exportExcel(opts: ExcelOptions): Promise<void> {
  const { columns, rows = [], summary } = opts;
  const n = columns.length;
  const aoa: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];
  let r = 0;

  if (opts.title) {
    aoa.push([opts.title, ...emptyRow(n - 1)]);
    merges.push({ s: { r, c: 0 }, e: { r, c: n - 1 } });
    r += 1;
  }
  if (opts.subtitle) {
    aoa.push([opts.subtitle, ...emptyRow(n - 1)]);
    merges.push({ s: { r, c: 0 }, e: { r, c: n - 1 } });
    r += 1;
  }
  if (opts.title || opts.subtitle) {
    aoa.push(emptyRow(n));
    r += 1;
  }

  const headerRow = r;
  aoa.push(columns.map((c) => c.header));
  r += 1;

  const dataStart = r;
  for (const row of rows) {
    aoa.push(columns.map((c) => (row[c.key] ?? '') as string | number));
  }
  const dataEnd = r + rows.length - 1;

  if (summary && summary.length > 0) {
    aoa.push(emptyRow(n));
    aoa.push(['RINGKASAN', ...emptyRow(n - 1)]);
    merges.push({ s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: n - 1 } });
    for (const s of summary) {
      aoa.push([s.label, s.value, ...emptyRow(n - 2)]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = columns.map((c) => ({ wch: c.width ?? 18 }));
  if (merges.length > 0) ws['!merges'] = merges;
  if (rows.length > 0) {
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: dataEnd, c: n - 1 } }),
    };
  }

  const addr = (row: number, col: number) => XLSX.utils.encode_cell({ r: row, c: col });
  const cell = (row: number, col: number) => ws[addr(row, col)];

  const moneyCols = columns.map(
    (c) => rows.every((x) => x[c.key] === null || x[c.key] === undefined || x[c.key] === '' || typeof x[c.key] === 'number') && rows.some((x) => typeof x[c.key] === 'number'),
  );

  if (opts.title) {
    const t = cell(0, 0);
    if (t) t.s = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 }, fill: { fgColor: { rgb: EMERALD }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'center' } };
  }
  if (opts.subtitle) {
    const t = cell(1, 0);
    if (t) t.s = { font: { color: { rgb: '576A63' }, sz: 10 }, fill: { fgColor: { rgb: SUB_HEAD_FILL }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'center' } };
  }

  for (let c = 0; c < n; c++) {
    const h = cell(headerRow, c);
    if (h) h.s = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: EMERALD }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'center' }, border: allBorders() };
  }

  const zebra = (ri: number) => (ri % 2 === 1 ? ZEBRA_FILL : BODY_FILL);
  for (let ri = 0; ri < rows.length; ri++) {
    for (let c = 0; c < n; c++) {
      const d = cell(dataStart + ri, c);
      if (d) {
        d.s = { fill: { fgColor: { rgb: zebra(ri) }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: moneyCols[c] ? 'right' : 'left' }, border: allBorders() };
        if (moneyCols[c] && typeof d.v === 'number') d.z = '"Rp "#,##0';
      }
    }
  }

let ringRow = -1;
  if (summary && summary.length > 0) {
    ringRow = aoa.length - 1 - summary.length;
    const rr = cell(ringRow, 0);
    if (rr) rr.s = { font: { bold: true, color: { rgb: '0F2E24' } }, fill: { fgColor: { rgb: 'CDEBDF' }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left' }, border: allBorders() };
    for (let i = 0; i < summary.length; i++) {
      const sr = ringRow + 1 + i;
      const label = cell(sr, 0);
      const value = cell(sr, 1);
      if (label) label.s = { font: { bold: true }, fill: { fgColor: { rgb: SUB_HEAD_FILL }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'left' }, border: allBorders() };
      if (value) {
        value.s = { fill: { fgColor: { rgb: SUB_HEAD_FILL }, patternType: 'solid' }, alignment: { vertical: 'center', horizontal: 'right' }, border: allBorders() };
      }
    }
  }

  ws['!rows'] = aoa.map((_, i) => ({ hpt: i === headerRow ? 24 : i < headerRow || (ringRow >= 0 && i >= ringRow) ? 22 : 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(opts.sheetName ?? 'Laporan'));

  const name = sanitizeFileName(opts.fileName.endsWith('.xlsx') ? opts.fileName : `${opts.fileName}.xlsx`);

  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, name);
    return;
  }

  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const file = new File(Paths.cache, name);
  file.write(new Uint8Array(data));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Simpan laporan Excel',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  } else {
    throw new Error('Berbagi file tidak tersedia di perangkat ini.');
  }
}