
import React, { useState } from 'react';
import { User, CareRequest, RequestStatus } from '../types';
import { ShieldCheck, Package, MapPin, Clock, Trophy, Download, Smartphone, Star, Phone, CheckCircle, Award, History, Wallet, Zap, ChevronRight, Lock, FileText, Image as ImageIcon } from 'lucide-react';
import { CATEGORY_STYLES, STATUS_STYLES, TRANSLATIONS } from '../constants';
import { generateCertificatePDF, CertTier } from '../utils/calculations';

interface HelperDashboardProps {
  language: 'English' | 'Tamil';
  user: User;
  allRequests: CareRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
  onAcceptRequest: (id: string) => void;
}

const HelperDashboard: React.FC<HelperDashboardProps> = ({ language, user, allRequests, onUpdateStatus, onAcceptRequest }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'assigned' | 'discover' | 'history'>('assigned');
  
  const myAssigned = allRequests.filter(r => r.helperId === user.id && r.status !== 'completed' && r.status !== 'cancelled');
  const hasActiveTask = myAssigned.length > 0;

  const available = allRequests.filter(req => {
    if (req.status !== 'searching' || req.helperId) return false;
    if (!user.categories?.includes(req.category)) return false;
    if (hasActiveTask) return false;

    if (req.category === 'Basic') {
      const isSmallTask = req.distanceKm <= 4 && req.hours <= 3;
      if (user.helperType === 'Student') return isSmallTask;
      return !isSmallTask;
    }
    if (user.helperType === 'Student') return false;
    return true;
  });
  
  const myHistory = allRequests.filter(r => r.helperId === user.id && (r.status === 'completed' || r.status === 'cancelled'));
  const completedTasks = myHistory.filter(r => r.status === 'completed');

  const totalEarnings = completedTasks.filter(r => r.isPaid).reduce((acc, curr) => acc + curr.payment, 0);
  const processedTasks = completedTasks.filter(r => r.isPaid && r.rating !== undefined);
  const avgRating = processedTasks.length > 0 ? processedTasks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / processedTasks.length : 0;
  const processedCount = processedTasks.length;

  let currentTier: CertTier = 'Bronze';
  if (avgRating >= 4.8) currentTier = 'Gold';
  else if (avgRating >= 4.0) currentTier = 'Silver';

  const canEarnCert = user.helperType === 'Student' || user.helperType === 'Volunteer';
  const eligibleForCert = canEarnCert && processedCount >= 3;

  const handleNextStatus = (req: CareRequest) => {
    const sequence: RequestStatus[] = ['searching', 'assigned', 'on_the_way', 'in_progress', 'completed'];
    const currentIdx = sequence.indexOf(req.status);
    if (currentIdx !== -1 && currentIdx < sequence.length - 1) {
      onUpdateStatus(req.id, sequence[currentIdx + 1]);
    }
  };

  const getStatusActionLabel = (status: RequestStatus) => {
    switch(status) {
      case 'assigned': return t.onMyWay;
      case 'on_the_way': return t.startService;
      case 'in_progress': return t.markFinished;
      default: return t.next;
    }
  };

  const getElderDetails = (elderId: string) => {
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    return users.find((u: User) => u.id === elderId);
  };

  if (user.verificationStatus === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="w-48 h-48 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-10 border-8 border-white shadow-2xl animate-pulse">
          <ShieldCheck size={100} />
        </div>
        <h1 className="text-6xl font-black mb-6 text-gray-900 tracking-tight">{t.profileUnderReview}</h1>
        <p className="text-gray-400 text-2xl max-w-xl mx-auto font-bold">{t.verificationPending}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-left group hover:shadow-2xl transition-all">
          <div className="text-xs font-black text-emerald-600 mb-6 uppercase tracking-[0.3em] opacity-60">{t.verifiedSuccess}</div>
          <div className="text-6xl font-black text-gray-900 tracking-tighter">{processedCount}</div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-left group hover:shadow-2xl transition-all">
          <div className="text-xs font-black text-blue-600 mb-6 uppercase tracking-[0.3em] opacity-60">{t.clearedEarnings}</div>
          <div className="text-6xl font-black text-gray-900 tracking-tighter">₹{totalEarnings}</div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-left group hover:shadow-2xl transition-all">
          <div className="text-xs font-black text-amber-600 mb-6 uppercase tracking-[0.3em] opacity-60">{language === 'English' ? 'Avg Rating' : 'சராசரி மதிப்பீடு'}</div>
          <div className="text-6xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            {avgRating > 0 ? avgRating.toFixed(1) : '0.0'} <Star className="text-yellow-400 fill-yellow-400" size={40} />
          </div>
        </div>

        {canEarnCert && (
          <div className={`relative overflow-hidden p-10 rounded-[3.5rem] shadow-2xl text-white flex flex-col justify-between transition-all duration-500 text-left ${eligibleForCert ? 'bg-emerald-600' : 'bg-gray-900'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={120} /></div>
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">{t.officialRecognition}</div>
              {eligibleForCert ? (
                <div className="space-y-6">
                  <div className="font-black text-3xl flex items-center gap-3"><Award size={32} className="text-yellow-400" /> {currentTier}</div>
                  <button 
                    onClick={() => generateCertificatePDF(user.name, user.orgName || 'CareCircle', processedCount, avgRating, currentTier, language)}
                    className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
                  >
                    <Download size={20} /> {t.downloadCert}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-lg font-black">{3 - processedCount} {t.moreNeeded}</div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${(processedCount / 3) * 100}%` }}></div>
                  </div>
                  <p className="text-[10px] font-bold opacity-60 italic">{t.unlockCert}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-12 overflow-x-auto no-scrollbar">
        {[
          { id: 'assigned', label: `${t.activeTab} (${myAssigned.length})`, icon: Package },
          { id: 'discover', label: t.nearbyTab, icon: MapPin },
          { id: 'history', label: t.historyTab, icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-12 py-5 rounded-3xl font-black flex items-center gap-4 transition-all ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
            }`}
          >
            <tab.icon size={22} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'assigned' && (
        <div className="space-y-10 text-left">
          {myAssigned.length === 0 ? (
            <div className="py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-50 text-gray-400 flex flex-col items-center justify-center gap-6">
              <Package size={48} />
              <p className="text-2xl font-black italic">{t.noAssignedTasks}</p>
              <button onClick={() => setActiveTab('discover')} className="text-emerald-600 font-black flex items-center gap-2 hover:gap-4 transition-all">{t.browseOpportunities} <ChevronRight size={20} /></button>
            </div>
          ) : (
            myAssigned.map(req => {
              const elder = getElderDetails(req.elderId);
              return (
                <div key={req.id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row gap-16 animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden group">
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                      <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${CATEGORY_STYLES[req.category]}`}>{t[req.category as keyof typeof t]}</span>
                      <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-600 text-white shadow-lg animate-pulse`}>{t[`h_${req.status}` as keyof typeof t] || req.status}</span>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-10 leading-tight group-hover:text-emerald-600 transition-colors">{req.description}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-gray-500 mb-14">
                      <div className="flex flex-col gap-2 font-bold"><div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.pickupAddress}</div><div className="flex items-center gap-3 text-gray-900 font-black text-xl"><MapPin size={24} className="text-emerald-500" /> {req.pickupAddress}</div></div>
                      <div className="flex flex-col gap-2 font-bold"><div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.estHours}</div><div className="flex items-center gap-3 text-gray-900 font-black text-xl"><Clock size={24} className="text-emerald-500" /> {req.hours} {t.estHours}</div></div>
                      <div className="flex flex-col gap-2 font-bold"><div className="text-[10px] text-gray-400 uppercase tracking-widest">{t.payment}</div><div className="flex items-center gap-3 text-emerald-600 font-black text-3xl tracking-tighter">₹{req.payment}</div></div>
                    </div>

                    {req.photo && (
                      <div className="mb-14 p-8 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FileText size={14} /> {t.elderAttachedPhoto}</div>
                        {req.photo.startsWith('data:application/pdf') ? (
                          <a href={req.photo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 px-10 py-5 bg-white rounded-2xl text-red-600 font-black text-xl shadow-lg border-2 border-red-50 hover:bg-red-50 transition-all">
                            <FileText size={28} /> {language === 'English' ? 'View PDF Document' : 'PDF ஆவணத்தைப் பார்க்கவும்'}
                          </a>
                        ) : (
                          <img src={req.photo} alt="Task Proof" className="w-full max-w-lg rounded-[2rem] shadow-2xl border-8 border-white group-hover:scale-[1.02] transition-transform duration-500" />
                        )}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleNextStatus(req)} 
                      className="w-full sm:w-auto px-20 py-7 bg-emerald-600 text-white rounded-[2rem] font-black text-2xl hover:bg-emerald-700 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                      {getStatusActionLabel(req.status)} <ChevronRight size={28} />
                    </button>
                  </div>
                  <div className="w-full lg:w-96 bg-gray-50 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center border-4 border-white shadow-inner relative z-10">
                    <div className="w-28 h-28 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center text-5xl font-black mb-8 shadow-2xl">{elder?.avatar}</div>
                    <div className="font-black text-3xl text-gray-900 mb-2 tracking-tight">{elder?.name}</div>
                    <div className="text-emerald-600 font-black text-xl mb-10 flex items-center gap-2 bg-emerald-50 px-6 py-2 rounded-full shadow-sm"><Phone size={20} /> {elder?.phone}</div>
                    <a href={`tel:${elder?.phone}`} className="w-full py-6 bg-white text-emerald-600 rounded-2xl font-black text-2xl border-4 border-emerald-50 flex items-center justify-center gap-4 shadow-xl hover:bg-emerald-50 transition-all active:scale-95">
                      <Smartphone size={28} /> {t.callElder}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {available.length === 0 && !hasActiveTask && (
            <div className="col-span-full py-32 text-center text-gray-400 font-black italic text-xl">{t.noTasksMatch}</div>
          )}
          {hasActiveTask && (
             <div className="col-span-full py-20 bg-amber-50 rounded-[3rem] border-4 border-dashed border-amber-200 flex flex-col items-center justify-center gap-4 text-amber-800 text-center">
                <Lock size={48} />
                <p className="text-xl font-black">{language === 'English' ? 'Focus Mode Active' : 'செயலில் உள்ள பணி உள்ளது'}</p>
                <p className="font-bold opacity-60 max-w-sm">{language === 'English' ? 'Finish your active task before picking up a new one.' : 'புதிய பணியைப் பெற தற்போதைய பணியை முடிக்கவும்.'}</p>
             </div>
          )}
          {available.map(req => (
            <div key={req.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-col hover:shadow-2xl transition-all group animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-8">
                <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${CATEGORY_STYLES[req.category]}`}>{t[req.category as keyof typeof t]}</span>
                <span className="text-4xl font-black text-emerald-600 tracking-tighter">₹{req.payment}</span>
              </div>
              <h4 className="font-black text-2xl text-gray-900 mb-8 leading-tight flex-1 line-clamp-3 group-hover:text-emerald-600 transition-colors">{req.description}</h4>
              <div className="space-y-4 mb-10 text-gray-500 font-bold border-t-2 border-gray-50 pt-8">
                <div className="flex items-center gap-3 text-lg"><MapPin size={22} className="text-emerald-500" /> {req.pickupAddress}</div>
                <div className="flex items-center gap-3 text-lg"><Clock size={22} className="text-emerald-500" /> {req.hours} {t.estHours}</div>
                <div className="flex items-center gap-3 text-lg"><Zap size={22} className="text-emerald-500" /> {req.distanceKm} KM</div>
              </div>
              <button 
                onClick={() => onAcceptRequest(req.id)}
                className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xl hover:bg-black shadow-xl active:scale-95 transition-all"
              >
                {t.signup}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-xl animate-in fade-in duration-700 text-left">
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
              {myHistory.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-black italic text-xl">{language === 'English' ? 'No history logs.' : 'பதிவுகள் எதுவும் இல்லை.'}</td></tr>
              ) : (
                myHistory.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-12 py-10 text-gray-400">{new Date(req.timestamp).toLocaleDateString()}</td>
                    <td className="px-12 py-10">
                      <div className="font-black text-xl text-gray-900 mb-1">{t[req.category as keyof typeof t]}</div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest line-clamp-1">{req.description}</div>
                    </td>
                    <td className="px-12 py-10">
                       <div className="flex flex-col gap-2">
                        {req.status === 'cancelled' ? (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-center bg-red-50 text-red-500">{t.cancelled}</span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-center bg-green-50 text-green-600 border border-green-100 flex items-center justify-center gap-2"><CheckCircle size={12} /> {t.completed}</span>
                            {!req.isPaid ? (
                               <span className="text-[9px] text-red-500 font-black uppercase text-center animate-pulse">{t.pendingElderAction}</span>
                            ) : !req.rating ? (
                               <span className="text-[9px] text-amber-600 font-black uppercase text-center">{t.ratingPending}</span>
                            ) : (
                               <div className="flex justify-center text-yellow-400 gap-0.5">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < req.rating! ? 'currentColor' : 'none'} />)}
                               </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="text-3xl font-black text-gray-900">₹{req.payment}</div>
                      {req.isPaid && <div className="text-[10px] text-emerald-600 font-black uppercase mt-1">✓ {t.confirmedPaid}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HelperDashboard;
