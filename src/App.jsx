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

// Voice Mental Health Assessment
import VoiceAssessment from "./pages/VoiceAssessment";

// Emergency / Crisis Support
import EmergencySupport from "./pages/EmergencySupport";

// Victim / Witness Protection Support
import ProtectionSupport from "./pages/ProtectionSupport";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTP from "./pages/OTP";

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

      {/* ================= NAVBAR ================= */}

      <Navbar />

      <Routes>

        {/* ================= MAIN PAGES ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/health"
          element={<Health />}
        />

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
          path="/LiveChat"
          element={<LiveChat />}
        />

        {/* ================= AI MENTAL HEALTH ASSESSMENT ================= */}

        <Route
          path="/assessment"
          element={<Assessment />}
        />

        {/* ================= VOICE ASSESSMENT ================= */}

        <Route
          path="/voice-assessment"
          element={<VoiceAssessment />}
        />

        {/* ================= VICTIM / WITNESS PROTECTION ================= */}

        <Route
          path="/protection-support"
          element={<ProtectionSupport />}
        />

        {/* ================= EMERGENCY / CRISIS SUPPORT ================= */}

        <Route
          path="/emergency-support"
          element={<EmergencySupport />}
        />

        {/* ================= PROGRESS / MONITORING ================= */}

        <Route
          path="/progress"
          element={<Progress />}
        />

        {/* ================= ARTICLES ================= */}

        <Route
          path="/articles"
          element={<Articles />}
        />

        {/* ================= COMMUNITY ================= */}

        <Route
          path="/community"
          element={<Community />}
        />

        {/* ================= CONTACT ================= */}

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

        {/* ================= OTP VERIFICATION ================= */}

        <Route
          path="/verify-otp"
          element={<OTP />}
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

        {/* ================= ADMIN DASHBOARD ================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;