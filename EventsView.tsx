import React, { useState, useMemo } from 'react';
import {
  Calendar, MapPin, Users, Plus, Lock, Award, TrendingUp, Ticket, Radio, CheckCircle2
} from 'lucide-react';
import { EventPlan, User } from '../../types';
import {
  getEventsForBiz, getEventSubaccountForBiz, formatZAR, computeEventProgress, EVENT_TIER_FEES
} from '../../services/store';
import { CreateEventModal } from '../modals/CreateEventModal';
import { EventDetailModal } from '../modals/EventDetailModal';

interface Props {
  bizId: string;
  bizName: string;
  primaryColor: string;
  teamMembers: User[];
  currentUserName: string;
  currentUserInitials: string;
  currentUserRole: string;
  refreshKey: number;
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onOpenKanban?: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  planning: '#0077ff',
  confirmed: '#c77dff',
  live: '#ff4d6d',
  completed: '#00d4aa',
  cancelled: '#5c5c8a'
};

const CATEGORY_EMOJI: Record<string, string> = {
  Conference: '🎤', Workshop: '🎓', Wedding: '💍', Corporate: '💼',
  Concert: '🎵', Launch: '🚀', Gala: '🥂', Community: '🌍'
};

export const EventsView: React.FC<Props> = ({
  bizId,
  bizName,
  primaryColor,
  teamMembers,
  currentUserName,
  currentUserInitials,
  currentUserRole,
  refreshKey,
  onRefresh,
  onShowToast,
  onOpenKanban,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventPlan | null>(null);

  const subaccount = useMemo(() => {
    const _ = refreshKey; void _;
    return getEventSubaccountForBiz(bizId);
  }, [bizId, refreshKey]);

  const events = useMemo(() => {
    const _ = refreshKey; void _;
    return getEventsForBiz(bizId);
  }, [bizId, refreshKey]);

  // Not enabled state — show upsell
  if (!subaccount) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#ffc857]/10 border border-[#ffc857]/40 rounded-2xl p-8 sm:p-10 text-center">
          <div className="text-5xl mb-3">🎪</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Events Subaccount Not Active</h2>
          <p className="text-sm text-[#9090b8] max-w-lg mx-auto mb-6 leading-relaxed">
            Unlock the full Events Planner suite for <strong className="text-[#ffc857]">{bizName}</strong> — manage conferences, weddings, concerts, and corporate events with ZAR ticketing, team follow-ups, and live execution mode.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
            {(Object.keys(EVENT_TIER_FEES) as Array<'basic' | 'pro' | 'elite'>).map(tier => {
              const info = EVENT_TIER_FEES[tier];
              const c = tier === 'basic' ? '#0077ff' : tier === 'pro' ? '#ffc857' : '#c77dff';
              return (
                <div key={tier} className="bg-[#0a0a14] border border-[#2a2a4a] rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" style={{ color: c }} />
                    <span className="text-xs font-extrabold text-white uppercase">{info.label}</span>
                  </div>
                  <span className="text-2xl font-extrabold block mb-2" style={{ color: c }}>{formatZAR(info.monthlyZAR)}<span className="text-xs text-[#9090b8]"> /mo</span></span>
                  <div className="space-y-1">
                    {info.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-1 text-[10px] text-[#e8e8f4]">
                        <CheckCircle2 className="w-2.5 h-2.5 mt-0.5" style={{ color: c }} /><span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0a0a14] border border-[#ffc857]/30 p-4 rounded-xl max-w-xl mx-auto">
            <Lock className="w-5 h-5 text-[#ffc857] mx-auto mb-2" />
            <p className="text-xs text-[#e8e8f4]">
              Only <strong className="text-[#ff4d6d]">⚡ Ultra Admin</strong> can activate the Events Subaccount for your workspace.
              Please contact your platform administrator to enable this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const canManage = currentUserRole === 'admin' || currentUserRole === 'manager';
  const tierInfo = EVENT_TIER_FEES[subaccount.tier];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Subaccount hero */}
      <div className="bg-gradient-to-br from-[#12121f] via-[#1a1a2e] to-[#ffc857]/15 border border-[#ffc857]/40 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{ background: `linear-gradient(135deg, ${primaryColor}, #ffc857, #f7931a)` }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl text-2xl flex-shrink-0"
            >
              🎪
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white">Events Planner Subaccount</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#ffc857]/20 text-[#ffc857] border border-[#ffc857]/40">
                  ● {tierInfo.label}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#9090b8]">
                Plan, follow-up, execute. Billed <strong className="text-[#ffc857]">{formatZAR(subaccount.monthlyFeeZAR)}/mo</strong> to {bizName} — active until {subaccount.activeUntil}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {onOpenKanban && (
                <button
                  onClick={onOpenKanban}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#0077ff]/15 border border-[#0077ff]/40 text-[#0077ff] font-bold text-xs hover:bg-[#0077ff]/25 transition-all flex items-center justify-center gap-1.5"
                  title="Planning tasks mirror onto the Kanban board"
                >
                  <span>📋 Kanban Sync →</span>
                </button>
              )}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#ffc857] via-[#f7931a] to-[#7b2ff2] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Launch New Event</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#2a2a4a]/80">
          <div className="bg-[#0a0a14]/60 border border-[#2a2a4a] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block">Total Events</span>
            <span className="text-xl font-extrabold text-white">{events.length}</span>
          </div>
          <div className="bg-[#0a0a14]/60 border border-[#2a2a4a] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block">Currently Planning</span>
            <span className="text-xl font-extrabold text-[#0077ff]">{events.filter(e => e.status === 'planning' || e.status === 'confirmed').length}</span>
          </div>
          <div className="bg-[#0a0a14]/60 border border-[#2a2a4a] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#9090b8] tracking-wider block">Tickets Sold</span>
            <span className="text-xl font-extrabold text-[#ffc857]">
              {events.reduce((a, e) => a + e.ticketsSold, 0)}
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#00d4aa]/20 to-[#0077ff]/10 border border-[#00d4aa]/40 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#00d4aa] tracking-wider block">Lifetime Revenue (ZAR)</span>
            <span className="text-xl font-extrabold text-[#00d4aa]">
              {formatZAR(events.reduce((a, e) => a + (e.ticketsSold * e.ticketPriceZAR), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Events grid */}
      {events.length === 0 ? (
        <div className="bg-[#12121f] border border-dashed border-[#2a2a4a] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-[#5c5c8a] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No events yet</h3>
          <p className="text-xs text-[#9090b8] mb-4">Click "Launch New Event" to plan your first conference, wedding, or corporate gala.</p>
          {canManage && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc857] to-[#f7931a] text-white font-bold text-xs shadow hover:opacity-95"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Create First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => {
            const progress = computeEventProgress(event);
            const daysUntil = Math.round((new Date(event.eventDate).getTime() - Date.now()) / 86400000);
            const revenue = event.ticketsSold * event.ticketPriceZAR;
            const pendingFUs = event.followUps.filter(f => f.status === 'pending').length;

            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-[#12121f] border border-[#2a2a4a] rounded-2xl overflow-hidden text-left hover:border-[#ffc857]/60 hover:-translate-y-0.5 transition-all shadow-xl group"
              >
                {/* Header banner */}
                <div
                  className="p-4 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${STATUS_COLOR[event.status]}20, transparent)` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{CATEGORY_EMOJI[event.category]}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0a0a14]/80 text-white border border-[#2a2a4a]">
                        {event.category}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border"
                      style={{ background: `${STATUS_COLOR[event.status]}25`, color: STATUS_COLOR[event.status], borderColor: `${STATUS_COLOR[event.status]}60` }}
                    >
                      {event.status === 'live' && <Radio className="w-2.5 h-2.5 inline mr-0.5 animate-pulse" />}
                      ● {event.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg leading-tight group-hover:text-[#ffc857] transition-colors">
                    {event.name}
                  </h3>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#e8e8f4]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#0077ff]" /> {event.eventDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ff4d6d]" /> {event.venue}</span>
                    {daysUntil > 0 && event.status !== 'completed' && (
                      <span className="text-[#c77dff] font-bold">{daysUntil}d away</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                      <span className="text-[#9090b8]">Planning Progress</span>
                      <span className="text-[#c77dff]">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0a0a14] overflow-hidden">
                      <div style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #c77dff, #0077ff, #00d4aa)' }} className="h-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-lg p-2 text-center">
                      <Users className="w-3 h-3 text-[#c77dff] mx-auto mb-0.5" />
                      <span className="text-[10px] text-[#9090b8] block">Attendees</span>
                      <span className="text-xs font-bold text-white">{event.ticketsSold}/{event.expectedAttendees}</span>
                    </div>
                    <div className="bg-[#0a0a14] border border-[#2a2a4a] rounded-lg p-2 text-center">
                      <Ticket className="w-3 h-3 text-[#ffc857] mx-auto mb-0.5" />
                      <span className="text-[10px] text-[#9090b8] block">Ticket</span>
                      <span className="text-xs font-bold text-[#ffc857]">{event.ticketPriceZAR === 0 ? 'FREE' : formatZAR(event.ticketPriceZAR)}</span>
                    </div>
                    <div className="bg-[#0a0a14] border border-[#00d4aa]/30 rounded-lg p-2 text-center">
                      <TrendingUp className="w-3 h-3 text-[#00d4aa] mx-auto mb-0.5" />
                      <span className="text-[10px] text-[#9090b8] block">Revenue</span>
                      <span className="text-xs font-bold text-[#00d4aa]">{formatZAR(revenue)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2a2a4a]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {event.teamMembers.slice(0, 3).map((init, i) => (
                        <div key={i} style={{ background: primaryColor, marginLeft: i > 0 ? '-6px' : 0, zIndex: 3 - i }} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#12121f]">
                          {init}
                        </div>
                      ))}
                      {event.teamMembers.length > 3 && (
                        <span className="text-[10px] text-[#9090b8] ml-1">+{event.teamMembers.length - 3}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {pendingFUs > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#ffc857]/20 text-[#ffc857] font-bold animate-pulse">
                          {pendingFUs} follow-up{pendingFUs !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-[#5c5c8a]">{event.progressUpdates.length} updates</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        bizId={bizId}
        subaccountId={subaccount.id}
        teamMembers={teamMembers}
        primaryColor={primaryColor}
        actorName={currentUserName}
        onCreated={onRefresh}
        onShowToast={onShowToast}
      />

      <EventDetailModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        teamMembers={teamMembers}
        currentUserName={currentUserName}
        currentUserInitials={currentUserInitials}
        currentUserRole={currentUserRole}
        primaryColor={primaryColor}
        onRefresh={() => {
          onRefresh();
          if (selectedEvent) {
            const updated = getEventsForBiz(bizId).find(e => e.id === selectedEvent.id);
            if (updated) setSelectedEvent(updated);
          }
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
