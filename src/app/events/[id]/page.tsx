"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Calendar, Users, Ticket, ArrowLeft, CheckCircle,
  Shield, MessageCircle, UserCheck, UserX, Crown,
  LogOut, Send, Clock, Check, X,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import { JoinRequest, ChatMessage } from "@/types";

type Tab = "details" | "members" | "chat";

const TYPE_PHOTOS: Record<string, string> = {
  "Camping": "photo-1504280390367-361c6d9f38f4",
  "Trekking": "photo-1551632811-561732d1e306",
  "Travel": "photo-1476514525535-07fb3b4ae5f1",
  "Food Walk": "photo-1567337710282-00832b415979",
  "Sports & Games": "photo-1592656094267-764a45160876",
  "Social Meetup": "photo-1511632765486-a01980e01a18",
  "Content Creation": "photo-1492691527719-9d1e07e534b4",
  "Bike Ride": "photo-1558618666-fcd25c85cd64",
  "Cycling": "photo-1571068316344-75bc76f77890",
  "Yoga & Wellness": "photo-1506126613408-eca07ce68773",
  "Music & Culture": "photo-1493225457124-a3eb161ffa5f",
  "Photography": "photo-1452587925148-ce544e77e70d",
  "Backpacking": "photo-1501554728187-ce583db33af7",
  "Road Trip": "photo-1469854523086-cc02fe5d8800",
};

function getPhoto(type: string) {
  const id = TYPE_PHOTOS[type] ?? "photo-1511632765486-a01980e01a18";
  return `https://images.unsplash.com/${id}?w=800&h=400&fit=crop&auto=format&q=80`;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    events,
    requestToJoinEvent, approveJoinEvent, rejectJoinEvent, removeFromEvent, sendEventMessage,
  } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [showAuth, setShowAuth] = useState(false);
  const [tab, setTab] = useState<Tab>("details");
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const event = events.find(e => e.id === id);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [event?.chatMessages?.length, tab]);

  if (!event) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Event not found</h2>
      <Link href="/events" className="text-purple-600 underline">Back to events</Link>
    </div>
  );

  const isHost = user?.id === event.hostId;
  const isApprovedMember = user ? event.attendees.includes(user.id) : false;
  const hasAccess = isHost || isApprovedMember;
  const full = event.attendees.length >= event.maxAttendees;
  const pendingRequests = (event.pendingRequests ?? []).filter(r => r.status === "pending");
  const myRequest = user ? (event.pendingRequests ?? []).find(r => r.userId === user.id) : null;

  const handleRequestJoin = () => {
    if (!user) { setShowAuth(true); return; }
    if (full) { showToast("Sorry, this event is full!", "error"); return; }
    const req: JoinRequest = {
      id: `req_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    requestToJoinEvent(event.id, req);
    showToast("Join request sent! Waiting for host approval. 🙌");
  };

  const handleLeave = () => {
    if (!user) return;
    removeFromEvent(event.id, user.id);
    showToast("You've left the event.", "info");
    setTab("details");
  };

  const handleSendMessage = () => {
    if (!user || !chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: chatInput.trim(),
      sentAt: new Date().toISOString(),
    };
    sendEventMessage(event.id, msg);
    setChatInput("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const pendingCount = isHost ? pendingRequests.length : 0;
  const fillPct = (event.attendees.length / event.maxAttendees) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit">
        {(["details", "members", "chat"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "details" && "Details"}
            {t === "members" && (
              <>Members
                {pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">{pendingCount}</span>
                )}
              </>
            )}
            {t === "chat" && "Group Chat"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main content ── */}
        <div className="lg:col-span-2">

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (
            <div className="space-y-6">
              <div className="h-64 rounded-2xl overflow-hidden">
                {event.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.photoUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Image src={getPhoto(event.type)} alt={event.title} width={800} height={400} className="w-full h-full object-cover" unoptimized />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{event.type}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${event.price === "Free" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{event.price}</span>
                  {event.badge && (
                    <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{event.badge}</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-500" /> {event.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-500" /> {event.location}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-purple-500" /> Hosted by {event.host}</span>
                  <span className="flex items-center gap-1.5"><Ticket className="w-4 h-4 text-purple-500" /> {event.price}</span>
                </div>
              </div>

              {event.description && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="bg-gray-900 text-white rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /> Safety & Trust</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Join request approved by host", "Group chat for approved members only", "Host can remove members", "Real user profiles", "Host rated by past attendees", "Transparent attendee list"].map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MEMBERS TAB ── */}
          {tab === "members" && (
            <div className="space-y-6">
              {isHost && pendingRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Pending Requests ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg overflow-hidden">
                            {req.userAvatar.length <= 2 ? req.userAvatar : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={req.userAvatar} alt={req.userName} className="w-9 h-9 rounded-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{req.userName}</p>
                            <p className="text-xs text-gray-400">{formatDate(req.requestedAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { approveJoinEvent(event.id, req.userId); showToast(`${req.userName} approved! 🎉`); }}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => { rejectJoinEvent(event.id, req.userId); showToast(`Request rejected.`, "info"); }}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isHost && pendingRequests.length === 0 && (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 text-center text-gray-400 text-sm">
                  No pending join requests right now.
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> Attendees ({event.attendees.length}/{event.maxAttendees})
                </h3>
                {event.attendees.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No approved attendees yet.</p>
                )}
                <div className="space-y-2">
                  {event.attendees.map((uid, i) => {
                    const isHostUser = uid === event.hostId;
                    const req = (event.pendingRequests ?? []).find(r => r.userId === uid && r.status === "approved");
                    const name = req?.userName ?? (isHostUser ? event.host : `Attendee ${i + 1}`);
                    const avatar = req?.userAvatar ?? "🧑";
                    return (
                      <div key={uid} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg overflow-hidden">
                            {avatar.length <= 2 ? avatar : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            {isHostUser && (
                              <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Host
                              </span>
                            )}
                          </div>
                        </div>
                        {isHost && !isHostUser && (
                          <button onClick={() => { removeFromEvent(event.id, uid); showToast(`${name} removed.`, "info"); }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            <UserX className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                        {!isHost && uid === user?.id && (
                          <button onClick={handleLeave}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Leave
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── CHAT TAB ── */}
          {tab === "chat" && (
            <div className="flex flex-col" style={{ height: "500px" }}>
              {!hasAccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Members-only chat</h3>
                  <p className="text-gray-400 text-sm">Only approved attendees can see and use the group chat. Request to join to get access.</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl px-4 py-4 space-y-3 mb-3">
                    {(event.chatMessages ?? []).length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center gap-2">
                        <MessageCircle className="w-8 h-8 opacity-40" />
                        <p>No messages yet. Say hi to the group! 👋</p>
                      </div>
                    )}
                    {(event.chatMessages ?? []).map(msg => {
                      const isMe = msg.userId === user?.id;
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-sm shrink-0 mb-0.5 overflow-hidden">
                            {msg.userAvatar.length <= 2 ? msg.userAvatar : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={msg.userAvatar} alt={msg.userName} className="w-7 h-7 rounded-full object-cover" />
                            )}
                          </div>
                          <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                            {!isMe && <p className="text-xs text-gray-400 mb-0.5 ml-1">{msg.userName}</p>}
                            <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-purple-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"}`}>
                              {msg.text}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 mx-1">{formatTime(msg.sentAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                    className="flex gap-2 items-center">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      placeholder="Message the group..."
                      className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    <button type="submit" disabled={!chatInput.trim()}
                      className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
            <div className="text-2xl font-extrabold text-gray-900 mb-1">{event.price}</div>
            <p className="text-gray-400 text-sm mb-5">per person</p>

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-900">{event.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-semibold text-gray-900 text-right max-w-[60%]">{event.location}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold text-gray-900">{event.type}</span></div>
            </div>

            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{event.attendees.length} going</span>
                <span className={full ? "text-red-500 font-semibold" : "text-purple-600 font-semibold"}>{full ? "Full" : `${event.maxAttendees - event.attendees.length} spots left`}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${fillPct >= 70 ? "bg-orange-400" : "bg-purple-500"}`} style={{ width: `${fillPct}%` }} />
              </div>
            </div>

            {isHost && (
              <div className="text-center text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl py-3 flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" /> You are the host
              </div>
            )}

            {!isHost && isApprovedMember && (
              <div className="space-y-2">
                <div className="text-center text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl py-2.5 flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" /> You&apos;re attending
                </div>
                <button onClick={() => setTab("chat")}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Open Group Chat
                </button>
                <button onClick={handleLeave}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2 rounded-xl text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Leave Event
                </button>
              </div>
            )}

            {!isHost && !isApprovedMember && myRequest?.status === "pending" && (
              <div className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl py-3 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Request pending — awaiting host approval
              </div>
            )}

            {!isHost && !isApprovedMember && myRequest?.status === "rejected" && (
              <div className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl py-3">
                Your request was not approved.
              </div>
            )}

            {!isHost && !isApprovedMember && !myRequest && (
              <button onClick={handleRequestJoin} disabled={full}
                className={`w-full font-bold py-3 rounded-xl transition-colors text-sm ${full ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                {full ? "Event is Full" : "Request to Join →"}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">Host approves all requests</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Attendees ({event.attendees.length}/{event.maxAttendees})</h3>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((uid, i) => {
                const req = (event.pendingRequests ?? []).find(r => r.userId === uid);
                const av = req?.userAvatar ?? ["🧕","👨","👩","🧔","👱‍♀️"][i % 5];
                return (
                  <div key={uid} className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg overflow-hidden" title={req?.userName}>
                    {av.length <= 2 ? av : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av} alt="" className="w-9 h-9 object-cover" />
                    )}
                  </div>
                );
              })}
              {event.attendees.length < event.maxAttendees && (
                <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">+</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
