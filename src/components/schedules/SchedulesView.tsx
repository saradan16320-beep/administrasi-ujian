import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DoorOpen,
  Users,
  BookOpen,
  UserCheck,
  Clock,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import {
  ExamSchedule,
  ExamScheduleGroup,
  Room,
  ClassItem,
  Subject,
  Supervisor,
  Student,
  SchoolSetting
} from '../../types';
import { StorageService } from '../../lib/storage';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SchedulesViewProps {
  schedules: ExamSchedule[];
  rooms: Room[];
  classes: ClassItem[];
  subjects: Subject[];
  supervisors: Supervisor[];
  students: Student[];
  settings: SchoolSetting;
  onRefresh: () => void;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  schedules,
  rooms,
  classes,
  subjects,
  supervisors,
  students,
  settings,
  onRefresh
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'LIST' | 'BY_ROOM' | 'BY_DATE'>('LIST');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selection & Bulk delete state
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  // Modals & messages
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  const [detailSchedule, setDetailSchedule] = useState<ExamSchedule | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState('2026-10-20');
  const [formSession, setFormSession] = useState(1);
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('09:30');
  const [formRoomId, setFormRoomId] = useState(rooms[0]?.id || '');
  const [formSupervisors, setFormSupervisors] = useState<string[]>([
    supervisors[0]?.id || ''
  ]);
  const [formAllowCapacityOverride, setFormAllowCapacityOverride] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Dynamic Multi-Group form array
  const [formGroups, setFormGroups] = useState<
    {
      id: string;
      classId: string;
      subjectId: string;
      participantCount: number;
    }[]
  >([
    {
      id: 'grp-init-1',
      classId: classes[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      participantCount: 10
    }
  ]);

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const supervisorMap = useMemo(
    () => new Map(supervisors.map((s) => [s.id, s])),
    [supervisors]
  );

  // Unique dates from schedules
  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    schedules.forEach((s) => set.add(s.date));
    return Array.from(set).sort();
  }, [schedules]);

  // Selected room for capacity check in modal
  const selectedRoom = useMemo(
    () => roomMap.get(formRoomId),
    [formRoomId, roomMap]
  );
  const currentTotalParticipants = useMemo(
    () => formGroups.reduce((acc, g) => acc + (Number(g.participantCount) || 0), 0),
    [formGroups]
  );
  const isOverCapacity = selectedRoom
    ? currentTotalParticipants > selectedRoom.capacity
    : false;

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((sch) => {
      const matchDate = selectedDateFilter === 'ALL' || sch.date === selectedDateFilter;
      const matchRoom = selectedRoomFilter === 'ALL' || sch.roomId === selectedRoomFilter;
      const room = roomMap.get(sch.roomId);
      const matchSearch =
        sch.date.includes(searchTerm) ||
        (room && room.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room && room.code.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchDate && matchRoom && matchSearch;
    });
  }, [schedules, selectedDateFilter, selectedRoomFilter, searchTerm, roomMap]);

  // Add a group row in modal
  const handleAddGroupRow = () => {
    setFormGroups((prev) => [
      ...prev,
      {
        id: `grp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        classId: classes[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        participantCount: 10
      }
    ]);
  };

  const handleRemoveGroupRow = (index: number) => {
    if (formGroups.length <= 1) {
      alert('Minimal harus ada 1 kelompok kelas dalam jadwal');
      return;
    }
    setFormGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGroupChange = (
    index: number,
    field: 'classId' | 'subjectId' | 'participantCount',
    val: any
  ) => {
    setFormGroups((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormDate(uniqueDates[0] || '2026-10-20');
    setFormSession(1);
    setFormStartTime('07:30');
    setFormEndTime('09:30');
    setFormRoomId(rooms[0]?.id || '');
    setFormSupervisors([supervisors[0]?.id || '']);
    setFormAllowCapacityOverride(false);
    setFormNotes('');
    setValidationErrors([]);
    setValidationWarnings([]);
    setFormGroups([
      {
        id: `grp-1`,
        classId: classes[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        participantCount: 10
      },
      {
        id: `grp-2`,
        classId: classes[1]?.id || classes[0]?.id || '',
        subjectId: subjects[1]?.id || subjects[0]?.id || '',
        participantCount: 10
      }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (sch: ExamSchedule) => {
    setEditingSchedule(sch);
    setFormDate(sch.date);
    setFormSession(sch.session);
    setFormStartTime(sch.startTime);
    setFormEndTime(sch.endTime);
    setFormRoomId(sch.roomId);
    setFormSupervisors(sch.supervisors.map((s) => s.supervisorId));
    setFormAllowCapacityOverride(sch.allowCapacityOverride || false);
    setFormNotes(sch.notes || '');
    setValidationErrors([]);
    setValidationWarnings([]);
    setFormGroups(
      sch.groups.map((g) => ({
        id: g.id,
        classId: g.classId,
        subjectId: g.subjectId,
        participantCount: g.participantCount
      }))
    );
    setIsModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleId = editingSchedule ? editingSchedule.id : `sch-${Date.now()}`;
    const mappedGroups: ExamScheduleGroup[] = formGroups.map((g) => ({
      id: g.id,
      scheduleId: scheduleId,
      classId: g.classId,
      subjectId: g.subjectId,
      participantCount: Number(g.participantCount)
    }));

    const scheduleObj: ExamSchedule = {
      id: scheduleId,
      academicYear: settings.academicYear,
      semester: settings.semester,
      examType: settings.examName,
      date: formDate,
      session: Number(formSession),
      startTime: formStartTime,
      endTime: formEndTime,
      roomId: formRoomId,
      allowCapacityOverride: formAllowCapacityOverride,
      notes: formNotes,
      status: 'Terjadwal',
      groups: mappedGroups,
      supervisors: formSupervisors
        .filter(Boolean)
        .map((supId, idx) => ({
          id: `sup-assign-${Date.now()}-${idx}`,
          scheduleId: scheduleId,
          supervisorId: supId,
          order: idx + 1
        })),
      createdAt: editingSchedule ? editingSchedule.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Run Backend Interval Conflict Validation
    const validation = StorageService.validateSchedule(scheduleObj);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      return;
    }

    if (validation.warnings.length > 0 && !formAllowCapacityOverride) {
      setValidationWarnings(validation.warnings);
    }

    StorageService.saveSchedule(scheduleObj);
    setIsModalOpen(false);
    onRefresh();
    setSuccessMessage('Jadwal ujian berhasil disimpan dan divalidasi bebas bentrok.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus jadwal ujian ini?')) {
      StorageService.deleteSchedule(id);
      setSelectedScheduleIds((prev) => prev.filter((item) => item !== id));
      onRefresh();
      setSuccessMessage('Jadwal ujian berhasil dihapus.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedScheduleIds.length === filteredSchedules.length) {
      setSelectedScheduleIds([]);
    } else {
      setSelectedScheduleIds(filteredSchedules.map((s) => s.id));
    }
  };

  const handleToggleSelectSchedule = (id: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteAll = () => {
    if (schedules.length === 0) return;
    setIsDeleteAll(true);
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedScheduleIds.length === 0) return;
    setIsDeleteAll(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isDeleteAll) {
      const res = StorageService.clearAllSchedules();
      setSelectedScheduleIds([]);
      onRefresh();
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      const res = StorageService.deleteMultipleSchedules(selectedScheduleIds);
      setSelectedScheduleIds([]);
      onRefresh();
      setSuccessMessage(res.message);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Pengaturan Jadwal Ujian (Multi-Kelas &amp; Multi-Mapel)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung 1 ruang dengan siswa dari berbagai kelas dan mapel berbeda pada sesi yang sama dengan validasi interval waktu real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggles */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setActiveViewMode('LIST')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeViewMode === 'LIST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jadwal
            </button>
            <button
              onClick={() => setActiveViewMode('BY_ROOM')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeViewMode === 'BY_ROOM'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Ruang
            </button>
            <button
              onClick={() => setActiveViewMode('BY_DATE')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeViewMode === 'BY_DATE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Tanggal
            </button>
          </div>

          {schedules.length > 0 && (
            <button
              onClick={handleOpenDeleteAll}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Hapus seluruh data jadwal ujian"
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
            Buat Jadwal Baru
          </button>
        </div>
      </div>

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
            placeholder="Cari ruang, tanggal, atau kode..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Tanggal</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                Tanggal {d}
              </option>
            ))}
          </select>

          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Ruang</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedScheduleIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
              {selectedScheduleIds.length}
            </span>
            <span className="text-xs font-medium text-amber-900">
              jadwal ujian dipilih dari total {schedules.length} jadwal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedScheduleIds([])}
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
              <span>Hapus Terpilih ({selectedScheduleIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Standard List View with Multi-Group Breakdown */}
      {activeViewMode === 'LIST' && (
        <div className="space-y-3">
          {filteredSchedules.length > 0 && (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={filteredSchedules.length > 0 && selectedScheduleIds.length === filteredSchedules.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Pilih Semua Jadwal ({filteredSchedules.length})</span>
              </label>
            </div>
          )}

          {filteredSchedules.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
              Tidak ada jadwal ujian yang sesuai kriteria.
            </div>
          ) : (
            filteredSchedules.map((sch) => {
              const room = roomMap.get(sch.roomId);
              const totalPeserta = sch.groups.reduce((acc, g) => acc + g.participantCount, 0);
              const isOver = room ? totalPeserta > room.capacity : false;
              const isSelected = selectedScheduleIds.includes(sch.id);

              return (
                <div
                  key={sch.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs transition-all space-y-3 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar of Schedule Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectSchedule(sch.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Pilih Jadwal Ini"
                      />
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs">
                        {sch.date}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sch.startTime} - {sch.endTime}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                        Sesi {sch.session}
                      </span>
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <DoorOpen className="w-4 h-4 text-amber-600" />
                        {room ? `${room.code} (${room.name})` : sch.roomId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        Total: {totalPeserta} / {room?.capacity || 30} Kursi
                        {isOver && ' (Kelebihan Kapasitas)'}
                      </span>

                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => setDetailSchedule(sch)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50"
                          title="Lihat Rincian Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(sch)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded hover:bg-amber-50"
                          title="Edit Jadwal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sch.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Class & Multi-Subject Group Matrix */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Daftar Kelas &amp; Mata Pelajaran Dalam Ruang Ini ({sch.groups.length} Kelompok):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {sch.groups.map((grp, gIdx) => {
                        const cls = classMap.get(grp.classId);
                        const sub = subjectMap.get(grp.subjectId);
                        return (
                          <div
                            key={grp.id}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-800">
                                {cls ? cls.name : grp.classId}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                {grp.participantCount} Siswa
                              </span>
                            </div>
                            <p className="text-blue-700 font-semibold truncate">
                              {sub ? sub.name : grp.subjectId}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1">
                              Kelompok {gIdx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Supervisors */}
                  <div className="flex flex-wrap items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Pengawas Ruang:</span>
                      {sch.supervisors.length > 0 ? (
                        sch.supervisors.map((sa) => {
                          const sup = supervisorMap.get(sa.supervisorId);
                          return (
                            <span
                              key={sa.id}
                              className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-xs font-semibold"
                            >
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              {sup?.name || 'Pengawas'}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-rose-600 italic">Belum ada pengawas</span>
                      )}
                    </div>

                    {sch.notes && (
                      <span className="text-[11px] text-slate-500 italic truncate max-w-sm">
                        Catatan: {sch.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: By Room */}
      {activeViewMode === 'BY_ROOM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const roomSchedules = schedules.filter((s) => s.roomId === room.id);
            return (
              <div
                key={room.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-amber-600" />
                      {room.code} - {room.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {room.building}, Kapasitas {room.capacity} peserta
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-xs">
                    {roomSchedules.length} Sesi
                  </span>
                </div>

                <div className="space-y-2">
                  {roomSchedules.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Belum ada jadwal pada ruang ini.
                    </p>
                  ) : (
                    roomSchedules.map((sch) => {
                      const totalP = sch.groups.reduce((acc, g) => acc + g.participantCount, 0);
                      return (
                        <div
                          key={sch.id}
                          className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-800">
                              {sch.date} ({sch.startTime} - {sch.endTime})
                            </span>
                            <span className="text-blue-700 font-bold">
                              {totalP} / {room.capacity} Siswa
                            </span>
                          </div>

                          <div className="space-y-1">
                            {sch.groups.map((grp) => {
                              const cls = classMap.get(grp.classId);
                              const sub = subjectMap.get(grp.subjectId);
                              return (
                                <div
                                  key={grp.id}
                                  className="text-[11px] flex justify-between bg-white px-2 py-1 rounded border border-slate-200"
                                >
                                  <span className="font-medium text-slate-800">
                                    {cls?.name} &rarr; {sub?.name}
                                  </span>
                                  <span className="text-slate-500 font-mono">
                                    {grp.participantCount} peserta
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: By Date */}
      {activeViewMode === 'BY_DATE' && (
        <div className="space-y-4">
          {uniqueDates.map((date) => {
            const dateSchedules = schedules.filter((s) => s.date === date);
            return (
              <div
                key={date}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Hari Pelaksanaan: {date}
                  </span>
                  <span>{dateSchedules.length} Sesi Terjadwal</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {dateSchedules.map((sch) => {
                    const room = roomMap.get(sch.roomId);
                    const totalP = sch.groups.reduce((acc, g) => acc + g.participantCount, 0);
                    return (
                      <div key={sch.id} className="p-3 hover:bg-slate-50 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-800">
                              {sch.startTime} - {sch.endTime}
                            </span>
                            <span className="font-bold text-slate-800">
                              {room ? `${room.code} (${room.name})` : sch.roomId}
                            </span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              Sesi {sch.session}
                            </span>
                          </div>
                          <span className="font-bold text-slate-700">
                            {totalP} Siswa
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {sch.groups.map((grp) => {
                            const cls = classMap.get(grp.classId);
                            const sub = subjectMap.get(grp.subjectId);
                            return (
                              <span
                                key={grp.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px]"
                              >
                                <strong>{cls?.name}</strong>: {sub?.name} ({grp.participantCount} siswa)
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat / Edit Jadwal Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  {editingSchedule ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Konfigurasi sesi, ruang, pengawas, dan kombinasi multi-kelas / multi-mapel.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-5 space-y-5 text-xs">
              {/* Conflict / Validation Errors Alert */}
              {validationErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Bentrok Jadwal Terdeteksi!
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-rose-800 space-y-0.5">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <Info className="w-4 h-4 text-amber-600" />
                    Peringatan Kapasitas Ruang:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                    {validationWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Basic Session Parameters */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  1. Waktu &amp; Ruang Ujian
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tanggal Ujian <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Sesi Ke- <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formSession}
                      onChange={(e) => setFormSession(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
                    >
                      <option value={1}>Sesi 1 (Pagi)</option>
                      <option value={2}>Sesi 2 (Siang)</option>
                      <option value={3}>Sesi 3 (Sore)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jam Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jam Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Pilih Ruang Ujian <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formRoomId}
                      onChange={(e) => setFormRoomId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white font-semibold"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name} (Kapasitas: {r.capacity} siswa)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Real-time Capacity Progress Bar */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Kapasitas &amp; Pengisian Ruang:
                    </label>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span>Total Peserta Direncanakan:</span>
                        <strong
                          className={
                            isOverCapacity ? 'text-rose-600 font-bold' : 'text-slate-800'
                          }
                        >
                          {currentTotalParticipants} / {selectedRoom?.capacity || 30}
                        </strong>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isOverCapacity ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (currentTotalParticipants / (selectedRoom?.capacity || 30)) *
                                100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {isOverCapacity && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="overrideCap"
                      checked={formAllowCapacityOverride}
                      onChange={(e) => setFormAllowCapacityOverride(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <label
                      htmlFor="overrideCap"
                      className="text-[11px] font-semibold text-rose-700"
                    >
                      Izinkan Kelebihan Kapasitas (Meja tambahan telah disediakan)
                    </label>
                  </div>
                )}
              </div>

              {/* CORE REQUIREMENT: Multi-Class & Multi-Subject Matrix */}
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      2. Pengaturan Multi-Kelas &amp; Multi-Mata Pelajaran Dalam Ruang Ini
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tambahkan kelompok kelas dan mapel yang akan digabung dalam 1 ruangan ini.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGroupRow}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Kelompok
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formGroups.map((grp, idx) => (
                    <div
                      key={grp.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Kelas Peserta:
                        </label>
                        <select
                          value={grp.classId}
                          onChange={(e) =>
                            handleGroupChange(idx, 'classId', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Mata Pelajaran yang Diujikan:
                        </label>
                        <select
                          value={grp.subjectId}
                          onChange={(e) =>
                            handleGroupChange(idx, 'subjectId', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs font-medium"
                        >
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code} - {s.durationMinutes}m)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Jml Siswa:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={grp.participantCount}
                          onChange={(e) =>
                            handleGroupChange(
                              idx,
                              'participantCount',
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs font-bold text-center"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveGroupRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Hapus baris kelompok ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisors Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  3. Penugasan Pengawas Ruang
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Pengawas Utama (1) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formSupervisors[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormSupervisors((prev) => [val, prev[1] || '']);
                      }}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
                    >
                      <option value="">Pilih Pengawas 1...</option>
                      {supervisors
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.nip || 'Guru'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Pengawas Pendamping (2) (Opsional)
                    </label>
                    <select
                      value={formSupervisors[1] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormSupervisors((prev) => [prev[0] || '', val]);
                      }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
                    >
                      <option value="">Tidak ada (Pengawas Tunggal)</option>
                      {supervisors
                        .filter((s) => s.isActive && s.id !== formSupervisors[0])
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.nip || 'Guru'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Catatan Sesi Jadwal
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Gabungan kelas ujian susulan / reguler"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold shadow-sm"
                >
                  Validasi &amp; Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                Detail Jadwal Ujian
              </h3>
              <button
                onClick={() => setDetailSchedule(null)}
                className="p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal:</span>
                  <span className="font-bold text-slate-800">{detailSchedule.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waktu / Sesi:</span>
                  <span className="font-bold text-slate-800">
                    {detailSchedule.startTime} - {detailSchedule.endTime} (Sesi{' '}
                    {detailSchedule.session})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Ruang:</span>
                  <span className="font-bold text-slate-800">
                    {roomMap.get(detailSchedule.roomId)?.name || detailSchedule.roomId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Peserta:</span>
                  <span className="font-bold text-blue-700">
                    {detailSchedule.groups.reduce((a, b) => a + b.participantCount, 0)}{' '}
                    Siswa
                  </span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1.5 uppercase text-[11px]">
                  Rincian Gabungan Kelompok:
                </p>
                <div className="space-y-1.5">
                  {detailSchedule.groups.map((grp, i) => {
                    const cls = classMap.get(grp.classId);
                    const sub = subjectMap.get(grp.subjectId);
                    return (
                      <div
                        key={grp.id}
                        className="p-2 rounded border border-slate-200 bg-white flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{cls?.name}</p>
                          <p className="text-blue-700 font-medium">{sub?.name}</p>
                        </div>
                        <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {grp.participantCount} Siswa
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1 uppercase text-[11px]">
                  Pengawas Ruang:
                </p>
                <div className="space-y-1">
                  {detailSchedule.supervisors.map((sa) => {
                    const sup = supervisorMap.get(sa.supervisorId);
                    return (
                      <div
                        key={sa.id}
                        className="flex items-center gap-2 text-slate-700 bg-purple-50 p-1.5 rounded border border-purple-100"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-medium">{sup?.name}</span>
                        <span className="text-[11px] text-purple-600 font-mono">
                          ({sup?.nip || 'Guru'})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailSchedule(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md font-semibold"
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
        title={isDeleteAll ? 'Hapus Seluruh Jadwal Ujian' : 'Hapus Jadwal Ujian Terpilih'}
        message={
          isDeleteAll
            ? 'Apakah Anda yakin ingin menghapus seluruh jadwal ujian? Seluruh alokasi ruang, pengawas, dan kelompok kelas/mapel akan dihapus. Tindakan ini tidak dapat dibatalkan.'
            : `Apakah Anda yakin ingin menghapus ${selectedScheduleIds.length} jadwal ujian yang dipilih?`
        }
        itemCount={isDeleteAll ? schedules.length : selectedScheduleIds.length}
        confirmLabel={isDeleteAll ? 'Hapus Semua Jadwal' : 'Hapus Terpilih'}
        isAll={isDeleteAll}
      />
    </div>
  );
};
