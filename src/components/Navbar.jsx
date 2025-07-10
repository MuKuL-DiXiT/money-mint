import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 text-white shadow-xl sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <Link
          to="/"
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-500"
        >
          MoneyMint 💸
        </Link>

        {/* Hamburger Icon - Mobile Only */}
        <button
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-4 items-center text-sm md:text-base">
          <Link to="/" className="hover:text-teal-300 transition">Home</Link>
          {user && <Link to="/dashboard" className="hover:text-teal-300 transition">Dashboard</Link>}
          {user && <Link to="/add" className="hover:text-teal-300 transition">Add</Link>}
          {user && <Link to="/createplan" className="hover:text-teal-300 transition">Create</Link>}

          {!user ? (
            <Link to="/login" className="bg-white text-black px-3 py-1 rounded-xl shadow hover:bg-gray-100 transition">Login</Link>
          ) : (
            <button
              onClick={() => signOut(auth)}
              className="bg-red-800 px-3 py-1 rounded-xl hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm bg-teal-800">
          <div className="flex justify-between">
            <Link to="/" onClick={toggleMenu} className="block hover:text-teal-300">Home</Link>
            {!user ? (
              <Link
                to="/login"
                onClick={toggleMenu}
                className="block bg-white text-black px-3 py-1 rounded-xl shadow hover:bg-gray-100 transition"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  toggleMenu();
                  signOut(auth);
                }}
                className="block bg-red-800 px-3 py-1 rounded-xl hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>
          {user && <Link to="/dashboard" onClick={toggleMenu} className="block hover:text-teal-300">Dashboard</Link>}
          {user && <Link to="/add" onClick={toggleMenu} className="block hover:text-teal-300">Add</Link>}
          {user && <Link to="/plan" onClick={toggleMenu} className="block hover:text-teal-300">Plan</Link>}


        </div>
      )}
    </nav>
  );
}
