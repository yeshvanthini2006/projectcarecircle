
import React, { useState, useRef, useEffect } from 'react';
import { User, CareRequest, ServiceCategory, RequestStatus } from '../types';
import { PlusCircle, Clock, History, MapPin, Phone, Mic, Camera, Star, X, User as UserIcon, Loader2, Square, Navigation, Trash2, Wallet, Check, Search, FileText } from 'lucide-react';
import { calculatePayment } from '../utils/calculations';
import { CATEGORY_STYLES, STATUS_STYLES, TRANSLATIONS } from '../constants';

interface ElderDashboardProps {
  language: 'English' | 'Tamil';
  user: User;
  requests: CareRequest[];
  onCreateRequest: (req: CareRequest) => void;
  onCancelRequest: (id: string) => void;
  onPayRequest: (id: string) => void;
  onAddFeedback: (id: string, rating: number, feedback: string) => void;
}

const ElderDashboard: React.FC<ElderDashboardProps> = ({ 
  language, user, requests, onCreateRequest, onCancelRequest, onPayRequest, onAddFeedback 
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'create' | 'my' | 'history'>('my');
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [showTrackerModal, setShowTrackerModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [category, setCategory] = useState<ServiceCategory>('Basic');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState(1);
  const [hours, setHours] = useState(1);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState(user.address || '');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
        }
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language]);

  const startRecording = () => { if (recognitionRef.current) { setIsRecording(true); recognitionRef.current.start(); } };
  const stopRecording = () => { if (recognitionRef.current) { recognitionRef.current.stop(); setIsRecording(false); } };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: CareRequest = {
      id: `req-${Date.now()}`,
      elderId: user.id,
      helperId: null,
      category,
      description,
      distanceKm: distance,
      hours,
      pickupAddress: pickup || (language === 'English' ? 'Home' : 'வீடு'),
      dropAddress: drop,
      status: 'searching',
      timestamp: new Date().toISOString(),
      payment: calculatePayment(category, distance, hours),
      isPaid: false,
      photo: attachedFile || undefined
    };
    onCreateRequest(newReq);
    setActiveTab('my');
    setDescription('');
    setDistance(1);
    setHours(1);
    setAttachedFile(null);
    setFileType(null);
  };

  const getHelperDetails = (helperId: string | null) => {
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    return users.find((u: User) => u.id === helperId);
  };

  const STATUS_STEPS: {status: RequestStatus, icon: any}[] = [
    { status: 'searching', icon: Search },
    { status: 'assigned', icon: UserIcon },
    { status: 'on_the_way', icon: Navigation },
    { status: 'in_progress', icon: Clock },
    { status: 'completed', icon: Check }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-emerald-600 rounded-[3rem] p-12 text-white mb-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex-1">
          <h1 className="text-5xl font-black mb-4 tracking-tight">{t.welcomeUser}, {user.name.split(' ')[0]}!</h1>
          <p className="text-emerald-50 text-xl font-medium opacity-90">{t.tagline}</p>
        </div>
        <button 
          onClick={() => setActiveTab('create')}
          className="relative z-10 px-10 py-5 bg-white text-emerald-600 rounded-[2rem] font-black text-xl shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
        >
          <PlusCircle size={28} /> {t.postNewNeed}
        </button>
      </div>

      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
        {[
          { id: 'my', label: t.tracking, icon: Navigation },
          { id: 'history', label: t.pastActivity, icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 text-left">
          <form onSubmit={handleCreate} className="space-y-10">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 block">{t.selectCategory}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {(['Basic', 'Technical', 'Personal'] as ServiceCategory[]).map(cat => (
                  <button 
                    key={cat} type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-6 rounded-[2rem] border-4 font-black transition-all flex flex-col items-center gap-2 ${
                      category === cat ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{t[cat as keyof typeof t]}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest">{t[`${cat}Desc` as keyof typeof t]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.distanceKm}</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                  <input type="number" min="1" value={distance} onChange={e => setDistance(parseInt(e.target.value))} className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-black text-2xl border-2 border-transparent transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.estHours}</label>
                <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                  <input type="number" min="1" value={hours} onChange={e => setHours(parseInt(e.target.value))} className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-black text-2xl border-2 border-transparent transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.requestDetails}</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-blue-100"><Camera size={18} /> {t.addPhoto}</button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileType(file.type.includes('pdf') ? 'pdf' : 'image');
                      const r = new FileReader(); r.onload = () => setAttachedFile(r.result as string); r.readAsDataURL(file);
                    }
                  }} />
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-emerald-100"><Mic size={18} /> {t.recordVoice}</button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="p-4 bg-red-100 text-red-600 rounded-2xl animate-pulse flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-red-200"><Square size={18} fill="currentColor" /> {t.stopRecord}</button>
                  )}
                </div>
              </div>
              <div className="relative">
                <textarea 
                  required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={isRecording ? t.transcribing : (language === 'English' ? "Tell us what you need..." : "உங்களுக்கு என்ன தேவை என்பதை சொல்லுங்கள்...")}
                  className={`w-full px-8 py-8 bg-gray-50 rounded-[2.5rem] min-h-[180px] outline-none font-bold text-xl resize-none shadow-inner border-2 border-transparent focus:border-emerald-100 transition-all ${isRecording ? 'bg-emerald-50 border-emerald-300' : ''}`}
                />
                {attachedFile && (
                  <div className="absolute bottom-6 right-6 group">
                    {fileType === 'pdf' ? (
                      <div className="w-24 h-24 rounded-2xl bg-white border-4 border-gray-100 flex flex-col items-center justify-center text-red-500 shadow-xl">
                        <FileText size={32} />
                        <span className="text-[8px] font-black mt-1">PDF</span>
                      </div>
                    ) : (
                      <img src={attachedFile} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" alt="Preview" />
                    )}
                    <button type="button" onClick={() => {setAttachedFile(null); setFileType(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-emerald-50 rounded-[3rem] flex flex-col sm:flex-row justify-between items-center gap-8 border-4 border-emerald-100 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.3em] opacity-60">{t.estFee}</span>
                <div className="text-5xl font-black text-emerald-600 tracking-tighter">₹{calculatePayment(category, distance, hours)}</div>
              </div>
              <button type="submit" className="w-full sm:w-auto px-16 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl hover:bg-emerald-700 shadow-2xl active:scale-95 transition-all">
                {t.submitRequest}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200"><Search size={40} /></div>
              <p className="text-gray-400 font-black italic text-xl">{t.noActiveTasks}</p>
            </div>
          ) : (
            requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(req => {
              const helper = getHelperDetails(req.helperId);
              const canCancel = req.status === 'searching';
              
              return (
                <div key={req.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col hover:shadow-2xl transition-all group text-left">
                  <div className="flex justify-between items-start mb-8">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[req.category]}`}>{t[req.category as keyof typeof t]}</span>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_STYLES[req.status]}`}>{t[req.status as keyof typeof t]}</span>
                      {canCancel && (
                        <button onClick={() => onCancelRequest(req.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2">
                          <Trash2 size={12} /> {t.cancel}
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-black text-2xl mb-8 text-gray-900 flex-1 line-clamp-3 group-hover:text-emerald-600 transition-colors">{req.description}</h3>
                  
                  {helper ? (
                    <div className="mb-8 p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex items-center gap-4 shadow-sm">
                      <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg">{helper.avatar}</div>
                      <div className="flex-1">
                        <div className="font-black text-xl text-gray-900">{helper.name}</div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">✓ {t.verifiedHelper}</div>
                      </div>
                      <a href={`tel:${helper.phone}`} className="p-4 bg-white text-emerald-600 rounded-xl shadow-md border border-emerald-100 hover:scale-110 active:scale-90 transition-all"><Phone size={20} /></a>
                    </div>
                  ) : (
                    <div className="mb-8 p-8 bg-gray-50 rounded-[2rem] text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{language === 'English' ? 'Searching for nearby helpers...' : 'உதவியாளரை தேடுகிறது...'}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-8 border-t-2 border-gray-50 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.payment}</span>
                      <span className="font-black text-emerald-600 text-3xl tracking-tighter">₹{req.payment}</span>
                    </div>
                    <button 
                      onClick={() => setShowTrackerModal(req.id)}
                      className="bg-gray-900 text-white px-8 py-5 rounded-2xl text-sm font-black hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                      <Navigation size={18} /> {t.viewProgress}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showTrackerModal && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-6 z-[200]">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowTrackerModal(null)} className="absolute top-10 right-10 p-4 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-all"><X size={24} /></button>
            <div className="mb-12 text-left">
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{t.activityStatus}</h2>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                {t.realtimeUpdate}
              </div>
            </div>
            
            {(() => {
              const req = requests.find(r => r.id === showTrackerModal);
              if (!req) return null;
              const helper = getHelperDetails(req.helperId);
              const currentStepIdx = STATUS_STEPS.findIndex(s => s.status === req.status);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  <div className="relative pl-6">
                    <div className="absolute left-12 top-6 bottom-6 w-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="w-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ height: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="space-y-12 relative z-10">
                      {STATUS_STEPS.map((stepObj, idx) => {
                        const isCompleted = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const Icon = stepObj.icon;

                        return (
                          <div key={stepObj.status} className="flex items-center gap-8">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-700 ${
                              isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 
                              isCurrent ? 'bg-white border-emerald-600 text-emerald-600 shadow-2xl scale-125' : 
                              'bg-white border-gray-100 text-gray-300'
                            }`}>
                              {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={20} />}
                            </div>
                            <div className={`transition-all duration-500 ${
                              isCompleted ? 'text-emerald-900 opacity-40' : 
                              isCurrent ? 'text-gray-900 scale-110 origin-left' : 
                              'text-gray-300'
                            }`}>
                              <div className="text-lg font-black">{t[stepObj.status as keyof typeof t]}</div>
                              {isCurrent && <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">{language === 'English' ? 'LIVE NOW' : 'நேரடி'}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-8">
                    {helper ? (
                      <>
                        <div className="p-8 bg-emerald-50 rounded-[3rem] border-4 border-emerald-100 text-center shadow-sm">
                          <div className="w-24 h-24 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-xl mx-auto mb-6">{helper.avatar}</div>
                          <h4 className="text-2xl font-black text-gray-900 mb-1">{helper.name}</h4>
                          <div className="text-xs text-emerald-600 font-black tracking-widest uppercase mb-8">✓ {t.verifiedHelper}</div>
                          <a href={`tel:${helper.phone}`} className="flex items-center justify-center gap-3 w-full py-5 bg-white text-emerald-600 rounded-2xl font-black text-xl hover:bg-emerald-100 transition-all shadow-md">
                            <Phone size={24} /> {t.callElder}
                          </a>
                        </div>
                        
                        {req.status === 'completed' && !req.isPaid && (
                          <div className="bg-red-50 p-8 rounded-[3rem] border-4 border-red-100 text-center animate-in slide-in-from-bottom-8 duration-700">
                            <p className="text-red-900 font-black text-xl mb-6">{language === 'English' ? 'Awaiting Payment' : 'கட்டணம் செலுத்தவும்'}</p>
                            <button onClick={() => { onPayRequest(req.id); setShowTrackerModal(null); }} className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-2xl hover:bg-emerald-700 shadow-2xl active:scale-95 transition-all">
                              {t.payRequest} (₹{req.payment})
                            </button>
                          </div>
                        )}

                        {req.isPaid && !req.rating && req.status === 'completed' && (
                          <button onClick={() => { setShowFeedbackModal(req.id); setShowTrackerModal(null); }} className="w-full py-6 bg-amber-500 text-white rounded-2xl font-black text-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4 shadow-xl">
                            <Star size={28} fill="currentColor" /> {t.rateHelper}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-12 text-center bg-gray-50 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center gap-6">
                        <Loader2 className="animate-spin text-emerald-600" size={48} />
                        <p className="text-gray-400 font-black italic text-xl max-w-[200px]">{language === 'English' ? 'Searching for helper...' : 'உதவியாளரை தேடுகிறது...'}</p>
                      </div>
                    )}
                    <button onClick={() => setShowTrackerModal(null)} className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all mt-auto">{t.close}</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl animate-in fade-in duration-700 text-left">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-12 py-10">{t.date}</th>
                <th className="px-12 py-10">{t.category}</th>
                <th className="px-12 py-10">{t.status}</th>
                <th className="px-12 py-10 text-right">{t.payment}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {requests.filter(r => r.status === 'completed' || r.status === 'cancelled').length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-black italic">{language === 'English' ? 'No history yet.' : 'வரலாறு எதுவும் இல்லை.'}</td></tr>
              ) : (
                requests.filter(r => r.status === 'completed' || r.status === 'cancelled').map(req => {
                  const isUnpaid = req.status === 'completed' && !req.isPaid;
                  const isUnrated = req.status === 'completed' && req.isPaid && !req.rating;
                  
                  return (
                    <tr key={req.id} className={`hover:bg-gray-50/50 transition-colors ${isUnpaid || isUnrated ? 'bg-amber-50/20' : ''}`}>
                      <td className="px-12 py-10 text-gray-400">{new Date(req.timestamp).toLocaleDateString()}</td>
                      <td className="px-12 py-10">
                        <div className="font-black text-xl text-gray-900 mb-1">{t[req.category as keyof typeof t]}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest line-clamp-1">{req.description}</div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col gap-2">
                          {req.status === 'cancelled' ? (
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-center bg-red-50 text-red-500 border border-red-100">{t.cancelled}</span>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {isUnpaid ? (
                                <button onClick={() => onPayRequest(req.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"><Wallet size={12} /> {t.payRequest}</button>
                              ) : isUnrated ? (
                                <button onClick={() => setShowFeedbackModal(req.id)} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"><Star size={12} /> {t.rateHelper}</button>
                              ) : (
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-center bg-green-50 text-green-600 border border-green-100 flex items-center justify-center gap-2"><Check size={12} /> {t.completed}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="text-3xl font-black text-gray-900 mb-2">₹{req.payment}</div>
                        {req.rating && (
                          <div className="flex justify-end text-yellow-400 gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < req.rating! ? 'currentColor' : 'none'} />)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[300]">
          <div className="bg-white rounded-[4rem] p-16 w-full max-w-xl relative shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowFeedbackModal(null)} className="absolute top-10 right-10 p-4 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-all"><X size={24} /></button>
            <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><Star size={48} fill="currentColor" /></div>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{t.rateTitle}</h2>
            <div className="flex justify-center gap-4 my-12">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} onClick={() => setRating(num)} className={`transition-all hover:scale-125 ${rating >= num ? 'text-yellow-400' : 'text-gray-200'}`}>
                  <Star size={56} fill={rating >= num ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <textarea 
              value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder={t.howWasService}
              className="w-full p-8 bg-gray-50 rounded-[2.5rem] h-40 outline-none mb-10 font-bold text-lg resize-none border-4 border-transparent focus:border-emerald-100 shadow-inner"
            />
            <button onClick={() => { onAddFeedback(showFeedbackModal!, rating, feedback); setShowFeedbackModal(null); }} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-emerald-700 shadow-2xl active:scale-95 transition-all">
              {t.finishRate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderDashboard;
