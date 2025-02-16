import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ComparacionEjercitos from './components/ComparacionEjercitos';
import AbilityTester from './pages/AbilityTester';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto py-4">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/spearhead" element={<ComparacionEjercitos />} />
            <Route path="/ability-tester" element={<AbilityTester />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 