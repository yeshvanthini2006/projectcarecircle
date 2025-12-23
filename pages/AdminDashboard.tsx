import React, { useState } from 'react';
import { User, CareRequest, VerificationStatus } from '../types';
import { Users, FileCheck, TrendingUp, CheckCircle, XCircle, Search, Eye, X } from 'lucide-react';
import { CATEGORY_STYLES, STATUS_STYLES, TRANSLATIONS } from '../constants';

interface AdminDashboardProps {
  language: 'English' | 'Tamil';
  users: User[];
  requests: CareRequest[];
  onUpdateUserStatus: (id: string, status: VerificationStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, users, requests, onUpdateUserStatus }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'helpers' | 'requests'>('helpers');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDocs, setViewingDocs] = useState<string[] | null>(null);

  const helpers = users.filter(u => u.role === 'helper');
  const totalRevenue = requests.filter(r => r.status === 'completed').reduce((acc, curr) => acc + curr.payment, 0);

  const filteredHelpers = helpers.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t.totalHelpers}</p>
            <p className="text-5xl font-black text-gray-900 leading-none">{helpers.length}</p>
          </div>
          <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl"><Users size={40} /></div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t.serviceRequests}</p>
            <p className="text-5xl font-black text-gray-900 leading-none">{requests.length}</p>
          </div>
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl"><FileCheck size={40} /></div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t.totalVolume}</p>
            <p className="text-5xl font-black text-gray-900 leading-none">₹{totalRevenue}</p>
          </div>
          <div className="p-5 bg-purple-50 text-purple-600 rounded-3xl"><TrendingUp size={40} /></div>
        </div>
      </div>

      <div className="flex gap-4 mb-10">
        <button onClick={() => setActiveTab('helpers')} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all ${activeTab === 'helpers' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white text-gray-500 border border-gray-100'}`}>
          <Users size={20} /> {t.helpersTab}
        </button>
        <button onClick={() => setActiveTab('requests')} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-white text-gray-500 border border-gray-100'}`}>
          <FileCheck size={20} /> {t.tasksTab}
        </button>
      </div>

      {activeTab === 'helpers' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.helperVerification}</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={t.searchHelpers}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none font-bold"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-6">{t.helperIdentity}</th>
                  <th className="px-8 py-6">{t.idVerification}</th>
                  <th className="px-8 py-6">{t.status}</th>
                  <th className="px-8 py-6 text-right">{t.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredHelpers.map(helper => (
                  <tr key={helper.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xl">{helper.avatar}</div>
                        <div>
                          <div className="text-gray-900">{helper.name}</div>
                          <div className="text-xs text-gray-400 font-medium">{helper.helperType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => setViewingDocs(helper.documents || [])}
                        className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                      >
                        <Eye size={16} /> {t.viewProofs}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        helper.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 
                        helper.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t[helper.verificationStatus as keyof typeof t] || helper.verificationStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {helper.verificationStatus === 'pending' && (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => onUpdateUserStatus(helper.id, 'verified')}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => onUpdateUserStatus(helper.id, 'rejected')}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewingDocs && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-8 z-[200]">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-4xl relative shadow-2xl h-[80vh] flex flex-col overflow-hidden">
            <button onClick={() => setViewingDocs(null)} className="absolute top-8 right-8 p-3 bg-gray-100 rounded-full hover:bg-gray-200"><X /></button>
            <h2 className="text-4xl font-black mb-10">{t.verificationDocs}</h2>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-8 pr-4">
              {viewingDocs.map((doc, i) => (
                <div key={i} className="space-y-4">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Document #{i + 1}</div>
                  <img src={doc} alt="Proof" className="w-full rounded-3xl border border-gray-100 shadow-lg" />
                </div>
              ))}
            </div>
            <button onClick={() => setViewingDocs(null)} className="mt-8 py-5 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-gray-800 transition-all">{t.doneReviewing}</button>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.liveActivity}</h2>
          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-6">{t.category}</th>
                  <th className="px-8 py-6">{t.requestDetails}</th>
                  <th className="px-8 py-6">{t.status}</th>
                  <th className="px-8 py-6">{t.payment}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {requests.map(req => (
                  <tr key={req.id}>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[req.category as keyof typeof CATEGORY_STYLES]}`}>
                        {t[req.category as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-gray-900 font-black line-clamp-1">{req.description}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[req.status as keyof typeof STATUS_STYLES]}`}>
                        {t[req.status as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-lg">₹{req.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;