import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, RotateCcw, MessageSquare, Send, Sparkles, AlertCircle, FileCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Submission, SubmissionStatus } from '../../types';
import { addSubmission, updateSubmissionStatus, addSubmissionFeedback } from '../../services/store';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  existingSubmission?: Submission | null;
  currentUserName: string;
  currentUserRole: string;
  onSubmissionSaved: () => void;
  onShowToast: (msg: string, type: 'success' | 'info') => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  bizId,
  existingSubmission = null,
  currentUserName,
  currentUserRole,
  onSubmissionSaved,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<'figma' | 'zip' | 'video' | 'make_blueprint' | 'pdf' | 'github'>('figma');
  const [version, setVersion] = useState('v1.0');
  const [clientVisible, setClientVisible] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [activeSub, setActiveSub] = useState<Submission | null>(existingSubmission);

  useEffect(() => {
    setActiveSub(existingSubmission);
    if (existingSubmission) {
      setTitle(existingSubmission.title);
      setDescription(existingSubmission.description || '');
      setFileUrl(existingSubmission.fileUrl);
      setFileType(existingSubmission.fileType);
      setVersion(existingSubmission.version || 'v1.0');
      setClientVisible(existingSubmission.clientVisible ?? true);
    } else {
      setTitle('');
      setDescription('');
      setFileUrl('');
      setFileType('figma');
      setVersion('v1.0');
      setClientVisible(true);
    }
  }, [existingSubmission, isOpen]);

  if (!isOpen) return null;

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    addSubmission({
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bizId,
      title,
      description,
      submitter: currentUserName,
      submitterRole: currentUserRole === 'admin' ? 'Executive Lead' : currentUserRole === 'manager' ? 'Ops Lead' : 'Product Design',
      time: 'Just now',
      status: 'pending',
      fileUrl,
      fileType,
      version,
      clientVisible,
      feedback: []
    });

    onShowToast(`Deliverable "${title.substring(0, 30)}..." submitted for review!`, 'success');
    onSubmissionSaved();
    onClose();
  };

  const handleDecision = (decision: SubmissionStatus) => {
    if (!activeSub) return;
    const updated = updateSubmissionStatus(activeSub.id, decision, currentUserName);
    if (updated) {
      setActiveSub({ ...updated });
    }

    if (decision === 'approved') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onShowToast(`🎉 Deliverable "${activeSub.title}" approved! Client notified.`, 'success');
    } else {
      onShowToast(`Deliverable "${activeSub.title}" marked for revision.`, 'info');
    }
    onSubmissionSaved();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeSub) return;

    addSubmissionFeedback(activeSub.id, newComment.trim(), currentUserName, currentUserRole);
    const updatedFeedback = [
      ...activeSub.feedback,
      {
        id: 'fb_' + Date.now(),
        author: currentUserName,
        role: currentUserRole,
        text: newComment.trim(),
        time: 'Just now'
      }
    ];
    setActiveSub({ ...activeSub, feedback: updatedFeedback });
    setNewComment('');
    onSubmissionSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-[#1a1a2e]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0077ff]/20 text-[#0077ff] border border-[#0077ff]/30 mb-1 inline-block">
              {activeSub ? 'Deliverable Review & Approval' : 'Submit New Deliverable Package'}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">
              {activeSub ? activeSub.title : 'Upload Work for Team Review'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {activeSub ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl">
              <div>
                <span className="text-xs text-[#9090b8] block mb-0.5">Submitted By</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{activeSub.submitter}</span>
                  <span className="text-xs text-[#5c5c8a]">({activeSub.submitterRole || 'Creative'}) • {activeSub.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                  activeSub.status === 'approved'
                    ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40'
                    : activeSub.status === 'revision'
                    ? 'bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40'
                    : 'bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40'
                }`}>
                  {activeSub.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {activeSub.status === 'revision' && <RotateCcw className="w-3.5 h-3.5" />}
                  {activeSub.status === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                  {activeSub.status}
                </span>
              </div>
            </div>

            {/* Description & File link */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#9090b8] uppercase tracking-wider">Deliverable Notes & Package</h4>
              {activeSub.description && (
                <p className="text-xs text-[#e8e8f4] leading-relaxed bg-[#0a0a14] p-3 rounded-xl border border-[#2a2a4a]/60">
                  {activeSub.description}
                </p>
              )}

              <div className="bg-[#1a1a2e] border border-[#2a2a4a] p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-[#7b2ff2]/20 border border-[#7b2ff2]/30 flex items-center justify-center text-[#c77dff] flex-shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">
                      {activeSub.fileType} Package ({activeSub.version || 'v1.0'})
                    </span>
                    <a
                      href={activeSub.fileUrl.startsWith('http') ? activeSub.fileUrl : `https://${activeSub.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0077ff] hover:underline truncate block"
                    >
                      {activeSub.fileUrl}
                    </a>
                  </div>
                </div>
                <a
                  href={activeSub.fileUrl.startsWith('http') ? activeSub.fileUrl : `https://${activeSub.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-[#0077ff]/15 border border-[#0077ff]/30 text-[#0077ff] text-xs font-semibold hover:bg-[#0077ff]/25 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Open File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Decision actions for Admin / Manager / Client */}
            {(currentUserRole === 'admin' || currentUserRole === 'manager' || currentUserRole === 'client') && (
              <div className="bg-gradient-to-r from-[#7b2ff2]/15 to-[#0077ff]/15 border border-[#7b2ff2]/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white mb-0.5">Manager & Client Approval Loop</h5>
                  <p className="text-[11px] text-[#9090b8]">Approve to mark milestone done, or request changes with feedback below.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDecision('revision')}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg bg-[#ff4d6d]/15 border border-[#ff4d6d]/40 text-[#ff4d6d] hover:bg-[#ff4d6d] hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Request Revision
                  </button>
                  <button
                    onClick={() => handleDecision('approved')}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Deliverable
                  </button>
                </div>
              </div>
            )}

            {/* Feedback & Comments */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#9090b8] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#c77dff]" /> Review Thread ({activeSub.feedback.length})
              </h4>
              
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {activeSub.feedback.length === 0 ? (
                  <p className="text-xs text-[#5c5c8a] italic py-3 text-center border border-[#2a2a4a]/40 rounded-xl bg-[#0a0a14]">
                    No comments yet. Leave specific feedback or approval notes below.
                  </p>
                ) : (
                  activeSub.feedback.map((fb) => (
                    <div key={fb.id} className="bg-[#0a0a14] border border-[#2a2a4a] p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{fb.author}</span>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#1a1a2e] text-[#9090b8]">
                            {fb.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5c5c8a]">{fb.time}</span>
                      </div>
                      <p className="text-xs text-[#e8e8f4] leading-relaxed">{fb.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add feedback comment..."
                  className="flex-1 bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7b2ff2] text-white text-xs font-semibold hover:bg-[#6819e6] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmission} className="p-6 overflow-y-auto space-y-5 flex-1">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Deliverable Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Final Figma UI Kit v2.4 & Design System Tokens"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                  Deliverable Type
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                >
                  <option value="figma">🎨 Figma Prototype / Design Link</option>
                  <option value="video">🎥 MP4 / Video Campaign Reel</option>
                  <option value="make_blueprint">⚡ Make.com Webhook Blueprint JSON</option>
                  <option value="zip">📁 Zip Archive Bundle</option>
                  <option value="github">💻 GitHub PR / Code Branch</option>
                  <option value="pdf">📄 PDF Presentation Deck</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                File / Share Link URL *
              </label>
              <input
                type="text"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://figma.com/file/xyz... or drive.google.com/folder/abc..."
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Work Summary & Change Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight what changed since previous version and what needs client review..."
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2] leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a]">
              <input
                type="checkbox"
                id="clientVis"
                checked={clientVisible}
                onChange={(e) => setClientVisible(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a2a4a] bg-[#12121f] text-[#7b2ff2]"
              />
              <label htmlFor="clientVis" className="text-xs text-white cursor-pointer select-none">
                Visible to Client Sponsor (Include in Client Guest Portal review loop)
              </label>
            </div>

            <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Deliverable →</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
