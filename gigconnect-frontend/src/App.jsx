import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import Navbar from "./components/layout/Navbar";

function App() {
  return (
    <Routes>
      <Route path="/" element={
      <Navbar>
      <Landing />
      </Navbar>
      } />
      <Route path="/login" element={
      <Navbar>
      <Login />
      </Navbar>
      } />
      <Route path="/register" element={
      <Navbar>
      <Register />
      </Navbar>
      } />
      <Route path="/freelancer/dashboard" element={
      <Navbar>
      <FreelancerDashboard />
      </Navbar>
      } />
    </Routes>
  );
}

export default App;
