const Button = ({ text, onClick, type = "primary" }) => {
  const styles = {
    primary: {
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "#fff",
    },

    secondary: {
      background: "#fff",
      color: "#2563eb",
      border: "2px solid #2563eb",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px 28px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "16px",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
        width: "100%",
        maxWidth: "220px",
        ...styles[type],
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
      }}
    >
      {text}
    </button>
  );
};

export default Button;