import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Trash2,
  Search,
  Filter,
  Calendar,
  BookOpen,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  MakeUpExamRecord,
  ExamSchedule,
  Room,
  ClassItem,
  Subject,
  Supervisor,
  Student,
  StudentAttendance,
  SchoolSetting
} from '../../types';
import { StorageService } from '../../lib/storage';
import { PrintHeader } from '../common/PrintHeader';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface MakeUpExamsViewProps {
  makeUpExams: MakeUpExamRecord[];
  schedules: ExamSchedule[];
  rooms: Room[];
  classes: ClassItem[];
  subjects: Subject[];
  supervisors: Supervisor[];
  students: Student[];
  attendances: StudentAttendance[];
  settings: SchoolSetting;
  onRefresh: () => void;
}

export const MakeUpExamsView: React.FC<MakeUpExamsViewProps> = ({
  makeUpExams,
  schedules,
  rooms,
  classes,
  subjects,
  supervisors,
  students,
  attendances,
  settings,
  onRefresh
}) => {
  // State for Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BELUM_SUSULAN' | 'SUDAH_SUSULAN'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');

  // Selection & Bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Print mode & Messages
  const [isPrinting, setIsPrinting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Konfirmasi Susulan
  const [editingRecord, setEditingRecord] = useState<MakeUpExamRecord | null>(null);
  const [confirmSubjectId, setConfirmSubjectId] = useState<string>('');
  const [confirmMakeUpDate, setConfirmMakeUpDate] = useState<string>('');
  const [confirmRoomId, setConfirmRoomId] = useState<string>('');
  const [confirmSupervisorId, setConfirmSupervisorId] = useState<string>('');
  const [confirmStatus, setConfirmStatus] = useState<'BELUM_SUSULAN' | 'SUDAH_SUSULAN'>('SUDAH_SUSULAN');
  const [confirmNotes, setConfirmNotes] = useState<string>('');

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const supervisorMap = useMemo(() => new Map(supervisors.map((s) => [s.id, s])), [supervisors]);
  const scheduleMap = useMemo(() => new Map(schedules.map((s) => [s.id, s])), [schedules]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  // Filtered MakeUp records
  const filteredRecords = useMemo(() => {
    return makeUpExams.filter((rec) => {
      // Status filter
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;

      // Subject filter
      if (subjectFilter !== 'ALL' && rec.subjectId !== subjectFilter) return false;

      // Class filter
      if (classFilter !== 'ALL' && rec.classId !== classFilter) return false;

      // Reason filter
      if (reasonFilter !== 'ALL' && rec.reason !== reasonFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = rec.studentName?.toLowerCase().includes(query);
        const matchNis = rec.studentNis?.toLowerCase().includes(query);
        const matchExam = rec.examNumber?.toLowerCase().includes(query);
        const matchClass = rec.className?.toLowerCase().includes(query);
        const matchSubject = rec.subjectName?.toLowerCase().includes(query);
        if (!matchName && !matchNis && !matchExam && !matchClass && !matchSubject) {
          return false;
        }
      }

      return true;
    });
  }, [makeUpExams, statusFilter, subjectFilter, classFilter, reasonFilter, searchTerm]);

  // KPI Statistics
  const totalCount = makeUpExams.length;
  const pendingCount = makeUpExams.filter((m) => m.status === 'BELUM_SUSULAN').length;
  const completedCount = makeUpExams.filter((m) => m.status === 'SUDAH_SUSULAN').length;

  // Open Confirmation Modal
  const handleOpenConfirm = (record: MakeUpExamRecord) => {
    setEditingRecord(record);
    setConfirmSubjectId(record.subjectId || subjects[0]?.id || '');
    // Default makeUpDate: existing date or today YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    setConfirmMakeUpDate(record.makeUpDate || todayStr);
    setConfirmRoomId(record.makeUpRoomId || record.roomId || '');
    setConfirmSupervisorId(record.makeUpSupervisorId || '');
    setConfirmStatus(record.status === 'SUDAH_SUSULAN' ? 'SUDAH_SUSULAN' : 'SUDAH_SUSULAN');
    setConfirmNotes(record.notes || '');
  };

  // Save Confirmation
  const handleSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (confirmStatus === 'SUDAH_SUSULAN' && !confirmMakeUpDate) {
      alert('Silakan tentukan tanggal pelaksanaan ujian susulan.');
      return;
    }

    const res = StorageService.confirmMakeUpExam(editingRecord.id, {
      makeUpDate: confirmMakeUpDate,
      subjectId: confirmSubjectId,
      makeUpRoomId: confirmRoomId || undefined,
      makeUpSupervisorId: confirmSupervisorId || undefined,
      notes: confirmNotes,
      status: confirmStatus
    });

    if (res.success) {
      setSuccessMessage(
        confirmStatus === 'SUDAH_SUSULAN'
          ? `Siswa ${editingRecord.studentName} berhasil dikonfirmasi telah mengikuti ujian susulan.`
          : `Status susulan siswa ${editingRecord.studentName} diubah menjadi belum susulan.`
      );
      setEditingRecord(null);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Quick toggle status directly
  const handleQuickToggleStatus = (record: MakeUpExamRecord) => {
    if (record.status === 'BELUM_SUSULAN') {
      handleOpenConfirm(record);
    } else {
      if (window.confirm(`Batalkan status susulan untuk siswa ${record.studentName}?`)) {
        StorageService.confirmMakeUpExam(record.id, {
          makeUpDate: '',
          status: 'BELUM_SUSULAN',
          notes: record.notes
        });
        onRefresh();
        setSuccessMessage(`Status susulan ${record.studentName} dikembalikan ke Belum Susulan.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Single Delete
  const handleDeleteSingle = (id: string, name: string) => {
    if (window.confirm(`Hapus catatan siswa susulan untuk ${name}?`)) {
      StorageService.deleteMakeUpExam(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      onRefresh();
      setSuccessMessage('Data susulan berhasil dihapus.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete All / Delete Selected
  const handleOpenDeleteAll = () => {
    if (makeUpExams.length === 0) return;
    setIsDeleteAll(true);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteAll(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllMakeUpExams();
      setSelectedIds([]);
      onRefresh();
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      const res = StorageService.deleteMultipleMakeUpExams(selectedIds);
      setSelectedIds([]);
      onRefresh();
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }

    const dataToExport = filteredRecords.map((rec, index) => ({
      No: index + 1,
      'No. Peserta': rec.examNumber || '-',
      NIS: rec.studentNis || '-',
      'Nama Siswa': rec.studentName || '-',
      Kelas: rec.className || '-',
      'Mata Pelajaran': rec.subjectName || '-',
      'Jadwal Utama': `${rec.originalDate} (Sesi ${rec.originalSession || '-'})`,
      'Alasan Ketidakhadiran': rec.reason,
      'Status Susulan': rec.status === 'SUDAH_SUSULAN' ? 'Sudah Susulan' : 'Belum Susulan',
      'Tanggal Susulan': rec.makeUpDate || '-',
      'Ruang Susulan': rec.roomName || '-',
      'Pengawas Susulan': rec.supervisorName || '-',
      Catatan: rec.notes || '-',
      'Dikonfirmasi Oleh': rec.confirmedBy || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Siswa_Susulan');
    XLSX.writeFile(workbook, `Daftar_Siswa_Susulan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Printable View */}
      {isPrinting ? (
        <div className="bg-white p-8 max-w-5xl mx-auto text-black font-serif text-xs">
          <div className="flex justify-end gap-2 mb-4 no-print font-sans">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen (A4)
            </button>
            <button
              onClick={() => setIsPrinting(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
            >
              Kembali
            </button>
          </div>

          <PrintHeader
            settings={settings}
            documentTitle="DAFTAR PESERTA DAN BERITA ACARA UJIAN SUSULAN"
            documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
          />

          <div className="mt-4 space-y-3 leading-relaxed">
            <p className="text-justify">
              Berikut adalah daftar siswa yang tidak hadir pada pelaksanaan ujian utama dan dijadwalkan
              atau telah mengikuti <strong>Ujian Sekolah Susulan</strong>:
            </p>

            <table className="w-full border-collapse border border-black text-xs mt-3">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 text-center w-8">No</th>
                  <th className="border border-black p-1.5 text-center w-28">No. Peserta</th>
                  <th className="border border-black p-1.5 text-left">Nama Siswa</th>
                  <th className="border border-black p-1.5 text-center w-20">Kelas</th>
                  <th className="border border-black p-1.5 text-left">Mata Pelajaran</th>
                  <th className="border border-black p-1.5 text-center w-24">Alasan</th>
                  <th className="border border-black p-1.5 text-center w-24">Tgl Susulan</th>
                  <th className="border border-black p-1.5 text-center w-28">Status</th>
                  <th className="border border-black p-1.5 text-center w-24">TTD Siswa</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-black p-4 text-center text-gray-500 italic">
                      Tidak ada peserta ujian susulan pada filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => (
                    <tr key={rec.id}>
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-mono font-bold">
                        {rec.examNumber || rec.studentNis}
                      </td>
                      <td className="border border-black p-1.5 font-medium">{rec.studentName}</td>
                      <td className="border border-black p-1.5 text-center">{rec.className}</td>
                      <td className="border border-black p-1.5">{rec.subjectName}</td>
                      <td className="border border-black p-1.5 text-center">{rec.reason}</td>
                      <td className="border border-black p-1.5 text-center font-mono">
                        {rec.makeUpDate || '-'}
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">
                        {rec.status === 'SUDAH_SUSULAN' ? 'SUDAH' : 'BELUM'}
                      </td>
                      <td className="border border-black p-1.5 text-center">
                        <div className="h-6 flex items-center justify-center text-gray-400">
                          {rec.status === 'SUDAH_SUSULAN' ? '✓ Hadir' : '..........'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Signature block */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p className="font-semibold">Kepala Sekolah</p>
                <div className="h-16 flex items-center justify-center text-gray-400 italic">
                  (Tanda Tangan &amp; Stempel)
                </div>
                <p className="font-bold underline">{settings.principalName}</p>
                <p>NIP. {settings.principalNip}</p>
              </div>

              <div>
                <p>{settings.city}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-semibold">Ketua Panitia Ujian</p>
                <div className="h-16 flex items-center justify-center text-gray-400 italic">
                  (Tanda Tangan)
                </div>
                <p className="font-bold underline">{settings.committeeHeadName}</p>
                <p>NIP. {settings.committeeHeadNip}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Title & Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Daftar Siswa Susulan
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Otomatis mendata siswa yang tidak hadir pada sesi ujian utama beserta konfirmasi pelaksanaan ujian susulan.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Ekspor ke format Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrinting(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Cetak Berita Acara & Daftar Hadir Ujian Susulan"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Rekap Susulan (A4)</span>
              </button>

              {makeUpExams.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenDeleteAll}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Hapus seluruh data siswa susulan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Total Perlu Susulan
                </span>
                <span className="text-xl font-bold text-slate-900">{totalCount} Siswa</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Belum Mengikuti Susulan
                </span>
                <span className="text-xl font-bold text-rose-600">{pendingCount} Siswa</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Sudah Selesai Susulan
                </span>
                <span className="text-xl font-bold text-emerald-600">{completedCount} Siswa</span>
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama siswa, NIS, no peserta, atau mapel..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Status Susulan</option>
                <option value="BELUM_SUSULAN">Belum Susulan ({pendingCount})</option>
                <option value="SUDAH_SUSULAN">Sudah Susulan ({completedCount})</option>
              </select>

              {/* Subject Filter */}
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Mata Pelajaran</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              {/* Reason Filter */}
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Alasan</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Alpa">Alpa</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-medium text-amber-900">
                  siswa susulan dipilih dari {filteredRecords.length} yang ditampilkan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
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
                  <span>Hapus Terpilih ({selectedIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">Peserta Ujian</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3">Jadwal Utama</th>
                    <th className="p-3">Alasan Ketidakhadiran</th>
                    <th className="p-3">Status Susulan</th>
                    <th className="p-3">Jadwal Pelaksanaan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-10 text-center text-slate-400">
                        Tidak ada data siswa susulan yang sesuai kriteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec, idx) => {
                      const isSelected = selectedIds.includes(rec.id);
                      const isCompleted = rec.status === 'SUDAH_SUSULAN';

                      return (
                        <tr
                          key={rec.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectItem(rec.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{rec.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="text-blue-700 font-bold">{rec.examNumber}</span>
                              <span>•</span>
                              <span>NIS: {rec.studentNis}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {rec.className}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-100">
                              {rec.subjectName}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div className="font-medium text-slate-800">{rec.originalDate}</div>
                            <div className="text-[11px] text-slate-400">
                              Sesi {rec.originalSession || '-'}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                rec.reason === 'Sakit'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : rec.reason === 'Izin'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : rec.reason === 'Alpa'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {rec.reason}
                            </span>
                            {rec.notes && (
                              <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate">
                                {rec.notes}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleQuickToggleStatus(rec)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Klik untuk mengubah status susulan"
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Sudah Susulan</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Belum Susulan</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-slate-600">
                            {rec.makeUpDate ? (
                              <div>
                                <div className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {rec.makeUpDate}
                                </div>
                                {rec.roomName && (
                                  <div className="text-[11px] text-slate-400">
                                    Ruang: {rec.roomName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Belum dijadwalkan</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenConfirm(rec)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors"
                                title="Konfirmasi atau sesuaikan pelaksanaan susulan"
                              >
                                <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>{isCompleted ? 'Edit Susulan' : 'Konfirmasi'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSingle(rec.id, rec.studentName || 'Siswa')}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                                title="Hapus catatan susulan ini"
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

            {/* Table Footer Summary */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Menampilkan <strong>{filteredRecords.length}</strong> dari total{' '}
                <strong>{totalCount}</strong> catatan siswa susulan
              </span>
              <div className="flex items-center gap-3 font-medium">
                <span className="text-rose-600">Belum: {pendingCount}</span>
                <span>•</span>
                <span className="text-emerald-600">Sudah: {completedCount}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL: Konfirmasi Ujian Susulan */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  Konfirmasi Pelaksanaan Ujian Susulan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveConfirmation} className="p-5 space-y-4 text-xs">
              {/* Student Info Card */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Siswa:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {editingRecord.studentName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">No. Peserta / NIS:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {editingRecord.examNumber} (NIS: {editingRecord.studentNis})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kelas:</span>
                  <span className="font-semibold text-slate-800">
                    {editingRecord.className}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Alasan Tidak Hadir Utama:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                    {editingRecord.reason} (Jadwal: {editingRecord.originalDate})
                  </span>
                </div>
              </div>

              {/* Mata Pelajaran Susulan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran yang Disusulkan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={confirmSubjectId}
                  onChange={(e) => setConfirmSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Secara bawaan disesuaikan dengan mata pelajaran pada sesi ujian asli.
                </p>
              </div>

              {/* Tanggal Pelaksanaan Susulan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Pelaksanaan Ujian Susulan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={confirmMakeUpDate}
                  onChange={(e) => setConfirmMakeUpDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Ruang Susulan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ruang Ujian Susulan
                  </label>
                  <select
                    value={confirmRoomId}
                    onChange={(e) => setConfirmRoomId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Ruang (Opsional) --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pengawas Susulan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pengawas Susulan
                  </label>
                  <select
                    value={confirmSupervisorId}
                    onChange={(e) => setConfirmSupervisorId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Pengawas (Opsional) --</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Konfirmasi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Pelaksanaan Ujian Susulan
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer font-semibold transition-all ${
                      confirmStatus === 'SUDAH_SUSULAN'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="confirmStatus"
                      value="SUDAH_SUSULAN"
                      checked={confirmStatus === 'SUDAH_SUSULAN'}
                      onChange={() => setConfirmStatus('SUDAH_SUSULAN')}
                      className="text-emerald-600"
                    />
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sudah Mengikuti Susulan</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer font-semibold transition-all ${
                      confirmStatus === 'BELUM_SUSULAN'
                        ? 'border-rose-500 bg-rose-50/60 text-rose-800 ring-1 ring-rose-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="confirmStatus"
                      value="BELUM_SUSULAN"
                      checked={confirmStatus === 'BELUM_SUSULAN'}
                      onChange={() => setConfirmStatus('BELUM_SUSULAN')}
                      className="text-rose-600"
                    />
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Belum / Dijadwalkan</span>
                  </label>
                </div>
              </div>

              {/* Catatan / Keterangan Pelaksanaan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Pelaksanaan / Nomor Soal Susulan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  placeholder="Contoh: Menggunakan Naskah Soal Paket B, terlaksana tertib dan lancar..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 -mx-5 -mb-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Konfirmasi</span>
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
        title={isDeleteAll ? 'Hapus Seluruh Data Siswa Susulan' : 'Hapus Siswa Susulan Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh catatan siswa susulan? Data rekap susulan dan status konfirmasi akan dihapus permanen.'
            : `Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa susulan yang dipilih?`
        }
        itemCount={isDeleteAll ? makeUpExams.length : selectedIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Susulan' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
      />
    </div>
  );
};
