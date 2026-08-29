import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Clock, FileSpreadsheet, Phone, RefreshCw, Search, Upload, UserRoundCheck } from 'lucide-react';
import { CallOutcome, OutreachContact, User, UserRole } from '../../types';
import {
  generateDailyOutreachQueue,
  getOutreachContactsForBiz,
  getTodayQueueForBiz,
  importOutreachContacts,
  logCallOutcome
} from '../../services/store';

interface Props {
  bizId: string;
  teamMembers: User[];
  currentUserName: string;
  currentUserInitials: string;
  currentUserRole: UserRole;
  primaryColor: string;
  refreshKey: number;
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const outcomeStyles: Record<CallOutcome, { label: string; className: string }> = {
  answered: { label: 'Answered', className: 'bg-[#00d4aa] text-slate-950 border-[#00d4aa]' },
  busy_no_answer: { label: 'Busy / No answer', className: 'bg-[#ffc857] text-slate-950 border-[#ffc857]' },
  opt_out: { label: 'Opt out', className: 'bg-white text-[#ff4d6d] border-[#ff4d6d]/50' },
  not_interested: { label: 'Not interested', className: 'bg-white text-slate-700 border-slate-300' }
};

export const DailyOutreachView: React.FC<Props> = ({
  bizId,
  teamMembers,
  currentUserName,
  currentUserInitials,
  currentUserRole,
  primaryColor,
  refreshKey,
  onRefresh,
  onShowToast
}) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [csvText, setCsvText] = useState('name,organisation,phone,email,stage,reason,assignee\nSipho Nkosi,Community Action SA,+27825550123,sipho@community.org.za,new,Introduce our institutional programme,SC');
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    generateDailyOutreachQueue(bizId, teamMembers);
  }, [bizId, teamMembers]);

  const queue = useMemo(() => {
    const ignored = refreshKey; void ignored;
    const all = getTodayQueueForBiz(bizId);
    return currentUserRole === 'admin' || currentUserRole === 'manager'
      ? all
      : all.filter(item => item.assignedTo === currentUserInitials);
  }, [bizId, currentUserInitials, currentUserRole, refreshKey]);

  const contacts = useMemo(() => {
    const ignored = refreshKey; void ignored;
    return getOutreachContactsForBiz(bizId);
  }, [bizId, refreshKey]);

  const contactMap = useMemo(() => new Map(contacts.map(contact => [contact.id, contact])), [contacts]);
  const filteredQueue = queue.filter(item => {
    const contact = contactMap.get(item.contactId);
    const q = search.toLowerCase();
    return !q || contact?.name.toLowerCase().includes(q) || contact?.organisation?.toLowerCase().includes(q) || item.reason.toLowerCase().includes(q);
  });

  const completed = queue.filter(item => item.status === 'completed');
  const answered = completed.filter(item => item.outcome === 'answered').length;
  const managersCanSeeAll = currentUserRole === 'admin' || currentUserRole === 'manager';

  const logOutcome = (queueId: string, outcome: CallOutcome) => {
    const result = logCallOutcome(queueId, outcome, notes[queueId] || '', currentUserName, currentUserInitials);
    onShowToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setNotes(prev => ({ ...prev, [queueId]: '' }));
      onRefresh();
    }
  };

  const runGenerator = () => {
    const generated = generateDailyOutreachQueue(bizId, teamMembers, true);
    onShowToast(`${generated.length} contacts added to today's fresh outreach queue.`, 'success');
    onRefresh();
  };

  const parseCsv = () => {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      onShowToast('CSV must include a header row and at least one contact.', 'error');
      return;
    }
    const headers = lines[0].split(',').map(value => value.trim().toLowerCase());
    const index = (name: string) => headers.indexOf(name);
    const imported = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const stage = values[index('stage')] || 'new';
      const assignee = values[index('assignee')] || teamMembers[0]?.initials || 'AD';
      return {
        name: values[index('name')] || 'Unnamed contact',
        organisation: values[index('organisation')] || '',
        phone: values[index('phone')] || '',
        email: values[index('email')] || '',
        pipelineStage: (['new', 'follow_up', 'proposal', 'partner', 'dormant', 'closed'].includes(stage) ? stage : 'new') as OutreachContact['pipelineStage'],
        reason: values[index('reason')] || 'Imported contact requires first call',
        assignedTo: assignee,
        assignedName: teamMembers.find(user => user.initials === assignee)?.name || assignee,
        nextFollowUpAt: new Date().toISOString()
      };
    }).filter(contact => contact.phone || contact.email);

    if (!imported.length) {
      onShowToast('No valid contacts found. Map name, phone or email columns.', 'error');
      return;
    }
    const count = importOutreachContacts(bizId, imported, currentUserName);
    generateDailyOutreachQueue(bizId, teamMembers, true);
    onShowToast(`${count} contacts imported, mapped, and placed into follow-up rules.`, 'success');
    setIsImportOpen(false);
    onRefresh();
  };

  const readCsvFile = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      onShowToast('Please upload a CSV file exported from Excel or Google Sheets.', 'error');
      return;
    }
    file.text().then(text => {
      setCsvText(text);
      onShowToast(`${file.name} loaded. Review the mapped columns before importing.`, 'info');
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="soft-white-panel rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#5b6b80]">Daily outreach workflow</span>
            <h2 className="text-2xl font-extrabold text-slate-950 mt-1">Today's actionable call queue</h2>
            <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
              The background queue engine checks timestamps, pipeline stages and follow-up rules, then shows each employee only the contacts that need action today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={runGenerator} className="px-4 py-3 rounded-xl bg-[#4c1d95] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4" /> Generate today's queue
            </button>
            {managersCanSeeAll && (
              <button onClick={() => setIsImportOpen(!isImportOpen)} className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200">
          <div className="soft-chip"><span className="stat-label">Calls assigned</span><span className="stat-value text-[#2563eb]">{queue.length}</span></div>
          <div className="soft-chip"><span className="stat-label">Completed today</span><span className="stat-value text-[#059669]">{completed.length}</span></div>
          <div className="soft-chip"><span className="stat-label">Answered</span><span className="stat-value text-[#7c3aed]">{answered}</span></div>
          <div className="soft-chip"><span className="stat-label">Completion rate</span><span className="stat-value text-[#dc2626]">{queue.length ? Math.round((completed.length / queue.length) * 100) : 0}%</span></div>
        </div>
      </div>

      {isImportOpen && managersCanSeeAll && (
        <div className="soft-white-panel rounded-2xl p-6 border border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center"><FileSpreadsheet className="w-5 h-5" /></div>
            <div>
              <h3 className="font-extrabold text-slate-950">Bulk CSV / Spreadsheet Import</h3>
              <p className="text-sm font-medium text-slate-600 mt-1">Map legacy lists using these headers: name, organisation, phone, email, stage, reason, assignee.</p>
            </div>
          </div>
          <label
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              readCsvFile(e.dataTransfer.files?.[0]);
            }}
            className="mb-4 min-h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-5 cursor-pointer hover:border-[#4c1d95] hover:bg-[#f7f5ff] transition-colors"
          >
            <Upload className="w-6 h-6 text-[#4c1d95] mb-2" />
            <span className="text-sm font-extrabold text-slate-900">Drop a CSV file here</span>
            <span className="text-xs font-semibold text-slate-600 mt-1">or click to select an export from Excel / Google Sheets</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => readCsvFile(e.target.files?.[0])} />
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {['name → Contact name', 'organisation → Institution', 'phone → Phone', 'email → Email', 'stage → Pipeline', 'reason → Call reason', 'assignee → Staff initials'].map(mapping => (
              <span key={mapping} className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[10px] font-extrabold text-slate-700">
                {mapping}
              </span>
            ))}
          </div>
          <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={7} className="w-full rounded-xl border border-slate-300 bg-white p-4 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#4c1d95]" />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsImportOpen(false)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold">Cancel</button>
            <button onClick={parseCsv} className="px-5 py-2.5 rounded-xl bg-[#b7791f] text-white text-xs font-extrabold">Map columns & import</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-950">Queue cards</h3>
          <p className="text-sm font-semibold text-slate-600">Contact details, call reason, notes, and one-tap outcomes.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contact or organisation" className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#4c1d95]" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredQueue.map(item => {
          const contact = contactMap.get(item.contactId);
          if (!contact) return null;
          const latest = contact.history[0];
          return (
            <article key={item.id} className="soft-white-panel rounded-2xl p-5 border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold flex-shrink-0" style={{ background: primaryColor }}>
                    {contact.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-extrabold text-slate-950">{contact.name}</h4>
                    <p className="text-sm font-semibold text-slate-600 truncate">{contact.organisation || 'Independent contact'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : item.priority === 'urgent' ? 'bg-red-100 text-red-800' : item.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  {item.status === 'completed' ? item.outcome?.replace(/_/g, ' ') : item.priority}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mt-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Why this call is due</span>
                <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">{item.reason}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <a href={`tel:${contact.phone}`} className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-3 hover:border-[#2563eb] transition-colors">
                  <Phone className="w-4 h-4 text-[#2563eb]" />
                  <div><span className="text-[10px] uppercase font-bold text-slate-500 block">Phone</span><strong className="text-sm text-slate-950">{contact.phone}</strong></div>
                </a>
                <a href={`mailto:${contact.email}`} className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-3 hover:border-[#7c3aed] transition-colors">
                  <UserRoundCheck className="w-4 h-4 text-[#7c3aed]" />
                  <div className="min-w-0"><span className="text-[10px] uppercase font-bold text-slate-500 block">Email</span><strong className="text-sm text-slate-950 block truncate">{contact.email || 'No email provided'}</strong></div>
                </a>
              </div>

              {latest && (
                <div className="mt-4 text-xs font-medium text-slate-600 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Last attempt: {new Date(latest.timestamp).toLocaleString()} by {latest.staffName}
                </div>
              )}

              {item.status === 'pending' ? (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <input value={notes[item.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))} placeholder="Optional call note" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#4c1d95]" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {(Object.keys(outcomeStyles) as CallOutcome[]).map(outcome => (
                      <button key={outcome} onClick={() => logOutcome(item.id, outcome)} className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold ${outcomeStyles[outcome].className}`}>
                        {outcomeStyles[outcome].label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Outcome saved to this contact's audit history.
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!filteredQueue.length && (
        <div className="soft-white-panel rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#00d4aa] mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-950">Today's queue is clear</h3>
          <p className="text-sm font-medium text-slate-600 mt-1">Run the generator to re-check follow-up rules, timestamps, and pipeline stages.</p>
        </div>
      )}

      {managersCanSeeAll && (
        <div className="soft-white-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-[#4c1d95]" /><h3 className="font-extrabold text-slate-950">Manager visibility</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><span className="text-xs font-bold text-slate-500">Call attempts today</span><strong className="text-2xl text-slate-950 block mt-1">{completed.length}</strong></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><span className="text-xs font-bold text-slate-500">Answer rate</span><strong className="text-2xl text-[#059669] block mt-1">{completed.length ? Math.round((answered / completed.length) * 100) : 0}%</strong></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><span className="text-xs font-bold text-slate-500">Contacts with history</span><strong className="text-2xl text-[#2563eb] block mt-1">{contacts.filter(contact => contact.history.length).length}</strong></div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50"><tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><th className="p-3">Contact</th><th className="p-3">Staff</th><th className="p-3">Outcome</th><th className="p-3">Timestamp</th><th className="p-3">Note</th></tr></thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {contacts.flatMap(contact => contact.history.map(activity => ({ contact, activity }))).slice(0, 10).map(({ contact, activity }) => (
                  <tr key={activity.id} className="text-xs text-slate-700"><td className="p-3 font-bold text-slate-950">{contact.name}</td><td className="p-3">{activity.staffName}</td><td className="p-3 font-bold capitalize">{activity.outcome.replace(/_/g, ' ')}</td><td className="p-3">{new Date(activity.timestamp).toLocaleString()}</td><td className="p-3 max-w-xs truncate">{activity.note || 'No note'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};