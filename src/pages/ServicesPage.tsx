import React from 'react';
import { motion } from 'motion/react';
import { DENTAL_SERVICES } from '../data';
import { Sparkles, HeartPulse, Shield, Hammer, ShieldCheck, Clock, Award, Activity, Heart, ArrowRight } from 'lucide-react';

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

interface ServicesPageProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesPage({ onSelectService }: ServicesPageProps) {
  // Clinical FAQs for the services page
  const faqs = [
    {
      q: 'How often should I schedule a professional dental routing cleaning?',
      a: 'We recommend comprehensive cleanings every 6 months. Patients with clinical signs of gingivitis or active periodontal boundaries should undergo deep scaling sessions every 3 to 4 months.'
    },
    {
      q: 'Do clinical teeth whitening procedures cause severe enamel sensitivity?',
      a: 'Our precision clinical laser whitening employs light-activated cooling hydrogen-rich formulas specifically layered with safe desensitizing agents. This ensures maximum surface whitening with minimal sensitivity.'
    },
    {
      q: 'What is the organic lifetime duration of porcelain veneers?',
      a: 'Crafted from dental-grade ceramic, artisan porcelain veneers last between 10 to 15 years when supported by standard preventive checkups and diligent home care hygiene.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800 uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 text-teal-600" />
            Clinical Therapeutics Overview
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-5xl">
            Our Dental Treatments
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Delve into our comprehensive collection of biological preventative treatments, custom-sculpted smile cosmetics, and heavy orthodontic surgical restorations.
          </p>
        </div>

        {/* Categories Detail Explanation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Preventative Care</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Aiming to completely mitigate caries development, root infection vectors, and tartar stagnation through ultra-resolute deep scalings.
              </p>
            </div>
            <span className="text-2xs font-extrabold text-sky-600 block mt-6 uppercase tracking-wider">01. Standard Screening</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cosmetic Dentistry</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Sculpting balanced enamel curves and whitening discoloration. Including light-activated lasers and fine hand-layered porcelain shells.
              </p>
            </div>
            <span className="text-2xs font-extrabold text-emerald-600 block mt-6 uppercase tracking-wider">02. Aesthetic Contours</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-5">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Restorative Realignment</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Replacing decay zones using mercury-free biological bonding composite composites. Completely dental-matched to maintain occlusion lines.
              </p>
            </div>
            <span className="text-2xs font-extrabold text-amber-600 block mt-6 uppercase tracking-wider">03. Structural Integrity</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-5">
                <Hammer className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Implantology Surgery</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Titanium post integration replacing missing root systems. Ensuring secure bite patterns and stopping natural bone volume erosion.
              </p>
            </div>
            <span className="text-2xs font-extrabold text-rose-600 block mt-6 uppercase tracking-wider">04. Micro-Surgical Fusion</span>
          </div>
        </div>

        {/* Full Interactive Treatment Listing */}
        <div className="space-y-8 mb-24">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900">Clinical Specialty Index</h2>
            <p className="text-xs text-slate-500 mt-1">Review the therapeutic specifications of each medical dental procedure we offer.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {DENTAL_SERVICES.map((service) => (
              <div
                key={service.id}
                id={`detail-service-${service.id}`}
                className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:shadow-lg"
              >
                {SERVICE_IMAGES[service.id] && (
                  <div className="overflow-hidden rounded-2xl h-44 w-full md:w-56 shrink-0 bg-slate-50 border border-slate-100">
                    <img 
                      src={SERVICE_IMAGES[service.id]} 
                      alt={service.name} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-teal-50 text-teal-700 px-3 py-1 text-2xs font-bold uppercase tracking-wider border border-teal-100">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-450" />
                      {service.duration}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">{service.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {service.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center items-stretch lg:items-end gap-3 shrink-0 lg:border-l lg:border-slate-100 lg:pl-8 lg:min-w-[190px]">
                  <div className="text-center lg:text-right space-y-1">
                    <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">Sanitization Rating</span>
                    <span className="text-xs font-bold text-emerald-600 block">Class 1 Sterile Lab</span>
                  </div>
                  <button
                    id={`page-book-service-${service.id}`}
                    onClick={() => onSelectService(service.id)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-3 text-xs font-bold text-white transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                  >
                    Select Procedure <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Care FAQ */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <h2 className="text-xs font-extrabold text-teal-600 uppercase tracking-widest leading-none">Frequently Answered Queries</h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans">Professional Dental Insights</h3>
            <p className="text-xs text-slate-500 mt-1">Academic advice for maintaining healthy enamel structure and gum tissues.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-teal-600 font-extrabold">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
