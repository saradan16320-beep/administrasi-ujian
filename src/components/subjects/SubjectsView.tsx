import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { Subject, SubjectGroup } from '../../types';
import { StorageService } from '../../lib/storage';
import { ExcelService } from '../../lib/excel';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SubjectsViewProps {
  subjects: Subject[];
  onRefresh: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ subjects, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selection & Bulk delete state
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Form
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formGroup, setFormGroup] = useState<SubjectGroup>('Muatan Nasional');
  const [formGrade, setFormGrade] = useState(12);
  const [formDuration, setFormDuration] = useState(90);
  const [formIsActive, setFormIsActive] = useState(true);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGroup = groupFilter === 'ALL' || s.group === groupFilter;
      return matchSearch && matchGroup;
    });
  }, [subjects, searchTerm, groupFilter]);

  const openAddModal = () => {
    setEditingSub(null);
    setFormCode('MP-');
    setFormName('');
    setFormGroup('Muatan Nasional');
    setFormGrade(12);
    setFormDuration(90);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Subject) => {
    setEditingSub(s);
    setFormCode(s.code);
    setFormName(s.name);
    setFormGroup(s.group as SubjectGroup);
    setFormGrade(s.grade || 10);
    setFormDuration(s.durationMinutes);
    setFormIsActive(s.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Subject = {
      id: editingSub ? editingSub.id : `sub-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      group: formGroup,
      grade: Number(formGrade),
      durationMinutes: Number(formDuration),
      isActive: formIsActive,
      createdAt: editingSub ? editingSub.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveSubject(item);
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage(`Mata pelajaran ${item.name} berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus mata pelajaran ${name}?`)) {
      const res = StorageService.deleteSubject(id);
      if (!res.success) {
        setErrorMessage(res.message);
        setTimeout(() => setErrorMessage(null), 4000);
      } else {
        setSelectedSubIds((prev) => prev.filter((item) => item !== id));
        onRefresh();
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSubIds.length === filtered.length) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(filtered.map((s) => s.id));
    }
  };

  const handleToggleSelectSub = (id: string) => {
    setSelectedSubIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (subjects.length === 0) return;
    setIsDeleteAll(true);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedSubIds.length === 0) return;
    setIsDeleteAll(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllSubjects();
      setSelectedSubIds([]);
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
      const res = StorageService.deleteMultipleSubjects(selectedSubIds);
      setSelectedSubIds([]);
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

  const handleExportExcel = () => {
    const data = subjects.map((s, i) => ({
      No: i + 1,
      Kode_Mapel: s.code,
      Nama_Mata_Pelajaran: s.name,
      Kelompok: s.group,
      Tingkat: s.grade,
      Durasi_Menit: s.durationMinutes,
      Status_Aktif: s.isActive ? 'YA' : 'TIDAK'
    }));
    ExcelService.exportToExcel(data, 'Data_Master_Mata_Pelajaran');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await ExcelService.parseExcelFile(file);
      if (rows.length === 0) {
        setErrorMessage('File Excel kosong atau format tidak sesuai.');
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }

      let count = 0;
      const newSubjects: Subject[] = [];

      rows.forEach((row: any) => {
        const code = row['Kode_Mapel'] || row['Kode'] || row['code'];
        const name = row['Nama_Mata_Pelajaran'] || row['Nama_Mapel'] || row['Nama'] || row['name'] || code;
        if (code && name) {
          const group = row['Kelompok'] || row['group'] || 'Umum';
          const gradeVal = parseInt(row['Tingkat'] || row['grade'] || '12', 10) || 12;
          const duration = parseInt(row['Durasi_Menit'] || row['Durasi'] || row['durationMinutes'] || '90', 10) || 90;
          const statusRaw = String(row['Status_Aktif'] || row['Status'] || 'YA').toUpperCase();
          const isActive = statusRaw === 'YA' || statusRaw === 'TRUE' || statusRaw === '1' || statusRaw === 'AKTIF';

          const subj: Subject = {
            id: `subj-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            code: String(code).trim().toUpperCase(),
            name: String(name).trim(),
            group: String(group).trim() as any,
            grade: gradeVal,
            durationMinutes: duration,
            isActive: isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newSubjects.push(subj);
          count++;
        }
      });

      if (newSubjects.length > 0) {
        StorageService.saveMultipleSubjects(newSubjects);
        onRefresh();
        setSuccessMessage(`Berhasil mengimpor ${count} mata pelajaran dari Excel.`);
      } else {
        setErrorMessage('Tidak ada data mata pelajaran yang valid ditemukan dalam file Excel.');
      }
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal import Excel: ${err?.message || 'Format salah'}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Data Mata Pelajaran
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar mata pelajaran ujian, alokasi waktu ujian, dan kelompok kurikulum.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExcelService.downloadTemplate('subjects')}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer"
            title="Download Template Format Excel"
          >
            Template
          </button>
          <label className="cursor-pointer px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
          {subjects.length > 0 && (
            <button
              onClick={handleOpenDeleteAll}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Hapus seluruh data mata pelajaran"
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
            Tambah Mapel
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

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode atau nama mata pelajaran..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Semua Kelompok</option>
          <option value="Muatan Nasional">Muatan Nasional</option>
          <option value="Muatan Kewilayahan">Muatan Kewilayahan</option>
          <option value="Peminatan Kejuruan">Peminatan Kejuruan</option>
        </select>
      </div>

      {/* Bulk Selection Bar */}
      {selectedSubIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              {selectedSubIds.length}
            </span>
            <span className="text-xs font-medium text-amber-900">
              mata pelajaran dipilih dari total {subjects.length} mata pelajaran
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubIds([])}
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
              <span>Hapus Terpilih ({selectedSubIds.length})</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedSubIds.length === filtered.length}
                    onChange={handleToggleSelectAll}
                    title="Pilih Semua Mapel"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Kode Mapel</th>
                <th className="py-3 px-4">Nama Mata Pelajaran</th>
                <th className="py-3 px-4">Kelompok</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4 text-center">Alokasi Waktu</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Tidak ada data mata pelajaran.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      selectedSubIds.includes(s.id) ? 'bg-amber-50/60' : 'hover:bg-slate-50 transition-colors'
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSubIds.includes(s.id)}
                        onChange={() => handleToggleSelectSub(s.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.group}</td>
                    <td className="py-3 px-4">Kelas {s.grade}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {s.durationMinutes} Menit
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded"
                          title="Edit Mapel"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded"
                          title="Hapus Mapel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSub ? `Edit Mapel ${editingSub.name}` : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kode Mapel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="Contoh: MAT-01, BIN-01"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Contoh: Matematika Peminatan"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kelompok Kurikulum</label>
                <select
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value as SubjectGroup)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                >
                  <option value="Muatan Nasional">Muatan Nasional (A)</option>
                  <option value="Muatan Kewilayahan">Muatan Kewilayahan (B)</option>
                  <option value="Peminatan Kejuruan">Peminatan Kejuruan (C)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  >
                    <option value={10}>Kelas 10 (X)</option>
                    <option value={11}>Kelas 11 (XI)</option>
                    <option value={12}>Kelas 12 (XII)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Durasi Ujian (Menit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={5}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveSub"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isActiveSub" className="text-slate-700 font-medium">
                  Mata Pelajaran Aktif Diujikan
                </label>
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
                  Simpan
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
        title={isDeleteAll ? 'Hapus Seluruh Data Mata Pelajaran' : 'Hapus Mata Pelajaran Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh data mata pelajaran? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedSubIds.length} mata pelajaran yang dipilih?`
        }
        itemCount={isDeleteAll ? subjects.length : selectedSubIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Mapel' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
      />
    </div>
  );
};
