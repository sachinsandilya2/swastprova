import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      alert(data.message);

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      alert("Server Error");
      console.log(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#dbeafe,#ffe4ec)",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            fontSize: "3rem",
          }}
        >
          📞 Contact Us
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "1.1rem",
            marginBottom: "40px",
          }}
        >
          We'd love to hear from you. Reach out to the
          Swastprova team.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(350px,1fr))",
            gap: "25px",
          }}
        >
          {/* Contact Info */}
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h2>📧 Contact Information</h2>

            <p>
              <strong>Email:</strong>
            </p>

            <p
              style={{
                color: "#2563eb",
                fontWeight: "600",
              }}
            >
              swastprova@gmail.com
            </p>

            <p>
              <strong>Support:</strong>
            </p>

            <p>
              Mental Health Awareness & Mentorship
            </p>

            <p>
              <strong>Community:</strong>
            </p>

            <p>
              24×7 Learning & Support Platform
            </p>
          </div>

          {/* Contact Form */}
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow:
                "0 10px 20px rgba(0,0,0,0.08)",
            }}
          >
            <h2>📝 Send Message</h2>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                }}
                required
              />

              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                }}
                required
              />

              <textarea
                rows="5"
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                }}
                required
              />

              <button
                type="submit"
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
          }}
        >
          <a
            href="mailto:swastprova@gmail.com"
            style={{
              textDecoration: "none",
              background: "#ec4899",
              color: "white",
              padding: "14px 24px",
              borderRadius: "12px",
              fontWeight: "600",
            }}
          >
            📧 Email Swastprova
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;