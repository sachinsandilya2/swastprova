import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">S</span>
          <span>Swastprova</span>
        </Link>

        {/* NAVIGATION */}
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/health">Health</Link>
          <Link to="/psychologists">Psychologists</Link>
          <Link to="/mentors">Mentors</Link>
        </div>

        {/* BUTTON */}
        <Link to="/psychologists" className="navbar-button">
          Get Support
        </Link>

      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;

          width: 100%;

          background: rgba(255, 255, 255, 0.88);

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

          gap: 25px;
        }

        /* LOGO */

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;

          text-decoration: none;

          color: #0f172a;

          font-size: 1.3rem;
          font-weight: 800;
        }

        .logo-icon {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
          );

          color: white;

          font-size: 1.2rem;

          box-shadow:
            0 7px 20px rgba(37, 99, 235, 0.2);
        }

        /* LINKS */

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .navbar-links a {
          position: relative;

          text-decoration: none;

          color: #475569;

          font-size: 0.92rem;
          font-weight: 600;

          transition: color 0.25s ease;
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

        /* BUTTON */

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

        /* MOBILE */

        @media (max-width: 800px) {
          .navbar-container {
            padding: 12px 16px;
          }

          .navbar-links {
            display: none;
          }

          .navbar-button {
            padding: 9px 14px;
            font-size: 0.8rem;
          }

          .navbar-logo {
            font-size: 1.1rem;
          }

          .logo-icon {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;