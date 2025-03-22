import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getWrite2Level = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "userdetails", uid));
        if (userDoc.exists()) {
            return userDoc.data().write2level || 1;
        } else {
            await setDoc(doc(db, "userdetails", uid), { write2level: 1 });
            return 1;
        }
    } catch (error) {
        console.error("Error fetching write2level:", error);
        return 1;
    }
};

const updateWrite2Level = async (uid, currentLevel) => {
    if (!uid) {
        console.error("Invalid UID provided.");
        return;
    }
    try {
        const userDocRef = doc(db, "userdetails", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const existingLevel = userDoc.data().write2level || 1;
            const newLevel = Math.max(existingLevel, currentLevel);
            console.log(`Updating write2level for UID: ${uid}, New Level: ${newLevel}`);
            await updateDoc(userDocRef, { write2level: newLevel });
        } else {
            console.log(`Creating new user entry for UID: ${uid}, Level: ${currentLevel}`);
            await setDoc(userDocRef, { write2level: currentLevel });
        }
    } catch (error) {
        console.error("Error updating write2level:", error);
    }
};

export { auth, db, getWrite2Level, updateWrite2Level };