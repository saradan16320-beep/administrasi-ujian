import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Printer,
  Edit2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  DoorOpen,
  UserCheck,
  Sparkles,
  ClipboardList,
  RotateCcw,
  RefreshCw,
  X
} from 'lucide-react';
import {
  ExamMinute,
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

interface ExamMinutesViewProps {
  minutes: ExamMinute[];
  schedules: ExamSchedule[];
  rooms: Room[];
  classes: ClassItem[];
  subjects: Subject[];
  supervisors: Supervisor[];
  students?: Student[];
  attendances?: StudentAttendance[];
  settings: SchoolSetting;
  onRefresh: () => void;
}

export const ExamMinutesView: React.FC<ExamMinutesViewProps> = ({
  minutes,
  schedules,
  rooms,
  classes,
  subjects,
  supervisors,
  students: propStudents,
  attendances: propAttendances,
  settings,
  onRefresh
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fallback to storage if not provided in props
  const allStudents = useMemo(() => propStudents || StorageService.getStudents(), [propStudents]);
  const allAttendances = useMemo(() => propAttendances || StorageService.getStudentAttendances(), [propAttendances]);

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const studentMap = useMemo(() => new Map(allStudents.map((s) => [s.id, s])), [allStudents]);
  const supervisorMap = useMemo(
    () => new Map(supervisors.map((s) => [s.id, s])),
    [supervisors]
  );
  const scheduleMap = useMemo(
    () => new Map(schedules.map((s) => [s.id, s])),
    [schedules]
  );

  // Selected schedule
  const activeSchedule = scheduleMap.get(selectedScheduleId) || schedules[0];
  const activeRoom = activeSchedule ? roomMap.get(activeSchedule.roomId) : null;

  // Existing minute for active schedule
  const existingMinute = useMemo(() => {
    return minutes.find((m) => m.scheduleId === selectedScheduleId);
  }, [minutes, selectedScheduleId]);

  // Derive students assigned to activeSchedule
  const assignedStudents = useMemo(() => {
    if (!activeSchedule) return [];
    const map = new Map<string, { student: Student; classItem?: ClassItem; subject?: Subject }>();

    activeSchedule.groups.forEach((grp) => {
      const cls = classMap.get(grp.classId);
      const sub = subjectMap.get(grp.subjectId);
      if (grp.selectedStudentIds && grp.selectedStudentIds.length > 0) {
        grp.selectedStudentIds.forEach((sid) => {
          const s = studentMap.get(sid);
          if (s) map.set(s.id, { student: s, classItem: cls, subject: sub });
        });
      } else {
        allStudents
          .filter((s) => s.classId === grp.classId && s.status === 'AKTIF')
          .forEach((s) => {
            map.set(s.id, { student: s, classItem: cls, subject: sub });
          });
      }
    });

    return Array.from(map.values());
  }, [activeSchedule, allStudents, classMap, subjectMap, studentMap]);

  // AUTOMATIC RECAP FROM DAFTAR HADIR (ATTENDANCE)
  const attendanceRecap = useMemo(() => {
    if (!activeSchedule) {
      return { total: 0, presentCount: 0, absentCount: 0, absentStudents: [], absentNumbersStr: '' };
    }

    const scheduleAttendances = allAttendances.filter((a) => a.scheduleId === activeSchedule.id);
    const attendanceMap = new Map(scheduleAttendances.map((a) => [a.studentId, a]));

    const absentList: {
      student: Student;
      classItem?: ClassItem;
      subject?: Subject;
      status: string;
      notes?: string;
    }[] = [];

    let present = 0;
    let absent = 0;

    assignedStudents.forEach(({ student, classItem, subject }) => {
      const att = attendanceMap.get(student.id);
      const status = att ? att.status : 'Hadir';

      if (['Tidak Hadir', 'Sakit', 'Izin', 'Alpa'].includes(status)) {
        absent++;
        absentList.push({
          student,
          classItem,
          subject,
          status,
          notes: att?.notes
        });
      } else {
        present++;
      }
    });

    const absentNumbersStr = absentList
      .map((a) => `${a.student.examNumber || a.student.nis} (${a.student.name} - ${a.status})`)
      .join(', ');

    return {
      total: assignedStudents.length,
      presentCount: present,
      absentCount: absent,
      absentStudents: absentList,
      absentNumbersStr
    };
  }, [activeSchedule, allAttendances, assignedStudents]);

  // Form State
  const [presentCount, setPresentCount] = useState<number>(attendanceRecap.presentCount);
  const [absentCount, setAbsentCount] = useState<number>(attendanceRecap.absentCount);
  const [absentNumbers, setAbsentNumbers] = useState<string>(attendanceRecap.absentNumbersStr);
  const [notes, setNotes] = useState(
    existingMinute?.notes ||
      'Ujian berjalan tertib, aman, lancar, dan terkendali. Tidak terdapat kendala teknis maupun kecurangan.'
  );
  const [isVerified, setIsVerified] = useState(
    existingMinute?.verifiedBySupervisor || false
  );

  // Automatically populate from attendance recap when schedule changes or attendance updates
  React.useEffect(() => {
    if (existingMinute) {
      // If minute was previously saved with custom values, keep them or fallback to recap
      setPresentCount(existingMinute.presentCount ?? attendanceRecap.presentCount);
      setAbsentCount(existingMinute.absentCount ?? attendanceRecap.absentCount);
      setAbsentNumbers(existingMinute.absentStudentNumbers || attendanceRecap.absentNumbersStr);
      setNotes(existingMinute.notes || 'Ujian berjalan tertib, aman, lancar, dan terkendali. Tidak terdapat kendala teknis maupun kecurangan.');
      setIsVerified(existingMinute.verifiedBySupervisor || false);
    } else {
      // New minute: strictly populate from Attendance recap
      setPresentCount(attendanceRecap.presentCount);
      setAbsentCount(attendanceRecap.absentCount);
      setAbsentNumbers(attendanceRecap.absentNumbersStr);
      setNotes('Ujian berjalan tertib, aman, lancar, dan terkendali. Tidak terdapat kendala teknis maupun kecurangan.');
      setIsVerified(false);
    }
    setIsEditing(false);
  }, [selectedScheduleId, existingMinute, attendanceRecap]);

  // Handler to manually force re-sync with attendance recap
  const handleSyncFromAttendance = () => {
    setPresentCount(attendanceRecap.presentCount);
    setAbsentCount(attendanceRecap.absentCount);
    setAbsentNumbers(attendanceRecap.absentNumbersStr);
    setSuccessMessage(
      `Berhasil merekap data dari Daftar Hadir: ${attendanceRecap.presentCount} Hadir, ${attendanceRecap.absentCount} Tidak Hadir.`
    );
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchedule) return;

    const totalExpected = activeSchedule.groups.reduce(
      (a, b) => a + b.participantCount,
      0
    );

    const minuteObj: ExamMinute = {
      id: existingMinute ? existingMinute.id : `minute-${Date.now()}`,
      scheduleId: activeSchedule.id,
      date: activeSchedule.date,
      session: activeSchedule.session,
      roomId: activeSchedule.roomId,
      totalRegistered: totalExpected,
      presentCount: Number(presentCount),
      absentCount: Number(absentCount),
      absentStudentNumbers: absentNumbers,
      notes: notes,
      supervisor1Id: activeSchedule.supervisors[0]?.supervisorId || '',
      supervisor2Id: activeSchedule.supervisors[1]?.supervisorId || '',
      verifiedBySupervisor: isVerified,
      createdAt: existingMinute ? existingMinute.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageService.saveExamMinute(minuteObj);
    onRefresh();
    setIsEditing(false);
    setSuccessMessage('Berita acara ujian berhasil disimpan dan diverifikasi.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const activeSup1 = activeSchedule?.supervisors[0]
    ? supervisorMap.get(activeSchedule.supervisors[0].supervisorId)
    : null;
  const activeSup2 = activeSchedule?.supervisors[1]
    ? supervisorMap.get(activeSchedule.supervisors[1].supervisorId)
    : null;

  return (
    <div className="space-y-6">
      {/* Print View when requested */}
      {isPrinting ? (
        <div className="bg-white p-8 max-w-4xl mx-auto text-black font-serif text-xs">
          <div className="flex justify-end gap-2 mb-4 no-print font-sans">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
            >
              Cetak Berita Acara (A4)
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
            documentTitle="BERITA ACARA PELAKSANAAN UJIAN SEKOLAH"
            documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
          />

          <div className="space-y-3 leading-relaxed mt-4">
            <p>
              Pada hari ini, <strong>{activeSchedule?.date}</strong>, telah diselenggarakan{' '}
              <strong>{settings.examName}</strong> di {settings.schoolName} untuk:
            </p>

            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="w-36 py-1">Ruang Ujian</td>
                  <td className="py-1">
                    : <strong>{activeRoom?.code} ({activeRoom?.name})</strong> - Gedung{' '}
                    {activeRoom?.building}
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Sesi / Waktu</td>
                  <td className="py-1">
                    : Sesi {activeSchedule?.session} ({activeSchedule?.startTime} -{' '}
                    {activeSchedule?.endTime} WIB)
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Status Kehadiran</td>
                  <td className="py-1">
                    : Terdaftar: <strong>{presentCount + absentCount}</strong> orang | Hadir:{' '}
                    <strong>{presentCount}</strong> orang | Tidak Hadir:{' '}
                    <strong>{absentCount}</strong> orang
                  </td>
                </tr>
                {absentNumbers && (
                  <tr>
                    <td className="py-1">No Peserta Tidak Hadir</td>
                    <td className="py-1 font-mono text-rose-700">: {absentNumbers}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Multi-Class and Multi-Subject Breakdown in this room */}
            <div className="pt-2">
              <p className="font-bold mb-1.5">
                Rincian Peserta Berdasarkan Kelas &amp; Mata Pelajaran yang Diujikan:
              </p>
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black p-1.5 text-center w-8">No</th>
                    <th className="border border-black p-1.5 text-left">Kelas</th>
                    <th className="border border-black p-1.5 text-left">Mata Pelajaran Diujikan</th>
                    <th className="border border-black p-1.5 text-center w-24">Jumlah Siswa</th>
                    <th className="border border-black p-1.5 text-center w-28">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSchedule?.groups.map((grp, idx) => {
                    const cls = classMap.get(grp.classId);
                    const sub = subjectMap.get(grp.subjectId);
                    return (
                      <tr key={grp.id}>
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-semibold">
                          {cls?.name}
                        </td>
                        <td className="border border-black p-1.5">{sub?.name}</td>
                        <td className="border border-black p-1.5 text-center font-bold">
                          {grp.participantCount} Orang
                        </td>
                        <td className="border border-black p-1.5 text-center text-gray-600">
                          Sesuai Daftar
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Absent Students Breakdown in Print View */}
            {absentCount > 0 && attendanceRecap.absentStudents.length > 0 && (
              <div className="pt-2">
                <p className="font-bold mb-1.5">
                  Daftar Peserta Tidak Hadir (Dialihkan ke Jadwal Ujian Susulan):
                </p>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1.5 text-center w-8">No</th>
                      <th className="border border-black p-1.5 text-center w-28">No. Peserta</th>
                      <th className="border border-black p-1.5 text-left">Nama Siswa</th>
                      <th className="border border-black p-1.5 text-center w-20">Kelas</th>
                      <th className="border border-black p-1.5 text-left">Mata Pelajaran</th>
                      <th className="border border-black p-1.5 text-center w-24">Alasan</th>
                      <th className="border border-black p-1.5 text-center w-32">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecap.absentStudents.map((abs, idx) => (
                      <tr key={abs.student.id}>
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 text-center font-mono font-bold">
                          {abs.student.examNumber || abs.student.nis}
                        </td>
                        <td className="border border-black p-1.5 font-medium">{abs.student.name}</td>
                        <td className="border border-black p-1.5 text-center">{abs.classItem?.name}</td>
                        <td className="border border-black p-1.5">{abs.subject?.name}</td>
                        <td className="border border-black p-1.5 text-center font-bold">
                          {abs.status}
                        </td>
                        <td className="border border-black p-1.5 text-center text-gray-500 italic">
                          {abs.notes || 'Perlu Ujian Susulan'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes / Special Occurrences */}
            <div className="pt-2">
              <p className="font-bold mb-1">Catatan Kejadian Selama Ujian:</p>
              <div className="p-3 border border-black rounded min-h-[60px] bg-slate-50/50">
                {notes || 'Tidak ada kejadian khusus. Pelaksanaan berjalan tertib dan lancar.'}
              </div>
            </div>

            <p className="pt-1">
              Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p>Pengawas Ruang I,</p>
                <div className="h-20 flex items-center justify-center text-gray-400 italic">
                  (Tanda Tangan)
                </div>
                <p className="font-bold underline">{activeSup1?.name || '____________________'}</p>
                <p>NIP. {activeSup1?.nip || '....................................'}</p>
              </div>

              <div>
                <p>Pengawas Ruang II,</p>
                <div className="h-20 flex items-center justify-center text-gray-400 italic">
                  (Tanda Tangan)
                </div>
                <p className="font-bold underline">{activeSup2?.name || '____________________'}</p>
                <p>NIP. {activeSup2?.nip || '....................................'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Title & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Berita Acara Pelaksanaan Ujian
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan resmi kehadiran, rincian multi-kelas/mapel per ruang, catatan kejadian khusus, dan verifikasi pengawas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrinting(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Berita Acara (A4)
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* Schedule Picker Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Pilih Sesi Jadwal:
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

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Status Verifikasi:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isVerified ? 'Terverifikasi Pengawas' : 'Draft / Belum Diverifikasi'}
              </span>
            </div>
          </div>

          {/* Main Form & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Formulir Berita Acara Ruang: {activeRoom?.code} ({activeRoom?.name})
                </h3>
                <span className="text-xs text-slate-500">
                  Tanggal: {activeSchedule?.date}
                </span>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Multi-Class Multi-Subject Breakdown Preview */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Rincian Kelompok dalam Ruang Ini:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {activeSchedule?.groups.map((grp) => {
                      const cls = classMap.get(grp.classId);
                      const sub = subjectMap.get(grp.subjectId);
                      return (
                        <div
                          key={grp.id}
                          className="bg-white p-2 rounded border border-slate-200"
                        >
                          <p className="font-bold text-slate-900">{cls?.name}</p>
                          <p className="text-blue-700 font-medium truncate">{sub?.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Target: {grp.participantCount} siswa
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Auto Attendance Recap Banner */}
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-900 text-xs">
                        Rekap Otomatis dari Daftar Hadir Ruang Ini
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncFromAttendance}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="Ambil ulang data terbaru dari Daftar Hadir"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sinkronkan Ulang dari Presensi</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Terdaftar</span>
                      <span className="text-sm font-bold text-slate-900">{attendanceRecap.total} Siswa</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-600 font-medium block">Presensi Hadir</span>
                      <span className="text-sm font-bold text-emerald-700">{attendanceRecap.presentCount} Siswa</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-rose-100">
                      <span className="text-[10px] text-rose-600 font-medium block">Presensi Tidak Hadir</span>
                      <span className="text-sm font-bold text-rose-700">{attendanceRecap.absentCount} Siswa</span>
                    </div>
                  </div>

                  {attendanceRecap.absentStudents.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-rose-900 block mb-1">
                        Siswa Tidak Hadir (Otomatis Masuk Menu Siswa Susulan):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {attendanceRecap.absentStudents.map((abs) => (
                          <span
                            key={abs.student.id}
                            className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-medium border border-rose-200 flex items-center gap-1"
                          >
                            <span className="font-bold">{abs.student.name}</span>
                            <span className="text-rose-600">({abs.status})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jumlah Siswa Hadir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={presentCount}
                      onChange={(e) => setPresentCount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Jumlah Siswa Tidak Hadir
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={absentCount}
                      onChange={(e) => setAbsentCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nomor Peserta yang Tidak Hadir (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={absentNumbers}
                    onChange={(e) => setAbsentNumbers(e.target.value)}
                    placeholder="Contoh: 005/XII-TKJ/US/2026, 012/XII-RPL/US/2026"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Catatan Kejadian Selama Ujian / Berita Acara <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    placeholder="Catat jika terjadi kendala teknis, mati lampu, soal rusak, atau siswa yang sakit saat ujian..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verifiedCheck"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <label
                      htmlFor="verifiedCheck"
                      className="text-xs font-semibold text-blue-900 cursor-pointer"
                    >
                      Konfirmasi Verifikasi Pengawas Ruang (Telah disetujui &amp; ditandatangani)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-xs shadow-sm transition-all"
                  >
                    Simpan Berita Acara
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Supervisor Assignment & Signature Preview */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  Pengawas Ruang Bertugas
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Pengawas 1:
                    </span>
                    <p className="font-bold text-slate-900">
                      {activeSup1?.name || 'Belum ditugaskan'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIP: {activeSup1?.nip || '-'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Pengawas 2:
                    </span>
                    <p className="font-bold text-slate-900">
                      {activeSup2?.name || 'Tidak ada pengawas 2 (Tunggal)'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NIP: {activeSup2?.nip || '-'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsPrinting(true)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Preview Cetak Dokumen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
