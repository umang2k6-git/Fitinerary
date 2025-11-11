import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-semibold text-xl group">
            <img src="/Logo 2.png" alt="Fitinerary" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
            <span>Fitinerary</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/my-itineraries"
                  className="text-white/90 hover:text-white transition-colors duration-300"
                >
                  My Trips
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange flex items-center justify-center text-white font-medium hover:scale-110 transition-transform duration-300"
                  >
                    {user.email?.[0].toUpperCase()}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-dark border border-white/20 overflow-hidden z-50 animate-scale-in">
                        <div className="p-4 border-b border-white/10">
                          <p className="text-white text-sm font-medium truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors duration-300 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/90 hover:text-white transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-medium hover:shadow-glow-teal transition-all duration-300 hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 animate-fade-in-up">
            {user ? (
              <div className="space-y-4">
                <Link
                  to="/my-itineraries"
                  className="block text-white/90 hover:text-white transition-colors duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  My Trips
                </Link>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-white text-sm mb-3">{user.email}</p>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowMobileMenu(false);
                    }}
                    className="text-white/90 hover:text-white transition-colors duration-300 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block text-white/90 hover:text-white transition-colors duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-6 py-2 rounded-full bg-gradient-to-r from-luxury-teal to-luxury-orange text-white font-medium text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
