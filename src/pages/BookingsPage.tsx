import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment } from '../types';
import { DENTAL_SERVICES, DENTISTS } from '../data';
import { ShieldCheck, CalendarRange, Trash2, CalendarDays, Clock, FileText, ArrowRight, X, AlertTriangle, Filter, Search, PhoneCall } from 'lucide-react';
import { cancelAppointment, rescheduleAppointment } from '../firebase';
import { isSlotUpcoming, getDoctorTimeSlots } from '../components/BookingForm';

const RESCHEDULE_HOURS = getDoctorTimeSlots();

interface BookingsPageProps {
  onOpenBooking: () => void;
}

export default function BookingsPage({ onOpenBooking }: BookingsPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showRescheduleId, setShowRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  const loadAppointments = () => {
    const raw = localStorage.getItem('auradent_appointments');
    if (raw) {
      try {
        setAppointments(JSON.parse(raw));
      } catch (e) {
        setAppointments([]);
      }
    } else {
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
    // Watch for other booking actions
    window.addEventListener('storage', loadAppointments);
    return () => window.removeEventListener('storage', loadAppointments);
  }, []);

  const handleCancelApt = (id: string) => {
    if (window.confirm('Do you really want to cancel this dental appointment reservation?')) {
      cancelAppointment(id)
        .then(() => {
          const updated = appointments.map(apt => {
            if (apt.id === id) {
              return { ...apt, status: 'cancelled' as const };
            }
            return apt;
          });
          localStorage.setItem('auradent_appointments', JSON.stringify(updated));
          setAppointments(updated);
        })
        .catch(err => {
          console.error("Online cancel failed in BookingsPage:", err);
          const updated = appointments.map(apt => {
            if (apt.id === id) {
              return { ...apt, status: 'cancelled' as const };
            }
            return apt;
          });
          localStorage.setItem('auradent_appointments', JSON.stringify(updated));
          setAppointments(updated);
        });
    }
  };

  const handleReschedule = (id: string) => {
    setRescheduleError('');
    if (!newDate) {
      setRescheduleError('Please specify a new date.');
      return;
    }
    const dateParts = newDate.split('-').map(Number);
    const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = localDate.getDay();
    if (dayOfWeek === 0) { // Sunday closing
      setRescheduleError('We are closed on Sundays.');
      return;
    }
    if (!newTime) {
      setRescheduleError('Please specify a timeslot.');
      return;
    }

    rescheduleAppointment(id, newDate, newTime)
      .then(() => {
        const updated = appointments.map(apt => {
          if (apt.id === id) {
            return { ...apt, date: newDate, timeSlot: newTime, status: 'confirmed' as const };
          }
          return apt;
        });

        localStorage.setItem('auradent_appointments', JSON.stringify(updated));
        setAppointments(updated);
        setShowRescheduleId(null);
        setNewDate('');
        setNewTime('');
      })
      .catch((err) => {
        setRescheduleError(err instanceof Error ? err.message : 'Rescheduling error.');
      });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const activeReservationsCount = appointments.filter(a => a.status === 'confirmed').length;
  const today = new Date().toISOString().split('T')[0];

  const getWhatsAppUrl = (apt: Appointment) => {
    const service = DENTAL_SERVICES.find(s => s.id === apt.serviceId);
    const dentist = DENTISTS.find(d => d.id === apt.dentistId);
    const formattedText = `🌟 *NEW APPOINTMENT RESERVATION - AURADENT DENTAL SUITE* 🌟

Dear Auradent Team,

I would like to book a dental checkup with the following details:

👤 *Patient Information:*
• *Name:* ${apt.patientName}
• *Phone:* ${apt.patientPhone}
• *Email:* ${apt.patientEmail}

🦷 *Treatment & Clinician:*
• *Specialty Service:* ${service?.name || 'Oral Diagnostic Care'} (${service?.duration || ''})
• *Preferred Dentist:* ${dentist?.name || 'Resident Dentist'} (${dentist?.title || ''})

📅 *Date & Preferred Time:*
• *Scheduled Date:* ${apt.date}
• *Time Slot:* ${apt.timeSlot}

📝 *Symptoms / Notes:*
${apt.notes ? apt.notes : 'None provided'}

Thank you! I look forward to confirming my appointment.`;

    const CLINIC_WHATSAPP_NUMBER = '919876543210';
    return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedText)}`;
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
        
        {/* Header Metadata Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-150 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800 uppercase tracking-wider">
            <CalendarRange className="h-3.5 w-3.5 text-teal-600" />
            Patient Care Registry
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 font-sans sm:text-5xl">
            My Appointments & Bookings
          </h1>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Monitor, reschedule, cancel, or generate verified passes for your scheduled orthodontist checkups instantly from one place.
          </p>
        </div>

        {/* Dashboard statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-3xs uppercase text-slate-400 font-extrabold tracking-wider block leading-none">Total Booked</span>
              <span className="text-3xl font-black text-slate-900 block mt-2">{appointments.length}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-550 font-bold">∑</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-3xs uppercase text-slate-400 font-extrabold tracking-wider block leading-none">Active Confirmed</span>
              <span className="text-3xl font-black text-teal-600 block mt-2">{activeReservationsCount}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold font-sans">✓</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-3xs uppercase text-slate-400 font-extrabold tracking-wider block leading-none">Cancelled Passes</span>
              <span className="text-3xl font-black text-rose-500 block mt-2">{appointments.length - activeReservationsCount}</span>
            </div>
            <div className="h-10 w-15 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold font-sans">✕</div>
          </div>
        </div>

        {/* Filters control */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest leading-none">Filter Status:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'confirmed', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 border border-slate-250/10 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenBooking}
            className="rounded-xl px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/15 flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
          >
            Add New Appointment <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Main List layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          
          <div className="lg:col-span-8 space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mx-auto">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <div className="max-w-sm mx-auto">
                  <h4 className="text-base font-extrabold text-slate-900">No Reservations Found</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You do not have any appointments registered matching your current filter. Setup your dental rehabilitation plan instantly.
                  </p>
                </div>
                <button
                  onClick={onOpenBooking}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Schedule Your Session <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const service = DENTAL_SERVICES.find(s => s.id === apt.serviceId);
                const dentist = DENTISTS.find(d => d.id === apt.dentistId);
                const isConfirmed = apt.status === 'confirmed';

                return (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-3xl border p-6 transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                      isConfirmed ? 'border-slate-100' : 'border-slate-200/50 opacity-80'
                    }`}
                  >
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {apt.id}</span>
                        <span className={`rounded-xl px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider border ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-sans'
                            : 'bg-rose-50 text-rose-700 border-rose-100 font-sans'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {service?.name || 'Oral Diagnostic Care'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Assigned Specialist: <span className="font-bold text-slate-700">{dentist?.name || 'Resident Dentist'}</span> • {service?.duration || '45 mins'}
                      </p>

                      <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl w-fit">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <CalendarDays className="h-4 w-4 text-teal-600" />
                          <span>{apt.date}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Clock className="h-4 w-4 text-teal-600" />
                          <span>{apt.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-center gap-3 shrink-0 pt-4 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-6 sm:min-w-[170px]">
                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => setSelectedApt(apt)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-2xs font-bold text-slate-700 transition-all cursor-pointer w-full"
                          >
                            <FileText className="h-3.5 w-3.5" /> Treatment Receipt
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowRescheduleId(showRescheduleId === apt.id ? null : apt.id);
                              setNewDate(apt.date);
                              setNewTime(apt.timeSlot);
                              setRescheduleError('');
                            }}
                            className="text-2xs font-bold text-teal-600 hover:text-teal-700 transition uppercase tracking-wider text-center w-full"
                          >
                            Reschedule Slot
                          </button>

                          <button
                            onClick={() => handleCancelApt(apt.id)}
                            className="text-2xs font-bold text-rose-500 hover:text-rose-700 transition uppercase tracking-wider text-center w-full"
                          >
                            Cancel Reservation
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reschedule inline wrapper */}
                    {showRescheduleId === apt.id && (
                      <div className="w-full mt-4 p-5 bg-teal-50/20 border border-teal-100 rounded-2xl space-y-4 sm:col-span-2">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Select New Checkup Date:</h4>
                        {rescheduleError && (
                          <span className="text-3xs text-rose-600 font-bold block">{rescheduleError}</span>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="date"
                            min={today}
                            value={newDate}
                            onChange={(e) => {
                              const d = e.target.value;
                              setNewDate(d);
                              const upcoming = RESCHEDULE_HOURS.filter(slot => isSlotUpcoming(d, slot));
                              if (upcoming.length > 0) {
                                if (!upcoming.includes(newTime)) {
                                  setNewTime(upcoming[0]);
                                }
                              } else {
                                setNewTime('');
                              }
                            }}
                            className="rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-800"
                          />
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-800"
                          >
                            {RESCHEDULE_HOURS.filter(slot => isSlotUpcoming(newDate, slot)).length === 0 ? (
                              <option value="">No slots left today</option>
                            ) : (
                              RESCHEDULE_HOURS.filter(slot => isSlotUpcoming(newDate, slot)).map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowRescheduleId(null)}
                            className="rounded-lg px-3 py-1.5 text-2xs border border-slate-250 bg-white hover:bg-slate-50 text-slate-500 font-bold cursor-pointer"
                          >
                            Abort
                          </button>
                          <button
                            onClick={() => handleReschedule(apt.id)}
                            className="rounded-lg px-4 py-1.5 text-2xs font-extrabold bg-teal-650 text-white hover:bg-teal-700 cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Support Guidelines sidebar */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">Need Special Help?</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">24-hour Limit</h4>
                  <p className="text-3xs text-slate-400 leading-normal mt-1">Please reschedule or cancel details at least 24 hours prior to prevent unused slot blocks.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Biometric Scan Preparation</h4>
                  <p className="text-3xs text-slate-400 leading-normal mt-1">Ensure complete fasting for at least 2 hours before complex surgical implant evaluations.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <PhoneCall className="h-4 w-4" />
                <span className="text-3xs font-extrabold uppercase tracking-widest block font-mono">Surgical hotline</span>
              </div>
              <p className="text-4xs text-slate-400 leading-relaxed">
                Need customized adjustments or physical maps? Contact our clinical desk immediately.
              </p>
              <span className="text-sm font-black block text-teal-300 font-sans tracking-tight">(555) 492-3800</span>
            </div>
          </div>

        </div>

      </div>

      {/* Digital Receipt Card Popup modal */}
      <AnimatePresence>
        {selectedApt && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-150 shadow-2xl relative text-slate-850"
            >
              <button
                onClick={() => setSelectedApt(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center pb-6 border-b border-dashed border-slate-200 pt-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg font-sans">AURADENT CLINIC</h4>
                <p className="text-3xs tracking-widest text-slate-400 uppercase mt-0.5">Official Checkup Pass</p>
              </div>

              <div className="py-5 space-y-4 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Receipt ID</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedApt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Patient Name</span>
                  <span className="font-bold text-slate-900">{selectedApt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Assigned Dentist</span>
                  <span className="font-bold text-slate-900">
                    {DENTISTS.find(d => d.id === selectedApt.dentistId)?.name || 'Resident Specialist'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Service Sorted</span>
                  <span className="font-bold text-teal-700">
                    {DENTAL_SERVICES.find(s => s.id === selectedApt.serviceId)?.name || 'Checkup'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Schedule Date</span>
                  <span className="font-bold text-slate-900">{selectedApt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Arrival Time</span>
                  <span className="font-bold text-slate-900">{selectedApt.timeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500 font-semibold">Est. Duration:</span>
                  <span className="font-bold text-slate-900">
                    {DENTAL_SERVICES.find(s => s.id === selectedApt.serviceId)?.duration || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-start gap-2 text-[9px] text-slate-500 leading-normal mb-4">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Please present this pass card on your mobile screen or print it out 10 minutes prior to your checkup slot.</span>
              </div>

              <div className="space-y-2">
                <a
                  href={getWhatsAppUrl(selectedApt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-emerald-600/10 text-center cursor-pointer"
                >
                  Confirm Registration on WhatsApp
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 rounded-xl py-2.5 bg-slate-900 text-white font-bold text-xs transition hover:bg-slate-800 cursor-pointer text-center"
                  >
                    Print Pass
                  </button>
                  <button
                    onClick={() => setSelectedApt(null)}
                    className="flex-1 rounded-xl py-2.5 border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs transition cursor-pointer text-center"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
