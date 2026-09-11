import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png.jpg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Swastprova Logo" />
          <span>Swastprova</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/health">Health</Link>
          <Link to="/psychologists">Psychologists</Link>
          <Link to="/mentors">Mentors</Link>

          <Link to="/liveChat" className="live-chat-link">
            💬 Live Chat
          </Link>

          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/register" className="register-link">
            Register
          </Link>
        </div>

        {/* DESKTOP GET SUPPORT */}
        <Link to="/psychologists" className="navbar-button">
          Get Support
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className={`mobile-menu-button ${
            menuOpen ? "menu-open" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/health" onClick={closeMenu}>
          Health
        </Link>

        <Link to="/psychologists" onClick={closeMenu}>
          Psychologists
        </Link>

        <Link to="/mentors" onClick={closeMenu}>
          Mentors
        </Link>

        <Link
          to="/liveChat"
          className="mobile-live-chat"
          onClick={closeMenu}
        >
          💬 Live Chat
        </Link>

        <Link
          to="/login"
          className="mobile-login"
          onClick={closeMenu}
        >
          Login
        </Link>

        <Link
          to="/register"
          className="mobile-register"
          onClick={closeMenu}
        >
          Register
        </Link>

        <Link
          to="/psychologists"
          className="mobile-support"
          onClick={closeMenu}
        >
          Get Support
        </Link>
      </div>

      <style>{`
        /* ================= NAVBAR ================= */

        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-bottom: 1px solid #e2e8f0;
        }

        .navbar-container {
          max-width: 1200px;
          margin: auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* ================= LOGO ================= */

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #0f172a;
          font-size: 1.3rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .navbar-logo img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 10px;
        }

        /* ================= DESKTOP LINKS ================= */

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .navbar-links a {
          position: relative;
          text-decoration: none;
          color: #475569;
          font-size: 0.88rem;
          font-weight: 600;
          transition: color 0.25s ease;
          white-space: nowrap;
        }

        .navbar-links a:hover {
          color: #2563eb;
        }

        .navbar-links a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 2px;
          border-radius: 10px;

          background: linear-gradient(
            90deg,
            #2563eb,
            #7c3aed
          );

          transition: width 0.25s ease;
        }

        .navbar-links a:hover::after {
          width: 100%;
        }

        /* ================= LIVE CHAT ================= */

        .live-chat-link {
          color: #2563eb !important;
          font-weight: 800 !important;
        }

        .live-chat-link:hover {
          color: #7c3aed !important;
        }

        /* ================= LOGIN ================= */

        .login-link {
          padding: 8px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          color: #0f172a !important;
          transition: all 0.25s ease !important;
        }

        .login-link::after {
          display: none;
        }

        .login-link:hover {
          background: #f1f5f9;
          border-color: #2563eb;
          color: #2563eb !important;
        }

        /* ================= REGISTER ================= */

        .register-link {
          padding: 8px 14px;
          border-radius: 10px;

          background: #eff6ff;
          border: 1px solid #bfdbfe;

          color: #2563eb !important;
          font-weight: 800 !important;

          transition: all 0.25s ease !important;
        }

        .register-link::after {
          display: none;
        }

        .register-link:hover {
          background: #2563eb;
          border-color: #2563eb;
          color: white !important;
          transform: translateY(-1px);
        }

        /* ================= GET SUPPORT ================= */

        .navbar-button {
          padding: 11px 18px;
          border-radius: 12px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
          );

          color: white;

          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;

          white-space: nowrap;

          box-shadow:
            0 7px 20px rgba(37, 99, 235, 0.2);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .navbar-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 25px rgba(37, 99, 235, 0.3);
        }

        /* ================= MOBILE BUTTON ================= */

        .mobile-menu-button {
          display: none;
          width: 44px;
          height: 44px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #f8fafc;
          cursor: pointer;

          padding: 9px;

          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;

          transition: all 0.25s ease;
        }

        .mobile-menu-button:hover {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .mobile-menu-button span {
          display: block;
          width: 23px;
          height: 2.5px;
          border-radius: 10px;
          background: #1e293b;

          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        /* Hamburger → X */

        .mobile-menu-button.menu-open span:nth-child(1) {
          transform: translateY(7.5px) rotate(45deg);
        }

        .mobile-menu-button.menu-open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-button.menu-open span:nth-child(3) {
          transform: translateY(-7.5px) rotate(-45deg);
        }

        /* ================= MOBILE MENU ================= */

        .mobile-menu {
          display: none;
        }

        /* ================= TABLET ================= */

        @media (max-width: 950px) {

          .navbar-container {
            padding: 12px 16px;
          }

          .navbar-links {
            gap: 12px;
          }

          .navbar-links a {
            font-size: 0.78rem;
          }

          .login-link,
          .register-link {
            padding: 7px 10px;
          }

          .navbar-button {
            padding: 9px 13px;
            font-size: 0.78rem;
          }
        }

        /* ================= PHONE ================= */

        @media (max-width: 800px) {

          .navbar-container {
            padding: 10px 15px;
          }

          .navbar-links,
          .navbar-button {
            display: none;
          }

          .navbar-logo {
            font-size: 1.1rem;
          }

          .navbar-logo img {
            width: 36px;
            height: 36px;
          }

          .mobile-menu-button {
            display: flex;
          }

          .mobile-menu {
            display: flex;

            max-height: 0;
            overflow: hidden;
            opacity: 0;

            flex-direction: column;

            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);

            border-top: 1px solid transparent;

            padding: 0 16px;

            transition:
              max-height 0.35s ease,
              opacity 0.25s ease,
              padding 0.35s ease,
              border-color 0.25s ease;
          }

          .mobile-menu.show {
            max-height: 600px;
            opacity: 1;

            padding: 12px 16px 18px;

            border-top: 1px solid #e2e8f0;
          }

          .mobile-menu a {
            display: block;

            padding: 13px 14px;
            margin: 3px 0;

            text-decoration: none;

            color: #334155;

            font-size: 0.95rem;
            font-weight: 650;

            border-radius: 10px;

            transition:
              background 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
          }

          .mobile-menu a:hover {
            background: #f1f5f9;
            color: #2563eb;
            transform: translateX(3px);
          }

          /* Live Chat */

          .mobile-menu .mobile-live-chat {
            color: #2563eb;
            font-weight: 800;
          }

          /* Login */

          .mobile-menu .mobile-login {
            margin-top: 8px;

            border: 1px solid #cbd5e1;

            color: #0f172a;
            text-align: center;
          }

          .mobile-menu .mobile-login:hover {
            background: #f1f5f9;
            border-color: #2563eb;
          }

          /* Register */

          .mobile-menu .mobile-register {
            background: #eff6ff;
            border: 1px solid #bfdbfe;

            color: #2563eb;
            font-weight: 800;
            text-align: center;
          }

          .mobile-menu .mobile-register:hover {
            background: #2563eb;
            color: white;
          }

          /* Get Support */

          .mobile-menu .mobile-support {
            margin-top: 8px;

            background: linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

            color: white;

            font-weight: 700;
            text-align: center;

            box-shadow:
              0 7px 18px rgba(37, 99, 235, 0.2);
          }

          .mobile-menu .mobile-support:hover {
            color: white;

            transform: translateY(-1px);

            box-shadow:
              0 10px 22px rgba(37, 99, 235, 0.28);
          }
        }

        /* ================= SMALL PHONES ================= */

        @media (max-width: 380px) {

          .navbar-container {
            padding: 9px 12px;
          }

          .navbar-logo {
            font-size: 1rem;
          }

          .navbar-logo img {
            width: 34px;
            height: 34px;
          }

          .mobile-menu-button {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;