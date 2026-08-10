import { BrowserRouter, Routes, Route } from "react-router-dom";

// IMPORTANT: components hai, component nahi
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Health from "./pages/Health";
import LiveChat from "./pages/LiveChat";
import MentalHealth from "./pages/MentalHealth";
import Psychologists from "./pages/Psychologists";
import Mentors from "./pages/Mentors";
import Progress from "./pages/Progress";
import Articles from "./pages/Articles";
import Community from "./pages/Community";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
        <Route path="/live-chat" element={<LiveChat />} />
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

      </Routes>

    </BrowserRouter>
  );
}

export default App;