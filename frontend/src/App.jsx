import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import Vaccinations from './pages/Vaccinations';
import VetLocator from './pages/VetLocator';
import FarmAnimals from './pages/FarmAnimals';
import ImageDetection from './pages/ImageDetection';
import Doctors from './pages/Doctors';
import Consultations from './pages/Consultations';

// Dummy protection for now. We will replace with real context if needed, or simple localStorage check.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes inside Layout */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="ai-checker" element={<SymptomChecker />} />
          <Route path="image-scan" element={<ImageDetection />} />
          <Route path="vaccinations" element={<Vaccinations />} />
          <Route path="farm" element={<FarmAnimals />} />
          <Route path="locator" element={<VetLocator />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="consultations" element={<Consultations />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
