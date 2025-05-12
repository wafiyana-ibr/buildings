import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, faShieldHalved, faRightToBracket, faUserPlus, faHome, 
  faSignOutAlt, faUser, faTimes, faListCheck, faBookOpen, 
  faChessBoard, faUserShield, faSearch, faQuestionCircle 
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from "@/components/common/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Auth context
  const auth = useAuth();
  const user = auth?.user;
  const isSignedIn = !!user;
  const isAdmin = user?.role === 'admin';

  // Effect to handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Effect to prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    if (auth?.logout) {
      await auth.logout();
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'py-2 bg-neutral-900/30 backdrop-blur-3xl shadow-xl border-b border-white/10' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-8">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-3xl text-yellow-400 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                Clash Buildings
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 text-white">
            {/* Main navigation links */}
            <div className="flex items-center gap-5">
              {currentPath !== '/' && (
                <Link
                  to="/"
                  className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                >
                  <FontAwesomeIcon icon={faHome} />
                  <span>Home</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}

              {currentPath === '/' && (
                <>
                  <a
                    href="#search"
                    className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Search</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  <a
                    href="#features"
                    className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                  >
                    <FontAwesomeIcon icon={faListCheck} />
                    <span>Features</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  <a
                    href="#guides"
                    className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                  >
                    <FontAwesomeIcon icon={faBookOpen} />
                    <span>Guides</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </>
              )}

              {user && (
                <Link
                  to="/base"
                  className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                >
                  <FontAwesomeIcon icon={faChessBoard} />
                  <span>My Bases</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hover:text-yellow-400 transition-colors font-medium flex items-center gap-1.5 relative group"
                >
                  <FontAwesomeIcon icon={faUserShield} />
                  <span>Admin</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </div>

            {/* User area (auth buttons or profile) */}
            <div className="flex items-center ml-4">
              {isSignedIn ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 text-gray-900 shadow-md hover:shadow-yellow-400/30">
                    <FontAwesomeIcon icon={user?.role === 'admin' ? faUserShield : faUser} />
                    <span className="font-medium">{user?.username || 'User'}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl shadow-lg bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-white/10 p-2 transform opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 invisible group-hover:visible overflow-hidden">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-white rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faUserShield} className="w-4" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/faq"
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-white rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} className="w-4" />
                      <span className="font-medium">Help & FAQ</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-white rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors mt-1 border-t border-white/10 pt-2"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/sign-in"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-yellow-400/30"
                  >
                    <FontAwesomeIcon icon={faRightToBracket} />
                    <span className="font-semibold">Sign In</span>
                  </Link>
                  <Link
                    to="/sign-up"
                    className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-white transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
              <ThemeToggle className="ml-3" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white text-2xl p-2 z-50 relative"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon 
              icon={mobileMenuOpen ? faTimes : faBars} 
              className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}
            />
          </button>
        </nav>
      </div>

      {/* Mobile Menu - Fixed positioning with improved styling */}
      <div 
        className={`lg:hidden fixed inset-0 pt-16 bg-gradient-to-b from-gray-900/95 to-gray-700/95 backdrop-blur-xl z-40 h-screen transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="container mx-auto px-4 h-full flex flex-col">
          <div className="flex flex-col space-y-3 text-white text-lg py-6 flex-grow">
            {/* Navigation links */}
            {currentPath !== '/' && (
              <Link to="/" className="mobile-nav-link">
                <FontAwesomeIcon icon={faHome} className="w-5" />
                <span>Home</span>
              </Link>
            )}
            
            {currentPath === '/' && (
              <>
                <a href="#search" onClick={closeMobileMenu} className="mobile-nav-link">
                  <FontAwesomeIcon icon={faSearch} className="w-5" />
                  <span>Search</span>
                </a>
                <a href="#features" onClick={closeMobileMenu} className="mobile-nav-link">
                  <FontAwesomeIcon icon={faListCheck} className="w-5" />
                  <span>Features</span>
                </a>
                <a href="#guides" onClick={closeMobileMenu} className="mobile-nav-link">
                  <FontAwesomeIcon icon={faBookOpen} className="w-5" />
                  <span>Guides</span>
                </a>
              </>
            )}

            {user && (
              <Link to="/base" onClick={closeMobileMenu} className="mobile-nav-link">
                <FontAwesomeIcon icon={faChessBoard} className="w-5" />
                <span>My Bases</span>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" onClick={closeMobileMenu} className="mobile-nav-link">
                <FontAwesomeIcon icon={faUserShield} className="w-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* User section at bottom */}
          <div className="py-6 border-t border-white/10">
            {isSignedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900">
                    <FontAwesomeIcon icon={user?.role === 'admin' ? faUserShield : faUser} className="text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user?.username || 'User'}</div>
                    <div className="text-xs text-white/60">{user?.email || ''}</div>
                  </div>
                </div>
                <button
                  onClick={() => { handleSignOut(); closeMobileMenu(); }}
                  className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white hover:from-red-500/30 hover:to-orange-500/30 rounded-xl transition-colors font-medium border border-white/10"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="text-red-400 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/sign-in" onClick={closeMobileMenu} className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-500 hover:to-amber-600 transition-all">
                  <FontAwesomeIcon icon={faRightToBracket} />
                  <span>Sign In</span>
                </Link>
                <Link to="/sign-up" onClick={closeMobileMenu} className="flex justify-center items-center gap-3 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20">
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Theme toggle at the bottom */}
          <div className="py-4 flex justify-center border-t border-white/10">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Add a global style for mobile nav links */}
      <style jsx="true">{`
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
          background-color: rgba(255, 255, 255, 0.05);
          margin-bottom: 0.5rem;
        }
        .mobile-nav-link:hover, .mobile-nav-link:focus {
          background-color: rgba(255, 255, 255, 0.1);
          color: #FBBF24;
        }
      `}</style>
    </header>
  );
};

export default Header;