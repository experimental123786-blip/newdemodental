import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../data';
import { Quote, Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export default function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const active = TESTIMONIALS[current];

  return (
    <section id="reviews" className="bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative vector arches */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg fill="currentColor" viewBox="0 0 100 100" className="absolute top-0 left-0 w-80 h-80 text-teal-400">
          <circle cx="20" cy="20" r="40" />
        </svg>
        <svg fill="currentColor" viewBox="0 0 100 100" className="absolute bottom-0 right-0 w-80 h-80 text-slate-400">
          <circle cx="80" cy="80" r="40" />
        </svg>
      </div>

      <div className="mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400">
            <MessageSquare className="h-4 w-4" /> Patient Stories
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white font-sans sm:text-4xl">
            Read Verified Reviews From Our Patients
          </h2>
        </div>

        {/* Testimonial Active Display with sliding transition */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full text-center max-w-3xl"
            >
              {/* Quote icon mark */}
              <div className="flex justify-center mb-6 text-teal-500">
                <Quote className="h-12 w-12 stroke-[1.5]" />
              </div>

              {/* Star review bar */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: active.rating }).map((_, idx) => (
                  <Star key={idx} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Patient quote text */}
              <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed tracking-wide italic">
                "{active.comment}"
              </p>

              {/* Patient Profile info */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-14 w-14 rounded-full border-2 border-teal-500 overflow-hidden shadow-md">
                  <img
                    src={active.avatar}
                    alt={active.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white">{active.name}</h4>
                  <span className="text-xs text-slate-400 font-medium">{active.role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls with indicators */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            id="testimonial-prev-btn"
            onClick={handlePrev}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-750 bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 transition-all rounded-full ${
                  idx === current ? 'w-6 bg-teal-500' : 'w-2.5 bg-slate-700'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            id="testimonial-next-btn"
            onClick={handleNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-750 bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
