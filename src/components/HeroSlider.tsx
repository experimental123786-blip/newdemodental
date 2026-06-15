import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Sparkles, Trophy, ShieldCheck } from 'lucide-react';

import clinicReception from '../assets/images/clinic_reception_1779622055969.png';
import patientCheckup from '../assets/images/patient_checkup_1779622184713.png';
import dentistExam from '../assets/images/dentist_exam_1779622201990.png';

interface HeroSliderProps {
  onOpenBooking: () => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    image: clinicReception,
    badge: 'State-of-the-Art Dental Suite',
    badgeIcon: ShieldCheck,
    title: 'A Higher Standard of Precision Dental Care',
    description: 'Experience ultra-gentle dental services powered by high-resolution digital scanning, comfortable procedural seating, and compassionate specialists.',
    metric: '99.8% Client Success Rate',
    ctaText: 'Reserve Your Dental Consultation',
  },
  {
    id: 2,
    image: patientCheckup,
    badge: 'Aesthetic Smile Mastery',
    badgeIcon: Sparkles,
    title: 'Reimagine Your Dental Smile Aesthetic',
    description: 'Custom porcelain veneers, composite bonding, and medical-grade laser teeth whitening tailored perfectly to contour with your dynamic natural smile.',
    metric: '10,000+ Bright Smiles Crafted',
    ctaText: 'Schedule Smile Preview',
  },
  {
    id: 3,
    image: dentistExam,
    badge: 'Certified Dental Implants & Surgery',
    badgeIcon: Trophy,
    title: 'Elite Oral Surgical & Restoration Solutions',
    description: 'Restore your natural biting force and prevent jaw deterioration. We offer micro-precision titanium dental implants and comfortable bone preservation.',
    metric: 'Board-Certified Dental Surgeons',
    ctaText: 'Book Surgical Diagnostic Checkup',
  }
];

export default function HeroSlider({ onOpenBooking }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [current]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  };

  // Variant animations for sliding effect matching requested "sliding animations"
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: customDelay, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  const activeSlide = HERO_SLIDES[current];
  const BadgeIcon = activeSlide.badgeIcon;

  return (
    <div id="hero-slider-container" className="relative h-[620px] w-full overflow-hidden bg-slate-950 sm:h-[680px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={activeSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 h-full w-full"
        >
          {/* Background image with high contrast vignette overlay */}
          <div className="absolute inset-0 bg-slate-900/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent z-10" />
          <img
            src={activeSlide.image}
            alt="Dental surgery visuals"
            className="h-full w-full object-cover object-center scale-102"
            onError={(e) => {
              // Fallback image in case of load failure
              const img = e.currentTarget;
              img.src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl text-left">
                {/* Badge Category Tag */}
                <motion.div
                  custom={0.1}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-400/30 px-3.5 py-1.5 text-xs font-semibold text-teal-300"
                >
                  <BadgeIcon className="h-3.5 w-3.5 text-teal-400" />
                  <span>{activeSlide.badge}</span>
                </motion.div>

                {/* Animated Heading */}
                <motion.h1
                  custom={0.2}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 text-3xl font-bold tracking-tight text-white font-sans sm:text-5xl lg:text-6xl"
                >
                  {activeSlide.title}
                </motion.h1>

                {/* Description Text */}
                <motion.p
                  custom={0.3}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 text-base text-slate-300/90 leading-relaxed sm:text-lg"
                >
                  {activeSlide.description}
                </motion.p>

                {/* Call to Actions + Credibility Indicators */}
                <motion.div
                  custom={0.4}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <button
                    id="hero-book-btn"
                    onClick={onOpenBooking}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-600/20 transition-all hover:bg-teal-500 hover:shadow-teal-500/30 sm:w-auto hover:translate-y-[-1px]"
                  >
                    {activeSlide.ctaText}
                  </button>

                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-200">
                      {activeSlide.metric}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Left/Right Arrow Navigators */}
      <button
        id="btn-hero-prev"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/35 backdrop-blur-xs text-white hover:bg-slate-900/60 hover:scale-105 transition-all"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        id="btn-hero-next"
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/35 backdrop-blur-xs text-white hover:bg-slate-900/60 hover:scale-105 transition-all"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Progress Bullets Indicator */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2.5">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => {
              setDirection(idx > current ? 1 : -1);
              setCurrent(idx);
            }}
            className={`h-2 transition-all rounded-full ${
              idx === current ? 'w-8 bg-teal-500' : 'w-2 bg-slate-500 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
