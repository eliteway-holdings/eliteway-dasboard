import React, { useState, useMemo } from 'react';
import {
  X, Calendar, MapPin, Users, CheckCircle2, MessageSquare,
  Send, Plus, Play, Radio, TrendingUp, AlertTriangle, Award, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, EventPlanTask, User } from '../../types';
import {
  formatZAR, computeEventProgress, addEventPlanTask, updateEventPlanTaskStatus,
  addEventProgressUpdate, addEventFollowUp, respondToEventFollowUp, executeEvent, goLiveEvent,
  updateEvent
} from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan | null;
  teamMembers: User[];
  currentUserName: string;
  currentUserInitials: string;
  currentUserRole: string;
  primaryColor: string;
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type Tab = 'overview' | 'planning' | 'progress' | 'followups' | 'execute';

const TASK_STATUS_COLOR: Record<string, string> = {
  pending: '#5c5c8a',
  in_progress: '#0077ff',
  blocked: '#ff4d6d',
  done: '#00d4aa'
};

const CATEGORY_ICONS: Record<string, string> = {
  Venue: '🏛️', Catering: '🍽️', Marketing: '📢', Logistics: '📦',
  Talent: '🎤', Ticketing: '🎫', Legal: '⚖️', Setup: '🎬'
};

export const EventDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  event,
  teamMembers,
  currentUserName,
  currentUserInitials,
  currentUserRole,
  primaryColor,
  onRefresh,
  onShowToast,
}) => {
  const [tab, setTab] = useState<Tab>('overview');
  // New task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskCat, setNewTaskCat] = useState<EventPlanTask['category']>('Venue');
  const [newTaskBudget, setNewTaskBudget] = useState('');
  // Progress
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(50);
  const [isMilestone, setIsMilestone] = useState(false);
  // Follow-up
  const [fuTo, setFuTo] = useState('');
  const [fuMsg, setFuMsg] = useState('');
  const [fuReplyMap, setFuReplyMap] = useState<Record<string, string>>({});
  // Execute
  const [execNotes, setExecNotes] = useState('');
  const [execAttendees, setExecAttendees] = useState('');

  const progress = useMemo(() => (event ? computeEventProgress(event) : 0), [event]);
  const daysUntil = useMemo(() => {
    if (!event) return 0;
    return Math.round((new Date(event.eventDate).getTime() - Date.now()) / 86400000);
  }, [event]);

  const budgetUtilization = useMemo(() => {
    if (!event || event.budgetZAR === 0) return 0;
    return Math.round((event.spentZAR / event.budgetZAR) * 100);
  }, [event]);

  const revenueGenerated = useMemo(() => {
    if (!event) return 0;
    return event.ticketsSold * event.ticketPriceZAR;
  }, [event]);

  if (!isOpen || !event) return null;

  const canManage = currentUserRole === 'admin' || currentUserRole === 'manager';

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskAssignee) {
      onShowToast('Please enter task title and select an assignee', 'error');
      return;
    }
    const assignee = teamMembers.find(t => t.initials === newTaskAssignee);
    const task: EventPlanTask = {
      id: 'evt_t_' + Date.now(),
      title: newTaskTitle.trim(),
      assigneeName: assignee?.name || newTaskAssignee,
      assigneeInitials: newTaskAssignee,
      dueDate: newTaskDue || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      category: newTaskCat,
      budgetZAR: newTaskBudget ? Number(newTaskBudget) : undefined,
      createdAt: new Date().toISOString()
    };
    addEventPlanTask(event.id, task, currentUserName);
    onShowToast(`Planning task "${task.title}" added and assigned to ${task.assigneeName}`, 'success');
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskDue('');
    setNewTaskBudget('');
    onRefresh();
  };

  const handleTaskStatus = (taskId: string, status: EventPlanTask['status']) => {
    updateEventPlanTaskStatus(event.id, taskId, status, currentUserName);
    onShowToast(`Task marked as ${status.replace('_', ' ')}`, 'info');
    onRefresh();
  };

  const handleAddProgress = () => {
    if (!progressMsg.trim()) {
      onShowToast('Please write a progress update message', 'error');
      return;
    }
    addEventProgressUpdate(event.id, {
      id: 'evt_p_' + Date.now(),
      authorName: currentUserName,
      authorInitials: currentUserInitials,
      message: progressMsg.trim(),
      progressPercent,
      timestamp: new Date().toISOString(),
      isMilestone
    }, currentUserName);
    onShowToast(`Progress update posted (${progressPercent}%)${isMilestone ? ' — MILESTONE!' : ''}`, 'success');
    setProgressMsg('');
    setIsMilestone(false);
    onRefresh();
  };

  const handleAddFollowUp = () => {
    if (!fuTo || !fuMsg.trim()) {
      onShowToast('Select a team member and write your follow-up message', 'error');
      return;
    }
    const target = teamMembers.find(t => t.initials === fuTo);
    addEventFollowUp(event.id, {
      id: 'evt_f_' + Date.now(),
      fromName: currentUserName,
      toName: target?.name || fuTo,
      toInitials: fuTo,
      message: fuMsg.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }, currentUserName);
    onShowToast(`Follow-up sent to ${target?.name || fuTo}`, 'success');
    setFuMsg('');
    setFuTo('');
    onRefresh();
  };

  const handleReplyFollowUp = (fuId: string) => {
    const reply = fuReplyMap[fuId];
    if (!reply?.trim()) {
      onShowToast('Please write a reply', 'error');
      return;
    }
    respondToEventFollowUp(event.id, fuId, reply.trim(), currentUserName);
    onShowToast('Reply sent!', 'success');
    setFuReplyMap({ ...fuReplyMap, [fuId]: '' });
    onRefresh();
  };

  const handleGoLive = () => {
    goLiveEvent(event.id, currentUserName);
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#ff4d6d', '#ffc857', '#00d4aa'] });
    onShowToast(`🔴 ${event.name} is now LIVE at ${event.venue}!`, 'success');
    onRefresh();
  };

  const handleExecute = () => {
    if (!execAttendees) {
      onShowToast('Please enter actual attendance count', 'error');
      return;
    }
    const result = executeEvent(event.id, execNotes.trim() || 'Event completed successfully', Number(execAttendees), currentUserName);
    if (result.success) {
      confetti({ particleCount: 250, spread: 100, origin: { y: 0.5 }, colors: ['#ffc857', '#00d4aa', '#7b2ff2', '#0077ff'] });
      onShowToast(`🎉 ${result.message}`, 'success');
      onRefresh();
      onClose();
    }
  };

  const statusColor = {
    planning: '#0077ff', confirmed: '#c77dff', live: '#ff4d6d', completed: '#00d4aa', cancelled: '#5c5c8a'
  }[event.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Hero header */}
        <div
          className="p-5 sm:p-6 border-b border-[#2a2a4a] relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${statusColor}15, transparent)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40">
                  🎪 {event.category}
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border animate-pulse"
                  style={{ background: `${statusColor}20`, color: statusColor, borderColor: `${statusColor}60` }}
                >
                  ● {event.status === 'live' ? '🔴 LIVE NOW' : event.status}
                </span>
                {daysUntil >= 0 && event.status !== 'completed' && (
                  <span className="text-[10px] font-bold text-[#c77dff] bg-[#7b2ff2]/15 px-2 py-0.5 rounded">
                    {daysUntil === 0 ? 'TODAY!' : `${daysUntil} days away`}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">{event.name}</h2>
              <div className="flex items-center gap-3 flex-wrap mt-1 text-[11px] text-[#e8e8f4]">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ff4d6d]" /> {event.venue}, {event.city}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#c77dff]" /> {event.expectedAttendees} expected</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a] flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a4a] bg-[#0a0a14] overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Award },
            { id: 'planning', label: `Planning (${event.planningTasks.length})`, icon: CheckCircle2 },
            { id: 'progress', label: `Progress (${event.progressUpdates.length})`, icon: TrendingUp },
            { id: 'followups', label: `Follow-Ups (${event.followUps.length})`, icon: MessageSquare },
            { id: 'execute', label: 'Execute Event', icon: Play }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`px-3 sm:px-4 py-3 text-[11px] font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                  tab === t.id
                    ? 'border-[#ffc857] text-[#ffc857]'
                    : 'border-transparent text-[#9090b8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {tab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Big stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-[#9090b8] tracking-wider block">Planning Progress</span>
                  <span className="text-xl font-extrabold text-[#c77dff]">{progress}%</span>
                  <div className="w-full h-1.5 rounded-full bg-[#12121f] mt-2 overflow-hidden">
                    <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #c77dff, #0077ff)' }} className="h-full" />
                  </div>
                </div>
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-[#9090b8] tracking-wider block">Budget Used</span>
                  <span className={`text-xl font-extrabold ${budgetUtilization > 90 ? 'text-[#ff4d6d]' : budgetUtilization > 70 ? 'text-[#ffc857]' : 'text-[#00d4aa]'}`}>
                    {budgetUtilization}%
                  </span>
                  <span className="text-[10px] text-[#9090b8] block mt-0.5">{formatZAR(event.spentZAR)} / {formatZAR(event.budgetZAR)}</span>
                </div>
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-[#9090b8] tracking-wider block">Tickets Sold</span>
                  <span className="text-xl font-extrabold text-[#ffc857]">{event.ticketsSold}<span className="text-xs text-[#9090b8]">/{event.expectedAttendees}</span></span>
                  <span className="text-[10px] text-[#ffc857] block mt-0.5">{formatZAR(event.ticketPriceZAR)}/ticket</span>
                </div>
                <div className="bg-gradient-to-br from-[#00d4aa]/20 to-[#0077ff]/10 border border-[#00d4aa]/40 rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold text-[#00d4aa] tracking-wider block">Revenue (ZAR)</span>
                  <span className="text-xl font-extrabold text-[#00d4aa]">{formatZAR(revenueGenerated)}</span>
                  <span className="text-[10px] text-[#9090b8] block mt-0.5">All-time ticket sales</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Event Description</h4>
                <p className="text-xs text-[#e8e8f4] leading-relaxed bg-[#0a0a14] border border-[#2a2a4a] p-4 rounded-xl">
                  {event.description}
                </p>
              </div>

              {/* Team */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Event Team ({event.teamMembers.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {event.teamMembers.map(init => {
                    const u = teamMembers.find(t => t.initials === init);
                    return (
                      <div key={init} className="bg-[#0a0a14] border border-[#2a2a4a] px-3 py-2 rounded-lg flex items-center gap-2">
                        <div style={{ background: primaryColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          {init}
                        </div>
                        <span className="text-xs text-white">{u?.name || init}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Go live button */}
              {canManage && event.status === 'confirmed' && (
                <button
                  onClick={handleGoLive}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff4d6d] via-[#ffc857] to-[#ff4d6d] text-white font-extrabold text-sm shadow-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <Radio className="w-5 h-5" />
                  <span>🔴 GO LIVE — Start Event Now</span>
                </button>
              )}
              {canManage && event.status === 'planning' && progress >= 60 && (
                <div className="bg-[#c77dff]/15 border border-[#c77dff]/30 p-4 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white">Ready to confirm this event?</span>
                    <span className="text-[10px] text-[#9090b8] block">Planning is {progress}% complete — move to Confirmed status.</span>
                  </div>
                  <button
                    onClick={() => {
                      event.status = 'confirmed';
                      updateEvent(event);
                      onRefresh();
                      onShowToast('Event moved to CONFIRMED status ✓', 'success');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#c77dff] text-white font-bold text-xs hover:opacity-90"
                  >
                    Mark Confirmed →
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'planning' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {canManage && (
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#ffc857]" /> Add Planning Task
                  </h4>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title (e.g. Book photographer)"
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ffc857]"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2 py-2 text-white text-xs"
                    >
                      <option value="">Assign to...</option>
                      {teamMembers.map(u => <option key={u.id} value={u.initials}>{u.name}</option>)}
                    </select>
                    <select
                      value={newTaskCat}
                      onChange={(e) => setNewTaskCat(e.target.value as any)}
                      className="bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2 py-2 text-white text-xs"
                    >
                      {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                    </select>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2 py-2 text-white text-xs"
                    />
                    <input
                      type="number"
                      value={newTaskBudget}
                      onChange={(e) => setNewTaskBudget(e.target.value)}
                      placeholder="Budget ZAR"
                      className="bg-[#12121f] border border-[#2a2a4a] rounded-lg px-2 py-2 text-white text-xs"
                    />
                  </div>
                  <button onClick={handleAddTask} className="w-full py-2 rounded-lg bg-[#ffc857] text-black font-bold text-xs hover:opacity-90 flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add Task to Event
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {event.planningTasks.map(task => {
                  const overdue = new Date(task.dueDate).getTime() < Date.now() && task.status !== 'done';
                  return (
                    <div key={task.id} className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 hover:border-[#ffc857]/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[task.category]}</span>
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-white leading-snug">{task.title}</h5>
                            {task.description && <p className="text-[11px] text-[#9090b8] mt-0.5">{task.description}</p>}
                          </div>
                        </div>
                        <span
                          className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border flex-shrink-0"
                          style={{ background: `${TASK_STATUS_COLOR[task.status]}20`, color: TASK_STATUS_COLOR[task.status], borderColor: `${TASK_STATUS_COLOR[task.status]}60` }}
                        >
                          ● {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-[10px] text-[#9090b8] pt-2 border-t border-[#2a2a4a]/60">
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#7b2ff2]/20 text-[#c77dff] flex items-center justify-center text-[8px] font-bold">
                            {task.assigneeInitials}
                          </div>
                          {task.assigneeName}
                        </span>
                        <span className={overdue ? 'text-[#ff4d6d] font-bold' : ''}>
                          {overdue && '⚠ '} Due: {task.dueDate}
                        </span>
                        {task.budgetZAR && <span className="text-[#00d4aa] font-mono font-bold">{formatZAR(task.budgetZAR)}</span>}
                      </div>
                      {canManage && task.status !== 'done' && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(['pending', 'in_progress', 'blocked', 'done'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => handleTaskStatus(task.id, s)}
                              disabled={task.status === s}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                task.status === s
                                  ? 'bg-[#2a2a4a] text-[#5c5c8a] cursor-not-allowed'
                                  : 'bg-[#12121f] border border-[#2a2a4a] text-[#9090b8] hover:text-white hover:border-[#ffc857]'
                              }`}
                            >
                              {s.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'progress' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Post Progress Update</h4>
                <textarea
                  rows={2}
                  value={progressMsg}
                  onChange={(e) => setProgressMsg(e.target.value)}
                  placeholder="Share what you've completed, milestones hit, or blockers..."
                  className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#00d4aa]"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block mb-1">Overall Progress: {progressPercent}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressPercent}
                      onChange={(e) => setProgressPercent(Number(e.target.value))}
                      className="w-full accent-[#00d4aa]"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-[#e8e8f4] cursor-pointer">
                    <input type="checkbox" checked={isMilestone} onChange={(e) => setIsMilestone(e.target.checked)} className="accent-[#ffc857]" />
                    <span>🏆 Milestone</span>
                  </label>
                  <button onClick={handleAddProgress} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00d4aa] to-[#0077ff] text-black font-bold text-xs">
                    <Send className="w-3.5 h-3.5 inline mr-1" /> Post Update
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {event.progressUpdates.length === 0 ? (
                  <div className="text-center py-8 bg-[#0a0a14] border border-dashed border-[#2a2a4a] rounded-xl">
                    <TrendingUp className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
                    <span className="text-xs text-[#9090b8]">No progress updates yet. Post the first one!</span>
                  </div>
                ) : (
                  event.progressUpdates.map(update => (
                    <div key={update.id} className={`border rounded-xl p-4 ${update.isMilestone ? 'bg-[#ffc857]/10 border-[#ffc857]/40' : 'bg-[#0a0a14] border-[#2a2a4a]'}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/40 flex items-center justify-center text-xs font-bold">
                            {update.authorInitials}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{update.authorName}</span>
                            {update.isMilestone && <span className="ml-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#ffc857] text-black">🏆 MILESTONE</span>}
                            <span className="text-[10px] text-[#5c5c8a] block">{new Date(update.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-lg font-extrabold text-[#c77dff]">{update.progressPercent}%</span>
                      </div>
                      <p className="text-xs text-[#e8e8f4] leading-relaxed">{update.message}</p>
                      {update.attachmentUrl && (
                        <a href={update.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#0077ff] hover:underline">
                          <ChevronRight className="w-3 h-3" /> {update.attachmentUrl}
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'followups' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {canManage && (
                <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Send Follow-Up to Team Member</h4>
                  <select
                    value={fuTo}
                    onChange={(e) => setFuTo(e.target.value)}
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-xs"
                  >
                    <option value="">Select team member...</option>
                    {teamMembers.filter(u => event.teamMembers.includes(u.initials)).map(u => (
                      <option key={u.id} value={u.initials}>{u.name}</option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    value={fuMsg}
                    onChange={(e) => setFuMsg(e.target.value)}
                    placeholder="What do you need to follow up on?"
                    className="w-full bg-[#12121f] border border-[#2a2a4a] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
                  />
                  <button onClick={handleAddFollowUp} className="w-full py-2 rounded-lg bg-[#ffc857] text-black font-bold text-xs flex items-center justify-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Send Follow-Up
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {event.followUps.length === 0 ? (
                  <div className="text-center py-8 bg-[#0a0a14] border border-dashed border-[#2a2a4a] rounded-xl">
                    <MessageSquare className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
                    <span className="text-xs text-[#9090b8]">No follow-ups yet.</span>
                  </div>
                ) : (
                  event.followUps.map(fu => (
                    <div key={fu.id} className={`border rounded-xl p-4 ${
                      fu.status === 'pending' ? 'bg-[#ffc857]/10 border-[#ffc857]/40' :
                      fu.status === 'responded' ? 'bg-[#00d4aa]/10 border-[#00d4aa]/40' :
                      'bg-[#0a0a14] border-[#2a2a4a]'
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{fu.fromName}</span>
                          <ChevronRight className="w-3 h-3 text-[#5c5c8a]" />
                          <span className="text-xs font-bold text-[#c77dff]">{fu.toName}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            fu.status === 'pending' ? 'bg-[#ffc857]/20 text-[#ffc857] animate-pulse' :
                            fu.status === 'responded' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                            'bg-[#0077ff]/20 text-[#0077ff]'
                          }`}>● {fu.status}</span>
                        </div>
                        <span className="text-[10px] text-[#5c5c8a]">{new Date(fu.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-[#e8e8f4] leading-relaxed">{fu.message}</p>
                      {fu.reply && (
                        <div className="mt-2 pt-2 border-t border-[#2a2a4a] bg-[#00d4aa]/5 rounded-lg p-2">
                          <span className="text-[10px] font-bold text-[#00d4aa] uppercase block mb-1">💬 Reply from {fu.toName}</span>
                          <p className="text-xs text-[#e8e8f4]">{fu.reply}</p>
                        </div>
                      )}
                      {fu.status === 'pending' && fu.toInitials === currentUserInitials && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={fuReplyMap[fu.id] || ''}
                            onChange={(e) => setFuReplyMap({ ...fuReplyMap, [fu.id]: e.target.value })}
                            placeholder="Type your reply..."
                            className="flex-1 bg-[#12121f] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00d4aa]"
                          />
                          <button onClick={() => handleReplyFollowUp(fu.id)} className="px-4 py-2 rounded-lg bg-[#00d4aa] text-black font-bold text-xs">
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'execute' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {event.status === 'completed' ? (
                <div className="text-center py-8 bg-gradient-to-br from-[#00d4aa]/20 to-[#0077ff]/10 border border-[#00d4aa]/40 rounded-2xl">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-lg font-bold text-white mb-1">Event Completed!</h3>
                  <p className="text-xs text-[#9090b8]">{event.actualAttendees} attendees • Revenue: {formatZAR(revenueGenerated)}</p>
                  {event.executionNotes && (
                    <p className="text-xs text-[#e8e8f4] mt-3 max-w-md mx-auto italic">"{event.executionNotes}"</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-[#ff4d6d]/15 to-[#ffc857]/15 border border-[#ff4d6d]/40 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#ff4d6d] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">Mark Event as Executed</h4>
                      <p className="text-[11px] text-[#e8e8f4] leading-relaxed">
                        Once you mark this event as executed, it will be locked, revenue calculated, and moved to the completed archive. Make sure all invoices are settled first.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#c77dff]" /> Actual Attendance Count *
                    </label>
                    <input
                      type="number"
                      value={execAttendees}
                      onChange={(e) => setExecAttendees(e.target.value)}
                      placeholder={String(event.expectedAttendees)}
                      className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-lg font-extrabold focus:outline-none focus:border-[#ffc857]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                      Event Execution Notes
                    </label>
                    <textarea
                      rows={4}
                      value={execNotes}
                      onChange={(e) => setExecNotes(e.target.value)}
                      placeholder="How did the event go? Highlights, feedback, incidents, sponsor performance..."
                      className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#ffc857] leading-relaxed"
                    />
                  </div>

                  <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Event Final Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="text-[#9090b8]">Tickets Sold:</span><span className="text-white font-bold text-right">{event.ticketsSold}</span>
                      <span className="text-[#9090b8]">Ticket Revenue:</span><span className="text-[#00d4aa] font-bold text-right">{formatZAR(revenueGenerated)}</span>
                      <span className="text-[#9090b8]">Budget Spent:</span><span className="text-[#ffc857] font-bold text-right">{formatZAR(event.spentZAR)}</span>
                      <span className="text-[#9090b8]">Net Profit/Loss:</span><span className={`font-bold text-right ${revenueGenerated - event.spentZAR >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}`}>
                        {formatZAR(revenueGenerated - event.spentZAR)}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={handleExecute}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00d4aa] via-[#ffc857] to-[#7b2ff2] text-white font-extrabold text-sm shadow-2xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Execute & Complete Event 🎉</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
