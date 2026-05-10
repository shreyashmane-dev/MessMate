"use client";

import Link from "next/link";
import { Utensils, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function Navbar() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
            <Utensils className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MessMate</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/explore" className="hover:text-red-500 transition-colors">Explore</Link>
          <Link href="/#how-it-works" className="hover:text-red-500 transition-colors">How it works</Link>
          {(!mounted || !user) && (
            <Link href="/for-owners" className="hover:text-red-500 transition-colors">For Owners</Link>
          )}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {mounted && user ? (
            <Link href="/dashboard" className="text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-full transition-colors border border-red-100">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors px-4 py-2">Log in</Link>
              <Link href="/signup" className="text-sm font-medium bg-red-500 text-white px-5 py-2.5 rounded-full hover:bg-red-600 transition-colors">Sign up</Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-6 flex flex-col gap-4 shadow-lg absolute w-full">
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 hover:text-red-500">Explore</Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 hover:text-red-500">How it works</Link>
          <div className="w-full h-px bg-slate-100 my-2"></div>
          {mounted && user ? (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-center text-lg font-medium bg-red-50 text-red-600 py-3 rounded-xl border border-red-100">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-lg font-medium border border-slate-200 py-3 rounded-xl">Log in</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center text-lg font-medium bg-red-500 text-white py-3 rounded-xl">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
