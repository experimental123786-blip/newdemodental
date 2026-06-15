import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DENTISTS } from '../data';
import { Dentist } from '../types';
import { Star, ShieldCheck, Award, Calendar, GraduationCap, ArrowRight, X } from 'lucide-react';

interface DentistsSectionProps {
  onSelectDentist: (dentistId: string) => void;
}

export default function DentistsSection({ onSelectDentist }: DentistsSectionProps) {
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);

  return (
    <section id="team" className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Title Grid */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-extrabold tracking-widest uppercase text-teal-600 block mb-2">
            Principal Clinician & Founder
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans sm:text-4xl">
            Lead Oral Healthcare Specialist
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Pure Dentistry is led by our board-certified chief dentist, delivering highly customized medical competence with master credentials and painless precision.
          </p>
        </div>

        {/* Dentists List - Optimized for single doctor side-by-side */}
        <div className="flex justify-center">
          {DENTISTS.map((dentist, index) => (
            <motion.div
              layout
              key={dentist.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              id={`dentist-card-${dentist.id}`}
              className="flex flex-col lg:flex-row max-w-4xl w-full bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs transition-all hover:shadow-xl hover:border-teal-500/10 group"
            >
              {/* Photo */}
              <div className="relative w-full lg:w-[40%] h-80 lg:h-auto overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={dentist.image}
                  alt={dentist.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white rounded-lg px-3 py-1.5 text-2xs font-extrabold uppercase tracking-widest leading-none">
                  {dentist.experience} Experience
                </div>
              </div>

              {/* Bio Summary */}
              <div className="p-8 sm:p-10 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
                      {dentist.title}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-md text-xs font-bold leading-none">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{dentist.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {dentist.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 italic mt-0.5 mb-4">{dentist.specialty}</p>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {dentist.bio}
                  </p>

                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block">Core Accreditations & Specialties</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Award className="h-4 w-4 text-teal-500" />
                        <span>Master of Dental Surgery (MDS)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-teal-500" />
                        <span>Board Certified Orthodontics</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <GraduationCap className="h-4 w-4 text-teal-500" />
                        <span>BDS & MDS Clinical Scholar</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="h-4 w-4 text-teal-500" />
                        <span>Mon - Fri Active Consultations</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <button
                    id={`btn-view-bio-${dentist.id}`}
                    onClick={() => setSelectedDentist(dentist)}
                    className="text-xs font-bold text-slate-500 hover:text-teal-600 transition-all flex items-center gap-1 text-left"
                  >
                    View Biography & Hours
                  </button>
                  <button
                    id={`btn-select-dentist-${dentist.id}`}
                    onClick={() => onSelectDentist(dentist.id)}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Book Appointment <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dentist Biography Details Modal (Clips inside layout beautifully) */}
      <AnimatePresence>
        {selectedDentist && (
          <div 
            id="dentist-bio-modal" 
            className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
            >
              <button
                id="close-bio-modal"
                onClick={() => setSelectedDentist(null)}
                className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-150 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-5 h-56 sm:h-auto bg-slate-100">
                  <img
                    src={selectedDentist.image}
                    alt={selectedDentist.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="sm:col-span-7 p-6 sm:p-8 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-widest">
                      <GraduationCap className="h-4 w-4 text-teal-600" /> Advanced Dentistry
                    </div>
                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedDentist.name}</h4>
                    <span className="text-xs text-slate-500 font-semibold">{selectedDentist.title}</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedDentist.bio}
                  </p>

                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Award className="h-4 w-4 text-teal-500" />
                      <span>Specialty: <strong className="text-slate-800">{selectedDentist.specialty}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-teal-500" />
                      <span>Patient Reviews: <strong className="text-slate-800">{selectedDentist.rating} / 5.0 ({selectedDentist.reviewsCount} votes)</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="h-4 w-4 text-teal-500" />
                      <span>Available Days: <strong className="text-slate-800">Mon, Tue, Wed, Thu, Fri (varies)</strong></span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      id="bio-close-btn"
                      onClick={() => setSelectedDentist(null)}
                      className="rounded-xl px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Close Roster
                    </button>
                    <button
                      id="bio-book-btn"
                      onClick={() => {
                        onSelectDentist(selectedDentist.id);
                        setSelectedDentist(null);
                      }}
                      className="rounded-xl px-5 py-2.5 bg-teal-600 text-white text-xs font-bold transition-all hover:bg-teal-700 shadow-md shadow-teal-600/10"
                    >
                      Book With {selectedDentist.name.split(' ')[1]}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
