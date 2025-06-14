// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import GlobalView from "./pages/GlobalView";
import Dashboard from "./Dashboard";
import Analytics from './Analytics';
import Login from "./Login";
import About from './pages/About';
import React, { createContext, useContext, useState } from 'react';


function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Homepage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/global-view" element={<GlobalView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
}

const SceneContext = createContext();

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};


export default function App() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div style={{ backgroundColor: "#0d0d0d", color: "#fff", minHeight: "100vh" }}>
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}