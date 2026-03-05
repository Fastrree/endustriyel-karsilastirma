import ExcelJS from 'exceljs';
import type { Product } from '../types';

// ==============================
// Color Palette (Cockpit Theme)
// ==============================
const C = {
  dark: '0C0C12',
  darkBg: '12121A',
  cardBg: '1A1A24',
  headerBg: '0D47A1',
  headerText: 'FFFFFF',
  accent: '0066FF',
  green: '00CC66',
  amber: 'FFAA00',
  red: 'FF4444',
  textPrimary: 'E0E0E0',
  textMuted: '777777',
  border: '2A2A35',
  sectionBg: '15151E',
};

// ==============================
// Shared Styles
// ==============================
const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: C.headerText }, size: 12, name: 'Segoe UI' };
const titleFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: C.headerText }, size: 16, name: 'Segoe UI' };
const sectionFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: C.accent }, size: 11, name: 'Segoe UI' };
const dataFont: Partial<ExcelJS.Font> = { color: { argb: C.textPrimary }, size: 10, name: 'Segoe UI' };
const mutedFont: Partial<ExcelJS.Font> = { color: { argb: C.textMuted }, size: 10, name: 'Segoe UI' };

const darkFill = (color: string): ExcelJS.Fill => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: color },
});

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: C.border } },
  bottom: { style: 'thin', color: { argb: C.border } },
  left: { style: 'thin', color: { argb: C.border } },
  right: { style: 'thin', color: { argb: C.border } },
};

export class ExportService {

  // ================================================
  // EXCEL — Premium Styled Dashboard
  // ================================================
  static async exportToExcel(products: Product[], type: 'products' | 'comparison' = 'products'): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Endüstriyel Karşılaştırma';
    wb.created = new Date();

    const timestamp = new Date().toISOString().split('T')[0];

    if (type === 'products') {
      this.buildDashboard(wb, products);
      this.buildProductDetail(wb, products);
      this.buildPriceRanking(wb, products);
      this.buildSpecComparison(wb, products);
    } else {
      this.buildComparisonReport(wb, products);
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'products' ? `Urun_Raporu_${timestamp}.xlsx` : `Karsilastirma_${timestamp}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Dashboard Sheet ----
  private static buildDashboard(wb: ExcelJS.Workbook, products: Product[]) {
    const ws = wb.addWorksheet('Dashboard', {
      properties: { tabColor: { argb: C.accent } },
    });
    ws.properties.defaultColWidth = 22;
    ws.getColumn(1).width = 28;
    ws.getColumn(2).width = 22;
    ws.getColumn(3).width = 22;
    ws.getColumn(4).width = 22;

    // Apply dark background to all visible cells
    for (let r = 1; r <= 40; r++) {
      for (let c = 1; c <= 6; c++) {
        const cell = ws.getCell(r, c);
        cell.fill = darkFill(C.dark);
        cell.font = dataFont;
      }
    }

    const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;
    const categories = [...new Set(products.map(p => p.category))];
    const suppliers = [...new Set(products.map(p => p.supplier.name))];
    const inStock = products.filter(p => p.stockStatus === 'in_stock').length;
    const lowStock = products.filter(p => p.stockStatus === 'low_stock').length;
    const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length;

    // --- Title ---
    ws.mergeCells('A1:D1');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'ENDÜSTRİYEL TEKSTİL — ÜRÜN RAPORU';
    titleCell.font = titleFont;
    titleCell.fill = darkFill(C.headerBg);
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 40;

    // --- Date ---
    ws.mergeCells('A2:D2');
    const dateCell = ws.getCell('A2');
    dateCell.value = `Rapor: ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    dateCell.font = mutedFont;
    dateCell.fill = darkFill(C.darkBg);
    dateCell.alignment = { horizontal: 'center' };

    // --- Stat Cards Row ---
    const statRow = 4;
    ws.getRow(statRow).height = 50;

    const stats = [
      { label: 'TOPLAM ÜRÜN', value: products.length, color: C.textPrimary },
      { label: 'KATEGORİ', value: categories.length, color: C.accent },
      { label: 'TEDARİKÇİ', value: suppliers.length, color: C.green },
      { label: 'ORT. FİYAT', value: `${avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`, color: C.amber },
    ];

    stats.forEach((s, i) => {
      const cell = ws.getCell(statRow, i + 1);
      cell.value = `${s.value}\n${s.label}`;
      cell.font = { bold: true, color: { argb: s.color }, size: 14, name: 'Segoe UI' };
      cell.fill = darkFill(C.cardBg);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });

    // --- Stock Status ---
    const stockRow = 6;
    this.addSectionHeader(ws, stockRow, 'STOK DURUMU');

    const stockData = [
      { label: 'Stokta', val: inStock, pct: ((inStock / products.length) * 100).toFixed(1), color: C.green },
      { label: 'Az Stok', val: lowStock, pct: ((lowStock / products.length) * 100).toFixed(1), color: C.amber },
      { label: 'Tükendi', val: outOfStock, pct: ((outOfStock / products.length) * 100).toFixed(1), color: C.red },
    ];

    stockData.forEach((s, i) => {
      const row = stockRow + 1 + i;
      ws.getCell(row, 1).value = s.label;
      ws.getCell(row, 1).font = dataFont;
      ws.getCell(row, 1).fill = darkFill(C.dark);

      ws.getCell(row, 2).value = `${s.val} ürün (${s.pct}%)`;
      ws.getCell(row, 2).font = { color: { argb: s.color }, size: 10, name: 'Segoe UI', bold: true };
      ws.getCell(row, 2).fill = darkFill(C.dark);

      // Visual bar (skip for Tükendi)
      ws.getCell(row, 3).value = i < 2 ? '█'.repeat(Math.max(1, Math.round(parseInt(s.pct) / 5))) : '';
      ws.getCell(row, 3).font = { color: { argb: s.color }, size: 10, name: 'Segoe UI' };
      ws.getCell(row, 3).fill = darkFill(C.dark);
    });

    // --- Price Analysis ---
    const priceRow = stockRow + 5;
    this.addSectionHeader(ws, priceRow, 'FİYAT ANALİZİ');

    const priceData = [
      ['En Düşük Fiyat', `${Math.min(...products.map(p => p.price)).toLocaleString('tr-TR')} TRY`],
      ['En Yüksek Fiyat', `${Math.max(...products.map(p => p.price)).toLocaleString('tr-TR')} TRY`],
      ['Ortalama Fiyat', `${avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TRY`],
      ['Fiyat Aralığı', `${(Math.max(...products.map(p => p.price)) - Math.min(...products.map(p => p.price))).toLocaleString('tr-TR')} TRY`],
    ];

    priceData.forEach((d, i) => {
      const row = priceRow + 1 + i;
      ws.getCell(row, 1).value = d[0];
      ws.getCell(row, 1).font = dataFont;
      ws.getCell(row, 1).fill = darkFill(C.dark);
      ws.getCell(row, 2).value = d[1];
      ws.getCell(row, 2).font = { color: { argb: C.accent }, size: 11, name: 'Segoe UI', bold: true };
      ws.getCell(row, 2).fill = darkFill(C.dark);
    });

    // --- Suppliers ---
    const suppRow = priceRow + 6;
    this.addSectionHeader(ws, suppRow, 'TEDARİKÇİLER');

    suppliers.forEach((s, i) => {
      const row = suppRow + 1 + i;
      const count = products.filter(p => p.supplier.name === s).length;
      ws.getCell(row, 1).value = s;
      ws.getCell(row, 1).font = dataFont;
      ws.getCell(row, 1).fill = darkFill(C.dark);
      ws.getCell(row, 2).value = `${count} ürün`;
      ws.getCell(row, 2).font = { color: { argb: C.green }, size: 10, name: 'Segoe UI' };
      ws.getCell(row, 2).fill = darkFill(C.dark);
    });

    // --- Categories ---
    const catRow = suppRow + suppliers.length + 2;
    this.addSectionHeader(ws, catRow, 'KATEGORİLER');

    categories.forEach((c, i) => {
      const row = catRow + 1 + i;
      const catProducts = products.filter(p => p.category === c);
      const avg = catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length;
      ws.getCell(row, 1).value = c;
      ws.getCell(row, 1).font = dataFont;
      ws.getCell(row, 1).fill = darkFill(C.dark);
      ws.getCell(row, 2).value = `${catProducts.length} ürün`;
      ws.getCell(row, 2).font = dataFont;
      ws.getCell(row, 2).fill = darkFill(C.dark);
      ws.getCell(row, 3).value = `Ort: ${avg.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TRY`;
      ws.getCell(row, 3).font = { color: { argb: C.amber }, size: 10, name: 'Segoe UI' };
      ws.getCell(row, 3).fill = darkFill(C.dark);
    });
  }

  private static addSectionHeader(ws: ExcelJS.Worksheet, row: number, title: string) {
    ws.mergeCells(row, 1, row, 4);
    const cell = ws.getCell(row, 1);
    cell.value = title;
    cell.font = sectionFont;
    cell.fill = darkFill(C.sectionBg);
    cell.border = { bottom: { style: 'thin', color: { argb: C.accent } } };
    ws.getRow(row).height = 26;
  }

  // ---- Product Detail Sheet ----
  private static buildProductDetail(wb: ExcelJS.Workbook, products: Product[]) {
    const ws = wb.addWorksheet('Ürün Detay', {
      properties: { tabColor: { argb: C.green } },
    });

    const headers = ['No', 'Ürün Adı', 'Kategori', 'Tedarikçi', 'Fiyat (TRY)', 'Birim', 'Stok Durumu', 'Son Güncelleme', 'Kaynak'];
    const widths = [6, 35, 18, 25, 14, 10, 14, 16, 14];

    // Header row
    const headerRow = ws.getRow(1);
    headerRow.height = 30;
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = headerFont;
      cell.fill = darkFill(C.headerBg);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
      ws.getColumn(i + 1).width = widths[i];
    });

    // Data rows
    products.forEach((p, idx) => {
      const row = ws.getRow(idx + 2);
      const bg = idx % 2 === 0 ? C.dark : C.darkBg;

      const stockLabel = p.stockStatus === 'in_stock' ? '✅ Stokta' : p.stockStatus === 'low_stock' ? '⚠️ Az Stok' : '❌ Tükendi';
      const stockColor = p.stockStatus === 'in_stock' ? C.green : p.stockStatus === 'low_stock' ? C.amber : C.red;

      const values = [
        idx + 1,
        p.name,
        p.category,
        p.supplier.name,
        p.price,
        p.unit,
        stockLabel,
        new Date(p.lastUpdated).toLocaleDateString('tr-TR'),
        p.source || '—',
      ];

      values.forEach((v, i) => {
        const cell = row.getCell(i + 1);
        cell.value = v;
        cell.fill = darkFill(bg);
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };

        if (i === 4) {
          // Price column — blue bold
          cell.font = { color: { argb: C.accent }, size: 10, name: 'Segoe UI', bold: true };
          cell.numFmt = '#,##0.00';
        } else if (i === 6) {
          // Stock column — colored
          cell.font = { color: { argb: stockColor }, size: 10, name: 'Segoe UI', bold: true };
        } else {
          cell.font = dataFont;
        }
      });
    });
  }

  // ---- Price Ranking Sheet ----
  private static buildPriceRanking(wb: ExcelJS.Workbook, products: Product[]) {
    const ws = wb.addWorksheet('Fiyat Sıralaması', {
      properties: { tabColor: { argb: C.amber } },
    });

    const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;
    const sorted = [...products].sort((a, b) => a.price - b.price);

    const headers = ['Sıra', 'Ürün', 'Fiyat (TRY)', 'Tedarikçi', 'Kategori', 'Fark (Ort.)'];
    const widths = [6, 35, 14, 25, 18, 12];

    const headerRow = ws.getRow(1);
    headerRow.height = 30;
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = headerFont;
      cell.fill = darkFill(C.headerBg);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
      ws.getColumn(i + 1).width = widths[i];
    });

    sorted.forEach((p, idx) => {
      const row = ws.getRow(idx + 2);
      const bg = idx % 2 === 0 ? C.dark : C.darkBg;
      const diff = ((p.price - avgPrice) / avgPrice * 100);
      const diffColor = diff >= 0 ? C.red : C.green;

      const values = [
        idx + 1,
        p.name,
        p.price,
        p.supplier.name,
        p.category,
        `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
      ];

      values.forEach((v, i) => {
        const cell = row.getCell(i + 1);
        cell.value = v;
        cell.fill = darkFill(bg);
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };

        if (i === 2) {
          cell.font = { color: { argb: C.accent }, size: 10, name: 'Segoe UI', bold: true };
          cell.numFmt = '#,##0.00';
        } else if (i === 5) {
          cell.font = { color: { argb: diffColor }, size: 10, name: 'Segoe UI', bold: true };
        } else {
          cell.font = dataFont;
        }
      });


    });
  }

  // ---- Spec Comparison Sheet ----
  private static buildSpecComparison(wb: ExcelJS.Workbook, products: Product[]) {
    const allSpecs = Array.from(new Set(products.flatMap(p => p.specifications.map(s => s.key))));
    if (allSpecs.length === 0) return;

    const ws = wb.addWorksheet('Özellik Karşılaştırma', {
      properties: { tabColor: { argb: 'FF8844' } },
    });

    ws.getColumn(1).width = 22;
    products.forEach((_, i) => { ws.getColumn(i + 2).width = 28; });

    // Header
    const headerRow = ws.getRow(1);
    headerRow.height = 30;

    const hCell = headerRow.getCell(1);
    hCell.value = 'Özellik';
    hCell.font = headerFont;
    hCell.fill = darkFill(C.headerBg);
    hCell.alignment = { horizontal: 'center', vertical: 'middle' };
    hCell.border = thinBorder;

    products.forEach((p, i) => {
      const cell = headerRow.getCell(i + 2);
      cell.value = p.name;
      cell.font = headerFont;
      cell.fill = darkFill(C.headerBg);
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });

    // Data
    allSpecs.forEach((spec, idx) => {
      const row = ws.getRow(idx + 2);
      const bg = idx % 2 === 0 ? C.dark : C.darkBg;

      const keyCell = row.getCell(1);
      keyCell.value = spec;
      keyCell.font = { ...dataFont, bold: true };
      keyCell.fill = darkFill(bg);
      keyCell.border = thinBorder;

      products.forEach((p, i) => {
        const s = p.specifications.find(sp => sp.key === spec);
        const cell = row.getCell(i + 2);
        cell.value = s ? `${s.value} ${s.unit || ''}`.trim() : '—';
        cell.font = s ? dataFont : mutedFont;
        cell.fill = darkFill(bg);
        cell.alignment = { horizontal: 'center' };
        cell.border = thinBorder;
      });
    });
  }

  // ---- Comparison Report ----
  private static buildComparisonReport(wb: ExcelJS.Workbook, products: Product[]) {
    const ws = wb.addWorksheet('Karşılaştırma', {
      properties: { tabColor: { argb: C.accent } },
    });

    const minPrice = Math.min(...products.map(p => p.price));

    const headers = ['Ürün', 'Fiyat', 'Birim', 'Stok', 'Tedarikçi', 'Karşılaştırma'];
    const widths = [35, 18, 10, 14, 25, 22];

    const headerRow = ws.getRow(1);
    headerRow.height = 30;
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = headerFont;
      cell.fill = darkFill(C.headerBg);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
      ws.getColumn(i + 1).width = widths[i];
    });

    const maxPrice = Math.max(...products.map(p => p.price));
    const savingPct = (((maxPrice - minPrice) / maxPrice) * 100).toFixed(0);

    products.forEach((p, idx) => {
      const row = ws.getRow(idx + 2);
      const bg = idx % 2 === 0 ? C.dark : C.darkBg;
      const isBest = p.price === minPrice;

      const values = [
        p.name,
        `${p.price.toLocaleString('tr-TR')} TRY`,
        p.unit,
        p.stockStatus === 'in_stock' ? '✅ Stokta' : p.stockStatus === 'low_stock' ? '⚠️ Az Stok' : '❌ Tükendi',
        p.supplier.name,
        isBest ? `⭐ En İyi (%${savingPct} uygun)` : `+${(((p.price - minPrice) / minPrice) * 100).toFixed(1)}%`,
      ];

      values.forEach((v, i) => {
        const cell = row.getCell(i + 1);
        cell.value = v;
        cell.fill = darkFill(isBest ? '0A2E0A' : bg);
        cell.border = thinBorder;
        cell.font = i === 5 && isBest
          ? { color: { argb: C.green }, size: 10, name: 'Segoe UI', bold: true }
          : dataFont;
      });
    });
  }

  // ================================================
  // CSV Export (uses xlsx for simplicity)
  // ================================================
  static exportToCSV(products: Product[]): void {
    const sep = ';';
    const headers = ['Ürün', 'Kategori', 'Tedarikçi', 'Fiyat', 'Birim', 'Stok', 'Kaynak', 'Güncelleme'];
    const rows = products.map(p => [
      p.name,
      p.category,
      p.supplier.name,
      p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TRY',
      p.unit,
      p.stockStatus === 'in_stock' ? 'Stokta' : p.stockStatus === 'low_stock' ? 'Az Stok' : 'Tükendi',
      p.source || '-',
      new Date(p.lastUpdated).toLocaleDateString('tr-TR'),
    ].join(sep));

    const csv = '\uFEFF' + [headers.join(sep), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Urunler_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ================================================
  // PDF — Premium HTML Dashboard Report
  // ================================================
  static exportToPDF(products: Product[]): void {
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    const categories = [...new Set(products.map(p => p.category))];
    const suppliers = [...new Set(products.map(p => p.supplier.name))];
    const inStock = products.filter(p => p.stockStatus === 'in_stock').length;
    const lowStock = products.filter(p => p.stockStatus === 'low_stock').length;
    const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length;
    const sorted = [...products].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const expensive = sorted[sorted.length - 1];
    const savingPct = (((expensive.price - cheapest.price) / expensive.price) * 100).toFixed(0);
    const now = new Date();

    const catStats = categories.map(c => {
      const ps = products.filter(p => p.category === c);
      return { name: c, count: ps.length, avg: ps.reduce((s, p) => s + p.price, 0) / ps.length };
    });

    const suppStats = suppliers.map(s => {
      const ps = products.filter(p => p.supplier.name === s);
      return { name: s, count: ps.length, avg: ps.reduce((s2, p) => s2 + p.price, 0) / ps.length, rating: ps[0].supplier.rating || 0 };
    });

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<title>Ürün Raporu — ${now.toLocaleDateString('tr-TR')}</title>
<style>
  @page { margin: 20mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a0f; color: #e0e0e0; font-size: 13px; line-height: 1.5; }
  .brand-bar { height: 4px; background: linear-gradient(90deg, #0066FF, #00CC66, #FFAA00, #FF4444); }
  .header { padding: 28px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .header h1 { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .header .sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
  .header .date-badge { display: inline-block; margin-top: 10px; padding: 4px 14px; border-radius: 20px; background: rgba(0,102,255,0.1); border: 1px solid rgba(0,102,255,0.15); color: #4d9aff; font-size: 11px; font-weight: 600; }
  .page { padding: 24px 32px; }
  .insight { background: linear-gradient(135deg, rgba(0,102,255,0.08), rgba(0,204,102,0.06)); border: 1px solid rgba(0,102,255,0.12); border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; }
  .insight p { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }
  .insight strong { color: #fff; }
  .hl { color: #0066FF; font-weight: 700; }
  .hlg { color: #00CC66; font-weight: 700; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 28px; }
  .stat { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 16px; text-align: center; }
  .stat .val { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.2; }
  .stat .lbl { font-size: 10px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
  .blue .val { color: #0066FF; } .green .val { color: #00CC66; } .amber .val { color: #FFAA00; } .red .val { color: #FF4444; }
  .stock-bars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
  .sbar { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px 16px; }
  .sbar .bl { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
  .sbar .bl span:first-child { color: rgba(255,255,255,0.6); }
  .sbar .bl span:last-child { font-weight: 700; }
  .sbar .bt { height: 6px; background: rgba(255,255,255,0.04); border-radius: 3px; overflow: hidden; border: 1px solid rgba(150,150,150,0.3); }
  .sbar .bf { height: 100%; border-radius: 3px; }
  .bg { background: #00CC66; } .ba { background: #FFAA00; } .br { background: #FF4444; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .section h2 { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .cgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .cc { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px 16px; }
  .cc .nm { font-weight: 600; color: #fff; font-size: 14px; }
  .cc .mt { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 4px; }
  .cc .av { font-size: 18px; font-weight: 700; color: #0066FF; margin-top: 6px; }
  .sgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
  .sc { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
  .sc .l .nm { font-weight: 600; color: #fff; }
  .sc .l .ct { font-size: 11px; color: rgba(255,255,255,0.35); }
  .sc .r { text-align: right; }
  .sc .r .av { font-size: 16px; font-weight: 700; color: #FFAA00; }
  .sc .r .rt { font-size: 11px; color: rgba(255,255,255,0.4); }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { text-align: left; padding: 8px 12px; font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; }
  td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.025); }
  .zb td { background: rgba(255,255,255,0.015); }
  .best td { background: rgba(0,204,102,0.04); }
  .worst td { background: rgba(255,68,68,0.03); }
  .price { font-weight: 700; color: #0066FF; font-size: 13px; }
  .bdg { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .bdg-g { background: rgba(0,204,102,0.1); color: #00CC66; }
  .bdg-a { background: rgba(255,170,0,0.1); color: #FFAA00; }
  .bdg-r { background: rgba(255,68,68,0.1); color: #FF4444; }
  .btag { font-size: 10px; color: #00CC66; font-weight: 600; margin-left: 6px; }
  .wtag { font-size: 10px; color: #FF4444; font-weight: 600; margin-left: 6px; }
  .dc { display: flex; align-items: center; gap: 8px; }
  .db { height: 4px; border-radius: 2px; min-width: 2px; }
  .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center; font-size: 10px; color: rgba(255,255,255,0.2); }
  @media print {
    body { background: #fff; color: #333; }
    .brand-bar, .bg, .ba, .br, .db { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .stat, .sbar, .cc, .sc { background: #f8f8f8; border-color: #eee; }
    .stat .val, .cc .nm, .sc .l .nm { color: #222; }
    .blue .val { color: #0055DD; } .green .val { color: #008833; } .amber .val { color: #BB7700; } .red .val { color: #FF3333; }
    .stat .lbl, .sbar .bl span:first-child, .cc .mt, .sc .l .ct, .sc .r .rt { color: #888; }
    .header h1 { color: #111; } .header .sub { color: #999; }
    .section h2 { color: #666; border-bottom-color: #eee; }
    th { color: #999; border-bottom-color: #eee; } td { border-bottom-color: #f0f0f0; color: #333; }
    .price { color: #0055DD; }
    .insight { background: #f0f7ff; border-color: #d0e3ff; } .insight p { color: #444; } .insight strong { color: #111; }
    .footer { border-top-color: #eee; color: #ccc; }
    .zb td { background: #fafafa; }
    .best td, .worst td { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .bdg-g, .bdg-a, .bdg-r { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .sbar .bt { background: #eee; }
  }
</style>
</head>
<body>
  <div class="brand-bar"></div>
  <div class="header">
    <h1>Endüstriyel Tekstil — Ürün Raporu</h1>
    <p class="sub">Otomatik oluşturulan fiyat ve stok analiz raporu</p>
    <span class="date-badge">${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
  </div>
  <div class="page">
    <div class="insight">
      <p>💡 Toplam <strong>${products.length} ürün</strong> analiz edildi. En uygun fiyat <span class="hl">${cheapest.name}</span> ürününde (<span class="hlg">${cheapest.price.toLocaleString('tr-TR')} ${cheapest.currency}</span>), en pahalı ürüne göre <span class="hlg">%${savingPct} daha uygun</span>. Ortalama fiyat <span class="hl">${avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</span>.${outOfStock > 0 ? ` ⚠️ <strong>${outOfStock} ürün</strong> şu an stokta bulunmuyor.` : ''}</p>
    </div>
    <div class="stats">
      <div class="stat"><div class="val">${products.length}</div><div class="lbl">Toplam Ürün</div></div>
      <div class="stat blue"><div class="val">${Math.min(...products.map(p => p.price)).toLocaleString('tr-TR')} ₺</div><div class="lbl">En Düşük Fiyat</div></div>
      <div class="stat amber"><div class="val">${avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div><div class="lbl">Ortalama Fiyat</div></div>
      <div class="stat red"><div class="val">${Math.max(...products.map(p => p.price)).toLocaleString('tr-TR')} ₺</div><div class="lbl">En Yüksek Fiyat</div></div>
    </div>
    <div class="stock-bars">
      <div class="sbar"><div class="bl"><span>Stokta</span><span style="color:#00CC66">${inStock} (${((inStock / products.length) * 100).toFixed(0)}%)</span></div><div class="bt"><div class="bf bg" style="width:${(inStock / products.length) * 100}%"></div></div></div>
      <div class="sbar"><div class="bl"><span>Az Stok</span><span style="color:#FFAA00">${lowStock} (${((lowStock / products.length) * 100).toFixed(0)}%)</span></div><div class="bt"><div class="bf ba" style="width:${(lowStock / products.length) * 100}%"></div></div></div>
      <div class="sbar"><div class="bl"><span>Tükendi</span><span style="color:#FF4444">${outOfStock} (${((outOfStock / products.length) * 100).toFixed(0)}%)</span></div><div class="bt"><div class="bf br" style="width:0%"></div></div></div>
    </div>
    <div class="section"><h2>Kategori Dağılımı</h2><div class="cgrid">${catStats.map(c => `<div class="cc"><div class="nm">${c.name}</div><div class="mt">${c.count} ürün</div><div class="av">Ort: ${c.avg.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div></div>`).join('')}</div></div>
    <div class="section"><h2>Tedarikçiler</h2><div class="sgrid">${suppStats.map(s => `<div class="sc"><div class="l"><div class="nm">${s.name}</div><div class="ct">${s.count} ürün${s.rating ? ` • ⭐ ${s.rating}/5` : ''}</div></div><div class="r"><div class="av">${s.avg.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div><div class="rt">ort. fiyat</div></div></div>`).join('')}</div></div>
    <div class="section"><h2>Ürün Listesi</h2><table><thead><tr><th>#</th><th>Ürün</th><th>Kategori</th><th>Tedarikçi</th><th>Fiyat</th><th>Stok</th></tr></thead><tbody>${products.map((p, i) => {
      const isBest = p.price === cheapest.price;
      const isWorst = p.price === expensive.price;
      const cls = isBest ? 'best' : isWorst ? 'worst' : i % 2 === 1 ? 'zb' : '';
      const tag = isBest ? '<span class="btag">En İyi</span>' : isWorst ? '<span class="wtag">En Pahalı</span>' : '';
      const bc = p.stockStatus === 'in_stock' ? 'bdg-g' : p.stockStatus === 'low_stock' ? 'bdg-a' : 'bdg-r';
      const st = p.stockStatus === 'in_stock' ? 'Stokta' : p.stockStatus === 'low_stock' ? 'Az Stok' : 'Tükendi';
      return `<tr class="${cls}"><td>${i + 1}</td><td><strong>${p.name}</strong>${tag}</td><td>${p.category}</td><td>${p.supplier.name}</td><td class="price">${p.price.toLocaleString('tr-TR')} ${p.currency}/${p.unit}</td><td><span class="bdg ${bc}">${st}</span></td></tr>`;
    }).join('')}</tbody></table></div>
    <div class="section" style="page-break-before:auto"><h2>Fiyat Sıralaması (Düşükten Yükseğe)</h2><table><thead><tr><th>Sıra</th><th>Ürün</th><th>Fiyat</th><th>Ortalamaya Göre</th></tr></thead><tbody>${sorted.map((p, i) => {
      const diff = ((p.price - avgPrice) / avgPrice * 100);
      const color = diff >= 0 ? '#FF6644' : '#00CC66';
      const barW = Math.min(Math.abs(diff), 80);
      const cls = i % 2 === 1 ? 'zb' : '';
      return `<tr class="${cls}"><td>${i + 1}</td><td>${p.name}</td><td class="price">${p.price.toLocaleString('tr-TR')} ${p.currency}</td><td><div class="dc"><div class="db" style="width:${barW}px;background:${color}"></div><span style="color:${color};font-weight:600">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%</span></div></td></tr>`;
    }).join('')}</tbody></table></div>
  </div>
  <div class="footer">Endüstriyel Karşılaştırma • Otomatik Rapor • ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
  <script>window.onload = function() { window.print(); };</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  // ================================================
  // PDF — Comparison Report
  // ================================================
  static exportComparisonPDF(products: Product[]): void {
    if (products.length < 2) return;

    const minPrice = Math.min(...products.map(p => p.price));
    const maxPrice = Math.max(...products.map(p => p.price));
    const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;
    const cheapest = products.find(p => p.price === minPrice)!;
    const savingPct = (((maxPrice - minPrice) / maxPrice) * 100).toFixed(0);
    const allSpecs = Array.from(new Set(products.flatMap(p => p.specifications.map(s => s.key))));
    const now = new Date();

    const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"/>
<title>Karşılaştırma Raporu — ${now.toLocaleDateString('tr-TR')}</title>
<style>
  @page { margin: 18mm 12mm; }
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,sans-serif; background:#0a0a0f; color:#e0e0e0; font-size:13px; line-height:1.5; }
  .bb { height:4px; background:linear-gradient(90deg,#0066FF,#00CC66,#FFAA00); }
  .hd { padding:24px 28px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.04); }
  .hd h1 { font-size:20px; font-weight:700; color:#fff; }
  .hd .sub { font-size:12px; color:rgba(255,255,255,0.35); margin-top:4px; }
  .hd .db { display:inline-block; margin-top:8px; padding:3px 12px; border-radius:16px; background:rgba(0,102,255,0.1); border:1px solid rgba(0,102,255,0.15); color:#4d9aff; font-size:11px; font-weight:600; }
  .pg { padding:20px 28px; }
  .ins { background:linear-gradient(135deg,rgba(0,102,255,0.08),rgba(0,204,102,0.06)); border:1px solid rgba(0,102,255,0.12); border-radius:10px; padding:14px 18px; margin-bottom:24px; }
  .ins p { font-size:13px; color:rgba(255,255,255,0.7); }
  .ins strong { color:#fff; }
  .hl { color:#0066FF; font-weight:700; }
  .hlg { color:#00CC66; font-weight:700; }
  .sec { margin-bottom:24px; page-break-inside:avoid; }
  .sec h2 { font-size:12px; font-weight:600; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.04); }
  .cards { display:grid; grid-template-columns:repeat(${Math.min(products.length, 4)},1fr); gap:10px; }
  .cd { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:16px; position:relative; }
  .cd.win { border-color:rgba(0,204,102,0.2); background:rgba(0,204,102,0.03); }
  .cd .nm { font-size:14px; font-weight:600; color:#fff; margin-bottom:2px; }
  .cd .cat { font-size:11px; color:rgba(255,255,255,0.3); }
  .cd .pr { font-size:22px; font-weight:700; color:#0066FF; margin:8px 0 4px; }
  .cd.win .pr { color:#00CC66; }
  .cd .un { font-size:12px; color:rgba(255,255,255,0.3); }
  .cd .su { font-size:12px; color:rgba(255,255,255,0.4); margin-top:6px; }
  .cd .tg { position:absolute; top:10px; right:10px; font-size:10px; font-weight:600; padding:2px 8px; border-radius:6px; }
  .tg-best { background:rgba(0,204,102,0.1); color:#00CC66; }
  .tg-diff { background:rgba(255,102,68,0.1); color:#FF6644; }
  .cd .sk { display:inline-block; padding:2px 6px; border-radius:4px; font-size:11px; font-weight:500; margin-top:6px; }
  .sk-g { background:rgba(0,204,102,0.08); color:#00CC66; }
  .sk-a { background:rgba(255,170,0,0.08); color:#FFAA00; }
  .sk-r { background:rgba(255,68,68,0.08); color:#FF4444; }
  table { width:100%; border-collapse:collapse; }
  th { padding:8px 12px; font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.04em; text-align:left; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); font-weight:600; }
  td { padding:8px 12px; font-size:12px; color:rgba(255,255,255,0.65); border-bottom:1px solid rgba(255,255,255,0.02); }
  .zb td { background:rgba(255,255,255,0.012); }
  .kc { font-weight:600; color:rgba(255,255,255,0.5); }
  .tw { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; overflow:hidden; }
  .ft { padding:16px 28px; border-top:1px solid rgba(255,255,255,0.04); text-align:center; font-size:10px; color:rgba(255,255,255,0.2); }
  @media print {
    body { background:#fff; color:#333; }
    .bb { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    .cd, .tw { background:#f8f8f8; border-color:#eee; }
    .cd .nm { color:#111; } .cd .cat, .cd .su { color:#888; }
    .cd .pr { color:#0055DD; } .cd.win .pr { color:#008833; }
    .hd h1 { color:#111; } .hd .sub { color:#999; }
    .sec h2 { color:#666; border-bottom-color:#eee; }
    th { color:#999; border-bottom-color:#eee; background:#fafafa; }
    td { color:#333; border-bottom-color:#f0f0f0; }
    .ins { background:#f0f7ff; border-color:#d0e3ff; } .ins p { color:#444; } .ins strong { color:#111; }
    .ft { border-top-color:#eee; color:#ccc; }
    .sk-g, .sk-a, .sk-r, .tg-best, .tg-diff { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  }
</style></head>
<body>
  <div class="bb"></div>
  <div class="hd">
    <h1>Ürün Karşılaştırma Raporu</h1>
    <p class="sub">${products.length} ürün yan yana karşılaştırılıyor</p>
    <span class="db">${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
  </div>
  <div class="pg">
    <div class="ins">
      <p>💡 <strong>${products.length} ürün</strong> karşılaştırıldı. En uygun fiyat <span class="hl">${cheapest.name}</span> ürününde (<span class="hlg">${cheapest.price.toLocaleString('tr-TR')} ${cheapest.currency}</span>). En pahalı ürüne göre <span class="hlg">%${savingPct} tasarruf</span> sağlanabilir.</p>
    </div>
    <div class="sec"><h2>Ürünler</h2>
      <div class="cards">
        ${products.map(p => {
      const diff = ((p.price - minPrice) / minPrice * 100);
      const isWin = p.price === minPrice;
      const skCls = p.stockStatus === 'in_stock' ? 'sk-g' : p.stockStatus === 'low_stock' ? 'sk-a' : 'sk-r';
      const skTxt = p.stockStatus === 'in_stock' ? 'Stokta' : p.stockStatus === 'low_stock' ? 'Az Stok' : 'Tükendi';
      return `<div class="cd${isWin ? ' win' : ''}">
            ${isWin ? `<span class="tg tg-best">⭐ En İyi (%${savingPct} uygun)</span>` : `<span class="tg tg-diff">+${diff.toFixed(1)}%</span>`}
            <div class="nm">${p.name}</div>
            <div class="cat">${p.category}</div>
            <div class="pr">${p.price.toLocaleString('tr-TR')} <span style="font-size:14px">${p.currency}</span></div>
            <div class="un">/ ${p.unit}</div>
            <div class="su">${p.supplier.name}</div>
            <span class="sk ${skCls}">${skTxt}</span>
          </div>`;
    }).join('')}
      </div>
    </div>
    ${allSpecs.length > 0 ? `
    <div class="sec"><h2>Özellik Karşılaştırması</h2>
      <div class="tw"><table>
        <thead><tr><th>Özellik</th>${products.map(p => `<th>${p.name}</th>`).join('')}</tr></thead>
        <tbody>${allSpecs.map((key, i) => {
      const cls = i % 2 === 1 ? ' class="zb"' : '';
      return `<tr${cls}><td class="kc">${key}</td>${products.map(p => {
        const s = p.specifications.find(sp => sp.key === key);
        return `<td>${s ? `${s.value} ${s.unit || ''}`.trim() : '<span style="color:rgba(255,255,255,0.15)">—</span>'}</td>`;
      }).join('')}</tr>`;
    }).join('')}</tbody>
      </table></div>
    </div>` : ''}
    <div class="sec"><h2>Fiyat Karşılaştırması</h2>
      <div class="tw"><table>
        <thead><tr><th>Ürün</th><th>Fiyat</th><th>Ortalamaya Göre</th><th>En Ucuza Göre</th></tr></thead>
        <tbody>${products.sort((a, b) => a.price - b.price).map((p, i) => {
      const avgDiff = ((p.price - avgPrice) / avgPrice * 100);
      const minDiff = ((p.price - minPrice) / minPrice * 100);
      const cls = i % 2 === 1 ? ' class="zb"' : '';
      const avgColor = avgDiff >= 0 ? '#FF6644' : '#00CC66';
      const minColor = minDiff === 0 ? '#00CC66' : '#FF6644';
      return `<tr${cls}>
            <td style="font-weight:600;color:rgba(255,255,255,0.8)">${p.name}</td>
            <td style="font-weight:700;color:#0066FF">${p.price.toLocaleString('tr-TR')} ${p.currency}</td>
            <td style="color:${avgColor};font-weight:600">${avgDiff >= 0 ? '+' : ''}${avgDiff.toFixed(1)}%</td>
            <td style="color:${minColor};font-weight:600">${minDiff === 0 ? 'En Ucuz' : `+${minDiff.toFixed(1)}%`}</td>
          </tr>`;
    }).join('')}</tbody>
      </table></div>
    </div>
  </div>
  <div class="ft">Endüstriyel Karşılaştırma • Karşılaştırma Raporu • ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
  <script>window.onload = function() { window.print(); };</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

export default ExportService;


