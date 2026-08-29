import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../../types';
import { submitWorkOnTask } from '../../services/store';

interface TaskSubmitWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  submitterName: string;
  submitterInitials: string;
  onSubmitted: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type AttachType = 'link' | 'document' | 'image' | 'video' | 'figma' | 'github';

interface DraftAttachment {
  type: AttachType;
  name: string;
  url: string;
  size?: string;
}

const ATTACH_ICONS: Record<AttachType, string> = {
  link: '🔗',
  document: '📄',
  image: '🖼️',
  video: '🎥',
  figma: '🎨',
  github: '💻'
};

export const TaskSubmitWorkModal: React.FC<TaskSubmitWorkModalProps> = ({
  isOpen,
  onClose,
  task,
  submitterName,
  submitterInitials,
  onSubmitted,
  onShowToast,
}) => {
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [newType, setNewType] = useState<AttachType>('link');
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleAddAttachment = () => {
    if (!newName.trim() || !newUrl.trim()) {
      onShowToast('Please provide both a name and URL for the attachment', 'error');
      return;
    }
    setAttachments([...attachments, {
      type: newType,
      name: newName.trim(),
      url: newUrl.trim(),
      size: newType === 'video' ? '18.4 MB' : newType === 'image' ? '2.1 MB' : newType === 'document' ? '540 KB' : undefined
    }]);
    setNewName('');
    setNewUrl('');
  };

  const handleQuickAdd = (type: AttachType) => {
    const templates: Record<AttachType, { name: string; url: string }> = {
      link: { name: 'Reference Link', url: 'https://example.com/reference' },
      document: { name: 'Project Document.pdf', url: 'https://drive.google.com/file/d/abc123/view' },
      image: { name: 'Design Screenshot.png', url: 'https://drive.google.com/file/d/img456/view' },
      video: { name: 'Demo Walkthrough.mp4', url: 'https://loom.com/share/xyz789' },
      figma: { name: 'Figma Prototype', url: 'https://figma.com/file/prototype-final' },
      github: { name: 'Feature Branch PR', url: 'https://github.com/org/repo/pull/142' }
    };
    setAttachments([...attachments, { type, ...templates[type], size: type === 'video' ? '18.4 MB' : type === 'image' ? '2.1 MB' : type === 'document' ? '540 KB' : undefined }]);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachments.length === 0) {
      onShowToast('Please attach at least one deliverable (link, document, or media)', 'error');
      return;
    }
    if (!notes.trim()) {
      onShowToast('Please add a brief summary of your submission notes', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitWorkOnTask(task.id, submitterName, submitterInitials, notes, attachments, submitterName);
      setIsSubmitting(false);

      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d4aa', '#0077ff', '#7b2ff2']
      });

      onShowToast(`🎉 ${result.message}`, 'success');
      setNotes('');
      setAttachments([]);
      onSubmitted();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] bg-gradient-to-r from-[#1a1a2e] to-[#12121f] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4aa] to-[#0077ff] flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d4aa]">Submit Work for Review</span>
              <h3 className="text-base font-bold text-white leading-tight truncate">{task.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a] flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="bg-gradient-to-r from-[#7b2ff2]/15 to-[#0077ff]/15 border border-[#7b2ff2]/30 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#c77dff] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Auto-Move to Review Column</h4>
              <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                When you submit, this task will automatically move to <strong className="text-[#c77dff]">"In Review"</strong> on the Kanban board. Your manager will get notified to review your work, write a feedback report, and either approve, request revisions, or reject.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Submission Notes / Change Summary *
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you completed, what changed since your last submission, and any specific things the reviewer should focus on..."
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#00d4aa] leading-relaxed"
            />
          </div>

          {/* Quick-add attachment buttons */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Attachments ({attachments.length})</span>
              <span className="text-[10px] text-[#5c5c8a] normal-case font-normal">Add links, docs, images, videos, or code</span>
            </label>

            <div className="flex flex-wrap gap-2 mb-3">
              {(['link', 'document', 'image', 'video', 'figma', 'github'] as AttachType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleQuickAdd(t)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-xs text-white font-semibold transition-colors flex items-center gap-1.5 capitalize"
                >
                  <span>{ATTACH_ICONS[t]}</span>
                  <span>+ Quick {t}</span>
                </button>
              ))}
            </div>

            {/* Manual add form */}
            <div className="bg-[#0a0a14] border border-[#2a2a4a] p-3 rounded-xl space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AttachType)}
                  className="col-span-3 bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2 py-2 text-xs text-white"
                >
                  <option value="link">🔗 Link</option>
                  <option value="document">📄 Document</option>
                  <option value="image">🖼️ Image</option>
                  <option value="video">🎥 Video</option>
                  <option value="figma">🎨 Figma</option>
                  <option value="github">💻 GitHub</option>
                </select>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Attachment name"
                  className="col-span-4 bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="URL or path"
                  className="col-span-4 bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="col-span-1 bg-[#7b2ff2] hover:bg-[#6819e6] rounded-lg text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {attachments.map((att, idx) => (
                  <div key={idx} className="bg-[#0a0a14] border border-[#2a2a4a] p-2.5 rounded-lg flex items-center justify-between gap-3 hover:border-[#00d4aa]/60 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{ATTACH_ICONS[att.type]}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">{att.name}</span>
                        <code className="text-[10px] text-[#0077ff] font-mono truncate block">{att.url}</code>
                      </div>
                      {att.size && (
                        <span className="text-[10px] text-[#5c5c8a] font-mono flex-shrink-0">{att.size}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="p-1.5 text-[#5c5c8a] hover:text-[#ff4d6d] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachments.length === 0 && (
              <div className="mt-3 p-4 bg-[#0a0a14] border border-dashed border-[#2a2a4a] rounded-xl text-center">
                <Upload className="w-6 h-6 text-[#5c5c8a] mx-auto mb-2" />
                <p className="text-xs text-[#5c5c8a]">No attachments yet. Click a Quick button above or use the form to add links, docs, or media.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || attachments.length === 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>⏳ Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Review ({attachments.length}) →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
