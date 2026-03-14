import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import ElegantButton from '../UI/ElegantButton';
import { useTheme } from '../../context/ThemeContext';
import { scrollToSection } from '../../lib/scrollTo';

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
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToReservar = () => {
    setIsMenuOpen(false);
    scrollToSection('reservar');
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-pink-sm border-b border-pink-100 dark:border-gray-700'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
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
              loading="eager"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-poppins text-xs font-medium tracking-widest text-gray-500 dark:text-gray-400 hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-200 focus:outline-none focus:text-pink-400"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: theme toggle + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 cursor-pointer"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <ElegantButton onClick={scrollToReservar} size="default">
              RESERVAR CITA
            </ElegantButton>
          </div>

          {/* Mobile: theme toggle + menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 cursor-pointer"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="p-2 text-pink-400 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-lg transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav
            className="lg:hidden border-t border-pink-100 dark:border-gray-700 py-4 animate-slide-down"
            aria-label="Menú móvil"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-poppins text-sm font-medium tracking-wide text-gray-600 dark:text-gray-300 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:text-pink-400 cursor-pointer"
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
