import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, Sparkles, Wand2, ShieldCheck, Heart, Info, ArrowUpRight } from 'lucide-react';

import whiteningBefore from '../assets/images/whitening_before_1779622080110.png';
import whiteningAfter from '../assets/images/whitening_after_1779622100034.png';
import metalBraces from '../assets/images/metal_braces_1779622166714.png';

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  duration: string;
  beforeImg: string;
  afterImg: string;
  description: string;
  clinicalNotes: string[];
  materialsUsed: string;
}

const CASES: CaseStudy[] = [
  {
    id: 'whitening',
    title: 'Precision Laser Teeth Whitening',
    category: 'Cosmetic Therapy',
    duration: '1 Session (90 mins)',
    beforeImg: whiteningBefore,
    afterImg: whiteningAfter,
    description: 'Resolving yellowing and environmental enamel staining caused by age and nutritional habits, raising the bite shade up to 8 levels.',
    clinicalNotes: ['Light-activated neutral-pH hydrogen gel formulas used', 'Minimum thermal risk to vital inner pulp tissues', 'Sealed with deep nourishing calcium tooth-mousse coating'],
    materialsUsed: 'Zoom Clinical Laser + 25% Hydrogen Peroxide Gel'
  },
  {
    id: 'veneers',
    title: 'Custom Ceramic Porcelain Veneers',
    category: 'Aesthetic Realignment',
    duration: '2 appointments over 10 days',
    beforeImg: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=90',
    afterImg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=90',
    description: 'Restructuring micro-fractures, spacing gaps, and crown asymmetry using thin, durable hand-layered ceramic shells bonded to surface crowns.',
    clinicalNotes: ['Ultra-conservative 0.3mm enamel contouring prep', 'Microscope-calibrated dental margin alignments', 'Extreme chemical stain resistance against coffee and tea'],
    materialsUsed: 'IPS e.max Lithium Disilicate Ceramics'
  },
  {
    id: 'invisalign',
    title: 'Elite Orthodontics & Braces Alignment',
    category: 'Orthodontics',
    duration: '8 months active schedule',
    beforeImg: metalBraces,
    afterImg: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=90',
    description: 'Mitigating crowding of lower incisors and expanding arch width with clear aligners or low-friction aesthetic metal brace components.',
    clinicalNotes: ['SmartTrack biocompatible pressure-molded polymers', 'Corrects deep overbite to balance mastication loads', 'Perfect preservation of adjacent gingival borders'],
    materialsUsed: 'Invisalign Clear Aligners + Aesthetic Brackets'
  }
];

export default function SmileSliderPage() {
  const [activeCase, setActiveCase] = useState<CaseStudy>(CASES[0]);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let position = (x / rect.width) * 100;
    
    if (position < 0) position = 0;
    if (position > 100) position = 100;
    
    setSliderPosition(position);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 bg-slate-50 min-h-screen"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            High Fidelity Transformations
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-5xl">
            Smile Transformations
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Drag the handle of our interactive dental sliders to compare patient bite lines before and after clinical treatments.
          </p>
        </div>

        {/* Case Toggle Segment */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveCase(item);
                setSliderPosition(50);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCase.id === item.id
                  ? 'bg-amber-550 bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-16">
          
          {/* Detailed Diagnosis Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <span className="text-2xs font-extrabold text-teal-600 uppercase tracking-widest block leading-none">
                  {activeCase.category}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2 font-sans">{activeCase.title}</h2>
                <div className="mt-1 text-xs text-slate-400 font-semibold">Duration: {activeCase.duration}</div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {activeCase.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-150">
                <span className="text-3xs uppercase text-slate-400 font-extrabold tracking-wider block">Clinical Workflow</span>
                {activeCase.clinicalNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-3xs uppercase text-slate-400 font-extrabold tracking-wider block">Dental Material Specs</span>
                  <p className="text-2xs font-bold text-slate-700">{activeCase.materialsUsed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliding Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div 
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handleTouchMove}
              className="relative h-[280px] w-full max-w-[620px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl select-none cursor-ew-resize border-4 border-white bg-slate-200"
            >
              {/* After Image */}
              <img
                src={activeCase.afterImg}
                alt="After medical restoration"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 z-10 rounded-xl bg-teal-600/90 backdrop-blur-xs px-3 py-1 text-3xs font-extrabold uppercase tracking-widest text-white leading-none">
                Clinical After
              </div>

              {/* Before Image */}
              <div 
                className="absolute inset-y-0 left-0 overflow-hidden" 
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={activeCase.beforeImg}
                  alt="Before medical treatment"
                  className="pointer-events-none absolute inset-y-0 left-0 h-full object-cover max-w-none"
                  style={{ width: containerRef.current?.getBoundingClientRect().width || 620 }}
                />
                <div className="absolute top-4 left-4 z-10 rounded-xl bg-slate-800/90 backdrop-blur-xs px-3 py-1 text-3xs font-extrabold uppercase tracking-widest text-white leading-none">
                  Baseline Before
                </div>
              </div>

              {/* Sliding Bar Divider */}
              <div 
                className="absolute inset-y-0 z-20 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-[45%] -left-5 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-teal-600 text-teal-600 shadow-md">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center flex items-center gap-1.5">
              <span>Swipe or drag the scrollbar to compare restoration lines</span>
            </p>
          </div>
        </div>

        {/* Quality Commitment Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="max-w-2xl">
              <span className="text-3xs text-emerald-600 font-extrabold uppercase tracking-wider block">Bio-Mimetic Standard</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Stain Resistance & Light Refraction Specs</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Our custom porcelain restorations copy the absolute light-transmittance and translucency behaviors of organic human enamel. This ensures your crowns look identically sparkling in both bright sunlight and ambient indoor lighting states.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-teal-50 text-teal-800 rounded-xl px-4 py-2 text-2xs font-extrabold uppercase tracking-wider">
              <Info className="h-4 w-4 text-teal-600" /> Fully custom shade formulas
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
