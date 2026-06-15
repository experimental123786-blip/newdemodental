export interface DentalService {
  id: string;
  name: string;
  category: 'preventative' | 'cosmetic' | 'restorative' | 'surgical';
  duration: string;
  description: string;
  benefits: string[];
}

export interface Dentist {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  image: string;
  bio: string;
  availableDays: number[]; // 1 = Monday, 5 = Friday
}

export interface Appointment {
  id: string;
  serviceId: string;
  dentistId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  avatar: string;
}
