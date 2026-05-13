"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, Users, Star, ArrowLeft, CheckCircle,
  Shield, Package, MessageCircle, UserCheck, UserX, Crown,
  LogOut, Send, Clock, Check, X,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import { JoinRequest, ChatMessage } from "@/types";

type Tab = "details" | "members" | "chat";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    trips,
    requestToJoinTrip, approveJoinTrip, rejectJoinTrip, removeFromTrip, sendTripMessage,
  } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [showAuth, setShowAuth] = useState(false);
  const [tab, setTab] = useState<Tab>("details");
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const trip = trips.find(t => t.id === id);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [trip?.chatMessages?.length, tab]);

  if (!trip) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Trip not found</h2>
      <Link href="/trips" className="text-teal-600 underline">Back to trips</Link>
    </div>
  );

  const isHost = user?.id === trip.hostId;
  const isApprovedMember = user ? trip.joinedUsers.includes(user.id) : false;
  const hasAccess = isHost || isApprovedMember;
  const full = trip.joinedUsers.length >= trip.totalSpots;
  const pendingRequests = (trip.pendingRequests ?? []).filter(r => r.status === "pending");
  const myRequest = user ? (trip.pendingRequests ?? []).find(r => r.userId === user.id) : null;

  const handleRequestJoin = () => {
    if (!user) { setShowAuth(true); return; }
    if (full) { showToast("Sorry, this trip is full!", "error"); return; }
    const req: JoinRequest = {
      id: `req_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    requestToJoinTrip(trip.id, req);
    showToast("Join request sent! Waiting for host approval. 🙌");
  };

  const handleLeave = () => {
    if (!user) return;
    removeFromTrip(trip.id, user.id);
    showToast("You've left the trip.", "info");
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
    sendTripMessage(trip.id, msg);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trips
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
              <div className="h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-9xl">
                {trip.photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={trip.photoUrl} alt={trip.title} className="w-full h-full object-cover" />
                  : <span>{trip.image}</span>
                }
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">{trip.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trip.difficulty === "Easy" ? "bg-green-100 text-green-700" : trip.difficulty === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{trip.difficulty}</span>
                  {trip.rating > 0 && <span className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {trip.rating}</span>}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {trip.from || trip.fromState ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {trip.from || trip.fromState}
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      <MapPin className="w-4 h-4 text-teal-500" />
                      {trip.destination}, {trip.state}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-teal-500" /> {trip.destination}, {trip.state}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-teal-500" /> {trip.startDate} → {trip.endDate}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-500" /> Hosted by {trip.hostName}</span>
                </div>
              </div>

              {trip.description && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">About This Trip</h2>
                  <p className="text-gray-600 leading-relaxed">{trip.description}</p>
                </div>
              )}

              {trip.whatToBring && (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-600" /> What to Bring
                  </h2>
                  <p className="text-gray-600">{trip.whatToBring}</p>
                </div>
              )}

              <div className="bg-gray-900 text-white rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-teal-500" /> Safety & Trust</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Join request approved by host", "Group chat for approved members only", "Host can remove members", "SOS button available in-app", "Host rated by past travelers", "Expense splitting included"].map(s => (
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
              {/* Pending requests — host only */}
              {isHost && pendingRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Pending Requests ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg font-bold text-amber-600">
                            {req.userAvatar.startsWith("http") || req.userAvatar.length > 2
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={req.userAvatar} alt={req.userName} className="w-9 h-9 rounded-full object-cover" />
                              : req.userAvatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{req.userName}</p>
                            <p className="text-xs text-gray-400">{formatDate(req.requestedAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { approveJoinTrip(trip.id, req.userId); showToast(`${req.userName} approved! 🎉`); }}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => { rejectJoinTrip(trip.id, req.userId); showToast(`Request rejected.`, "info"); }}
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

              {/* Approved members */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" /> Group Members ({trip.joinedUsers.length}/{trip.totalSpots})
                </h3>
                {trip.joinedUsers.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No approved members yet.</p>
                )}
                <div className="space-y-2">
                  {trip.joinedUsers.map(uid => {
                    const isHostUser = uid === trip.hostId;
                    const req = (trip.pendingRequests ?? []).find(r => r.userId === uid && r.status === "approved");
                    const name = req?.userName ?? (isHostUser ? trip.hostName : `Member`);
                    const avatar = req?.userAvatar ?? "🧑";
                    return (
                      <div key={uid} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg">
                            {avatar.length <= 2 ? avatar : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{name}</p>
                            {isHostUser && (
                              <span className="text-xs text-teal-600 font-bold flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Host
                              </span>
                            )}
                          </div>
                        </div>
                        {isHost && !isHostUser && (
                          <button onClick={() => { removeFromTrip(trip.id, uid); showToast(`${name} removed from the group.`, "info"); }}
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
                  <p className="text-gray-400 text-sm">Only approved members can see and use the group chat. Request to join to get access.</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl px-4 py-4 space-y-3 mb-3">
                    {(trip.chatMessages ?? []).length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center gap-2">
                        <MessageCircle className="w-8 h-8 opacity-40" />
                        <p>No messages yet. Say hi to the group! 👋</p>
                      </div>
                    )}
                    {(trip.chatMessages ?? []).map(msg => {
                      const isMe = msg.userId === user?.id;
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-sm shrink-0 mb-0.5">
                            {msg.userAvatar.length <= 2 ? msg.userAvatar : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={msg.userAvatar} alt={msg.userName} className="w-7 h-7 rounded-full object-cover" />
                            )}
                          </div>
                          <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                            {!isMe && <p className="text-xs text-gray-400 mb-0.5 ml-1">{msg.userName}</p>}
                            <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-teal-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"}`}>
                              {msg.text}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 mx-1">{formatTime(msg.sentAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-400">
                    <MessageCircle className="w-3 h-3" /> Text only · No photos or videos in group chat
                  </div>
                  <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                    className="flex gap-2 items-center">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      placeholder="Message the group..."
                      className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    <button type="submit" disabled={!chatInput.trim()}
                      className="w-10 h-10 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
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
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{trip.budget}</div>
            <p className="text-gray-400 text-sm mb-5">per person</p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Spots Available</span><span className="font-semibold text-gray-900">{trip.totalSpots - trip.joinedUsers.length}/{trip.totalSpots}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="font-semibold text-gray-900">{trip.difficulty}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold text-gray-900">{trip.type}</span></div>
              {trip.genderPreference && trip.genderPreference !== "Everyone" && (
                <div className="flex justify-between"><span className="text-gray-500">Open to</span><span className="font-semibold text-gray-900">{trip.genderPreference}</span></div>
              )}
              {trip.genderPreference === "Everyone" && (
                <div className="flex justify-between"><span className="text-gray-500">Open to</span><span className="font-semibold text-green-700">Everyone</span></div>
              )}
              {trip.ageGroups && trip.ageGroups.length > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">Age Group</span><span className="font-semibold text-gray-900">{trip.ageGroups.join(", ")}</span></div>
              )}
              {(!trip.ageGroups || trip.ageGroups.length === 0) && (
                <div className="flex justify-between"><span className="text-gray-500">Age Group</span><span className="font-semibold text-green-700">All ages</span></div>
              )}
            </div>

            <div className="mb-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{trip.joinedUsers.length} joined</span>
                <span>{full ? "FULL" : `${trip.totalSpots - trip.joinedUsers.length} left`}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${(trip.joinedUsers.length / trip.totalSpots) * 100}%` }} />
              </div>
            </div>

            {isHost && (
              <div className="text-center text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl py-3 flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" /> You are the host
              </div>
            )}

            {!isHost && isApprovedMember && (
              <div className="space-y-2">
                <div className="text-center text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl py-2.5 flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" /> You&apos;re in this group
                </div>
                <button onClick={() => setTab("chat")}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> Open Group Chat
                </button>
                <button onClick={handleLeave}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2 rounded-xl text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Leave Group
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
                className={`w-full font-bold py-3 rounded-xl transition-colors text-sm ${full ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                {full ? "Trip is Full" : "Request to Join →"}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">Host approves all requests</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Members ({trip.joinedUsers.length}/{trip.totalSpots})</h3>
            <div className="flex flex-wrap gap-2">
              {trip.joinedUsers.map((uid, i) => {
                const req = (trip.pendingRequests ?? []).find(r => r.userId === uid);
                const av = req?.userAvatar ?? ["🧕","👨","👩","🧔","👱‍♀️"][i % 5];
                return (
                  <div key={uid} className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg overflow-hidden" title={req?.userName}>
                    {av.length <= 2 ? av : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av} alt="" className="w-9 h-9 object-cover" />
                    )}
                  </div>
                );
              })}
              {trip.joinedUsers.length < trip.totalSpots && (
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
