import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <main>
                <Hero />
                <Features />
              </main>
              <Footer />
            </div>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/agentes-especializados" 
          element={
            <ProtectedRoute>
              <AgentesEspecializados />
            </ProtectedRoute>
          } 
        />
        <Route path="/herramientas-sst" element={<HerramientasSST />} />
        <Route path="/herramientas-sst/pts" element={<PTS />} />
        <Route path="/herramientas-sst/recomendaciones" element={<Recomendaciones />} />
        <Route path="/herramientas-sst/sgsst-pymes" element={<SGSSTPymes />} />
        <Route path="/herramientas-sst/ats" element={<ATS />} />
        <Route path="/herramientas-sst/foda" element={<FODA />} />
        <Route path="/herramientas-sst/charla" element={<CharlaSeguridadGenerator />} />
        <Route path="/herramientas-sst/checklist" element={<CheckList />} />
        <Route path="/herramientas-sst/inspecciones" element={<InspeccionesGenerator />} />
        <Route path="/herramientas-sst/investigacion" element={<InvestigacionAccidentes />} />
        <Route path="/herramientas-sst/obligacion-informar" element={<ObligacionInformar />} />
        <Route path="/herramientas-sst/politicas" element={<Politicas />} />
        <Route path="/herramientas-sst/indice-uv" element={<IndiceUV />} />
        <Route path="/herramientas-sst/matriz-riesgos" element={<RiskMatrix />} />
        <Route path="/herramientas-sst/mapa-riesgos" element={<RiskMap />} />
        <Route path="/herramientas-sst/planes-sst" element={<Tools type="planes-sst" />} />
        <Route path="/herramientas-sst/asistente-pts" element={<Tools type="asistente-pts" />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/ats" element={<ATS />} />
      </Routes>
    </Router>
  )
}

export default App
