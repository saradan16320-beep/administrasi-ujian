import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Printer,
  Users,
  UserCheck,
  CheckCircle2,
  Calendar,
  Clock,
  DoorOpen,
  Search,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import {
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

interface AttendanceViewProps {
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

export const AttendanceView: React.FC<AttendanceViewProps> = ({
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
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'SUPERVISOR'>('STUDENT');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules[0]?.id || ''
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const supervisorMap = useMemo(
    () => new Map(supervisors.map((s) => [s.id, s])),
    [supervisors]
  );
  const scheduleMap = useMemo(
    () => new Map(schedules.map((s) => [s.id, s])),
    [schedules]
  );

  const activeSchedule = scheduleMap.get(selectedScheduleId) || schedules[0];
  const activeRoom = activeSchedule ? roomMap.get(activeSchedule.roomId) : null;

  // Students in this schedule's classes
  const assignedStudents = useMemo(() => {
    if (!activeSchedule) return [];
    const classIds = new Set(activeSchedule.groups.map((g) => g.classId));
    return students.filter((s) => classIds.has(s.classId) && s.status === 'AKTIF');
  }, [activeSchedule, students]);

  // Attendance lookup for quick status editing
  const attendanceMap = useMemo(() => {
    const map = new Map<string, StudentAttendance>();
    attendances.forEach((a) => {
      if (a.scheduleId === selectedScheduleId) {
        map.set(a.studentId, a);
      }
    });
    return map;
  }, [attendances, selectedScheduleId]);

  const updateStudentStatus = (
    studentId: string,
    status: 'Hadir' | 'Tidak Hadir' | 'Izin' | 'Sakit'
  ) => {
    const existing = attendanceMap.get(studentId);
    const updated: StudentAttendance = {
      id: existing ? existing.id : `att-${Date.now()}-${studentId}`,
      scheduleId: selectedScheduleId,
      studentId: studentId,
      status: status,
      timestamp: new Date().toISOString()
    };
    StorageService.saveStudentAttendance(updated);
    onRefresh();
  };

  const setAllPresent = () => {
    assignedStudents.forEach((stu) => {
      updateStudentStatus(stu.id, 'Hadir');
    });
    setSuccessMessage('Seluruh siswa berhasil ditandai Hadir.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const activeSup1 = activeSchedule?.supervisors[0]
    ? supervisorMap.get(activeSchedule.supervisors[0].supervisorId)
    : null;
  const activeSup2 = activeSchedule?.supervisors[1]
    ? supervisorMap.get(activeSchedule.supervisors[1].supervisorId)
    : null;

  return (
    <div className="space-y-6">
      {/* Print View */}
      {isPrinting ? (
        <div className="bg-white p-8 max-w-4xl mx-auto text-black font-serif text-xs">
          <div className="flex justify-end gap-2 mb-4 no-print font-sans">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
            >
              Cetak Dokumen (A4)
            </button>
            <button
              onClick={() => setIsPrinting(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
            >
              Kembali
            </button>
          </div>

          {activeTab === 'STUDENT' ? (
            <>
              <PrintHeader
                settings={settings}
                documentTitle="DAFTAR HADIR PESERTA UJIAN SEKOLAH"
                documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
              />

              <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-xs font-serif">
                <div>
                  <p>
                    Hari / Tanggal : <strong>{activeSchedule?.date}</strong>
                  </p>
                  <p>
                    Waktu / Sesi : <strong>{activeSchedule?.startTime} - {activeSchedule?.endTime} WIB (Sesi {activeSchedule?.session})</strong>
                  </p>
                </div>
                <div>
                  <p>
                    Ruang Ujian : <strong>{activeRoom?.code} ({activeRoom?.name})</strong>
                  </p>
                  <p>
                    Mata Pelajaran :{' '}
                    <strong>
                      {activeSchedule?.groups.map((g) => subjectMap.get(g.subjectId)?.name).join(', ')}
                    </strong>
                  </p>
                </div>
              </div>

              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-center w-28">No. Peserta</th>
                    <th className="border border-black p-1.5 text-left">Nama Peserta</th>
                    <th className="border border-black p-1.5 text-center w-20">Kelas</th>
                    <th className="border border-black p-1.5 text-center w-36" colSpan={2}>
                      Tanda Tangan
                    </th>
                    <th className="border border-black p-1.5 text-center w-20">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedStudents.map((stu, idx) => {
                    const cls = classMap.get(stu.classId);
                    const att = attendanceMap.get(stu.id);
                    const isEven = (idx + 1) % 2 === 0;

                    return (
                      <tr key={stu.id}>
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1 text-center font-mono font-semibold">
                          {stu.examNumber}
                        </td>
                        <td className="border border-black p-1 uppercase">{stu.name}</td>
                        <td className="border border-black p-1 text-center">{cls?.code}</td>
                        {/* Alternating Signatures */}
                        <td className="border border-black p-1 w-20 text-left text-[10px]">
                          {!isEven ? `${idx + 1}. ...........` : ''}
                        </td>
                        <td className="border border-black p-1 w-20 text-left text-[10px]">
                          {isEven ? `${idx + 1}. ...........` : ''}
                        </td>
                        <td className="border border-black p-1 text-center text-[10px] font-semibold">
                          {att?.status === 'Hadir' ? 'HADIR' : att?.status || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p>Pengawas Ruang I,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{activeSup1?.name || '____________________'}</p>
                  <p>NIP. {activeSup1?.nip || '....................................'}</p>
                </div>
                <div>
                  <p>Pengawas Ruang II,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{activeSup2?.name || '____________________'}</p>
                  <p>NIP. {activeSup2?.nip || '....................................'}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <PrintHeader
                settings={settings}
                documentTitle="DAFTAR HADIR PENGAWAS UJIAN SEKOLAH"
                documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
              />

              <table className="w-full border-collapse border border-black text-xs mt-4">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-2 text-center w-10">No</th>
                    <th className="border border-black p-2 text-left">Nama Pengawas</th>
                    <th className="border border-black p-2 text-left">NIP</th>
                    <th className="border border-black p-2 text-center">Ruang Tugas</th>
                    <th className="border border-black p-2 text-center">Tanggal &amp; Sesi</th>
                    <th className="border border-black p-2 text-center w-36">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch, sIdx) => {
                    const r = roomMap.get(sch.roomId);
                    return sch.supervisors.map((sa, supIdx) => {
                      const sup = supervisorMap.get(sa.supervisorId);
                      return (
                        <tr key={`${sch.id}-${sa.id}`}>
                          <td className="border border-black p-2 text-center">
                            {sIdx + supIdx + 1}
                          </td>
                          <td className="border border-black p-2 font-semibold">
                            {sup?.name}
                          </td>
                          <td className="border border-black p-2 font-mono">{sup?.nip || '-'}</td>
                          <td className="border border-black p-2 text-center font-bold">
                            {r?.code} ({r?.name})
                          </td>
                          <td className="border border-black p-2 text-center">
                            {sch.date} (Sesi {sch.session})
                          </td>
                          <td className="border border-black p-2 text-left text-gray-400">
                            {sIdx + supIdx + 1}. ....................
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end text-xs">
                <div className="text-center w-64">
                  <p>Depok, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                  <p className="mt-1 font-semibold">Ketua Panitia Ujian,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{settings.committeeHeadName}</p>
                  <p>NIP. {settings.committeeHeadNip}</p>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Daftar Hadir Ujian Sekolah
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan presensi siswa dan pengawas per sesi dengan format cetak resmi berkolom tanda tangan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrinting(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Format Presensi Fisik
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`pb-2.5 font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'STUDENT'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Presensi Siswa per Ruang / Sesi
            </button>
            <button
              onClick={() => setActiveTab('SUPERVISOR')}
              className={`pb-2.5 font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'SUPERVISOR'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Daftar Hadir Pengawas
            </button>
          </div>

          {activeTab === 'STUDENT' ? (
            <>
              {/* Schedule Picker Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Pilih Ruang &amp; Sesi:
                  </label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    {schedules.map((s) => {
                      const r = roomMap.get(s.roomId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.date} | Sesi {s.session} ({s.startTime}-{s.endTime}) | Ruang:{' '}
                          {r ? r.code : s.roomId}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={setAllPresent}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Tandai Semua Hadir
                  </button>
                </div>
              </div>

              {/* Student Attendance Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">
                      Daftar Peserta di Ruang {activeRoom?.code} ({activeRoom?.name})
                    </span>
                    <span className="text-slate-500 ml-2">
                      Total {assignedStudents.length} Peserta Terdaftar
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pengawas: {activeSup1?.name || '-'} {activeSup2 ? `& ${activeSup2.name}` : ''}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">No</th>
                        <th className="py-2.5 px-4">No. Peserta</th>
                        <th className="py-2.5 px-4">Nama Siswa</th>
                        <th className="py-2.5 px-4">Kelas</th>
                        <th className="py-2.5 px-4 text-center w-64">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">
                            Tidak ada siswa yang terdaftar dalam rombel jadwal ini.
                          </td>
                        </tr>
                      ) : (
                        assignedStudents.map((stu, idx) => {
                          const cls = classMap.get(stu.classId);
                          const att = attendanceMap.get(stu.id);
                          const status = att?.status || 'Hadir';

                          return (
                            <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-4 text-center text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                                {stu.examNumber}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-800">
                                {stu.name}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">{cls?.name}</td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5 text-[11px]">
                                  {(['Hadir', 'Sakit', 'Izin', 'Tidak Hadir'] as const).map(
                                    (st) => (
                                      <button
                                        key={st}
                                        onClick={() => updateStudentStatus(stu.id, st)}
                                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                                          status === st
                                            ? st === 'Hadir'
                                              ? 'bg-emerald-600 text-white shadow-xs'
                                              : st === 'Sakit'
                                              ? 'bg-amber-500 text-white shadow-xs'
                                              : st === 'Izin'
                                              ? 'bg-blue-600 text-white shadow-xs'
                                              : 'bg-rose-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        {st}
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Supervisor Attendance Tab */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">
                  Rekapitulasi Penugasan &amp; Kehadiran Pengawas Ujian
                </span>
                <span className="text-slate-500">
                  Total {supervisors.length} Pengawas Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Pengawas</th>
                      <th className="py-3 px-4">NIP</th>
                      <th className="py-3 px-4 text-center">Ruang Tugas</th>
                      <th className="py-3 px-4 text-center">Tanggal &amp; Sesi</th>
                      <th className="py-3 px-4 text-center">Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((sch, idx) => {
                      const r = roomMap.get(sch.roomId);
                      return sch.supervisors.map((sa, sIdx) => {
                        const sup = supervisorMap.get(sa.supervisorId);
                        return (
                          <tr key={`${sch.id}-${sa.id}`} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 text-center text-slate-400">
                              {idx + sIdx + 1}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              {sup?.name}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">
                              {sup?.nip || '-'}
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                              {r?.code} ({r?.name})
                            </td>
                            <td className="py-2.5 px-4 text-center text-slate-600">
                              {sch.date} • Sesi {sch.session}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Hadir &amp; Bertugas
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
