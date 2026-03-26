import React from 'react';
import { motion } from 'motion/react';
import { Bell, Globe, Lock, Accessibility, FileText, AlertTriangle, ChevronRight, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const SettingItem = ({ icon: Icon, title, subtitle }: any) => (
  <button className="w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-white transition-colors">
        <Icon size={20} />
      </div>
      <div className="text-left">
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{subtitle}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

export const Settings = () => {
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [smsAlerts, setSmsAlerts] = React.useState(false);
  const [notifTypes, setNotifTypes] = React.useState({
    caseUpdates: true,
    emergencyAlerts: true,
    systemNews: false
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-900 text-white rounded-lg">
          <Shield size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Portal Settings</h2>
      </div>

      <div className="space-y-3">
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900">Notification Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Email Alerts</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Case status updates via email</p>
              </div>
              <button 
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  emailAlerts ? "bg-green-500" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  emailAlerts ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">SMS Alerts</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Instant mobile notifications</p>
              </div>
              <button 
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  smsAlerts ? "bg-green-500" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  smsAlerts ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Notification Types</p>
              <div className="space-y-3">
                {Object.entries(notifTypes).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={value}
                      onChange={() => setNotifTypes({...notifTypes, [key]: !value})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-xs text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SettingItem icon={Globe} title="Language & Region" subtitle="Set your preferred portal language" />
        <SettingItem icon={Lock} title="Privacy" subtitle="Control your data sharing preferences" />
        <SettingItem icon={Accessibility} title="Accessibility" subtitle="Adjust font size and contrast" />
        <SettingItem icon={FileText} title="System Report" subtitle="Architecture & Protocol" />
      </div>

      <div className="pt-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h3>
        <button className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-red-100">
          <AlertTriangle size={20} />
          Delete Account
        </button>
        <p className="mt-3 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>
    </div>
  );
};
