import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Types
export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    xp: number;
    coins: number;
    level: number;
    streak: number;
    lastStudyDate: any; // Timestamp
    preferences?: {
        theme: 'light' | 'dark';
        primaryColor: string;
        pomodoroDuration: number;
        srsNotifications: boolean;
    };
}

export interface Note {
    id: string;
    userId: string;
    title: string;
    content?: string;
    type: 'folder' | 'note';
    parentId: string | null;
    createdAt: any;
    updatedAt: any;
}

export interface Exam {
    id: string;
    userId: string;
    title: string;
    date: string; // YYYY-MM-DD
    score?: string; // e.g. "85%" or "A"
    status: 'upcoming' | 'completed';
    topics?: string;
    createdAt: any;
}

export const AuthService = {
    loginWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user document exists, if not create it
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    xp: 0,
                    coins: 0,
                    level: 1,
                    streak: 0,
                    createdAt: serverTimestamp(),
                    preferences: {
                        theme: 'dark',
                        primaryColor: 'amber',
                        pomodoroDuration: 25,
                        srsNotifications: true
                    }
                });
            }
            return user;
        } catch (error) {
            console.error("Error logging in with Google", error);
            throw error;
        }
    },

    logout: async () => {
        await firebaseSignOut(auth);
    },

    // Helper to subscribe to user profile changes
    subscribeToProfile: (uid: string, callback: (data: UserProfile) => void) => {
        return onSnapshot(doc(db, 'users', uid), (doc) => {
            if (doc.exists()) {
                callback(doc.data() as UserProfile);
            }
        });
    },

    updatePreferences: async (uid: string, preferences: UserProfile['preferences']) => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { preferences });
    }
};

export const FirestoreService = {
    // Generic helpers
    addDocument: async (collectionName: string, data: any) => {
        return await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: serverTimestamp()
        });
    },

    updateDocument: async (collectionName: string, docId: string, data: any) => {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    deleteDocument: async (collectionName: string, docId: string) => {
        await deleteDoc(doc(db, collectionName, docId));
    },

    // Specific helpers
    getUserSubcollection: (userId: string, subcollectionName: string) => {
        return collection(db, 'users', userId, subcollectionName);
    },

    subscribeToUserNotes: (userId: string, callback: (notes: Note[]) => void) => {
        const q = query(
            collection(db, 'notes'),
            where('userId', '==', userId)
        );
        return onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
            // Sort by createdAt desc
            notes.sort((a, b) => {
                const tA = a.createdAt?.seconds ?? 0;
                const tB = b.createdAt?.seconds ?? 0;
                return tB - tA;
            });
            callback(notes);
        });
    },

    subscribeToUserExams: (userId: string, callback: (exams: Exam[]) => void) => {
        const q = query(
            collection(db, 'exams'),
            where('userId', '==', userId)
        );
        return onSnapshot(q, (snapshot) => {
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
            // Sort by date asc
            exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            callback(exams);
        });
    },

    subscribeToUserSimulations: (userId: string, callback: (exams: Exam[]) => void) => {
        const q = query(
            collection(db, 'simulations'),
            where('userId', '==', userId)
        );
        return onSnapshot(q, (snapshot) => {
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
            // Sort by date asc
            exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            callback(exams);
        });
    }
};
