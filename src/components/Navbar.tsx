"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Compass, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import OnboardingModal from "./OnboardingModal";
import { UserAvatar } from "./AvatarPicker";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/trips", label: "Find Trips" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/match", label: "⚡ Match" },
  { href: "/destinations", label: "Destinations" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, logout } = useAuth();

  const openLogin = () => { setAuthTab("login"); setShowAuth(true); setOpen(false); };
  const openSignup = () => { setAuthTab("signup"); setShowAuth(true); setOpen(false); };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-teal-600">
              <Compass className="w-6 h-6" />
              WanderMate
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-teal-300 transition-colors">
                    <UserAvatar avatar={user.avatar} size="sm" className="!w-7 !h-7 !text-base" />
                    <span className="text-sm font-semibold text-gray-800">{user.name.split(" ")[0]}</span>
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
                        <Compass className="w-4 h-4" /> Plan a Trip
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
                <Link href="/trips/new"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
                  + Plan a Trip
                </Link>
              )}
            </div>

            <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block py-2 text-gray-700 hover:text-teal-600 font-medium">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="block py-2 text-gray-700 font-medium">{user.avatar} {user.name}</Link>
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
