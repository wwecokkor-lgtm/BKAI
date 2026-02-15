import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { FounderSettings } from './types';
import { getFounderSettings } from './AdminService';

export const FounderPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<FounderSettings | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const checkAndShow = async () => {
      const dontShow = localStorage.getItem('hideFounderPopup');
      if (dontShow === 'true') return;

      const data = await getFounderSettings();
      if (data && data.isActive) {
        setSettings(data);
        setIsOpen(true);
      }
    };
    checkAndShow();
  }, []);

  const handleClose = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('hideFounderPopup', 'true');
    }
    setIsOpen(false);
  };

  const nextSlide = () => {
    if (settings && settings.slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % settings.slides.length);
    }
  };

  const prevSlide = () => {
    if (settings && settings.slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + settings.slides.length) % settings.slides.length);
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200">
        
        {/* Close Button */}
        <button 
          onClick={() => handleClose(false)}
          className="absolute top-3 right-3 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Carousel Section */}
        {settings.slides.length > 0 ? (
          <div className="relative w-full h-48 bg-slate-100">
             <img 
               src={settings.slides[currentSlide].imageUrl} 
               alt="Slide" 
               className="w-full h-full object-cover transition-all duration-500"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <h3 className="font-bold text-lg">{settings.slides[currentSlide].title}</h3>
                <p className="text-xs opacity-90">{settings.slides[currentSlide].description}</p>
             </div>

             {/* Arrows */}
             <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-1 rounded-full text-white hover:bg-black/50">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-1 rounded-full text-white hover:bg-black/50">
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        ) : (
          <div className="h-4 bg-indigo-600 w-full"></div>
        )}

        {/* Founder Info Section */}
        <div className="p-6 text-center">
           <div className="relative inline-block mb-3">
             {settings.imageUrl ? (
               <img src={settings.imageUrl} alt={settings.name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto object-cover" />
             ) : (
               <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto border-4 border-white shadow-lg text-indigo-500">
                 <User className="w-10 h-10" />
               </div>
             )}
             <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
           </div>
           
           <h2 className="text-xl font-bold text-slate-800">{settings.name}</h2>
           <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-4">Founder & CEO</p>
           
           <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed font-bangla border border-slate-100">
              "{settings.message}"
           </div>

           <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                 <input 
                   type="checkbox" 
                   onChange={(e) => {
                     if (e.target.checked) handleClose(true);
                   }}
                   className="rounded text-indigo-600 focus:ring-indigo-500" 
                 />
                 Do not show again
              </label>
              
              <button 
                onClick={() => handleClose(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                Let's Learn
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};