
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";

// Main Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Health from "./pages/Health";
import MentalHealth from "./pages/MentalHealth";
import Psychologists from "./pages/Psychologists";
import Mentors from "./pages/Mentors";
import LiveChat from "./pages/LiveChat";
import Progress from "./pages/Progress";
import Articles from "./pages/Articles";
import Community from "./pages/Community";
import Contact from "./pages/Contact";

// AI Mental Health Assessment
import Assessment from "./pages/Assessment";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Provider Registration
import MentorRegister from "./pages/MentorRegister";
import PsychologistRegister from "./pages/PsychologistRegister";

// Booking
import BookSession from "./pages/BookSession";

// Admin
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <BrowserRouter>

      {/* Navbar */}
      <Navbar />

      <Routes>

        {/* ================= MAIN PAGES ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/health" element={<Health />} />

        <Route
          path="/mental-health"
          element={<MentalHealth />}
        />

        <Route
          path="/psychologists"
          element={<Psychologists />}
        />

        <Route
          path="/mentors"
          element={<Mentors />}
        />

        {/* ================= LIVE CHAT ================= */}

        <Route
          path="/livechat"
          element={<LiveChat />}
        />

        {/* ================= AI ASSESSMENT ================= */}

        <Route
          path="/assessment"
          element={<Assessment />}
        />

        {/* ================= PROGRESS ================= */}

        <Route
          path="/progress"
          element={<Progress />}
        />

        {/* ================= COMMUNITY ================= */}

        <Route
          path="/articles"
          element={<Articles />}
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* ================= AUTHENTICATION ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================= PROVIDER REGISTRATION ================= */}

        <Route
          path="/mentor-register"
          element={<MentorRegister />}
        />

        <Route
          path="/psychologist-register"
          element={<PsychologistRegister />}
        />

        {/* ================= BOOKING ================= */}

        <Route
          path="/book-session"
          element={<BookSession />}
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

