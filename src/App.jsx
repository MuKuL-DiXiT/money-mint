import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AddEntry from "./components/AddEntryModal";
import Plan from "./components/Plan";
import AllPlan from "./components/allplans";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { useState } from "react";

export default function App() {
  const [dark, setDark] = useState(true);
  return (
    <>
      <Navbar dark = {dark} setDark = {setDark} />
      <Routes>
        <Route path="/" element={<Home dark = {dark}/>} />
        <Route path="/login" element={<Login dark = {dark}/>} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard dark = {dark}/></PrivateRoute>
        } />
        <Route path="/add" element={
          <PrivateRoute><AddEntry dark = {dark}/></PrivateRoute>
        } />
        
        <Route path="/createplan" element={
          <PrivateRoute><Plan dark = {dark}/></PrivateRoute>
        } />
        <Route path="/allplans" element={
          <PrivateRoute><AllPlan dark = {dark}/></PrivateRoute>
        } />
      </Routes>
    </>
  );
}
