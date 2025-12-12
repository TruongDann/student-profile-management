import Database from "better-sqlite3";
import path from "path";
import { StudentProfile, Photo } from "../types.js";

const db = new Database(process.env.DB_PATH || "database.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    collaboratorName TEXT NOT NULL,
    studentName TEXT NOT NULL,
    studentPhone TEXT NOT NULL,
    notes TEXT,
    timestamp INTEGER NOT NULL,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    profileId TEXT NOT NULL,
    data TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (profileId) REFERENCES profiles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_profiles_timestamp ON profiles(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
  CREATE INDEX IF NOT EXISTS idx_photos_profileId ON photos(profileId);
`);

// Profile operations
export const getAllProfiles = (): StudentProfile[] => {
  const profiles = db
    .prepare("SELECT * FROM profiles ORDER BY timestamp DESC")
    .all() as any[];

  return profiles.map((profile) => {
    const photos = db
      .prepare("SELECT * FROM photos WHERE profileId = ? ORDER BY createdAt")
      .all(profile.id) as any[];
    return {
      ...profile,
      timestamp: Number(profile.timestamp),
      photos: photos.map((p) => ({
        id: p.id,
        data: p.data,
        createdAt: Number(p.createdAt),
      })),
    };
  });
};

export const getProfileById = (id: string): StudentProfile | null => {
  const profile = db
    .prepare("SELECT * FROM profiles WHERE id = ?")
    .get(id) as any;
  if (!profile) return null;

  const photos = db
    .prepare("SELECT * FROM photos WHERE profileId = ? ORDER BY createdAt")
    .all(id) as any[];
  return {
    ...profile,
    timestamp: Number(profile.timestamp),
    photos: photos.map((p) => ({
      id: p.id,
      data: p.data,
      createdAt: Number(p.createdAt),
    })),
  };
};

export const createProfile = (profile: StudentProfile): void => {
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, collaboratorName, studentName, studentPhone, notes, timestamp, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPhoto = db.prepare(`
    INSERT INTO photos (id, profileId, data, createdAt)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertProfile.run(
      profile.id,
      profile.collaboratorName,
      profile.studentName,
      profile.studentPhone,
      profile.notes,
      profile.timestamp,
      profile.status
    );

    for (const photo of profile.photos) {
      insertPhoto.run(photo.id, profile.id, photo.data, photo.createdAt);
    }
  });

  transaction();
};

export const deleteProfileById = (id: string): boolean => {
  const result = db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
  return result.changes > 0;
};

export const deletePhotoById = (
  profileId: string,
  photoId: string
): boolean => {
  const result = db
    .prepare("DELETE FROM photos WHERE id = ? AND profileId = ?")
    .run(photoId, profileId);
  return result.changes > 0;
};

export const updateProfileStatus = (
  id: string,
  status: "pending" | "approved" | "rejected"
): boolean => {
  const result = db
    .prepare("UPDATE profiles SET status = ? WHERE id = ?")
    .run(status, id);
  return result.changes > 0;
};

export const clearAllProfiles = (): void => {
  db.exec("DELETE FROM photos; DELETE FROM profiles;");
};

export const getProfilesCount = (): number => {
  const result = db
    .prepare("SELECT COUNT(*) as count FROM profiles")
    .get() as any;
  return result.count;
};

// Close database on process exit
process.on("exit", () => db.close());
process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});
