import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public site — above the fold: eager; below the fold: lazy (code splitting)
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HeroSection from './components/Home/HeroSection';
const AboutSection   = lazy(() => import('./components/Home/AboutSection'));
const ServicesGrid   = lazy(() => import('./components/Home/ServicesGrid'));
const GallerySection = lazy(() => import('./components/Home/GallerySection'));
const TikTokFeed     = lazy(() => import('./components/Home/TikTokFeed'));
const Testimonials   = lazy(() => import('./components/Home/Testimonials'));
const LocationSection = lazy(() => import('./components/Home/LocationSection'));
const BookingSection = lazy(() => import('./components/Home/BookingSection'));
const WhatsAppFloat  = lazy(() => import('./components/UI/WhatsAppFloat'));
const MobileBookingCTA = lazy(() => import('./components/UI/MobileBookingCTA'));

// Theme
import { ThemeProvider } from './context/ThemeContext';

// Admin — lazy loaded (no se descargan al visitar el sitio público)
import { AuthProvider } from './context/AuthContext';
const ProtectedRoute  = lazy(() => import('./components/Admin/ProtectedRoute'));
const AdminGuard      = lazy(() => import('./components/Admin/AdminGuard'));
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout     = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCitas      = lazy(() => import('./pages/admin/AdminCitas'));
const AdminSettings   = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCalendar   = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminServicios   = lazy(() => import('./pages/admin/AdminServicios'));
const AdminPromociones = lazy(() => import('./pages/admin/AdminPromociones'));
const AdminIngresos    = lazy(() => import('./pages/admin/AdminIngresos'));
const AdminHorario    = lazy(() => import('./pages/admin/AdminHorario'));
const AdminClientas   = lazy(() => import('./pages/admin/AdminClientas'));
const AdminUsuarios   = lazy(() => import('./pages/admin/AdminUsuarios'));
const AcceptInvite    = lazy(() => import('./pages/admin/AcceptInvite'));
const ConfirmarCita   = lazy(() => import('./pages/public/ConfirmarCita'));
const CancelarCita    = lazy(() => import('./pages/public/CancelarCita'));
const Gracias         = lazy(() => import('./pages/public/Gracias'));

function PublicSite() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
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
      <MobileBookingCTA />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<PublicSite />} />

            {/* Confirmación / Cancelación pública */}
            <Route path="/confirmar" element={<ConfirmarCita />} />
            <Route path="/cancelar"  element={<CancelarCita />} />
            <Route path="/gracias"   element={<Gracias />} />

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
              <Route path="servicios"   element={<AdminGuard><AdminServicios /></AdminGuard>} />
              <Route path="promociones" element={<AdminGuard><AdminPromociones /></AdminGuard>} />
              <Route path="ingresos"    element={<AdminGuard><AdminIngresos /></AdminGuard>} />
              <Route path="horario"    element={<AdminGuard><AdminHorario /></AdminGuard>} />
              <Route path="clientas"   element={<AdminClientas />} />
              <Route path="usuarios"   element={<AdminGuard><AdminUsuarios /></AdminGuard>} />
              <Route path="settings"   element={<AdminGuard superAdminOnly><AdminSettings /></AdminGuard>} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
