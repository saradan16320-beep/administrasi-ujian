// TypeScript Types for ADMINISTRASI UJIAN SEKOLAH

export type Role = 'ADMIN' | 'PANITIA' | 'OPERATOR' | 'PENGAWAS' | 'KEPALA_SEKOLAH';
export type UserRole = Role;

export type Gender = 'L' | 'P';

export type StudentStatus = 'AKTIF' | 'NON_AKTIF' | 'MUTASI';

export type RoomStatus = 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan';

export type ScheduleStatus = 'Terjadwal' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';

export type AttendanceStatus = 'Hadir' | 'Tidak Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export type SupervisorAttendanceStatus = 'Hadir' | 'Tidak Hadir' | 'Pengganti';

export type SubjectGroup =
  | 'Muatan Nasional'
  | 'Muatan Kewilayahan'
  | 'Peminatan Kejuruan'
  | 'Muatan Lokal';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  supervisorId?: string;
  isActive: boolean;
}

export interface SchoolSetting {
  id: string;
  schoolName: string;
  npsn: string;
  nss?: string;
  address: string;
  village?: string;
  district?: string;
  city: string;
  province: string;
  postalCode?: string;
  email: string;
  phone: string;
  website?: string;
  principalName: string;
  principalNip: string;
  committeeHeadName: string;
  committeeHeadNip: string;
  academicYear: string;
  semester: string;
  examName: string;
  logoUrl?: string;
  examStartDate: string;
  examEndDate: string;
  examNumberFormat: string; // e.g. "{seq:3}/{kelas}/{ujian}/{tahun}"
  updatedAt: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  computerCount: number;
  deskCount: number;
  chairCount: number;
  personInCharge?: string;
  status: RoomStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  id: string;
  code: string;
  name: string;
  grade: number; // 10, 11, 12
  major: string; // TKJ, RPL, DKV, etc.
  homeroomTeacher?: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  group: SubjectGroup | string; // Muatan Nasional, Muatan Kewilayahan, Peminatan Kejuruan
  grade?: number;
  major?: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supervisor {
  id: string;
  nip: string;
  name: string;
  gender: Gender;
  subject?: string;
  phone: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: Gender;
  birthPlace?: string;
  birthDate?: string;
  classId: string;
  className?: string;
  major: string;
  examNumber?: string;
  status: StudentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamScheduleGroup {
  id: string;
  scheduleId: string;
  classId: string;
  subjectId: string;
  participantCount: number;
  selectedStudentIds?: string[]; // IDs of specific participants
  notes?: string;
  createdAt?: string;
  // Hydrated properties
  className?: string;
  subjectName?: string;
  subjectCode?: string;
}

export interface ScheduleSupervisorAssignment {
  id: string;
  scheduleId: string;
  supervisorId: string;
  order?: number;
  attendanceStatus?: SupervisorAttendanceStatus;
  attendanceTime?: string;
  notes?: string;
  // Hydrated
  supervisorName?: string;
  supervisorNip?: string;
}

export interface ExamSchedule {
  id: string;
  academicYear?: string;
  semester?: string;
  examType?: string;
  date: string; // YYYY-MM-DD
  session: number; // 1, 2, 3
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  roomId: string;
  status: ScheduleStatus;
  allowCapacityOverride?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  groups: ExamScheduleGroup[];
  supervisors: ScheduleSupervisorAssignment[];
  // Hydrated
  room?: Room;
}

export interface StudentAttendance {
  id: string;
  scheduleId: string;
  scheduleGroupId?: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  timestamp?: string;
  updatedAt?: string;
  // Hydrated
  studentName?: string;
  studentNis?: string;
  studentNisn?: string;
  examNumber?: string;
  className?: string;
  subjectName?: string;
}

export interface ExamMinute {
  id: string;
  scheduleId: string;
  date?: string;
  session?: number;
  roomId?: string;
  totalRegistered?: number;
  presentCount?: number;
  absentCount?: number;
  absentStudentNumbers?: string;
  notes?: string;
  supervisor1Id?: string;
  supervisor2Id?: string;
  actualStart?: string;
  actualEnd?: string;
  isOrderly?: boolean;
  hasIssues?: boolean;
  issueDescription?: string;
  supervisorNotes?: string;
  verifiedBySupervisor: boolean;
  verifiedByCommittee?: boolean;
  verifiedByPrincipal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  timestamp?: string;
  createdAt?: string;
  ipAddress?: string;
}

export interface ConflictValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  capacityExceeded?: boolean;
  totalParticipants?: number;
  roomCapacity?: number;
}

export type MakeUpStatus = 'BELUM_SUSULAN' | 'SUDAH_SUSULAN';

export interface MakeUpExamRecord {
  id: string;
  attendanceId?: string;
  scheduleId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  originalDate: string;
  originalSession?: number;
  roomId?: string;
  reason: AttendanceStatus | string;
  status: MakeUpStatus;
  makeUpDate?: string;
  makeUpRoomId?: string;
  makeUpSupervisorId?: string;
  notes?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Hydrated
  studentName?: string;
  studentNis?: string;
  studentNisn?: string;
  examNumber?: string;
  className?: string;
  subjectName?: string;
  roomName?: string;
  supervisorName?: string;
}
