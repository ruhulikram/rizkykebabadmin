/**
 * pdf-export.js - Generator Slip Gaji PDF Kebab Rizki
 * Menghasilkan format cetak fisik struk slip gaji sesuai template:
 * - NAMA & TGL
 * - PERIODE TANGGAL
 * - MASUK, LEMBUR, LIBUR
 * - KERAJINAN, BONUS BULANAN, PERAWATAN MOTOR, TUNJANGAN PULSA
 * - TOTAL, TUNGGAKAN, TERIMA
 * - TTD KARYAWAN
 */

const PDFExport = {
  /**
   * Format mata uang Rupiah
   */
  formatRupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  },

  /**
   * Helper Terbilang Rupiah sederhana
   */
  terbilang(angka) {
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    angka = Math.floor(angka);
    if (angka < 12) return bilangan[angka];
    if (angka < 20) return this.terbilang(angka - 10) + ' Belas';
    if (angka < 100) return this.terbilang(Math.floor(angka / 10)) + ' Puluh ' + this.terbilang(angka % 10);
    if (angka < 200) return 'Seratus ' + this.terbilang(angka - 100);
    if (angka < 1000) return this.terbilang(Math.floor(angka / 100)) + ' Ratus ' + this.terbilang(angka % 100);
    if (angka < 2000) return 'Seribu ' + this.terbilang(angka - 1000);
    if (angka < 1000000) return this.terbilang(Math.floor(angka / 1000)) + ' Ribu ' + this.terbilang(angka % 1000);
    if (angka < 1000000000) return this.terbilang(Math.floor(angka / 1000000)) + ' Juta ' + this.terbilang(angka % 1000000);
    return 'Rp ' + angka.toLocaleString('id-ID');
  },

  /**
   * Export Slip Gaji ke PDF Sesuai Format Struk Fisik
   * @param {Object} data - Objek rincian slip gaji
   */
  exportSlipGaji(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('Library jsPDF belum termuat. Periksa koneksi internet Anda.');
      return;
    }

    const { jsPDF } = window.jspdf;
    
    // Gunakan format A5 (148 x 210 mm) yang pas untuk struk slip gaji fisik
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    const pageWidth = 148;
    const pageHeight = 210;
    
    const cardX = 14;
    const cardY = 12;
    const cardW = pageWidth - (cardX * 2); // 120 mm
    const cardH = 186;

    // === 1. BINGKAI LUAR UTAMA (Double line / clean black border) ===
    doc.setDrawColor(15, 23, 42); // Black / Dark Slate
    doc.setLineWidth(0.7);
    doc.rect(cardX, cardY, cardW, cardH);

    // === 2. KOTAK HEADER ATAS (NAMA & TGL) ===
    const headerBoxH = 18;
    doc.setLineWidth(0.5);
    doc.rect(cardX, cardY, cardW, headerBoxH);

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    
    // Format TGL (DD-MM-YYYY)
    let displayDate = data.printDate || '19-08-2026';
    if (displayDate.includes('-')) {
      const p = displayDate.split('-');
      if (p.length === 3 && p[0].length === 4) {
        displayDate = `${p[2]}-${p[1]}-${p[0]}`;
      }
    }

    doc.text(`NAMA : ${data.employee.name.toUpperCase()}`, cardX + 5, cardY + 7);
    doc.text(`TGL  : ${displayDate}`, cardX + 5, cardY + 14);

    let currY = cardY + headerBoxH + 10;

    // === 3. JUDUL PERIODE (TENGAH) ===
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    const periodTitle = (data.periodTitle || '15 AGUSTUS 2026').toUpperCase();
    doc.text(periodTitle, pageWidth / 2, currY, { align: 'center' });
    
    // Garis bawah judul periode
    const textWidth = doc.getTextWidth(periodTitle);
    doc.setLineWidth(0.3);
    doc.line((pageWidth / 2) - (textWidth / 2) - 2, currY + 1.5, (pageWidth / 2) + (textWidth / 2) + 2, currY + 1.5);

    currY += 12;

    // === 4. HELPER MENCETAK BARIS RINCIAN DENGAN TITIK-TITIK ===
    const labelX = cardX + 5;
    const valueX = cardX + cardW - 5;
    const rowHeight = 7.2;

    doc.setFontSize(10.5);

    const drawRow = (leftLabel, rightValue, isBold = false) => {
      doc.setFont('courier', isBold ? 'bold' : 'normal');
      doc.text(leftLabel, labelX, currY);
      doc.text(rightValue, valueX, currY, { align: 'right' });
      currY += rowHeight;
    };

    // Format nilai
    const formatRpValue = (num) => `: Rp. ${Number(num || 0).toLocaleString('id-ID')}`;

    // Baris 1: MASUK
    drawRow(`MASUK ............. ${data.daysPresent || 0} HARI`, formatRpValue(data.masukAmount || 0));

    // Baris 2: LEMBUR
    drawRow(`LEMBUR ............ ${data.overtimeDays || 0} HARI`, formatRpValue(data.overtimeAmount || 0));

    // Baris 3: LIBUR
    drawRow(`LIBUR ............. ${data.daysOff || 0} HARI`, '-');

    currY += 3; // Spasi kecil

    // Baris 4: KERAJINAN
    drawRow('KERAJINAN', formatRpValue(data.kerajinan || 0));

    // Baris 5: BONUS BULANAN
    drawRow('BONUS BULANAN', formatRpValue(data.bonusBulanan || 0));

    // Baris 6: PERAWATAN MOTOR
    drawRow('PERAWATAN MOTOR', formatRpValue(data.perawatanMotor || 0));

    // Baris 7: TUNJANGAN PULSA
    drawRow('TUNJANGAN PULSA', formatRpValue(data.tunjanganPulsa || 0));

    currY += 1;

    // === 5. GARIS PEMBATAS TOTAL (Dashed / Solid) ===
    doc.setLineWidth(0.4);
    doc.line(labelX, currY, valueX, currY);
    currY += 5.5;

    // Baris 8: TOTAL
    drawRow('TOTAL', formatRpValue(data.totalGross || 0), true);

    // Baris 9: TUNGGAKAN
    drawRow('TUNGGAKAN', formatRpValue(data.tunggakan || 0), true);

    // Garis atas TERIMA
    doc.setLineWidth(0.5);
    doc.line(labelX, currY, valueX, currY);
    currY += 5.5;

    // Baris 10: TERIMA
    doc.setFont('courier', 'bold');
    doc.setFontSize(11.5);
    doc.text('TERIMA', labelX, currY);
    doc.text(formatRpValue(data.terima || 0), valueX, currY, { align: 'right' });

    currY += 18;

    // === 6. TANDA TANGAN (POJOK KANAN BAWAH) ===
    const signBoxX = cardX + cardW - 38;
    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.text('TTD', signBoxX + 16, currY, { align: 'center' });

    currY += 24;

    // Nama Karyawan untuk TTD (e.g. BAJAY)
    const signName = (data.employee.name.trim().split(' ')[0] || data.employee.name).toUpperCase();
    doc.text(signName, signBoxX + 16, currY, { align: 'center' });
    
    // Garis bawah nama TTD
    const signWidth = doc.getTextWidth(signName);
    doc.line(signBoxX + 16 - (signWidth / 2) - 2, currY + 1.2, signBoxX + 16 + (signWidth / 2) + 2, currY + 1.2);

    // === 7. UNDUH FILE PDF ===
    const cleanName = data.employee.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanPeriod = (data.periodMonth || '2026-08').replace(/[^a-z0-9]/g, '-');
    const filename = `slip-gaji-${cleanName}-${cleanPeriod}.pdf`;

    doc.save(filename);
    return filename;
  }
};

window.PDFExport = PDFExport;
