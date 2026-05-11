"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
}

const WELCOME_MSG: Message = {
  id: "welcome",
  from: "bot",
  text: "Hi! 👋 I'm mayBE Guide — your mayBE assistant.\n\nAsk me anything about activities, hosting, matching, safety, or how mayBE works!",
};

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in ms
const IDLE_WARNING = 9 * 60 * 1000;  // warn at 9 minutes

// ── Rule book ────────────────────────────────────────────────────────────────
const RULES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["hi", "hello", "hey", "namaste", "hlo", "hii"],
    reply: "Hey there! 👋 Welcome to mayBE — India's community for people who actually show up. What would you like to know?",
  },
  {
    keywords: ["what is maybe", "what is this", "about", "tell me more", "explain"],
    reply: "mayBE is India's activity community 🇮🇳\n\nWe connect real people who want to camp, trek, eat, play, create & explore — together. No more waiting for friends who cancel!\n\nYou can:\n• Find activities near you\n• Join a group going to the same place\n• Host your own trip or event\n• Match with people who share your vibe\n• Share your stories with the community",
  },
  {
    keywords: ["free", "cost", "price", "charge", "pay", "subscription", "fee"],
    reply: "mayBE is completely FREE to join! 🎉\n\nNo subscription, no hidden charges, no paywall.\n\nSome activities hosted by other users may have a participation cost (like ₹800 for a food walk or ₹4,500 for a camping trip) — but those are set by the host, not by us.\n\nCreating an account, browsing, and joining is always free.",
  },
  {
    keywords: ["how to join", "how do i join", "join trip", "join activity", "sign up", "register", "create account"],
    reply: "Joining is super easy! 🙌\n\n1. Click 'Join Free' in the top right corner\n2. Enter your name, email, city & password\n3. Take a quick travel quiz (2 mins)\n4. Browse activities and hit 'Join'\n\nThat's it — you're in!",
  },
  {
    keywords: ["host", "create trip", "create activity", "organize", "plan a trip", "how to host"],
    reply: "Hosting on mayBE takes 3 steps! 🏕️\n\n1. Click 'Host an Activity' from the nav\n2. Fill in details: activity type, dates, location, budget, group size\n3. Set your preferences (who can join, age groups)\n4. Hit Publish!\n\nOther users can then find and join your activity.",
  },
  {
    keywords: ["match", "matching", "find people", "compatible", "who to travel with", "travel buddy"],
    reply: "Our ⚡ Match feature uses a smart scoring engine!\n\nIt compares your:\n• Budget range\n• Travel pace (relaxed vs packed)\n• Travel types (mountains, beaches, food etc.)\n• Diet preferences\n• Languages spoken\n• Skill tags (trekker, photographer, rider...)\n\nYou get a % compatibility score with every other user. Higher % = better match! Complete your profile quiz to get the best results.",
  },
  {
    keywords: ["safe", "safety", "trust", "verified", "secure", "women", "solo female"],
    reply: "Safety is important to us! 🛡️\n\nHere's how we keep things safe:\n• Gender preference filters on every activity\n• Age group filters\n• Real user profiles\n• Host ratings from past travelers\n• You can see who's joining before you say yes\n\nFor solo female travelers — use the 'Females Only' filter to find women-only activities.",
  },
  {
    keywords: ["activities", "what activities", "types", "camping", "trekking", "food", "sports", "yoga", "cycling", "bike", "content"],
    reply: "mayBE covers a wide range of activities! 🎯\n\n⛺ Camping\n🥾 Trekking\n🍜 Food Walks & Food Exploring\n🏐 Sports & Games\n🤝 Social Meetups\n🎬 Content Creation\n🏍️ Bike Rides\n🚗 Road Trips\n🚴 Cycling\n🧘 Yoga & Wellness\n🎒 Backpacking\n🏛️ Heritage Walks\n✈️ Travel\n\nAll across India!",
  },
  {
    keywords: ["destination", "where", "places", "india", "states", "cities", "location"],
    reply: "mayBE covers activities across all of India! 🗺️\n\nSome popular destinations:\n🏔️ Ladakh & Spiti Valley\n🌿 Coorg & Kerala\n❄️ Manali & Himachal\n🏖️ Goa & Konkan\n🏛️ Hampi & Rajasthan\n🌊 Rishikesh & Uttarakhand\n🏜️ Jaisalmer\n\nCheck the Explore page for detailed destination guides!",
  },
  {
    keywords: ["post", "story", "blog", "photo", "video", "share", "write"],
    reply: "You can share your experiences on mayBE! 📸\n\nGo to the Stories section and click 'Write a Story'\n\nYou can post:\n• 📝 Blogs — full travel writeups\n• 📷 Photos — with captions\n• 🎬 Videos — travel reels & vlogs\n\nOther community members can like, comment, and follow you.",
  },
  {
    keywords: ["feed", "following", "followers", "social"],
    reply: "The Feed is your personal activity stream! 📱\n\n• Discover tab: See all community posts\n• Following tab: See posts only from people you follow\n\nFollow interesting travelers from the Match page or community to build your personalized feed.",
  },
  {
    keywords: ["contact", "reach", "email", "phone", "support", "help", "talk to", "human"],
    reply: "You can reach us directly! 📬\n\n📧 Email: pratyushjena1994@gmail.com\n📞 Phone: +91 95459 97906\n\nWe're available Mon–Sat, 10am–7pm IST.\n\nFor quick questions, just keep chatting here — I'm happy to help! 😊",
  },
  {
    keywords: ["event", "meetup", "upcoming", "when"],
    reply: "Check the Events page for all upcoming meetups! 📅\n\nEvents are shorter, more casual activities — like:\n• Weekend food walks\n• Social board game brunches\n• Day hikes\n• Cycling rides\n• Yoga sessions\n\nMany are FREE to attend. You can also host your own event!",
  },
  {
    keywords: ["profile", "edit profile", "avatar", "bio", "my account"],
    reply: "Your profile is your mayBE identity! 👤\n\nFrom the Profile page you can:\n• Upload a photo or pick an emoji avatar\n• Edit your name, city & bio\n• Add your Instagram / website\n• See your posts, trips & events\n• Check your followers & following\n\nComplete your travel quiz from the Match page for even better connections!",
  },
  {
    keywords: ["delete", "remove", "cancel", "leave trip", "unregister"],
    reply: "No problem! You can:\n\n• Leave a trip → open the trip and click 'Joined — Click to Leave'\n• Cancel event registration → open the event and click 'Registered — Click to Cancel'\n• Delete a post → click the trash icon on your own post\n\nEverything is reversible — you can rejoin anytime if spots are still available.",
  },
  {
    keywords: ["age", "age group", "who can join", "gender", "filter"],
    reply: "Every activity on mayBE has preferences set by the host:\n\n👫 Gender preference:\nEveryone / Males Only / Females Only / Couples / Mixed Groups\n\n🎂 Age groups:\n18–24 / 25–30 / 31–40 / 41–50 / 50+\n\nUse the filters on the Activities page to find exactly the right group for you!",
  },
  {
    keywords: ["app", "mobile", "android", "ios", "download", "play store", "app store"],
    reply: "mayBE is currently a web app — works great on mobile browsers! 📱\n\nJust open maybe-orpin.vercel.app in your phone's browser.\n\nA dedicated mobile app (Android & iOS) is on our roadmap. Stay tuned! 🚀",
  },
  {
    keywords: ["thank", "thanks", "awesome", "great", "nice", "cool", "good", "perfect"],
    reply: "You're welcome! 😊 Happy exploring!\n\nIf you have any more questions, I'm right here. And don't forget — the best adventures start with just saying yes. 🏕️✨",
  },
  {
    keywords: ["bye", "goodbye", "see you", "later", "ok bye", "ciao"],
    reply: "Goodbye! 👋 Come back whenever you're ready to explore.\n\nRemember: life's too short to wait for friends who say 'maybe'. Find your tribe on mayBE! 🌍",
  },
];

const FALLBACK = "Hmm, I'm not sure about that one! 🤔\n\nYou can reach us directly:\n📧 pratyushjena1994@gmail.com\n📞 +91 95459 97906\n\nOr try asking me about:\n• Activities & events\n• How to join or host\n• Safety & matching\n• Pricing & features";

const QUICK_QUESTIONS = [
  "Is mayBE free?",
  "How do I join a trip?",
  "What activities are there?",
  "How does matching work?",
  "How to contact support?",
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.reply;
  }
  return FALLBACK;
}

const FRESH_MESSAGES = (): Message[] => [WELCOME_MSG];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(FRESH_MESSAGES());
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Reset conversation ─────────────────────────────────────────────────────
  const resetChat = useCallback(() => {
    setMessages(FRESH_MESSAGES());
    setInput("");
    setTyping(false);
    setIdleWarning(false);
  }, []);

  // ── Close chat (X button) — clears conversation ───────────────────────────
  const closeChat = useCallback(() => {
    setOpen(false);
    resetChat();
  }, [resetChat]);

  // ── Idle timer logic ───────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimers();
    setIdleWarning(false);
    if (!open) return;

    // Warn at 9 minutes
    warnTimerRef.current = setTimeout(() => {
      setIdleWarning(true);
    }, IDLE_WARNING);

    // Auto-close + reset at 10 minutes
    idleTimerRef.current = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `idle_${Date.now()}`,
          from: "bot",
          text: "👋 This chat has been closed due to inactivity. Come back anytime!\n\nStarting a fresh conversation...",
        },
      ]);
      setTimeout(() => {
        setOpen(false);
        resetChat();
      }, 2000);
    }, IDLE_TIMEOUT);
  }, [open, clearTimers, resetChat]);

  // Start/reset idle timer whenever the chat opens or user interacts
  useEffect(() => {
    if (open) {
      resetIdleTimer();
    } else {
      clearTimers();
      setIdleWarning(false);
    }
    return clearTimers;
  }, [open, resetIdleTimer, clearTimers]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // ── Send message ───────────────────────────────────────────────────────────
  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    resetIdleTimer(); // user is active
    const userMsg: Message = { id: `u_${Date.now()}`, from: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages(prev => [...prev, { id: `b_${Date.now()}`, from: "bot", text: reply }]);
      setTyping(false);
    }, 700);
  }, [resetIdleTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">mayBE Guide</p>
                <p className="text-teal-400 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
                  Always online
                </p>
              </div>
            </div>
            {/* X button — closes AND resets chat */}
            <button
              onClick={closeChat}
              title="Close and clear conversation"
              className="text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Idle warning banner */}
          {idleWarning && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0">
              <p className="text-amber-700 text-xs font-medium">⏱️ Still there? Chat closes in 1 min due to inactivity.</p>
              <button onClick={() => { resetIdleTimer(); send("I'm still here!"); }}
                className="text-xs font-bold text-amber-700 underline ml-2 shrink-0">
                I&apos;m here
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                )}
                {msg.from === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mb-1">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.from === "bot"
                    ? "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    : "bg-teal-600 text-white rounded-br-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions — only on first open */}
          {messages.length <= 1 && (
            <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 flex gap-1.5 flex-wrap shrink-0">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 px-2.5 py-1 rounded-full transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={() => resetIdleTimer()}
              placeholder="Ask me anything..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <button type="submit" disabled={!input.trim()}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
        style={{ background: "linear-gradient(135deg, #0d9488, #065f46)" }}
        aria-label="Chat with mayBE Guide">
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
}
