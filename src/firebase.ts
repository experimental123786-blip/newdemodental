import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  setDoc, 
  doc 
} from 'firebase/firestore';
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

const isExternalClient = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  const isDevPreview = hostname.endsWith('.run.app') || hostname.includes('webcontainer-api.io');
  
  // If we have a custom VITE_API_URL configured explicitly, we are not forced to bypass
  if (import.meta.env.VITE_API_URL) return false;
  
  // If we are on local or dev preview, we can use the backend
  if (isLocal || isDevPreview) return false;
  
  // Otherwise, we are deployed on Cloudflare/external static host without VITE_API_URL,
  // so we must use direct Firestore calls as we don't have our Express server.
  return true;
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
  const useDirect = isExternalClient();
  if (!useDirect) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(getApiUrl('/api/appointments'), {
        headers: authHeaders,
      });
      if (response.ok) {
        return await response.json();
      }
      console.warn('[Firebase Client] API returned status', response.status, '- Falling back to direct Firestore reads.');
    } catch (error) {
      console.warn('[Firebase Client] API fetch error, falling back to direct Firestore reads:', error);
    }
  }

  // Fallback / Direct Firestore read
  try {
    const colRef = collection(db, 'appointments');
    const snapshot = await getDocs(colRef);
    const appointments: Appointment[] = [];
    snapshot.forEach((d) => {
      appointments.push(d.data() as Appointment);
    });
    // Sort by createdAt descending
    appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return appointments;
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
  const useDirect = isExternalClient();
  if (!useDirect) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(getApiUrl('/api/appointments'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return await response.json();
      }
      if (response.status === 409) {
        const errBody = await response.json().catch(() => ({}));
        const conflictErr = new Error(errBody.error || 'This slot is already reserved.');
        (conflictErr as any).status = 409;
        throw conflictErr;
      }
      console.warn('[Firebase Client] API returned status', response.status, '- Falling back to direct Firestore booking.');
    } catch (error) {
      if (error instanceof Error && (error as any).status === 409) {
        throw error;
      }
      console.warn('[Firebase Client] API booking error, falling back to direct Firestore booking:', error);
    }
  }

  // Fallback / Direct Firestore write
  try {
    const colRef = collection(db, 'appointments');
    
    // Check overlap
    const q = query(
      colRef,
      where('dentistId', '==', payload.dentistId),
      where('date', '==', payload.date),
      where('timeSlot', '==', payload.timeSlot),
      where('status', '==', 'confirmed')
    );
    const checkSnapshot = await getDocs(q);
    if (!checkSnapshot.empty) {
      const conflictErr = new Error('This time slot has already been reserved. Please choose a different appointment slot.');
      (conflictErr as any).status = 409;
      throw conflictErr;
    }

    const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const newAppointment: Appointment = {
      id: appointmentId,
      serviceId: payload.serviceId,
      dentistId: payload.dentistId,
      date: payload.date,
      timeSlot: payload.timeSlot,
      patientName: payload.patientName,
      patientEmail: payload.patientEmail,
      patientPhone: payload.patientPhone,
      notes: payload.notes || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'appointments', appointmentId), newAppointment);
    return newAppointment;
  } catch (error) {
    if (error instanceof Error && (error as any).status === 409) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, 'appointments');
  }
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const useDirect = isExternalClient();
  if (!useDirect) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(getApiUrl(`/api/appointments/${id}/cancel`), {
        method: 'POST',
        headers: authHeaders,
      });

      if (response.ok) {
        return await response.json();
      }
      console.warn('[Firebase Client] API cancellation failed, falling back to direct update.');
    } catch (error) {
      console.warn('[Firebase Client] API cancel error, falling back to direct update:', error);
    }
  }

  // Fallback / Direct update
  try {
    const docRef = doc(db, 'appointments', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Appointment not found.');
    }

    const updatedData: Appointment = {
      ...(docSnap.data() as Appointment),
      status: 'cancelled',
    };

    await setDoc(docRef, { status: 'cancelled' }, { merge: true });
    return updatedData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
  }
}

export async function rescheduleAppointment(id: string, date: string, timeSlot: string): Promise<Appointment> {
  const useDirect = isExternalClient();
  if (!useDirect) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(getApiUrl(`/api/appointments/${id}/reschedule`), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ date, timeSlot }),
      });

      if (response.ok) {
        return await response.json();
      }
      if (response.status === 409) {
        const errBody = await response.json().catch(() => ({}));
        const conflictErr = new Error(errBody.error || 'This slot is already booked.');
        (conflictErr as any).status = 409;
        throw conflictErr;
      }
      console.warn('[Firebase Client] API reschedule failed, falling back to direct update.');
    } catch (error) {
      if (error instanceof Error && (error as any).status === 409) {
        throw error;
      }
      console.warn('[Firebase Client] API reschedule error, falling back to direct update:', error);
    }
  }

  // Fallback / Direct update
  try {
    const colRef = collection(db, 'appointments');
    const q = query(
      colRef,
      where('date', '==', date),
      where('timeSlot', '==', timeSlot),
      where('status', '==', 'confirmed')
    );
    const checkSnapshot = await getDocs(q);
    const otherConflict = checkSnapshot.docs.some(doc => doc.id !== id);
    if (otherConflict) {
      const conflictErr = new Error('This slot is already booked.');
      (conflictErr as any).status = 409;
      throw conflictErr;
    }

    const docRef = doc(db, 'appointments', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Appointment not found.');
    }

    const updatedData: Appointment = {
      ...(docSnap.data() as Appointment),
      date,
      timeSlot,
      status: 'confirmed',
    };

    await setDoc(docRef, { date, timeSlot, status: 'confirmed' }, { merge: true });
    return updatedData;
  } catch (error) {
    if (error instanceof Error && (error as any).status === 409) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `appointments/${id}`);
  }
}
