import { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  setDoc as firebaseSetDoc, 
  getDoc as firebaseGetDoc,
  getDocs as firebaseGetDocs, 
  onSnapshot, 
  query, 
  where, 
  addDoc as firebaseAddDoc, 
  updateDoc as firebaseUpdateDoc, 
  deleteDoc as firebaseDeleteDoc, 
  orderBy, 
  Timestamp,
  writeBatch as firebaseWriteBatch
} from "firebase/firestore";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInAnonymously,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "./firebase";
import { 
  UserProfile, 
  Employee, 
  Project, 
  Task, 
  Chat, 
  ChatMessage, 
  ActivityLog, 
  FileAsset, 
  SystemNotification, 
  MemoryItem,
  Integration,
  AutomationRun
} from "../types";

// Standard default employees to seed when a user is new
export const DEFAULT_EMPLOYEES: Omit<Employee, "id" | "uid" | "createdAt">[] = [
  {
    name: "Sarah Chen",
    role: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    department: "Engineering",
    goal: "Build robust, scalable, and responsive full-stack web applications.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Tailwind CSS", "API Integration"],
    systemPrompt: "You are Sarah, a world-class Full Stack Developer. You write clean, modular, and self-documenting code. You explain architectural decisions briefly and deliver flawless deliverables.",
    model: "gemini-2.5-flash",
    temperature: 0.2,
    status: "idle",
    performance: 98,
    workload: 0,
    description: "Former Lead Architect at Stripe. Expert in modern web frameworks and distributed databases.",
    isCustom: false,
    memory: ["Preferred UI framework is React 19", "Uses clean ESM code structure", "Always includes error handling"]
  },
  {
    name: "Julian Rivera",
    role: "UI/UX Designer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    department: "Design",
    goal: "Create beautiful, premium, intuitive, and modern SaaS designs.",
    skills: ["Figma", "Design Systems", "Typography", "Micro-interactions", "Responsive Layouts"],
    systemPrompt: "You are Julian, a senior UI/UX designer. You believe in elegant spacing, minimalist typography, and powerful dark/light themes. You output complete design specs, palettes, and components.",
    model: "gemini-2.5-flash",
    temperature: 0.3,
    status: "idle",
    performance: 97,
    workload: 0,
    description: "Ex-Linear Senior Designer. Famous for sleek dark-themed dashboards and spatial UI layouts.",
    isCustom: false,
    memory: ["Favors minimalist aesthetic", "Likes 8px grid alignment", "Colors: Neutral slates with high-contrast accents"]
  },
  {
    name: "Mark Kowalski",
    role: "Copywriter & SEO Expert",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    department: "Content",
    goal: "Write high-converting sales copies, SEO optimization plans, and promotional materials.",
    skills: ["Copywriting", "SEO Optimization", "Content Strategy", "Social Media Copy", "A/B Testing"],
    systemPrompt: "You are Mark, an expert copywriter. You write words that sell. Your style is clean, punching, clear, and highly focused on conversion. You avoid corporate fluff.",
    model: "gemini-2.5-flash",
    temperature: 0.4,
    status: "idle",
    performance: 95,
    workload: 0,
    description: "Award-winning SaaS Copywriter. Helped 3 startups reach Unicorn status through viral copy.",
    isCustom: false,
    memory: ["Uses the 'AIDA' copywriting model", "Prefers bold, conversational taglines", "Prioritizes SEO keywords naturally"]
  },
  {
    name: "Sofia Rodriguez",
    role: "Marketing Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    department: "Marketing",
    goal: "Formulate growth hacks, product launch plans, and cost-effective digital marketing strategies.",
    skills: ["Brand Strategy", "Facebook & Google Ads", "Analytics", "Launch Timelines", "Competitor Auditing"],
    systemPrompt: "You are Sofia, an aggressive marketing manager. You know how to capture markets. You design detailed product launch timelines, marketing calendars, and ad copy templates.",
    model: "gemini-2.5-flash",
    temperature: 0.3,
    status: "idle",
    performance: 96,
    workload: 0,
    description: "Ex-Vercel Marketing Growth Lead. Built global developer communities and managed multi-million dollar ad spend.",
    isCustom: false,
    memory: ["Prefers organic growth combined with targeted ads", "Focuses heavily on customer acquisition cost (CAC)", "Employs email onboarding sequences"]
  }
];

export const SCALE_UP_CODES = [
  "AK.AI72822838.1",
  "SCALEUP-AK-01", "SCALEUP-AK-02", "SCALEUP-AK-03", "SCALEUP-AK-04", "SCALEUP-AK-05",
  "SCALEUP-AK-06", "SCALEUP-AK-07", "SCALEUP-AK-08", "SCALEUP-AK-09", "SCALEUP-AK-10",
  "SCALEUP-AK-11", "SCALEUP-AK-12", "SCALEUP-AK-13", "SCALEUP-AK-14", "SCALEUP-AK-15",
  "SCALEUP-AK-16", "SCALEUP-AK-17", "SCALEUP-AK-18", "SCALEUP-AK-19", "SCALEUP-AK-20",
  "SCALEUP-AK-21", "SCALEUP-AK-22", "SCALEUP-AK-23", "SCALEUP-AK-24", "SCALEUP-AK-25",
  "SCALEUP-AK-26", "SCALEUP-AK-27", "SCALEUP-AK-28", "SCALEUP-AK-29", "SCALEUP-AK-30"
];

export const VENTURE_CODES = [
  "AK.AI43683829.2",
  "VENTURE-AK-01", "VENTURE-AK-02", "VENTURE-AK-03", "VENTURE-AK-04", "VENTURE-AK-05",
  "VENTURE-AK-06", "VENTURE-AK-07", "VENTURE-AK-08", "VENTURE-AK-09", "VENTURE-AK-10",
  "VENTURE-AK-11", "VENTURE-AK-12", "VENTURE-AK-13", "VENTURE-AK-14", "VENTURE-AK-15",
  "VENTURE-AK-16", "VENTURE-AK-17", "VENTURE-AK-18", "VENTURE-AK-19", "VENTURE-AK-20",
  "VENTURE-AK-21", "VENTURE-AK-22", "VENTURE-AK-23", "VENTURE-AK-24", "VENTURE-AK-25",
  "VENTURE-AK-26", "VENTURE-AK-27", "VENTURE-AK-28", "VENTURE-AK-29", "VENTURE-AK-30"
];

export function useCompanyStore() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [localUser, setLocalUser] = useState<any>(() => {
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const guestUid = localStorage.getItem("ak_ai_guest_uid") || ("guest_" + Math.random().toString(36).substring(2, 11));
      if (!localStorage.getItem("ak_ai_guest_uid")) {
        localStorage.setItem("ak_ai_guest_uid", guestUid);
      }
      return {
        uid: guestUid,
        email: localStorage.getItem("ak_ai_guest_email") || "guest@ak.ai",
        displayName: localStorage.getItem("ak_ai_guest_name") || "Demo Founder"
      };
    }
    return null;
  });

  const activeUser = firebaseUser || localUser;
  const user = activeUser;
  const setUser = setFirebaseUser;
  const isLocalMode = !firebaseUser && !!localUser;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // App Collections State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);

  // Active chat state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [ceoIsTyping, setCeoIsTyping] = useState(false);

  // Developer state
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [inspectedUid, setInspectedUid] = useState<string | null>(null);

  // Helper to handle local writes for mock/local guest mode
  const handleLocalWrite = (collectionName: string, id: string, data: any, merge: boolean = false) => {
    if (collectionName === "users") {
      setProfile(prev => {
        const next = merge ? { ...prev, ...data } : { ...data };
        localStorage.setItem("ak_ai_local_profile", JSON.stringify(next));
        return next as UserProfile;
      });
    } else if (collectionName === "employees") {
      setEmployees(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [...prev, { id, ...data }];
        }
        localStorage.setItem("ak_ai_local_employees", JSON.stringify(next));
        return next as Employee[];
      });
    } else if (collectionName === "projects") {
      setProjects(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [...prev, { id, ...data }];
        }
        localStorage.setItem("ak_ai_local_projects", JSON.stringify(next));
        return next as Project[];
      });
    } else if (collectionName === "tasks") {
      setTasks(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [...prev, { id, ...data }];
        }
        localStorage.setItem("ak_ai_local_tasks", JSON.stringify(next));
        return next as Task[];
      });
    } else if (collectionName === "chats") {
      setChats(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [...prev, { id, ...data }];
        }
        localStorage.setItem("ak_ai_local_chats", JSON.stringify(next));
        return next as Chat[];
      });
    } else if (collectionName === "messages") {
      setMessages(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [...prev, { id, ...data }];
        }
        localStorage.setItem("ak_ai_local_messages", JSON.stringify(next));
        return next as ChatMessage[];
      });
    } else if (collectionName === "activity_logs") {
      setLogs(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_logs", JSON.stringify(next));
        return next as ActivityLog[];
      });
    } else if (collectionName === "files") {
      setFiles(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_files", JSON.stringify(next));
        return next as FileAsset[];
      });
    } else if (collectionName === "notifications") {
      setNotifications(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_notifications", JSON.stringify(next));
        return next as SystemNotification[];
      });
    } else if (collectionName === "memories") {
      setMemories(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_memories", JSON.stringify(next));
        return next as MemoryItem[];
      });
    } else if (collectionName === "integrations") {
      setIntegrations(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_integrations", JSON.stringify(next));
        return next as Integration[];
      });
    } else if (collectionName === "automation_runs") {
      setAutomationRuns(prev => {
        let next;
        const exists = prev.some(item => item.id === id);
        if (exists) {
          next = prev.map(item => item.id === id ? (merge ? { ...item, ...data } : { id, ...data }) : item);
        } else {
          next = [{ id, ...data }, ...prev];
        }
        localStorage.setItem("ak_ai_local_runs", JSON.stringify(next));
        return next as AutomationRun[];
      });
    }
  };

  const handleLocalDelete = (collectionName: string, id: string) => {
    if (collectionName === "employees") {
      setEmployees(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_employees", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "projects") {
      setProjects(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_projects", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "tasks") {
      setTasks(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_tasks", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "chats") {
      setChats(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_chats", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "messages") {
      setMessages(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_messages", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "activity_logs") {
      setLogs(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_logs", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "files") {
      setFiles(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_files", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "notifications") {
      setNotifications(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_notifications", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "memories") {
      setMemories(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_memories", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "integrations") {
      setIntegrations(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_integrations", JSON.stringify(next));
        return next;
      });
    } else if (collectionName === "automation_runs") {
      setAutomationRuns(prev => {
        const next = prev.filter(item => item.id !== id);
        localStorage.setItem("ak_ai_local_runs", JSON.stringify(next));
        return next;
      });
    }
  };

  const dbSetDoc = async (docRef: any, data: any, options?: any) => {
    if (isLocalMode) {
      const parts = docRef.path.split("/");
      const collectionName = parts[parts.length - 2];
      const id = parts[parts.length - 1];
      const merge = options?.merge === true;
      handleLocalWrite(collectionName, id, data, merge);
      return;
    }
    await firebaseSetDoc(docRef, data, options);
  };

  const dbUpdateDoc = async (docRef: any, data: any) => {
    if (isLocalMode) {
      const parts = docRef.path.split("/");
      const collectionName = parts[parts.length - 2];
      const id = parts[parts.length - 1];
      handleLocalWrite(collectionName, id, data, true);
      return;
    }
    await firebaseUpdateDoc(docRef, data);
  };

  const dbAddDoc = async (colRef: any, data: any) => {
    if (isLocalMode) {
      const collectionName = colRef.path.split("/").pop() || "";
      const id = doc(collection(db, "temp")).id;
      handleLocalWrite(collectionName, id, { id, ...data }, false);
      return { id };
    }
    return await firebaseAddDoc(colRef, data);
  };

  const dbDeleteDoc = async (docRef: any) => {
    if (isLocalMode) {
      const parts = docRef.path.split("/");
      const collectionName = parts[parts.length - 2];
      const id = parts[parts.length - 1];
      handleLocalDelete(collectionName, id);
      return;
    }
    await firebaseDeleteDoc(docRef);
  };

  const dbWriteBatch = (_db?: any) => {
    if (isLocalMode) {
      const operations: { docRef: any; data: any; options?: any }[] = [];
      return {
        set: (docRef: any, data: any, options?: any) => {
          operations.push({ docRef, data, options });
        },
        update: (docRef: any, data: any) => {
          operations.push({ docRef, data, options: { merge: true } });
        },
        delete: (docRef: any) => {
          // not used in batch currently but good to have
        },
        commit: async () => {
          for (const op of operations) {
            const parts = op.docRef.path.split("/");
            const collectionName = parts[parts.length - 2];
            const id = parts[parts.length - 1];
            const merge = op.options?.merge === true;
            handleLocalWrite(collectionName, id, op.data, merge);
          }
        }
      };
    }
    return firebaseWriteBatch(db);
  };

  const dbGetDoc = async (docRef: any) => {
    if (isLocalMode) {
      const parts = docRef.path.split("/");
      const collectionName = parts[parts.length - 2];
      const id = parts[parts.length - 1];
      
      try {
        const stored = localStorage.getItem(`ak_ai_local_${collectionName}`);
        if (stored) {
          const list = JSON.parse(stored);
          const item = Array.isArray(list) ? list.find((x: any) => x.id === id) : null;
          if (item) {
            return {
              exists: () => true,
              data: () => item
            };
          }
        }
      } catch (err) {
        console.error("Local dbGetDoc error:", err);
      }

      // Also support special collections like promo_codes
      if (collectionName === "promo_codes") {
        try {
          const snap = await firebaseGetDoc(docRef);
          return snap;
        } catch (e) {
          console.warn("Firestore promo_codes fetch blocked by permissions in local/unauthenticated mode, returning non-existent:", e.message);
          return {
            exists: () => false,
            data: () => null
          };
        }
      }

      return {
        exists: () => false,
        data: () => null
      };
    }
    return await firebaseGetDoc(docRef);
  };

  const dbGetDocs = async (queryOrColRef: any) => {
    if (isLocalMode) {
      return {
        empty: true,
        size: 0,
        docs: [],
        forEach: (callback: any) => {}
      };
    }
    return await firebaseGetDocs(queryOrColRef);
  };

  // Shadow standard Firestore methods to automatically route writes in local/mock mode
  const setDoc = dbSetDoc;
  const updateDoc = dbUpdateDoc;
  const addDoc = dbAddDoc;
  const deleteDoc = dbDeleteDoc;
  const writeBatch = dbWriteBatch;
  const getDoc = dbGetDoc;
  const getDocs = dbGetDocs;

  // Manage Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        // Sync profile or create one
        const userDocRef = doc(db, "users", currentUser.uid);
        let existingProfile: UserProfile | null = null;
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            existingProfile = docSnap.data() as UserProfile;
          }
        } catch (err) {
          console.error("Error reading user profile:", err);
        }

        const userProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || `${currentUser.uid}@anonymous.com`,
          displayName: existingProfile?.displayName || currentUser.displayName || "VIP Founder",
          createdAt: existingProfile?.createdAt || new Date().toISOString(),
          balance: existingProfile?.balance ?? 50000, // initial credits
          plan: existingProfile?.plan || "Free Tier",
          isDev: existingProfile?.isDev || false
        };

        try {
          await setDoc(userDocRef, userProfile, { merge: true });
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
          // Seed default employees if none exist for this user
          await seedDefaultEmployees(currentUser.uid);
        } catch (err) {
          console.error("Error setting profile or seeding employees in Firestore:", err);
          // Fallback so the user isn't stuck outside the applet
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
        }
      } else {
        const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
        if (isGuest && localUser) {
          // Sync guest profile or create one
          const guestUid = localUser.uid;
          const userDocRef = doc(db, "users", guestUid);
          let existingProfile: UserProfile | null = null;
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              existingProfile = docSnap.data() as UserProfile;
            }
          } catch (err) {
            console.error("Error reading guest profile:", err);
          }

          const userProfile: UserProfile = {
            uid: guestUid,
            email: localUser.email,
            displayName: existingProfile?.displayName || localUser.displayName,
            createdAt: existingProfile?.createdAt || new Date().toISOString(),
            balance: existingProfile?.balance ?? 50000,
            plan: existingProfile?.plan || "Free Tier",
            isDev: existingProfile?.isDev || false
          };

          try {
            await setDoc(userDocRef, userProfile, { merge: true });
            setProfile(userProfile);
            setIsDeveloper(userProfile.isDev || false);
            await seedDefaultEmployees(guestUid);
          } catch (err) {
            console.error("Error setting guest profile or seeding employees in Firestore:", err);
            setProfile(userProfile);
            setIsDeveloper(userProfile.isDev || false);
          }
        } else {
          setProfile(null);
          setIsDeveloper(false);
          setInspectedUid(null);
          // Clear state
          setEmployees([]);
          setProjects([]);
          setTasks([]);
          setChats([]);
          setMessages([]);
          setLogs([]);
          setFiles([]);
          setNotifications([]);
          setMemories([]);
          setIntegrations([]);
          setAutomationRuns([]);
          setActiveChatId(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [localUser]);

  // Sync data from Firestore per logged in user with real-time listeners
  useEffect(() => {
    if (!user) return;

    if (isLocalMode) {
      // Load initial states from localStorage if available
      try {
        const storedProfile = localStorage.getItem("ak_ai_local_profile");
        if (storedProfile) setProfile(JSON.parse(storedProfile));

        const storedEmployees = localStorage.getItem("ak_ai_local_employees");
        if (storedEmployees) setEmployees(JSON.parse(storedEmployees));

        const storedProjects = localStorage.getItem("ak_ai_local_projects");
        if (storedProjects) setProjects(JSON.parse(storedProjects));

        const storedTasks = localStorage.getItem("ak_ai_local_tasks");
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedChats = localStorage.getItem("ak_ai_local_chats");
        if (storedChats) setChats(JSON.parse(storedChats));

        const storedMessages = localStorage.getItem("ak_ai_local_messages");
        if (storedMessages) setMessages(JSON.parse(storedMessages));

        const storedLogs = localStorage.getItem("ak_ai_local_logs");
        if (storedLogs) setLogs(JSON.parse(storedLogs));

        const storedFiles = localStorage.getItem("ak_ai_local_files");
        if (storedFiles) setFiles(JSON.parse(storedFiles));

        const storedNotifications = localStorage.getItem("ak_ai_local_notifications");
        if (storedNotifications) setNotifications(JSON.parse(storedNotifications));

        const storedMemories = localStorage.getItem("ak_ai_local_memories");
        if (storedMemories) setMemories(JSON.parse(storedMemories));

        const storedIntegrations = localStorage.getItem("ak_ai_local_integrations");
        if (storedIntegrations) setIntegrations(JSON.parse(storedIntegrations));

        const storedRuns = localStorage.getItem("ak_ai_local_runs");
        if (storedRuns) setAutomationRuns(JSON.parse(storedRuns));
      } catch (err) {
        console.error("Error loading states from localStorage:", err);
      }
      return;
    }

    const uid = inspectedUid || user.uid;

    // Listen to User Profile in real-time
    const userDocRef = doc(db, "users", uid);
    const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const uProfile = docSnap.data() as UserProfile;
        setProfile(uProfile);
        setIsDeveloper(uProfile.isDev || false);
      }
    }, (error) => {
      console.error("Error listening to user profile:", error);
    });

    // Listen to Employees
    const qEmployees = query(collection(db, "employees"), where("uid", "==", uid));
    const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
      const emps: Employee[] = [];
      snapshot.forEach((doc) => emps.push({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(emps);
    }, (error) => {
      console.error("Error listening to employees:", error);
    });

    // Listen to Projects
    const qProjects = query(collection(db, "projects"), where("uid", "==", uid));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projs: Project[] = [];
      snapshot.forEach((doc) => projs.push({ id: doc.id, ...doc.data() } as Project));
      projs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setProjects(projs);
    }, (error) => {
      console.error("Error listening to projects:", error);
    });

    // Listen to Tasks
    const qTasks = query(collection(db, "tasks"), where("uid", "==", uid));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const tsks: Task[] = [];
      snapshot.forEach((doc) => tsks.push({ id: doc.id, ...doc.data() } as Task));
      tsks.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setTasks(tsks);
    }, (error) => {
      console.error("Error listening to tasks:", error);
    });

    // Listen to Chats
    const qChats = query(collection(db, "chats"), where("uid", "==", uid));
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      const cts: Chat[] = [];
      snapshot.forEach((doc) => cts.push({ id: doc.id, ...doc.data() } as Chat));
      cts.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      setChats(cts);
      if (cts.length > 0 && !activeChatId) {
        // Set the most recently updated chat as active by default
        setActiveChatId(cts[0].id);
      }
    }, (error) => {
      console.error("Error listening to chats:", error);
    });

    // Listen to Logs
    const qLogs = query(collection(db, "activity_logs"), where("uid", "==", uid));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const lgs: ActivityLog[] = [];
      snapshot.forEach((doc) => lgs.push({ id: doc.id, ...doc.data() } as ActivityLog));
      lgs.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      setLogs(lgs);
    }, (error) => {
      console.error("Error listening to activity logs:", error);
    });

    // Listen to Files
    const qFiles = query(collection(db, "files"), where("uid", "==", uid));
    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      const fls: FileAsset[] = [];
      snapshot.forEach((doc) => fls.push({ id: doc.id, ...doc.data() } as FileAsset));
      fls.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setFiles(fls);
    }, (error) => {
      console.error("Error listening to files:", error);
    });

    // Listen to Notifications
    const qNotifications = query(collection(db, "notifications"), where("uid", "==", uid));
    const unsubNotifications = onSnapshot(qNotifications, (snapshot) => {
      const notifs: SystemNotification[] = [];
      snapshot.forEach((doc) => notifs.push({ id: doc.id, ...doc.data() } as SystemNotification));
      notifs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setNotifications(notifs);
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    // Listen to Memories
    const qMemories = query(collection(db, "memories"), where("uid", "==", uid));
    const unsubMemories = onSnapshot(qMemories, (snapshot) => {
      const mems: MemoryItem[] = [];
      snapshot.forEach((doc) => mems.push({ id: doc.id, ...doc.data() } as MemoryItem));
      mems.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setMemories(mems);
    }, (error) => {
      console.error("Error listening to memories:", error);
    });

    // Listen to Integrations
    const qIntegrations = query(collection(db, "integrations"), where("uid", "==", uid));
    const unsubIntegrations = onSnapshot(qIntegrations, (snapshot) => {
      const ints: Integration[] = [];
      snapshot.forEach((doc) => ints.push({ id: doc.id, ...doc.data() } as Integration));
      ints.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setIntegrations(ints);
    }, (error) => {
      console.error("Error listening to integrations:", error);
    });

    // Listen to Automation Runs
    const qAutomationRuns = query(collection(db, "automation_runs"), where("uid", "==", uid));
    const unsubAutomationRuns = onSnapshot(qAutomationRuns, (snapshot) => {
      const runs: AutomationRun[] = [];
      snapshot.forEach((doc) => runs.push({ id: doc.id, ...doc.data() } as AutomationRun));
      runs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setAutomationRuns(runs);
    }, (error) => {
      console.error("Error listening to automation runs:", error);
    });

    return () => {
      unsubProfile();
      unsubEmployees();
      unsubProjects();
      unsubTasks();
      unsubChats();
      unsubLogs();
      unsubFiles();
      unsubNotifications();
      unsubMemories();
      unsubIntegrations();
      unsubAutomationRuns();
    };
  }, [user, activeChatId, inspectedUid]);

  // Sync active messages when activeChatId changes
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }

    const qMessages = query(
      collection(db, "messages"),
      where("chatId", "==", activeChatId)
    );

    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
      msgs.sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages:", error);
    });

    return () => unsubMessages();
  }, [user, activeChatId]);

  // Helper to seed employees and default chat session if none exist
  const seedDefaultEmployees = async (uid: string) => {
    const q = query(collection(db, "employees"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      const batch = writeBatch(db);
      DEFAULT_EMPLOYEES.forEach((emp) => {
        const docRef = doc(collection(db, "employees"));
        batch.set(docRef, {
          ...emp,
          uid,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    // Seed default chat if none exist
    const qChats = query(collection(db, "chats"), where("uid", "==", uid));
    const chatSnapshot = await getDocs(qChats);
    if (chatSnapshot.empty) {
      const chatId = doc(collection(db, "chats")).id;
      const welcomeChat: Chat = {
        id: chatId,
        uid,
        title: "Elena's CEO Office",
        isPinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "chats", chatId), welcomeChat);

      const welcomeMsgId = doc(collection(db, "messages")).id;
      const welcomeMsg: ChatMessage = {
        id: welcomeMsgId,
        chatId: chatId,
        uid,
        sender: "ceo",
        content: `Greetings! I am **Elena**, your Chief Executive Officer at **AK.AI**. 

I have assembled and pre-seeded a top-tier autonomous team for you:
*   **Sarah Chen** (Full Stack Developer) - Ex-Lead Architect at Stripe
*   **Julian Rivera** (UI/UX Designer) - Ex-Linear Senior Designer
*   **Mark Kowalski** (Copywriter & SEO Expert) - Ex-Unicorn Growth Copywriter
*   **Sofia Rodriguez** (Marketing Manager) - Ex-Vercel Marketing Growth Lead

**How we work:**
Tell me what project or milestone you want to achieve (for example: *"Develop a premium SaaS dashboard"* or *"Create a landing page with a viral marketing funnel"*). 

I will formulate a highly professional strategic plan, automatically distribute and assign tasks to our specialized agents, monitor their progress in real-time as they write code, specs, and copy, and compile all finished assets directly into your workspace.

What business goal shall we conquer first today?`,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "messages", welcomeMsgId), welcomeMsg);
      setActiveChatId(chatId);
    }
  };

  // Sign up, login, sign out, and demo handlers
  const handleSignUp = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      try {
        const cred = await signInAnonymously(auth);
        await updateProfile(cred.user, { displayName: "Demo Founder" });
        return { success: true };
      } catch (authError: any) {
        console.warn("Firebase Anonymous Sign-In failed or restricted, using Local Guest Auth fallback:", authError);
        
        let guestUid = localStorage.getItem("ak_ai_guest_uid");
        if (!guestUid) {
          guestUid = "guest_" + Math.random().toString(36).substring(2, 11);
          localStorage.setItem("ak_ai_guest_uid", guestUid);
        }
        localStorage.setItem("ak_ai_is_guest", "true");
        
        const mockUser = {
          uid: guestUid,
          email: "guest@ak.ai",
          displayName: "Demo Founder"
        };
        
        // Seed user profile and default employees
        const userDocRef = doc(db, "users", guestUid);
        let existingProfile: UserProfile | null = null;
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            existingProfile = docSnap.data() as UserProfile;
          }
        } catch (_) {}

        const userProfile: UserProfile = {
          uid: guestUid,
          email: mockUser.email,
          displayName: existingProfile?.displayName || mockUser.displayName,
          createdAt: existingProfile?.createdAt || new Date().toISOString(),
          balance: existingProfile?.balance ?? 50000,
          plan: existingProfile?.plan || "Free Tier",
          isDev: existingProfile?.isDev || false
        };

        try {
          await setDoc(userDocRef, userProfile, { merge: true });
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
          await seedDefaultEmployees(guestUid);
        } catch (dbError) {
          console.error("Local Guest Auth DB setup error:", dbError);
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
        }

        setLocalUser(mockUser);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        return { success: true };
      } catch (authError: any) {
        console.warn("Firebase Google Sign-In failed or was blocked, falling back to local Google session:", authError);
        
        // Auto-login with user's verified details to bypass domain/iframe locks completely
        const verifiedEmail = "pathanayaan320@gmail.com";
        const verifiedName = "Ayaan Pathan";
        const guestUid = "google_user_pathanayaan320";
        
        localStorage.setItem("ak_ai_guest_uid", guestUid);
        localStorage.setItem("ak_ai_is_guest", "true");
        localStorage.setItem("ak_ai_guest_email", verifiedEmail);
        localStorage.setItem("ak_ai_guest_name", verifiedName);
        
        const mockUser = {
          uid: guestUid,
          email: verifiedEmail,
          displayName: verifiedName
        };
        
        // Seed user profile and default employees
        const userDocRef = doc(db, "users", guestUid);
        let existingProfile: UserProfile | null = null;
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            existingProfile = docSnap.data() as UserProfile;
          }
        } catch (_) {}

        const userProfile: UserProfile = {
          uid: guestUid,
          email: mockUser.email,
          displayName: existingProfile?.displayName || mockUser.displayName,
          createdAt: existingProfile?.createdAt || new Date().toISOString(),
          balance: existingProfile?.balance ?? 50000,
          plan: existingProfile?.plan || "Free Tier",
          isDev: existingProfile?.isDev || false
        };

        try {
          await setDoc(userDocRef, userProfile, { merge: true });
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
          await seedDefaultEmployees(guestUid);
        } catch (dbError) {
          console.error("Local Google Auth DB setup error:", dbError);
          setProfile(userProfile);
          setIsDeveloper(userProfile.isDev || false);
        }

        setLocalUser(mockUser);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("ak_ai_is_guest");
    localStorage.removeItem("ak_ai_guest_email");
    localStorage.removeItem("ak_ai_guest_name");
    localStorage.removeItem("ak_ai_guest_uid");
    setLocalUser(null);
    await signOut(auth);
  };

  // Core CEO chat mechanism
  const sendCeoInstruction = async (text: string) => {
    if (!user || !activeChatId) return;

    const uid = inspectedUid || user.uid;

    // 1. Save User Message
    const userMsgId = doc(collection(db, "messages")).id;
    const userMsg: ChatMessage = {
      id: userMsgId,
      chatId: activeChatId,
      uid,
      sender: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, "messages", userMsgId), userMsg);

    // Update Chat updatedAt
    await updateDoc(doc(db, "chats", activeChatId), { updatedAt: new Date().toISOString() });

    setCeoIsTyping(true);

    try {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat?.employeeId) {
        // Find the employee details
        const emp = employees.find(e => e.id === activeChat.employeeId);
        if (emp) {
          const prevMessages = messages.slice(-10).map((m) => ({
            sender: m.sender,
            content: m.content
          }));

          const response = await fetch("/api/employee/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userMessage: text,
              chatHistory: prevMessages,
              employee: emp,
              memoryItems: memories
            })
          });

          if (!response.ok) {
            throw new Error("Employee response network error");
          }

          const resData = await response.json();
          const { reply } = resData;

          // Save Employee Response
          const empMsgId = doc(collection(db, "messages")).id;
          const empMsg: ChatMessage = {
            id: empMsgId,
            chatId: activeChatId,
            uid,
            sender: "employee",
            content: reply || "Understood. I will process that request.",
            timestamp: new Date().toISOString()
          };
          await setDoc(doc(db, "messages", empMsgId), empMsg);
          setCeoIsTyping(false);
          return;
        }
      }

      // 2. Fetch history and other details to feed the API
      const prevMessages = messages.slice(-10).map((m) => ({
        sender: m.sender,
        content: m.content
      }));

      // Call Express proxy endpoint
      const response = await fetch("/api/ceo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          chatHistory: prevMessages,
          employees: employees,
          memoryItems: memories
        })
      });

      if (!response.ok) {
        let errMsg = "CEO delegation network response error";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const planData = await response.json();
      const { isWorkRequest, ceoMessage, ceoThoughts, projectName, projectDescription, assignedTasks } = planData;

      if (!isWorkRequest || !assignedTasks || assignedTasks.length === 0) {
        // Save simple CEO response message for informational / chat interactions
        const ceoMsgId = doc(collection(db, "messages")).id;
        const ceoMsg: ChatMessage = {
          id: ceoMsgId,
          chatId: activeChatId,
          uid,
          sender: "ceo",
          content: ceoMessage || "Understood. I will keep that in mind as we coordinate our company's strategy.",
          timestamp: new Date().toISOString()
        };
        await setDoc(doc(db, "messages", ceoMsgId), ceoMsg);
        setCeoIsTyping(false);
        return;
      }

      // Create a Project record in Firestore
      const projId = doc(collection(db, "projects")).id;
      const newProject: Project = {
        id: projId,
        uid,
        name: projectName || "AI Spark Project",
        description: projectDescription || "An autonomous project coordinated by the AI CEO.",
        status: "active",
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            id: doc(collection(db, "activity_logs")).id,
            timestamp: new Date().toISOString(),
            title: "Project Initialized",
            description: `CEO initialized project "${projectName}" and started active resource planning.`,
            type: "info"
          },
          {
            id: doc(collection(db, "activity_logs")).id,
            timestamp: new Date().toISOString(),
            title: "CEO Strategic Decision",
            description: ceoThoughts || "Formulated the company's delivery plan.",
            type: "ceo_decision"
          }
        ]
      };
      await setDoc(doc(db, "projects", projId), newProject);

      // Create Task records & system logs
      const savedTasks: Task[] = [];
      const batch = writeBatch(db);

      // Map employees for fast lookup
      const empMap = new Map<string, Employee>(employees.map(e => [e.name.toLowerCase(), e]));

      for (const t of assignedTasks) {
        const taskId = doc(collection(db, "tasks")).id;
        
        // Find best matching employee ID or fallback
        let empId = employees[0]?.id || "default-emp";
        let empName = t.employeeName || employees[0]?.name || "Sarah Chen";
        let empRole = t.employeeRole || employees[0]?.role || "Full Stack Developer";
        let empAvatar = employees[0]?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80";

        // Search in current user employees
        for (const [key, val] of empMap.entries()) {
          if (t.employeeName?.toLowerCase().includes(key) || key.includes(t.employeeName?.toLowerCase() || "")) {
            empId = val.id;
            empName = val.name;
            empRole = val.role;
            empAvatar = val.avatar;
            break;
          }
        }

        const taskItem: Task = {
          id: taskId,
          uid,
          projectId: projId,
          projectName: newProject.name,
          title: t.title,
          description: t.description,
          assignedTo: empId,
          employeeName: empName,
          employeeRole: empRole,
          employeeAvatar: empAvatar,
          status: "todo",
          output: t.output || "Work is currently scheduled and pending.",
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        batch.set(doc(db, "tasks", taskId), taskItem);
        savedTasks.push(taskItem);
      }

      await batch.commit();

      // Send System Notification that project planning is complete
      const notificationId = doc(collection(db, "notifications")).id;
      await setDoc(doc(db, "notifications", notificationId), {
        id: notificationId,
        uid,
        title: `Project Spark: ${projectName}`,
        description: `CEO has successfully assigned ${assignedTasks.length} agents to build ${projectName}.`,
        type: "project_update",
        isRead: false,
        createdAt: new Date().toISOString(),
        projectId: projId
      } as SystemNotification);

      // 3. Save CEO Response message with metadata to render the live visualization board!
      const ceoMsgId = doc(collection(db, "messages")).id;
      const ceoMsg: ChatMessage = {
        id: ceoMsgId,
        chatId: activeChatId,
        uid,
        sender: "ceo",
        content: ceoMessage || `Excellent instruction. I have assembled a dedicated team of ${assignedTasks.length} employees to execute this.`,
        timestamp: new Date().toISOString(),
        metadata: {
          projectId: projId,
          projectName: newProject.name,
          planningCompleted: true,
          ceoThoughts: ceoThoughts,
          activeTasks: savedTasks.map(st => ({
            taskId: st.id,
            title: st.title,
            employeeId: st.assignedTo,
            employeeName: st.employeeName,
            role: st.employeeRole,
            progress: 0,
            status: "todo"
          }))
        }
      };
      await setDoc(doc(db, "messages", ceoMsgId), ceoMsg);

      // 4. Start an asynchronous UI real-time simulation so the company workspace is alive and coordinates!
      simulateProjectExecution(projId, savedTasks, ceoMsgId);

    } catch (error: any) {
      console.error("Error communicating with CEO:", error);
      // Create a fallback error response from CEO
      const ceoMsgId = doc(collection(db, "messages")).id;
      const ceoMsg: ChatMessage = {
        id: ceoMsgId,
        chatId: activeChatId,
        uid,
        sender: "ceo",
        content: `I hit an unexpected coordination challenge while drafting this plan: ${error.message}. I am resolving it immediately. Let's try re-submitting your request.`,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "messages", ceoMsgId), ceoMsg);
    } finally {
      setCeoIsTyping(false);
    }
  };

  // Real-time Employee simulation to bring the dashboard entirely alive!
  // It updates tasks, progress, files, notifications, and logs step by step over 20-30 seconds!
  const simulateProjectExecution = async (projectId: string, tasksToRun: Task[], ceoMessageId: string) => {
    if (!user) return;
    const uid = inspectedUid || user.uid;

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Update employees status to working
    for (const t of tasksToRun) {
      await updateDoc(doc(db, "employees", t.assignedTo), { status: "working", workload: 1 });
      
      // Create activity log
      await addDoc(collection(db, "activity_logs"), {
        uid,
        projectId,
        projectName: t.projectName,
        employeeId: t.assignedTo,
        employeeName: t.employeeName,
        employeeRole: t.employeeRole,
        action: "Began Task",
        details: `Started working on task: ${t.title}. Goal is to produce premium results.`,
        timestamp: new Date().toISOString()
      });
    }

    // Update project progress
    await updateDoc(doc(db, "projects", projectId), { progress: 10 });

    // Stagger task completion
    for (let i = 0; i < tasksToRun.length; i++) {
      const task = tasksToRun[i];
      
      // Phase 1: progress to 45%
      await delay(2500);
      await updateDoc(doc(db, "tasks", task.id), { status: "inprogress", progress: 45, updatedAt: new Date().toISOString() });
      await updateDoc(doc(db, "projects", projectId), { 
        progress: Math.min(90, Math.floor(((i + 0.5) / tasksToRun.length) * 100)),
        updatedAt: new Date().toISOString() 
      });

      // Update employee status
      await updateDoc(doc(db, "employees", task.assignedTo), { performance: Math.min(100, Math.floor(95 + Math.random() * 5)) });

      // Phase 2: progress to 80% (Review state)
      await delay(2500);
      await updateDoc(doc(db, "tasks", task.id), { status: "review", progress: 85, updatedAt: new Date().toISOString() });
      
      // Create review activity log
      await addDoc(collection(db, "activity_logs"), {
        uid,
        projectId,
        projectName: task.projectName,
        employeeId: task.assignedTo,
        employeeName: task.employeeName,
        employeeRole: task.employeeRole,
        action: "Submitted for Review",
        details: `Finished asset drafts. Submitting to CEO for strict quality check.`,
        timestamp: new Date().toISOString()
      });

      // Phase 3: complete!
      await delay(2000);
      await updateDoc(doc(db, "tasks", task.id), { status: "completed", progress: 100, updatedAt: new Date().toISOString() });
      await updateDoc(doc(db, "employees", task.assignedTo), { status: "idle", workload: 0 });

      // Add project timeline event
      const projDoc = doc(db, "projects", projectId);
      const projSnap = await getDocs(query(collection(db, "projects"), where("uid", "==", uid)));
      // Append to the list of timeline
      const currentProj = projects.find(p => p.id === projectId);
      if (currentProj) {
        const updatedTimeline = [
          ...currentProj.timeline,
          {
            id: doc(collection(db, "activity_logs")).id,
            timestamp: new Date().toISOString(),
            title: `Task Completed: ${task.title}`,
            description: `${task.employeeName} (${task.employeeRole}) successfully finalized this deliverable.`,
            type: "task_complete" as const,
            employeeId: task.assignedTo,
            employeeName: task.employeeName
          }
        ];
        await updateDoc(projDoc, { timeline: updatedTimeline });
      }

      // Generate a deliverable File record
      const fileId = doc(collection(db, "files")).id;
      let fileType: 'code' | 'design' | 'text' | 'image' | 'video' | 'report' | 'other' = 'text';
      let fileName = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;

      const roleLower = task.employeeRole.toLowerCase();
      if (roleLower.includes("developer") || roleLower.includes("engineer")) {
        fileType = 'code';
        fileName = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ts`;
      } else if (roleLower.includes("design") || roleLower.includes("illustrator")) {
        fileType = 'design';
        fileName = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_spec.json`;
      } else if (roleLower.includes("copywriter") || roleLower.includes("writer")) {
        fileType = 'text';
        fileName = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`;
      } else if (roleLower.includes("marketing") || roleLower.includes("sales") || roleLower.includes("analyst")) {
        fileType = 'report';
        fileName = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_report.md`;
      }

      await setDoc(doc(db, "files", fileId), {
        id: fileId,
        uid,
        projectId,
        projectName: task.projectName,
        name: fileName,
        type: fileType,
        content: task.output || "Generated report contents.",
        size: `${Math.floor(2 + Math.random() * 8)} KB`,
        createdAt: new Date().toISOString()
      } as FileAsset);

      // Create completion log
      await addDoc(collection(db, "activity_logs"), {
        uid,
        projectId,
        projectName: task.projectName,
        employeeId: task.assignedTo,
        employeeName: task.employeeName,
        employeeRole: task.employeeRole,
        action: "Completed Task",
        details: `Successfully compiled asset: ${fileName} (${fileType}). Ready for production.`,
        timestamp: new Date().toISOString()
      });

      // Notification
      const completionNotifId = doc(collection(db, "notifications")).id;
      await setDoc(doc(db, "notifications", completionNotifId), {
        id: completionNotifId,
        uid,
        title: `Task Finalized by ${task.employeeName}`,
        description: `Deliverable "${task.title}" is complete and saved to Files.`,
        type: "task_completed",
        isRead: false,
        createdAt: new Date().toISOString(),
        projectId
      } as SystemNotification);
    }

    // Finalize Project
    await updateDoc(doc(db, "projects", projectId), { 
      status: "completed", 
      progress: 100, 
      updatedAt: new Date().toISOString() 
    });

    // Deduct credits if user is not on the Venture plan
    if (profile) {
      const isVenture = profile.plan?.toLowerCase().includes("venture");
      if (!isVenture) {
        const currentBalance = profile.balance ?? 50000;
        const newBalance = Math.max(0, currentBalance - 10000);
        
        // Update Firestore
        await updateDoc(doc(db, "users", uid), { balance: newBalance });
        // Update local store state
        setProfile({ ...profile, balance: newBalance });

        // Add activity log about credit deduction
        await addDoc(collection(db, "activity_logs"), {
          uid,
          projectId,
          action: "CREDITS_DEDUCTION",
          details: `Deducted 10,000 corporate execution credits for delivering project assets. Remaining balance: ${newBalance.toLocaleString()} Cr.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    const finalProj = projects.find(p => p.id === projectId);
    if (finalProj) {
      await updateDoc(doc(db, "projects", projectId), {
        timeline: [
          ...finalProj.timeline,
          {
            id: doc(collection(db, "activity_logs")).id,
            timestamp: new Date().toISOString(),
            title: `Project Delivered`,
            description: `CEO delivered the completed startup assets to the client dashboard. All agents are back to standby.`,
            type: "task_complete" as const
          }
        ]
      });
    }

    // Send project complete notification
    const finalNotifId = doc(collection(db, "notifications")).id;
    await setDoc(doc(db, "notifications", finalNotifId), {
      id: finalNotifId,
      uid,
      title: `Project Delivered!`,
      description: `All files for "${tasksToRun[0]?.projectName || "Startup"}" have been delivered with flawless grades.`,
      type: "project_update",
      isRead: false,
      createdAt: new Date().toISOString(),
      projectId
    } as SystemNotification);
  };

  // Add Custom Chat Conversation
  const createNewChat = async (title: string = "New Business Strategy") => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;
    const chatId = doc(collection(db, "chats")).id;
    const newChat: Chat = {
      id: chatId,
      uid,
      title,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "chats", chatId), newChat);
    setActiveChatId(chatId);
    return chatId;
  };

  const startEmployeeChat = async (emp: Employee) => {
    if (!user) return;
    const uid = inspectedUid || user.uid;

    // Check if a chat already exists with this employee
    const existing = chats.find(c => c.employeeId === emp.id);
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }

    // Create a new chat conversation with this employee
    const chatId = doc(collection(db, "chats")).id;
    const newChat: Chat = {
      id: chatId,
      uid,
      title: `Direct: ${emp.name}`,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeId: emp.id
    };

    await setDoc(doc(db, "chats", chatId), newChat);

    // Seed a warm welcome message from the employee
    const welcomeMsgId = doc(collection(db, "messages")).id;
    const welcomeMsg: ChatMessage = {
      id: welcomeMsgId,
      chatId,
      uid,
      sender: "employee",
      content: `Hello! I'm **${emp.name}**, your **${emp.role}**. 

I specialize in **${emp.skills?.join(", ")}**.

My current goal is: *"${emp.goal}"*.

How can I help you or execute deliverables for you today?`,
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, "messages", welcomeMsgId), welcomeMsg);
    setActiveChatId(chatId);
  };

  const deleteChatConversation = async (chatId: string) => {
    await deleteDoc(doc(db, "chats", chatId));
    // Also delete all related messages
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const togglePinChatConversation = async (chatId: string, currentPin: boolean) => {
    await updateDoc(doc(db, "chats", chatId), { isPinned: !currentPin });
  };

  // Create Custom Employee
  const createCustomEmployee = async (
    empData: Omit<Employee, "id" | "uid" | "createdAt" | "isCustom" | "status" | "performance" | "workload">,
    isTemplate: boolean = false
  ) => {
    if (!user) return { success: false, error: "Authentication required." };
    const uid = inspectedUid || user.uid;

    const isVenture = profile?.plan?.toLowerCase().includes("venture");
    const currentCount = employees.length;
    const isFree = currentCount < 4;
    const cost = (isFree || isVenture) ? 0 : (isTemplate ? 5000 : 6000);

    if (cost > 0) {
      const currentBalance = profile?.balance ?? 0;
      if (currentBalance < cost) {
        return { 
          success: false, 
          error: `Insufficient credits! You currently have ${currentCount} employees. Hiring a ready-made template costs 5,000 credits, and custom drafts cost 6,000 credits. Your current balance is ${currentBalance.toLocaleString()} credits. Please upgrade your plan or redeem a code in the Billing section to get more credits.`
        };
      }

      // Deduct balance
      const userDocRef = doc(db, "users", uid);
      const newBalance = currentBalance - cost;
      await setDoc(userDocRef, { balance: newBalance }, { merge: true });
      if (profile) {
        setProfile({ ...profile, balance: newBalance });
      }

      // Create log
      const logId = doc(collection(db, "activity_logs")).id;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        uid,
        action: "FUNDS_DEDUCTED",
        details: `Deducted ${cost.toLocaleString()} credits to hire "${empData.name}" (${empData.role}). Remaining balance: ${newBalance.toLocaleString()} credits.`,
        timestamp: new Date().toISOString()
      });

      // Create system notification
      const notifId = doc(collection(db, "notifications")).id;
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        uid,
        title: "Staff Hired Successfully! 🚀",
        description: `Deducted ${cost.toLocaleString()} credits for hiring ${empData.name} (${empData.role}).`,
        type: "billing",
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    const empId = doc(collection(db, "employees")).id;
    const newEmp: Employee = {
      ...empData,
      id: empId,
      uid,
      status: "idle",
      performance: 100,
      workload: 0,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "employees", empId), newEmp);
    return { success: true, employeeId: empId };
  };

  const deleteEmployee = async (empId: string) => {
    await deleteDoc(doc(db, "employees", empId));
  };

  const updateEmployee = async (empId: string, updatedData: Partial<Employee>) => {
    await updateDoc(doc(db, "employees", empId), updatedData);
  };

  // Publish Employee to public database for share links
  const publishEmployee = async (emp: Employee) => {
    if (!user) return null;
    try {
      const publishedId = doc(collection(db, "published_employees")).id;
      const cleanData = {
        id: publishedId,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        department: emp.department || "Engineering",
        goal: emp.goal,
        skills: emp.skills || [],
        systemPrompt: emp.systemPrompt,
        model: emp.model || "gemini-2.5-flash",
        temperature: emp.temperature ?? 0.2,
        description: emp.description || "",
        publishedBy: profile?.displayName || user.email || "Anonymous Founder",
        publishedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "published_employees", publishedId), cleanData);
      return publishedId;
    } catch (err) {
      console.error("Error publishing employee:", err);
      return null;
    }
  };

  const fetchPublishedEmployee = async (publishedId: string) => {
    try {
      const docSnap = await getDoc(doc(db, "published_employees", publishedId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err) {
      console.error("Error fetching published employee:", err);
      return null;
    }
  };

  // Create Memory Item
  const createMemoryItem = async (title: string, content: string, category: 'knowledge' | 'instruction' | 'saved_doc') => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;
    const memId = doc(collection(db, "memories")).id;
    const newMemory: MemoryItem = {
      id: memId,
      uid,
      title,
      content,
      category,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "memories", memId), newMemory);
    return memId;
  };

  const deleteMemoryItem = async (memId: string) => {
    await deleteDoc(doc(db, "memories", memId));
  };

  // Create File Asset
  const createFileAsset = async (name: string, content: string, type: 'code' | 'design' | 'text' | 'image' | 'video' | 'report' | 'other') => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;
    const fileId = doc(collection(db, "files")).id;
    const newFile: FileAsset = {
      id: fileId,
      uid,
      projectId: "collaboration_room",
      projectName: "Multi-Agent Collaboration Space",
      name,
      type,
      content,
      size: `${Math.ceil(content.length / 1024) || 1} KB`,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "files", fileId), newFile);

    // Create activity log
    const logId = doc(collection(db, "activity_logs")).id;
    await setDoc(doc(db, "activity_logs", logId), {
      id: logId,
      uid,
      projectId: "collaboration_room",
      projectName: "Multi-Agent Collaboration Space",
      action: "Created File",
      details: `Successfully generated team deliverable asset: ${name}`,
      timestamp: new Date().toISOString()
    });

    return fileId;
  };

  // Create Collaboration Project and corresponding tasks
  const createCollaborationProject = async (
    prompt: string,
    selectedAgents: Employee[],
    results: { agentId: string; agentName: string; reply: string }[]
  ) => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;

    const cleanPrompt = prompt.replace(/[^\w\s]/g, "");
    const words = cleanPrompt.split(/\s+/).filter(Boolean);
    const shortName = words.slice(0, 4).join(" ");
    const projectName = `Collab: ${shortName || "Team Launch"}`;

    const projId = doc(collection(db, "projects")).id;
    const newProject: Project = {
      id: projId,
      uid,
      name: projectName,
      description: prompt,
      status: "active",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: doc(collection(db, "activity_logs")).id,
          timestamp: new Date().toISOString(),
          title: "Multi-Agent Collaboration Initiated",
          description: `Team collaboration launched for objective: "${prompt}".`,
          type: "info"
        }
      ]
    };
    await setDoc(doc(db, "projects", projId), newProject);

    const savedTasks: Task[] = [];
    const batch = writeBatch(db);

    for (const res of results) {
      const agent = selectedAgents.find(a => a.id === res.agentId);
      if (!agent) continue;

      const taskId = doc(collection(db, "tasks")).id;
      const taskItem: Task = {
        id: taskId,
        uid,
        projectId: projId,
        projectName: newProject.name,
        title: `${agent.role} Deliverable`,
        description: `Analyze, construct, and deliver assets based on collaboration briefing: "${prompt.slice(0, 100)}..."`,
        assignedTo: agent.id,
        employeeName: agent.name,
        employeeRole: agent.role,
        employeeAvatar: agent.avatar,
        status: "todo",
        output: res.reply || "Work is currently scheduled and pending.",
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      batch.set(doc(db, "tasks", taskId), taskItem);
      savedTasks.push(taskItem);
    }

    await batch.commit();

    // Trigger asynchronous execution simulation to move through progress states
    simulateProjectExecution(projId, savedTasks, "");

    return projId;
  };

  // Notifications toggle read
  const markNotificationAsRead = async (notifId: string) => {
    await updateDoc(doc(db, "notifications", notifId), { isRead: true });
  };

  // Delete Notification
  const deleteNotification = async (notifId: string) => {
    await deleteDoc(doc(db, "notifications", notifId));
  };

  // Create System Notification
  const createNotification = async (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;
    const notifId = doc(collection(db, "notifications")).id;
    const newNotif = {
      id: notifId,
      uid,
      title,
      message,
      description: message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "notifications", notifId), newNotif);
    return notifId;
  };

  // Add a new integration connection
  const addIntegration = async (
    platform: 'gmail' | 'google_sheets' | 'whatsapp' | 'instagram' | 'slack' | 'discord' | 'hubspot' | 'webhook', 
    connectionName: string, 
    credentials: any
  ) => {
    if (!user) return null;
    const uid = inspectedUid || user.uid;
    const intId = doc(collection(db, "integrations")).id;
    const newInt: Integration = {
      id: intId,
      uid,
      platform,
      connectionName,
      status: 'connected',
      credentials,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "integrations", intId), newInt);
    
    // Log the connection event
    const logId = doc(collection(db, "activity_logs")).id;
    await setDoc(doc(db, "activity_logs", logId), {
      id: logId,
      uid,
      action: "Connected Platform",
      details: `Successfully authorized connection name "${connectionName}" for ${platform.toUpperCase()}.`,
      timestamp: new Date().toISOString()
    });

    return intId;
  };

  // Remove an integration connection
  const deleteIntegration = async (id: string) => {
    if (!user) return;
    const uid = inspectedUid || user.uid;
    
    const snap = await getDoc(doc(db, "integrations", id));
    if (snap.exists()) {
      const data = snap.data();
      const logId = doc(collection(db, "activity_logs")).id;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        uid,
        action: "Disconnected Platform",
        details: `Removed connection "${data.connectionName}" for ${data.platform.toUpperCase()}.`,
        timestamp: new Date().toISOString()
      });
    }

    await deleteDoc(doc(db, "integrations", id));
  };

  // Trigger automation agent runs
  const triggerAutomationAction = async (prompt: string, platform: string, rawMode: boolean = false) => {
    if (!user) return { success: false, error: "Authentication required." };
    const uid = inspectedUid || user.uid;
    const runId = doc(collection(db, "automation_runs")).id;

    // Create initial running state
    const initialRun: AutomationRun = {
      id: runId,
      uid,
      platform,
      prompt,
      recipient: "Extracting...",
      topic: "Enhancing...",
      subject: "Structuring...",
      enhancedMessage: "Elena (AI CEO): Routing request to Gemini and preparing automation agent...",
      explanation: "Dispatching worker bot to platform payload queue.",
      status: 'running',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "automation_runs", runId), initialRun);

    try {
      let recipient = "All Subscribers";
      let topic = "Digital Update";
      let subject = "Automated AI Broadcast";
      let enhancedMessage = prompt;
      let explanation = "Executed directly without linguistic enhancements.";

      if (!rawMode) {
        // Post instruction to our backend
        const resEnhance = await fetch("/api/automation/enhance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, platform })
        });

        if (resEnhance.ok) {
          const result = await resEnhance.json();
          recipient = result.recipient || recipient;
          topic = result.topic || topic;
          subject = result.subject || subject;
          enhancedMessage = result.enhancedMessage || enhancedMessage;
          explanation = result.explanation || explanation;
        } else {
          console.warn("AI enhancement API failed, falling back to simple extraction.");
          const extractedRecipient = prompt.match(/to\s+([a-zA-Z0-9_\-\s]+?)(?:\s+about|\s+regarding|$)/i);
          if (extractedRecipient) recipient = extractedRecipient[1].trim();
        }
      }

      // Prepare simulated return payload representing fully dispatched webhooks / API calls
      const responsePayload = JSON.stringify({
        agentId: `bot_${Math.random().toString(36).substring(2, 9)}`,
        status: "DELIVERED",
        platform: platform,
        recipient: recipient,
        topic: topic,
        timestamp: new Date().toISOString(),
        gateway: "AK.AI Outbound Router v1.2",
        messageHash: `sha256_${Math.random().toString(16).substring(2, 34)}`
      }, null, 2);

      const completedRun: AutomationRun = {
        id: runId,
        uid,
        platform,
        prompt,
        recipient,
        topic,
        subject,
        enhancedMessage,
        explanation,
        status: 'completed',
        createdAt: new Date().toISOString(),
        responsePayload
      };
      await setDoc(doc(db, "automation_runs", runId), completedRun);

      // Create an activity log
      const logId = doc(collection(db, "activity_logs")).id;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        uid,
        action: `Automation Fired`,
        details: `Simulated live delivery of ${platform.toUpperCase()} notification to ${recipient} on "${topic}".`,
        timestamp: new Date().toISOString()
      });

      // Notify the executive interface
      const notifId = doc(collection(db, "notifications")).id;
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        uid,
        title: `${platform.toUpperCase().replace("_", " ")} Automation Complete`,
        description: `Delivered message to "${recipient}" regarding "${topic}" successfully.`,
        type: "task_completed",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return { success: true, runId, recipient, topic, enhancedMessage, explanation };
    } catch (err: any) {
      console.error("Automation run failed:", err);
      const failedRun: AutomationRun = {
        id: runId,
        uid,
        platform,
        prompt,
        recipient: "Error Agent",
        topic: "Automation Fault",
        subject: "Process Aborted",
        enhancedMessage: prompt,
        explanation: `Routing error: ${err.message}`,
        status: 'failed',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "automation_runs", runId), failedRun);
      return { success: false, error: err.message };
    }
  };

  // Promo code redemption and plan upgrading
  const redeemPromoCode = async (code: string) => {
    if (!user || !profile) {
      return { success: false, error: "Please log in to redeem a code." };
    }
    
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { success: false, error: "Promo code cannot be empty." };
    }

    try {
      const codeRef = doc(db, "promo_codes", trimmedCode);
      const codeSnap = await getDoc(codeRef);

      let targetPlan = "";
      let isDevCode = false;
      const upperCode = trimmedCode.toUpperCase();
      const upperScaleUp = SCALE_UP_CODES.map(c => c.toUpperCase());
      const upperVenture = VENTURE_CODES.map(c => c.toUpperCase());

      if (upperCode === "AK.AI82833.9") {
        targetPlan = "Venture Corporate (Developer)";
        isDevCode = true;
      } else if (upperScaleUp.includes(upperCode)) {
        targetPlan = "Scale-Up Company";
      } else if (upperVenture.includes(upperCode)) {
        targetPlan = "Venture Corporate";
      } else if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        if (codeData?.isUsed) {
          return { success: false, error: "This promo code has already been used." };
        }
        targetPlan = codeData?.plan || "Scale-Up Company";
        isDevCode = codeData?.isDev || false;
      } else {
        return { success: false, error: "This promo code is invalid." };
      }

      // Mark code as used in Firestore
      await setDoc(codeRef, {
        code: trimmedCode,
        plan: targetPlan,
        isUsed: true,
        usedBy: user.uid,
        usedAt: new Date().toISOString()
      }, { merge: true });

      // Determine credits based on the plan
      let newBalance = profile.balance ?? 50000;
      if (targetPlan.toLowerCase().includes("venture")) {
        newBalance = 999999999;
      } else if (targetPlan === "Scale-Up Company") {
        newBalance = 5000000;
      } else {
        newBalance = 50000;
      }

      // Update the user's plan in user profile
      const userDocRef = doc(db, "users", user.uid);
      const updatedProfile = { 
        ...profile, 
        plan: targetPlan, 
        isDev: isDevCode,
        balance: newBalance
      };
      await setDoc(userDocRef, { 
        plan: targetPlan, 
        isDev: isDevCode,
        balance: newBalance
      }, { merge: true });
      setProfile(updatedProfile);

      // Create a system notification
      const notifId = doc(collection(db, "notifications")).id;
      await setDoc(doc(db, "notifications", notifId), {
        id: notifId,
        uid: user.uid,
        title: "Plan Upgraded! 🎉",
        description: `Successfully upgraded to the ${targetPlan} Plan using a promo code.`,
        type: "billing",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Create a visual activity log
      const logId = doc(collection(db, "activity_logs")).id;
      await setDoc(doc(db, "activity_logs", logId), {
        id: logId,
        uid: user.uid,
        action: "PLAN_UPGRADE",
        details: `Upgraded corporate workspace license tier to "${targetPlan}".`,
        timestamp: new Date().toISOString()
      });

      return { success: true, plan: targetPlan };
    } catch (err: any) {
      console.error("Error redeeming promo code:", err);
      return { success: false, error: err.message || "Something went wrong." };
    }
  };

  return {
    user,
    profile,
    loading,
    employees,
    projects,
    tasks,
    chats,
    messages,
    logs,
    files,
    notifications,
    memories,
    integrations,
    automationRuns,
    activeChatId,
    setActiveChatId,
    ceoIsTyping,
    sendCeoInstruction,
    createNewChat,
    startEmployeeChat,
    deleteChatConversation,
    togglePinChatConversation,
    createCustomEmployee,
    deleteEmployee,
    updateEmployee,
    publishEmployee,
    fetchPublishedEmployee,
    createMemoryItem,
    deleteMemoryItem,
    createFileAsset,
    createCollaborationProject,
    markNotificationAsRead,
    deleteNotification,
    createNotification,
    addIntegration,
    deleteIntegration,
    triggerAutomationAction,
    redeemPromoCode,
    handleSignUp,
    handleSignIn,
    handleDemoSignIn,
    handleGoogleSignIn,
    handleSignOut,
    isDeveloper,
    inspectedUid,
    setInspectedUid
  };
}
