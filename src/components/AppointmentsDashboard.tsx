import { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { DENTAL_SERVICES, DENTISTS } from '../data';
import { ShieldCheck, CalendarRange, Trash2, CalendarDays, Clock, FileText, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cancelAppointment, rescheduleAppointment } from '../firebase';
import { isSlotUpcoming, getDoctorTimeSlots } from './BookingForm';

const RESCHEDULE_HOURS = getDoctorTimeSlots();

interface AppointmentsDashboardProps {
  onClose: () => void;
  onRefreshTrigger: number;
  onOpenBooking: () => void;
}

export default function AppointmentsDashboard({ onClose, onRefreshTrigger, onOpenBooking }: AppointmentsDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [showRescheduleId, setShowRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

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
  }, [onRefreshTrigger]);

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
          loadAppointments();
        })
        .catch(err => {
          console.error("Failed online cancel:", err);
          const updated = appointments.map(apt => {
            if (apt.id === id) {
              return { ...apt, status: 'cancelled' as const };
            }
            return apt;
          });
          localStorage.setItem('auradent_appointments', JSON.stringify(updated));
          loadAppointments();
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
        setShowRescheduleId(null);
        setNewDate('');
        setNewTime('');
        loadAppointments();
      })
      .catch((err) => {
        setRescheduleError(err instanceof Error ? err.message : 'Rescheduling error.');
      });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div id="dashboard-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs select-none">
      <motion.div
        initial={{ x: '100%', opacity: 0.9 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0.9 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg h-full sm:h-[95vh] rounded-none sm:rounded-3xl bg-white shadow-2xl border-l border-slate-100 flex flex-col overflow-hidden"
      >
        {/* Dashboard Header */}
        <div className="bg-slate-900 text-white px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarRange className="h-5 w-5 text-teal-400" />
            <div>
              <h3 className="text-lg font-bold font-sans">My Appointments</h3>
              <p className="text-2xs text-slate-400 font-medium">Verify or reschedule active checkups</p>
            </div>
          </div>
          <button
            id="close-dashboard-btn"
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Dashboard Content List */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {appointments.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-150 text-slate-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="text-sm font-bold text-slate-900">No Reservations Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  You haven't scheduled any teeth whitening or clinical checkups yet.
                </p>
              </div>
              <button
                id="dash-book-now"
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Schedule Treatment Now <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            appointments.map((apt) => {
              const service = DENTAL_SERVICES.find(s => s.id === apt.serviceId);
              const dentist = DENTISTS.find(d => d.id === apt.dentistId);
              const isConfirmed = apt.status === 'confirmed';

              return (
                <div
                  key={apt.id}
                  id={`dashboard-card-${apt.id}`}
                  className={`rounded-2xl border p-5 transition-all text-left ${
                    isConfirmed 
                      ? 'border-slate-150 bg-white hover:border-slate-300' 
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400">ID: {apt.id}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{service?.name || 'Oral Treatment'}</h4>
                  <span className="text-xs text-teal-600 font-semibold block mt-0.5">Dentist: {dentist?.name || 'Resident Specialist'}</span>

                  {/* Scheduled Timeslot summary */}
                  <div className="mt-3 grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span className="text-[11px] font-semibold">{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-[11px] font-semibold">{apt.timeSlot}</span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  {isConfirmed && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-dash-resched-${apt.id}`}
                          onClick={() => {
                            setShowRescheduleId(showRescheduleId === apt.id ? null : apt.id);
                            setNewDate(apt.date);
                            setNewTime(apt.timeSlot);
                            setRescheduleError('');
                          }}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 transition"
                        >
                          Reschedule
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          id={`btn-dash-receipt-${apt.id}`}
                          onClick={() => setSelectedApt(apt)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                        >
                          <FileText className="h-3 w-3" /> Digital Receipt
                        </button>
                      </div>

                      <button
                        id={`btn-dash-cancel-${apt.id}`}
                        onClick={() => handleCancelApt(apt.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Cancel Treatment
                      </button>
                    </div>
                  )}

                  {/* Inline Reschedule Widget */}
                  {showRescheduleId === apt.id && (
                    <div className="mt-4 p-4 border border-teal-100 bg-teal-50/20 rounded-xl space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Select New Timestamp:</h5>
                      {rescheduleError && (
                        <p className="text-[10px] text-rose-600 font-semibold">{rescheduleError}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          id="resched-date"
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
                          className="rounded-lg border bg-white border-slate-200 p-2 text-xs text-slate-800"
                        />
                        <select
                          id="resched-time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="rounded-lg border bg-white border-slate-200 p-2 text-xs text-slate-800"
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
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          id="cancel-resched-action"
                          type="button"
                          onClick={() => setShowRescheduleId(null)}
                          className="rounded-lg px-2.5 py-1.5 border border-slate-200 text-[10px] font-bold bg-white text-slate-600 hover:bg-slate-50"
                        >
                          Abort
                        </button>
                        <button
                          id="confirm-resched-action"
                          type="button"
                          onClick={() => handleReschedule(apt.id)}
                          className="rounded-lg px-3 py-1.5 bg-teal-600 text-[10px] font-extrabold text-white hover:bg-teal-700"
                        >
                          Confirm Reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Dash Modal Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[10px] text-slate-400 font-medium leading-normal">
            For major oral emergency operations, please dial our 24/7 on-call surgical hotline: <strong>(555) 492-3800</strong>
          </p>
        </div>
      </motion.div>

      {/* Digital Receipt Card Popup modal */}
      <AnimatePresence>
        {selectedApt && (
          <div id="receipt-receipt-overlay" className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-150 shadow-2xl relative text-slate-800"
            >
              <button
                id="btn-close-receipt"
                onClick={() => setSelectedApt(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center pb-6 border-b border-dashed border-slate-200 pt-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg">AURADENT CLINIC</h4>
                <p className="text-3xs tracking-widest text-slate-400 uppercase mt-0.5">Official Checkup Pass</p>
              </div>

              <div className="py-5 space-y-4 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Receipt ID</span>
                  <span className="font-bold text-slate-900">{selectedApt.id}</span>
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
                  <span className="text-slate-400 font-semibold uppercase text-3xs">Service Ordered</span>
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

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex items-start gap-2 text-4xs text-slate-500 leading-normal mb-4">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Please present this pass card on your mobile screen or print it out 10 minutes prior to your checkup.</span>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-print-receipt"
                  onClick={() => window.print()}
                  className="flex-1 rounded-xl py-2.5 bg-slate-900 text-white font-bold text-xs transition hover:bg-slate-800"
                >
                  Print Pass
                </button>
                <button
                  id="btn-dismiss-receipt"
                  onClick={() => setSelectedApt(null)}
                  className="flex-1 rounded-xl py-2.5 border border-slate-200 font-bold text-slate-650 hover:bg-slate-50 text-xs transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
