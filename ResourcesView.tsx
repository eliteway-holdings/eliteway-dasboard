import React, { useMemo, useState } from 'react';
import { Archive, BookOpen, Download, FileText, FolderOpen, Link as LinkIcon, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { ResourceItem, UserRole } from '../../types';
import { deleteResourceItem } from '../../services/store';

interface Props {
  bizId: string;
  primaryColor: string;
  resources: ResourceItem[];
  role: UserRole;
  actorName: string;
  actorInitials: string;
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onOpenAdd: () => void;
}

const typeStyles: Record<ResourceItem['type'], { icon: React.ReactNode; color: string; label: string }> = {
  document: { icon: <FileText className="w-4 h-4" />, color: '#0077ff', label: 'Document' },
  policy: { icon: <ShieldCheck className="w-4 h-4" />, color: '#00d4aa', label: 'Policy' },
  template: { icon: <BookOpen className="w-4 h-4" />, color: '#c77dff', label: 'Template' },
  link: { icon: <LinkIcon className="w-4 h-4" />, color: '#ffc857', label: 'External Link' },
  media: { icon: <Download className="w-4 h-4" />, color: '#ff4d6d', label: 'Media File' },
  brand: { icon: <BookOpen className="w-4 h-4" />, color: '#7b2ff2', label: 'Brand Asset' },
  archive: { icon: <Archive className="w-4 h-4" />, color: '#5c5c8a', label: 'Archive' },
};

export const ResourcesView: React.FC<Props> = ({
  bizId,
  primaryColor,
  resources,
  role,
  actorName,
  onRefresh,
  onShowToast,
  onOpenAdd,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | ResourceItem['category']>('All');

  const filtered = useMemo(() => {
    return resources.filter(item => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q || item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.tags.join(' ').toLowerCase().includes(q);
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const visible = role === 'admin' || role === 'manager' || item.visibility !== 'admin_manager';
      return matchesQ && matchesCat && visible;
    });
  }, [resources, query, activeCategory, role]);

  const canManage = role === 'admin' || role === 'manager';

  const openResource = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl p-5 sm:p-6 shadow-xl soft-white-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold">Institutional Resource Repository</h2>
              <span className="px-2 py-1 rounded-full bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30 text-[10px] font-bold uppercase tracking-wider">
                Simple Document Access
              </span>
            </div>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Store and retrieve policies, templates, project packs, reference links, uploaded media and operational documents for every member of the institution.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="soft-chip">
              <span className="stat-value">{resources.length}</span>
              <span className="stat-label">Documents</span>
            </div>
            <div className="soft-chip">
              <span className="stat-value">{new Set(resources.map(r => r.category)).size}</span>
              <span className="stat-label">Collections</span>
            </div>
            <div className="soft-chip">
              <span className="stat-value">{new Set(resources.map(r => r.type)).size}</span>
              <span className="stat-label">Types</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 soft-white-panel p-5 border border-[#2a2a4a] rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search documents, policies, templates, and links"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#0077ff] focus:ring-1 focus:ring-[#0077ff]/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(['All', 'Operations', 'Projects', 'Events', 'HR', 'Finance', 'Institutional', 'Make.com'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                    activeCategory === cat
                      ? 'bg-[#00d4aa] text-black border-[#00d4aa]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#00d4aa] hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No resources found</h3>
              <p className="text-xs text-slate-500 mt-1">Upload a policy, template, link, project pack or document to begin sharing institution knowledge.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${typeStyles[item.type].color}18`, color: typeStyles[item.type].color }}>
                        {typeStyles[item.type].icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description || typeStyles[item.type].label}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: typeStyles[item.type].color }}>
                        {typeStyles[item.type].label}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">{item.category}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-[11px] text-slate-600 truncate">{item.url}</code>
                      <button onClick={() => openResource(item.url)} className="px-3 py-2 rounded-lg bg-[#0077ff] text-white text-xs font-bold">
                        Open
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">{item.ownerName}</span> • {item.uploadedAt} • {item.tags.join(', ')}
                    </div>
                    {canManage && (
                      <button
                        onClick={() => {
                          deleteResourceItem(item.id, actorName, bizId);
                          onRefresh();
                          onShowToast('Resource removed from repository.', 'info');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#ff4d6d] hover:border-[#ff4d6d]/40 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="soft-white-panel p-5 border border-[#2a2a4a] rounded-2xl">
            <h3 className="font-bold text-slate-900 mb-3">Upload or link resources</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add documents, templates, policies, links and shared files that every team member can access from one central institutional repository.
            </p>
            <button
              type="button"
              disabled={!canManage}
              onClick={onOpenAdd}
              className="w-full py-3 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: canManage ? primaryColor : '#cbd5e1' }}
            >
              <Plus className="w-4 h-4 inline-block mr-1" /> Add Resource or Upload
            </button>
          </div>

          <div className="soft-white-panel p-5 border border-[#2a2a4a] rounded-2xl">
            <h3 className="font-bold text-slate-900 mb-3">Repository Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="summary-line"><span>Default visibility</span><strong>Institutional team</strong></div>
              <div className="summary-line"><span>Upload rights</span><strong>Admins and managers</strong></div>
              <div className="summary-line"><span>Supported types</span><strong>Documents, policies, templates, links, media, brand assets</strong></div>
              <div className="summary-line"><span>Current collection size</span><strong>{resources.length} item(s)</strong></div>
            </div>
            <div className="mt-4 rounded-xl border border-[#00d4aa]/30 bg-[#00d4aa]/10 p-3 text-xs text-[#047857]">
              Every added resource is logged in the activity feed so executives can audit document changes and institutional knowledge updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
