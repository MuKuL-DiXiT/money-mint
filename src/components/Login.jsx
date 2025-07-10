import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };
  useEffect(() => {
  if (user) navigate('/');
}, [user]);


  return (
    <div className="flex h-screen items-center justify-center  bg-gradient-to-br from-teal-900 via-teal-950 to-black text-white relative overflow-hidden font-inter">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5 animate-gradient">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#grad)" />
        </svg>
      </div>

      {/* Button Container */}
      <div className="z-10 flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold drop-shadow-lg">Welcome to <span className="text-emerald-400">MoneyMint</span> 💸</h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">Track your mindset-based spending with clarity.</p>

        <button
          onClick={loginWithGoogle}
          className="flex items-center gap-3 bg-white text-teal-900 px-6 py-3 rounded-full shadow-xl hover:scale-105 hover:shadow-2xl transition duration-300 font-semibold text-lg"
        >
          <FcGoogle/>
          Sign in with Google
        </button>
        
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background: linear-gradient(270deg, #0f766e, #0e7490, #134e4a);
          background-size: 600% 600%;
          animation: moveGradient 20s ease infinite;
        }
      `}</style>
    </div>
  );
}
