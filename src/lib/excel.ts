import * as XLSX from 'xlsx';

export const ExcelService = {
  // Export array of objects to Excel .xlsx file
  exportToExcel: (data: any[], fileName: string, sheetName = 'Data') => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      return true;
    } catch (err) {
      console.error('Export Excel error', err);
      return false;
    }
  },

  // Parse an uploaded Excel file
  parseExcelFile: async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  // Download Templates for Import
  downloadTemplate: (type: 'students' | 'classes' | 'supervisors' | 'subjects' | 'rooms') => {
    let templateData: any[] = [];
    let filename = `Template_Import_${type}`;

    if (type === 'students') {
      templateData = [
        {
          NIS: '23241099',
          NISN: '0061234999',
          Nama_Lengkap: 'Budi Santoso Contoh',
          Jenis_Kelamin: 'L',
          Tempat_Lahir: 'Depok',
          Tanggal_Lahir: '2008-05-12',
          Kode_Kelas: 'XII-TKJ',
          Jurusan: 'Teknik Komputer & Jaringan',
          Nomor_Peserta: '099/XII-TKJ/US/2026',
          Status: 'AKTIF',
          Keterangan: 'Siswa Reguler'
        }
      ];
    } else if (type === 'rooms') {
      templateData = [
        {
          Kode_Ruang: 'R-04',
          Nama_Ruang: 'Ruang Teori 04',
          Gedung: 'Gedung A',
          Lantai: 2,
          Kapasitas: 32,
          Jumlah_Komputer: 0,
          Jumlah_Meja: 32,
          Jumlah_Kursi: 32,
          Status: 'Aktif',
          Keterangan: 'Ruang kelas cadangan'
        }
      ];
    } else if (type === 'classes') {
      templateData = [
        {
          Kode_Kelas: 'XII-TITL',
          Nama_Kelas: 'XII TITL',
          Tingkat: 12,
          Program_Keahlian: 'Teknik Instalasi Tenaga Listrik',
          Wali_Kelas: 'Drs. Supriyanto',
          Kapasitas: 36,
          Status_Aktif: 'YA'
        }
      ];
    } else if (type === 'supervisors') {
      templateData = [
        {
          NIP: '19870512 201201 1 009',
          Nama_Pengawas: 'Farhan Maulana, S.Pd',
          Jenis_Kelamin: 'L',
          Mata_Pelajaran: 'Fisika',
          Nomor_HP: '081299887766',
          Status: 'Aktif',
          Keterangan: 'Pengawas Ruang Cadangan'
        }
      ];
    } else if (type === 'subjects') {
      templateData = [
        {
          Kode_Mapel: 'KIM-01',
          Nama_Mata_Pelajaran: 'Kimia Terapan',
          Kelompok: 'Peminatan Kejuruan',
          Tingkat: 12,
          Durasi_Menit: 90,
          Status_Aktif: 'YA'
        }
      ];
    }

    ExcelService.exportToExcel(templateData, filename, 'Template');
  }
};
