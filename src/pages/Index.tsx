import { useState, useEffect } from "react";
import { OnboardingQuiz, type UserLevel, type UserProfile } from "@/components/auth/OnboardingQuiz";
import { AppNav, type Page } from "@/components/layout/AppNav";
import { type CigarEntry, type CatalogCigar as Cigar } from "@/types/cigar";
import { Dashboard } from "@/components/features/Dashboard";
import { Humidor } from "@/components/features/Humidor";
import { Discover } from "@/components/features/Discover";
import { Journal, type JournalEntry } from "@/components/features/Journal";
import { Concierge } from "@/components/features/Concierge";
import { Pairing } from "@/components/features/Pairing";
import { PageTransition } from "@/components/layout/PageTransition";
import { AgeGate } from "@/components/auth/AgeGate";
import { AuthLanding } from "@/components/auth/AuthLanding";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  console.log("Vitola App: Index component mounting...");
  // ── State ──
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem("age-verified") === "true";
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<UserLevel | null>(() => {
    return (localStorage.getItem("user-level") as UserLevel) || null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("user-profile");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user-profile:", e);
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [cigars, setCigars] = useState<CigarEntry[]>(() => {
    try {
      const saved = localStorage.getItem("vitola-cigars");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse vitola-cigars:", e);
      return [];
    }
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem("vitola-journal");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse vitola-journal:", e);
      return [];
    }
  });

  // ── Persist data ──
  useEffect(() => {
    localStorage.setItem("vitola-cigars", JSON.stringify(cigars));
  }, [cigars]);

  useEffect(() => {
    localStorage.setItem("vitola-journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Handlers ──
  const handleAgeVerified = () => {
    localStorage.setItem("age-verified", "true");
    setIsAgeVerified(true);
  };

  const handleLevelComplete = (newLevel: UserLevel, newProfile: UserProfile) => {
    setLevel(newLevel);
    setProfile(newProfile);
    localStorage.setItem("user-level", newLevel);
    localStorage.setItem("user-profile", JSON.stringify(newProfile));
  };

  const addCigar = (cigar: CigarEntry) => setCigars((prev) => [cigar, ...prev]);
  const removeCigar = (id: string) => setCigars((prev) => prev.filter((c) => c.id !== id));
  const addJournalEntry = (entry: JournalEntry) => setJournalEntries((prev) => [entry, ...prev]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setLevel(null);
    setProfile(null);
    localStorage.removeItem("user-level");
    localStorage.removeItem("user-profile");
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Flow: Step 1 — Age Verification ──
  if (!isAgeVerified) {
    return <AgeGate onVerify={handleAgeVerified} />;
  }

  // ── Flow: Step 2 — Auth (Sign Up / Sign In) ──
  if (!session) {
    return <AuthLanding onAuth={() => { }} />;
  }

  // ── Flow: Step 3 — Onboarding Quiz (one-time) ──
  if (!level) {
    return <OnboardingQuiz onComplete={handleLevelComplete} />;
  }

  // ── Flow: Step 4 — Main App ──
  return (
    <div className="flex min-h-screen bg-background">
      <AppNav currentPage={currentPage} onNavigate={setCurrentPage} onSignOut={handleSignOut} />

      <main className="flex-1 md:overflow-y-auto pt-16 md:pt-0">
        <PageTransition pageKey={currentPage}>
          {currentPage === "dashboard" && (
            <Dashboard level={level!} profile={profile!} onNavigate={setCurrentPage} humidorCount={cigars.length} />
          )}
          {currentPage === "humidor" && (
            <Humidor cigars={cigars} onAdd={addCigar} onRemove={removeCigar} />
          )}
          {currentPage === "discover" && <Discover onAddToHumidor={addCigar} />}
          {currentPage === "journal" && (
            <Journal entries={journalEntries} cigars={cigars} onAdd={addJournalEntry} />
          )}
          {currentPage === "pairing" && <Pairing humidorCigars={cigars as unknown as Cigar[]} />}
          {currentPage === "concierge" && <Concierge level={level!} profile={profile!} />}
        </PageTransition>
      </main>
    </div>
  );
};

export default Index;
