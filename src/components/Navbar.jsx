import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { Menu, X, SunIcon, MoonIcon } from "lucide-react";

export default function Navbar({ dark, setDark }) {
  const [user] = useAuthState(auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleDarkMode = () => setDark((prev) => !prev);

  return (
    <nav className={`${dark
      ? 'bg-gradient-to-r from-black via-black to-teal-900 text-white'
      : 'bg-gradient-to-r from-white via-yellow-200 to-white text-black'
      } shadow-xl sticky top-0 z-50 transition-all duration-300`}
      
      >
       
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-sans sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 hover:scale-105 transition-transform duration-200"
          >
            MoneyMint 💸
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${dark
                  ? 'hover:bg-gray-700 hover:text-blue-300'
                  : 'hover:bg-black/30 hover:text-yellow-200'
                  }`}
              >
                Home
              </Link>

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${dark
                      ? 'hover:bg-gray-700 hover:text-blue-300'
                      : 'hover:bg-black/30 hover:text-yellow-200'
                      }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/add"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${dark
                      ? 'hover:bg-gray-700 hover:text-blue-300'
                      : 'hover:bg-black/30 hover:text-yellow-200'
                      }`}
                  >
                    Add
                  </Link>
                  <Link
                    to="/createplan"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${dark
                      ? 'hover:bg-gray-700 hover:text-blue-300'
                      : 'hover:bg-black/30 hover:text-yellow-200'
                      }`}
                  >
                    Create
                  </Link>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 ${dark
                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                : 'bg-gray-800 hover:bg-gray-700 text-yellow-300'
                }`}
              aria-label="Toggle dark mode"
            >
              {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* Auth Button */}
            {!user ? (
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full font-medium shadow-lg transform hover:scale-105  hover:shadow-xl transition-all duration-500 ease-in-out ${dark ? 'bg-white text-gray-900 hover:shadow-white' : 'bg-black text-white hover:shadow-black'
                  }`}
              >
                Login
              </Link>

            ) : (
              <button
                onClick={() => signOut(auth)}
                className={`px-4 py-2 rounded-full font-medium shadow-lg transform hover:scale-105  hover:shadow-xl transition-all duration-500 ease-in-out ${dark ? 'bg-white text-gray-900 hover:shadow-white' : 'bg-black text-white hover:shadow-black'}`}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 ${dark
                ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                : 'bg-gray-800 hover:bg-gray-700 text-yellow-300'
                }`}
              aria-label="Toggle dark mode"
            >
              {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-all duration-200 ${dark
                ? 'hover:bg-gray-700'
                : 'hover:bg-white/20'
                }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className={`md:hidden border-t ${dark?"border-t-white":"border-t-black"} transition-all duration-300`}>
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={toggleMenu}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${dark
                ? 'text-white hover:bg-gray-700 hover:text-blue-300'
                : 'text-black hover:bg-black/30'
                }`}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={toggleMenu}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${dark
                    ? 'text-white hover:bg-gray-700 hover:text-blue-300'
                    : 'text-black hover:bg-black/30'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/add"
                  onClick={toggleMenu}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${dark
                    ? 'text-white hover:bg-gray-700 hover:text-blue-300'
                    : 'text-black hover:bg-black/30'
                    }`}
                >
                  Add
                </Link>
                <Link
                  to="/createplan"
                  onClick={toggleMenu}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${dark
                    ? 'text-white hover:bg-gray-700 hover:text-blue-300'
                    : 'text-black hover:bg-black/30'
                    }`}
                >
                  Create
                </Link>
              </>
            )}

            {/* Mobile Auth Button */}
            <div className="pt-3 border-t border-gray-600">
              {!user ? (
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${dark
                    ? 'bg-white/80 text-gray-900 hover:bg-white'
                    : 'bg-black/60 hover:bg-black text-white'

                    } shadow-lg`}
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    toggleMenu();
                    signOut(auth);
                  }}
                  className={`block w-full text-center ${dark
                    ? 'bg-white/80 text-gray-900 hover:bg-white'
                    : 'bg-black/60 hover:bg-black text-white'

                    }  px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg`}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}