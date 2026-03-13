import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import ElegantButton from '../UI/ElegantButton';

const navLinks = [
  { href: '#inicio',    label: 'INICIO'    },
  { href: '#servicios', label: 'SERVICIOS' },
  { href: '#galeria',   label: 'GALERÍA'   },
  { href: '#tiktok',    label: 'TIKTOK'    },
  { href: '#reseñas',   label: 'RESEÑAS'   },
  { href: '#ubicacion', label: 'UBICACIÓN' },
  { href: '#reservar',  label: 'RESERVAR'  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToReservar = () => {
    setIsMenuOpen(false);
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-pink-sm border-b border-pink-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-3 md:py-4">

          {/* Logo */}
          <a
            href="#inicio"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-lg"
            aria-label="Luga Gy - Ir al inicio"
          >
            <img
              src="/logo.png"
              alt="Luga Gy"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-poppins text-xs font-medium tracking-widest text-gray-500 hover:text-pink-400 transition-colors duration-200 focus:outline-none focus:text-pink-400"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:block">
            <ElegantButton onClick={scrollToReservar} size="default">
              RESERVAR CITA
            </ElegantButton>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-pink-400 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav
            className="lg:hidden border-t border-pink-100 py-4 animate-slide-down"
            aria-label="Menú móvil"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-poppins text-sm font-medium tracking-wide text-gray-600 hover:text-pink-400 hover:bg-pink-50 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:text-pink-400 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="px-4 pt-3">
                <ElegantButton onClick={scrollToReservar} className="w-full justify-center">
                  RESERVAR CITA
                </ElegantButton>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
