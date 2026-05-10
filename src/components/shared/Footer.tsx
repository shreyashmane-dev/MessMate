import Link from "next/link";
import { Utensils } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center">
                <Utensils className="w-3 h-3 text-slate-900" />
              </div>
              <span className="font-bold text-lg text-slate-900">MessMate</span>
            </Link>
            <p className="text-slate-600 text-sm">
              The smartest way for students to find and manage their daily meals.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/explore" className="hover:text-red-500 transition-colors">Explore</Link></li>
              <li><Link href="/how-it-works" className="hover:text-red-500 transition-colors">How it works</Link></li>
              <li><Link href="/pricing" className="hover:text-red-500 transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-red-500 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-red-500 transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} MessMate. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
