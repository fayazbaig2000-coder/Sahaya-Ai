import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, MapPin, Calendar, Camera, AlertCircle, ChevronRight, Mic } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Language, useTranslation } from '../lib/translations';

export const ComplaintForm = ({ user, onComplete, lang }: { user: UserProfile, onComplete: () => void, lang: Language }) => {
  const { t } = useTranslation(lang);
  const [formData, setFormData] = useState({
    type: '',
    subCategory: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    isPanicMode: false,
    videoEvidence: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: Record<string, string[]> = {
    'Theft / Burglary': ['House Break-in', 'Vehicle Theft', 'Pickpocketing', 'Snatching'],
    'Cyber Crime': ['Online Fraud', 'Social Media Harassment', 'Hacking', 'Identity Theft'],
    'Harassment': ['Workplace Harassment', 'Domestic Violence', 'Stalking', 'Eve Teasing'],
    'Fraud': ['Financial Fraud', 'Property Fraud', 'Job Scam'],
    'Lost Item': ['Mobile Phone', 'Documents', 'Wallet', 'Vehicle Keys'],
    'Other': ['General Nuisance', 'Traffic Violation', 'Noise Pollution']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const referenceId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const complaintData = {
        userId: user.uid,
        userName: user.displayName,
        type: formData.type,
        subCategory: formData.subCategory,
        description: formData.description,
        location: {
          address: formData.location,
          latitude: 0,
          longitude: 0
        },
        timestamp: serverTimestamp(),
        status: 'PENDING',
        isPanicMode: formData.isPanicMode,
        referenceId,
        hasVideoEvidence: !!formData.videoEvidence
      };

      await addDoc(collection(db, 'complaints'), complaintData);
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'complaints');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('file_new_case')}</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('multilingual_portal')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('primary_category')}</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, subCategory: '' })}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="">{t('select_category') || 'Select Category'}</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {formData.type && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('sub_category')}</label>
              <select
                required
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="">{t('select_sub_category') || 'Select Sub-Category'}</option>
                {categories[formData.type].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </motion.div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('description')}</label>
            <button type="button" className="p-2 bg-green-50 text-green-600 rounded-full">
              <Mic size={16} />
            </button>
          </div>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('describe_placeholder') || "Describe what happened in detail..."}
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('location')}</label>
            <div className="relative">
              <input
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('location_placeholder') || "Area, Landmark"}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20"
              />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{t('date_time') || 'Date & Time'}</label>
            <div className="relative">
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden">
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setFormData({ ...formData, videoEvidence: e.target.files?.[0] || null })}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <Camera className={cn("transition-colors", formData.videoEvidence ? "text-green-600" : "text-gray-300")} size={32} />
          <h4 className="text-sm font-bold text-gray-900">
            {formData.videoEvidence ? formData.videoEvidence.name : t('video_evidence')}
          </h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            {formData.videoEvidence ? t('click_to_change') || "Click to change video" : t('upload_video_hint') || "Upload a video of the incident (Max 10MB)"}
          </p>
          <div className="mt-2 text-[8px] font-mono text-gray-300 uppercase">MP4, MOV, AVI UP TO 1080P</div>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          formData.isPanicMode ? "bg-red-50 border-red-200" : "bg-gray-50 border-transparent"
        )}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPanicMode}
              onChange={(e) => setFormData({ ...formData, isPanicMode: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
            />
            <div>
              <span className="text-sm font-bold text-gray-900 block">{t('panic_mode')} ({t('anonymous_reporting') || 'Anonymous Reporting'})</span>
              <span className="text-[10px] text-gray-500">{t('panic_mode_hint') || 'Your identity will be redacted until a human officer reviews the case.'}</span>
            </div>
          </label>
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? t('filing') || "Filing..." : t('submit_complaint')}
          {!isSubmitting && <ChevronRight size={20} />}
        </button>
      </form>
    </div>
  );
};
