"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/home");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/home");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDetailsRef = doc(db, "userdetails", user.uid);
            await setDoc(userDetailsRef, {
                name: name,
                uid: user.uid,
                matching: { 1: -1, 2: -1, 3: -1, 4: -1, 5: -1 },
                memory: { 1: -1, 2: -1, 3: -1, 4: -1, 5: -1 },
                write2level: 1
            });

            router.push("/home");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-96 text-center">
                <h1 className="text-3xl font-bold mb-4">
                    {isRegistering ? "Register" : "Login"}
                </h1>

                {isRegistering && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {isRegistering && (
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                )}

                {error && <p className="text-red-500 mb-3">{error}</p>}

                {isRegistering ? (
                    <button
                        onClick={handleRegister}
                        className="cursor-pointer w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200"
                    >
                        Register
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
                    >
                        Login
                    </button>
                )}

                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full text-gray-400 mt-3 hover:underline"
                >
                    {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                </button>
            </div>
        </div>
    );
}
