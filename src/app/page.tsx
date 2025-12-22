"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 w-full z-50 border-b glass-panel bg-background/80">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo - Shifted right on mobile to account for sidebar toggle */}
            <div className="text-xl font-bold tracking-tight">
              Darus <span className="text-primary">Almutun</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/schedule" className="hover:text-foreground transition-colors">Class Schedule</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <Link href={
                user.user_metadata?.role === 'admin' ? '/organization/dashboard' :
                  user.user_metadata?.role === 'teacher' ? '/teacher/dashboard' :
                    '/student/dashboard'
              }>
                <button className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <button className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium hover:bg-muted rounded-full transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="hidden sm:block px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-12 pb-16">
        <section className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center space-y-8 py-12 md:py-20 lg:py-32">
          <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs md:text-sm font-medium text-primary backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Now Live: Advanced Fiqh
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Preserving Wisdom for <br />
            <span className="text-gradient">Future Generations</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Darus Almutun is a premier digital archive dedicated to preserving classical texts and manuscripts. Explore our vast collection of knowledge.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto px-6">
            <Link href="/schedule" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl">
                View Class Schedule
              </button>
            </Link>
            <Link href="/auth" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-secondary text-secondary-foreground border rounded-full hover:bg-secondary/80 transition-all">
                Student Portal
              </button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
