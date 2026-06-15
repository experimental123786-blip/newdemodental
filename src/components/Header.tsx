import { useState } from 'react';
import { Calendar, Phone, Clock, Menu, X, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenBooking: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function Header({ onOpenBooking, activePage, setActivePage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: string) => {
    setMobileMenuOpen(false);
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Contact Details */}
      <div className="w-full bg-slate-900 px-4 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-teal-400" />
              <span className="font-semibold text-white">Emergency Hotline:</span> (555) 492-3800
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 3:00 PM</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-sm bg-teal-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-teal-300">
              <Shield className="h-3 w-3" /> ACA Accredited
            </div>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              <span className="text-[11px] font-bold text-white leading-none">4.9 Clinique Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex cursor-pointer items-center gap-2.5 group"
          id="nav-logo"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white transition-transform group-hover:scale-105 shadow-md shadow-teal-600/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
              <path d="M12 2C11.5 2 10 3.5 10 6C10 7.5 9 8.5 7.5 8.5C5 8.5 3.5 10 3.5 12C3.5 15.5 6 18 10 18C10.5 18 11 18.5 11.5 19C12 19.5 12 22 12 22C12 22 12 19.5 12.5 19C13 18.5 13.5 18 14 18C18 18 20.5 15.5 20.5 12C20.5 10 19 8.5 16.5 8.5C15 8.5 14 7.5 14 6C14 3.5 12.5 2 12 2Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 font-sans leading-none">
              AURA<span className="text-teal-600">DENT</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none block mt-0.5">
              Premium Dental Suite
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <button 
            id="nav-home"
            onClick={() => handleNav('home')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'home' ? 'text-teal-650 font-extrabold border-b-2 border-teal-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Home
          </button>
          <button 
            id="nav-services"
            onClick={() => handleNav('services')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'services' ? 'text-teal-650 font-extrabold border-b-2 border-teal-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Services
          </button>
          <button 
            id="nav-team"
            onClick={() => handleNav('specialists')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'specialists' ? 'text-teal-650 font-extrabold border-b-2 border-teal-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Specialists
          </button>
          <button 
            id="nav-results"
            onClick={() => handleNav('smileslider')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'smileslider' ? 'text-teal-650 font-extrabold border-b-2 border-teal-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Smile Slider
          </button>
          <button 
            id="nav-reviews"
            onClick={() => handleNav('patients')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'patients' ? 'text-teal-650 font-extrabold border-b-2 border-teal-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Patients
          </button>
          <button 
            id="nav-dashboard"
            onClick={() => handleNav('bookings')} 
            className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              activePage === 'bookings' ? 'text-amber-700 font-extrabold border-b-2 border-amber-600 pb-1' : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            My Bookings
          </button>
        </nav>

        {/* Action Button */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            id="btn-book-now"
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/10 transition-all hover:bg-teal-700 hover:shadow-teal-700/25 hover:translate-y-[-1px] focus:outline-hidden cursor-pointer"
          >
            <Calendar className="h-4 w-4" /> Book Appointment
          </button>
        </div>

        {/* Hamburger */}
        <button
          id="btn-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden hover:bg-slate-50 focus:outline-hidden cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1.5 px-4 py-4">
              <button 
                id="mob-nav-home"
                onClick={() => handleNav('home')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'home' ? 'text-teal-600 font-extrabold' : 'text-slate-600'}`}
              >
                Home
              </button>
              <button 
                id="mob-nav-services"
                onClick={() => handleNav('services')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'services' ? 'text-teal-600 font-extrabold' : 'text-slate-600'}`}
              >
                Services
              </button>
              <button 
                id="mob-nav-team"
                onClick={() => handleNav('specialists')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'specialists' ? 'text-teal-600 font-extrabold' : 'text-slate-600'}`}
              >
                Our Specialists
              </button>
              <button 
                id="mob-nav-results"
                onClick={() => handleNav('smileslider')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'smileslider' ? 'text-teal-600 font-extrabold' : 'text-slate-600'}`}
              >
                Smile Slider
              </button>
              <button 
                id="mob-nav-reviews"
                onClick={() => handleNav('patients')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'patients' ? 'text-teal-600 font-extrabold' : 'text-slate-600'}`}
              >
                Patient Reviews
              </button>
              <button 
                id="mob-nav-dashboard"
                onClick={() => handleNav('bookings')} 
                className={`w-full text-left py-2.5 text-xs font-semibold uppercase tracking-wider ${activePage === 'bookings' ? 'text-amber-700 font-extrabold' : 'text-slate-605'}`}
              >
                My Reservations
              </button>
              <div className="pt-2 border-t border-slate-100">
                <button
                  id="mob-btn-book"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 py-3 text-center text-sm font-semibold text-white shadow-sm cursor-pointer"
                >
                  <Calendar className="h-4 w-4" /> Book Appointment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
