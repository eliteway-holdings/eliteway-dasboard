import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Ticket, DollarSign, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, User } from '../../types';
import { createEvent, formatZAR } from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bizId: string;
  subaccountId: string;
  teamMembers: User[];
  primaryColor: string;
  actorName: string;
  onCreated: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SA_CITIES = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Stellenbosch', 'Sandton', 'Rosebank'];

export const CreateEventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  bizId,
  subaccountId,
  teamMembers,
  primaryColor,
  actorName,
  onCreated,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventPlan['category']>('Conference');
  const [eventDate, setEventDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Johannesburg');
  const [expectedAttendees, setExpectedAttendees] = useState('150');
  const [budgetZAR, setBudgetZAR] = useState('250000');
  const [ticketPriceZAR, setTicketPriceZAR] = useState('750');
  const [selectedTeam, setSelectedTeam] = useState<string[]>(teamMembers[0] ? [teamMembers[0].initials] : []);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleTeam = (init: string) => {
    setSelectedTeam(selectedTeam.includes(init) ? selectedTeam.filter(x => x !== init) : [...selectedTeam, init]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !venue.trim()) {
      onShowToast('Please fill in event name and venue', 'error');
      return;
    }

    const evt: EventPlan = {
      id: 'evt_' + Date.now(),
      bizId,
      subaccountId,
      name: name.trim(),
      description: description.trim() || `${category} event in ${city}`,
      eventDate,
      venue: venue.trim(),
      city,
      expectedAttendees: Number(expectedAttendees) || 100,
      budgetZAR: Number(budgetZAR) || 100000,
      spentZAR: 0,
      ticketPriceZAR: Number(ticketPriceZAR) || 0,
      ticketsSold: 0,
      status: 'planning',
      category,
      teamMembers: selectedTeam,
      planningTasks: [
        { id: 'evt_st_' + Date.now() + '_1', title: 'Confirm venue booking & deposit', assigneeName: teamMembers[0]?.name || actorName, assigneeInitials: teamMembers[0]?.initials || 'AD', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], status: 'pending', category: 'Venue', budgetZAR: Number(budgetZAR) * 0.2, createdAt: new Date().toISOString() },
        { id: 'evt_st_' + Date.now() + '_2', title: 'Launch ticket sales & marketing campaign', assigneeName: teamMembers[0]?.name || actorName, assigneeInitials: teamMembers[0]?.initials || 'AD', dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0], status: 'pending', category: 'Marketing', createdAt: new Date().toISOString() },
        { id: 'evt_st_' + Date.now() + '_3', title: 'Finalise catering & AV supplier quotes', assigneeName: teamMembers[0]?.name || actorName, assigneeInitials: teamMembers[0]?.initials || 'AD', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], status: 'pending', category: 'Catering', createdAt: new Date().toISOString() }
      ],
      progressUpdates: [],
      followUps: [],
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    setTimeout(() => {
      const result = createEvent(evt, actorName);
      setIsSaving(false);
      if (!result.success) {
        onShowToast(result.message, 'error');
        return;
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffc857', '#f7931a', '#7b2ff2']
      });
      onShowToast(`🎉 ${result.message}`, 'success');
      setName('');
      setDescription('');
      setVenue('');
      onCreated();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a14]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="p-6 border-b border-[#2a2a4a] bg-gradient-to-r from-[#1a1a2e] to-[#12121f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #ffc857)` }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg text-lg"
            >
              🎪
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffc857]">Events Planner</span>
              <h3 className="text-lg font-bold text-white leading-tight">Launch New Event</h3>
              <p className="text-xs text-[#9090b8]">Plan, follow-up, execute — all in ZAR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9090b8] hover:text-white transition-colors p-2 bg-[#12121f] rounded-lg border border-[#2a2a4a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Event Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Innovate Summit 2026"
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffc857]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
              >
                <option value="Conference">🎤 Conference</option>
                <option value="Workshop">🎓 Workshop</option>
                <option value="Wedding">💍 Wedding</option>
                <option value="Corporate">💼 Corporate</option>
                <option value="Concert">🎵 Concert</option>
                <option value="Launch">🚀 Product Launch</option>
                <option value="Gala">🥂 Gala</option>
                <option value="Community">🌍 Community</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0077ff]" /> Event Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ff4d6d]" /> Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Sandton Convention Centre"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
              >
                {SA_CITIES.map(c => <option key={c} value={c}>{c}, South Africa</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#c77dff]" /> Expected Attendees
              </label>
              <input
                type="number"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffc857]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#00d4aa]" /> Budget (ZAR)
              </label>
              <input
                type="number"
                value={budgetZAR}
                onChange={(e) => setBudgetZAR(e.target.value)}
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-[#00d4aa]"
              />
              <span className="text-[10px] text-[#00d4aa] mt-1 block font-mono">{formatZAR(Number(budgetZAR) || 0)}</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#ffc857]" /> Ticket Price (ZAR)
              </label>
              <input
                type="number"
                value={ticketPriceZAR}
                onChange={(e) => setTicketPriceZAR(e.target.value)}
                placeholder="0 for free"
                className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-[#ffc857]"
              />
              <span className="text-[10px] text-[#ffc857] mt-1 block font-mono">{formatZAR(Number(ticketPriceZAR) || 0)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Event Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#ffc857]"
            />
          </div>

          {/* Team assignment */}
          <div>
            <label className="block text-xs font-bold text-[#9090b8] uppercase tracking-wider mb-2">
              Assign Event Team ({selectedTeam.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleTeam(u.initials)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedTeam.includes(u.initials)
                      ? 'bg-[#ffc857]/20 border-[#ffc857] text-[#ffc857]'
                      : 'bg-[#0a0a14] border-[#2a2a4a] text-[#9090b8] hover:border-[#5c5c8a]'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#12121f] flex items-center justify-center text-[10px] font-extrabold">
                    {u.initials}
                  </span>
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#ffc857]/10 to-[#f7931a]/10 border border-[#ffc857]/30 p-3.5 rounded-xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#ffc857] flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#e8e8f4]">
              <strong className="text-white">Auto-generated starter plan:</strong> 3 planning tasks (venue booking, marketing launch, catering) will be auto-created and assigned to your team. You can add more anytime.
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffc857] via-[#f7931a] to-[#7b2ff2] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              {isSaving ? '⏳ Creating...' : <>
                <Calendar className="w-4 h-4" />
                <span>Launch Event Planning →</span>
              </>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
