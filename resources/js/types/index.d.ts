export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string
  role?: string
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// types/index.d.ts

export interface Image {
  id: number;
  image_path: string;
}

export interface SwimmingPool {
  id: number;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  pool_type: string;
  water_type: string;
  facilities: string;
status: 'active' | 'inactive'; // Add this line
  price: string;
  main_image: string;
  gallery_images: string[] | null;
  opening_hours: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// types.ts
export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  start_date: string; // e.g. "2025-04-05 14:30:00"
  end_date: string;
  event_type: string;
  organizer: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  price: string | null;
  capacity: number | null;
  main_image: string | null; // path like "events/abc.jpg"
  gallery_images: string[] | null; // array of paths
  status: 'active' | 'inactive' | 'sold_out' | 'cancelled';
  tags: string[];
  created_at: string;
  updated_at: string;
}


export interface Spa {
  id: number;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  treatment_type: string;
  ambiance_type: string;
  facilities: string;
  status: 'active' | 'inactive';
  price: string;
  main_image: string;
  gallery_images: string[] | null;
  opening_hours: Record<string, { open: boolean; from: string; to: string }>;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: number;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  equipment_type: string;
  gym_type: string;
  facilities: string;
  status: 'active' | 'inactive';
  price: string;
  main_image: string;
  gallery_images: string[] | null;
  opening_hours: Record<string, { open: boolean; from: string; to: string }>;
  created_at: string;
  updated_at: string;
}

interface Award {
  id: string;
  title: string;
  description: string;
  year: string;
  image: File | string | null; // Can be File (new upload), string (existing path), or null
  existing_image?: string;
}

interface Restaurant {
  id: number;
  name: string;
  location: string;
  description: string;
  cuisine_type: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHours;
  special_closure_days: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  capacity: number;
  features: string[];
  reservation_policy: string;
  has_daily_menu: boolean;
  daily_menu_email: string;
  main_image: File | string | null; // Can be File (new upload), string (existing path), or null
  gallery_images: (File | string)[]; // Array of Files or strings
  menu_pdf: File | string | null;
  owner_full_name: string;
  owner_bio: string;
  owner_experience_years: number;
  owner_specialties: string;
  owner_education: string;
  owner_image: File | string | null;
  awards: Award[];
  is_active: boolean;
}
// Add other existing interfaces as needed
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: {
    user: User;
  };
};
