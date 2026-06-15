import { DentalService, Dentist, Testimonial } from './types';

export const DENTAL_SERVICES: DentalService[] = [
  {
    id: 'exam',
    name: 'Comprehensive Oral Checkup',
    category: 'preventative',
    duration: '45 mins',
    description: 'A full scan checkup including 3D X-rays, cavity detection, and custom health reports.',
    benefits: ['Detailed digital scan x-rays', 'Oral cancer screening check', 'Custom clinical treatment plan']
  },
  {
    id: 'cleaning',
    name: 'Professional Deep Cleaning',
    category: 'preventative',
    duration: '60 mins',
    description: 'Removal of plaque, tartar, and surface stains to maintain clean, strong teeth.',
    benefits: ['Ultrasonic plaque scaling', 'Advanced stain polishing', 'Fluoride protective barrier coat']
  },
  {
    id: 'whitening',
    name: 'Precision Laser Whitening',
    category: 'cosmetic',
    duration: '90 mins',
    description: 'Clinical-grade light-activated teeth whitening that elevates teeth up to 8 shades in a single session.',
    benefits: ['Immediate shade correction', 'Clinical-controlled minimal sensitivity', 'Take-home nourishment touchup kit']
  },
  {
    id: 'veneers',
    name: 'Custom Porcelain Veneers',
    category: 'cosmetic',
    duration: '120 mins',
    description: 'Thin, durable artisan veneers bonded to teeth surfaces to resolve spacing, cracks, or discoloration.',
    benefits: ['Permanently bright white surfaces', 'Custom-crafted structural shapes', 'Ultra-durable stain resistance']
  },
  {
    id: 'filling',
    name: 'Composite Cavity Restoration',
    category: 'restorative',
    duration: '45 mins',
    description: 'Metal-free, tooth-colored composite restorations that repair decay perfectly.',
    benefits: ['Seamless tooth-colored matching', 'Strong direct-bond architecture', '100% Mercury-free materials']
  },
  {
    id: 'implants',
    name: 'Advanced Dental Implants',
    category: 'surgical',
    duration: '150 mins',
    description: 'Elite titanium post substitution with high-fidelity porcelain crowns for full restoration.',
    benefits: ['Restores original biting force', 'Halts jawbone volume deterioration', 'Looks and feels like fully organic teeth']
  },
  {
    id: 'root-canal',
    name: 'Precise Root Canal Therapy',
    category: 'surgical',
    duration: '90 mins',
    description: 'Careful inner microscopic cleaning of infected nerves to save damaged, decaying teeth.',
    benefits: ['Stops throbbing systemic toothache', 'Rescues organic tooth structure', 'Advanced local numbing protocols']
  }
];

export const DENTISTS: Dentist[] = [
  {
    id: 'dr-saxena',
    name: 'Dr. Rajendra Saxena',
    title: 'BDS, MDS, Chief Consultant Dentist',
    specialty: 'Aesthetic Orthodontics, Implantology, & Micro-Surgical Dental Care',
    experience: '15 Years',
    rating: 5.0,
    reviewsCount: 540,
    image: 'https://lh3.googleusercontent.com/d/1G_PknAiAcIFcdXQGUuLrPaS1ev7sYK58',
    bio: 'Dr. Rajendra Saxena is an elite, board-certified clinician possessing dual BDS and MDS credentials. With over 15 years of surgical, restorative, and aesthetic experience, Dr. Saxena is specialized in full-arch oral rehabilitation, pain-free microscope root canal procedures, and precision brace systems.',
    availableDays: [1, 2, 3, 4, 5, 6] // Monday - Saturday
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Marcus Sterling',
    role: 'Creative Director',
    rating: 5,
    comment: 'The Laser Whitening session was quick and produced beautiful results. I experienced zero tooth sensitivity because of Dr. Saxena\'s advanced preparation protocol. This clinic sets the peak gold standard!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 't2',
    name: 'Clara Oswald',
    role: 'High School Educator',
    rating: 5,
    comment: 'My kids used to fear the dentist, but Dr. Saxena was incredible! He made them feel entirely safe, heard, and relaxed throughout the session. I highly recommend him to all local families!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 't3',
    name: 'Julian Henderson',
    role: 'Tech Consultant',
    rating: 5,
    comment: 'Dr. Saxena explained my implant reconstruction plan with pristine clarity, showcasing the multi-dimensional scan model first. The procedure was comfortable, and recovery was completely seamless.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  }
];

export const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
];
