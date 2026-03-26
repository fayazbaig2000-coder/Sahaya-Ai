import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, PhoneCall, Shield, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const stations = [
  { id: '1', name: 'Itukalapalli Police Station', distance: '4.0 km', time: '7.8 minutes', type: 'Nearby Police Station' },
  { id: '2', name: 'Rapthadu Police Station', distance: '4.8 km', time: '12.1 minutes', type: 'Nearby Police Station' },
  { id: '3', name: 'One Town Police Station', distance: '6.7 km', time: '15.4 minutes', type: 'Nearby Police Station' },
  { id: '4', name: 'IV TOWN POLICE STATION NEW BUILDING ANANTAPUR', distance: '7.2 km', time: '18.2 minutes', type: 'Nearby Police Station' },
  { id: '5', name: 'Four Town Police Station', distance: '8.1 km', time: '20.5 minutes', type: 'Nearby Police Station' },
  { id: '6', name: 'Traffic Police Station', distance: '8.5 km', time: '21.3 minutes', type: 'Nearby Police Station' },
];

export const NearbyStations = () => {
  const [selectedStation, setSelectedStation] = React.useState<any>(null);

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Nearby Police Stations</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Multilingual Police Portal</p>
          </div>
        </div>
        
        {selectedStation ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button 
              onClick={() => setSelectedStation(null)}
              className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mb-4"
            >
              <ChevronRight size={14} className="rotate-180" /> Back to list
            </button>
            <div className="p-4 bg-gray-900 rounded-3xl overflow-hidden relative aspect-video">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/800/450')] bg-cover bg-center opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                  <Navigation className="text-green-400 mx-auto mb-2" size={32} />
                  <p className="text-white font-bold text-sm">Navigating to {selectedStation.name}</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Real-time GPS Active</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-900">
                  {selectedStation.distance} • {selectedStation.time}
                </div>
                <button className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  Open in Google Maps
                </button>
              </div>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-black text-xl text-gray-900 mb-2">{selectedStation.name}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Anantapur, AP</span>
                </div>
                <div className="flex items-center gap-1">
                  <PhoneCall size={14} />
                  <span>+91 99887 76655</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-6">Emergency & Legal Assistance</p>
            
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
              <p className="text-xs text-gray-600 italic leading-relaxed">
                "The closest police station is Itukalapalli Police Station, located 4.0 kilometers away with a driving travel time of 7.8 minutes."
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stations.map((station) => (
                <motion.div
                  key={station.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedStation(station)}
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <Shield size={18} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Navigation size={10} />
                      <span>{station.distance}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{station.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{station.type}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between pt-3 border-t border-gray-50">
                    <button className="p-2 bg-green-50 text-green-600 rounded-full">
                      <PhoneCall size={14} />
                    </button>
                    <button className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      View Map <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-gray-900 rounded-3xl text-white">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="text-green-400" size={20} />
          <h3 className="font-bold text-lg">Why this matters?</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          In case of emergencies or when you need to report an incident in person, knowing the nearest police station is critical. SAHAYA AI uses real-time location data to provide you with immediate assistance and legal protection.
        </p>
      </div>
    </div>
  );
};
