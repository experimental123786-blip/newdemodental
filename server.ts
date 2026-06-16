import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  initializeFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  limit,
  Firestore
} from "firebase/firestore";

// Safe resolution of directory and file names for both ES modules (dev) and CommonJS (bundled prod)
const resolvedFilename = (() => {
  try {
    return __filename;
  } catch {
    return import.meta && import.meta.url ? fileURLToPath(import.meta.url) : "";
  }
})();

const resolvedDirname = (() => {
  try {
    return __dirname;
  } catch {
    return resolvedFilename ? path.dirname(resolvedFilename) : "";
  }
})();

interface Appointment {
  id: string;
  serviceId: string;
  dentistId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

let appInstance: any = null;
let dbInstance: Firestore | null = null;
let authInstance: any = null;

function getFirebaseConfig() {
  let firebaseConfig: any = {};
  const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch (err) {
      console.warn("[Firebase] Could not parse firebase-applet-config.json, falling back to env:", err);
    }
  }
  
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || firebaseConfig.apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || firebaseConfig.appId,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  };

  if (!config.projectId) {
    throw new Error(`Firebase project configuration not found in environment variables OR at ${CONFIG_FILE}`);
  }
  return config;
}

function getFirebaseApp() {
  if (!appInstance) {
    const config = getFirebaseConfig();
    appInstance = initializeApp(config);
  }
  return appInstance;
}

function getAuthClient() {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

async function ensureWithRetry(fn: () => Promise<void>, retries = 2, delay = 1000): Promise<void> {
  for (let i = 0; i <= retries; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`[Firebase] Attempt ${i + 1} failed, retrying in ${delay}ms...`, err);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function ensureBackendAuth() {
  try {
    const auth = getAuthClient();
    if (!auth.currentUser) {
      console.log("[Firebase] Backend unauthenticated. Formulating anonymous fallback session...");
      // Wrap sign-in with quick retry logic to prevent transient network issues from failing the app
      await ensureWithRetry(async () => {
        await signInAnonymously(auth);
      });
      console.log(`[Firebase] Backend successfully authenticated anonymously (UID: ${auth.currentUser?.uid})`);
    }
  } catch (err) {
    console.error("[Firebase] Warning: Failed to sign in anonymously on backend:", err);
  }
}

function validateAndExtractFirebaseUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  const headerUid = req.headers["x-firebase-user-id"];
  const headerEmail = req.headers["x-firebase-user-email"];

  let decodedUid: string | null = null;
  let decodedEmail: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        
        // Basic verification of JWT token format
        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > nowSec && payload.sub) {
          decodedUid = payload.sub; // Firebase user ID is stored in 'sub' claim
          decodedEmail = payload.email || null;
          console.log(`[Firebase Auth] Decoded valid Firebase ID token for User ID: ${decodedUid}`);
        }
      }
    } catch (err) {
      console.warn("[Firebase Auth] Failed to parse/decode authorization token:", err);
    }
  }

  // Fallback to headers if decoding failed or token wasn't provided, but validate format
  const sanitizedUid = decodedUid || (typeof headerUid === "string" && headerUid.match(/^[a-zA-Z0-9_\-]+$/) ? headerUid : null);
  const sanitizedEmail = decodedEmail || (typeof headerEmail === "string" ? headerEmail : null);

  return {
    userId: sanitizedUid,
    email: sanitizedEmail,
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let uId: string | null = null;
  let uEmail: string | null = null;
  let isAnon: boolean | null = null;
  try {
    const auth = getAuthClient();
    if (auth.currentUser) {
      uId = auth.currentUser.uid;
      uEmail = auth.currentUser.email;
      isAnon = auth.currentUser.isAnonymous;
    }
  } catch (authErr) {
    console.warn("[Firebase] Could not fetch current user for error info:", authErr);
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: uId,
      email: uEmail,
      isAnonymous: isAnon
    },
    operationType,
    path
  };
  console.error('[Firebase] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function getDb(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    const config = getFirebaseConfig();
    const dbId = config.firestoreDatabaseId === "(default)" || !config.firestoreDatabaseId ? undefined : config.firestoreDatabaseId;
    
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any, dbId);

    console.log(`[Firebase] Firestore database client successfully initialized for project: ${config.projectId}`);
  }
  return dbInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Enable CORS for external frontend deployments (e.g., Cloudflare Pages)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-User-Id, X-Firebase-User-Email");
    
    // Handle OPTIONS preflight request
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  // Connection validation at boot-up
  try {
    // Ensure we are authenticated on startup
    await ensureBackendAuth();
    const db = getDb();
    console.log("[Firebase] Verification: Testing connection to Firestore database...");
    await getDocs(query(collection(db, "appointments"), limit(1)));
    console.log("[Firebase] Verification: Firestore connection successful!");
  } catch (error) {
    console.error("[Firebase] Warning: Failed to connect to Firestore on startup:", error);
  }

  // API: Get all appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      console.log("[API] GET /api/appointments - Reading active slots from Firestore...");
      await ensureBackendAuth();
      const userContext = validateAndExtractFirebaseUser(req);
      if (userContext.userId) {
        console.log(`[API] Authorized User Context ID: ${userContext.userId}`);
      }

      const db = getDb();
      let snapshot;
      try {
        snapshot = await getDocs(collection(db, "appointments"));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "appointments");
        return;
      }
      
      const appointments: Appointment[] = [];
      snapshot.forEach((docRef) => {
        appointments.push(docRef.data() as Appointment);
      });

      // Sort by createdAt descending
      appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(appointments);
    } catch (error: any) {
      console.error("[API] GET /api/appointments failed:", error);
      let clientError = "Failed to load appointments from Firestore.";
      try {
        if (error instanceof Error && error.message.startsWith('{')) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) clientError = parsed.error;
        }
      } catch {}
      res.status(500).json({ error: clientError });
    }
  });

  // API: Create an appointment (and block slot)
  app.post("/api/appointments", async (req, res) => {
    try {
      console.log("[API] POST /api/appointments - Received booking payload:", req.body);
      await ensureBackendAuth();
      const userContext = validateAndExtractFirebaseUser(req);
      if (userContext.userId) {
        console.log(`[API] Authorized User Context ID: ${userContext.userId} Booking Appointment`);
      }

      const {
        serviceId,
        dentistId,
        date,
        timeSlot,
        patientName,
        patientEmail,
        patientPhone,
        notes,
      } = req.body;

      // Primary validation
      if (!serviceId || !dentistId || !date || !timeSlot || !patientName || !patientEmail || !patientPhone) {
        console.warn("[API] POST failed: Missing parameters in", req.body);
        return res.status(400).json({ error: "Missing required booking details." });
      }

      const db = getDb();

      // Check slot availability in Firestore for confirmed slots
      let checkSnapshot;
      try {
        checkSnapshot = await getDocs(query(
          collection(db, "appointments"),
          where("dentistId", "==", dentistId),
          where("date", "==", date),
          where("timeSlot", "==", timeSlot),
          where("status", "==", "confirmed")
        ));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "appointments");
        return;
      }

      if (!checkSnapshot.empty) {
        console.warn(`[API] POST failed: Slot [Dentist: ${dentistId}, Date: ${date}, Time: ${timeSlot}] already booked!`);
        return res.status(409).json({
          error: "This time slot has already been reserved. Please choose a different appointment slot.",
        });
      }

      // Generate secure unique ID
      const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
      const newAppointment: Appointment = {
        id: appointmentId,
        serviceId,
        dentistId,
        date,
        timeSlot,
        patientName,
        patientEmail,
        patientPhone,
        notes: notes || "",
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      // Commit to Firestore
      try {
        await setDoc(doc(db, "appointments", appointmentId), newAppointment);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `appointments/${appointmentId}`);
      }

      console.log("[API] POST success: Created appointment:", newAppointment.id);
      res.status(201).json(newAppointment);
    } catch (err: any) {
      console.error("Error booking appointment on server:", err);
      let clientError = "Booking execution failed in Firestore backend.";
      try {
        if (err instanceof Error && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) clientError = parsed.error;
        }
      } catch {}
      res.status(500).json({ error: clientError });
    }
  });

  // API: Cancel an appointment
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[API] POST /api/appointments/${id}/cancel - Received cancel request`);
      await ensureBackendAuth();
      const userContext = validateAndExtractFirebaseUser(req);
      if (userContext.userId) {
        console.log(`[API] Authorized User Context ID: ${userContext.userId} Cancelling Appointment`);
      }

      const db = getDb();
      const docRef = doc(db, "appointments", id);
      
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `appointments/${id}`);
        return;
      }

      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      const updatedData = {
        ...docSnap.data(),
        status: "cancelled" as const,
      };

      try {
        await setDoc(docRef, updatedData, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `appointments/${id}`);
      }

      res.json(updatedData);
    } catch (err: any) {
      console.error("Cancellation routing broken:", err);
      let clientError = "Cancellation transaction failed on server Database.";
      try {
        if (err instanceof Error && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) clientError = parsed.error;
        }
      } catch {}
      res.status(500).json({ error: clientError });
    }
  });

  // API: Reschedule an appointment
  app.post("/api/appointments/:id/reschedule", async (req, res) => {
    try {
      const { id } = req.params;
      const { date, timeSlot } = req.body;
      console.log(`[API] POST /api/appointments/${id}/reschedule - Received reschedule details:`, req.body);

      if (!date || !timeSlot) {
        return res.status(400).json({ error: "Missing new date or time slot." });
      }

      await ensureBackendAuth();
      const userContext = validateAndExtractFirebaseUser(req);
      if (userContext.userId) {
        console.log(`[API] Authorized User Context ID: ${userContext.userId} Rescheduling Appointment`);
      }

      const db = getDb();
      const docRef = doc(db, "appointments", id);
      
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `appointments/${id}`);
        return;
      }

      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Appointment not found." });
      }

      const targetApt = docSnap.data() as Appointment;

      // Check if slot taken by another active appointment
      let dupSnap;
      try {
        dupSnap = await getDocs(query(
          collection(db, "appointments"),
          where("dentistId", "==", targetApt.dentistId),
          where("date", "==", date),
          where("timeSlot", "==", timeSlot),
          where("status", "==", "confirmed")
        ));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "appointments");
        return;
      }

      const slotTaken = dupSnap.docs.some(docRecord => docRecord.id !== id);

      if (slotTaken) {
        return res.status(409).json({
          error: "This timeslot is already reserved by another patient. Please select a different slot.",
        });
      }

      const updatedApt = {
        ...targetApt,
        date,
        timeSlot,
        status: "confirmed" as const,
      };

      try {
        await setDoc(docRef, updatedApt, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `appointments/${id}`);
      }

      res.json(updatedApt);
    } catch (err: any) {
      console.error("Reschedule route error:", err);
      let clientError = "Failed to reschedule on Firestore database.";
      try {
        if (err instanceof Error && err.message.startsWith('{')) {
          const parsed = JSON.parse(err.message);
          if (parsed.error) clientError = parsed.error;
        }
      } catch {}
      res.status(500).json({ error: clientError });
    }
  });

  // Serve static assets in production, otherwise mount Vite Dev server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Auradent Server running on http://localhost:${PORT}`);
  });
}

startServer();
