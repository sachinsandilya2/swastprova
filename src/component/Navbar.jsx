import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logoContainer}>
        <img
          src="/logo.png"
          alt="Swastprova Logo"
          style={styles.logo}
        />

        <div>
          <h2 style={styles.brand}>Swastprova</h2>
          <p style={styles.tagline}>You Are Not Alone</p>
        </div>
      </Link>

      <div style={styles.menu}>
        <Link to="/" style={styles.link}>
          Home
        </Link>

        <Link to="/contact" style={styles.link}>
          Contact
        </Link>

        <Link to="/login">
          <button style={styles.loginBtn}>Login</button>
        </Link>

        <Link to="/register">
          <button style={styles.signupBtn}>Sign Up</button>
        </Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "12px 24px",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
  },

  logo: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #3b82f6",
  },

  brand: {
    margin: 0,
    color: "#fff",
    fontSize: "24px",
    fontWeight: "700",
  },

  tagline: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "12px",
  },

  menu: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
  },

  loginBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "2px solid #3b82f6",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },

  signupBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Navbar;