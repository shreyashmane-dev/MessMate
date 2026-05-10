"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star, ShieldCheck, Utensils, Search } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { collection, query, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

export default function Home() {
  const [featuredMesses, setFeaturedMesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "messes"), orderBy("createdAt", "desc"), limit(3));
        const snapshot = await getDocs(q);
        const messesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedMesses(messesData);
      } catch (error) {
        console.error("Error fetching featured messes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative" ref={containerRef}>
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
        {/* Simplified Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
          
          {/* Floating Geometric Elements - Static on mobile for speed */}
          <div className="absolute top-20 right-[15%] hidden lg:block opacity-40">
            <div className="w-24 h-24 bg-gradient-to-tr from-red-500/20 to-orange-400/20 rounded-3xl rotate-12" />
          </div>
          <div className="absolute bottom-20 left-[10%] hidden lg:block opacity-40">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-400/20 to-red-600/20 rounded-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 font-medium text-sm mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Smart Mess Finder Platform
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Find your perfect <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
                  daily meal
                </span> today.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                Discover hygienic, affordable, and student-friendly mess services around your college. Real reviews, live menus, and exact map locations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/explore" 
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-red-500/20"
                >
                  <Search className="w-5 h-5" /> Explore Messes
                </Link>
                <Link 
                  href="/dashboard/messes/new" 
                  className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-colors"
                >
                  List your Mess
                </Link>
              </div>

              {/* Stats / Trust Badges */}
              <div className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">500+</p>
                  <p className="text-sm font-medium text-slate-500">Active Students</p>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">50+</p>
                  <p className="text-sm font-medium text-slate-500">Verified Messes</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Visuals (Overlapping Images & UI Elements) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              {/* Main Image */}
              <div className="absolute top-0 right-0 w-[80%] h-[90%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white z-10 transform hover:-translate-y-2 transition-transform duration-500">
                <img 
                  src="/hero-image.png" 
                  alt="Authentic Indian Thali" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Review Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-0 bg-white p-4 rounded-2xl shadow-xl z-20 border border-slate-100 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">"Best mess ever!"</p>
                <p className="text-xs text-slate-500">Highly hygienic and tasty food.</p>
              </motion.div>

              {/* Floating Location Card */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 left-10 bg-white p-4 rounded-2xl shadow-xl z-20 border border-slate-100 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Nearby Messes</p>
                  <p className="text-xs text-slate-500">12 options near you</p>
                </div>
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to find the food you deserve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Search & Filter</h3>
              <p className="text-slate-600 leading-relaxed">Use our interactive map and powerful filters to find a mess that fits your budget and dietary preferences.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Verify Quality</h3>
              <p className="text-slate-600 leading-relaxed">Read authentic reviews from other students and check actual photos of the dining area and meals.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Utensils className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Subscribe & Eat</h3>
              <p className="text-slate-600 leading-relaxed">Contact the owner directly via WhatsApp or Phone to book your daily meals or monthly subscription.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MESSES (LIVE DATA) */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Top Rated Messes</h2>
              <p className="text-slate-600">The most loved places by students around you.</p>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-50 h-96 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredMesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredMesses.map((mess, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={mess.id}
                >
                  <Link href={`/mess/${mess.id}`} className="group block bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      {mess.images?.[0] ? (
                        <img 
                          src={optimizeCloudinaryUrl(mess.images[0])} 
                          alt={mess.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <Utensils className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 font-bold px-4 py-2 rounded-full shadow-lg">
                        ₹{mess.monthlyPrice} <span className="text-xs font-normal text-slate-500">/mo</span>
                      </div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        {mess.type}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-500 transition-colors line-clamp-1">{mess.name}</h3>
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-slate-900">{mess.rating || "New"}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{mess.address}</p>
                      
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-600 border-t border-slate-100 pt-4 mt-2">
                        <span>{mess.gender}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1 text-red-500 group-hover:text-red-600">
                          View details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-slate-500 text-lg">No featured messes available yet.</p>
              <Link href="/dashboard/messes/new" className="text-red-500 font-bold mt-2 inline-block">Be the first to list yours!</Link>
            </div>
          )}
          
          <div className="mt-12 text-center sm:hidden">
            <Link href="/explore" className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-red-500 transition-colors bg-white border-2 border-slate-200 px-6 py-3 rounded-full">
              View all messes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA SECTION */}
      <section className="py-24 bg-red-500 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Are you a mess owner?</h2>
          <p className="text-red-100 text-xl mb-10 max-w-2xl mx-auto">
            Join MessMate to list your mess, manage your daily menus, and reach thousands of students searching for hygienic food.
          </p>
          <Link 
            href="/signup?role=owner" 
            className="inline-block bg-white text-red-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-transform hover:scale-105 shadow-xl"
          >
            Create Owner Account
          </Link>
        </div>
      </section>
    </div>
  );
}
