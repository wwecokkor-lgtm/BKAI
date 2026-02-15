import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Question, UserRole, SUBJECTS_NCTB } from './types';
import { getUserHistory, getGlobalHistory, deleteQuestion, toggleQuestionFavorite } from './FirestoreService';
import { MathRenderer } from './MathRenderer';
import { AnswerPreview } from './AnswerPreview';
import { generatePdf } from './PdfGenerator';
import { 
  Search, Filter, Calendar, Download, Trash2, Eye, Star, 
  MoreVertical, FileText, ChevronDown, Check, X, Copy, Share2,
  Clock, Zap, BookOpen, BarChart3, Loader2, RefreshCw
} from 'lucide-react';

export const History: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Today' | 'Week' | 'Month'>('All');
  const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');
  
  // Admin Mode
  const [adminViewAll, setAdminViewAll] = useState(false);

  // Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Initial Load
  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: Question[] = [];
      if (adminViewAll && user.role === UserRole.ADMIN) {
        data = await getGlobalHistory();
      } else {
        data = await getUserHistory(user.uid);
      }
      setQuestions(data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, adminViewAll]);

  // Actions
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this history item?")) {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (selectedQuestion?.id === id) setSelectedQuestion(null);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, q: Question) => {
    e.stopPropagation();
    // Optimistic Update
    const newStatus = !q.isFavorite;
    setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, isFavorite: newStatus } : item));
    await toggleQuestionFavorite(q.id, !!q.isFavorite);
  };

  const handleDownloadPdf = async (q: Question) => {
    // Open modal first to ensure content is rendered for PDF generator
    setSelectedQuestion(q);
    setTimeout(async () => {
        setGeneratingPdf(true);
        try {
            await generatePdf('history-preview-container', `Solution_${q.subject}_${Date.now()}.pdf`);
        } catch (e) {
            alert("Could not generate PDF. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    }, 500); // Wait for modal to open
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Subject", "Class", "Question", "Answer"];
    const csvContent = [
        headers.join(","),
        ...filteredQuestions.map(q => {
            const date = new Date(q.timestamp).toLocaleDateString();
            const cleanQ = `"${q.questionText.replace(/"/g, '""')}"`;
            const cleanA = `"${q.answer.replace(/"/g, '""').substring(0, 100)}..."`;
            return `${date},${q.subject},${q.classLevel},${cleanQ},${cleanA}`;
        })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bk_academy_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Logic
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // 1. Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.questionText.toLowerCase().includes(lower) || 
        q.answer.toLowerCase().includes(lower) ||
        q.subject.toLowerCase().includes(lower)
      );
    }

    // 2. Subject
    if (selectedSubject !== 'All') {
      result = result.filter(q => q.subject === selectedSubject);
    }

    // 3. Time
    const now = new Date();
    if (timeFilter === 'Today') {
      result = result.filter(q => new Date(q.timestamp).toDateString() === now.toDateString());
    } else if (timeFilter === 'Week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      result = result.filter(q => new Date(q.timestamp) > weekAgo);
    } else if (timeFilter === 'Month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        result = result.filter(q => new Date(q.timestamp) > monthAgo);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortOrder === 'Newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

    return result;
  }, [questions, searchTerm, selectedSubject, timeFilter, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: questions.length,
      favorites: questions.filter(q => q.isFavorite).length,
      mathCount: questions.filter(q => q.subject.includes('Math')).length,
      scienceCount: questions.filter(q => ['Physics', 'Chemistry', 'Biology'].includes(q.subject)).length
    };
  }, [questions]);

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      
      {/* 1. Statistics Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Learning History</h1>
            <p className="text-slate-500 text-sm mt-1">Track your progress and review solutions.</p>
          </div>
          <div className="flex gap-2">
            {user?.role === UserRole.ADMIN && (
                <button 
                  onClick={() => setAdminViewAll(!adminViewAll)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${adminViewAll ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                    <UsersIcon /> {adminViewAll ? 'Global View' : 'My View'}
                </button>
            )}
            <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-2"
            >
                <FileText className="w-4 h-4"/> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <StatCard label="Total Solved" value={stats.total} icon={<Zap className="text-amber-500" />} color="bg-amber-50" />
           <StatCard label="Favorites" value={stats.favorites} icon={<Star className="text-yellow-500" />} color="bg-yellow-50" />
           <StatCard label="Math Problems" value={stats.mathCount} icon={<BarChart3 className="text-blue-500" />} color="bg-blue-50" />
           <StatCard label="Science Topics" value={stats.scienceCount} icon={<BookOpen className="text-green-500" />} color="bg-green-50" />
        </div>
      </div>

      {/* 2. Toolbar */}
      <div className="p-4 md:p-6 pb-2">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search questions or answers..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                <select 
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none bg-white hover:bg-slate-50 cursor-pointer"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                >
                   <option value="All">All Time</option>
                   <option value="Today">Today</option>
                   <option value="Week">This Week</option>
                   <option value="Month">This Month</option>
                </select>

                <select 
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none bg-white hover:bg-slate-50 cursor-pointer max-w-[150px]"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                   <option value="All">All Subjects</option>
                   {SUBJECTS_NCTB.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button 
                  onClick={() => setSortOrder(prev => prev === 'Newest' ? 'Oldest' : 'Newest')}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap"
                >
                   <Filter className="w-4 h-4" /> {sortOrder}
                </button>
            </div>
         </div>
      </div>

      {/* 3. Content List */}
      <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No questions found matching your filters.</p>
                <button onClick={() => {setSearchTerm(''); setTimeFilter('All'); setSelectedSubject('All')}} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">
                    Clear Filters
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {filteredQuestions.map((q) => (
                    <div 
                        key={q.id} 
                        onClick={() => setSelectedQuestion(q)}
                        className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative"
                    >
                        {/* Status Strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        {q.subject}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(q.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleToggleFavorite(e, q)}
                                        className={`p-1.5 rounded-full hover:bg-slate-100 transition ${q.isFavorite ? 'text-yellow-500' : 'text-slate-300'}`}
                                    >
                                        <Star className="w-4 h-4" fill={q.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, q.id)}
                                        className="p-1.5 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                {q.questionImage && (
                                    <div className="shrink-0 w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                                        <img src={q.questionImage} alt="Q" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-relaxed mb-2">
                                        {q.questionText || "Image Question"}
                                    </h3>
                                    {/* Mini Preview of Answer (Text Only approx) */}
                                    <div className="text-xs text-slate-500 line-clamp-2 font-bangla">
                                        {q.answer.replace(/[*#$]/g, ' ').substring(0, 150)}...
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                                <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Full Solution <ChevronDown className="w-3 h-3 -rotate-90" />
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownloadPdf(q); }}
                                    className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 4. Full Preview Modal */}
      {selectedQuestion && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-slate-100 w-full h-[90vh] max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
              
              {/* Modal Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
                 <div>
                    <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> Solution Preview
                    </h2>
                    <p className="text-xs text-slate-500">{new Date(selectedQuestion.timestamp).toLocaleString()} • {selectedQuestion.subject}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleDownloadPdf(selectedQuestion)}
                        disabled={generatingPdf}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download PDF
                    </button>
                    <button 
                        onClick={() => setSelectedQuestion(null)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                 </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-auto bg-slate-200/50 p-4 md:p-8 flex justify-center">
                 <div className="bg-white shadow-2xl min-h-full w-full max-w-[210mm] shrink-0">
                    <AnswerPreview 
                        id="history-preview-container"
                        user={user} 
                        subject={selectedQuestion.subject}
                        classLevel={selectedQuestion.classLevel}
                        question={selectedQuestion.questionText}
                        answer={selectedQuestion.answer}
                    />
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition">
        <div className={`p-2 rounded-lg ${color} shrink-0`}>
            {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold truncate">{label}</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);