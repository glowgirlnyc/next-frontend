"use client"

import { ReactNode, useState, useEffect } from 'react';
import { SalonContext, type SalonData, getSalonData, updateSalonData } from '@/lib/api/salon';
import { toast } from 'sonner';

interface SalonProviderProps {
  children: ReactNode;
  username: string;
}

export function SalonProvider({ children, username }: SalonProviderProps) {
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const data = await getSalonData(username);

        setSalonData(data);
      } catch (error) {
        toast.error("Failed to load salon data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalonData();
  }, [username]);

  const updateSalonField = async (field: string, value: any) => {
    if (!salonData) return
  
    try {
      // If value is FormData, send it directly without nesting
      if (value instanceof FormData) {
        const updatedData = await updateSalonData(username, value, true)
        setSalonData(updatedData)
        toast.success("Changes saved successfully")
        return
      }
  
      // For JSON updates, maintain the existing logic
      const updateObject = field.split(".").reduceRight((acc, key) => ({ [key]: acc }), value)
  
      setSalonData((prev) => (prev ? { ...prev, ...updateObject } : null))
      const updatedData = await updateSalonData(username, updateObject)
      setSalonData(updatedData)
      toast.success("Changes saved successfully")
    } catch (error) {
      const originalData = await getSalonData(username)
      setSalonData(originalData)
      toast.error("Failed to save changes")
      console.error(error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SalonContext.Provider value={{ salonData, setSalonData, updateSalonField }}>
      {children}
    </SalonContext.Provider>
  );
} 