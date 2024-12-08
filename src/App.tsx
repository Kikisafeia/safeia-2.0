import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Hero from './components/Hero'
import Features from './components/Features'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import HerramientasSST from './pages/HerramientasSST'
import PTS from './pages/PTS'
import Audit from './pages/Audit'
import Legal from './pages/Legal'
import Investigation from './pages/Investigation'
import RiskMatrix from './pages/RiskMatrix'
import Tools from './pages/Tools'
import ATS from './pages/ATS'
import RiskMap from './pages/RiskMap'
import Recomendaciones from './pages/Recomendaciones'
import SGSSTPymes from './pages/SGSSTPymes'
import CheckList from './pages/CheckList'
import FODA from './pages/FODA'
import CharlaSeguridadGenerator from './pages/CharlaSeguridadGenerator'
import InspeccionesGenerator from './pages/InspeccionesGenerator'
import InvestigacionAccidentes from './pages/InvestigacionAccidentes'
import ObligacionInformar from './pages/ObligacionInformar'
import Politicas from './pages/Politicas'
import IndiceUV from './pages/herramientas-sst/indice-uv'
import ComoFunciona from './pages/ComoFunciona'
import AgentesEspecializados from './pages/AgentesEspecializados'
import ProtectedRoute from './components/ProtectedRoute'
import AuthComponent from './components/auth/AuthComponent'
import PrivateRoute from './components/auth/PrivateRoute'
import Profile from './components/Profile'
import Layout from './components/layout/Layout'
import Privacidad from './pages/Privacidad'
import Terminos from './pages/Terminos'
import Planes from './pages/Planes'

function App() {
  console.log('App: Rendering...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<AuthComponent />} />
            <Route path="/register" element={<AuthComponent />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/antecedentes" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/agentes-especializados" 
              element={
                <PrivateRoute>
                  <AgentesEspecializados />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tools" 
              element={
                <PrivateRoute>
                  <Tools />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst" 
              element={
                <PrivateRoute>
                  <HerramientasSST />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/pts" 
              element={
                <PrivateRoute>
                  <PTS />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/recomendaciones" 
              element={
                <PrivateRoute>
                  <Recomendaciones />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/sgsst-pymes" 
              element={
                <PrivateRoute>
                  <SGSSTPymes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/ats" 
              element={
                <PrivateRoute>
                  <ATS />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/foda" 
              element={
                <PrivateRoute>
                  <FODA />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/charla" 
              element={
                <PrivateRoute>
                  <CharlaSeguridadGenerator />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/checklist" 
              element={
                <PrivateRoute>
                  <CheckList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/inspecciones" 
              element={
                <PrivateRoute>
                  <InspeccionesGenerator />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/investigacion" 
              element={
                <PrivateRoute>
                  <InvestigacionAccidentes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/obligacion-informar" 
              element={
                <PrivateRoute>
                  <ObligacionInformar />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/politicas" 
              element={
                <PrivateRoute>
                  <Politicas />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/indice-uv" 
              element={
                <PrivateRoute>
                  <IndiceUV />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/matriz-riesgos" 
              element={
                <PrivateRoute>
                  <RiskMatrix />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/mapa-riesgos" 
              element={
                <PrivateRoute>
                  <RiskMap />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/planes-sst" 
              element={
                <PrivateRoute>
                  <Tools type="planes-sst" />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/herramientas-sst/asistente-pts" 
              element={
                <PrivateRoute>
                  <Tools type="asistente-pts" />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/como-funciona" 
              element={
                <PrivateRoute>
                  <ComoFunciona />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/audit" 
              element={
                <PrivateRoute>
                  <Audit />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/legal" 
              element={
                <PrivateRoute>
                  <Legal />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/ats" 
              element={
                <PrivateRoute>
                  <ATS />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/planes" 
              element={
                <PrivateRoute>
                  <Planes />
                </PrivateRoute>
              } 
            />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route 
              path="/" 
              element={<Navigate to="/dashboard/antecedentes" replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to="/dashboard/antecedentes" replace />} 
            />
          </Routes>
          <Footer />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App
