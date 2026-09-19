import React, { useState, useMemo } from 'react';
import {
  DoorOpen,
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
  Building,
  Monitor,
  Check,
  X
} from 'lucide-react';
import { Room, RoomStatus, SchoolSetting, ExamSchedule } from '../../types';
import { StorageService } from '../../lib/storage';
import { ExcelService } from '../../lib/excel';
import { PrintHeader } from '../common/PrintHeader';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface RoomsViewProps {
  rooms: Room[];
  schedules?: ExamSchedule[];
  settings?: SchoolSetting;
  onRefresh: () => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  schedules = [],
  settings: settingsProp,
  onRefresh
}) => {
  const settings = settingsProp || StorageService.getSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL');

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Selection & Bulk delete state
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  // Form inputs
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formBuilding, setFormBuilding] = useState('');
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(30);
  const [formComputerCount, setFormComputerCount] = useState(0);
  const [formDeskCount, setFormDeskCount] = useState(30);
  const [formChairCount, setFormChairCount] = useState(30);
  const [formPersonInCharge, setFormPersonInCharge] = useState('');
  const [formStatus, setFormStatus] = useState<RoomStatus>('Aktif');
  const [formDescription, setFormDescription] = useState('');

  // Extract unique buildings for filter
  const uniqueBuildings = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      if (r.building) set.add(r.building);
    });
    return Array.from(set);
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchSearch =
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.building.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchBuilding = buildingFilter === 'ALL' || r.building === buildingFilter;
      return matchSearch && matchStatus && matchBuilding;
    });
  }, [rooms, searchTerm, statusFilter, buildingFilter]);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormCode(`R-0${rooms.length + 1}`);
    setFormName(`Ruang Teori 0${rooms.length + 1}`);
    setFormBuilding('Gedung A (Utama)');
    setFormFloor(1);
    setFormCapacity(30);
    setFormComputerCount(0);
    setFormDeskCount(30);
    setFormChairCount(30);
    setFormPersonInCharge('');
    setFormStatus('Aktif');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormCode(room.code);
    setFormName(room.name);
    setFormBuilding(room.building);
    setFormFloor(room.floor);
    setFormCapacity(room.capacity);
    setFormComputerCount(room.computerCount || 0);
    setFormDeskCount(room.deskCount || 0);
    setFormChairCount(room.chairCount || 0);
    setFormPersonInCharge(room.personInCharge || '');
    setFormStatus(room.status);
    setFormDescription(room.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) {
      alert('Kode dan Nama Ruang wajib diisi');
      return;
    }

    const newRoom: Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      building: formBuilding.trim(),
      floor: Number(formFloor),
      capacity: Number(formCapacity),
      computerCount: Number(formComputerCount),
      deskCount: Number(formDeskCount),
      chairCount: Number(formChairCount),
      personInCharge: formPersonInCharge.trim(),
      status: formStatus,
      description: formDescription.trim(),
      createdAt: editingRoom ? editingRoom.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.saveRoom(newRoom);
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage(`Ruang ${newRoom.code} berhasil disimpan.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDelete = (roomId: string, roomCode: string) => {
    if (window.confirm(`Yakin ingin menghapus Ruang ${roomCode}?`)) {
      const res = StorageService.deleteRoom(roomId);
      if (!res.success) {
        setErrorMessage(res.message);
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
        onRefresh();
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRoomIds.length === filteredRooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(filteredRooms.map((r) => r.id));
    }
  };

  const handleToggleSelectRoom = (id: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (rooms.length === 0) return;
    setIsDeleteAll(true);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedRoomIds.length === 0) return;
    setIsDeleteAll(false);
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllRooms(forceDelete);
      setSelectedRoomIds([]);
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
      const res = StorageService.deleteMultipleRooms(selectedRoomIds, forceDelete);
      setSelectedRoomIds([]);
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

  const toggleStatus = (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === 'Aktif'
        ? 'Tidak Aktif'
        : room.status === 'Tidak Aktif'
        ? 'Dalam Perbaikan'
        : 'Aktif';

    StorageService.saveRoom({
      ...room,
      status: nextStatus
    });
    onRefresh();
  };

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = rooms.map((r, i) => ({
      No: i + 1,
      Kode_Ruang: r.code,
      Nama_Ruang: r.name,
      Gedung: r.building,
      Lantai: r.floor,
      Kapasitas: r.capacity,
      Jumlah_Komputer: r.computerCount,
      Jumlah_Meja: r.deskCount,
      Jumlah_Kursi: r.chairCount,
      Penanggung_Jawab: r.personInCharge || '-',
      Status: r.status,
      Keterangan: r.description || '-'
    }));
    ExcelService.exportToExcel(dataToExport, `Data_Master_Ruang_${settings.schoolName}`);
  };

  // Import Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await ExcelService.parseExcelFile(file);
      if (rows.length === 0) {
        alert('File Excel kosong atau format tidak sesuai.');
        return;
      }

      let count = 0;
      rows.forEach((row: any) => {
        const code = row['Kode_Ruang'] || row['Kode'] || row['code'];
        const name = row['Nama_Ruang'] || row['Nama'] || row['name'];
        if (code && name) {
          const roomObj: Room = {
            id: `room-imp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            code: String(code).trim().toUpperCase(),
            name: String(name).trim(),
            building: String(row['Gedung'] || 'Gedung A'),
            floor: Number(row['Lantai'] || 1),
            capacity: Number(row['Kapasitas'] || 30),
            computerCount: Number(row['Jumlah_Komputer'] || 0),
            deskCount: Number(row['Jumlah_Meja'] || 30),
            chairCount: Number(row['Jumlah_Kursi'] || 30),
            personInCharge: row['Penanggung_Jawab'] || '',
            status: (row['Status'] as RoomStatus) || 'Aktif',
            description: row['Keterangan'] || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          StorageService.saveRoom(roomObj);
          count++;
        }
      });

      onRefresh();
      setSuccessMessage(`Berhasil mengimpor ${count} ruang dari file Excel.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal import file: ${err.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Area when active */}
      {isPrinting ? (
        <div className="bg-white p-8 max-w-4xl mx-auto text-black">
          <div className="flex justify-end gap-2 mb-4 no-print">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
            >
              Cetak Dokumen
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
            documentTitle="DAFTAR MASTER RUANG UJIAN SEKOLAH"
            documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
          />

          <table className="w-full border-collapse border border-black text-xs mt-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 text-center w-10">No</th>
                <th className="border border-black p-2 text-left">Kode</th>
                <th className="border border-black p-2 text-left">Nama Ruang</th>
                <th className="border border-black p-2 text-left">Gedung / Lantai</th>
                <th className="border border-black p-2 text-center">Kapasitas</th>
                <th className="border border-black p-2 text-center">Komputer</th>
                <th className="border border-black p-2 text-center">Status</th>
                <th className="border border-black p-2 text-left">Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((r, idx) => (
                <tr key={r.id}>
                  <td className="border border-black p-2 text-center">{idx + 1}</td>
                  <td className="border border-black p-2 font-bold">{r.code}</td>
                  <td className="border border-black p-2">{r.name}</td>
                  <td className="border border-black p-2">
                    {r.building}, Lantai {r.floor}
                  </td>
                  <td className="border border-black p-2 text-center font-bold">
                    {r.capacity}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {r.computerCount > 0 ? r.computerCount : '-'}
                  </td>
                  <td className="border border-black p-2 text-center">{r.status}</td>
                  <td className="border border-black p-2">{r.personInCharge || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex justify-between text-xs font-serif">
            <div></div>
            <div className="text-center w-64">
              <p>Depok, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p className="mt-1 font-semibold">Ketua Panitia Ujian,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{settings.committeeHeadName}</p>
              <p>NIP. {settings.committeeHeadNip}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Title & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Master Ruang Ujian
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola ruang, gedung, kapasitas, jumlah komputer, dan validasi bentrok jadwal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => ExcelService.downloadTemplate('rooms')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                title="Download Format Template Excel"
              >
                Template Excel
              </button>

              <label className="cursor-pointer px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
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
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => setIsPrinting(true)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Daftar</span>
              </button>

              {rooms.length > 0 && (
                <button
                  onClick={handleOpenDeleteAll}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Hapus seluruh data ruang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}

              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ruang</span>
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-800 text-xs font-medium flex items-start gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kode ruang, nama, atau gedung..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Status: Aktif</option>
                <option value="Tidak Aktif">Status: Tidak Aktif</option>
                <option value="Dalam Perbaikan">Status: Dalam Perbaikan</option>
              </select>

              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Gedung</option>
                {uniqueBuildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {(searchTerm || statusFilter !== 'ALL' || buildingFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setBuildingFilter('ALL');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {selectedRoomIds.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                  {selectedRoomIds.length}
                </span>
                <span className="text-xs font-medium text-amber-900">
                  ruang ujian dipilih dari total {rooms.length} ruang
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoomIds([])}
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
                  <span>Hapus Terpilih ({selectedRoomIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Table of Rooms */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredRooms.length > 0 && selectedRoomIds.length === filteredRooms.length}
                        onChange={handleToggleSelectAll}
                        title="Pilih Semua Ruang"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Ruang</th>
                    <th className="py-3 px-4">Gedung &amp; Lantai</th>
                    <th className="py-3 px-4 text-center">Kapasitas</th>
                    <th className="py-3 px-4 text-center">Komputer</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Penanggung Jawab</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-slate-400">
                        Tidak ada data ruang yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room, idx) => (
                      <tr
                        key={room.id}
                        className={`transition-colors ${
                          selectedRoomIds.includes(room.id) ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRoomIds.includes(room.id)}
                            onChange={() => handleToggleSelectRoom(room.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">
                            {room.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {room.name}
                          {room.description && (
                            <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                              {room.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {room.building}, Lt. {room.floor}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-slate-900 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {room.capacity} peserta
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {room.computerCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                              <Monitor className="w-3 h-3 text-slate-500" />
                              {room.computerCount} PC
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleStatus(room)}
                            title="Klik untuk ubah status"
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              room.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : room.status === 'Dalam Perbaikan'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {room.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {room.personInCharge || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailRoom(room)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(room)}
                              className="p-1 text-slate-500 hover:text-amber-600 rounded hover:bg-amber-50"
                              title="Edit Ruang"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(room.id, room.code)}
                              className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Hapus Ruang"
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

            <div className="p-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Menampilkan {filteredRooms.length} dari {rooms.length} ruang</span>
              <span className="text-[11px] text-slate-400">
                Total Kapasitas Keseluruhan:{' '}
                <strong className="text-slate-700">
                  {rooms.reduce((acc, r) => acc + r.capacity, 0)} kursi
                </strong>
              </span>
            </div>
          </div>
        </>
      )}

      {/* Modal Tambah / Edit Ruang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-blue-600" />
                {editingRoom ? `Edit Ruang ${editingRoom.code}` : 'Tambah Ruang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kode Ruang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    placeholder="Contoh: R-01, LAB-01"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Ruang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="Contoh: Ruang Teori 01"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Gedung
                  </label>
                  <input
                    type="text"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    placeholder="Gedung A, Gedung B"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Lantai
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Kapasitas Ruang (Peserta) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Komputer
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formComputerCount}
                    onChange={(e) => setFormComputerCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Meja
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDeskCount}
                    onChange={(e) => setFormDeskCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Kursi
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formChairCount}
                    onChange={(e) => setFormChairCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Penanggung Jawab Ruang
                </label>
                <input
                  type="text"
                  value={formPersonInCharge}
                  onChange={(e) => setFormPersonInCharge(e.target.value)}
                  placeholder="Nama guru / staf penanggung jawab"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Status Ruang
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as RoomStatus)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Aktif">Aktif (Dapat digunakan untuk ujian)</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan (Sedang Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Fasilitas Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan kondisi AC, pencahayaan, proyektor..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs"
                >
                  {editingRoom ? 'Simpan Perubahan' : 'Tambah Ruang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Ruang Modal */}
      {detailRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-blue-600" />
                Detail Ruang: {detailRoom.code}
              </h3>
              <button
                onClick={() => setDetailRoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Ruang:</span>
                <span className="font-semibold text-slate-800">{detailRoom.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-semibold text-slate-800">
                  {detailRoom.building}, Lantai {detailRoom.floor}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kapasitas Maksimal:</span>
                <span className="font-bold text-blue-700">{detailRoom.capacity} peserta</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Komputer / PC:</span>
                <span className="font-semibold text-slate-800">
                  {detailRoom.computerCount} unit
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Meja &amp; Kursi:</span>
                <span className="font-semibold text-slate-800">
                  {detailRoom.deskCount} meja, {detailRoom.chairCount} kursi
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Operasional:</span>
                <span className="font-bold text-slate-800">{detailRoom.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800">
                  {detailRoom.personInCharge || '-'}
                </span>
              </div>
              {detailRoom.description && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Keterangan:</span>
                  <p className="bg-slate-50 p-2 rounded text-slate-700">
                    {detailRoom.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailRoom(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={isDeleteAll ? 'Hapus Seluruh Data Ruang' : 'Hapus Ruang Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh data ruang ujian? Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedRoomIds.length} ruang ujian yang dipilih?`
        }
        itemCount={isDeleteAll ? rooms.length : selectedRoomIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Ruang' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
        canForce={true}
        forceChecked={forceDelete}
        onToggleForce={setForceDelete}
        forceWarning="Centang opsi ini jika ingin menghapus paksa ruang meskipun sudah digunakan dalam jadwal ujian."
      />
    </div>
  );
};
