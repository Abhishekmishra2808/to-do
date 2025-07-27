import React, { useState, useEffect, useRef } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function AuthModal({ onAuth, onGuest }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Aurora animation state
  const blobsRef = useRef([]);
  const [blobStyles, setBlobStyles] = useState([]);

  // Initialize aurora blobs
  useEffect(() => {
    const createBlob = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 400 + 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    });

    blobsRef.current = Array.from({ length: 4 }, createBlob);
  }, []);

  // Aurora animation loop
  useEffect(() => {
    const animate = () => {
      blobsRef.current = blobsRef.current.map((blob) => {
        let newX = blob.x + blob.vx;
        let newY = blob.y + blob.vy;

        if (newX <= 0 || newX >= window.innerWidth) blob.vx *= -1;
        if (newY <= 0 || newY >= window.innerHeight) blob.vy *= -1;

        newX = Math.max(0, Math.min(window.innerWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight, newY));

        return { ...blob, x: newX, y: newY };
      });

      setBlobStyles(
        blobsRef.current.map((blob) => ({
          transform: `translate(${blob.x - blob.size / 2}px, ${blob.y - blob.size / 2}px)`,
          width: `${blob.size}px`,
          height: `${blob.size}px`,
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuth(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onAuth(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuth(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Aurora background for login modal */}
      <div className="fixed inset-0 z-0 bg-gray-900">
        <div className="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-3xl"></div>
        {/* Aurora blobs */}
        {blobStyles.map((style, index) => {
          const colors = ['bg-purple-500/30', 'bg-blue-500/30', 'bg-pink-500/30', 'bg-indigo-500/30'];
          return (
            <div
              key={index}
              className={`absolute rounded-full filter blur-3xl transition-transform duration-1000 ease-linear ${colors[index % colors.length]}`}
              style={style}
            ></div>
          );
        })}
      </div>
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-fade-in-up">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-100">{isLogin ? "Login" : "Sign Up"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-100"
              required
            />
          </div>
          {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
          
          {/* Email/Password Login Button */}
          <button 
            type="submit" 
            className="w-full mb-4 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLogin ? "Login" : "Sign Up"} with Email
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/80 text-gray-400">or</span>
            </div>
          </div>
          
          <div className="flex justify-between gap-2 mb-4">
            <button 
              type="button" 
              onClick={handleGoogleSignIn}
              className="px-6 py-2 bg-gray-800/70 text-gray-100 font-semibold rounded-lg hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" onClick={onGuest} className="px-6 py-2 bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600/80 transition-colors">Continue as Guest</button>
          </div>
        </form>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-blue-400 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}