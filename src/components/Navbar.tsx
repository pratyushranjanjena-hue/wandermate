"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Menu, X, LogOut, User, ChevronDown, Tent, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import AuthModal from "./AuthModal";
import OnboardingModal from "./OnboardingModal";
import { UserAvatar } from "./AvatarPicker";
import MaybeLogo from "./MaybeLogo";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/community", label: "Stories" },
  { href: "/match", label: "⚡ Match" },
  { href: "/destinations", label: "Explore" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showActivitiesMenu, setShowActivitiesMenu] = useState(false);
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);
  const activitiesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout } = useAuth();
  const { trips, events } = useData();

  const pendingRequestCount = user
    ? trips.filter(t => t.hostId === user.id).reduce((acc, t) => acc + (t.pendingRequests ?? []).filter(r => r.status === "pending").length, 0)
    + events.filter(e => e.hostId === user.id).reduce((acc, e) => acc + (e.pendingRequests ?? []).filter(r => r.status === "pending").length, 0)
    : 0;

  const openLogin = () => { setAuthTab("login"); setShowAuth(true); setOpen(false); };
  const openSignup = () => { setAuthTab("signup"); setShowAuth(true); setOpen(false); };

  const handleActivitiesEnter = () => {
    if (activitiesTimeoutRef.current) clearTimeout(activitiesTimeoutRef.current);
    setShowActivitiesMenu(true);
  };
  const handleActivitiesLeave = () => {
    activitiesTimeoutRef.current = setTimeout(() => setShowActivitiesMenu(false), 150);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <MaybeLogo size={36} nameSize="md" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {/* Feed */}
              <Link href="/feed"
                className="text-gray-600 hover:text-teal-600 font-medium transition-colors text-sm">
                Feed
              </Link>

              {/* Activities & Events — hover dropdown */}
              <div
                className="relative"
                onMouseEnter={handleActivitiesEnter}
                onMouseLeave={handleActivitiesLeave}
              >
                <button className="flex items-center gap-1 text-gray-600 hover:text-teal-600 font-medium transition-colors text-sm">
                  Activities
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showActivitiesMenu ? "rotate-180" : ""}`} />
                </button>

                {showActivitiesMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50">
                    {/* little arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3 px-1">What would you like to do?</p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Activities card */}
                      <Link href="/trips" onClick={() => setShowActivitiesMenu(false)}
                        className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-100 hover:border-teal-300 hover:bg-teal-50 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center transition-colors">
                          <Tent className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-teal-700 transition-colors">Activities</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Multi-day trips — camping, trekking, road trips, bike rides. Plan ahead, higher commitment.
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-teal-600 group-hover:underline">Browse trips →</p>
                      </Link>

                      {/* Events card */}
                      <Link href="/events" onClick={() => setShowActivitiesMenu(false)}
                        className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                          <CalendarDays className="w-5 h-5 text-purple-700" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-purple-700 transition-colors">Events</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Casual, short hangouts — food walks, meetups, yoga, cycling. Low commitment, often free.
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-purple-600 group-hover:underline">Browse events →</p>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.slice(1).map((link) => (
                <Link key={link.href} href={link.href}
                  className="text-gray-600 hover:text-teal-600 font-medium transition-colors text-sm">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)}
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-300 transition-colors">
                    <UserAvatar avatar={user.avatar} size="sm" className="!w-7 !h-7 !text-base" />
                    <span className="text-sm font-semibold text-gray-800">{user.name.split(" ")[0]}</span>
                    {pendingRequestCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {pendingRequestCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                      <Link href="/profile" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link href="/match" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                        <span className="w-4 h-4 text-center text-xs">⚡</span> Find My Tribe
                      </Link>
                      <button onClick={() => { setShowDropdown(false); setShowOnboarding(true); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                        <span className="w-4 h-4 text-center text-xs">🎯</span> Travel Quiz
                      </button>
                      <Link href="/trips/new" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                        <Tent className="w-4 h-4" /> Host an Activity
                      </Link>
                      <Link href="/events/new" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                        <CalendarDays className="w-4 h-4" /> Create an Event
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => { logout(); setShowDropdown(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={openLogin} className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors">
                    Sign In
                  </button>
                  <button onClick={openSignup}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                    Join Free
                  </button>
                </>
              )}
              {user && (
                <div className="flex items-center gap-2">
                  <Link href="/trips/new"
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                    + Host Activity
                  </Link>
                  <Link href="/events/new"
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                    + Event
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
            <Link href="/feed" onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 hover:text-teal-600 font-medium">Feed</Link>

            {/* Mobile Activities accordion */}
            <div>
              <button
                onClick={() => setMobileActivitiesOpen(o => !o)}
                className="flex items-center justify-between w-full py-2 text-gray-700 font-medium">
                <span>Activities</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileActivitiesOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileActivitiesOpen && (
                <div className="ml-3 mb-1 space-y-1 border-l-2 border-teal-100 pl-3">
                  <Link href="/trips" onClick={() => setOpen(false)}
                    className="flex items-start gap-2 py-2">
                    <Tent className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Activities</p>
                      <p className="text-xs text-gray-500">Multi-day trips — camping, trekking, road trips</p>
                    </div>
                  </Link>
                  <Link href="/events" onClick={() => setOpen(false)}
                    className="flex items-start gap-2 py-2">
                    <CalendarDays className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Events</p>
                      <p className="text-xs text-gray-500">Casual hangouts — food walks, meetups, yoga</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/community" onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 hover:text-teal-600 font-medium">Stories</Link>
            <Link href="/match" onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 hover:text-teal-600 font-medium">⚡ Match</Link>
            <Link href="/destinations" onClick={() => setOpen(false)}
              className="block py-2 text-gray-700 hover:text-teal-600 font-medium">Explore</Link>

            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="block py-2 text-gray-700 font-medium">{user.avatar} {user.name}</Link>
                <Link href="/trips/new" onClick={() => setOpen(false)} className="block py-2 text-teal-600 font-semibold">+ Host an Activity</Link>
                <Link href="/events/new" onClick={() => setOpen(false)} className="block py-2 text-purple-600 font-semibold">+ Create an Event</Link>
                <button onClick={() => { logout(); setOpen(false); }} className="block py-2 text-red-500 font-medium w-full text-left">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={openLogin} className="block py-2 text-gray-700 font-medium w-full text-left">Sign In</button>
                <button onClick={openSignup} className="block mt-2 bg-teal-600 text-white text-center py-2 rounded-full font-semibold w-full">Join Free</button>
              </>
            )}
          </div>
        )}
      </nav>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          defaultTab={authTab}
          onSignupSuccess={() => setShowOnboarding(true)}
        />
      )}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </>
  );
}
