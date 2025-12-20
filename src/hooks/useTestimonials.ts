import { useState, useEffect } from "react";
import { testimonials as initialTestimonials } from "@/data/dummyData";
import { toast } from "sonner";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  batch: string;
  testimonial: string;
}

const STORAGE_KEY = "portal_testimonials";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTestimonials;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  }, [testimonials]);

  const addTestimonial = (testimonial: Omit<Testimonial, "id">) => {
    const newTestimonial = {
      ...testimonial,
      id: Date.now(), // Use timestamp as ID for uniqueness
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    toast.success("Testimonial added successfully");
  };

  const deleteTestimonial = (id: number) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    toast.success("Testimonial deleted successfully");
  };

  return {
    testimonials,
    addTestimonial,
    deleteTestimonial,
  };
};
