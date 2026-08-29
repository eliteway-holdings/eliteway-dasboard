import React, { useState, useMemo } from 'react';
import {
  Inbox, Send, CheckCircle2, Clock, AlertTriangle, Brain, TrendingUp, Star,
  Zap, Calendar, Target, ArrowRight, Filter, MessageSquare
} from 'lucide-react';
import { Task } from '../../types';
import { getMyAssignedTasks, computeTaskAIStats } from '../../services/store';
import { TaskSubmitWorkModal } from '../modals/TaskSubmitWorkModal';
import { TaskReviewModal } from '../modals/TaskReviewModal';

interface MyTasksViewProps {
  bizId: string;
  userInitials: string;
  userName: string;
  userRole: string;
  primaryColor: string;
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  refreshKey: number;
}

type Filter = 'all' | 'active' | 'inreview' | 'done' | 'overdue';

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  bizId,
  userInitials,
  userName,
  userRole,
  primaryColor,
  onRefresh,
  onShowToast,
  refreshKey,
}) => {
  const [filter, setFilter] = useState<Filter>('active');
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<Task | null>(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);

  const myTasks = useMemo(() => {
    const _ = refreshKey; void _;
    return getMyAssignedTasks(bizId, userInitials);
  }, [bizId, userInitials, refreshKey]);

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return myTasks;
    if (filter === 'active') return myTasks.filter(t => t.col !== 'done');
    if (filter === 'inreview') return myTasks.filter(t => t.col === 'inreview');
    if (filter === 'done') return myTasks.filter(t => t.col === 'done');
    if (filter === 'overdue') return myTasks.filter(t => {
      const stats = computeTaskAIStats(t);
      return stats.onTrackStatus === 'overdue' || stats.onTrackStatus === 'in_grace_period';
    });
    return myTasks;
  }, [myTasks, filter]);

  // Aggregate personal stats
  const stats = useMemo(() => {
    const active = myTasks.filter(t => t.col !== 'done').length;
    const inreview = myTasks.filter(t => t.col === 'inreview').length;
    const done = myTasks.filter(t => t.col === 'done').length;
    const overdue = myTasks.filter(t => {
      const s = computeTaskAIStats(t);
      return s.onTrackStatus === 'overdue' || s.onTrackStatus === 'in_grace_period';
    }).length;

    let avgProductivity = 0;
    if (myTasks.length > 0) {
      const sum = myTasks.reduce((acc, t) => acc + computeTaskAIStats(t).productivityScore, 0);
      avgProductivity = Math.round(sum / myTasks.length);
    }

    return { active, inreview, done, overdue, avgProductivity, total: myTasks.length };
  }, [myTasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero: Personal Task Center */}
      <div className="institution-hero bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#7b2ff2]/15 border border-[#7b2ff2]/40 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #0077ff)` }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-xl flex-shrink-0"
            >
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white">My Task Center</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#c77dff]/20 text-[#c77dff] border border-[#c77dff]/40">
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-[#9090b8]">
                Welcome back, <strong className="text-white">{userName}</strong>. Submit work, track progress, and stay on top of deadlines.
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a14]/80 border border-[#2a2a4a] rounded-xl px-4 py-3 flex items-center gap-3">
            <Brain className="w-5 h-5 text-[#c77dff]" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Your Productivity Score</span>
              <span className={`text-xl font-extrabold ${
                stats.avgProductivity >= 75 ? 'text-[#00d4aa]' : stats.avgProductivity >= 50 ? 'text-[#ffc857]' : 'text-[#ff4d6d]'
              }`}>
                {stats.avgProductivity}<span className="text-xs text-[#9090b8]">/100</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#2a2a4a]/80">
          <button
            onClick={() => setFilter('active')}
            className={`p-3 rounded-xl border text-left transition-all ${filter === 'active' ? 'bg-[#0077ff]/15 border-[#0077ff]' : 'bg-[#0a0a14]/60 border-[#2a2a4a] hover:border-[#0077ff]/50'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
              <Zap className="w-3 h-3 text-[#0077ff]" /> Active
            </div>
            <span className="text-xl font-extrabold text-[#0077ff]">{stats.active}</span>
          </button>
          <button
            onClick={() => setFilter('inreview')}
            className={`p-3 rounded-xl border text-left transition-all ${filter === 'inreview' ? 'bg-[#c77dff]/15 border-[#c77dff]' : 'bg-[#0a0a14]/60 border-[#2a2a4a] hover:border-[#c77dff]/50'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
              <Send className="w-3 h-3 text-[#c77dff]" /> In Review
            </div>
            <span className="text-xl font-extrabold text-[#c77dff]">{stats.inreview}</span>
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`p-3 rounded-xl border text-left transition-all ${filter === 'overdue' ? 'bg-[#ff4d6d]/15 border-[#ff4d6d]' : 'bg-[#0a0a14]/60 border-[#2a2a4a] hover:border-[#ff4d6d]/50'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
              <AlertTriangle className="w-3 h-3 text-[#ff4d6d]" /> Overdue
            </div>
            <span className="text-xl font-extrabold text-[#ff4d6d]">{stats.overdue}</span>
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`p-3 rounded-xl border text-left transition-all ${filter === 'done' ? 'bg-[#00d4aa]/15 border-[#00d4aa]' : 'bg-[#0a0a14]/60 border-[#2a2a4a] hover:border-[#00d4aa]/50'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9090b8] tracking-wider mb-1">
              <CheckCircle2 className="w-3 h-3 text-[#00d4aa]" /> Completed
            </div>
            <span className="text-xl font-extrabold text-[#00d4aa]">{stats.done}</span>
          </button>
        </div>
      </div>

      {/* Filter chip bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[#5c5c8a]" />
        {(['all', 'active', 'inreview', 'overdue', 'done'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-[#7b2ff2] text-white shadow'
                : 'bg-[#12121f] border border-[#2a2a4a] text-[#9090b8] hover:text-white hover:border-[#7b2ff2]'
            }`}
          >
            {f === 'inreview' ? 'In Review' : f}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#5c5c8a]">
          Showing {filteredTasks.length} of {stats.total} assigned tasks
        </span>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#12121f] border border-dashed border-[#2a2a4a] rounded-2xl p-12 text-center">
          <Inbox className="w-12 h-12 text-[#5c5c8a] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No tasks in this view</h3>
          <p className="text-xs text-[#9090b8]">
            {filter === 'active' && 'You have no active tasks right now. Well done! 🎉'}
            {filter === 'inreview' && 'No tasks currently awaiting review.'}
            {filter === 'overdue' && '✨ Zero overdue tasks — you\'re crushing it!'}
            {filter === 'done' && 'You haven\'t completed any tasks yet in this workspace.'}
            {filter === 'all' && 'No tasks assigned to you yet. Ask your admin/manager to assign work.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => {
            const aiStats = computeTaskAIStats(task);
            const latestSubmission = task.workSubmissions?.[0];
            const latestFeedback = task.feedbackReports?.[0];
            const canSubmitWork = task.col !== 'done';
            const canReviewWork = (userRole === 'admin' || userRole === 'manager') && task.workSubmissions && task.workSubmissions.length > 0;

            return (
              <div key={task.id} className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden shadow-xl hover:border-[#7b2ff2]/50 transition-all">
                {/* Header row */}
                <div className="p-4 sm:p-5 border-b border-[#2a2a4a] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30">
                        {task.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        task.priority === 'urgent' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d]' :
                        task.priority === 'high' ? 'bg-[#ffc857]/20 text-[#ffc857]' :
                        'bg-[#1a1a2e] text-[#9090b8]'
                      }`}>
                        {task.priority}
                      </span>
                      <span
                        style={{ background: `${aiStats.onTrackColor}20`, color: aiStats.onTrackColor, borderColor: `${aiStats.onTrackColor}60` }}
                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                      >
                        ● {aiStats.onTrackStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm sm:text-base leading-snug mb-1">{task.title}</h4>
                    {task.description && <p className="text-xs text-[#9090b8] line-clamp-2">{task.description}</p>}
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-[#5c5c8a] tracking-wider block">Due</span>
                      <span className={`text-xs font-bold ${aiStats.daysUntilDue < 0 ? 'text-[#ff4d6d]' : aiStats.daysUntilDue < 3 ? 'text-[#ffc857]' : 'text-white'}`}>
                        {task.dueDate || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress + AI Stats */}
                <div className="p-4 sm:p-5 space-y-3 bg-[#0a0a14]/40">
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                      <span className="text-[#9090b8]">Progress</span>
                      <span className="text-[#c77dff]">{aiStats.productivityScore}/100 Productivity Score</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#12121f] overflow-hidden">
                      <div
                        style={{
                          width: `${task.progressPercent || (task.col === 'done' ? 100 : task.col === 'inreview' ? 85 : task.col === 'inprogress' ? 55 : task.col === 'todo' ? 15 : 5)}%`,
                          background: `linear-gradient(90deg, ${aiStats.onTrackColor}, #0077ff)`
                        }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-[#9090b8]">
                        <TrendingUp className="w-3 h-3 text-[#0077ff]" /> Velocity
                      </div>
                      <span className="text-xs font-extrabold text-white">{aiStats.velocity}%/day</span>
                    </div>
                    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-[#9090b8]">
                        <Calendar className="w-3 h-3 text-[#c77dff]" /> Est. Done
                      </div>
                      <span className="text-xs font-extrabold text-[#c77dff]">{aiStats.estimatedCompletionDate}</span>
                    </div>
                    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-[#9090b8]">
                        <Clock className="w-3 h-3 text-[#ffc857]" /> Hrs Left
                      </div>
                      <span className="text-xs font-extrabold text-[#ffc857]">~{aiStats.hoursRemaining}h</span>
                    </div>
                    <div className="bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold text-[#9090b8]">
                        <Target className="w-3 h-3 text-[#00d4aa]" /> Grace
                      </div>
                      <span className="text-xs font-extrabold text-[#00d4aa]">{task.gracePeriodDays || 3}d</span>
                    </div>
                  </div>

                  {/* Slow progress alert */}
                  {(aiStats.onTrackStatus === 'at_risk' || aiStats.onTrackStatus === 'critical') && (
                    <div className="bg-[#ff4d6d]/15 border border-[#ff4d6d]/30 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#ff4d6d] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-[#ff4d6d] uppercase tracking-wider block">Slow Progress Alert</span>
                        <span className="text-[11px] text-[#e8e8f4]">{aiStats.riskFactors[0] || 'Task velocity below required pace'}</span>
                      </div>
                    </div>
                  )}

                  {aiStats.isInGracePeriod && (
                    <div className="bg-[#ffc857]/15 border border-[#ffc857]/30 rounded-lg p-2.5 flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#ffc857] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-[#ffc857] uppercase tracking-wider block">In Grace Period</span>
                        <span className="text-[11px] text-[#e8e8f4]">Grace period ends on {aiStats.gracePeriodEndDate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Latest submission / feedback preview */}
                {(latestSubmission || latestFeedback) && (
                  <div className="px-4 sm:px-5 pb-3 space-y-2">
                    {latestSubmission && (
                      <div className="bg-[#0a0a14] border border-[#0077ff]/30 rounded-lg p-2.5 flex items-start gap-2">
                        <Send className="w-3.5 h-3.5 text-[#0077ff] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#0077ff] uppercase block">
                            Last Submission ({latestSubmission.attachments.length} attachments)
                          </span>
                          <span className="text-[11px] text-[#e8e8f4] line-clamp-1">{latestSubmission.notes}</span>
                        </div>
                      </div>
                    )}
                    {latestFeedback && (
                      <div className={`border rounded-lg p-2.5 flex items-start gap-2 ${
                        latestFeedback.decision === 'approve' ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30' :
                        latestFeedback.decision === 'request_revision' ? 'bg-[#ffc857]/10 border-[#ffc857]/30' :
                        'bg-[#ff4d6d]/10 border-[#ff4d6d]/30'
                      }`}>
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                          latestFeedback.decision === 'approve' ? 'text-[#00d4aa]' :
                          latestFeedback.decision === 'request_revision' ? 'text-[#ffc857]' :
                          'text-[#ff4d6d]'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase text-white">Manager: {latestFeedback.reviewerName}</span>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} className="w-2.5 h-2.5" fill={n <= latestFeedback.rating ? '#ffc857' : 'none'} stroke={n <= latestFeedback.rating ? '#ffc857' : '#5c5c8a'} />
                              ))}
                            </div>
                            <span className="text-[10px] text-[#c77dff] font-bold">{latestFeedback.qualityScore}/100</span>
                          </div>
                          <span className="text-[11px] text-[#e8e8f4] line-clamp-1">{latestFeedback.feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="p-4 sm:px-5 sm:py-4 border-t border-[#2a2a4a] bg-[#1a1a2e]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-[#5c5c8a]">
                    <span>Col: <strong className="text-white uppercase">{task.col === 'inreview' ? 'In Review' : task.col === 'inprogress' ? 'In Progress' : task.col}</strong></span>
                    <span>•</span>
                    <span>{task.workSubmissions?.length || 0} submission(s)</span>
                    <span>•</span>
                    <span>{task.feedbackReports?.length || 0} review(s)</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedTaskForReview(task)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#c77dff] text-[#c77dff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>{canReviewWork ? 'Review Work' : 'View AI Insights'}</span>
                    </button>
                    {canSubmitWork && (
                      <button
                        onClick={() => setSelectedTaskForSubmit(task)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-extrabold text-xs shadow hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TaskSubmitWorkModal
        isOpen={!!selectedTaskForSubmit}
        onClose={() => setSelectedTaskForSubmit(null)}
        task={selectedTaskForSubmit}
        submitterName={userName}
        submitterInitials={userInitials}
        onSubmitted={onRefresh}
        onShowToast={onShowToast}
      />

      <TaskReviewModal
        isOpen={!!selectedTaskForReview}
        onClose={() => setSelectedTaskForReview(null)}
        task={selectedTaskForReview}
        reviewerName={userName}
        reviewerRole={userRole}
        canReview={userRole === 'admin' || userRole === 'manager'}
        onReviewComplete={onRefresh}
        onShowToast={onShowToast}
      />
    </div>
  );
};
