import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigDefault from '../firebase-applet-config.json';
import { Appointment } from './types';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigDefault.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigDefault.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigDefault.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigDefault.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigDefault.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigDefault.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigDefault.firestoreDatabaseId,
};

// Initialize the Firebase client SDK (and always include the firestoreDatabaseId if configured)
export const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId === '(default)' || !config.firestoreDatabaseId ? undefined : config.firestoreDatabaseId);
export const auth = getAuth(app);

const getApiUrl = (endpoint: string): string => {
  let base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  
  if (!base) {
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'));
    
    if (isLocal) {
      base = '';
    } else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.endsWith('.run.app')) {
        base = '';
      } else {
        base = 'https://ais-pre-7srxekufe7romobj6ggzti-126560644470.asia-southeast1.run.app';
      }
    } else {
      base = 'https://ais-pre-7srxekufe7romobj6ggzti-126560644470.asia-southeast1.run.app';
    }
  }
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.error('[Firebase Client] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Firebase-User-Id'] = auth.currentUser.uid;
      if (auth.currentUser.email) {
        headers['X-Firebase-User-Email'] = auth.currentUser.email;
      }
    }
  } catch (err) {
    console.warn('[Firebase Auth Headers] Could not fetch ID token:', err);
  }
  return headers;
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(getApiUrl('/api/appointments'), {
      headers: authHeaders,
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to fetch appointments from backend API.');
    }
    return await response.json();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'appointments');
  }
}

export async function createAppointment(payload: {
  serviceId: string;
  dentistId: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
}): Promise<Appointment> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(getApiUrl('/api/appointments'), {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (response.status === 409) {
        const conflictErr = new Error(errBody.error || 'This slot is already reserved.');
        (conflictErr as any).status = 409;
        throw conflictErr;
      }
      throw new Error(errBody.error || 'Failed to register appointment at backend API.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && (error as any).status === 409) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'appointments');
  }
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(getApiUrl(`/api/appointments/${id}/cancel`), {
      method: 'POST',
      headers: authHeaders,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to cancel appointment ${id}`);
    }

    return await response.json();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
  }
}

export async function rescheduleAppointment(id: string, date: string, timeSlot: string): Promise<Appointment> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(getApiUrl(`/api/appointments/${id}/reschedule`), {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ date, timeSlot }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (response.status === 409) {
        const conflictErr = new Error(errBody.error || 'This slot is already booked.');
        (conflictErr as any).status = 409;
        throw conflictErr;
      }
      throw new Error(errBody.error || `Failed to reschedule appointment ${id}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && (error as any).status === 409) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
  }
}
