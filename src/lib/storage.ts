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
  AuditLog,
  ConflictValidationResult,
  Role,
  MakeUpExamRecord
} from '../types';
import {
  initialSchoolSetting,
  initialRooms,
  initialClasses,
  initialSubjects,
  initialSupervisors,
  initialStudents,
  initialSchedules,
  initialExamMinutes,
  initialStudentAttendances,
  initialUsers,
  initialAuditLogs
} from '../data/initialData';
import {
  saveDocument,
  deleteDocument,
  batchSaveDocuments,
  batchDeleteDocuments,
  subscribeToCollection,
  testFirestoreConnection,
  isFirebaseActive
} from './firebase';

const STORAGE_KEYS = {
  SETTINGS: 'aus_settings_v1',
  ROOMS: 'aus_rooms_v1',
  CLASSES: 'aus_classes_v1',
  SUBJECTS: 'aus_subjects_v1',
  SUPERVISORS: 'aus_supervisors_v1',
  STUDENTS: 'aus_students_v1',
  SCHEDULES: 'aus_schedules_v1',
  MINUTES: 'aus_minutes_v1',
  ATTENDANCES: 'aus_attendances_v1',
  MAKEUP_EXAMS: 'aus_makeup_exams_v1',
  USERS: 'aus_users_v1',
  AUDIT_LOGS: 'aus_audit_logs_v1',
  CURRENT_USER: 'aus_current_user_v1'
};

let isRealTimeSyncInitialized = false;
let realTimeConnected = false;
const syncStatusListeners: ((connected: boolean) => void)[] = [];

function notifySyncStatus(connected: boolean) {
  realTimeConnected = connected;
  syncStatusListeners.forEach((cb) => {
    try { cb(connected); } catch {}
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('firebase-sync-status', { detail: { connected } }));
  }
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T, notify = true): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (notify) {
      window.dispatchEvent(new Event('storage-updated'));
    }
  } catch (err) {
    console.error(`Failed to save ${key} to storage`, err);
  }
}

export const StorageService = {
  // Init storage on boot
  initStorage: () => {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      StorageService.resetToDefault();
    }
    StorageService.initRealTimeSync();
  },

  // Real-time Firestore sync
  initRealTimeSync: () => {
    if (isRealTimeSyncInitialized || !isFirebaseActive) return;
    isRealTimeSyncInitialized = true;

    testFirestoreConnection().then((ok) => {
      notifySyncStatus(ok);
    });

    // 1. Settings
    subscribeToCollection<SchoolSetting>('settings', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.SETTINGS, items[0], true);
      } else {
        const cur = StorageService.getSettings();
        if (cur) saveDocument('settings', cur.id, cur);
      }
      notifySyncStatus(true);
    });

    // 2. Rooms
    subscribeToCollection<Room>('rooms', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.ROOMS, items, true);
      } else {
        const cur = StorageService.getRooms();
        if (cur && cur.length > 0) batchSaveDocuments('rooms', cur);
      }
      notifySyncStatus(true);
    });

    // 3. Classes
    subscribeToCollection<ClassItem>('classes', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.CLASSES, items, true);
      } else {
        const cur = StorageService.getClasses();
        if (cur && cur.length > 0) batchSaveDocuments('classes', cur);
      }
      notifySyncStatus(true);
    });

    // 4. Subjects
    subscribeToCollection<Subject>('subjects', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.SUBJECTS, items, true);
      } else {
        const cur = StorageService.getSubjects();
        if (cur && cur.length > 0) batchSaveDocuments('subjects', cur);
      }
      notifySyncStatus(true);
    });

    // 5. Supervisors
    subscribeToCollection<Supervisor>('supervisors', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.SUPERVISORS, items, true);
      } else {
        const cur = StorageService.getSupervisors();
        if (cur && cur.length > 0) batchSaveDocuments('supervisors', cur);
      }
      notifySyncStatus(true);
    });

    // 6. Students
    subscribeToCollection<Student>('students', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.STUDENTS, items, true);
      } else {
        const cur = StorageService.getStudents();
        if (cur && cur.length > 0) batchSaveDocuments('students', cur);
      }
      notifySyncStatus(true);
    });

    // 7. Schedules
    subscribeToCollection<ExamSchedule>('schedules', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.SCHEDULES, items, true);
      } else {
        const cur = StorageService.getSchedules();
        if (cur && cur.length > 0) batchSaveDocuments('schedules', cur);
      }
      notifySyncStatus(true);
    });

    // 8. Minutes
    subscribeToCollection<ExamMinute>('minutes', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.MINUTES, items, true);
      } else {
        const cur = StorageService.getExamMinutes();
        if (cur && cur.length > 0) batchSaveDocuments('minutes', cur);
      }
      notifySyncStatus(true);
    });

    // 9. Attendances
    subscribeToCollection<StudentAttendance>('attendances', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.ATTENDANCES, items, true);
      } else {
        const cur = StorageService.getStudentAttendances();
        if (cur && cur.length > 0) batchSaveDocuments('attendances', cur);
      }
      notifySyncStatus(true);
    });

    // 10. Makeups
    subscribeToCollection<MakeUpExamRecord>('makeups', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, items, true);
      }
      notifySyncStatus(true);
    });

    // 11. Audit Logs
    subscribeToCollection<AuditLog>('auditLogs', (items) => {
      if (items && items.length > 0) {
        setStorageItem(STORAGE_KEYS.AUDIT_LOGS, items, true);
      } else {
        const cur = StorageService.getAuditLogs();
        if (cur && cur.length > 0) batchSaveDocuments('auditLogs', cur);
      }
      notifySyncStatus(true);
    });
  },

  isRealTimeConnected: () => realTimeConnected,
  subscribeSyncStatus: (listener: (connected: boolean) => void) => {
    syncStatusListeners.push(listener);
    listener(realTimeConnected);
    return () => {
      const idx = syncStatusListeners.indexOf(listener);
      if (idx >= 0) syncStatusListeners.splice(idx, 1);
    };
  },

  // Reset all to initial mock
  resetToDefault: () => {
    setStorageItem(STORAGE_KEYS.SETTINGS, initialSchoolSetting);
    setStorageItem(STORAGE_KEYS.ROOMS, initialRooms);
    setStorageItem(STORAGE_KEYS.CLASSES, initialClasses);
    setStorageItem(STORAGE_KEYS.SUBJECTS, initialSubjects);
    setStorageItem(STORAGE_KEYS.SUPERVISORS, initialSupervisors);
    setStorageItem(STORAGE_KEYS.STUDENTS, initialStudents);
    setStorageItem(STORAGE_KEYS.SCHEDULES, initialSchedules);
    setStorageItem(STORAGE_KEYS.MINUTES, initialExamMinutes);
    setStorageItem(STORAGE_KEYS.ATTENDANCES, initialStudentAttendances);
    setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, []);
    setStorageItem(STORAGE_KEYS.USERS, initialUsers);
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, initialUsers[0]);
    StorageService.addAuditLog('Reset Database', 'System', undefined, 'Mengembalikan seluruh data ke data bawaan.');

    if (isFirebaseActive) {
      saveDocument('settings', initialSchoolSetting.id, initialSchoolSetting);
      batchSaveDocuments('rooms', initialRooms);
      batchSaveDocuments('classes', initialClasses);
      batchSaveDocuments('subjects', initialSubjects);
      batchSaveDocuments('supervisors', initialSupervisors);
      batchSaveDocuments('students', initialStudents);
      batchSaveDocuments('schedules', initialSchedules);
      batchSaveDocuments('minutes', initialExamMinutes);
      batchSaveDocuments('attendances', initialStudentAttendances);
      batchSaveDocuments('auditLogs', initialAuditLogs);
    }
  },

  resetToInitialData: () => {
    StorageService.resetToDefault();
  },

  // Settings
  getSettings: (): SchoolSetting => getStorageItem(STORAGE_KEYS.SETTINGS, initialSchoolSetting),
  saveSettings: (settings: SchoolSetting) => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);
    saveDocument('settings', updated.id, updated);
    StorageService.addAuditLog('Update Pengaturan', 'SchoolSetting', settings.id, 'Memperbarui data identitas sekolah & pengaturan ujian.');
  },

  // Rooms
  getRooms: (): Room[] => getStorageItem(STORAGE_KEYS.ROOMS, initialRooms),
  saveRoom: (room: Room) => {
    const rooms = StorageService.getRooms();
    const existingIndex = rooms.findIndex((r) => r.id === room.id);
    let saved: Room;
    if (existingIndex >= 0) {
      saved = { ...room, updatedAt: new Date().toISOString() };
      rooms[existingIndex] = saved;
      StorageService.addAuditLog('Edit Ruang', 'Room', room.id, `Memperbarui data ruang ${room.code} (${room.name})`);
    } else {
      saved = { ...room, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      rooms.push(saved);
      StorageService.addAuditLog('Tambah Ruang', 'Room', room.id, `Menambahkan ruang baru ${room.code} (${room.name})`);
    }
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    saveDocument('rooms', saved.id, saved);
  },
  deleteRoom: (roomId: string): { success: boolean; message: string } => {
    const schedules = StorageService.getSchedules();
    const isUsed = schedules.some((s) => s.roomId === roomId);
    if (isUsed) {
      return {
        success: false,
        message: 'Ruang ini sudah digunakan dalam jadwal ujian dan tidak dapat dihapus. Nonaktifkan ruang jika sudah tidak digunakan.'
      };
    }
    const rooms = StorageService.getRooms().filter((r) => r.id !== roomId);
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    deleteDocument('rooms', roomId);
    StorageService.addAuditLog('Hapus Ruang', 'Room', roomId, `Menghapus master ruang ID: ${roomId}`);
    return { success: true, message: 'Ruang berhasil dihapus.' };
  },
  deleteMultipleRooms: (roomIds: string[], force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const schedules = StorageService.getSchedules();
    const usedRoomIds = new Set(schedules.map((s) => s.roomId));
    const rooms = StorageService.getRooms();
    const toDeleteSet = new Set(roomIds);
    let deletedCount = 0;
    let blockedCount = 0;
    const deletedIds: string[] = [];

    const remaining = rooms.filter((r) => {
      if (toDeleteSet.has(r.id)) {
        if (!force && usedRoomIds.has(r.id)) {
          blockedCount++;
          return true;
        } else {
          deletedCount++;
          deletedIds.push(r.id);
          return false;
        }
      }
      return true;
    });

    setStorageItem(STORAGE_KEYS.ROOMS, remaining);
    if (deletedIds.length > 0) {
      batchDeleteDocuments('rooms', deletedIds);
    }
    StorageService.addAuditLog('Hapus Massal Ruang', 'Room', undefined, `Menghapus ${deletedCount} ruang (${blockedCount} dilewati karena terjadwal).`);
    return {
      success: deletedCount > 0,
      deletedCount,
      blockedCount,
      message: blockedCount > 0
        ? `Berhasil menghapus ${deletedCount} ruang. ${blockedCount} ruang dilewati karena sedang digunakan dalam jadwal ujian.`
        : `Berhasil menghapus ${deletedCount} ruang.`
    };
  },
  clearAllRooms: (force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const allRooms = StorageService.getRooms();
    const ids = allRooms.map((r) => r.id);
    return StorageService.deleteMultipleRooms(ids, force);
  },

  // Classes
  getClasses: (): ClassItem[] => getStorageItem(STORAGE_KEYS.CLASSES, initialClasses),
  saveClass: (item: ClassItem) => {
    const classes = StorageService.getClasses();
    const idx = classes.findIndex((c) => c.id === item.id);
    let saved: ClassItem;
    if (idx >= 0) {
      saved = { ...item, updatedAt: new Date().toISOString() };
      classes[idx] = saved;
      StorageService.addAuditLog('Edit Kelas', 'Class', item.id, `Memperbarui kelas ${item.name}`);
    } else {
      saved = { ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      classes.push(saved);
      StorageService.addAuditLog('Tambah Kelas', 'Class', item.id, `Menambahkan kelas baru ${item.name}`);
    }
    setStorageItem(STORAGE_KEYS.CLASSES, classes);
    saveDocument('classes', saved.id, saved);
  },
  deleteClass: (classId: string): { success: boolean; message: string } => {
    const students = StorageService.getStudents();
    if (students.some((s) => s.classId === classId)) {
      return { success: false, message: 'Kelas ini masih memiliki data siswa terdaftar. Pindahkan atau hapus siswa terlebih dahulu.' };
    }
    const filtered = StorageService.getClasses().filter((c) => c.id !== classId);
    setStorageItem(STORAGE_KEYS.CLASSES, filtered);
    deleteDocument('classes', classId);
    StorageService.addAuditLog('Hapus Kelas', 'Class', classId, `Menghapus data kelas ID: ${classId}`);
    return { success: true, message: 'Kelas berhasil dihapus.' };
  },
  deleteMultipleClasses: (classIds: string[], force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const students = StorageService.getStudents();
    const classesWithStudents = new Set(students.map((s) => s.classId));
    const classes = StorageService.getClasses();
    const toDeleteSet = new Set(classIds);
    let deletedCount = 0;
    let blockedCount = 0;
    const deletedIds: string[] = [];

    const remaining = classes.filter((c) => {
      if (toDeleteSet.has(c.id)) {
        if (!force && classesWithStudents.has(c.id)) {
          blockedCount++;
          return true;
        } else {
          deletedCount++;
          deletedIds.push(c.id);
          return false;
        }
      }
      return true;
    });

    setStorageItem(STORAGE_KEYS.CLASSES, remaining);
    if (deletedIds.length > 0) {
      batchDeleteDocuments('classes', deletedIds);
    }
    StorageService.addAuditLog('Hapus Massal Kelas', 'Class', undefined, `Menghapus ${deletedCount} kelas (${blockedCount} dilewati karena memiliki siswa).`);
    return {
      success: deletedCount > 0,
      deletedCount,
      blockedCount,
      message: blockedCount > 0
        ? `Berhasil menghapus ${deletedCount} kelas. ${blockedCount} kelas dilewati karena masih memiliki data siswa.`
        : `Berhasil menghapus ${deletedCount} kelas.`
    };
  },
  clearAllClasses: (force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const allClasses = StorageService.getClasses();
    return StorageService.deleteMultipleClasses(allClasses.map((c) => c.id), force);
  },
  saveMultipleClasses: (newClasses: ClassItem[]) => {
    const existing = StorageService.getClasses();
    const map = new Map<string, ClassItem>();
    existing.forEach((c) => map.set(c.code.toUpperCase(), c));
    newClasses.forEach((c) => {
      const key = c.code.toUpperCase();
      const prev = map.get(key);
      if (prev) {
        map.set(key, { ...prev, ...c, id: prev.id, updatedAt: new Date().toISOString() });
      } else {
        map.set(key, { ...c, createdAt: c.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    });
    const merged = Array.from(map.values());
    setStorageItem(STORAGE_KEYS.CLASSES, merged);
    batchSaveDocuments('classes', merged);
    StorageService.addAuditLog('Import Kelas', 'Class', undefined, `Mengimpor / memperbarui ${newClasses.length} data kelas.`);
  },

  // Subjects
  getSubjects: (): Subject[] => getStorageItem(STORAGE_KEYS.SUBJECTS, initialSubjects),
  saveSubject: (subj: Subject) => {
    const subjects = StorageService.getSubjects();
    const idx = subjects.findIndex((s) => s.id === subj.id);
    let saved: Subject;
    if (idx >= 0) {
      saved = { ...subj, updatedAt: new Date().toISOString() };
      subjects[idx] = saved;
      StorageService.addAuditLog('Edit Mapel', 'Subject', subj.id, `Memperbarui mata pelajaran ${subj.name}`);
    } else {
      saved = { ...subj, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      subjects.push(saved);
      StorageService.addAuditLog('Tambah Mapel', 'Subject', subj.id, `Menambahkan mata pelajaran ${subj.name}`);
    }
    setStorageItem(STORAGE_KEYS.SUBJECTS, subjects);
    saveDocument('subjects', saved.id, saved);
  },
  deleteSubject: (subjId: string): { success: boolean; message: string } => {
    const filtered = StorageService.getSubjects().filter((s) => s.id !== subjId);
    setStorageItem(STORAGE_KEYS.SUBJECTS, filtered);
    deleteDocument('subjects', subjId);
    StorageService.addAuditLog('Hapus Mapel', 'Subject', subjId, `Menghapus mata pelajaran ID: ${subjId}`);
    return { success: true, message: 'Mata pelajaran berhasil dihapus.' };
  },
  deleteMultipleSubjects: (subjectIds: string[]): { success: boolean; deletedCount: number; message: string } => {
    const toDelete = new Set(subjectIds);
    const subjects = StorageService.getSubjects();
    const remaining = subjects.filter((s) => !toDelete.has(s.id));
    const deletedCount = subjects.length - remaining.length;
    setStorageItem(STORAGE_KEYS.SUBJECTS, remaining);
    if (subjectIds.length > 0) {
      batchDeleteDocuments('subjects', subjectIds);
    }
    StorageService.addAuditLog('Hapus Massal Mapel', 'Subject', undefined, `Menghapus ${deletedCount} mata pelajaran.`);
    return { success: true, deletedCount, message: `Berhasil menghapus ${deletedCount} mata pelajaran.` };
  },
  clearAllSubjects: (): { success: boolean; deletedCount: number; message: string } => {
    const subjects = StorageService.getSubjects();
    const count = subjects.length;
    setStorageItem(STORAGE_KEYS.SUBJECTS, []);
    if (subjects.length > 0) {
      batchDeleteDocuments('subjects', subjects.map((s) => s.id));
    }
    StorageService.addAuditLog('Hapus Semua Mapel', 'Subject', undefined, `Menghapus seluruh mata pelajaran (${count} mapel).`);
    return { success: true, deletedCount: count, message: `Berhasil menghapus seluruh data mata pelajaran (${count} mapel).` };
  },
  saveMultipleSubjects: (newSubjects: Subject[]) => {
    const existing = StorageService.getSubjects();
    const map = new Map<string, Subject>();
    existing.forEach((s) => map.set(s.code.toUpperCase(), s));
    newSubjects.forEach((s) => {
      const key = s.code.toUpperCase();
      const prev = map.get(key);
      if (prev) {
        map.set(key, { ...prev, ...s, id: prev.id, updatedAt: new Date().toISOString() });
      } else {
        map.set(key, { ...s, createdAt: s.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    });
    const merged = Array.from(map.values());
    setStorageItem(STORAGE_KEYS.SUBJECTS, merged);
    batchSaveDocuments('subjects', merged);
    StorageService.addAuditLog('Import Mapel', 'Subject', undefined, `Mengimpor / memperbarui ${newSubjects.length} data mata pelajaran.`);
  },

  // Supervisors
  getSupervisors: (): Supervisor[] => getStorageItem(STORAGE_KEYS.SUPERVISORS, initialSupervisors),
  saveSupervisor: (sup: Supervisor) => {
    const supervisors = StorageService.getSupervisors();
    const idx = supervisors.findIndex((s) => s.id === sup.id);
    let saved: Supervisor;
    if (idx >= 0) {
      saved = { ...sup, updatedAt: new Date().toISOString() };
      supervisors[idx] = saved;
      StorageService.addAuditLog('Edit Pengawas', 'Supervisor', sup.id, `Memperbarui pengawas ${sup.name}`);
    } else {
      saved = { ...sup, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      supervisors.push(saved);
      StorageService.addAuditLog('Tambah Pengawas', 'Supervisor', sup.id, `Menambahkan pengawas baru ${sup.name}`);
    }
    setStorageItem(STORAGE_KEYS.SUPERVISORS, supervisors);
    saveDocument('supervisors', saved.id, saved);
  },
  deleteSupervisor: (supId: string): { success: boolean; message: string } => {
    const schedules = StorageService.getSchedules();
    const isAssigned = schedules.some((s) => s.supervisors.some((as) => as.supervisorId === supId));
    if (isAssigned) {
      return { success: false, message: 'Pengawas sudah terdaftar dalam jadwal ujian dan tidak dapat dihapus.' };
    }
    const filtered = StorageService.getSupervisors().filter((s) => s.id !== supId);
    setStorageItem(STORAGE_KEYS.SUPERVISORS, filtered);
    deleteDocument('supervisors', supId);
    StorageService.addAuditLog('Hapus Pengawas', 'Supervisor', supId, `Menghapus pengawas ID: ${supId}`);
    return { success: true, message: 'Pengawas berhasil dihapus.' };
  },
  deleteMultipleSupervisors: (supIds: string[], force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const schedules = StorageService.getSchedules();
    const assignedSupIds = new Set<string>();
    schedules.forEach((s) => s.supervisors.forEach((as) => assignedSupIds.add(as.supervisorId)));

    const supervisors = StorageService.getSupervisors();
    const toDeleteSet = new Set(supIds);
    let deletedCount = 0;
    let blockedCount = 0;
    const deletedIds: string[] = [];

    const remaining = supervisors.filter((sup) => {
      if (toDeleteSet.has(sup.id)) {
        if (!force && assignedSupIds.has(sup.id)) {
          blockedCount++;
          return true;
        } else {
          deletedCount++;
          deletedIds.push(sup.id);
          return false;
        }
      }
      return true;
    });

    setStorageItem(STORAGE_KEYS.SUPERVISORS, remaining);
    if (deletedIds.length > 0) {
      batchDeleteDocuments('supervisors', deletedIds);
    }
    StorageService.addAuditLog('Hapus Massal Pengawas', 'Supervisor', undefined, `Menghapus ${deletedCount} pengawas (${blockedCount} dilewati karena memiliki jadwal).`);
    return {
      success: deletedCount > 0,
      deletedCount,
      blockedCount,
      message: blockedCount > 0
        ? `Berhasil menghapus ${deletedCount} pengawas. ${blockedCount} pengawas dilewati karena sedang bertugas dalam jadwal ujian.`
        : `Berhasil menghapus ${deletedCount} pengawas.`
    };
  },
  clearAllSupervisors: (force: boolean = false): { success: boolean; deletedCount: number; blockedCount: number; message: string } => {
    const supervisors = StorageService.getSupervisors();
    return StorageService.deleteMultipleSupervisors(supervisors.map((s) => s.id), force);
  },
  saveMultipleSupervisors: (newSupervisors: Supervisor[]) => {
    const existing = StorageService.getSupervisors();
    const map = new Map<string, Supervisor>();
    existing.forEach((sup) => {
      const key = sup.nip ? sup.nip.trim() : sup.name.trim().toLowerCase();
      map.set(key, sup);
    });
    newSupervisors.forEach((sup) => {
      const key = sup.nip ? sup.nip.trim() : sup.name.trim().toLowerCase();
      const prev = map.get(key);
      if (prev) {
        map.set(key, { ...prev, ...sup, id: prev.id, updatedAt: new Date().toISOString() });
      } else {
        map.set(key, { ...sup, createdAt: sup.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    });
    const merged = Array.from(map.values());
    setStorageItem(STORAGE_KEYS.SUPERVISORS, merged);
    batchSaveDocuments('supervisors', merged);
    StorageService.addAuditLog('Import Pengawas', 'Supervisor', undefined, `Mengimpor / memperbarui ${newSupervisors.length} data pengawas.`);
  },

  // Students
  getStudents: (): Student[] => getStorageItem(STORAGE_KEYS.STUDENTS, initialStudents),
  saveStudent: (std: Student): { success: boolean; message?: string } => {
    const students = StorageService.getStudents();
    // Check unique NIS
    const dupNis = students.find((s) => s.id !== std.id && s.nis === std.nis);
    if (dupNis) {
      return { success: false, message: `Siswa dengan NIS ${std.nis} sudah terdaftar (${dupNis.name}).` };
    }

    const idx = students.findIndex((s) => s.id === std.id);
    let saved: Student;
    if (idx >= 0) {
      saved = { ...std, updatedAt: new Date().toISOString() };
      students[idx] = saved;
      StorageService.addAuditLog('Edit Siswa', 'Student', std.id, `Memperbarui siswa ${std.name} (${std.nis})`);
    } else {
      saved = { ...std, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      students.push(saved);
      StorageService.addAuditLog('Tambah Siswa', 'Student', std.id, `Menambahkan siswa baru ${std.name} (${std.nis})`);
    }
    setStorageItem(STORAGE_KEYS.STUDENTS, students);
    saveDocument('students', saved.id, saved);
    return { success: true, message: 'Data siswa berhasil disimpan.' };
  },
  saveMultipleStudents: (newStudents: Student[]) => {
    const existing = StorageService.getStudents();
    const map = new Map<string, Student>();
    existing.forEach((s) => map.set(s.id, s));
    newStudents.forEach((s) => map.set(s.id, s));
    const merged = Array.from(map.values());
    setStorageItem(STORAGE_KEYS.STUDENTS, merged);
    batchSaveDocuments('students', merged);
    StorageService.addAuditLog('Import Siswa', 'Student', undefined, `Menyimpan / memperbarui ${newStudents.length} data siswa.`);
  },
  deleteStudent: (studentId: string) => {
    const filtered = StorageService.getStudents().filter((s) => s.id !== studentId);
    setStorageItem(STORAGE_KEYS.STUDENTS, filtered);
    deleteDocument('students', studentId);
    StorageService.addAuditLog('Hapus Siswa', 'Student', studentId, `Menghapus data siswa ID: ${studentId}`);
  },
  deleteMultipleStudents: (studentIds: string[]): { success: boolean; deletedCount: number; message: string } => {
    const toDelete = new Set(studentIds);
    const students = StorageService.getStudents();
    const remaining = students.filter((s) => !toDelete.has(s.id));
    const deletedCount = students.length - remaining.length;
    setStorageItem(STORAGE_KEYS.STUDENTS, remaining);
    if (studentIds.length > 0) {
      batchDeleteDocuments('students', studentIds);
    }
    StorageService.addAuditLog('Hapus Massal Siswa', 'Student', undefined, `Menghapus ${deletedCount} data siswa.`);
    return { success: true, deletedCount, message: `Berhasil menghapus ${deletedCount} data siswa.` };
  },
  clearAllStudents: (): { success: boolean; deletedCount: number; message: string } => {
    const students = StorageService.getStudents();
    const count = students.length;
    setStorageItem(STORAGE_KEYS.STUDENTS, []);
    if (students.length > 0) {
      batchDeleteDocuments('students', students.map((s) => s.id));
    }
    StorageService.addAuditLog('Hapus Semua Siswa', 'Student', undefined, `Menghapus seluruh data siswa (${count} siswa).`);
    return { success: true, deletedCount: count, message: `Berhasil menghapus seluruh data siswa (${count} siswa).` };
  },

  // Exam Schedules
  getSchedules: (): ExamSchedule[] => getStorageItem(STORAGE_KEYS.SCHEDULES, initialSchedules),
  saveSchedule: (schedule: ExamSchedule) => {
    const schedules = StorageService.getSchedules();
    const idx = schedules.findIndex((s) => s.id === schedule.id);
    let saved: ExamSchedule;
    if (idx >= 0) {
      saved = { ...schedule, updatedAt: new Date().toISOString() };
      schedules[idx] = saved;
      StorageService.addAuditLog('Edit Jadwal', 'ExamSchedule', schedule.id, `Memperbarui jadwal tanggal ${schedule.date} sesi ${schedule.session}`);
    } else {
      saved = { ...schedule, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      schedules.push(saved);
      StorageService.addAuditLog('Tambah Jadwal', 'ExamSchedule', schedule.id, `Membuat jadwal baru tanggal ${schedule.date} sesi ${schedule.session}`);
    }
    setStorageItem(STORAGE_KEYS.SCHEDULES, schedules);
    saveDocument('schedules', saved.id, saved);
  },
  deleteSchedule: (scheduleId: string) => {
    const filtered = StorageService.getSchedules().filter((s) => s.id !== scheduleId);
    setStorageItem(STORAGE_KEYS.SCHEDULES, filtered);
    deleteDocument('schedules', scheduleId);
    const minutes = StorageService.getExamMinutes().filter((m) => m.scheduleId !== scheduleId);
    setStorageItem(STORAGE_KEYS.MINUTES, minutes);
    const attendances = StorageService.getStudentAttendances().filter((a) => a.scheduleId !== scheduleId);
    setStorageItem(STORAGE_KEYS.ATTENDANCES, attendances);
    StorageService.addAuditLog('Hapus Jadwal', 'ExamSchedule', scheduleId, `Menghapus jadwal ujian ID: ${scheduleId}`);
  },
  deleteMultipleSchedules: (scheduleIds: string[]): { success: boolean; deletedCount: number; message: string } => {
    const toDelete = new Set(scheduleIds);
    const schedules = StorageService.getSchedules();
    const remaining = schedules.filter((s) => !toDelete.has(s.id));
    const deletedCount = schedules.length - remaining.length;
    setStorageItem(STORAGE_KEYS.SCHEDULES, remaining);
    if (scheduleIds.length > 0) {
      batchDeleteDocuments('schedules', scheduleIds);
    }

    const minutes = StorageService.getExamMinutes().filter((m) => !toDelete.has(m.scheduleId));
    setStorageItem(STORAGE_KEYS.MINUTES, minutes);

    const attendances = StorageService.getStudentAttendances().filter((a) => !toDelete.has(a.scheduleId));
    setStorageItem(STORAGE_KEYS.ATTENDANCES, attendances);

    StorageService.addAuditLog('Hapus Massal Jadwal', 'ExamSchedule', undefined, `Menghapus ${deletedCount} jadwal ujian beserta data berita acara & absensi terkait.`);
    return { success: true, deletedCount, message: `Berhasil menghapus ${deletedCount} jadwal ujian.` };
  },
  clearAllSchedules: (): { success: boolean; deletedCount: number; message: string } => {
    const schedules = StorageService.getSchedules();
    const count = schedules.length;
    setStorageItem(STORAGE_KEYS.SCHEDULES, []);
    setStorageItem(STORAGE_KEYS.MINUTES, []);
    setStorageItem(STORAGE_KEYS.ATTENDANCES, []);
    if (schedules.length > 0) {
      batchDeleteDocuments('schedules', schedules.map((s) => s.id));
    }
    StorageService.addAuditLog('Hapus Semua Jadwal', 'ExamSchedule', undefined, `Menghapus seluruh jadwal ujian (${count} jadwal) dan data berita acara & absensi terkait.`);
    return { success: true, deletedCount: count, message: `Berhasil menghapus seluruh jadwal ujian (${count} jadwal).` };
  },

  // Exam Minutes (Berita Acara)
  getExamMinutes: (): ExamMinute[] => getStorageItem(STORAGE_KEYS.MINUTES, initialExamMinutes),
  saveExamMinute: (minute: ExamMinute) => {
    const list = StorageService.getExamMinutes();
    const idx = list.findIndex((m) => m.scheduleId === minute.scheduleId || m.id === minute.id);
    let saved: ExamMinute;
    if (idx >= 0) {
      saved = { ...minute, updatedAt: new Date().toISOString() };
      list[idx] = saved;
    } else {
      saved = { ...minute, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      list.push(saved);
    }
    setStorageItem(STORAGE_KEYS.MINUTES, list);
    saveDocument('minutes', saved.id, saved);
    StorageService.addAuditLog('Simpan Berita Acara', 'ExamMinute', minute.scheduleId, `Memperbarui berita acara untuk jadwal ${minute.scheduleId}`);
  },

  // Student Attendances
  getStudentAttendances: (): StudentAttendance[] => getStorageItem(STORAGE_KEYS.ATTENDANCES, initialStudentAttendances),
  saveStudentAttendance: (att: StudentAttendance) => {
    const existing = StorageService.getStudentAttendances();
    const idx = existing.findIndex((a) => a.scheduleId === att.scheduleId && a.studentId === att.studentId);
    let saved: StudentAttendance;
    if (idx >= 0) {
      saved = { ...att, updatedAt: new Date().toISOString() };
      existing[idx] = saved;
    } else {
      saved = { ...att, updatedAt: new Date().toISOString() };
      existing.push(saved);
    }
    setStorageItem(STORAGE_KEYS.ATTENDANCES, existing);
    saveDocument('attendances', saved.id, saved);
  },
  saveStudentAttendances: (attendances: StudentAttendance[]) => {
    const existing = StorageService.getStudentAttendances();
    const map = new Map<string, StudentAttendance>();
    existing.forEach((a) => map.set(`${a.scheduleId}_${a.studentId}`, a));
    attendances.forEach((a) => map.set(`${a.scheduleId}_${a.studentId}`, { ...a, updatedAt: new Date().toISOString() }));
    const merged = Array.from(map.values());
    setStorageItem(STORAGE_KEYS.ATTENDANCES, merged);
    batchSaveDocuments('attendances', merged);
    StorageService.addAuditLog('Simpan Daftar Hadir Siswa', 'StudentAttendance', undefined, `Memperbarui ${attendances.length} status kehadiran siswa.`);
  },

  // ==========================================
  // DAFTAR SISWA SUSULAN (MAKE-UP EXAMS)
  // ==========================================
  getMakeUpExams: (): MakeUpExamRecord[] => {
    const saved = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const attendances = StorageService.getStudentAttendances();
    const schedules = StorageService.getSchedules();
    const students = StorageService.getStudents();
    const subjects = StorageService.getSubjects();
    const classes = StorageService.getClasses();
    const rooms = StorageService.getRooms();
    const supervisors = StorageService.getSupervisors();

    const studentMap = new Map(students.map((s) => [s.id, s]));
    const scheduleMap = new Map(schedules.map((s) => [s.id, s]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const classMap = new Map(classes.map((c) => [c.id, c]));
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    const supervisorMap = new Map(supervisors.map((s) => [s.id, s]));

    const existingMap = new Map<string, MakeUpExamRecord>();
    saved.forEach((item) => {
      existingMap.set(`${item.scheduleId}_${item.studentId}`, item);
    });

    let hasNewRecords = false;

    // Scan all student attendances where status is NOT Hadir
    attendances.forEach((att) => {
      if (['Tidak Hadir', 'Sakit', 'Izin', 'Alpa'].includes(att.status)) {
        const key = `${att.scheduleId}_${att.studentId}`;
        const student = studentMap.get(att.studentId);
        const schedule = scheduleMap.get(att.scheduleId);

        if (student && schedule) {
          if (!existingMap.has(key)) {
            // Find subject for this student's class from schedule groups
            const grp = schedule.groups.find((g) => g.classId === student.classId) || schedule.groups[0];
            const newRecord: MakeUpExamRecord = {
              id: `mu-${att.scheduleId}-${att.studentId}`,
              attendanceId: att.id,
              scheduleId: att.scheduleId,
              studentId: att.studentId,
              subjectId: grp?.subjectId || subjects[0]?.id || '',
              classId: student.classId,
              originalDate: schedule.date,
              originalSession: schedule.session,
              roomId: schedule.roomId,
              reason: att.status,
              status: 'BELUM_SUSULAN',
              makeUpDate: '',
              notes: att.notes || '',
              createdAt: att.updatedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            existingMap.set(key, newRecord);
            hasNewRecords = true;
          } else {
            // Update reason if it changed in attendance
            const existing = existingMap.get(key)!;
            if (existing.reason !== att.status) {
              existing.reason = att.status;
              existing.updatedAt = new Date().toISOString();
              hasNewRecords = true;
            }
          }
        }
      }
    });

    // Hydrate all records with master entity names for easy rendering
    const fullList = Array.from(existingMap.values()).map((rec) => {
      const student = studentMap.get(rec.studentId);
      const cls = classMap.get(rec.classId) || (student ? classMap.get(student.classId) : null);
      const subj = subjectMap.get(rec.subjectId);
      const room = rec.makeUpRoomId ? roomMap.get(rec.makeUpRoomId) : (rec.roomId ? roomMap.get(rec.roomId) : null);
      const sup = rec.makeUpSupervisorId ? supervisorMap.get(rec.makeUpSupervisorId) : null;

      return {
        ...rec,
        studentName: student?.name || 'Siswa',
        studentNis: student?.nis || '',
        studentNisn: student?.nisn || '',
        examNumber: student?.examNumber || student?.nis || '-',
        className: cls?.name || '-',
        subjectName: subj?.name || '-',
        roomName: room ? `${room.code} (${room.name})` : undefined,
        supervisorName: sup?.name || undefined
      };
    });

    if (hasNewRecords) {
      setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, Array.from(existingMap.values()));
    }

    return fullList;
  },

  saveMakeUpExam: (record: MakeUpExamRecord) => {
    const list = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const idx = list.findIndex((m) => m.id === record.id || (m.scheduleId === record.scheduleId && m.studentId === record.studentId));
    let saved: MakeUpExamRecord;
    if (idx >= 0) {
      saved = { ...list[idx], ...record, updatedAt: new Date().toISOString() };
      list[idx] = saved;
    } else {
      saved = { ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      list.push(saved);
    }
    setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, list);
    saveDocument('makeups', saved.id, saved);
    StorageService.addAuditLog('Update Siswa Susulan', 'MakeUpExam', record.id, `Memperbarui status ujian susulan siswa ${record.studentName || record.studentId}`);
  },

  confirmMakeUpExam: (
    id: string,
    updates: {
      makeUpDate: string;
      subjectId?: string;
      makeUpRoomId?: string;
      makeUpSupervisorId?: string;
      notes?: string;
      status: 'SUDAH_SUSULAN' | 'BELUM_SUSULAN';
    }
  ): { success: boolean; message: string } => {
    const list = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const idx = list.findIndex((m) => m.id === id);
    const currentUser = StorageService.getCurrentUser();

    if (idx >= 0) {
      const updatedRecord = {
        ...list[idx],
        ...updates,
        confirmedAt: updates.status === 'SUDAH_SUSULAN' ? new Date().toISOString() : undefined,
        confirmedBy: updates.status === 'SUDAH_SUSULAN' ? (currentUser?.fullName || 'Panitia Ujian') : undefined,
        updatedAt: new Date().toISOString()
      };
      list[idx] = updatedRecord;
      setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, list);
      saveDocument('makeups', updatedRecord.id, updatedRecord);
      StorageService.addAuditLog(
        updates.status === 'SUDAH_SUSULAN' ? 'Konfirmasi Ujian Susulan' : 'Batal Konfirmasi Susulan',
        'MakeUpExam',
        id,
        `Status susulan: ${updates.status}, tanggal: ${updates.makeUpDate || '-'}`
      );
      return { success: true, message: 'Status ujian susulan berhasil diperbarui.' };
    }
    return { success: false, message: 'Data siswa susulan tidak ditemukan.' };
  },

  deleteMakeUpExam: (id: string): { success: boolean; message: string } => {
    const list = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const filtered = list.filter((m) => m.id !== id);
    setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, filtered);
    deleteDocument('makeups', id);
    StorageService.addAuditLog('Hapus Siswa Susulan', 'MakeUpExam', id, `Menghapus data susulan ID: ${id}`);
    return { success: true, message: 'Data siswa susulan berhasil dihapus.' };
  },

  deleteMultipleMakeUpExams: (ids: string[]): { success: boolean; deletedCount: number; message: string } => {
    const toDelete = new Set(ids);
    const list = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const remaining = list.filter((m) => !toDelete.has(m.id));
    const count = list.length - remaining.length;
    setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, remaining);
    if (ids.length > 0) {
      batchDeleteDocuments('makeups', ids);
    }
    StorageService.addAuditLog('Hapus Massal Siswa Susulan', 'MakeUpExam', undefined, `Menghapus ${count} data siswa susulan.`);
    return { success: true, deletedCount: count, message: `Berhasil menghapus ${count} data siswa susulan.` };
  },

  clearAllMakeUpExams: (): { success: boolean; deletedCount: number; message: string } => {
    const list = getStorageItem<MakeUpExamRecord[]>(STORAGE_KEYS.MAKEUP_EXAMS, []);
    const count = list.length;
    setStorageItem(STORAGE_KEYS.MAKEUP_EXAMS, []);
    if (list.length > 0) {
      batchDeleteDocuments('makeups', list.map((m) => m.id));
    }
    StorageService.addAuditLog('Hapus Semua Siswa Susulan', 'MakeUpExam', undefined, `Menghapus seluruh ${count} data siswa susulan.`);
    return { success: true, deletedCount: count, message: `Berhasil membersihkan seluruh data susulan (${count} data).` };
  },

  // Users & Auth
  getUsers: (): User[] => getStorageItem(STORAGE_KEYS.USERS, initialUsers),
  getCurrentUser: (): User => getStorageItem(STORAGE_KEYS.CURRENT_USER, initialUsers[0]),
  setCurrentUser: (user: User) => {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    StorageService.addAuditLog('Login Pengguna', 'User', user.id, `Pengguna ${user.username} (${user.role}) aktif di sistem.`);
  },
  setCurrentUserRole: (role: Role): User => {
    const cur = StorageService.getCurrentUser();
    const updated: User = { ...cur, role };
    StorageService.setCurrentUser(updated);
    return updated;
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getStorageItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs),
  addAuditLog: (action: string, entity: string, entityId?: string, details?: string) => {
    try {
      const user = StorageService.getCurrentUser();
      const logs = StorageService.getAuditLogs();
      const now = new Date().toISOString();
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user?.id,
        username: user?.username || 'system',
        action,
        entity,
        entityId,
        details,
        timestamp: now,
        createdAt: now,
        ipAddress: '127.0.0.1'
      };
      logs.unshift(newLog);
      if (logs.length > 200) logs.pop();
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
      saveDocument('auditLogs', newLog.id, newLog);
    } catch (e) {
      console.warn('Could not add audit log', e);
    }
  },

  // BACKUP & RESTORE
  exportFullDatabase: () => {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        settings: StorageService.getSettings(),
        rooms: StorageService.getRooms(),
        classes: StorageService.getClasses(),
        subjects: StorageService.getSubjects(),
        supervisors: StorageService.getSupervisors(),
        students: StorageService.getStudents(),
        schedules: StorageService.getSchedules(),
        minutes: StorageService.getExamMinutes(),
        attendances: StorageService.getStudentAttendances(),
        users: StorageService.getUsers(),
        auditLogs: StorageService.getAuditLogs()
      }
    }, null, 2);
  },

  exportBackupJson: () => StorageService.exportFullDatabase(),

  importFullDatabase: (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Format backup tidak valid (data hilang).');
      const { settings, rooms, classes, subjects, supervisors, students, schedules, minutes, attendances, users, auditLogs } = parsed.data;
      if (settings) { setStorageItem(STORAGE_KEYS.SETTINGS, settings); saveDocument('settings', 'global', settings); }
      if (rooms) { setStorageItem(STORAGE_KEYS.ROOMS, rooms); batchSaveDocuments('rooms', rooms); }
      if (classes) { setStorageItem(STORAGE_KEYS.CLASSES, classes); batchSaveDocuments('classes', classes); }
      if (subjects) { setStorageItem(STORAGE_KEYS.SUBJECTS, subjects); batchSaveDocuments('subjects', subjects); }
      if (supervisors) { setStorageItem(STORAGE_KEYS.SUPERVISORS, supervisors); batchSaveDocuments('supervisors', supervisors); }
      if (students) { setStorageItem(STORAGE_KEYS.STUDENTS, students); batchSaveDocuments('students', students); }
      if (schedules) { setStorageItem(STORAGE_KEYS.SCHEDULES, schedules); batchSaveDocuments('schedules', schedules); }
      if (minutes) { setStorageItem(STORAGE_KEYS.MINUTES, minutes); batchSaveDocuments('minutes', minutes); }
      if (attendances) { setStorageItem(STORAGE_KEYS.ATTENDANCES, attendances); batchSaveDocuments('attendances', attendances); }
      if (users) setStorageItem(STORAGE_KEYS.USERS, users);
      if (auditLogs) { setStorageItem(STORAGE_KEYS.AUDIT_LOGS, auditLogs); batchSaveDocuments('auditLogs', auditLogs); }
      StorageService.addAuditLog('Restore Database', 'System', undefined, 'Memulihkan database dari file backup.');
      return { success: true, message: 'Database berhasil dipulihkan.' };
    } catch (err: any) {
      return { success: false, message: `Gagal memulihkan database: ${err.message}` };
    }
  },

  restoreBackupJson: (content: string) => StorageService.importFullDatabase(content),

  // ==========================================
  // CORE CONFLICT VALIDATION ENGINE
  // ==========================================
  validateSchedule: (
    current: Partial<ExamSchedule>,
    allSchedules?: ExamSchedule[],
    rooms?: Room[],
    supervisors?: Supervisor[],
    allowCapacityOverride?: boolean
  ): ConflictValidationResult => {
    const schedulesList = allSchedules || StorageService.getSchedules();
    const roomsList = rooms || StorageService.getRooms();
    const supervisorsList = supervisors || StorageService.getSupervisors();
    const override = allowCapacityOverride ?? current.allowCapacityOverride ?? false;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic fields
    if (!current.date) errors.push('Tanggal ujian wajib diisi.');
    if (!current.startTime || !current.endTime) errors.push('Jam mulai dan jam selesai wajib diisi.');
    if (!current.roomId) errors.push('Ruang ujian wajib dipilih.');
    if (!current.groups || current.groups.length === 0) errors.push('Minimal harus ada satu kelompok peserta ujian.');

    // Time validation (Jam selesai > Jam mulai)
    if (current.startTime && current.endTime) {
      if (current.startTime >= current.endTime) {
        errors.push(`Jam selesai (${current.endTime}) harus lebih besar dari jam mulai (${current.startTime}).`);
      }
    }

    const room = roomsList.find((r) => r.id === current.roomId);
    const totalParticipants = (current.groups || []).reduce((sum, g) => sum + (Number(g.participantCount) || 0), 0);
    let capacityExceeded = false;

    // Capacity validation
    if (room) {
      if (totalParticipants > room.capacity) {
        capacityExceeded = true;
        const msg = `Jumlah peserta ${totalParticipants} melebihi kapasitas ruang ${room.code} (${room.capacity} peserta).`;
        if (override) {
          warnings.push(`[PERINGATAN OVERRIDE] ${msg}`);
        } else {
          errors.push(msg);
        }
      }
    }

    const otherSchedules = schedulesList.filter((s) => s.id !== current.id && s.date === current.date && s.status !== 'Dibatalkan');

    const isTimeOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
      return !(endA <= startB || startA >= endB);
    };

    if (current.startTime && current.endTime) {
      // 1. Bentrok Ruang (Room Conflict)
      for (const other of otherSchedules) {
        if (other.roomId === current.roomId) {
          if (isTimeOverlap(current.startTime, current.endTime, other.startTime, other.endTime)) {
            const roomCode = room ? room.code : 'yang dipilih';
            errors.push(`Ruang ${roomCode} sudah digunakan pada ${current.date} pukul ${other.startTime}–${other.endTime} (Sesi ${other.session}).`);
          }
        }
      }

      // 2. Bentrok Pengawas (Supervisor Conflict)
      if (current.supervisors && current.supervisors.length > 0) {
        for (const supAssign of current.supervisors) {
          for (const other of otherSchedules) {
            if (isTimeOverlap(current.startTime, current.endTime, other.startTime, other.endTime)) {
              const conflict = other.supervisors.find((as) => as.supervisorId === supAssign.supervisorId);
              if (conflict) {
                const supObj = supervisorsList.find((s) => s.id === supAssign.supervisorId);
                const otherRoom = roomsList.find((r) => r.id === other.roomId);
                const supName = supObj ? supObj.name : 'Pengawas';
                const rCode = otherRoom ? otherRoom.code : other.roomId;
                errors.push(`Pengawas ${supName} sudah memiliki jadwal pada ${current.date} pukul ${other.startTime}–${other.endTime} di Ruang ${rCode}.`);
              }
            }
          }
        }
      }

      // 3. Bentrok Kelas (Class Conflict Warning/Error)
      if (current.groups && current.groups.length > 0) {
        for (const grp of current.groups) {
          for (const other of otherSchedules) {
            if (isTimeOverlap(current.startTime, current.endTime, other.startTime, other.endTime)) {
              const sameClassInOther = other.groups.find((og) => og.classId === grp.classId);
              if (sameClassInOther) {
                const otherRoom = roomsList.find((r) => r.id === other.roomId);
                warnings.push(
                  `Kelas tersebut sudah dijadwalkan pada waktu yang sama di Ruang ${otherRoom?.code || other.roomId}. Pastikan tidak ada siswa yang bentrok.`
                );
              }
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      capacityExceeded,
      totalParticipants,
      roomCapacity: room?.capacity || 0
    };
  },

  // Auto Generate Nomor Peserta Ujian
  generateExamNumbers: (
    format: string,
    students: Student[],
    classes: ClassItem[],
    options?: {
      scope?: 'ALL' | 'UNASSIGNED' | 'CLASS' | 'SELECTED';
      selectedClassId?: string;
      selectedStudentIds?: string[];
      numberingMode?: 'PER_CLASS' | 'CONTINUOUS';
      startNumber?: number;
      digits?: number;
      examCode?: string;
      year?: string;
    }
  ): Student[] => {
    const classMap = new Map<string, string>();
    classes.forEach((c) => classMap.set(c.id, c.code));

    const scope = options?.scope || 'ALL';
    const numberingMode = options?.numberingMode || 'PER_CLASS';
    const startNumber = options?.startNumber || 1;
    const digits = options?.digits || 3;
    const examCode = options?.examCode || 'US';
    const year = options?.year || '2026';

    const allStudents = StorageService.getStudents();
    const studentsSource = students && students.length > 0 ? students : allStudents;

    // Target students filter
    const targetStudents = studentsSource.filter((std) => {
      if (std.status !== 'AKTIF') return false;
      if (scope === 'UNASSIGNED') {
        return !std.examNumber || std.examNumber.trim() === '' || std.examNumber === '-';
      }
      if (scope === 'CLASS' && options?.selectedClassId) {
        return std.classId === options.selectedClassId;
      }
      if (scope === 'SELECTED' && options?.selectedStudentIds) {
        return options.selectedStudentIds.includes(std.id);
      }
      return true;
    });

    const sorted = [...targetStudents].sort((a, b) => {
      if (a.classId !== b.classId) return a.classId.localeCompare(b.classId);
      return a.name.localeCompare(b.name);
    });

    const classSeqMap = new Map<string, number>();
    let continuousSeq = startNumber;
    const updatedMap = new Map<string, Student>();

    sorted.forEach((std) => {
      const clsCode = classMap.get(std.classId) || 'KELAS';
      let seq: number;

      if (numberingMode === 'CONTINUOUS') {
        seq = continuousSeq++;
      } else {
        const currentClassSeq = classSeqMap.get(std.classId) || (startNumber - 1);
        seq = currentClassSeq + 1;
        classSeqMap.set(std.classId, seq);
      }

      let examNum = format || '{seq:3}/{kelas}/US/{tahun}';
      const seqPad = String(seq).padStart(digits, '0');

      examNum = examNum.replace(/\{seq:3\}/g, String(seq).padStart(3, '0'));
      examNum = examNum.replace(/\{seq:4\}/g, String(seq).padStart(4, '0'));
      examNum = examNum.replace(/\{seq:2\}/g, String(seq).padStart(2, '0'));
      examNum = examNum.replace(/\{seq\}/g, seqPad);
      examNum = examNum.replace(/\{kelas\}/g, clsCode);
      examNum = examNum.replace(/\{ujian\}/g, examCode);
      examNum = examNum.replace(/\{tahun\}/g, year);
      examNum = examNum.replace(/\{nis\}/g, std.nis || '');

      updatedMap.set(std.id, {
        ...std,
        examNumber: examNum,
        updatedAt: new Date().toISOString()
      });
    });

    // Merge into storage
    const currentAll = StorageService.getStudents();
    const finalStudents = currentAll.map((s) => updatedMap.get(s.id) || s);

    setStorageItem(STORAGE_KEYS.STUDENTS, finalStudents);
    batchSaveDocuments('students', Array.from(updatedMap.values()));
    StorageService.addAuditLog(
      'Generate Nomor Peserta',
      'Student',
      undefined,
      `Men-generate nomor peserta ujian untuk ${updatedMap.size} siswa (${numberingMode === 'CONTINUOUS' ? 'Urut Bersambung' : 'Urut per Kelas'}, format: ${format || '{seq:3}/{kelas}/US/{tahun}'}).`
    );

    return finalStudents;
  },

  // Helper to generate a single student exam number (e.g. in Add/Edit Student modal)
  generateSingleStudentExamNumber: (
    studentClassId: string,
    classes: ClassItem[],
    format?: string,
    existingStudents?: Student[]
  ): string => {
    const classMap = new Map<string, string>();
    classes.forEach((c) => classMap.set(c.id, c.code));
    const clsCode = classMap.get(studentClassId) || 'KELAS';

    const allStudents = existingStudents || StorageService.getStudents();
    const sameClassStudents = allStudents.filter((s) => s.classId === studentClassId);
    const nextSeq = sameClassStudents.length + 1;

    let examNum = format || '{seq:3}/{kelas}/US/{tahun}';
    examNum = examNum.replace(/\{seq:3\}/g, String(nextSeq).padStart(3, '0'));
    examNum = examNum.replace(/\{seq:4\}/g, String(nextSeq).padStart(4, '0'));
    examNum = examNum.replace(/\{seq:2\}/g, String(nextSeq).padStart(2, '0'));
    examNum = examNum.replace(/\{seq\}/g, String(nextSeq).padStart(3, '0'));
    examNum = examNum.replace(/\{kelas\}/g, clsCode);
    examNum = examNum.replace(/\{ujian\}/g, 'US');
    examNum = examNum.replace(/\{tahun\}/g, '2026');

    return examNum;
  }
};
