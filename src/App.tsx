import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  History as HistoryIcon, 
  User, 
  Settings as SettingsIcon,
  Shield,
  PhoneCall,
  MapPin,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  LogOut,
  Send,
  Mic,
  Camera,
  Search,
  Globe
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from './firebase';
import { cn } from './lib/utils';
import { UserProfile, Complaint, Message } from './types';
import { chatWithAssistant } from './services/geminiService';
import { ComplaintForm } from './components/ComplaintForm';
import { NearbyStations } from './components/NearbyStations';
import { Settings } from './components/Settings';

// --- Helpers ---
const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

// --- Components ---

const SOSButton = () => {
  const [isPressed, setIsPressed] = useState(false);

  const handleSOS = () => {
    setIsPressed(true);
    // In a real app, this would trigger an emergency alert
    setTimeout(() => setIsPressed(false), 3000);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Emergency</h2>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSOS}
        className={cn(
          "w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors",
          isPressed ? "bg-red-600" : "bg-red-500"
        )}
      >
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
          <PhoneCall className="text-white w-8 h-8" />
        </div>
        <span className="text-white font-black text-2xl tracking-tighter uppercase">Quick SOS</span>
        <span className="text-white/80 text-xs font-medium uppercase tracking-widest">Tap for Emergency</span>
      </motion.button>
      <div className="mt-4 flex items-center justify-center gap-2 text-red-600 font-bold">
        <PhoneCall size={16} />
        <span>Police 100</span>
      </div>
    </div>
  );
};

const SahayaLite = () => (
  <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Support</h2>
    </div>
    <div className="flex items-start gap-3">
      <div className="p-2 bg-green-50 rounded-lg">
        <Navigation className="text-green-600 w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900">Sahaya Lite</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Rural area with spotty 5G/4G? Use our Zero-Connectivity Lite mode via SMS or USSD.
        </p>
        <div className="mt-3 flex gap-4">
          <div className="text-[10px] font-mono bg-gray-50 px-2 py-1 rounded">SMS "HELP" to 56767</div>
          <div className="text-[10px] font-mono bg-gray-50 px-2 py-1 rounded">DIAL *123# for USSD</div>
        </div>
      </div>
    </div>
  </div>
);

const ServiceCard = ({ icon: Icon, title, subtitle, color, onClick }: any) => (
  <motion.button
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 gap-3 text-center"
  >
    <div className={cn("p-4 rounded-2xl", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
  </motion.button>
);

const AIAssistant = ({ user }: { user: UserProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `Hello! I am Sahaya AI, specialized in police reporting. I can help you prepare a CCTNS-compatible complaint. How can I help you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      history.push({ role: 'user', text: input });
      const response = await chatWithAssistant(history);
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response || 'Sorry, I encountered an error.', timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          <Shield className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Sahaya AI Assistant</h2>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Online • Multilingual</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user' ? "bg-green-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <button className="p-3 bg-gray-100 rounded-xl text-gray-500">
            <Mic size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the incident in any language..."
              className="w-full p-3 pr-12 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-600/20"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LanguageSelector = ({ onSelect }: { onSelect: (lang: string) => void }) => {
  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-green-100">
        <Globe className="text-white w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Select Language</h1>
      <p className="text-gray-500 mb-12 uppercase tracking-widest text-[10px] font-bold">Choose your preferred language</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(lang.code)}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-100 transition-colors group"
          >
            <span className="text-lg font-bold text-gray-900 group-hover:text-green-700">{lang.native}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{lang.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const OfficerDashboard = ({ user }: { user: UserProfile }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (complaintId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status,
        assignedOfficerId: user.uid,
        officerName: user.displayName,
        officerRank: 'Sub-Inspector', // Mock rank
        officerPhone: user.phoneNumber || '9988776655'
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Officer Portal</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Manage Incoming Cases</p>
        </div>
        <div className="p-3 bg-blue-600 text-white rounded-2xl">
          <Shield size={24} />
        </div>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.id} className="p-5 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900">{c.type}</h3>
                <p className="text-[10px] text-gray-400 font-mono">ID: {c.referenceId}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                c.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                c.status === 'IN_PROGRESS' ? "bg-blue-50 text-blue-600" :
                c.status === 'RESOLVED' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {c.status}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User size={14} className="text-gray-400" />
                <span>Victim: {c.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                <span>Location: {c.location.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock size={14} className="text-gray-400" />
                <span>Filed: {formatDateTime(c.timestamp)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-4 italic">"{c.description}"</p>

            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateStatus(c.id, 'IN_PROGRESS')}
                className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              >
                Accept Case
              </button>
              <button 
                onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                className="flex-1 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OfficerDetails = ({ complaint }: { complaint: Complaint }) => {
  if (!complaint.assignedOfficerId) {
    return (
      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4">
        <div className="p-3 bg-white rounded-2xl text-amber-600">
          <Clock size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Under Review</h4>
          <p className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">An officer will be assigned shortly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
          <Shield size={32} />
        </div>
        <div>
          <h4 className="font-bold text-green-900">{complaint.officerName}</h4>
          <p className="text-[10px] text-green-700 uppercase tracking-widest font-bold">{complaint.officerRank}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-700/60 font-bold uppercase tracking-widest">Contact</span>
          <span className="text-green-900 font-bold">{complaint.officerPhone}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-700/60 font-bold uppercase tracking-widest">Status</span>
          <span className="text-green-900 font-bold">{complaint.status}</span>
        </div>
      </div>
      <button className="mt-4 w-full py-3 bg-white text-green-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
        <PhoneCall size={16} />
        Call Officer
      </button>
    </div>
  );
};

const History = ({ user }: { user: UserProfile }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-black text-gray-900 tracking-tight">Case Tracking</h2>
      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{complaints.length} Total Reports</p>
      
      {complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <Clock className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm text-gray-400">No reports found.</p>
        </div>
      ) : (
        complaints.map((c) => (
          <div key={c.id} className="p-5 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{c.type}</h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <Clock size={10} />
                  <span>{formatDateTime(c.timestamp)}</span>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                c.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                c.status === 'IN_PROGRESS' ? "bg-blue-50 text-blue-600" :
                c.status === 'RESOLVED' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {c.status}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Handling Officer</h4>
              <OfficerDetails complaint={c} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Ref: {c.referenceId}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const Profile = ({ user }: { user: UserProfile }) => (
  <div className="p-4 space-y-6">
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-300">
            {user.displayName.charAt(0)}
          </div>
        )}
      </div>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.displayName}</h2>
      <p className="text-sm text-gray-500">{user.email}</p>
      <div className="mt-4 flex gap-2">
        <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
          {user.role}
        </div>
        <div className="px-4 py-1.5 bg-green-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
          {user.preferredLanguage?.toUpperCase()}
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Account Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">Member Since</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {formatDate(user.memberSince)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <PhoneCall size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">Phone</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{user.phoneNumber || 'Not provided'}</span>
          </div>
        </div>
      </div>
    </div>

    <button 
      onClick={() => signOut(auth)}
      className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2"
    >
      <LogOut size={20} />
      Sign Out
    </button>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [pendingRole, setPendingRole] = useState<'CITIZEN' | 'OFFICER' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          // If a specific role was selected during login, update it
          if (pendingRole && userData.role !== pendingRole) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), { role: pendingRole });
            userData.role = pendingRole;
          }
          setUser(userData);
          if (!userData.preferredLanguage) {
            setShowLangSelector(true);
          }
        } else {
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            memberSince: serverTimestamp(),
            role: pendingRole || 'CITIZEN'
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
          setShowLangSelector(true);
        }
      } else {
        setUser(null);
        setShowLangSelector(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pendingRole]);

  const handleLogin = async (role: 'CITIZEN' | 'OFFICER') => {
    try {
      setPendingRole(role);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLanguageSelect = async (lang: string) => {
    if (user) {
      const updatedUser = { ...user, preferredLanguage: lang };
      await updateDoc(doc(db, 'users', user.uid), { preferredLanguage: lang });
      setUser(updatedUser);
      setShowLangSelector(false);
    }
  };

  const handleRoleSwitch = async (role: 'CITIZEN' | 'OFFICER') => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { role });
      setUser({ ...user, role });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sahaya AI Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-200">
          <Shield className="text-white w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">SAHAYA AI</h1>
        <p className="text-gray-500 max-w-xs mb-12 leading-relaxed">
          Your multilingual companion for safety and justice. Select your portal to continue.
        </p>
        
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => handleLogin('CITIZEN')}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
          >
            <span className="text-lg">Victim Portal</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Login with Google</span>
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            onClick={() => handleLogin('OFFICER')}
            className="w-full py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-all active:scale-95"
          >
            <span className="text-lg">Police Portal</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Officer Authentication</span>
          </button>
        </div>
      </div>
    );
  }

  if (showLangSelector) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 tracking-tight leading-none">SAHAYA AI</h1>
            <p className="text-[8px] font-bold text-green-600 uppercase tracking-widest mt-0.5">Multilingual Police Portal</p>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">{user.role} PORTAL</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <User size={20} />
          </button>
          <button onClick={() => setActiveTab('settings')} className="text-gray-500 hover:text-gray-900 transition-colors">
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              {user.role === 'CITIZEN' ? (
                <>
                  <SOSButton />
                  <SahayaLite />

                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Welcome, {user.displayName.split(' ')[0]}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Your safety is our priority. Use the AI Complain assistant for instant reporting.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <ServiceCard 
                      icon={FileText} 
                      title="File Case" 
                      subtitle="Online Reporting" 
                      color="bg-blue-50 text-blue-600"
                      onClick={() => setActiveTab('file-case')}
                    />
                    <ServiceCard 
                      icon={MessageSquare} 
                      title="AI Assistant" 
                      subtitle="Chat in any language" 
                      color="bg-green-50 text-green-600"
                      onClick={() => setActiveTab('chat')}
                    />
                    <ServiceCard 
                      icon={HistoryIcon} 
                      title="Track Case" 
                      subtitle="Officer Details" 
                      color="bg-amber-50 text-amber-600"
                      onClick={() => setActiveTab('history')}
                    />
                    <ServiceCard 
                      icon={MapPin} 
                      title="Nearby Police" 
                      subtitle="Find help locally" 
                      color="bg-purple-50 text-purple-600"
                      onClick={() => setActiveTab('nearby')}
                    />
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <PhoneCall size={16} className="text-red-500" />
                        Emergency Contacts
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Police', num: '100', color: 'bg-red-50 text-red-600' },
                          { label: 'Ambulance', num: '108', color: 'bg-blue-50 text-blue-600' },
                          { label: 'Fire', num: '101', color: 'bg-orange-50 text-orange-600' },
                          { label: 'Women Help', num: '1091', color: 'bg-pink-50 text-pink-600' }
                        ].map(contact => (
                          <div key={contact.label} className={cn("p-3 rounded-2xl flex flex-col gap-1", contact.color)}>
                            <span className="text-[10px] font-bold uppercase opacity-70">{contact.label}</span>
                            <span className="text-lg font-black">{contact.num}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-900 rounded-3xl text-white">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-green-400 mb-4 flex items-center gap-2">
                        <Shield size={16} />
                        Safety Steps
                      </h3>
                      <ul className="space-y-3">
                        {[
                          'Always keep your location services active.',
                          'Use Panic Mode for anonymous reporting.',
                          'Share your live location with trusted contacts.',
                          'Keep emergency numbers on speed dial.'
                        ].map((step, i) => (
                          <li key={i} className="flex gap-3 text-xs text-gray-400">
                            <span className="text-green-500 font-bold">0{i+1}</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <OfficerDashboard user={user} />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'file-case' && (
            <motion.div
              key="file-case"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-[60] bg-white overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b sticky top-0 bg-white z-10">
                <button onClick={() => setActiveTab('home')} className="p-2 text-gray-500">
                  <ChevronRight className="rotate-180" />
                </button>
                <h2 className="font-bold">File New Case</h2>
                <div className="w-10" />
              </div>
              <ComplaintForm user={user} onComplete={() => setActiveTab('history')} />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-white"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 flex items-center justify-between border-b">
                  <button onClick={() => setActiveTab('home')} className="p-2 text-gray-500">
                    <ChevronRight className="rotate-180" />
                  </button>
                  <h2 className="font-bold">AI Assistant</h2>
                  <div className="w-10" />
                </div>
                <AIAssistant user={user} />
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <History user={user} />
            </motion.div>
          )}

          {activeTab === 'nearby' && (
            <motion.div
              key="nearby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <NearbyStations />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Profile user={user} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="Home" />
        </div>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all",
      active ? "text-green-600 scale-110" : "text-gray-400 hover:text-gray-600"
    )}
  >
    <Icon size={24} className={cn(active && "fill-green-600/10")} />
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);
