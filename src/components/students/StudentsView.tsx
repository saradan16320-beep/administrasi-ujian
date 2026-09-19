import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Printer,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  IdCard,
  X
} from 'lucide-react';
import { Student, ClassItem, SchoolSetting, StudentStatus } from '../../types';
import { StorageService } from '../../lib/storage';
import { ExcelService } from '../../lib/excel';
import { PrintHeader } from '../common/PrintHeader';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface StudentsViewProps {
  students: Student[];
  classes: ClassItem[];
  settings: SchoolSetting;
  onRefresh: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  settings,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Bulk delete state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [printCardsFor, setPrintCardsFor] = useState<Student[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form inputs
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formPob, setFormPob] = useState('Depok');
  const [formDob, setFormDob] = useState('2008-01-01');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formMajor, setFormMajor] = useState(classes[0]?.major || '');
  const [formExamNumber, setFormExamNumber] = useState('');
  const [formStatus, setFormStatus] = useState<StudentStatus>('AKTIF');
  const [formNotes, setFormNotes] = useState('');

  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Filtered
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.examNumber && s.examNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchClass = classFilter === 'ALL' || s.classId === classFilter;
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchTerm, classFilter, statusFilter]);

  // Paginated
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormNis(`2324${1000 + students.length + 1}`);
    setFormNisn(`006${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormName('');
    setFormGender('L');
    setFormPob('Depok');
    setFormDob('2008-05-15');
    setFormClassId(classes[0]?.id || '');
    setFormMajor(classes[0]?.major || '');
    setFormExamNumber('');
    setFormStatus('AKTIF');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormNis(s.nis);
    setFormNisn(s.nisn);
    setFormName(s.name);
    setFormGender(s.gender);
    setFormPob(s.birthPlace || '');
    setFormDob(s.birthDate || '');
    setFormClassId(s.classId);
    setFormMajor(s.major || '');
    setFormExamNumber(s.examNumber || '');
    setFormStatus(s.status);
    setFormNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleClassChange = (selectedClassId: string) => {
    setFormClassId(selectedClassId);
    const cls = classMap.get(selectedClassId);
    if (cls) {
      setFormMajor(cls.major);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Student = {
      id: editingStudent ? editingStudent.id : `stu-${Date.now()}`,
      nis: formNis.trim(),
      nisn: formNisn.trim(),
      name: formName.trim(),
      gender: formGender,
      birthPlace: formPob.trim(),
      birthDate: formDob,
      classId: formClassId,
      major: formMajor.trim(),
      examNumber: formExamNumber.trim() || `0${students.length + 1}/US/2026`,
      status: formStatus,
      notes: formNotes.trim(),
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const res = StorageService.saveStudent(item);
    if (res && !res.success) {
      setErrorMessage(res.message || 'Gagal menyimpan data siswa.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage(`Siswa ${item.name} berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus data siswa ${name}?`)) {
      StorageService.deleteStudent(id);
      setSelectedStudentIds((prev) => prev.filter((item) => item !== id));
      onRefresh();
      setSuccessMessage(`Data siswa ${name} berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filtered.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filtered.map((s) => s.id));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (students.length === 0) return;
    setIsDeleteAll(true);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    setIsDeleteAll(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllStudents();
      setSelectedStudentIds([]);
      onRefresh();
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 4000);
    } else {
      const res = StorageService.deleteMultipleStudents(selectedStudentIds);
      setSelectedStudentIds([]);
      onRefresh();
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 4000);
    }
  };

  const handlePrintSelectedCards = () => {
    const selected = students.filter((s) => selectedStudentIds.includes(s.id));
    if (selected.length > 0) {
      setPrintCardsFor(selected);
    }
  };

  const handleGenerateExamNumbers = () => {
    if (window.confirm('Buat nomor peserta otomatis untuk seluruh siswa aktif?')) {
      StorageService.generateExamNumbers(settings.examNumberFormat, students, classes);
      onRefresh();
      setSuccessMessage('Berhasil generate nomor peserta otomatis.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleExportExcel = () => {
    const data = filtered.map((s, i) => {
      const cls = classMap.get(s.classId);
      return {
        No: i + 1,
        NIS: s.nis,
        NISN: s.nisn,
        Nama_Lengkap: s.name,
        L_P: s.gender,
        Tempat_Lahir: s.birthPlace || '-',
        Tanggal_Lahir: s.birthDate || '-',
        Kelas: cls ? cls.name : s.classId,
        Jurusan: s.major,
        Nomor_Peserta: s.examNumber,
        Status: s.status,
        Keterangan: s.notes || '-'
      };
    });
    ExcelService.exportToExcel(data, `Data_Siswa_${settings.schoolName}`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await ExcelService.parseExcelFile(file);
      if (rows.length === 0) {
        alert('File Excel kosong.');
        return;
      }

      let count = 0;
      rows.forEach((row: any) => {
        const nis = row['NIS'] || row['nis'];
        const name = row['Nama_Lengkap'] || row['Nama'] || row['name'];
        if (nis && name) {
          const classCode = row['Kode_Kelas'] || row['Kelas'];
          const matchedClass = classes.find(
            (c) => c.code === classCode || c.name === classCode
          );
          const stu: Student = {
            id: `stu-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            nis: String(nis),
            nisn: String(row['NISN'] || row['nisn'] || ''),
            name: String(name),
            gender: (row['Jenis_Kelamin'] || row['L_P'] || 'L') === 'P' ? 'P' : 'L',
            birthPlace: row['Tempat_Lahir'] || '',
            birthDate: row['Tanggal_Lahir'] || '',
            classId: matchedClass ? matchedClass.id : classes[0]?.id || '',
            major: row['Jurusan'] || matchedClass?.major || '',
            examNumber: row['Nomor_Peserta'] || '',
            status: (row['Status'] as any) || 'AKTIF',
            notes: row['Keterangan'] || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          StorageService.saveStudent(stu);
          count++;
        }
      });
      onRefresh();
      setSuccessMessage(`Berhasil impor ${count} siswa dari Excel.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal import Excel: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Exam Cards View */}
      {printCardsFor ? (
        <div className="bg-white p-6 max-w-4xl mx-auto text-black">
          <div className="flex justify-end gap-2 mb-4 no-print">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
            >
              Cetak Kartu ({printCardsFor.length} Siswa)
            </button>
            <button
              onClick={() => setPrintCardsFor(null)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
            >
              Kembali
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {printCardsFor.map((stu) => {
              const cls = classMap.get(stu.classId);
              return (
                <div
                  key={stu.id}
                  className="border-2 border-slate-900 rounded-lg p-3.5 bg-white text-xs space-y-2 relative"
                >
                  <div className="text-center border-b border-black pb-2">
                    <p className="font-bold text-[11px] uppercase tracking-wide">
                      {settings.schoolName}
                    </p>
                    <p className="font-extrabold text-sm uppercase text-blue-900">
                      KARTU PESERTA UJIAN SEKOLAH
                    </p>
                    <p className="text-[10px] text-gray-700">
                      Tahun Pelajaran {settings.academicYear}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <div className="w-20 h-24 border border-black rounded flex flex-col items-center justify-center text-[10px] text-gray-500 shrink-0">
                      <span>Pas Foto</span>
                      <span>2 x 3 cm</span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-600">No Peserta</span>
                        <span className="col-span-2 font-bold font-mono text-blue-950">
                          : {stu.examNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-600">Nama Siswa</span>
                        <span className="col-span-2 font-bold uppercase truncate">
                          : {stu.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-600">NIS / NISN</span>
                        <span className="col-span-2 font-mono">
                          : {stu.nis} / {stu.nisn}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-600">Kelas / Jur.</span>
                        <span className="col-span-2 font-medium">
                          : {cls ? cls.name : stu.classId} ({stu.major})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-gray-400 flex justify-between items-end text-[10px]">
                    <div>
                      <p className="italic text-gray-500">* Harap dibawa saat ujian</p>
                    </div>
                    <div className="text-center w-36">
                      <p>Depok, {new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                      <p className="font-semibold">Kepala Sekolah,</p>
                      <div className="h-10"></div>
                      <p className="font-bold underline">{settings.principalName}</p>
                      <p>NIP. {settings.principalNip}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Data Siswa Peserta Ujian
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data siswa, nomor peserta ujian, kartu ujian, dan pembagian kelas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateExamNumbers}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-xs font-medium flex items-center gap-1.5"
                title="Generate nomor peserta otomatis sesuai template"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Generate No Peserta
              </button>

              <button
                onClick={() => setPrintCardsFor(filtered)}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium flex items-center gap-1.5"
                title="Cetak kartu peserta untuk siswa terfilter"
              >
                <IdCard className="w-3.5 h-3.5" />
                Cetak Kartu ({filtered.length})
              </button>

              <button
                onClick={() => ExcelService.downloadTemplate('students')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium"
              >
                Template
              </button>

              <label className="cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExportExcel}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Excel
              </button>

              {students.length > 0 && (
                <button
                  onClick={handleOpenDeleteAll}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Hapus seluruh data siswa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}

              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Siswa
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama siswa, NIS, NISN, no peserta..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Status: Aktif</option>
                <option value="NONAKTIF">Status: Nonaktif</option>
                <option value="MUTASI">Status: Mutasi</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
                <option value={100}>100 baris</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                  {selectedStudentIds.length}
                </span>
                <span className="text-xs font-medium text-amber-900">
                  siswa dipilih dari total {students.length} siswa
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSelectedCards}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Cetak Kartu ({selectedStudentIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                >
                  Batalkan Pilihan
                </button>
                <button
                  type="button"
                  onClick={handleOpenDeleteSelected}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedStudentIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedStudentIds.length === filtered.length}
                        onChange={handleToggleSelectAll}
                        title="Pilih Semua Siswa Terfilter"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nomor Peserta</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NIS / NISN</th>
                    <th className="py-3 px-4 text-center">L/P</th>
                    <th className="py-3 px-4">Kelas &amp; Jurusan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Tidak ada data siswa yang cocok.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((stu, idx) => {
                      const cls = classMap.get(stu.classId);
                      const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr
                          key={stu.id}
                          className={`transition-colors ${
                            selectedStudentIds.includes(stu.id) ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(stu.id)}
                              onChange={() => handleToggleSelectStudent(stu.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center text-slate-400">
                            {rowNumber}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">
                            {stu.examNumber || '-'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {stu.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {stu.nis} / {stu.nisn}
                          </td>
                          <td className="py-3 px-4 text-center font-medium">
                            {stu.gender}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="font-semibold text-slate-800">
                              {cls ? cls.name : stu.classId}
                            </span>
                            <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                              {stu.major}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                stu.status === 'AKTIF'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {stu.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setPrintCardsFor([stu])}
                                className="p-1 text-slate-500 hover:text-indigo-600 rounded"
                                title="Cetak Kartu Siswa"
                              >
                                <IdCard className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(stu)}
                                className="p-1 text-slate-500 hover:text-amber-600 rounded"
                                title="Edit Siswa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(stu.id, stu.name)}
                                className="p-1 text-slate-500 hover:text-rose-600 rounded"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan {paginated.length} dari {filtered.length} siswa (Total:{' '}
                {students.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-medium">
                  Hal {currentPage} dari {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? `Edit Siswa ${editingStudent.name}` : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NIS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    NISN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status Siswa</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                    <option value="MUTASI">Mutasi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formPob}
                    onChange={(e) => setFormPob(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nomor Peserta Ujian
                  </label>
                  <input
                    type="text"
                    value={formExamNumber}
                    onChange={(e) => setFormExamNumber(e.target.value)}
                    placeholder="Contoh: 001/XII-TKJ/US/2026"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jurusan</label>
                <input
                  type="text"
                  value={formMajor}
                  onChange={(e) => setFormMajor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-semibold"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={isDeleteAll ? 'Hapus Seluruh Data Siswa' : 'Hapus Siswa Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh data siswa? Data kartu ujian dan nomor peserta seluruh siswa akan dihapus. Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} siswa yang dipilih?`
        }
        itemCount={isDeleteAll ? students.length : selectedStudentIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Siswa' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
      />
    </div>
  );
};
