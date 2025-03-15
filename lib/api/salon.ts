export interface SalonData {
  username: string;
  salonName: string;
  about?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  location?: {
    streetNumber?: string;
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zip?: string;
    placeId?: string;
    inputLocation?: string;
    timezone?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  media?: {
    logo?: {
      url: string;
      key: string;
    };
    images?: Array<{
      url: string;
      key: string;
    }>;
  };
  businessHours?: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }>;
  services?: Array<{
    categoryName: string;
    subServices: Array<{
      title: string;
      description: string;
      price: number;
      duration: number;
    }>;
  }>;
  amenities?: string[];
  notifications?: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    emailRecipients: Array<{ email: string; enabled: boolean }>;
    smsRecipients: Array<{ phone: string; enabled: boolean }>;
  };
  payments?: {
    stripeConnected: boolean;
    stripeAccountId?: string;
    autoPayouts: boolean;
    payoutSchedule?: 'daily' | 'weekly' | 'monthly';
  };
  calendar?: {
    googleConnected: boolean;
    googleCalendarId?: string;
    syncEnabled: boolean;
    notificationsEnabled: boolean;
  };
}

// Create a context to share salon data across components
import { createContext, useContext } from 'react';
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SalonContext = createContext<{
  salonData: SalonData | null;
  setSalonData: (data: SalonData) => void;
  updateSalonField: (field: string, value: any) => Promise<void>;
} | null>(null);

export const useSalon = () => {
  const context = useContext(SalonContext);

  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};

export async function getSalonData(username: string): Promise<SalonData> {
  try {
    const { data } = await api.get<SalonData>(`/api/salons/${username}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch salon data');
    }
    throw error;
  }
}

export async function updateSalonData(
  username: string,
  data: Partial<SalonData> | FormData,
  isFormData: boolean = false
): Promise<SalonData> {
  try {
    // Set proper headers for FormData (multipart/form-data)
    const config = isFormData 
      ? { 
          headers: { 
            'Content-Type': 'multipart/form-data',
          }
        } 
      : {};
    
    // Make the API call
    const { data: responseData } = await api.put<SalonData>(
      `/api/salons/${username}`,
      data,
      config
    );
    
    return responseData;
  } catch (error) {
    console.error('Error in updateSalonData:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update salon data');
    }
    throw error;
  }
}

export async function deleteSalonImage(username: string, key: string): Promise<SalonData> {
  try {
    const { data } = await api.delete<SalonData>(`/api/salons/${username}/image/${encodeURIComponent(key)}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete salon image');
    }
    throw error;
  }
}