import { useState } from 'react';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import ServicesSection from './components/ServicesSection';
import DentistsSection from './components/DentistsSection';
import TestimonialsSlider from './components/TestimonialsSlider';
import BookingForm from './components/BookingForm';
import AppointmentsDashboard from './components/AppointmentsDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Heart, Sparkles, Smile, Phone, MapPin, Clock, Star, HelpingHand } from 'lucide-react';

// Standalone pages
import ServicesPage from './pages/ServicesPage';
import SpecialistsPage from './pages/SpecialistsPage';
import SmileSliderPage from './pages/SmileSliderPage';
import PatientsPage from './pages/PatientsPage';
import BookingsPage from './pages/BookingsPage';

export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [activePage, setActivePage] = useState<'home' | 'services' | 'specialists' | 'smileslider' | 'patients' | 'bookings'>('home');
  
  // Passed parameters for pre-selected service/dentist triggers
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | undefined>(undefined);
  const [preSelectedDentistId, setPreSelectedDentistId] = useState<string | undefined>(undefined);

  // Auto incrementing state to force-reload child local storage items
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  // Success alert state
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [lastAppointmentId, setLastAppointmentId] = useState('');

  const handleOpenBooking = (serviceId?: string, dentistId?: string) => {
    setPreSelectedServiceId(serviceId);
    setPreSelectedDentistId(dentistId);
    setBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    // Increment refresh trigger so dashboard loads latest items
    setDashboardRefreshTrigger(prev => prev + 1);
    setBookingOpen(false);
    
    // Read the newly created appointment ID
    const raw = localStorage.getItem('auradent_appointments');
    if (raw) {
      try {
        const apts = JSON.parse(raw);
        if (apts.length > 0) {
          setLastAppointmentId(apts[0].id);
        }
      } catch (e) {
        // ignore
      }
    }

    // Trigger success slider banner
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 6000);

    // Auto navigate to bookings page to view status
    setActivePage('bookings');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-teal-500 selection:text-white">
      {/* Top sticky Navigation Header */}
      <Header 
        onOpenBooking={() => handleOpenBooking()} 
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content Layout */}
      <main>
        {/* Dynamic Success Toast Alerts with sliding appearance */}
        <AnimatePresence>
          {showSuccessAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-45 w-full max-w-md px-4"
            >
              <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500 flex items-start gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white shrink-0 mt-0.5">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-100">Booking Confirmed!</h4>
                  <p className="text-xs text-white/95 mt-0.5">
                    Your appointment has been registered in our central server.
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] bg-white/15 px-2 py-0.5 rounded-sm font-mono font-extrabold text-emerald-50">
                    PASS CODE: {lastAppointmentId || 'AURADENT-PASS'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Multi-page Standalone Router Switch */}
        {(() => {
          switch (activePage) {
            case 'services':
              return <ServicesPage onSelectService={(serviceId) => handleOpenBooking(serviceId, undefined)} />;
            case 'specialists':
              return <SpecialistsPage onSelectDentist={(dentistId) => handleOpenBooking(undefined, dentistId)} />;
            case 'smileslider':
              return <SmileSliderPage />;
            case 'patients':
              return <PatientsPage />;
            case 'bookings':
              return <BookingsPage onOpenBooking={() => handleOpenBooking()} />;
            case 'home':
            default:
              return (
                <>
                  {/* Slidding Professional Hero slider */}
                  <HeroSlider onOpenBooking={() => handleOpenBooking()} />

                  {/* Premium Trust indicators Grid directly under hero */}
                  <section className="bg-white/80 border-b border-slate-150 py-10 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 col-auto">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                            <ShieldCheck className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">AuraSafe Sterilization</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Surpasses all international medical hygiene sanitization and surgical air loops.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                            <Heart className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Painless Modern Solutions</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Custom sedation preference matching, precision dental lasers, and rapid healing techniques.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                            <Sparkles className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Individualized Care Plans</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Each orthodontic and aesthetic therapy is fully customized to align with your personal health objectives.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                            <Smile className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Emergency Scheduling</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Severe pain or trauma? Backed by on-call specialists to resolve immediate issues.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Clinical Services Directory Showcase */}
                  <ServicesSection 
                    onSelectService={(serviceId) => handleOpenBooking(serviceId, undefined)} 
                  />

                  {/* Interactive Smile Slider comparison */}
                  <BeforeAfterSlider />

                  {/* Our Specialist Clinicians Section */}
                  <DentistsSection 
                    onSelectDentist={(dentistId) => handleOpenBooking(undefined, dentistId)} 
                  />

                  {/* Verified Patients reviews carousel */}
                  <TestimonialsSlider />

                  {/* Emergency quick reservation box */}
                  <section className="bg-slate-50 py-16 px-4 border-t border-slate-100">
                    <div className="mx-auto max-w-5xl rounded-3xl bg-linear-to-r from-teal-800 to-teal-950 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 -translate-y-10 translate-x-10 pointer-events-none" />
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-teal-400">Oral Trauma?</span>
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Need Immediate Same-Day Dental Support?</h3>
                        <p className="text-xs text-teal-100/80 max-w-xl leading-relaxed">
                          Call our trauma desk to secure immediate bookings. We provide urgent pain management checkups, emergency root canal therapies, and cosmetic repair slots.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full md:w-auto">
                        <a 
                          href="tel:5554923800"
                          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-6 py-3.5 text-xs font-bold text-white border border-white/20 transition-all text-center"
                        >
                          <Phone className="h-4 w-4" /> Call (555) 492-3800
                        </a>
                        <motion.button
                          id="emergency-book-btn"
                          onClick={() => handleOpenBooking('root-canal')}
                          animate={{
                            scale: [1, 1.02, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(20, 184, 166, 0.7)",
                              "0 0 0 10px rgba(20, 184, 166, 0)",
                              "0 0 0 0 rgba(20, 184, 166, 0)"
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-6 py-3.5 text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                        >
                          Reserve Urgent Slot
                        </motion.button>
                      </div>
                    </div>
                  </section>
                </>
              );
          }
        })()}
      </main>

      {/* Aesthetic Footer Layout */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-slate-800 pb-12">
          {/* Logo Brand column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold">
                AD
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">AURADENT SUITE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Providing beautiful, safe orthodontic, surgical, and cosmetic smile designs under certified clinical guidelines.
            </p>
            <div className="flex items-center gap-1">
              <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Clinicians On-Call Now</span>
            </div>
          </div>

          {/* Quick linkages columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Specialties</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><button onClick={() => handleOpenBooking('whitening')} className="hover:text-white transition">Laser Whitening</button></li>
                <li><button onClick={() => handleOpenBooking('veneers')} className="hover:text-white transition">Artisan Veneers</button></li>
                <li><button onClick={() => handleOpenBooking('implants')} className="hover:text-white transition">Titanium Implants</button></li>
                <li><button onClick={() => handleOpenBooking('cleaning')} className="hover:text-white transition">Deep Cleaning & Hygiene</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Our Location</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>820 Sterling Heights Medical Center, Suite 400, NY</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <span>Mon-Fri: 8AM-6PM<br />Saturday: 9AM-3PM</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Official Standards</h5>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-750 text-4xs space-y-2">
                <span className="font-bold text-slate-300 block uppercase">ADA accredited clinic</span>
                <p className="leading-relaxed text-slate-400">
                  Fully credentialed under CDC and OSHA patient security covenants, restoring Smiles with surgical precision.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl pt-8 flex flex-col sm:flex-row items-center justify-between text-4xs text-slate-500 gap-4">
          <span>© 2026 Auradent Dental Suite. All medical checkups scheduled locally inside sandbox.</span>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Covenants of Confidentiality</span>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Patient Guidelines</span>
          </div>
        </div>
      </footer>

      {/* Interactive Booking Wizard Modal layer */}
      <AnimatePresence>
        {bookingOpen && (
          <BookingForm 
            initialServiceId={preSelectedServiceId}
            initialDentistId={preSelectedDentistId}
            onClose={() => setBookingOpen(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </AnimatePresence>

      {/* Appointments Management Dashboard Drawer layer */}
      <AnimatePresence>
        {dashboardOpen && (
          <AppointmentsDashboard 
            onClose={() => setDashboardOpen(false)}
            onOpenBooking={() => handleOpenBooking()}
            onRefreshTrigger={dashboardRefreshTrigger}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
