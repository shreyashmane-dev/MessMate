import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface InfoPageProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function InfoPageLayout({ title, description, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-red-500 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{title}</h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">{description}</p>
          
          <div className="prose prose-slate max-w-none">
            {children || (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <p className="text-slate-500 font-medium">This page is currently being updated. Please check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
