
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./component/Navbar";

import Home from "./pages/Home";
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
      <Navbar />

      <Routes>
        {/* Step 1 */}
        <Route path="/" element={<Home />} />

        {/* Step 2 */}
        <Route path="/health" element={<Health />} />

        {/* Health Services */}
        <Route path="/live-chat" element={<LiveChat />} />
        <Route path="/mental-health" element={<MentalHealth />} />
        <Route path="/psychologists" element={<Psychologists />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/community" element={<Community />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
