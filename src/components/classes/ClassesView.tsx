import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { ClassItem, Student } from '../../types';
import { StorageService } from '../../lib/storage';
import { ExcelService } from '../../lib/excel';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ClassesViewProps {
  classes: ClassItem[];
  students?: Student[];
  onRefresh: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selection & Bulk delete state
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  // Form
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState(12);
  const [formMajor, setFormMajor] = useState('Teknik Komputer & Jaringan');
  const [formTeacher, setFormTeacher] = useState('');
  const [formCapacity, setFormCapacity] = useState(36);
  const [formIsActive, setFormIsActive] = useState(true);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.homeroomTeacher && c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchGrade = gradeFilter === 'ALL' || c.grade.toString() === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [classes, searchTerm, gradeFilter]);

  const openAddModal = () => {
    setEditingClass(null);
    setFormCode('XII-');
    setFormName('XII ');
    setFormGrade(12);
    setFormMajor('Teknik Komputer & Jaringan');
    setFormTeacher('');
    setFormCapacity(36);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassItem) => {
    setEditingClass(c);
    setFormCode(c.code);
    setFormName(c.name);
    setFormGrade(c.grade);
    setFormMajor(c.major);
    setFormTeacher(c.homeroomTeacher || '');
    setFormCapacity(c.capacity);
    setFormIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ClassItem = {
      id: editingClass ? editingClass.id : `class-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      grade: Number(formGrade),
      major: formMajor.trim(),
      homeroomTeacher: formTeacher.trim(),
      capacity: Number(formCapacity),
      isActive: formIsActive,
      createdAt: editingClass ? editingClass.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveClass(item);
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage(`Kelas ${item.name} berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus kelas ${name}?`)) {
      const res = StorageService.deleteClass(id);
      if (!res.success) {
        setErrorMessage(res.message);
        setTimeout(() => setErrorMessage(null), 4000);
      } else {
        setSelectedClassIds((prev) => prev.filter((item) => item !== id));
        onRefresh();
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedClassIds.length === filtered.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(filtered.map((c) => c.id));
    }
  };

  const handleToggleSelectClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (classes.length === 0) return;
    setIsDeleteAll(true);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedClassIds.length === 0) return;
    setIsDeleteAll(false);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllClasses(forceDelete);
      setSelectedClassIds([]);
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
      const res = StorageService.deleteMultipleClasses(selectedClassIds, forceDelete);
      setSelectedClassIds([]);
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
    const data = classes.map((c, i) => ({
      No: i + 1,
      Kode_Kelas: c.code,
      Nama_Kelas: c.name,
      Tingkat: c.grade,
      Program_Keahlian: c.major,
      Wali_Kelas: c.homeroomTeacher || '-',
      Kapasitas: c.capacity,
      Status_Aktif: c.isActive ? 'YA' : 'TIDAK'
    }));
    ExcelService.exportToExcel(data, 'Data_Master_Kelas');
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
      const newClasses: ClassItem[] = [];

      rows.forEach((row: any) => {
        const code = row['Kode_Kelas'] || row['Kode'] || row['code'];
        const name = row['Nama_Kelas'] || row['Nama'] || row['name'] || code;
        if (code && name) {
          const gradeVal = parseInt(row['Tingkat'] || row['grade'] || '12', 10) || 12;
          const major = row['Program_Keahlian'] || row['Jurusan'] || row['major'] || 'Umum';
          const teacher = row['Wali_Kelas'] || row['Wali'] || row['homeroomTeacher'] || '';
          const capacity = parseInt(row['Kapasitas'] || row['capacity'] || '36', 10) || 36;
          const statusRaw = String(row['Status_Aktif'] || row['Status'] || 'YA').toUpperCase();
          const isActive = statusRaw === 'YA' || statusRaw === 'TRUE' || statusRaw === '1' || statusRaw === 'AKTIF';

          const cls: ClassItem = {
            id: `class-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            code: String(code).trim().toUpperCase(),
            name: String(name).trim(),
            grade: gradeVal,
            major: String(major).trim(),
            homeroomTeacher: String(teacher).trim(),
            capacity: capacity,
            isActive: isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newClasses.push(cls);
          count++;
        }
      });

      if (newClasses.length > 0) {
        StorageService.saveMultipleClasses(newClasses);
        onRefresh();
        setSuccessMessage(`Berhasil mengimpor ${count} kelas dari Excel.`);
      } else {
        setErrorMessage('Tidak ada data kelas yang valid ditemukan dalam file Excel.');
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
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Data Master Kelas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar rombel / kelas, tingkat, program keahlian, dan wali kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExcelService.downloadTemplate('classes')}
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
          {classes.length > 0 && (
            <button
              onClick={handleOpenDeleteAll}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Hapus seluruh data kelas"
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
            Tambah Kelas
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
            placeholder="Cari kode kelas, nama, jurusan..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Semua Tingkat</option>
          <option value="10">Kelas X (10)</option>
          <option value="11">Kelas XI (11)</option>
          <option value="12">Kelas XII (12)</option>
        </select>
      </div>

      {/* Bulk Selection Bar */}
      {selectedClassIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              {selectedClassIds.length}
            </span>
            <span className="text-xs font-medium text-amber-900">
              kelas dipilih dari total {classes.length} kelas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedClassIds([])}
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
              <span>Hapus Terpilih ({selectedClassIds.length})</span>
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
                    checked={filtered.length > 0 && selectedClassIds.length === filtered.length}
                    onChange={handleToggleSelectAll}
                    title="Pilih Semua Kelas"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Kode Kelas</th>
                <th className="py-3 px-4">Nama Kelas</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Program Keahlian</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4 text-center">Kapasitas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    Tidak ada data kelas.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      selectedClassIds.includes(c.id) ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedClassIds.includes(c.id)}
                        onChange={() => handleToggleSelectClass(c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4">Tingkat {c.grade}</td>
                    <td className="py-3 px-4 text-slate-600">{c.major}</td>
                    <td className="py-3 px-4 text-slate-700">{c.homeroomTeacher || '-'}</td>
                    <td className="py-3 px-4 text-center font-medium">{c.capacity} siswa</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded"
                          title="Edit Kelas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded"
                          title="Hapus Kelas"
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
                {editingClass ? `Edit Kelas ${editingClass.name}` : 'Tambah Kelas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kode Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="Contoh: XII-TKJ"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Contoh: XII TKJ"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tingkat</label>
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
                  <label className="block font-medium text-slate-700 mb-1">Kapasitas Siswa</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Program Keahlian / Jurusan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formMajor}
                  onChange={(e) => setFormMajor(e.target.value)}
                  required
                  placeholder="Contoh: Teknik Komputer & Jaringan"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Wali Kelas</label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="Nama Guru Wali Kelas"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveClass"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isActiveClass" className="text-slate-700 font-medium">
                  Kelas Aktif
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
        title={isDeleteAll ? 'Hapus Seluruh Data Kelas' : 'Hapus Kelas Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh data kelas? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedClassIds.length} kelas yang dipilih?`
        }
        itemCount={isDeleteAll ? classes.length : selectedClassIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Kelas' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
        canForce={true}
        forceChecked={forceDelete}
        onToggleForce={setForceDelete}
        forceWarning="Centang opsi ini jika ingin menghapus paksa kelas meskipun masih memiliki siswa terdaftar."
      />
    </div>
  );
};
