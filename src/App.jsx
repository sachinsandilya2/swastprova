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
import Progress from "./pages/Progress";
import Articles from "./pages/Articles";
import Community from "./pages/Community";
import Contact from "./pages/Contact";

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

        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/health" element={<Health />} />

        {/* Health Services */}
        <Route path="/mental-health" element={<MentalHealth />} />
        <Route path="/psychologists" element={<Psychologists />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/progress" element={<Progress />} />

        {/* Community */}
        <Route path="/articles" element={<Articles />} />
        <Route path="/community" element={<Community />} />
        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Provider Registration */}
        <Route
          path="/mentor-register"
          element={<MentorRegister />}
        />

        <Route
          path="/psychologist-register"
          element={<PsychologistRegister />}
        />

        {/* Book Session */}
        <Route
          path="/book-session"
          element={<BookSession />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;