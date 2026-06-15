import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DENTISTS } from '../data';
import { Dentist } from '../types';
import { Star, ShieldCheck, Award, Calendar, GraduationCap, ArrowRight, X, Sparkles, Building2, Landmark, Check } from 'lucide-react';

interface SpecialistsPageProps {
  onSelectDentist: (dentistId: string) => void;
}

export default function SpecialistsPage({ onSelectDentist }: SpecialistsPageProps) {
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const dentist = DENTISTS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 bg-slate-50 min-h-screen"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-150 px-3.5 py-1 text-xs font-bold text-teal-700 uppercase tracking-wrap">
            <Building2 className="h-3.5 w-3.5 text-teal-600" />
            Accredited Chief Clinician
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-5xl">
            Meet Our Chief Dentist
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Pure Dentistry is directed under the expert medical guidance of our principal scholar physician, combining prestigious academic credentials with meticulous clinical standards.
          </p>
        </div>

        {/* Chief Specialist Single Bio Spread */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden mb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Photo Column */}
            <div className="md:col-span-5 relative h-96 md:h-auto bg-slate-100 min-h-[400px]">
              <img
                src={dentist.image}
                alt={dentist.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3.5 py-2 text-2xs font-extrabold uppercase tracking-widest rounded-lg leading-none">
                {dentist.experience} Clinical Competence
              </div>
            </div>

            {/* Right Detailed Bio Column */}
            <div className="md:col-span-7 p-8 sm:p-12 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-teal-50 text-teal-700 font-extrabold text-2xs uppercase tracking-widest px-3 py-1 border border-teal-200/50">
                    BDS, MDS (Master of Dental Surgery)
                  </span>
                  <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg leading-none">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {dentist.rating.toFixed(1)}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{dentist.name}</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{dentist.title}</p>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] uppercase text-teal-650 font-extrabold tracking-widest block leading-none">Senior Specialties</span>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed italic border-l-4 border-teal-500 pl-4 bg-teal-50/30 py-1">
                  {dentist.specialty}
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {dentist.bio}
              </p>

              {/* Accreditations list */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <Check className="h-4.5 w-4.5 text-teal-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">MDS Board Certified</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dual master degree holder certifying elite oral surgery methods.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <Check className="h-4.5 w-4.5 text-teal-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Orthodontic Strategist</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Expert alignment models using low-friction braces & Invisalign.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <Check className="h-4.5 w-4.5 text-teal-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">BDS Clinical Scholar</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Bachelors in Dental Surgery from premium national clinical schools.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <Check className="h-4.5 w-4.5 text-teal-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Global Tech Adoption</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Utilizes precise medical lasers, 3D bio-scanning, & dental digital maps.</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4.5 w-4.5 text-teal-500" />
                  <span>Available on <strong className="text-slate-800">Monday - Friday</strong></span>
                </div>
                <button
                  onClick={() => onSelectDentist(dentist.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 py-3.5 text-xs font-bold transition-all cursor-pointer shadow-md shadow-teal-600/10"
                >
                  Book Private Consultation <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Academic Affiliations */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-3xs text-teal-400 font-extrabold uppercase tracking-widest block mb-1">Affiliated Memberships</span>
              <h2 className="text-2xl font-bold font-sans">Accredited by Elite Global Dental Institutes</h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Dr. Rajendra Saxena maintains pristine medical affiliations to bring advanced surgical standards directly to our region. This guarantees your preventive therapies leverage the newest global clinical paradigms.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Landmark className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                <span className="text-[10px] font-bold block uppercase tracking-widest text-slate-300">ADA Registered</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Award className="h-6 w-6 text-teal-400 mx-auto mb-2" />
                <span className="text-[10px] font-bold block uppercase tracking-widest text-slate-300">Board Certified MDS</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
