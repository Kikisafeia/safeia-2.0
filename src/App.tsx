import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NetworkStatus from './components/NetworkStatus'
// AuthProvider is now only in main.tsx
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import HerramientasSST from './pages/HerramientasSST'
import AuthComponent from './components/auth/AuthComponent'
import PrivateRoute from './components/auth/PrivateRoute'
import { useAuth } from './contexts/AuthContext'
import CompanyProfileForm from './components/CompanyProfileForm'
import Pricing from './pages/Pricing';
import AdminSubscriptions from './pages/AdminSubscriptions';
import ResetTokens from './pages/ResetTokens';

// Importar los componentes de las herramientas
import SGSSTPymes from './pages/SGSSTPymes'
import RiskMatrix from './pages/RiskMatrix'
import RiskMap from './pages/RiskMap'
import PTS from './pages/PTS'
import ATS from './pages/ATS'
import CheckList from './pages/CheckList'
import InspeccionesGenerator from './pages/InspeccionesGenerator'
import Investigation from './pages/Investigation'
import CharlaSeguridadGenerator from './pages/CharlaSeguridadGenerator'
import ObligacionInformar from './pages/ObligacionInformar'
import AgentesEspecializados from './pages/AgentesEspecializados'
import IndiceUV from './pages/IndiceUV'
import FODA from './pages/FODA'
import Recomendaciones from './pages/Recomendaciones'
import Audit from './pages/Audit'
import Politicas from './pages/Politicas'
import Legal from './pages/Legal'
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner

// Componente para manejar rutas públicas
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, initialLoading } = useAuth(); // Add initialLoading check
  
  if (initialLoading) {
    // Render loading indicator while checking auth state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (currentUser) {
    console.log('Usuario autenticado intentando acceder a ruta pública, redirigiendo...');
    return <Navigate to="/herramientas-sst" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <NetworkStatus />
      {/* AuthProvider has been removed from here; it's now solely in main.tsx */}
      <Routes>
        {/* Ruta principal - Landing Page */}
        <Route path="/" element={
            <PublicRoute>
              <div>
                <Navbar />
                <Hero />
                <Footer />
              </div>
            </PublicRoute>
          } />

          {/* Rutas de autenticación */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthComponent type="login" key="login" />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <AuthComponent type="register" key="register" />
            </PublicRoute>
          } />

          {/* Rutas protegidas */}
          <Route element={
            <>
              <Navbar />
              <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Outlet />
                </div>
              </div>
              <Footer />
            </>
          }>
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/herramientas-sst" element={
              <PrivateRoute>
                <HerramientasSST />
              </PrivateRoute>
            } />

            <Route path="/company-profile" element={
              <PrivateRoute>
                <CompanyProfileForm />
              </PrivateRoute>
            } />

            {/* /pricing route removed from protected layout block - defined as standalone public route below */}

            {/* Gestión de SST */}
            <Route path="/herramientas-sst/sgsst-pymes" element={
              <PrivateRoute>
                <SGSSTPymes />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/audit" element={
              <PrivateRoute>
                <Audit />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/politicas" element={
              <PrivateRoute>
                <Politicas />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/legal" element={
              <PrivateRoute>
                <Legal />
              </PrivateRoute>
            } />

            {/* Prevención de Riesgos */}
            <Route path="/herramientas-sst/risk-matrix" element={
              <PrivateRoute>
                <RiskMatrix />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/risk-map" element={
              <PrivateRoute>
                <RiskMap />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/pts" element={
              <PrivateRoute>
                <PTS />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/ats" element={
              <PrivateRoute>
                <ATS />
              </PrivateRoute>
            } />

            {/* Inspecciones y Controles */}
            <Route path="/herramientas-sst/checklist" element={
              <PrivateRoute>
                <CheckList />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/inspecciones-generator" element={
              <PrivateRoute>
                <InspeccionesGenerator />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/investigation" element={
              <PrivateRoute>
                <Investigation />
              </PrivateRoute>
            } />

            {/* Capacitación y Comunicación */}
            <Route path="/herramientas-sst/charlas-generator" element={
              <PrivateRoute>
                <CharlaSeguridadGenerator />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/obligacion-informar" element={
              <PrivateRoute>
                <ObligacionInformar />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/agentes-especializados" element={
              <PrivateRoute>
                <AgentesEspecializados />
              </PrivateRoute>
            } />

            {/* Monitoreo y Análisis */}
            <Route path="/herramientas-sst/indice-uv" element={
              <PrivateRoute>
                <IndiceUV />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/foda" element={
              <PrivateRoute>
                <FODA />
              </PrivateRoute>
            } />
            <Route path="/herramientas-sst/recomendaciones" element={
              <PrivateRoute>
                <Recomendaciones />
              </PrivateRoute>
            } />

            <Route path="/admin/subscriptions" element={
              <PrivateRoute>
                <AdminSubscriptions />
              </PrivateRoute>
            } />

            <Route path="/reset-tokens" element={
              <PrivateRoute>
                <ResetTokens />
              </PrivateRoute>
            } />
          </Route>

          <Route path="/pricing" element={
            <>
              <Navbar />
              <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Pricing />
                </div>
              </div>
              <Footer />
            </>
          } />

          {/* Ruta por defecto - Redirige a la landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      {/* AuthProvider has been removed from here; it's now solely in main.tsx */}
    </Router>
  )
}

export default App
