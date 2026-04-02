import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'notely-db';
const NOTES_STORE = 'notes';
const PAGES_STORE = 'pages';
const AUTH_STORE = 'auth';

export interface LocalNote {
  id?: number;
  remoteId?: string; // ID from MongoDB
  pageId?: number;   // Local Page ID
  pageRemoteId?: string; // Cache the page's remote ID
  type: 'text' | 'image' | 'sound';
  content: string;
  order: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'deleted' | 'error';
  syncError?: string;
}

export interface LocalPage {
  id?: number;
  title: string;
  remoteId?: string; // ID from MongoDB if synced
  createdAt: string;
  updatedAt: string;
}

const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          db.createObjectStore(NOTES_STORE, { keyPath: 'id', autoIncrement: true });
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(PAGES_STORE)) {
          db.createObjectStore(PAGES_STORE, { keyPath: 'id', autoIncrement: true });
        }
        const noteStore = transaction.objectStore(NOTES_STORE);
        if (!noteStore.indexNames.contains('pageId')) {
          noteStore.createIndex('pageId', 'pageId');
        }
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(AUTH_STORE)) {
          db.createObjectStore(AUTH_STORE); // keyPath=null for single value storage
        }
      }
    },
  });
};

// --- Auth Store Helper ---
export const setAuthData = async (token: string, user: any) => {
  const db = await initDB();
  const tx = db.transaction(AUTH_STORE, 'readwrite');
  await tx.objectStore(AUTH_STORE).put(token, 'token');
  await tx.objectStore(AUTH_STORE).put(user, 'user');
  await tx.done;
};

export const getAuthToken = async () => {
  const db = await initDB();
  return db.get(AUTH_STORE, 'token');
};

export const getAuthUser = async () => {
  const db = await initDB();
  return db.get(AUTH_STORE, 'user');
};

export const clearAuthData = async () => {
  const db = await initDB();
  const tx = db.transaction(AUTH_STORE, 'readwrite');
  await tx.objectStore(AUTH_STORE).clear();
  await tx.done;
};

/**
 * Triggers Background Sync via the Service Worker
 */
export const triggerSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore - sync property not in all type definitions
      await registration.sync.register('sync-notes');
      console.log('Background sync "sync-notes" registered');
    } catch (err) {
      console.error('Failed to register background sync:', err);
    }
  } else {
    console.warn('Background sync not supported, forcing immediate sync if online');
    // Fallback logic could go here
  }
};

// Notes CRUD
export const addNote = async (note: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>) => {
  const db = await initDB();
  const now = new Date().toISOString();
  const id = await db.add(NOTES_STORE, {
    ...note,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending'
  });
  await triggerSync();
  return id;
};

export const getNotes = async (pageId?: number) => {
  const db = await initDB();
  if (pageId !== undefined) {
    const notes = await db.getAllFromIndex(NOTES_STORE, 'pageId', pageId);
    // Filter out soft-deleted notes so they don't appear in UI
    return notes.filter(n => n.syncStatus !== 'deleted');
  }
  return db.getAll(NOTES_STORE);
};

export const getNote = async (id: number) => {
  const db = await initDB();
  return db.get(NOTES_STORE, id);
};

export const updateNote = async (id: number, updates: Partial<LocalNote>) => {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (!note) throw new Error('Note not found');
  
  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending'
  };
  await db.put(NOTES_STORE, updatedNote);
  await triggerSync();
};

export const deleteNote = async (id: number) => {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (!note) return;

  // Soft delete for sync
  const updatedNote = {
    ...note,
    syncStatus: 'deleted' as const,
    updatedAt: new Date().toISOString()
  };
  await db.put(NOTES_STORE, updatedNote);
  await triggerSync();
  
  // Note: hard delete should only happen after sync success in SW
};

export const markSyncError = async (id: number, error: string) => {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (!note) return;

  const updatedNote = {
    ...note,
    syncStatus: 'error' as const,
    syncError: error,
    updatedAt: new Date().toISOString()
  };
  return db.put(NOTES_STORE, updatedNote);
};

export const getPendingNotes = async () => {
  const db = await initDB();
  const notes = await db.getAll(NOTES_STORE);
  return notes.filter(n => n.syncStatus === 'pending' || n.syncStatus === 'deleted' || n.syncStatus === 'error');
};

export const markSynced = async (id: number, remoteId?: string) => {
  const db = await initDB();
  const note = await db.get(NOTES_STORE, id);
  if (!note) return;

  if (note.syncStatus === 'deleted') {
    return db.delete(NOTES_STORE, id);
  }

  const updatedNote = {
    ...note,
    syncStatus: 'synced' as const,
    remoteId: remoteId || note.remoteId,
    syncError: undefined,
    updatedAt: new Date().toISOString()
  };
  return db.put(NOTES_STORE, updatedNote);
};

export const clearNotes = async () => {
  const db = await initDB();
  return db.clear(NOTES_STORE);
};

// Pages CRUD
// ... similarly update pages if they need sync
export const addPage = async (page: Omit<LocalPage, 'id' | 'createdAt' | 'updatedAt'>) => {
  const db = await initDB();
  const now = new Date().toISOString();
  const id = await db.add(PAGES_STORE, {
    ...page,
    createdAt: now,
    updatedAt: now
  });
  // We can trigger sync for pages too if implemented
  return id;
};

export const getPages = async () => {
  const db = await initDB();
  return db.getAll(PAGES_STORE);
};

export const deletePage = async (id: number) => {
  const db = await initDB();
  const tx = db.transaction([NOTES_STORE, PAGES_STORE], 'readwrite');
  
  // Mark all associated notes for deletion sync
  const noteStore = tx.objectStore(NOTES_STORE);
  const pageIndex = noteStore.index('pageId');
  const notes = await pageIndex.getAll(id);
  for (const note of notes) {
    if (note.id) {
      await noteStore.put({ ...note, syncStatus: 'deleted', updatedAt: new Date().toISOString() });
    }
  }
  
  // In a robust system, we would mark the page as deleted too.
  // For simplicity, let's just delete locally for now or mark as deleted.
  // ...
  await tx.objectStore(PAGES_STORE).delete(id);
  await tx.done;
  await triggerSync();
};
