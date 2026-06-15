import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TESTIMONIALS } from '../data';
import { Star, MessageSquare, ShieldCheck, Heart, User, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function PatientsPage() {
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  const filteredQuotes = TESTIMONIALS.filter(t => {
    if (selectedRating === 'all') return true;
    return t.rating === selectedRating;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 bg-slate-50 min-h-screen"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            Empathetic Patient Care
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-5xl">
            Our Patient Experiences
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Read stories of biological rehabilitation and clinical design from everyday people who have restored their confidence and biting alignment here.
          </p>
        </div>

        {/* Diagnostic Satisfaction Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-4xl font-black text-slate-900 leading-none">4.9</span>
            <div className="flex gap-0.5 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block mt-1">Average Clinical Rating</span>
            <p className="text-3xs text-slate-500 mt-2">Aggregated from over 2,400 verified post-treatment surveys.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xs text-teal-600 font-extrabold uppercase tracking-widest block leading-none">Safety Compliance</span>
              <h3 className="text-sm font-bold text-slate-900">100% Sterile Instrumentation</h3>
              <p className="text-2xs text-slate-500 leading-relaxed">
                We employ autoclaving sterilization cycles and sterile room air-flow setups. Each dental set is unsealed directly in front of you.
              </p>
            </div>
            <span className="text-3xs font-bold text-emerald-600 block mt-4 uppercase">Approved Clinical Sanitization</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xs text-blue-600 font-extrabold uppercase tracking-widest block leading-none">Emergency Triages</span>
              <h3 className="text-sm font-bold text-slate-900">Sameday Priority Scheduling</h3>
              <p className="text-2xs text-slate-500 leading-relaxed">
                Suffering from extreme throbbing toothaches or dental trauma? We block surgical slots daily to handle immediate emergency realignments.
              </p>
            </div>
            <span className="text-3xs font-bold text-slate-500 block mt-4 uppercase">Call 24/7 Hotline Support</span>
          </div>
        </div>

        {/* Verification Filters */}
        <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Verified Testimonials Database</h2>
            <p className="text-2xs text-slate-500 mt-0.5">Filter based on genuine star-review ratings compiled post-appointment.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-2xs text-slate-500 font-bold uppercase mr-2">Filter Stars:</span>
            {([ 'all', 5, 4 ] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(r)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRating === r
                    ? 'bg-slate-950 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r === 'all' ? 'All Ratings' : `${r} Star Review`}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filteredQuotes.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative"
            >
              <div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic mb-6">
                  "{item.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-150 shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    {item.name}
                    <CheckCircle2 className="h-3 w-3 text-teal-600 fill-teal-100" />
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patient Rights Commitment banner */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-3xs text-teal-400 font-bold uppercase tracking-widest block leading-none">Code of Clinical Conduct</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans">The Patient Care Credo</h2>
            <p className="text-xs text-slate-350 leading-relaxed">
              We operate exclusively under conservative, bio-compatible protocols. Our focus rests entirely on keeping healthy bone structures intact without rushing into over-prepared invasive crowns. We explicitly outline diagnostic results, detailing therapy routes in clear, non-jargon layperson terms so you feel absolutely validated.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-2xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 block" /> Fully Explained Consent
              </div>
              <div className="flex items-center gap-2 text-2xs text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 block" /> Zero Concealed Charges
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
