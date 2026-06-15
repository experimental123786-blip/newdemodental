import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DENTAL_SERVICES, DENTISTS, TIME_SLOTS } from '../data';
import { Appointment, DentalService, Dentist } from '../types';
import { CalendarDays, Stethoscope, Clock, ShieldAlert, BadgeCheck, Phone, Mail, User, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAppointments, createAppointment } from '../firebase';

export interface AvailableDate {
  dateString: string; // "YYYY-MM-DD"
  dayOfWeekName: string; // "Mon", "Tue"
  formattedDate: string; // "May 25"
  fullDayOfWeek: string; // "Monday", "Tuesday"
}

export function getKolkataTime(): { year: number; month: number; day: number; hours: number; minutes: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

    const y = parseInt(partMap.year, 10);
    const m = parseInt(partMap.month, 10);
    const d = parseInt(partMap.day, 10);
    const h = parseInt(partMap.hour, 10);
    const min = parseInt(partMap.minute, 10);

    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min)) {
      return { year: y, month: m, day: d, hours: h, minutes: min };
    }
  } catch (e) {
    console.error("Error formatting with formatToParts:", e);
  }

  // Fallback using toLocaleString string parsing
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const dt = new Date(nowStr);
  if (!isNaN(dt.getTime())) {
    return {
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hours: dt.getHours(),
      minutes: dt.getMinutes()
    };
  }

  // Final fallback (system/local time)
  const fallback = new Date();
  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
    hours: fallback.getHours(),
    minutes: fallback.getMinutes()
  };
}

export function getNextSevenAvailableDates(dentist: Dentist, bookedAppointments: Appointment[] = []): AvailableDate[] {
  const list: AvailableDate[] = [];
  
  const kt = getKolkataTime();
  const currentKolkataDate = new Date(kt.year, kt.month - 1, kt.day, 12, 0, 0, 0);
  const tYear = kt.year;
  const tMonth = String(kt.month).padStart(2, '0');
  const tDay = String(kt.day).padStart(2, '0');
  const localTodayStr = `${tYear}-${tMonth}-${tDay}`;

  const hasRemainingSlots = (candDateString: string): boolean => {
    const allSlots = getDoctorTimeSlots();
    const bookedOnDay = bookedAppointments
      .filter((apt) => apt.dentistId === dentist.id && apt.date === candDateString && apt.status === 'confirmed')
      .map((apt) => apt.timeSlot);
    
    const available = allSlots.filter((s) => {
      const isUpcoming = isSlotUpcoming(candDateString, s);
      const isBooked = bookedOnDay.includes(s);
      return isUpcoming && !isBooked;
    });

    return available.length > 0;
  };

  // We want to find exactly 7 future dates where this dentist is on rotation (has available days)
  for (let i = 0; i < 45; i++) {
    if (list.length >= 7) break;
    
    const candidate = new Date(currentKolkataDate);
    candidate.setDate(currentKolkataDate.getDate() + i);
    
    const day = candidate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const matchDayIndex = day === 0 ? 7 : day; // Translate Sunday to 7
    
    if (dentist.availableDays.includes(matchDayIndex)) {
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, '0');
      const dateVal = String(candidate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dateVal}`;
      
      // If it is today, verify if there is at least one upcoming unbooked slot.
      // If none, skip today to maximize user retention and show tomorrow or the next available day with open slots.
      if (dateString === localTodayStr && !hasRemainingSlots(dateString)) {
        continue;
      }

      const dayOfWeekName = candidate.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDayOfWeek = candidate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthName = candidate.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = candidate.getDate();
      
      list.push({
        dateString,
        dayOfWeekName,
        formattedDate: `${monthName} ${dayNum}`,
        fullDayOfWeek
      });
    }
  }
  return list;
}

export function getDoctorTimeSlots(): string[] {
  const slots: string[] = [];
  // Rest break is from 1:00 PM to 2:00 PM (13:00 to 14:00)
  for (let hour = 9; hour < 20; hour++) {
    if (hour === 13) continue; // skip 1:00 PM to 2:00 PM
    for (const min of [0, 30]) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const displayMin = min === 0 ? '00' : '30';
      slots.push(`${String(displayHour).padStart(2, '0')}:${displayMin} ${ampm}`);
    }
  }
  return slots;
}

export function isSlotUpcoming(dateString: string, slot: string): boolean {
  if (!dateString) return true;
  
  const kolkata = getKolkataTime();
  const year = kolkata.year;
  const month = String(kolkata.month).padStart(2, '0');
  const dayVal = String(kolkata.day).padStart(2, '0');
  const todayISTStr = `${year}-${month}-${dayVal}`;

  // If the date is in the future, all slots are upcoming
  if (dateString > todayISTStr) {
    return true;
  }
  // If the date is in the past, no slots are upcoming
  if (dateString < todayISTStr) {
    return false;
  }

  // Same day: apply 45 minutes buffer from current IST time
  const nowIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const currentIST = new Date(nowIST);
  const bufferIST = new Date(currentIST.getTime() + 45 * 60 * 1000);

  const [time, ampm] = slot.split(' ');
  const [hourStr, minStr] = time.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  
  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  const slotDate = new Date(currentIST);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() >= bufferIST.getTime();
}

interface BookingFormProps {
  initialServiceId?: string;
  initialDentistId?: string;
  onBookingSuccess: () => void;
  onClose: () => void;
}

export default function BookingForm({ initialServiceId, initialDentistId, onBookingSuccess, onClose }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialServiceId || DENTAL_SERVICES[0].id);
  const [dentistId, setDentistId] = useState(initialDentistId || DENTISTS[0].id);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  
  // Patient details
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Local validation errors
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time blocked slots sourced from server
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    getAppointments()
      .then((data) => {
        if (Array.isArray(data)) {
          setBookedAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Failed to pull booked slots from Firebase:", err);
      })
      .finally(() => {
        setLoadingBookings(false);
      });
  }, []);

  // Dynamically reset values if changed externally
  useEffect(() => {
    if (initialServiceId) setServiceId(initialServiceId);
  }, [initialServiceId]);

  useEffect(() => {
    if (initialDentistId) setDentistId(initialDentistId);
  }, [initialDentistId]);

  // Selected details
  const selectedService = DENTAL_SERVICES.find(s => s.id === serviceId) || DENTAL_SERVICES[0];
  const selectedDentist = DENTISTS.find(d => d.id === dentistId) || DENTISTS[0];

  // List of active slot reservations already committed inside the database
  const bookedSlotsOnThisDay = bookedAppointments
    .filter((apt) => apt.dentistId === dentistId && apt.date === date && apt.status === 'confirmed')
    .map((apt) => apt.timeSlot);

  // Identify if selected date is today in Asia/Kolkata
  const ktForTodayCheck = getKolkataTime();
  const todayISTStr = `${ktForTodayCheck.year}-${String(ktForTodayCheck.month).padStart(2, '0')}-${String(ktForTodayCheck.day).padStart(2, '0')}`;
  const isSelectedDateToday = date === todayISTStr;

  // Helper to determine the state of a given slot (PAST_BUFFER, BOOKED, AVAILABLE)
  const getSlotState = (slot: string, selectedDate: string): 'PAST_BUFFER' | 'BOOKED' | 'AVAILABLE' => {
    // Priority order: PAST/BUFFER > BOOKED > AVAILABLE
    
    // 1. PAST / BUFFER (slot start time is BEFORE bufferIST)
    if (!isSlotUpcoming(selectedDate, slot)) {
      return 'PAST_BUFFER';
    }

    // 2. BOOKED SLOT (slot exists in booked appointments on this day)
    const isBooked = bookedSlotsOnThisDay.includes(slot);
    if (isBooked) {
      return 'BOOKED';
    }

    // 3. AVAILABLE
    return 'AVAILABLE';
  };

  const morningSlotsToShow = date ? getDoctorTimeSlots()
    .filter(s => s.endsWith('AM')) : [];

  const afternoonSlotsToShow = date ? getDoctorTimeSlots()
    .filter(s => s.endsWith('PM')) : [];

  const totalAvailableSlotsCount = morningSlotsToShow.filter(s => getSlotState(s, date) === 'AVAILABLE').length +
                                   afternoonSlotsToShow.filter(s => getSlotState(s, date) === 'AVAILABLE').length;

  // Auto-initialize default date to the first available calendar date when dentist changes or page mounts
  useEffect(() => {
    if (selectedDentist) {
      const nextDays = getNextSevenAvailableDates(selectedDentist, bookedAppointments);
      if (nextDays.length > 0) {
        if (!date || !nextDays.some(d => d.dateString === date)) {
          setDate(nextDays[0].dateString);
          setTimeSlot(''); // reset timeslot when date defaults
        }
      }
    }
  }, [dentistId, selectedDentist, bookedAppointments]);

  // Logic to calculate minimum and maximum available dates
  const today = new Date().toISOString().split('T')[0];
  const maxBookingDate = new Date();
  maxBookingDate.setMonth(maxBookingDate.getMonth() + 3);
  const maxDateStr = maxBookingDate.toISOString().split('T')[0];

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!serviceId) {
        setErrorMsg('Please choose a clinical service.');
        return;
      }
      if (!dentistId) {
        setErrorMsg('Please choose a preferred dentist.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!date) {
        setErrorMsg('Please choose a valid checkup date.');
        return;
      }
      
      // Calculate day of the week (0 = Sunday, 6 = Saturday) safely without timezone offsets
      const dateParts = date.split('-').map(Number);
      const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const day = localDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const matchDayIndex = day === 0 ? 7 : day; // Translate Sunday to 7
      
      if (matchDayIndex === 7) { 
        setErrorMsg('The clinic is closed on Sundays. Please select another date.');
        return;
      }

      // Check if dentist is available on that day
      const dentistDays = selectedDentist.availableDays;
      if (!dentistDays.includes(matchDayIndex)) {
        setErrorMsg(`${selectedDentist.name} is not on rotation on this day. Please check their profile or select another day.`);
        return;
      }

      if (!timeSlot) {
        setErrorMsg('Please select an available hourly time slot.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please enter your legal name.');
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address for appointment confirmation.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 8) {
      setErrorMsg('Please provide a valid phone number for SMS emergency updates.');
      return;
    }

    setSubmitting(true);

    const payload = {
      serviceId,
      dentistId,
      date,
      timeSlot,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      notes: notes.trim(),
    };

    createAppointment(payload)
      .then((savedApt: Appointment) => {
        // Store in localStorage
        const existing = localStorage.getItem('auradent_appointments');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(savedApt);
        localStorage.setItem('auradent_appointments', JSON.stringify(list));

        // Formulate WhatsApp message text with all prefilled details
        const messageText = `Hello, I've just booked a dental appointment through AuraDent! Here are the details of my appointment:

🔹 *Appointment ID:* ${savedApt.id || 'N/A'}
👤 *Patient Name:* ${payload.patientName}
📞 *Phone:* ${payload.patientPhone}
✉️ *Email:* ${payload.patientEmail}
🏥 *Service/Treatment:* ${selectedService.name} (${selectedService.duration})
👨‍⚕️ *Doctor:* ${selectedDentist.name}
📅 *Date:* ${payload.date}
⏰ *Time Slot:* ${payload.timeSlot}
📝 *Notes:* ${payload.notes || 'None'}

Please confirm my slot. Thank you!`;

        const whatsappNumber = '916397050608';
        const encodedText = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

        // Redirect to WhatsApp - use _blank to open in a new tab/window,
        // fallback to setting window.location.href if popup is blocked
        try {
          const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          if (!opened) {
            window.location.href = whatsappUrl;
          }
        } catch (e) {
          window.location.href = whatsappUrl;
        }

        // Callback on completed successfully
        onBookingSuccess();
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'An error occurred during booking validation.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col h-auto max-h-[90vh]"
      >
        {/* Banner header info */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">Step {step} of 3</span>
            <h3 className="text-lg font-bold font-sans">Reserve Dental Appointment</h3>
          </div>
          <button
            id="btn-close-booking"
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Animated Custom Stepper Progress Area */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {/* Active tracking line */}
            <motion.div 
              className="absolute top-1/2 left-0 h-0.5 bg-teal-600 -translate-y-1/2 z-0 origin-left"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />

            {[
              { id: 1, label: 'Preferences', icon: Stethoscope },
              { id: 2, label: 'Schedule', icon: CalendarDays },
              { id: 3, label: 'Patient Info', icon: User }
            ].map((s) => {
              const IconComponent = s.icon;
              const isCompleted = step > s.id;
              const isActive = step === s.id;

              return (
                <div key={s.id} className="flex flex-col items-center relative z-10 w-24">
                  {/* Circle indicator */}
                  <motion.div
                    id={`stepper-circle-${s.id}`}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      backgroundColor: isCompleted 
                        ? "#0d9488" // teal-600
                        : isActive 
                        ? "#f0fdfa" // teal-50
                        : "#ffffff", // white
                      borderColor: isCompleted 
                        ? "#0d9488" 
                        : isActive 
                        ? "#0d9488" 
                        : "#cbd5e1" // slate-300
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold shadow-xs`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Check className="h-4 w-4 text-white stroke-[3]" />
                      </motion.div>
                    ) : (
                      <div className={`flex items-center justify-center ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>

                  {/* Text label */}
                  <span 
                    className={`text-[10px] font-extrabold mt-1.5 uppercase tracking-wider text-center block w-full truncate transition-colors duration-300 ${
                      isActive 
                        ? 'text-teal-700 font-bold' 
                        : isCompleted 
                        ? 'text-slate-700' 
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert messaging */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Wizard Body Form */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* 1. Choose Service Section */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    1. Select Specialty Care Treatment
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[170px] overflow-y-auto pr-1">
                    {DENTAL_SERVICES.map((serv) => (
                      <button
                        key={serv.id}
                        id={`select-serv-${serv.id}`}
                        type="button"
                        onClick={() => setServiceId(serv.id)}
                        className={`flex items-start text-left gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                          serviceId === serv.id
                            ? 'border-teal-500 bg-teal-50/50'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <div className={`mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                          serviceId === serv.id ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-300'
                        }`}>
                          {serviceId === serv.id && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">{serv.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{serv.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Choose Dentist Expert */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-teal-600" />
                    2. Certified Medical Provider
                  </label>
                  <div className="flex justify-center">
                    {DENTISTS.map((dent) => (
                      <button
                        key={dent.id}
                        id={`select-dent-${dent.id}`}
                        type="button"
                        onClick={() => setDentistId(dent.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer max-w-sm w-full ${
                          dentistId === dent.id
                            ? 'border-teal-500 bg-teal-50/50'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <div className="h-14 w-14 rounded-full overflow-hidden border shrink-0">
                          <img src={dent.image} alt={dent.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{dent.name}</h4>
                          <span className="text-[10px] text-teal-700 font-bold block uppercase tracking-wide mt-0.5">{dent.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{dent.experience} Experience &bull; Rating: {dent.rating.toFixed(1)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 1. Next 7 Days Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <CalendarDays className="h-4 w-4 text-teal-600" />
                    3. Select Date From Next 7 Available Days
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                    {getNextSevenAvailableDates(selectedDentist, bookedAppointments).map((avail) => {
                      const isSelected = date === avail.dateString;
                      return (
                        <button
                          key={avail.dateString}
                          type="button"
                          onClick={() => {
                            setDate(avail.dateString);
                            setTimeSlot(''); // clear slot
                          }}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50 text-teal-950 shadow-xs ring-2 ring-teal-500/10'
                              : 'border-slate-200 bg-white hover:border-slate-350 text-slate-700'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                            {avail.dayOfWeekName}
                          </span>
                          <span className="text-lg font-extrabold my-0.5 text-slate-900">
                            {avail.formattedDate.split(' ')[1]}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-500">
                            {avail.formattedDate.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">
                    * Showing upcoming on-duty clinician days on rotation for {selectedDentist.name}.
                  </p>
                </div>

                {/* 2. Timeslots Select with Lunch Break Skipping */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" />
                    4. Choose Checkup Time Slot ({selectedDentist.name})
                  </label>
                  {date ? (
                    <div id="booking-grid-container" className="space-y-4">
                      {totalAvailableSlotsCount === 0 ? (
                        <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/50 p-4 text-center text-xs text-rose-600 flex flex-col items-center justify-center gap-1.5">
                          <Clock className="h-5 w-5 text-rose-500 animate-pulse" />
                          <span className="font-bold">No available slots for {isSelectedDateToday ? 'today' : 'this date'}</span>
                          <span className="text-[11px] text-slate-500 font-normal max-w-xs">
                            {isSelectedDateToday 
                              ? 'All remaining time slots for today have already passed or are booked. Please select another date.'
                              : 'All time slots for this date are already booked. Please select another date.'}
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Morning Session */}
                          {morningSlotsToShow.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Morning Sessions (9:00 AM - 12:00 PM)</span>
                              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                                {morningSlotsToShow.map((slot) => {
                                  const state = getSlotState(slot, date);
                                  const isSelected = timeSlot === slot;
                                  
                                  let btnClasses = '';
                                  let content = null;

                                  if (state === 'PAST_BUFFER') {
                                    btnClasses = 'bg-slate-100 border-slate-200 text-slate-400 line-through decoration-slate-300 cursor-not-allowed flex flex-col items-center justify-center';
                                    content = <span className="font-semibold text-xs text-slate-400">{slot}</span>;
                                  } else if (state === 'BOOKED') {
                                    btnClasses = 'bg-rose-50 border-rose-200 text-rose-500 line-through decoration-rose-350 cursor-not-allowed flex flex-col items-center justify-center';
                                    content = (
                                      <>
                                        <span className="font-semibold text-xs leading-tight">{slot}</span>
                                        <span className="text-[9px] font-bold text-rose-600 leading-none mt-0.5 uppercase tracking-wide">Booked</span>
                                      </>
                                    );
                                  } else {
                                    // AVAILABLE
                                    btnClasses = isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 cursor-pointer text-xs font-bold'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer text-xs font-bold';
                                    content = <span className="font-bold text-xs">{slot}</span>;
                                  }

                                  return (
                                    <button
                                      key={slot}
                                      id={`timeslot-${slot.replace(/\s+/g, '-')}`}
                                      type="button"
                                      disabled={state !== 'AVAILABLE'}
                                      onClick={() => setTimeSlot(slot)}
                                      className={`rounded-xl py-2 px-1 text-center border transition-all flex flex-col items-center justify-center min-h-[38px] ${btnClasses}`}
                                    >
                                      {content}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Afternoon Session */}
                          {afternoonSlotsToShow.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                Afternoon Sessions (12:00 PM - 8:00 PM &bull; <strong className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded text-[9px]">1:00 PM - 2:00 PM Rest Break</strong>)
                              </span>
                              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                                {afternoonSlotsToShow.map((slot) => {
                                  const state = getSlotState(slot, date);
                                  const isSelected = timeSlot === slot;
                                  
                                  let btnClasses = '';
                                  let content = null;

                                  if (state === 'PAST_BUFFER') {
                                    btnClasses = 'bg-slate-100 border-slate-200 text-slate-400 line-through decoration-slate-300 cursor-not-allowed flex flex-col items-center justify-center';
                                    content = <span className="font-semibold text-xs text-slate-400">{slot}</span>;
                                  } else if (state === 'BOOKED') {
                                    btnClasses = 'bg-rose-50 border-rose-200 text-rose-500 line-through decoration-rose-350 cursor-not-allowed flex flex-col items-center justify-center';
                                    content = (
                                      <>
                                        <span className="font-semibold text-xs leading-tight">{slot}</span>
                                        <span className="text-[9px] font-bold text-rose-600 leading-none mt-0.5 uppercase tracking-wide">Booked</span>
                                      </>
                                    );
                                  } else {
                                    // AVAILABLE
                                    btnClasses = isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20 cursor-pointer text-xs font-bold'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer text-xs font-bold';
                                    content = <span className="font-bold text-xs">{slot}</span>;
                                  }

                                  return (
                                    <button
                                      key={slot}
                                      id={`timeslot-${slot.replace(/\s+/g, '-')}`}
                                      type="button"
                                      disabled={state !== 'AVAILABLE'}
                                      onClick={() => setTimeSlot(slot)}
                                      className={`rounded-xl py-2 px-1 text-center border transition-all flex flex-col items-center justify-center min-h-[38px] ${btnClasses}`}
                                    >
                                      {content}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                      Please specify a checkup date first to display active timeslots.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Aesthetic Summary</h4>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      <strong>Treatment:</strong> {selectedService.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      <strong>Clinical Dentist:</strong> {selectedDentist.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      <strong>Schedule Timestamp:</strong> {date} @ {timeSlot}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleConfirmReservation} className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label htmlFor="patient-name" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Legal Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        id="patient-name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Marcus Sterling"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Mail & Phone grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="patient-email" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          id="patient-email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="marcus@example.com"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="patient-phone" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                        SMS & WhatsApp Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          id="patient-phone"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+1 (555) 430-1004"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments notes */}
                  <div>
                    <label htmlFor="patient-notes" className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Notes / Symptoms / Sedation Preference (Optional)
                    </label>
                    <textarea
                      id="patient-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify if you have root sensitivity, pregnant status, or any drug allergies..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-hidden resize-none"
                    />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Links */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100 shrink-0">
          {step > 1 ? (
            <button
              id="btn-prev-wizard"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              id="btn-next-wizard"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-600 shadow-md cursor-pointer"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              id="btn-confirm-wizard"
              onClick={handleConfirmReservation}
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-teal-700 shadow-lg shadow-teal-600/10 ${
                submitting ? 'opacity-70 cursor-not-allowed bg-teal-700' : 'cursor-pointer'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reserving Slot...
                </>
              ) : (
                "Confirm Appointment Now"
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
