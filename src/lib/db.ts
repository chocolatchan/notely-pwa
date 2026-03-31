import { openDB } from 'idb';

const DB_NAME = 'notely-db';
const STORE_NAME = 'notes';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addNote = async (content: string) => {
  const db = await initDB();
  return db.add(STORE_NAME, { content, date: new Date().toISOString() });
};

export const getNotes = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
