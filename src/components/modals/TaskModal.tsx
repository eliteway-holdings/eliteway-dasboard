import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Clock, Tag, User as UserIcon, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Task, TaskColumn, TaskPriority, User } from '../../types';
import { addTask, updateTask, deleteTask } from '../../services/store';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  initialCol?: TaskColumn;
  existingTask?: Task | null;
  teamMembers?: User[];
  onTaskSaved: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  canEdit: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  bizId,
  initialCol = 'todo',
  existingTask = null,
  teamMembers = [],
  onTaskSaved,
  onShowToast,
  canEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Design' | 'Dev' | 'Marketing' | 'Strategy' | 'Operations' | 'AI Workflow'>('Design');
  const [col, setCol] = useState<TaskColumn>(initialCol);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('SC');
  const [assigneeName, setAssigneeName] = useState('Sarah Chen');
  const [dueDate, setDueDate] = useState('2026-04-15');
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description || '');
      setCategory(existingTask.category);
      setCol(existingTask.col);
      setPriority(existingTask.priority);
      setAssignee(existingTask.assignee);
      setAssigneeName(existingTask.assigneeName || 'Team Member');
      setDueDate(existingTask.dueDate || '2026-04-15');
      setChecklist(existingTask.checklist || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Design');
      setCol(initialCol);
      setPriority('medium');
      // Do not auto-assign — require asking/selecting from team members
      setAssignee('');
      setAssigneeName('');
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setChecklist([
        { id: 'cl_1', text: 'Define deliverables scope & client requirements', done: false },
        { id: 'cl_2', text: 'Peer review with workspace lead', done: false }
      ]);
    }
  }, [existingTask, initialCol, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !canEdit) return;
    if (!assignee) {
      onShowToast('Please select who this task will be assigned to from your team members', 'error');
      return;
    }

    if (existingTask) {
      updateTask({
        ...existingTask,
        title,
        description,
        category,
        col,
        priority,
        assignee,
        assigneeName,
        dueDate,
        checklist,
      });
      onShowToast(`Updated task "${title.substring(0, 25)}..."`, 'success');
    } else {
      addTask({
        id: 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        bizId,
        title,
        description,
        category,
        col,
        priority,
        assignee,
        assigneeName,
        dueDate,
        commentsCount: 0,
        attachmentsCount: 1,
        tags: [category, priority.toUpperCase()],
        checklist,
        estimatedHours: 8,
        loggedHours: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
      onShowToast(`Created task "${title.substring(0, 25)}..."`, 'success');
    }

    onTaskSaved();
    onClose();
  };

  const handleDelete = () => {
    if (!existingTask || !canEdit) return;
    deleteTask(existingTask.id);
    onShowToast(`Deleted task "${existingTask.title.substring(0, 25)}..."`, 'info');
    onTaskSaved();
    onClose();
  };

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([...checklist, { id: 'cl_' + Date.now(), text: newChecklistText.trim(), done: false }]);
    setNewChecklistText('');
  };

  const toggleChecklist = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a4a] flex items-center justify-between bg-[#1a1a2e]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#7b2ff2]/20 text-[#c77dff] border border-[#7b2ff2]/30 mb-1 inline-block">
              {existingTask ? 'Inspect / Edit Task' : 'Create New Task'}
            </span>
            <h3 className="text-lg font-bold text-white leading-tight">
              {existingTask ? existingTask.title : 'New Workspace Deliverable Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {!canEdit && (
            <div className="bg-[#ffc857]/15 border border-[#ffc857]/30 p-3 rounded-xl flex items-center gap-2 text-xs text-[#ffc857]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>You are viewing this task with view-only or member status permissions.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              disabled={!canEdit}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Responsive Apple Pay Modal & Stripe Checkout UI"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7b2ff2] transition-colors disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#c77dff]" /> Category
              </label>
              <select
                disabled={!canEdit}
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-60"
              >
                <option value="Design">🎨 Design</option>
                <option value="Dev">💻 Engineering</option>
                <option value="Marketing">📢 Marketing</option>
                <option value="Strategy">🎯 Strategy</option>
                <option value="Operations">⚙️ Operations</option>
                <option value="AI Workflow">⚡ AI Workflow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ffc857]" /> Column Status
              </label>
              <select
                disabled={!canEdit}
                value={col}
                onChange={(e) => setCol(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-60"
              >
                <option value="backlog">📋 Backlog</option>
                <option value="todo">📌 To Do</option>
                <option value="inprogress">⚡ In Progress</option>
                <option value="inreview">👀 In Review</option>
                <option value="done">✓ Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#ff4d6d]" /> Priority
              </label>
              <select
                disabled={!canEdit}
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-60"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#0077ff]" /> Assign To (Team Member) *
              </label>
              <select
                disabled={!canEdit}
                required
                value={assignee}
                onChange={(e) => {
                  const val = e.target.value;
                  setAssignee(val);
                  const found = teamMembers?.find(u => u.initials === val || u.id === val);
                  setAssigneeName(found ? found.name : val);
                }}
                className={`w-full bg-[#0a0a14] border rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-60 ${
                  !assignee ? 'border-[#ff4d6d]/70 text-[#ff4d6d]' : 'border-[#2a2a4a]'
                }`}
              >
                <option value="">-- Who will this be assigned to? --</option>
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map(u => (
                    <option key={u.id} value={u.initials}>
                      {u.role === 'admin' ? '👑' : u.role === 'manager' ? '📊' : '💼'} {u.name} ({u.role.toUpperCase()}) — {u.department || 'Team'}
                    </option>
                  ))
                ) : (
                  <option value="SC">👑 Sarah Chen (ADMIN)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                disabled={!canEdit}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#7b2ff2] disabled:opacity-60"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Detailed Scope & Instructions
            </label>
            <textarea
              rows={3}
              disabled={!canEdit}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail out exact requirements, Figma frame names, Make.com webhook endpoints, or Stripe API keys..."
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#7b2ff2] leading-relaxed disabled:opacity-60"
            />
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#00d4aa]" /> Task Checklist ({checklist.filter(c => c.done).length}/{checklist.length})
              </span>
            </label>
            
            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    item.done
                      ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#9090b8] line-through'
                      : 'bg-[#0a0a14] border-[#2a2a4a] text-white hover:border-[#5c5c8a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-[#2a2a4a] bg-[#12121f] text-[#00d4aa] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs truncate">{item.text}</span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChecklist(checklist.filter(c => c.id !== item.id));
                      }}
                      className="text-[#5c5c8a] hover:text-[#ff4d6d] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist();
                    }
                  }}
                  placeholder="Add a checklist step (Press Enter)..."
                  className="flex-1 bg-[#0a0a14] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#7b2ff2]"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#7b2ff2] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a4a] flex items-center justify-between">
            {existingTask && canEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-[#ff4d6d]/15 border border-[#ff4d6d]/30 text-[#ff4d6d] text-xs font-semibold hover:bg-[#ff4d6d] hover:text-white transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Task
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#2a2a4a] text-xs text-[#9090b8] hover:text-white transition-colors"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b2ff2] to-[#0077ff] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
                >
                  {existingTask ? 'Save Changes →' : 'Add Task to Board →'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
