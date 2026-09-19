import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  DoorOpen,
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Flame,
  UserX
} from 'lucide-react';
import {
  SchoolSetting,
  Room,
  ClassItem,
  Subject,
  Supervisor,
  Student,
  ExamSchedule,
  ExamMinute,
  StudentAttendance
} from '../../types';
import { NavItemKey } from '../layout/Sidebar';

interface DashboardViewProps {
  settings: SchoolSetting;
  rooms: Room[];
  classes: ClassItem[];
  subjects: Subject[];
  supervisors: Supervisor[];
  students: Student[];
  schedules: ExamSchedule[];
  minutes: ExamMinute[];
  attendances?: StudentAttendance[];
  onNavigate: (tab: NavItemKey) => void;
  conflictCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  rooms,
  classes,
  subjects,
  supervisors,
  students,
  schedules,
  minutes,
  attendances = [],
  onNavigate,
  conflictCount = 0
}) => {
  // Attendance stats
  const totalAttendances = attendances.length;
  const hadirCount = attendances.filter((a) => a.status === 'Hadir').length;
  const sakitCount = attendances.filter((a) => a.status === 'Sakit').length;
  const izinCount = attendances.filter((a) => a.status === 'Izin').length;
  const alpaCount = attendances.filter((a) => a.status === 'Alpa' || a.status === 'Tidak Hadir').length;
  const hadirPercentage = totalAttendances > 0 ? Math.round((hadirCount / totalAttendances) * 100) : 0;

  // Active rooms
  const activeRooms = rooms.filter((r) => r.status === 'Aktif');

  // Today's schedules (defaulting to the first scheduled date for demo or current date)
  const targetDate = schedules.length > 0 ? schedules[0].date : '2026-10-20';
  const todaySchedules = schedules.filter((s) => s.date === targetDate);

  // Map helpers
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const supervisorMap = new Map(supervisors.map((s) => [s.id, s]));

  const statCards = [
    {
      label: 'Total Siswa',
      value: students.length,
      sub: `${students.filter((s) => s.status === 'AKTIF').length} Siswa Aktif`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      tab: 'students' as NavItemKey
    },
    {
      label: 'Total Kelas',
      value: classes.length,
      sub: 'Tingkat X, XI, XII',
      icon: GraduationCap,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      tab: 'classes' as NavItemKey
    },
    {
      label: 'Mata Pelajaran',
      value: subjects.length,
      sub: 'Muatan Nasional & Kejuruan',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      tab: 'subjects' as NavItemKey
    },
    {
      label: 'Pengawas Ujian',
      value: supervisors.length,
      sub: `${supervisors.filter((s) => s.isActive).length} Siap Bertugas`,
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      tab: 'supervisors' as NavItemKey
    },
    {
      label: 'Ruang Ujian',
      value: rooms.length,
      sub: `${activeRooms.length} Ruang Aktif`,
      icon: DoorOpen,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      tab: 'rooms' as NavItemKey
    },
    {
      label: 'Jadwal Ujian',
      value: schedules.length,
      sub: 'Sesi Multi-Kelompok',
      icon: CalendarDays,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      tab: 'schedules' as NavItemKey
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-xl p-5 md:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 text-blue-400" />
                Sistem Terpadu Pelaksanaan Ujian
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                {settings.schoolName}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
                {settings.examName} • Tahun Pelajaran {settings.academicYear} (Semester {settings.semester}).
                Mendukung 1 Ruang untuk Multi-Kelas dan Multi-Mata Pelajaran secara native dengan validasi bentrok real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onNavigate('schedules')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CalendarDays className="w-4 h-4" />
                Kelola Jadwal
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Cetak Laporan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clash / Conflict Warning Alert if any */}
      {conflictCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Peringatan Jadwal Bentrok Terdeteksi!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Terdapat potensi bentrok ruang atau kelebihan kapasitas peserta pada jadwal ujian aktif.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('schedules')}
            className="text-xs font-bold text-amber-900 hover:underline shrink-0"
          >
            Lihat Jadwal &rarr;
          </button>
        </div>
      )}

      {/* Top 6 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.tab)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{card.label}</p>
              <p className="text-[11px] text-slate-400 truncate">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Today's Exam Schedules & Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Exam Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Jadwal Ujian Terdekat ({targetDate})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('schedules')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Semua Jadwal &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todaySchedules.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada jadwal ujian pada tanggal ini.
              </div>
            ) : (
              todaySchedules.map((sch) => {
                const room = roomMap.get(sch.roomId);
                const totalParticipants = sch.groups.reduce((sum, g) => sum + g.participantCount, 0);

                return (
                  <div key={sch.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                          {sch.startTime} - {sch.endTime}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {room ? `${room.code} (${room.name})` : sch.roomId}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          Sesi {sch.session}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Total Peserta:{' '}
                        <strong className="text-slate-800">{totalParticipants}</strong> /{' '}
                        {room?.capacity || 30}
                      </div>
                    </div>

                    {/* Multi-Group breakdown badge list */}
                    <div className="space-y-1.5 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Rincian Kelompok dalam Ruang Ini:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {sch.groups.map((grp) => {
                          const cls = classMap.get(grp.classId);
                          const sub = subjectMap.get(grp.subjectId);
                          return (
                            <div
                              key={grp.id}
                              className="bg-white p-2 rounded border border-slate-200 text-xs"
                            >
                              <p className="font-bold text-slate-800">
                                {cls ? cls.name : grp.classId}
                              </p>
                              <p className="text-blue-700 font-medium truncate">
                                {sub ? sub.name : grp.subjectId}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {grp.participantCount} peserta
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Supervisors list */}
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium text-slate-500">Pengawas:</span>
                      {sch.supervisors.length > 0 ? (
                        sch.supervisors.map((sa) => {
                          const sup = supervisorMap.get(sa.supervisorId);
                          return (
                            <span
                              key={sa.id}
                              className="inline-flex items-center gap-1 font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200"
                            >
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              {sup?.name || 'Pengawas'}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-amber-600 italic">Belum ditugaskan pengawas</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Kehadiran & Berita Acara Status */}
        <div className="space-y-4">
          {/* Kehadiran Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Statistik Kehadiran
              </h3>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs text-blue-600 hover:underline"
              >
                Daftar Hadir
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-black text-slate-900">{hadirPercentage}%</p>
                <p className="text-[11px] text-slate-500">Persentase Hadir Siswa</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border-2 border-emerald-500">
                {hadirCount}/{totalAttendances || students.length}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
                <p className="font-bold text-emerald-700">{hadirCount}</p>
                <p className="text-[10px] text-emerald-600">Hadir</p>
              </div>
              <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
                <p className="font-bold text-amber-700">{sakitCount}</p>
                <p className="text-[10px] text-amber-600">Sakit</p>
              </div>
              <div className="bg-blue-50 p-1.5 rounded border border-blue-100">
                <p className="font-bold text-blue-700">{izinCount}</p>
                <p className="text-[10px] text-blue-600">Izin</p>
              </div>
              <div className="bg-rose-50 p-1.5 rounded border border-rose-100">
                <p className="font-bold text-rose-700">{alpaCount}</p>
                <p className="text-[10px] text-rose-600">Alpa</p>
              </div>
            </div>
          </div>

          {/* Berita Acara Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-purple-600" />
                Status Berita Acara
              </h3>
              <button
                onClick={() => onNavigate('minutes')}
                className="text-xs text-blue-600 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Berita Acara Terisi:</span>
                <span className="font-bold text-slate-900">
                  {minutes.length} / {schedules.length} Sesi
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Verifikasi Pengawas:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {minutes.filter((m) => m.verifiedBySupervisor).length} Selesai
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('minutes')}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors text-center"
            >
              Buka Modul Berita Acara
            </button>
          </div>

          {/* Siswa Susulan Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-600" />
                Ujian Susulan Siswa
              </h3>
              <button
                onClick={() => onNavigate('makeup' as NavItemKey)}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Lihat Semua
              </button>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-rose-700 font-medium block">Perlu Ujian Susulan:</span>
                <span className="text-lg font-black text-rose-900">
                  {sakitCount + izinCount + alpaCount} Siswa
                </span>
              </div>
              <span className="px-2 py-1 bg-rose-200 text-rose-800 text-[10px] font-bold rounded-full uppercase">
                Otomatis Sync
              </span>
            </div>

            <button
              onClick={() => onNavigate('makeup' as NavItemKey)}
              className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Kelola & Konfirmasi Susulan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
