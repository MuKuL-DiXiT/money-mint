import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AddEntry from "./components/AddEntryModal";
import Plan from "./components/Plan";
import AllPlan from "./components/allplans";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/add" element={
          <PrivateRoute><AddEntry /></PrivateRoute>
        } />
        
        <Route path="/createplan" element={
          <PrivateRoute><Plan /></PrivateRoute>
        } />
        <Route path="/allplans" element={
          <PrivateRoute><AllPlan /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}
