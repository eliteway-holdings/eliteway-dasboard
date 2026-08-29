import React, { useState } from 'react';
import { X, Upload, Link2, ShieldCheck } from 'lucide-react';
import { ResourceItem } from '../../types';
import { addResourceItem } from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  primaryColor: string;
  actorName: string;
  onSaved: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const AddResourceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bizId,
  primaryColor,
  actorName,
  onSaved,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceItem['type']>('document');
  const [category, setCategory] = useState<ResourceItem['category']>('Operations');
  const [visibility, setVisibility] = useState<ResourceItem['visibility']>('team');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      onShowToast('Please provide a title and URL for the resource.', 'error');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      addResourceItem({
        id: 'res_' + Date.now(),
        bizId,
        title: title.trim(),
        description: description.trim(),
        type,
        url: url.trim(),
        ownerName: actorName,
        category,
        uploadedAt: new Date().toISOString().split('T')[0],
        tags: [category.toLowerCase(), type],
        visibility
      }, actorName);
      setIsSaving(false);
      onShowToast('Resource added to the institutional repository.', 'success');
      setTitle('');
      setUrl('');
      setDescription('');
      onSaved();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/50 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Institution repository</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">Add Resource or Upload</h3>
            <p className="text-xs text-slate-500 mt-1">Store documents, links, templates, media, and shared operational files for the team.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0077ff]" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Document URL or uploaded file link" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0077ff]" />
          <div className="grid grid-cols-2 gap-3">
            <select value={type} onChange={e => setType(e.target.value as ResourceItem['type'])} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900">
              <option value="document">Document</option>
              <option value="policy">Policy</option>
              <option value="template">Template</option>
              <option value="link">External link</option>
              <option value="media">Media</option>
              <option value="brand">Brand asset</option>
              <option value="archive">Archive</option>
            </select>
            <select value={category} onChange={e => setCategory(e.target.value as ResourceItem['category'])} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900">
              <option value="Operations">Operations</option>
              <option value="Projects">Projects</option>
              <option value="Events">Events</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Institutional">Institutional</option>
              <option value="Make.com">Make.com</option>
            </select>
          </div>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short institutional note" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0077ff]" />

          <select value={visibility} onChange={e => setVisibility(e.target.value as ResourceItem['visibility'])} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900">
            <option value="team">Visible to all team members</option>
            <option value="admin_manager">Admins and managers only</option>
            <option value="client">Visible to client sponsors</option>
          </select>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0077ff] mt-0.5 flex-shrink-0" />
            <span>Resources are auditable by executives and linked in the activity feed for transparency.</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
            <button
              type="submit"
              disabled={isSaving}
              style={{ backgroundColor: primaryColor }}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-extrabold disabled:opacity-40"
            >
              {isSaving ? <Upload className="w-4 h-4 inline mr-1" /> : <Link2 className="w-4 h-4 inline mr-1" />} Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
