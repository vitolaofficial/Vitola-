import { useState } from "react";
import { OnboardingQuiz, type UserLevel } from "@/components/OnboardingQuiz";
import { AppNav, type Page } from "@/components/AppNav";
import { Dashboard } from "@/components/Dashboard";
import { Humidor, type CigarEntry } from "@/components/Humidor";
import { Discover } from "@/components/Discover";
import { Journal, type JournalEntry } from "@/components/Journal";
import { Concierge } from "@/components/Concierge";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [cigars, setCigars] = useState<CigarEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  if (!level) {
    return <OnboardingQuiz onComplete={(l) => setLevel(l)} />;
  }

  const addCigar = (cigar: CigarEntry) => setCigars((prev) => [cigar, ...prev]);
  const removeCigar = (id: string) => setCigars((prev) => prev.filter((c) => c.id !== id));
  const addJournalEntry = (entry: JournalEntry) => setJournalEntries((prev) => [entry, ...prev]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppNav currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 md:overflow-y-auto pt-16 md:pt-0">
        <PageTransition pageKey={currentPage}>
          {currentPage === "dashboard" && (
            <Dashboard level={level} onNavigate={setCurrentPage} humidorCount={cigars.length} />
          )}
          {currentPage === "humidor" && (
            <Humidor cigars={cigars} onAdd={addCigar} onRemove={removeCigar} />
          )}
          {currentPage === "discover" && <Discover />}
          {currentPage === "journal" && (
            <Journal entries={journalEntries} cigars={cigars} onAdd={addJournalEntry} />
          )}
          {currentPage === "concierge" && <Concierge level={level} />}
        </PageTransition>
      </main>
    </div>
  );
};

export default Index;
