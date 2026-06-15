import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DENTAL_SERVICES } from '../data';
import { DentalService } from '../types';
import { Sparkles, HeartPulse, Shield, Hammer, ArrowRight, ShieldCheck, Clock, DollarSign } from 'lucide-react';

import whiteningAfter from '../assets/images/whitening_after_1779622100034.png';
import rootCanal from '../assets/images/root_canal_1779622119094.png';
import dentalImplant from '../assets/images/dental_implant_1779622137126.png';
import patientCheckup from '../assets/images/patient_checkup_1779622184713.png';
import dentistExam from '../assets/images/dentist_exam_1779622201990.png';
import clinicReception from '../assets/images/clinic_reception_1779622055969.png';

const SERVICE_IMAGES: Record<string, string> = {
  'exam': clinicReception,
  'cleaning': dentistExam,
  'whitening': whiteningAfter,
  'veneers': patientCheckup,
  'filling': patientCheckup,
  'implants': dentalImplant,
  'root-canal': rootCanal,
};

interface ServicesSectionProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'preventative' | 'cosmetic' | 'restorative' | 'surgical'>('all');

  const categories = [
    { id: 'all', name: 'All Services', icon: ShieldCheck },
    { id: 'preventative', name: 'Preventative', icon: Shield },
    { id: 'cosmetic', name: 'Cosmetic', icon: Sparkles },
    { id: 'restorative', name: 'Restorative', icon: HeartPulse },
    { id: 'surgical', name: 'Surgical/Implantology', icon: Hammer },
  ];

  const filteredServices = selectedCategory === 'all'
    ? DENTAL_SERVICES
    : DENTAL_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Header Title Grid */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-sm font-extrabold tracking-widest uppercase text-teal-600 block mb-2">
              Our Medical Services
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 font-sans sm:text-4xl">
              World-Class Dental Therapies Configured for Long-Term Wellness
            </h3>
          </div>
          <p className="max-w-md text-base text-slate-500 leading-relaxed">
            All appointments include a digital laser screening, clinical high-definition cameras, and customizable sedation preferences.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 pb-8 border-b border-slate-100 mb-10 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-category-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap focus:outline-hidden ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/15'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Services Grid with sliding entry */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, index) => (
              <motion.div
                layout
                key={service.id}
                id={`service-card-${service.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:shadow-xl hover:border-teal-500/10 hover:shadow-teal-900/5 hover:-translate-y-1 block"
              >
                <div>
                  {/* Dynamic Image Thumbnail for Clinical Service portfolio */}
                  {SERVICE_IMAGES[service.id] && (
                    <div className="overflow-hidden rounded-2xl h-44 w-full mb-5 bg-slate-50 border border-slate-100">
                      <img 
                        src={SERVICE_IMAGES[service.id]} 
                        alt={service.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {service.name}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[60px]">
                    {service.description}
                  </p>

                  {/* Highlights List */}
                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 mb-6">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Row */}
                <div className="flex items-center justify-end mt-auto pt-4 border-t border-slate-100 bg-linear-to-b from-transparent to-slate-500/1 px-1 rounded-b-2xl w-full">
                  <button
                    id={`btn-book-service-${service.id}`}
                    onClick={() => onSelectService(service.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-teal-600 group-hover:bg-teal-600 hover:shadow-lg focus:outline-hidden cursor-pointer"
                  >
                    Reserve Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
