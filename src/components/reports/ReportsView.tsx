import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Printer,
  Download,
  Calendar,
  DoorOpen,
  GraduationCap,
  Users,
  UserCheck,
  FileCheck,
  IdCard,
  Tag,
  ShieldAlert,
  ClipboardList,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  ExamSchedule,
  Room,
  ClassItem,
  Subject,
  Supervisor,
  Student,
  ExamMinute,
  StudentAttendance,
  SchoolSetting
} from '../../types';
import { ExcelService } from '../../lib/excel';
import { PrintHeader } from '../common/PrintHeader';

interface ReportsViewProps {
  schedules: ExamSchedule[];
  rooms: Room[];
  classes: ClassItem[];
  subjects: Subject[];
  supervisors: Supervisor[];
  students: Student[];
  minutes: ExamMinute[];
  attendances: StudentAttendance[];
  settings: SchoolSetting;
}

export type ReportType =
  | 'JADWAL_TOTAL'
  | 'JADWAL_RUANG'
  | 'JADWAL_KELAS'
  | 'JADWAL_PENGAWAS'
  | 'REKAP_PENGAWAS'
  | 'DAFTAR_HADIR_SISWA'
  | 'DAFTAR_HADIR_PENGAWAS'
  | 'BERITA_ACARA'
  | 'REKAP_KETIDAKHADIRAN'
  | 'PEMBAGIAN_RUANG'
  | 'KARTU_PESERTA'
  | 'LABEL_MEJA'
  | 'PESERTA_PER_RUANG'
  | 'PAKTA_INTEGRITAS'
  | 'TATA_TERTIB';

export const ReportsView: React.FC<ReportsViewProps> = ({
  schedules,
  rooms,
  classes,
  subjects,
  supervisors,
  students,
  minutes,
  attendances,
  settings
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('JADWAL_TOTAL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const supervisorMap = useMemo(
    () => new Map(supervisors.map((s) => [s.id, s])),
    [supervisors]
  );

  const reportList = [
    { key: 'JADWAL_TOTAL' as ReportType, label: 'A. Jadwal Ujian Keseluruhan', icon: Calendar },
    { key: 'JADWAL_RUANG' as ReportType, label: 'B. Jadwal Ujian per Ruang', icon: DoorOpen },
    { key: 'JADWAL_KELAS' as ReportType, label: 'C. Jadwal Ujian per Kelas', icon: GraduationCap },
    { key: 'JADWAL_PENGAWAS' as ReportType, label: 'D. Jadwal Pengawas Ujian', icon: UserCheck },
    { key: 'REKAP_PENGAWAS' as ReportType, label: 'E. Rekap Kebutuhan Pengawas', icon: UserCheck },
    { key: 'DAFTAR_HADIR_SISWA' as ReportType, label: 'F. Daftar Hadir Siswa', icon: ClipboardList },
    { key: 'DAFTAR_HADIR_PENGAWAS' as ReportType, label: 'G. Daftar Hadir Pengawas', icon: UserCheck },
    { key: 'BERITA_ACARA' as ReportType, label: 'H. Berita Acara Ujian', icon: FileCheck },
    { key: 'REKAP_KETIDAKHADIRAN' as ReportType, label: 'I. Rekap Ketidakhadiran Siswa', icon: ShieldAlert },
    { key: 'PEMBAGIAN_RUANG' as ReportType, label: 'J. Denah & Pembagian Ruang', icon: DoorOpen },
    { key: 'KARTU_PESERTA' as ReportType, label: 'K. Cetak Kartu Peserta', icon: IdCard },
    { key: 'LABEL_MEJA' as ReportType, label: 'L. Label Meja Peserta Ujian', icon: Tag },
    { key: 'PESERTA_PER_RUANG' as ReportType, label: 'M. Daftar Peserta per Ruang', icon: Users },
    { key: 'PAKTA_INTEGRITAS' as ReportType, label: 'N. Pakta Integritas Pengawas', icon: FileCheck },
    { key: 'TATA_TERTIB' as ReportType, label: 'O. Tata Tertib Peserta & Pengawas', icon: ShieldAlert }
  ];

  // Excel Export Handler
  const handleExportExcel = () => {
    let data: any[] = [];
    let filename = `Laporan_${activeReport}`;

    if (activeReport === 'JADWAL_TOTAL' || activeReport === 'JADWAL_RUANG') {
      data = schedules.flatMap((sch, idx) => {
        const r = roomMap.get(sch.roomId);
        return sch.groups.map((grp) => {
          const cls = classMap.get(grp.classId);
          const sub = subjectMap.get(grp.subjectId);
          return {
            Tanggal: sch.date,
            Sesi: sch.session,
            Waktu: `${sch.startTime} - ${sch.endTime}`,
            Ruang: r ? `${r.code} (${r.name})` : sch.roomId,
            Kelas: cls?.name,
            Mata_Pelajaran: sub?.name,
            Jumlah_Peserta: grp.participantCount
          };
        });
      });
    } else if (activeReport === 'REKAP_KETIDAKHADIRAN') {
      const absents = attendances.filter((a) => a.status !== 'Hadir');
      data = absents.map((att) => {
        const stu = students.find((s) => s.id === att.studentId);
        const cls = stu ? classMap.get(stu.classId) : null;
        return {
          No_Peserta: stu?.examNumber,
          Nama_Siswa: stu?.name,
          Kelas: cls?.name,
          Status: att.status,
          Waktu: att.timestamp
        };
      });
    } else {
      data = students.map((s) => ({
        No_Peserta: s.examNumber,
        NIS: s.nis,
        Nama: s.name,
        Kelas: classMap.get(s.classId)?.name,
        Jurusan: s.major,
        Status: s.status
      }));
    }

    ExcelService.exportToExcel(data, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Laporan &amp; Dokumen Cetak Ujian Sekolah
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Format dokumen resmi standar dinas pendidikan lengkap dengan kop surat dan tanda tangan kepala sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export ke Excel (.xlsx)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Dokumen Terpilih (A4)
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 no-print">
        {reportList.map((rep) => {
          const Icon = rep.icon;
          const isActive = activeReport === rep.key;
          return (
            <button
              key={rep.key}
              onClick={() => setActiveReport(rep.key)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <span className="font-semibold leading-tight line-clamp-2">
                {rep.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Printable Document Sheet Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-8 max-w-4xl mx-auto font-serif text-black min-h-[600px]">
        {/* REPORT A: JADWAL KESELURUHAN */}
        {activeReport === 'JADWAL_TOTAL' && (
          <div>
            <PrintHeader
              settings={settings}
              documentTitle="JADWAL KESELURUHAN PELAKSANAAN UJIAN SEKOLAH"
              documentSubtitle={`Tahun Pelajaran ${settings.academicYear} - Semester ${settings.semester}`}
            />

            <table className="w-full border-collapse border border-black text-xs mt-4">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1.5 text-center w-8">No</th>
                  <th className="border border-black p-1.5 text-center">Hari / Tanggal</th>
                  <th className="border border-black p-1.5 text-center">Sesi &amp; Waktu</th>
                  <th className="border border-black p-1.5 text-center">Ruang</th>
                  <th className="border border-black p-1.5 text-left">Kelas &amp; Mata Pelajaran</th>
                  <th className="border border-black p-1.5 text-center">Peserta</th>
                  <th className="border border-black p-1.5 text-left">Pengawas Ruang</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((sch, idx) => {
                  const r = roomMap.get(sch.roomId);
                  const totalP = sch.groups.reduce((a, b) => a + b.participantCount, 0);
                  const supNames = sch.supervisors
                    .map((sa) => supervisorMap.get(sa.supervisorId)?.name)
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <tr key={sch.id}>
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 text-center font-medium">
                        {sch.date}
                      </td>
                      <td className="border border-black p-1.5 text-center">
                        Sesi {sch.session} ({sch.startTime}-{sch.endTime})
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">
                        {r?.code} ({r?.name})
                      </td>
                      <td className="border border-black p-1.5">
                        {sch.groups.map((grp) => {
                          const cls = classMap.get(grp.classId);
                          const sub = subjectMap.get(grp.subjectId);
                          return (
                            <div key={grp.id} className="text-[11px] leading-tight">
                              <strong>{cls?.name}</strong>: {sub?.name} ({grp.participantCount} siswa)
                            </div>
                          );
                        })}
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">
                        {totalP}
                      </td>
                      <td className="border border-black p-1.5 text-[11px]">
                        {supNames || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT B: JADWAL PER RUANG */}
        {activeReport === 'JADWAL_RUANG' && (
          <div>
            <PrintHeader
              settings={settings}
              documentTitle="REKAPITULASI JADWAL UJIAN PER RUANG"
              documentSubtitle={`Tahun Pelajaran ${settings.academicYear}`}
            />
            <div className="space-y-6 mt-4">
              {rooms.map((room) => {
                const roomSchedules = schedules.filter((s) => s.roomId === room.id);
                return (
                  <div key={room.id} className="border border-black p-3 rounded">
                    <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 text-xs">
                      <span>
                        Ruang: {room.code} - {room.name} ({room.building})
                      </span>
                      <span>Kapasitas: {room.capacity} Siswa</span>
                    </div>

                    <table className="w-full border-collapse border border-black text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-black p-1 text-center w-8">No</th>
                          <th className="border border-black p-1 text-center">Tanggal</th>
                          <th className="border border-black p-1 text-center">Waktu / Sesi</th>
                          <th className="border border-black p-1 text-left">Kelompok Kelas &amp; Mapel</th>
                          <th className="border border-black p-1 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomSchedules.map((sch, i) => (
                          <tr key={sch.id}>
                            <td className="border border-black p-1 text-center">{i + 1}</td>
                            <td className="border border-black p-1 text-center">{sch.date}</td>
                            <td className="border border-black p-1 text-center">
                              {sch.startTime} - {sch.endTime} (Sesi {sch.session})
                            </td>
                            <td className="border border-black p-1">
                              {sch.groups
                                .map((g) => `${classMap.get(g.classId)?.name}: ${subjectMap.get(g.subjectId)?.name}`)
                                .join(' | ')}
                            </td>
                            <td className="border border-black p-1 text-center font-bold">
                              {sch.groups.reduce((a, b) => a + b.participantCount, 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REPORT L: LABEL MEJA UJIAN */}
        {activeReport === 'LABEL_MEJA' && (
          <div>
            <PrintHeader
              settings={settings}
              documentTitle="LABEL MEJA PESERTA UJIAN SEKOLAH"
              documentSubtitle={`Tahun Pelajaran ${settings.academicYear}`}
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              {students.slice(0, 10).map((stu) => (
                <div
                  key={stu.id}
                  className="border-2 border-black p-3 text-center rounded-lg space-y-1 bg-slate-50"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {settings.schoolName}
                  </p>
                  <div className="border-t border-b border-black py-1">
                    <p className="text-base font-black font-mono tracking-widest text-blue-900">
                      {stu.examNumber}
                    </p>
                  </div>
                  <p className="text-xs font-bold uppercase truncate">{stu.name}</p>
                  <p className="text-[10px] text-gray-700">
                    Kelas: {classMap.get(stu.classId)?.name} | NIS: {stu.nis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT N: PAKTA INTEGRITAS PENGAWAS */}
        {activeReport === 'PAKTA_INTEGRITAS' && (
          <div className="space-y-4">
            <PrintHeader
              settings={settings}
              documentTitle="PAKTA INTEGRITAS PENGAWAS RUANG UJIAN SEKOLAH"
              documentSubtitle={`Tahun Pelajaran ${settings.academicYear}`}
            />

            <div className="text-xs leading-relaxed space-y-3">
              <p>Saya yang bertanda tangan di bawah ini:</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="w-32 py-1">Nama Lengkap</td>
                    <td className="py-1">: ________________________________________</td>
                  </tr>
                  <tr>
                    <td className="py-1">NIP / NUPTK</td>
                    <td className="py-1">: ________________________________________</td>
                  </tr>
                  <tr>
                    <td className="py-1">Unit Kerja / Asal</td>
                    <td className="py-1">: {settings.schoolName}</td>
                  </tr>
                </tbody>
              </table>

              <p>Dengan ini menyatakan bahwa saya:</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-2">
                <li>
                  Sanggup mematuhi dan melaksanakan seluruh tata tertib pengawas ujian dengan penuh integritas, jujur, dan bertanggung jawab.
                </li>
                <li>
                  Menjaga kerahasiaan dan keamanan dokumen ujian, baik soal maupun lembar jawaban peserta.
                </li>
                <li>
                  Tidak membantu atau membiarkan peserta ujian melakukan kecurangan dalam bentuk apapun.
                </li>
                <li>
                  Hadir di lokasi ujian sekurang-kurangnya 30 menit sebelum ujian dimulai.
                </li>
              </ol>

              <p className="pt-2">
                Pernyataan ini saya buat dengan sesungguhnya dan tanpa paksaan dari pihak manapun. Apabila saya melanggar pakta integritas ini, saya bersedia menerima sanksi sesuai dengan peraturan perundang-undangan yang berlaku.
              </p>
            </div>
          </div>
        )}

        {/* REPORT O: TATA TERTIB */}
        {activeReport === 'TATA_TERTIB' && (
          <div className="space-y-4">
            <PrintHeader
              settings={settings}
              documentTitle="TATA TERTIB PESERTA & PENGAWAS UJIAN SEKOLAH"
              documentSubtitle={`Tahun Pelajaran ${settings.academicYear}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-justify">
              <div className="border border-black p-3 rounded">
                <h4 className="font-bold text-center border-b border-black pb-1 mb-2 uppercase">
                  Tata Tertib Peserta Ujian
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Hadir di ruang ujian 15 menit sebelum ujian dimulai.</li>
                  <li>Membawa kartu peserta ujian dan alat tulis yang sah.</li>
                  <li>Dilarang membawa HP, catatan, atau kalkulator ke ruang ujian kecuali diizinkan.</li>
                  <li>Mengisi daftar hadir yang telah disediakan pengawas.</li>
                  <li>Dilarang bekerja sama atau mencontek selama ujian berlangsung.</li>
                  <li>Meninggalkan ruangan hanya dengan izin pengawas ruang.</li>
                </ol>
              </div>

              <div className="border border-black p-3 rounded">
                <h4 className="font-bold text-center border-b border-black pb-1 mb-2 uppercase">
                  Tata Tertib Pengawas Ruang
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Hadir di ruang panitia 30 menit sebelum ujian dimulai.</li>
                  <li>Memeriksa kebersihan ruang dan kesesuaian nomor meja peserta.</li>
                  <li>Mengedarkan daftar hadir kepada peserta ujian.</li>
                  <li>Membacakan tata tertib peserta sebelum lembar soal dibuka.</li>
                  <li>Menjaga ketertiban dan tidak merokok atau memainkan gawai di ruang ujian.</li>
                  <li>Mengisi dan menandatangani Berita Acara Ujian secara lengkap.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Signatures for Official Documents */}
        <div className="mt-12 flex justify-between text-xs font-serif pt-6 border-t border-gray-300">
          <div className="text-center w-56">
            <p className="invisible">Keterangan</p>
            <p className="font-semibold">Ketua Panitia Ujian,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.committeeHeadName}</p>
            <p>NIP. {settings.committeeHeadNip}</p>
          </div>

          <div className="text-center w-56">
            <p>Depok, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="font-semibold">Kepala Sekolah,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.principalName}</p>
            <p>NIP. {settings.principalNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
