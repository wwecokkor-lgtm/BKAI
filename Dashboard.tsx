import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BrainCircuit, BookOpen, Clock, Zap, Youtube, PlayCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { getVideoSuggestions, getExamPredictions } from './AdminService';
import { VideoSuggestion, ExamPrediction } from './types';

interface DashboardProps {
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [predictions, setPredictions] = useState<ExamPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const vids = await getVideoSuggestions();
      // Filter videos locally based on class or show all if "All"
      const filteredVids = vids.filter(v => v.classLevel === 'All' || v.classLevel === user?.classLevel);
      
      const preds = await getExamPredictions(user?.classLevel);
      setVideos(filteredVids);
      setPredictions(preds);
      setLoading(false);
    };
    if (user) fetchData();
  }, [user]);

  if (!user) return null;

  const displayName = user.displayName || 'Student';
  const firstName = displayName.split(' ')[0] || 'Student';
  const initial = displayName[0] || 'S';

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hi, {firstName} 👋</h1>
          <p className="text-slate-500 text-sm">Ready to learn {user.classLevel || 'Class 9'}?</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
          {initial}
        </div>
      </div>

      {/* Stats Card - Unlimited Version */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium mb-1">Today's Activity</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold">{user.dailyUsage}</span>
            <span className="text-indigo-200 mb-1">Questions Solved</span>
          </div>
          <div className="text-xs bg-white/20 inline-block px-2 py-1 rounded text-white/90">
             🚀 Unlimited Access
          </div>
        </div>
        <Zap className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 rotate-12" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('solver')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition group text-left"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <BrainCircuit className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-bold text-slate-800">Ask AI Tutor</h3>
          <p className="text-xs text-slate-400 mt-1">Solve Homework</p>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition group text-left"
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-slate-800">History</h3>
          <p className="text-xs text-slate-400 mt-1">Review Answers</p>
        </button>
      </div>

      {/* 🔥 SMART STUDY SUGGESTION ENGINE */}
      <div className="bg-gradient-to-br from-white to-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Study Plan
        </h3>
        <div className="flex gap-3">
          <div className="w-1 bg-indigo-500 rounded-full"></div>
          <div>
            <p className="text-sm text-slate-700 font-medium font-bangla">
              তোমার গণিতের <span className="text-indigo-600 font-bold">বীজগণিত</span> অংশ দুর্বল মনে হচ্ছে।
            </p>
            <p className="text-xs text-slate-500 mt-1 font-bangla">
              আজ অধ্যায় ৩.২ এর অনুশীলন করুন এবং উদাহরণগুলো দেখুন।
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 EXAM PREDICTION SYSTEM */}
      {predictions.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-purple-600" /> Exam Predictions
          </h3>
          <div className="space-y-3">
            {predictions.map(pred => (
              <div key={pred.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                 <div>
                   <h4 className="font-semibold text-slate-800 text-sm">{pred.topic}</h4>
                   <p className="text-xs text-slate-500">{pred.subject}</p>
                 </div>
                 <div className="text-right">
                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                     pred.importance === 'High' ? 'bg-red-100 text-red-600' : 
                     pred.importance === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                   }`}>
                     {pred.probability}% Chance
                   </span>
                 </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-100 p-2 rounded-lg">
               <AlertTriangle className="w-3 h-3" />
               Prediction based on past trends. Not guaranteed.
            </div>
          </div>
        </div>
      )}

      {/* 🔥 YOUTUBE VIDEO SUGGESTIONS */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-600" /> Recommended Classes
        </h3>
        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
          {videos.length > 0 ? videos.map((vid) => (
            <a 
              key={vid.id} 
              href={vid.youtubeUrl} 
              target="_blank" 
              rel="noreferrer"
              className="min-w-[200px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group block"
            >
              <div className="relative h-28 bg-slate-200">
                <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                   <PlayCircle className="w-10 h-10 text-white opacity-80 group-hover:opacity-100" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 rounded">{vid.duration}</span>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-slate-800 text-xs line-clamp-2 mb-1">{vid.title}</h4>
                <p className="text-[10px] text-slate-500">{vid.subject}</p>
              </div>
            </a>
          )) : (
            <div className="w-full text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
              No recommendations available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};