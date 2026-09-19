import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  X
} from 'lucide-react';
import { Supervisor, ExamSchedule } from '../../types';
import { StorageService } from '../../lib/storage';
import { ExcelService } from '../../lib/excel';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SupervisorsViewProps {
  supervisors: Supervisor[];
  schedules?: ExamSchedule[];
  onRefresh: () => void;
}

export const SupervisorsView: React.FC<SupervisorsViewProps> = ({
  supervisors,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supervisor | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selection & Bulk delete state
  const [selectedSupIds, setSelectedSupIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  // Form
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formSubject, setFormSubject] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  const filtered = useMemo(() => {
    return supervisors.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.nip && s.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.subject && s.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.isActive) ||
        (statusFilter === 'INACTIVE' && !s.isActive);
      return matchSearch && matchStatus;
    });
  }, [supervisors, searchTerm, statusFilter]);

  const openAddModal = () => {
    setEditingSup(null);
    setFormNip('198');
    setFormName('');
    setFormGender('L');
    setFormSubject('');
    setFormPhone('08');
    setFormIsActive(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supervisor) => {
    setEditingSup(s);
    setFormNip(s.nip || '');
    setFormName(s.name);
    setFormGender(s.gender);
    setFormSubject(s.subject || '');
    setFormPhone(s.phone || '');
    setFormIsActive(s.isActive);
    setFormNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Supervisor = {
      id: editingSup ? editingSup.id : `sup-${Date.now()}`,
      nip: formNip.trim(),
      name: formName.trim(),
      gender: formGender,
      subject: formSubject.trim(),
      phone: formPhone.trim(),
      isActive: formIsActive,
      notes: formNotes.trim(),
      createdAt: editingSup ? editingSup.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveSupervisor(item);
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage(`Data pengawas ${item.name} berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus pengawas ${name}?`)) {
      const res = StorageService.deleteSupervisor(id);
      if (!res.success) {
        setErrorMessage(res.message);
        setTimeout(() => setErrorMessage(null), 4000);
      } else {
        setSelectedSupIds((prev) => prev.filter((item) => item !== id));
        onRefresh();
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSupIds.length === filtered.length) {
      setSelectedSupIds([]);
    } else {
      setSelectedSupIds(filtered.map((s) => s.id));
    }
  };

  const handleToggleSelectSup = (id: string) => {
    setSelectedSupIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (supervisors.length === 0) return;
    setIsDeleteAll(true);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedSupIds.length === 0) return;
    setIsDeleteAll(false);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllSupervisors(forceDelete);
      setSelectedSupIds([]);
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
      const res = StorageService.deleteMultipleSupervisors(selectedSupIds, forceDelete);
      setSelectedSupIds([]);
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
    const data = supervisors.map((s, i) => ({
      No: i + 1,
      NIP: s.nip || '-',
      Nama_Pengawas: s.name,
      Jenis_Kelamin: s.gender,
      Mata_Pelajaran: s.subject || '-',
      Nomor_Telepon: s.phone || '-',
      Status_Aktif: s.isActive ? 'YA' : 'TIDAK',
      Catatan: s.notes || '-'
    }));
    ExcelService.exportToExcel(data, 'Data_Master_Pengawas');
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
      const newSupervisors: Supervisor[] = [];

      rows.forEach((row: any) => {
        const name = row['Nama_Pengawas'] || row['Nama'] || row['name'];
        if (name) {
          const nip = row['NIP'] || row['nip'] || '';
          const genderRaw = (row['Jenis_Kelamin'] || row['L_P'] || row['gender'] || 'L').toString().toUpperCase();
          const gender = genderRaw.startsWith('P') ? 'P' : 'L';
          const subject = row['Mata_Pelajaran'] || row['Mapel'] || row['subject'] || '';
          const phone = row['Nomor_HP'] || row['Nomor_Telepon'] || row['No_HP'] || row['phone'] || '';
          const statusRaw = String(row['Status'] || row['Status_Aktif'] || 'Aktif').toUpperCase();
          const isActive = statusRaw === 'AKTIF' || statusRaw === 'YA' || statusRaw === 'TRUE' || statusRaw === '1';
          const notes = row['Keterangan'] || row['Catatan'] || row['notes'] || '';

          const sup: Supervisor = {
            id: `sup-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: String(name).trim(),
            nip: nip ? String(nip).trim() : '-',
            gender: gender,
            subject: subject ? String(subject).trim() : undefined,
            phone: phone ? String(phone).trim() : '-',
            isActive: isActive,
            notes: notes ? String(notes).trim() : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newSupervisors.push(sup);
          count++;
        }
      });

      if (newSupervisors.length > 0) {
        StorageService.saveMultipleSupervisors(newSupervisors);
        onRefresh();
        setSuccessMessage(`Berhasil mengimpor ${count} pengawas dari Excel.`);
      } else {
        setErrorMessage('Tidak ada data pengawas yang valid ditemukan dalam file Excel.');
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
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Data Pengawas Ujian
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar guru / pengawas ruang ujian sekolah beserta validasi bentrok jadwal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExcelService.downloadTemplate('supervisors')}
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
          {supervisors.length > 0 && (
            <button
              onClick={handleOpenDeleteAll}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Hapus seluruh data pengawas"
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
            Tambah Pengawas
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
            placeholder="Cari nama, NIP, atau mata pelajaran pengampu..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Siap Bertugas (Aktif)</option>
          <option value="INACTIVE">Non-Aktif</option>
        </select>
      </div>

      {/* Bulk Selection Bar */}
      {selectedSupIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              {selectedSupIds.length}
            </span>
            <span className="text-xs font-medium text-amber-900">
              pengawas dipilih dari total {supervisors.length} pengawas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSupIds([])}
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
              <span>Hapus Terpilih ({selectedSupIds.length})</span>
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
                    checked={filtered.length > 0 && selectedSupIds.length === filtered.length}
                    onChange={handleToggleSelectAll}
                    title="Pilih Semua Pengawas"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Pengawas</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Guru Mapel</th>
                <th className="py-3 px-4">Kontak / HP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Tidak ada data pengawas.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      selectedSupIds.includes(s.id) ? 'bg-amber-50/60' : 'hover:bg-slate-50 transition-colors'
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSupIds.includes(s.id)}
                        onChange={() => handleToggleSelectSup(s.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.nip || '-'}</td>
                    <td className="py-3 px-4 text-center">{s.gender}</td>
                    <td className="py-3 px-4 text-slate-700">{s.subject || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.phone ? (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.phone}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isActive ? 'Siap Tugas' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded"
                          title="Edit Pengawas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded"
                          title="Hapus Pengawas"
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
                {editingSup ? `Edit Pengawas ${editingSup.name}` : 'Tambah Pengawas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  NIP / NUPTK
                </label>
                <input
                  type="text"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  placeholder="19800101 200501 1 001"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
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
                  <label className="block font-medium text-slate-700 mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Guru Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Bahasa Indonesia"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Keterangan ketersediaan atau catatan kesehatan"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveSup"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isActiveSup" className="text-slate-700 font-medium">
                  Pengawas Siap Ditugaskan (Aktif)
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
        title={isDeleteAll ? 'Hapus Seluruh Data Pengawas' : 'Hapus Pengawas Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh data pengawas? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedSupIds.length} pengawas yang dipilih?`
        }
        itemCount={isDeleteAll ? supervisors.length : selectedSupIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Pengawas' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
        canForce={true}
        forceChecked={forceDelete}
        onToggleForce={setForceDelete}
        forceWarning="Centang opsi ini jika ingin menghapus paksa pengawas meskipun sudah ditugaskan pada jadwal ujian."
      />
    </div>
  );
};
