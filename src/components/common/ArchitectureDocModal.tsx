import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  Code,
  Table,
  Cpu,
  X,
  Copy
} from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULING_ARCHITECTURE' | 'ERD' | 'PRISMA_SCHEMA' | 'SETUP_GUIDE'>('SCHEDULING_ARCHITECTURE');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                Arsitektur Sistem &amp; Relasi Database Relasional
              </h3>
              <p className="text-xs text-slate-300">
                Dokumentasi Desain Software Architect, Database Engineer &amp; Solusi Multi-Kelas/Multi-Mapel per Ruang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('SCHEDULING_ARCHITECTURE')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SCHEDULING_ARCHITECTURE'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Solusi Multi-Kelas &amp; Mapel
          </button>
          <button
            onClick={() => setActiveTab('ERD')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ERD'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-600" />
            Entity Relationship Diagram (ERD)
          </button>
          <button
            onClick={() => setActiveTab('PRISMA_SCHEMA')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PRISMA_SCHEMA'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4 text-purple-600" />
            Prisma Schema (PostgreSQL)
          </button>
          <button
            onClick={() => setActiveTab('SETUP_GUIDE')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SETUP_GUIDE'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-600" />
            Instalasi &amp; Validasi Backend
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700 space-y-4">
          {activeTab === 'SCHEDULING_ARCHITECTURE' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Bagaimana Kebutuhan Khusus Pengguna Diakomodasi Secara Native:
                </h4>
                <p className="text-blue-950 leading-relaxed">
                  <strong>Permintaan Kritis:</strong> <em>"Satu ruang ujian dapat digunakan oleh siswa dari kelas yang berbeda, dan dalam satu ruang dan sesi yang sama dapat terdapat mata pelajaran yang berbeda untuk kelas yang berbeda."</em>
                </p>
                <p className="text-blue-900 leading-relaxed">
                  Pada desain database konvensional yang kaku, <code>ExamSchedule</code> biasanya langsung menyimpan <code>classId</code> dan <code>subjectId</code> di tabel utama (1 jadwal = 1 ruang = 1 kelas = 1 mapel). Desain ini <strong>gagal</strong> memenuhi kebutuhan tersebut.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Pola Desain Relasional 2-Tingkat (Parent-Child Pattern):
                </h4>
                <div className="font-mono bg-slate-900 text-slate-200 p-4 rounded-lg space-y-1 text-[11px] leading-relaxed overflow-x-auto">
                  <p className="text-emerald-400">ExamSchedule (Parent - Sesi Waktu &amp; Ruang Fisik)</p>
                  <p>├── id: "sch-01"</p>
                  <p>├── roomId: "room-01" (Ruang Teori 01, Kapasitas: 30)</p>
                  <p>├── date: "2026-10-20", session: 1 (07:30 - 09:30)</p>
                  <p>├── supervisors: [Dra. Hj. Siti Aminah, M.Pd, dkk]</p>
                  <p>└── groups: [ <span className="text-amber-400">ExamScheduleGroup (Child - Relasi Kelas &amp; Mapel)</span> ]</p>
                  <p className="pl-6 text-blue-300">├── Group 1: Kelas XII TKJ (10 siswa) &rarr; Mapel: Matematika Terapan</p>
                  <p className="pl-6 text-purple-300">├── Group 2: Kelas XII RPL (10 siswa) &rarr; Mapel: Bahasa Indonesia</p>
                  <p className="pl-6 text-rose-300">└── Group 3: Kelas XII Multimedia (10 siswa) &rarr; Mapel: Desain Grafis</p>
                  <p className="text-slate-400">Total Peserta Ruang: 10 + 10 + 10 = 30 Siswa (Sesuai Kapasitas)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block">1. Validasi Interval Waktu</span>
                  <p className="text-slate-500 text-[11px]">
                    Validasi bentrok menggunakan perbandingan interval <code>startA &lt; endB &amp;&amp; endA &gt; startB</code>, mencegah tabrakan jam antar ruang atau pengawas.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block">2. Kontrol Kapasitas Akurat</span>
                  <p className="text-slate-500 text-[11px]">
                    Sistem menjumlahkan seluruh <code>participantCount</code> dari setiap grup dan memvalidasinya terhadap <code>room.capacity</code> secara real-time.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="font-bold text-slate-900 block">3. Laporan &amp; Berita Acara Rinci</span>
                  <p className="text-slate-500 text-[11px]">
                    Berita acara dan daftar hadir otomatis mencetak rincian breakdown multi-kelas dan multi-mapel per ruang dengan tabel rapi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ERD' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">
                Peta Relasi Antar Entitas (ERD Relational Blueprint)
              </h4>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-loose overflow-x-auto">
                <p className="text-blue-400">SchoolSetting (1) ──── (Konfigurasi Global Kop Surat, Kepsek, Nomor Peserta)</p>
                <p className="text-emerald-400">Room (1) ───────────────&lt; (0..N) ExamSchedule (Kapasitas &amp; Kode Ruang)</p>
                <p className="text-purple-400">ExamSchedule (1) ────────&lt; (1..N) ExamScheduleGroup (Kelompok Kelas &amp; Mapel)</p>
                <p className="text-purple-400">ExamSchedule (1) ────────&lt; (1..2) SupervisorAssignment (Pengawas 1 &amp; 2)</p>
                <p className="text-amber-400">Class (1) ───────────────&lt; (0..N) Student (Siswa dalam Rombel)</p>
                <p className="text-amber-400">Class (1) ───────────────&lt; (0..N) ExamScheduleGroup</p>
                <p className="text-rose-400">Subject (1) ─────────────&lt; (0..N) ExamScheduleGroup</p>
                <p className="text-blue-300">ExamSchedule (1) ──────── (0..1) ExamMinute (Berita Acara &amp; Kejadian Khusus)</p>
                <p className="text-emerald-300">ExamSchedule (1) ────────&lt; (0..N) StudentAttendance (Presensi Siswa per Sesi)</p>
                <p className="text-slate-400">User (1) ────────────────&lt; (0..N) AuditLog (Audit Trail Aktivitas Sistem)</p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-xs">Integritas Relasi Database:</h5>
                <ul className="list-disc list-inside text-slate-600 text-xs space-y-1">
                  <li><strong>ON DELETE RESTRICT:</strong> Ruang yang sedang digunakan dalam jadwal ujian dicegah untuk dihapus, harus dinonaktifkan.</li>
                  <li><strong>UNIQUE CONSTRAINT:</strong> Mencegah duplikasi siswa pada NIS/NISN, nomor peserta unik, kode kelas unik, dan kode ruang unik.</li>
                  <li><strong>INDEXING:</strong> Indeks dibuat pada <code>date</code>, <code>roomId</code>, <code>classId</code>, dan <code>subjectId</code> untuk mempercepat pencarian jadwal dan pembuatan laporan.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'PRISMA_SCHEMA' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  File: /prisma/schema.prisma (Telah di-generate untuk PostgreSQL)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`)
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Tersalin!' : 'Salin Schema'}
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-96 overflow-y-auto space-y-2">
                <pre>{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Model Jadwal Ujian Parent
model ExamSchedule {
  id                    String              @id @default(cuid())
  academicYear          String
  semester              String
  examType              String
  date                  String              // YYYY-MM-DD
  session               Int
  startTime             String              // HH:mm
  endTime               String              // HH:mm
  roomId                String
  room                  Room                @relation(fields: [roomId], references: [id])
  allowCapacityOverride Boolean             @default(false)
  notes                 String?
  status                String              @default("TERJADWAL")
  groups                ExamScheduleGroup[]
  supervisors           SupervisorAssignment[]
  minute                ExamMinute?
  attendances           StudentAttendance[]
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([date, session])
  @@index([roomId])
}

// 2. Model Kelompok Multi-Kelas & Multi-Mapel Child
model ExamScheduleGroup {
  id               String       @id @default(cuid())
  scheduleId       String
  schedule         ExamSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  classId          String
  class            Class        @relation(fields: [classId], references: [id])
  subjectId        String
  subject          Subject      @relation(fields: [subjectId], references: [id])
  participantCount Int          @default(0)

  @@unique([scheduleId, classId, subjectId])
  @@index([classId])
  @@index([subjectId])
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'SETUP_GUIDE' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">
                Langkah Eksekusi &amp; Migrasi Database Produksi:
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-xs text-slate-800 mb-1">
                    1. Konfigurasi Environment Variable (.env)
                  </p>
                  <code className="block bg-slate-900 text-emerald-400 p-2 rounded font-mono text-[11px]">
                    DATABASE_URL="postgresql://postgres:password@localhost:5432/administrasi_ujian?schema=public"
                  </code>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-xs text-slate-800 mb-1">
                    2. Jalankan Migrasi Prisma ke PostgreSQL
                  </p>
                  <code className="block bg-slate-900 text-blue-300 p-2 rounded font-mono text-[11px]">
                    npx prisma migrate dev --name init_exam_administration
                  </code>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-xs text-slate-800 mb-1">
                    3. Generate Prisma Client &amp; Seeding Data Awal
                  </p>
                  <code className="block bg-slate-900 text-purple-300 p-2 rounded font-mono text-[11px]">
                    npx prisma generate && npx prisma db seed
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
