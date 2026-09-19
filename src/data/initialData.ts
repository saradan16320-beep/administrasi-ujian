import {
  SchoolSetting,
  Room,
  ClassItem,
  Subject,
  Supervisor,
  Student,
  ExamSchedule,
  ExamMinute,
  StudentAttendance,
  User,
  AuditLog
} from '../types';

export const initialSchoolSetting: SchoolSetting = {
  id: 'school-1',
  schoolName: 'SMK NEGERI 1 TEKNOLOGI INFORMATIKA',
  npsn: '20109988',
  nss: '301050201001',
  address: 'Jl. Pendidikan Vokasi No. 45, Kompleks Pendidikan',
  village: 'Sukamaju',
  district: 'Cilodong',
  city: 'Kota Depok',
  province: 'Jawa Barat',
  postalCode: '16415',
  email: 'smkn1ti.depok@sch.id',
  phone: '(021) 77889900',
  website: 'https://smkn1ti-depok.sch.id',
  principalName: 'Drs. H. Bambang Sujarwo, M.Pd',
  principalNip: '19680512 199303 1 005',
  committeeHeadName: 'Hendra Gunawan, S.Kom, M.T',
  committeeHeadNip: '19820714 200801 1 012',
  academicYear: '2026/2027',
  semester: 'Genap',
  examName: 'UJIAN SEKOLAH (US) UTAMA',
  logoUrl: '',
  examStartDate: '2026-10-20',
  examEndDate: '2026-10-27',
  examNumberFormat: '{seq:3}/{kelas}/US/{tahun}',
  updatedAt: new Date().toISOString()
};

export const initialRooms: Room[] = [
  {
    id: 'room-1',
    code: 'R-01',
    name: 'Ruang Teori 01',
    building: 'Gedung A (Utama)',
    floor: 1,
    capacity: 30,
    computerCount: 0,
    deskCount: 30,
    chairCount: 30,
    personInCharge: 'Ibu Ratna Susanti, S.Pd',
    status: 'Aktif',
    description: 'Ruang kelas ber-AC dengan pencahayaan dan ventilasi sangat baik',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'room-2',
    code: 'R-02',
    name: 'Ruang Teori 02',
    building: 'Gedung A (Utama)',
    floor: 1,
    capacity: 30,
    computerCount: 0,
    deskCount: 30,
    chairCount: 30,
    personInCharge: 'Bpk. Hendro Prayitno, S.T',
    status: 'Aktif',
    description: 'Ruang kelas standar ujian nasional / sekolah',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'room-3',
    code: 'R-03',
    name: 'Ruang Teori 03',
    building: 'Gedung A (Utama)',
    floor: 2,
    capacity: 35,
    computerCount: 0,
    deskCount: 35,
    chairCount: 35,
    personInCharge: 'Ibu Sri Wahyuni, S.Pd',
    status: 'Aktif',
    description: 'Ruang kelas kapasitas besar lantai 2',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'room-4',
    code: 'LAB-01',
    name: 'Lab Komputer Jaringan 1',
    building: 'Gedung B (Laboratorium)',
    floor: 1,
    capacity: 36,
    computerCount: 36,
    deskCount: 36,
    chairCount: 36,
    personInCharge: 'Bpk. Eka Prasetya, M.Kom',
    status: 'Aktif',
    description: 'Dilengkapi 36 PC Core i5, Gigabit LAN, UPS Sentral',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'room-5',
    code: 'LAB-02',
    name: 'Lab Multimedia & Grafis',
    building: 'Gedung B (Laboratorium)',
    floor: 2,
    capacity: 36,
    computerCount: 36,
    deskCount: 36,
    chairCount: 36,
    personInCharge: 'Bpk. Budi Santoso, S.T',
    status: 'Dalam Perbaikan',
    description: 'Sedang dalam pemeliharaan jaringan kabel fiber optik',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

export const initialClasses: ClassItem[] = [
  {
    id: 'class-1',
    code: 'XII-TKJ',
    name: 'XII TKJ',
    grade: 12,
    major: 'Teknik Komputer & Jaringan',
    homeroomTeacher: 'Ahmad Zulkarnain, S.Pd',
    capacity: 36,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'class-2',
    code: 'XII-RPL',
    name: 'XII RPL',
    grade: 12,
    major: 'Rekayasa Perangkat Lunak',
    homeroomTeacher: 'Eka Prasetya, M.Kom',
    capacity: 36,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'class-3',
    code: 'XII-DKV',
    name: 'XII DKV',
    grade: 12,
    major: 'Desain Komunikasi Visual',
    homeroomTeacher: 'Nurul Hidayah, S.Pd',
    capacity: 36,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    code: 'MAT-01',
    name: 'Matematika',
    group: 'Muatan Nasional',
    grade: 12,
    durationMinutes: 120,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'subj-2',
    code: 'BIND-01',
    name: 'Bahasa Indonesia',
    group: 'Muatan Nasional',
    grade: 12,
    durationMinutes: 90,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'subj-3',
    code: 'BING-01',
    name: 'Bahasa Inggris',
    group: 'Muatan Nasional',
    grade: 12,
    durationMinutes: 90,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'subj-4',
    code: 'PAI-01',
    name: 'Pendidikan Agama & Budi Pekerti',
    group: 'Muatan Nasional',
    grade: 12,
    durationMinutes: 90,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'subj-5',
    code: 'INF-01',
    name: 'Dasar Kejuruan Informatika',
    group: 'Peminatan Kejuruan',
    grade: 12,
    durationMinutes: 90,
    isActive: true,
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

export const initialSupervisors: Supervisor[] = [
  {
    id: 'sup-1',
    nip: '19710321 199802 2 003',
    name: 'Dra. Hj. Siti Rahmawati, M.Pd',
    gender: 'P',
    subject: 'Bahasa Indonesia',
    phone: '081234567891',
    isActive: true,
    notes: 'Pengawas Senior Ruang 01',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'sup-2',
    nip: '19800915 200604 1 011',
    name: 'Ahmad Zulkarnain, S.Pd',
    gender: 'L',
    subject: 'Matematika',
    phone: '081234567892',
    isActive: true,
    notes: 'Pengawas Ruang 02',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'sup-3',
    nip: '19850410 201001 1 018',
    name: 'Eka Prasetya, M.Kom',
    gender: 'L',
    subject: 'Informatika',
    phone: '081234567893',
    isActive: true,
    notes: 'Pengawas Lab Komputer 1',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'sup-4',
    nip: '19881123 201402 2 004',
    name: 'Nurul Hidayah, S.Pd',
    gender: 'P',
    subject: 'Bahasa Inggris',
    phone: '081234567894',
    isActive: true,
    notes: 'Pengawas Ruang 03',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'sup-5',
    nip: '19830112 200902 1 007',
    name: 'Budi Santoso, S.T',
    gender: 'L',
    subject: 'Dasar Kejuruan',
    phone: '081234567895',
    isActive: true,
    notes: 'Pengawas Pengganti & Teknisi',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

export const initialStudents: Student[] = [
  // XII TKJ (10 Siswa)
  {
    id: 'std-tkj-01',
    nis: '23241001',
    nisn: '0061234501',
    name: 'Aditya Pratama Putra',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-04-12',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '001/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-02',
    nis: '23241002',
    nisn: '0061234502',
    name: 'Anisa Rahmawati',
    gender: 'P',
    birthPlace: 'Jakarta',
    birthDate: '2008-07-21',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '002/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-03',
    nis: '23241003',
    nisn: '0061234503',
    name: 'Bayu Saputra',
    gender: 'L',
    birthPlace: 'Bogor',
    birthDate: '2008-02-15',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '003/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-04',
    nis: '23241004',
    nisn: '0061234504',
    name: 'Citra Dewi Lestari',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2008-09-08',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '004/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-05',
    nis: '23241005',
    nisn: '0061234505',
    name: 'Daffa Rizky Maulana',
    gender: 'L',
    birthPlace: 'Bekasi',
    birthDate: '2008-05-30',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '005/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-06',
    nis: '23241006',
    nisn: '0061234506',
    name: 'Fadhil Muhammad',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-08-11',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '006/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-07',
    nis: '23241007',
    nisn: '0061234507',
    name: 'Gita Maharani',
    gender: 'P',
    birthPlace: 'Bandung',
    birthDate: '2008-11-04',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '007/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-08',
    nis: '23241008',
    nisn: '0061234508',
    name: 'Ilham Kurniawan',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-01-27',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '008/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-09',
    nis: '23241009',
    nisn: '0061234509',
    name: 'Jihan Nabila',
    gender: 'P',
    birthPlace: 'Tangerang',
    birthDate: '2008-03-19',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '009/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-tkj-10',
    nis: '23241010',
    nisn: '0061234510',
    name: 'Kevin Jonathan',
    gender: 'L',
    birthPlace: 'Jakarta',
    birthDate: '2008-06-14',
    classId: 'class-1',
    className: 'XII TKJ',
    major: 'Teknik Komputer & Jaringan',
    examNumber: '010/XII-TKJ/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },

  // XII RPL (10 Siswa)
  {
    id: 'std-rpl-01',
    nis: '23242001',
    nisn: '0062234501',
    name: 'Lukman Hakim',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-02-10',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '001/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-02',
    nis: '23242002',
    nisn: '0062234502',
    name: 'Maya Indah Sari',
    gender: 'P',
    birthPlace: 'Jakarta',
    birthDate: '2008-05-18',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '002/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-03',
    nis: '23242003',
    nisn: '0062234503',
    name: 'Naufal Arya Wibowo',
    gender: 'L',
    birthPlace: 'Bogor',
    birthDate: '2008-09-25',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '003/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-04',
    nis: '23242004',
    nisn: '0062234504',
    name: 'Putri Amelia',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2008-04-03',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '004/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-05',
    nis: '23242005',
    nisn: '0062234505',
    name: 'Rafi Ramadhan',
    gender: 'L',
    birthPlace: 'Sukabumi',
    birthDate: '2008-10-12',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '005/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-06',
    nis: '23242006',
    nisn: '0062234506',
    name: 'Rania Fauziyah',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2008-08-20',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '006/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-07',
    nis: '23242007',
    nisn: '0062234507',
    name: 'Satria Bintang Wicaksono',
    gender: 'L',
    birthPlace: 'Jakarta',
    birthDate: '2008-03-31',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '007/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-08',
    nis: '23242008',
    nisn: '0062234508',
    name: 'Tiara Salsabila',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2008-12-05',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '008/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-09',
    nis: '23242009',
    nisn: '0062234509',
    name: 'Vino Alamsyah',
    gender: 'L',
    birthPlace: 'Cianjur',
    birthDate: '2008-06-22',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '009/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-rpl-10',
    nis: '23242010',
    nisn: '0062234510',
    name: 'Zahra Aulia',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2008-07-14',
    classId: 'class-2',
    className: 'XII RPL',
    major: 'Rekayasa Perangkat Lunak',
    examNumber: '010/XII-RPL/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },

  // XII DKV (10 Siswa)
  {
    id: 'std-dkv-01',
    nis: '23243001',
    nisn: '0063234501',
    name: 'Aldo Febrian',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-02-14',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '001/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-02',
    nis: '23243002',
    nisn: '0063234502',
    name: 'Bella Cantika',
    gender: 'P',
    birthPlace: 'Jakarta',
    birthDate: '2008-05-29',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '002/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-03',
    nis: '23243003',
    nisn: '0063234503',
    name: 'Chandra Wijaya',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-09-17',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '003/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-04',
    nis: '23243004',
    nisn: '0063234504',
    name: 'Dinda Kirana',
    gender: 'P',
    birthPlace: 'Bandung',
    birthDate: '2008-11-23',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '004/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-05',
    nis: '23243005',
    nisn: '0063234505',
    name: 'Erwin Syahputra',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-01-09',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '005/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-06',
    nis: '23243006',
    nisn: '0063234506',
    name: 'Fani Oktaviani',
    gender: 'P',
    birthPlace: 'Bogor',
    birthDate: '2008-10-18',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '006/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-07',
    nis: '23243007',
    nisn: '0063234507',
    name: 'Gilang Ramadhan',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-07-06',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '007/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-08',
    nis: '23243008',
    nisn: '0063234508',
    name: 'Hesti Kusuma',
    gender: 'P',
    birthPlace: 'Jakarta',
    birthDate: '2008-04-28',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '008/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-09',
    nis: '23243009',
    nisn: '0063234509',
    name: 'Indra Gunawan',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2008-03-12',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '009/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'std-dkv-10',
    nis: '23243010',
    nisn: '0063234510',
    name: 'Keisha Putri',
    gender: 'P',
    birthPlace: 'Tangerang',
    birthDate: '2008-12-19',
    classId: 'class-3',
    className: 'XII DKV',
    major: 'Desain Komunikasi Visual',
    examNumber: '010/XII-DKV/US/2026',
    status: 'AKTIF',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  }
];

// ARSITEKTUR KHUSUS: SATU RUANG, SATU SESI, BISA MEMILIKI BEBERAPA KELAS DAN BEBERAPA MAPEL!
// Ruang R-01 (Kapasitas: 30)
// Tanggal: 2026-10-20, Sesi 1 (Jam Ke-1), Jam 07.30 - 08.30
// Kelompok 1: XII TKJ -> Matematika (10 peserta)
// Kelompok 2: XII RPL -> Bahasa Indonesia (10 peserta)
// Kelompok 3: XII DKV -> Bahasa Inggris (10 peserta)
// Total peserta = 30 (Sesuai kapasitas ruang 30)
export const initialSchedules: ExamSchedule[] = [
  {
    id: 'sch-special-01',
    date: '2026-10-20',
    session: 1,
    startTime: '07:30',
    endTime: '08:30',
    roomId: 'room-1', // R-01
    status: 'Terjadwal',
    notes: 'Ujian Gabungan Sesi 1 (Jam Ke-1) - Multi Kelas & Multi Mapel',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
    groups: [
      {
        id: 'grp-1',
        scheduleId: 'sch-special-01',
        classId: 'class-1', // XII TKJ
        subjectId: 'subj-1', // Matematika
        participantCount: 10,
        selectedStudentIds: [
          'std-tkj-01', 'std-tkj-02', 'std-tkj-03', 'std-tkj-04', 'std-tkj-05',
          'std-tkj-06', 'std-tkj-07', 'std-tkj-08', 'std-tkj-09', 'std-tkj-10'
        ],
        notes: 'Kelompok A'
      },
      {
        id: 'grp-2',
        scheduleId: 'sch-special-01',
        classId: 'class-2', // XII RPL
        subjectId: 'subj-2', // Bahasa Indonesia
        participantCount: 10,
        selectedStudentIds: [
          'std-rpl-01', 'std-rpl-02', 'std-rpl-03', 'std-rpl-04', 'std-rpl-05',
          'std-rpl-06', 'std-rpl-07', 'std-rpl-08', 'std-rpl-09', 'std-rpl-10'
        ],
        notes: 'Kelompok B'
      },
      {
        id: 'grp-3',
        scheduleId: 'sch-special-01',
        classId: 'class-3', // XII DKV
        subjectId: 'subj-3', // Bahasa Inggris
        participantCount: 10,
        selectedStudentIds: [
          'std-dkv-01', 'std-dkv-02', 'std-dkv-03', 'std-dkv-04', 'std-dkv-05',
          'std-dkv-06', 'std-dkv-07', 'std-dkv-08', 'std-dkv-09', 'std-dkv-10'
        ],
        notes: 'Kelompok C'
      }
    ],
    supervisors: [
      {
        id: 'sup-assign-1',
        scheduleId: 'sch-special-01',
        supervisorId: 'sup-1', // Dra. Hj. Siti Rahmawati
        attendanceStatus: 'Hadir',
        attendanceTime: '07:15',
        notes: 'Pengawas Utama'
      }
    ]
  },
  {
    id: 'sch-02',
    date: '2026-10-20',
    session: 2,
    startTime: '09:00',
    endTime: '10:00',
    roomId: 'room-2', // R-02
    status: 'Terjadwal',
    notes: 'Ujian Sesi 2 (Jam Ke-2)',
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z',
    groups: [
      {
        id: 'grp-4',
        scheduleId: 'sch-02',
        classId: 'class-3', // XII DKV
        subjectId: 'subj-5', // Dasar Kejuruan Informatika
        participantCount: 10,
        selectedStudentIds: [
          'std-dkv-01', 'std-dkv-02', 'std-dkv-03', 'std-dkv-04', 'std-dkv-05',
          'std-dkv-06', 'std-dkv-07', 'std-dkv-08', 'std-dkv-09', 'std-dkv-10'
        ],
        notes: 'Kelompok Praktik Teori'
      }
    ],
    supervisors: [
      {
        id: 'sup-assign-2',
        scheduleId: 'sch-02',
        supervisorId: 'sup-2', // Ahmad Zulkarnain
        attendanceStatus: 'Hadir',
        attendanceTime: '09:45',
        notes: 'Pengawas Ruang 02'
      }
    ]
  }
];

export const initialExamMinutes: ExamMinute[] = [
  {
    id: 'min-1',
    scheduleId: 'sch-special-01',
    actualStart: '07:30',
    actualEnd: '08:30',
    isOrderly: true,
    hasIssues: false,
    issueDescription: '',
    supervisorNotes: 'Pelaksanaan ujian berlangsung tertib dan lancar. Seluruh siswa membawa kartu peserta.',
    verifiedBySupervisor: true,
    verifiedByCommittee: true,
    verifiedByPrincipal: false,
    updatedAt: '2026-10-20T10:00:00Z'
  }
];

export const initialStudentAttendances: StudentAttendance[] = [
  // Presets for sch-special-01
  ...initialStudents.map((std, index) => {
    let grpId = 'grp-1';
    if (std.classId === 'class-2') grpId = 'grp-2';
    if (std.classId === 'class-3') grpId = 'grp-3';

    return {
      id: `att-${std.id}`,
      scheduleId: 'sch-special-01',
      scheduleGroupId: grpId,
      studentId: std.id,
      status: (index === 4 ? 'Sakit' : index === 9 ? 'Izin' : 'Hadir') as any,
      notes: index === 4 ? 'Surat dokter terlampir' : index === 9 ? 'Izin keperluan keluarga' : '',
      updatedAt: '2026-10-20T08:00:00Z'
    };
  })
];

export const initialUsers: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    fullName: 'Administrator Utama',
    role: 'ADMIN',
    isActive: true
  },
  {
    id: 'user-2',
    username: 'panitia',
    fullName: 'Hendra Gunawan (Ketua Panitia)',
    role: 'PANITIA',
    isActive: true
  },
  {
    id: 'user-3',
    username: 'operator',
    fullName: 'Rizki Pratama (Operator Data)',
    role: 'OPERATOR',
    isActive: true
  },
  {
    id: 'user-4',
    username: 'pengawas',
    fullName: 'Dra. Hj. Siti Rahmawati (Pengawas)',
    role: 'PENGAWAS',
    supervisorId: 'sup-1',
    isActive: true
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-1',
    username: 'admin',
    action: 'Inisialisasi Sistem',
    entity: 'System',
    details: 'Setup data master sekolah, 3 kelas, 5 mapel, 5 pengawas, dan 30 siswa peserta.',
    timestamp: '2026-09-18T08:30:00Z'
  },
  {
    id: 'log-2',
    userId: 'user-2',
    username: 'panitia',
    action: 'Pembuatan Jadwal',
    entity: 'ExamSchedule',
    entityId: 'sch-special-01',
    details: 'Membuat jadwal multi-kelompok di Ruang R-01 (XII TKJ Matematika, XII RPL Bhs Indonesia, XII DKV Bhs Inggris).',
    timestamp: '2026-09-18T09:15:00Z'
  }
];
