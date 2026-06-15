import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('[Firebase] Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let dbInstance: Firestore | null = null;

function getDb(): Firestore {
  if (!dbInstance) {
    const CONFIG_FILE = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(CONFIG_FILE)) {
      throw new Error(`Firebase configuration file not found at ${CONFIG_FILE}`);
    }
    const firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    
    const app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId;
    
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any, dbId);

    console.log(`[Firebase] Firestore database client successfully initialized using web SDK for project: ${firebaseConfig.projectId}`);
  }
  return dbInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Connection validation at boot-up
  try {
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
    } catch (error) {
      console.error("[API] GET /api/appointments failed:", error);
      res.status(500).json({ error: "Failed to load appointments from Firestore." });
    }
  });

  // API: Create an appointment (and block slot)
  app.post("/api/appointments", async (req, res) => {
    try {
      console.log("[API] POST /api/appointments - Received booking payload:", req.body);
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
    } catch (err) {
      console.error("Error booking appointment on server:", err);
      res.status(500).json({ error: "Booking execution failed is Firestore backend." });
    }
  });

  // API: Cancel an appointment
  app.post("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
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
    } catch (err) {
      console.error("Cancellation routing broken:", err);
      res.status(500).json({ error: "Cancellation transaction failed on server Database." });
    }
  });

  // API: Reschedule an appointment
  app.post("/api/appointments/:id/reschedule", async (req, res) => {
    try {
      const { id } = req.params;
      const { date, timeSlot } = req.body;

      if (!date || !timeSlot) {
        return res.status(400).json({ error: "Missing new date or time slot." });
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
    } catch (err) {
      console.error("Reschedule route error:", err);
      res.status(500).json({ error: "Failed to reschedule on Firestore database." });
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
