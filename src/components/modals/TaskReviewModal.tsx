import React, { useState, useMemo } from 'react';
import {
  X, CheckCircle2, RotateCcw, XCircle, Star, Brain, TrendingUp, Clock, AlertTriangle,
  Calendar, Target, ExternalLink, Send, Award, Activity, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../../types';
import { addTaskFeedbackReport, computeTaskAIStats } from '../../services/store';

interface TaskReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  reviewerName: string;
  reviewerRole: string;
  canReview: boolean; // Only admin & manager
  onReviewComplete: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ATTACH_ICONS: Record<string, string> = {
  link: '🔗',
  document: '📄',
  image: '🖼️',
  video: '🎥',
  figma: '🎨',
  github: '💻'
};

export const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  isOpen,
  onClose,
  task,
  reviewerName,
  reviewerRole,
  canReview,
  onReviewComplete,
  onShowToast,
}) => {
  const [tab, setTab] = useState<'submissions' | 'insights' | 'feedback' | 'history'>('submissions');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [qualityScore, setQualityScore] = useState(85);
  const [feedback, setFeedback] = useState('');
  const [strengthsText, setStrengthsText] = useState('Clean execution, met all core requirements, excellent attention to detail');
  const [improvementsText, setImprovementsText] = useState('Consider adding automated tests for edge cases, minor spacing tweaks on mobile');
  const [decision, setDecision] = useState<'approve' | 'request_revision' | 'reject'>('approve');
  const [isSaving, setIsSaving] = useState(false);

  const aiStats = useMemo(() => (task ? computeTaskAIStats(task) : null), [task]);

  if (!isOpen || !task) return null;

  const latestSubmission = task.workSubmissions?.[0];
  const historicalFeedback = task.feedbackReports || [];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) {
      onShowToast('Only Admins and Managers can submit review feedback reports', 'error');
      return;
    }
    if (!feedback.trim()) {
      onShowToast('Please write a feedback summary for the assignee', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const strengths = strengthsText.split(',').map(s => s.trim()).filter(Boolean);
      const improvements = improvementsText.split(',').map(s => s.trim()).filter(Boolean);

      const result = addTaskFeedbackReport(task.id, {
        reviewerName,
        reviewerRole,
        rating,
        qualityScore,
        feedback: feedback.trim(),
        strengths,
        improvements,
        decision
      }, reviewerName);

      setIsSaving(false);

      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }

      if (decision === 'approve') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00d4aa', '#0077ff', '#c77dff', '#ffc857']
        });
      }

      onShowToast(`🎉 ${result.message}`, 'success');
      setFeedback('');
      onReviewComplete();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2a2a4a] bg-gradient-to-r from-[#1a1a2e] to-[#12121f] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7b2ff2] via-[#c77dff] to-[#0077ff] flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c77dff]">Manager Review Center</span>
                {aiStats && (
                  <span
                    style={{ background: `${aiStats.onTrackColor}20`, color: aiStats.onTrackColor, borderColor: `${aiStats.onTrackColor}60` }}
                    className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border"
                  >
                    ● {aiStats.onTrackLabel}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white leading-tight truncate">{task.title}</h3>
              <div className="text-[10px] text-[#9090b8] mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Assigned to <strong className="text-white">{task.assigneeName || task.assignee}</strong></span>
                <span>•</span>
                <span>Due {task.dueDate}</span>
                {task.gracePeriodDays && <span className="text-[#ffc857]">+ {task.gracePeriodDays}d grace</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a] flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a4a] bg-[#0a0a14] px-4 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'submissions', label: 'Submissions', icon: Send, count: task.workSubmissions?.length || 0 },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'feedback', label: 'Write Feedback', icon: Star },
            { id: 'history', label: 'History', icon: Activity, count: historicalFeedback.length }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3 sm:px-4 py-2.5 text-[11px] font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  tab === t.id
                    ? 'border-[#c77dff] text-[#c77dff]'
                    : 'border-transparent text-[#9090b8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {(t.count || 0) > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#7b2ff2]/20 text-[#c77dff] text-[9px] font-extrabold">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* SUBMISSIONS TAB */}
          {tab === 'submissions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {(!task.workSubmissions || task.workSubmissions.length === 0) ? (
                <div className="text-center py-12 bg-[#0a0a14] border border-dashed border-[#2a2a4a] rounded-xl">
                  <Send className="w-10 h-10 text-[#5c5c8a] mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">No work submitted yet</h4>
                  <p className="text-xs text-[#9090b8]">Once <strong className="text-white">{task.assigneeName || task.assignee}</strong> submits their deliverables, they'll appear here for review.</p>
                </div>
              ) : (
                task.workSubmissions.map((sub, idx) => (
                  <div key={sub.id} className="bg-[#0a0a14] border border-[#2a2a4a] rounded-2xl overflow-hidden">
                    <div className="p-4 bg-[#1a1a2e]/60 border-b border-[#2a2a4a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {sub.submitterInitials}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{sub.submitterName}</span>
                          <span className="text-[10px] text-[#5c5c8a]">{new Date(sub.submittedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        sub.status === 'approved' ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/40' :
                        sub.status === 'needs_revision' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40' :
                        'bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40 animate-pulse'
                      }`}>
                        {idx === 0 && '● '}{sub.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-[#e8e8f4] leading-relaxed">{sub.notes}</p>

                      {sub.attachments && sub.attachments.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider">Deliverables ({sub.attachments.length})</span>
                          {sub.attachments.map(att => (
                            <a
                              key={att.id}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 bg-[#12121f] border border-[#2a2a4a] hover:border-[#0077ff] rounded-lg p-3 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base flex-shrink-0">{ATTACH_ICONS[att.type] || '📎'}</span>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{att.name}</span>
                                  <code className="text-[10px] text-[#0077ff] font-mono truncate block">{att.url}</code>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {att.size && <span className="text-[10px] text-[#5c5c8a] font-mono">{att.size}</span>}
                                <ExternalLink className="w-3.5 h-3.5 text-[#5c5c8a] group-hover:text-white transition-colors" />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {latestSubmission && canReview && (
                <button
                  onClick={() => setTab('feedback')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c77dff] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  <span>Write Manager Feedback Report →</span>
                </button>
              )}
            </div>
          )}

          {/* AI INSIGHTS TAB */}
          {tab === 'insights' && aiStats && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Productivity Score Hero */}
              <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#7b2ff2]/15 border border-[#7b2ff2]/40 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#c77dff]" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">AI Productivity Score</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
                    ENGINE v2.1
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="#2a2a4a" strokeWidth="8" fill="none" />
                      <circle
                        cx="48" cy="48" r="42"
                        stroke={aiStats.productivityScore >= 75 ? '#00d4aa' : aiStats.productivityScore >= 50 ? '#ffc857' : '#ff4d6d'}
                        strokeWidth="8" fill="none"
                        strokeDasharray={`${(aiStats.productivityScore / 100) * 264} 264`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-extrabold text-white leading-none">{aiStats.productivityScore}</span>
                      <span className="text-[9px] text-[#9090b8] uppercase font-bold">/ 100</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block">Est. Completion Date</span>
                      <span className="text-base font-extrabold text-[#00d4aa]">📅 {aiStats.estimatedCompletionDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block">Task Health</span>
                      <span style={{ color: aiStats.onTrackColor }} className="text-xs font-bold">{aiStats.onTrackLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
                    <TrendingUp className="w-3 h-3 text-[#0077ff]" /> Velocity
                  </div>
                  <span className="text-lg font-extrabold text-[#0077ff]">{aiStats.velocity}%/day</span>
                </div>
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
                    <Clock className="w-3 h-3 text-[#ffc857]" /> Days Active
                  </div>
                  <span className="text-lg font-extrabold text-[#ffc857]">{aiStats.daysActive}d</span>
                </div>
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
                    <Calendar className="w-3 h-3 text-[#c77dff]" /> Due In
                  </div>
                  <span className={`text-lg font-extrabold ${aiStats.daysUntilDue > 3 ? 'text-[#00d4aa]' : aiStats.daysUntilDue > 0 ? 'text-[#ffc857]' : 'text-[#ff4d6d]'}`}>
                    {aiStats.daysUntilDue > 0 ? `${aiStats.daysUntilDue}d` : `${Math.abs(aiStats.daysUntilDue)}d LATE`}
                  </span>
                </div>
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
                    <Target className="w-3 h-3 text-[#00d4aa]" /> Hours Left
                  </div>
                  <span className="text-lg font-extrabold text-[#00d4aa]">~{aiStats.hoursRemaining}h</span>
                </div>
              </div>

              {/* Grace period notice */}
              {aiStats.isInGracePeriod && (
                <div className="bg-[#ffc857]/15 border border-[#ffc857]/40 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#ffc857] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Task is Past Due — In Grace Period</h4>
                    <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                      Original due date has passed. Grace period ends on <strong className="text-[#ffc857]">{aiStats.gracePeriodEndDate}</strong>.
                      After that, the task will be flagged as critically overdue and auto-alerts will be sent.
                    </p>
                  </div>
                </div>
              )}

              {/* Risk factors */}
              {aiStats.riskFactors.length > 0 && (
                <div className="bg-[#12121f] border border-[#ff4d6d]/30 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-[#ff4d6d] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Detected Risk Factors ({aiStats.riskFactors.length})
                  </h4>
                  {aiStats.riskFactors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#e8e8f4]">
                      <span className="text-[#ff4d6d] mt-0.5">▲</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-[#12121f] border border-[#00d4aa]/30 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-extrabold text-[#00d4aa] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> AI Recommendations
                </h4>
                {aiStats.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#e8e8f4]">
                    <span className="text-[#00d4aa] mt-0.5">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {tab === 'feedback' && (
            <form onSubmit={handleSubmitReview} className="space-y-5 animate-in fade-in duration-200">
              {!canReview ? (
                <div className="bg-[#ffc857]/15 border border-[#ffc857]/30 p-4 rounded-xl flex items-center gap-3 text-xs text-[#ffc857]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Only Admins and Managers can submit feedback reports on submitted work.</span>
                </div>
              ) : (
                <>
                  {/* Star Rating */}
                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                      Overall Quality Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className="w-8 h-8"
                            fill={n <= rating ? '#ffc857' : 'none'}
                            stroke={n <= rating ? '#ffc857' : '#5c5c8a'}
                          />
                        </button>
                      ))}
                      <span className="ml-3 text-sm font-extrabold text-[#ffc857]">{rating}.0 / 5.0</span>
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Quality Score (0-100)</span>
                      <span className="text-[#c77dff] normal-case text-sm font-extrabold">{qualityScore}/100</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={qualityScore}
                      onChange={(e) => setQualityScore(Number(e.target.value))}
                      className="w-full accent-[#c77dff]"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#5c5c8a] mt-1">
                      <span>Needs Rework</span>
                      <span>Acceptable</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                      Feedback Summary Report *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your review summary. Include what was done well, what needs improvement, and any specific action items..."
                      className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#c77dff] leading-relaxed"
                    />
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#00d4aa] uppercase tracking-wider mb-2">
                        ✓ Strengths (comma separated)
                      </label>
                      <textarea
                        rows={3}
                        value={strengthsText}
                        onChange={(e) => setStrengthsText(e.target.value)}
                        className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#00d4aa]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#ffc857] uppercase tracking-wider mb-2">
                        ▲ Areas to Improve (comma separated)
                      </label>
                      <textarea
                        rows={3}
                        value={improvementsText}
                        onChange={(e) => setImprovementsText(e.target.value)}
                        className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#ffc857]"
                      />
                    </div>
                  </div>

                  {/* Decision buttons */}
                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                      Review Decision *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecision('approve')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          decision === 'approve' ? 'bg-[#00d4aa]/20 border-[#00d4aa] ring-1 ring-[#00d4aa]' : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#00d4aa]/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${decision === 'approve' ? 'text-[#00d4aa]' : 'text-[#9090b8]'}`} />
                          <span className="text-xs font-bold text-white">Approve</span>
                        </div>
                        <p className="text-[10px] text-[#9090b8] mt-1">Move task to Done, mark milestone complete</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision('request_revision')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          decision === 'request_revision' ? 'bg-[#ffc857]/20 border-[#ffc857] ring-1 ring-[#ffc857]' : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#ffc857]/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RotateCcw className={`w-4 h-4 ${decision === 'request_revision' ? 'text-[#ffc857]' : 'text-[#9090b8]'}`} />
                          <span className="text-xs font-bold text-white">Request Revision</span>
                        </div>
                        <p className="text-[10px] text-[#9090b8] mt-1">Send back to In Progress with feedback</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision('reject')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          decision === 'reject' ? 'bg-[#ff4d6d]/20 border-[#ff4d6d] ring-1 ring-[#ff4d6d]' : 'bg-[#0a0a14] border-[#2a2a4a] hover:border-[#ff4d6d]/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className={`w-4 h-4 ${decision === 'reject' ? 'text-[#ff4d6d]' : 'text-[#9090b8]'}`} />
                          <span className="text-xs font-bold text-white">Reject</span>
                        </div>
                        <p className="text-[10px] text-[#9090b8] mt-1">Move back to Backlog for re-scoping</p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2a2a4a] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c77dff] to-[#0077ff] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {isSaving ? '⏳ Saving...' : <>
                        <Star className="w-3.5 h-3.5" />
                        <span>Submit Feedback Report →</span>
                      </>}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* HISTORY TAB */}
          {tab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {historicalFeedback.length === 0 ? (
                <div className="text-center py-12 bg-[#0a0a14] border border-dashed border-[#2a2a4a] rounded-xl">
                  <Activity className="w-10 h-10 text-[#5c5c8a] mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">No review history yet</h4>
                  <p className="text-xs text-[#9090b8]">Feedback reports submitted by managers will appear here.</p>
                </div>
              ) : (
                historicalFeedback.map(fb => (
                  <div key={fb.id} className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{fb.reviewerName}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#1a1a2e] text-[#9090b8]">{fb.reviewerRole}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        fb.decision === 'approve' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                        fb.decision === 'request_revision' ? 'bg-[#ffc857]/20 text-[#ffc857]' :
                        'bg-[#ff4d6d]/20 text-[#ff4d6d]'
                      }`}>
                        {fb.decision.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className="w-3.5 h-3.5" fill={n <= fb.rating ? '#ffc857' : 'none'} stroke={n <= fb.rating ? '#ffc857' : '#5c5c8a'} />
                        ))}
                      </div>
                      <span className="text-[#c77dff] font-bold">{fb.qualityScore}/100</span>
                      <span className="text-[#5c5c8a]">{new Date(fb.reviewedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#e8e8f4] leading-relaxed">{fb.feedback}</p>
                    {fb.strengths.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-[#00d4aa] font-bold">✓ Strengths: </span>
                        <span className="text-[#9090b8]">{fb.strengths.join(', ')}</span>
                      </div>
                    )}
                    {fb.improvements.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-[#ffc857] font-bold">▲ Improve: </span>
                        <span className="text-[#9090b8]">{fb.improvements.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
