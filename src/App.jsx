import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public site
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HeroSection from './components/Home/HeroSection';
import AboutSection from './components/Home/AboutSection';
import ServicesGrid from './components/Home/ServicesGrid';
import GallerySection from './components/Home/GallerySection';
import TikTokFeed from './components/Home/TikTokFeed';
import Testimonials from './components/Home/Testimonials';
import BookingSection from './components/Home/BookingSection';
import LocationSection from './components/Home/LocationSection';
import WhatsAppFloat from './components/UI/WhatsAppFloat';

// Admin
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import AdminGuard from './components/Admin/AdminGuard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCitas from './pages/admin/AdminCitas';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminServicios from './pages/admin/AdminServicios';
import AdminIngresos from './pages/admin/AdminIngresos';
import AdminHorario from './pages/admin/AdminHorario';
import AdminClientas from './pages/admin/AdminClientas';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AcceptInvite from './pages/admin/AcceptInvite';
import ConfirmarCita from './pages/public/ConfirmarCita';
import CancelarCita from './pages/public/CancelarCita';

function PublicSite() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesGrid />
        <GallerySection />
        <TikTokFeed />
        <Testimonials />
        <LocationSection />
        <BookingSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicSite />} />

          {/* Confirmación / Cancelación pública */}
          <Route path="/cita/confirmar" element={<ConfirmarCita />} />
          <Route path="/cita/cancelar"  element={<CancelarCita />} />

          {/* Accept invite (public — sets password after email invite) */}
          <Route path="/admin/accept-invite" element={<AcceptInvite />} />

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin panel (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="citas" element={<AdminCitas />} />
            <Route path="calendario" element={<AdminCalendar />} />
            <Route path="servicios"  element={<AdminGuard><AdminServicios /></AdminGuard>} />
            <Route path="ingresos"   element={<AdminGuard><AdminIngresos /></AdminGuard>} />
            <Route path="horario"    element={<AdminGuard><AdminHorario /></AdminGuard>} />
            <Route path="clientas"   element={<AdminClientas />} />
            <Route path="usuarios"   element={<AdminGuard><AdminUsuarios /></AdminGuard>} />
            <Route path="settings"   element={<AdminGuard superAdminOnly><AdminSettings /></AdminGuard>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
