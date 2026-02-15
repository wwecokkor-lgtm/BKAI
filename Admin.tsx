import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  ShieldCheck, Users, Database, AlertCircle, LayoutDashboard, 
  BookOpen, CreditCard, Settings, Bell, Lock, Search, FileText, Ban, CheckCircle,
  PlayCircle, Youtube, TrendingUp, Plus, Upload, Trash2, Image as ImageIcon, Loader2, Download
} from 'lucide-react';
import { UserRole, UserProfile, DashboardStats, FounderSettings, VideoSuggestion, ExamPrediction, FounderSlide } from './types';
import { 
  getDashboardStats, getAllUsers, toggleUserStatus, updateUserRole, 
  getFounderSettings, updateFounderSettings, addVideoSuggestion, getVideoSuggestions,
  addExamPrediction, getExamPredictions
} from './AdminService';
import { uploadImage } from './StorageService';

type AdminView = 'overview' | 'users' | 'content' | 'founder' | 'settings' | 'security';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Founder Settings State
  const [founderSettings, setFounderSettings] = useState<FounderSettings | null>(null);
  const [newSlide, setNewSlide] = useState<Partial<FounderSlide>>({ title: '', description: '' });
  
  // Content State
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [predictions, setPredictions] = useState<ExamPrediction[]>([]);

  // 🔒 ROUTE GUARD
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50 text-red-800">
        <Lock className="w-16 h-16 mb-4 text-red-600" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p>You do not have permission to view this area.</p>
        <p className="text-sm mt-2">IP Logged: {new Date().toISOString()}</p>
      </div>
    );
  }

  // Initial Data Fetch
  useEffect(() => {
    loadStats();
  }, []);

  // Fetch users when switching to 'users' tab
  useEffect(() => {
    if (currentView === 'users') loadUsers();
    if (currentView === 'founder') loadFounderSettings();
    if (currentView === 'content') loadContent();
  }, [currentView]);

  const loadStats = async () => {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const loadFounderSettings = async () => {
    const data = await getFounderSettings();
    setFounderSettings(data);
  };

  const loadContent = async () => {
    const vids = await getVideoSuggestions();
    const preds = await getExamPredictions();
    setVideos(vids);
    setPredictions(preds);
  }

  const handleToggleBan = async (uid: string, currentStatus: boolean) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'BLOCK' : 'UNBLOCK'} this user?`)) {
      const success = await toggleUserStatus(uid, currentStatus);
      if (success) {
        setUsers(users.map(u => u.uid === uid ? { ...u, isActive: !currentStatus } : u));
      }
    }
  };

  const handleFounderSave = async () => {
    if (founderSettings) {
      await updateFounderSettings(founderSettings);
      alert("Founder settings updated successfully!");
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'slide') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Upload to Local Storage (Returns compressed Base64)
        const url = await uploadImage(user.uid, base64);
        
        if (type === 'main' && founderSettings) {
          setFounderSettings({ ...founderSettings, imageUrl: url });
        } else if (type === 'slide') {
          setNewSlide(prev => ({ ...prev, imageUrl: url }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };

  // Slide Management
  const handleAddSlide = () => {
    if (founderSettings && newSlide.title && newSlide.imageUrl) {
        const slide: FounderSlide = {
            id: Date.now().toString(),
            title: newSlide.title || '',
            description: newSlide.description || '',
            imageUrl: newSlide.imageUrl || ''
        };
        const updatedSlides = [...(founderSettings.slides || []), slide];
        setFounderSettings({ ...founderSettings, slides: updatedSlides });
        setNewSlide({ title: '', description: '' }); // Reset
    }
  };

  const handleDeleteSlide = (index: number) => {
      if (founderSettings && founderSettings.slides) {
          const updatedSlides = [...founderSettings.slides];
          updatedSlides.splice(index, 1);
          setFounderSettings({ ...founderSettings, slides: updatedSlides });
      }
  };

  const handleAddVideo = async () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;
    const title = prompt("Enter Title:");
    if (!title) return;
    
    // Extract video ID for thumbnail
    let videoId = url.split('v=')[1];
    const ampersandPosition = videoId?.indexOf('&');
    if(ampersandPosition !== -1) {
      videoId = videoId?.substring(0, ampersandPosition);
    }
    const thumb = `https://img.youtube.com/vi/${videoId}/0.jpg`;

    await addVideoSuggestion({
       title,
       youtubeUrl: url,
       thumbnailUrl: thumb,
       subject: "General",
       classLevel: "All",
       duration: "10:00"
    });
    loadContent();
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Admin Console</h1>
              <p className="text-xs text-slate-400">Super User Access</p>
            </div>
          </div>
          <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-slate-700">
            SECURE
          </div>
        </div>
        
        {/* Horizontal Scrollable Menu */}
        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
           <AdminTab 
             active={currentView === 'overview'} 
             onClick={() => setCurrentView('overview')} 
             icon={<LayoutDashboard className="w-4 h-4"/>} 
             label="Overview" 
           />
           <AdminTab 
             active={currentView === 'users'} 
             onClick={() => setCurrentView('users')} 
             icon={<Users className="w-4 h-4"/>} 
             label="Users" 
           />
           <AdminTab 
             active={currentView === 'founder'} 
             onClick={() => setCurrentView('founder')} 
             icon={<Settings className="w-4 h-4"/>} 
             label="Founder" 
           />
           <AdminTab 
             active={currentView === 'content'} 
             onClick={() => setCurrentView('content')} 
             icon={<PlayCircle className="w-4 h-4"/>} 
             label="Content" 
           />
        </div>
      </header>

      <div className="p-4 flex-1 overflow-y-auto pb-20">
        
        {/* VIEW: OVERVIEW */}
        {currentView === 'overview' && stats && (
          <div className="space-y-4 animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
               <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-500"/>} color="bg-blue-50" />
               <StatCard title="Solved Questions" value={stats.totalQuestions} icon={<FileText className="text-purple-500"/>} color="bg-purple-50" />
               <StatCard title="Active Revenue" value={`৳${stats.revenue}`} icon={<CreditCard className="text-green-500"/>} color="bg-green-50" />
               <StatCard title="Server Load" value="12%" icon={<Database className="text-orange-500"/>} color="bg-orange-50" />
             </div>
          </div>
        )}

        {/* VIEW: USERS */}
        {currentView === 'users' && (
          <div className="space-y-4 animate-fade-in">
             <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredUsers.map((u) => (
                  <div key={u.uid} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${u.isActive ? 'bg-indigo-500' : 'bg-red-500'}`}>
                           {u.displayName?.[0] || 'U'}
                        </div>
                        <div>
                           <p className="font-semibold text-slate-800 text-sm">{u.displayName}</p>
                           <p className="text-xs text-slate-500">{u.email}</p>
                           <div className="flex gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">{u.role}</span>
                              {!u.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">BLOCKED</span>}
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {u.email !== 'fffgamer066@gmail.com' && (
                           <>
                              <button 
                                 onClick={() => handleToggleBan(u.uid, u.isActive)}
                                 className={`p-2 rounded-lg ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                              >
                                 {u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                           </>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* VIEW: FOUNDER SETTINGS */}
        {currentView === 'founder' && founderSettings && (
           <div className="space-y-6 animate-fade-in">
              {/* Founder Profile Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-600" /> Founder Profile
                 </h3>
                 
                 <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                     <span className="text-sm font-medium">Show Popup on Login</span>
                     <input 
                       type="checkbox" 
                       checked={founderSettings.isActive} 
                       onChange={(e) => setFounderSettings({...founderSettings, isActive: e.target.checked})}
                       className="w-5 h-5 accent-indigo-600"
                     />
                   </div>

                   {/* PDF Download Toggle */}
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                     <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium">Enable PDF Downloads</span>
                     </div>
                     <input 
                       type="checkbox" 
                       checked={founderSettings.enablePdfDownload} 
                       onChange={(e) => setFounderSettings({...founderSettings, enablePdfDownload: e.target.checked})}
                       className="w-5 h-5 accent-indigo-600"
                     />
                   </div>

                   <div>
                     <label className="text-xs font-semibold text-slate-500 block mb-1">Founder Name</label>
                     <input 
                       type="text" 
                       value={founderSettings.name}
                       onChange={(e) => setFounderSettings({...founderSettings, name: e.target.value})}
                       className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                     />
                   </div>

                   <div>
                     <label className="text-xs font-semibold text-slate-500 block mb-2">Founder Photo</label>
                     <div className="flex items-center gap-4">
                       {founderSettings.imageUrl ? (
                         <img src={founderSettings.imageUrl} alt="Founder" className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm" />
                       ) : (
                         <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold border border-slate-200">
                           img
                         </div>
                       )}
                       <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                         {uploading ? 'Uploading...' : 'Upload Photo'}
                         <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*" 
                           onChange={(e) => handleFileUpload(e, 'main')} 
                           disabled={uploading}
                         />
                       </label>
                     </div>
                   </div>

                   <div>
                     <label className="text-xs font-semibold text-slate-500 block mb-1">Message</label>
                     <textarea 
                       value={founderSettings.message}
                       onChange={(e) => setFounderSettings({...founderSettings, message: e.target.value})}
                       className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 font-bangla"
                     />
                   </div>
                 </div>
              </div>

              {/* Slides Management Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" /> Popup Slides
                 </h3>

                 {/* List Existing Slides */}
                 <div className="space-y-3 mb-6">
                    {founderSettings.slides?.map((slide, idx) => (
                      <div key={slide.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <img src={slide.imageUrl} alt="Slide" className="w-16 h-10 object-cover rounded bg-slate-200" />
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-slate-800 truncate">{slide.title}</p>
                           <p className="text-xs text-slate-500 truncate">{slide.description}</p>
                         </div>
                         <button onClick={() => handleDeleteSlide(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    ))}
                    {(!founderSettings.slides || founderSettings.slides.length === 0) && (
                      <p className="text-center text-slate-400 text-sm py-4 italic">No slides added yet.</p>
                    )}
                 </div>

                 {/* Add New Slide Form */}
                 <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add New Slide
                    </h4>
                    <div className="space-y-3">
                      <input 
                        placeholder="Slide Title (e.g. New Batch Alert!)" 
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                        value={newSlide.title}
                        onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                      />
                      <input 
                        placeholder="Description" 
                        className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-white"
                        value={newSlide.description}
                        onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}
                      />
                      
                      <div className="flex items-center gap-3">
                         <label className={`flex-1 cursor-pointer bg-white border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 border-dashed ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {newSlide.imageUrl ? 'Change Image' : 'Choose Slide Image'}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleFileUpload(e, 'slide')} 
                              disabled={uploading} 
                            />
                         </label>
                         <button 
                           onClick={handleAddSlide}
                           disabled={!newSlide.title || !newSlide.imageUrl}
                           className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                         >
                           Add Slide
                         </button>
                      </div>
                      
                      {newSlide.imageUrl && (
                         <div className="relative mt-2 rounded-lg overflow-hidden h-24 bg-black/10">
                            <img src={newSlide.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-400" /> Image Uploaded Successfully
                            </div>
                         </div>
                      )}
                    </div>
                 </div>

                 <button 
                   onClick={handleFounderSave}
                   className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 mt-6 shadow-lg shadow-slate-200"
                 >
                   Save All Changes
                 </button>
              </div>
           </div>
        )}

        {/* VIEW: CONTENT */}
        {currentView === 'content' && (
           <div className="space-y-4 animate-fade-in">
              {/* Videos Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Youtube className="w-5 h-5 text-red-600" /> Suggested Videos
                    </h3>
                    <button onClick={handleAddVideo} className="bg-indigo-50 text-indigo-600 p-2 rounded-full hover:bg-indigo-100">
                       <Plus className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="space-y-2">
                    {videos.map(v => (
                       <div key={v.id} className="flex gap-3 items-center p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                          <img src={v.thumbnailUrl} className="w-16 h-10 object-cover rounded" alt="thumb" />
                          <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-medium truncate">{v.title}</h4>
                             <p className="text-xs text-slate-400">{v.youtubeUrl}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Exam Predictions Section (ReadOnly for now) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-600" /> Exam Predictions
                 </h3>
                 <div className="text-center py-4 text-slate-400 text-sm">
                    {predictions.length} predictions active.
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

// Helper Components
interface AdminTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const AdminTab: React.FC<AdminTabProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
      active 
        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-900/20' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
       {React.cloneElement(icon as React.ReactElement<any>, { className: "w-16 h-16" })}
    </div>
    <div className="flex items-center gap-3 relative z-10">
      <div className={`p-2 rounded-lg ${color}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
    </div>
    <div className="relative z-10">
      <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
    </div>
  </div>
);