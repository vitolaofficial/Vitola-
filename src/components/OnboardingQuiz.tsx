import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroCigars from "@/assets/hero-cigars.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { languageLabels, type Language } from "@/i18n/translations";
import { Globe } from "lucide-react";

export type UserLevel = "novice" | "aficionado" | "collector";

interface QuizQuestion {
  id: number;
  questionKey: string;
  subtitleKey: string;
  options: {
    labelKey: string;
    descKey: string;
    value: string;
    points: { novice: number; aficionado: number; collector: number };
  }[];
}

const questions: QuizQuestion[] = [
  {
    id: 1, questionKey: "quiz.q1", subtitleKey: "quiz.q1.sub",
    options: [
      { labelKey: "quiz.q1.a", descKey: "quiz.q1.a.desc", value: "a", points: { novice: 3, aficionado: 0, collector: 0 } },
      { labelKey: "quiz.q1.b", descKey: "quiz.q1.b.desc", value: "b", points: { novice: 1, aficionado: 2, collector: 0 } },
      { labelKey: "quiz.q1.c", descKey: "quiz.q1.c.desc", value: "c", points: { novice: 0, aficionado: 3, collector: 1 } },
      { labelKey: "quiz.q1.d", descKey: "quiz.q1.d.desc", value: "d", points: { novice: 0, aficionado: 1, collector: 3 } },
    ],
  },
  {
    id: 2, questionKey: "quiz.q2", subtitleKey: "quiz.q2.sub",
    options: [
      { labelKey: "quiz.q2.a", descKey: "quiz.q2.a.desc", value: "a", points: { novice: 3, aficionado: 1, collector: 0 } },
      { labelKey: "quiz.q2.b", descKey: "quiz.q2.b.desc", value: "b", points: { novice: 0, aficionado: 3, collector: 1 } },
      { labelKey: "quiz.q2.c", descKey: "quiz.q2.c.desc", value: "c", points: { novice: 0, aficionado: 2, collector: 3 } },
      { labelKey: "quiz.q2.d", descKey: "quiz.q2.d.desc", value: "d", points: { novice: 0, aficionado: 0, collector: 3 } },
    ],
  },
  {
    id: 3, questionKey: "quiz.q3", subtitleKey: "quiz.q3.sub",
    options: [
      { labelKey: "quiz.q3.a", descKey: "quiz.q3.a.desc", value: "a", points: { novice: 3, aficionado: 0, collector: 0 } },
      { labelKey: "quiz.q3.b", descKey: "quiz.q3.b.desc", value: "b", points: { novice: 1, aficionado: 3, collector: 0 } },
      { labelKey: "quiz.q3.c", descKey: "quiz.q3.c.desc", value: "c", points: { novice: 0, aficionado: 2, collector: 2 } },
      { labelKey: "quiz.q3.d", descKey: "quiz.q3.d.desc", value: "d", points: { novice: 0, aficionado: 0, collector: 3 } },
    ],
  },
];

const levelIcons = { novice: "🌿", aficionado: "🥃", collector: "👑" };

interface OnboardingQuizProps {
  onComplete: (level: UserLevel) => void;
}

const langs: Language[] = ["en", "tr", "es"];

export function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<UserLevel | null>(null);
  const { t, language, setLanguage } = useLanguage();

  const calculateResult = (finalAnswers: string[]): UserLevel => {
    const totals = { novice: 0, aficionado: 0, collector: 0 };
    finalAnswers.forEach((answer, i) => {
      const option = questions[i].options.find((o) => o.value === answer);
      if (option) {
        totals.novice += option.points.novice;
        totals.aficionado += option.points.aficionado;
        totals.collector += option.points.collector;
      }
    });
    return Object.entries(totals).sort(([, a], [, b]) => b - a)[0][0] as UserLevel;
  };

  const handleAnswer = (value: string) => {
    setSelectedOption(value);
    setTimeout(() => {
      const newAnswers = [...answers, value];
      if (currentQuestion < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        const level = calculateResult(newAnswers);
        setResult(level);
        setStep("result");
      }
    }, 400);
  };

  const q = questions[currentQuestion];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroCigars})` }} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(20 15% 4% / 0.7) 0%, hsl(20 15% 6% / 0.95) 100%)" }} />

      {/* Language switcher on intro */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <Globe size={14} className="text-muted-foreground" />
        {langs.map((lang) => (
          <button key={lang} onClick={() => setLanguage(lang)}
            className={`text-xs font-ui px-2.5 py-1 border transition-all ${language === lang ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground hover:text-cream"}`}>
            {languageLabels[lang]}
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7 }} className="text-center">
              <div className="mb-8">
                <div className="divider-gold mx-auto w-24 mb-8" />
                <p className="text-xs font-ui tracking-[0.25em] uppercase text-gold mb-4">{t("onboarding.welcome" as any)}</p>
                <h1 className="font-display text-5xl md:text-6xl font-bold text-cream mb-4 leading-tight">
                  {t("onboarding.title1" as any)}<br />
                  <span className="smoke-text">{t("onboarding.title2" as any)}</span>
                </h1>
                <div className="divider-gold mx-auto w-24 mt-6 mb-8" />
                <p className="font-serif-body text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">{t("onboarding.subtitle" as any)}</p>
              </div>
              <button onClick={() => setStep("quiz")}
                className="group relative inline-flex items-center gap-3 px-10 py-4 border border-gold text-gold font-ui font-medium tracking-[0.12em] uppercase text-sm transition-all duration-300 hover:bg-gold hover:text-mahogany hover:shadow-gold">
                <span>{t("onboarding.begin" as any)}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
              <p className="mt-6 text-xs text-muted-foreground font-ui tracking-wider">{t("onboarding.duration" as any)}</p>
            </motion.div>
          )}

          {step === "quiz" && (
            <motion.div key={`question-${currentQuestion}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}>
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-ui tracking-[0.2em] uppercase text-gold">
                    {t("onboarding.question" as any)} {currentQuestion + 1} {t("onboarding.of" as any)} {questions.length}
                  </span>
                  <span className="text-xs font-ui text-muted-foreground">{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                </div>
                <div className="h-px bg-border">
                  <div className="h-px bg-gold transition-all duration-500" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} />
                </div>
              </div>

              <div className="mb-8 text-center">
                <h2 className="font-display text-3xl md:text-4xl text-cream mb-3">{t(q.questionKey as any)}</h2>
                <p className="font-serif-body text-muted-foreground italic">{t(q.subtitleKey as any)}</p>
              </div>

              <div className="grid gap-3">
                {q.options.map((option) => (
                  <button key={option.value} onClick={() => handleAnswer(option.value)}
                    className={`group w-full text-left p-5 border transition-all duration-300 ${selectedOption === option.value ? "border-gold bg-gold/10 shadow-gold" : "border-border bg-card hover:border-gold/50 hover:bg-muted"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all duration-300 ${selectedOption === option.value ? "border-gold bg-gold" : "border-border group-hover:border-gold/50"}`} />
                      <div>
                        <p className="font-ui font-medium text-foreground text-sm">{t(option.labelKey as any)}</p>
                        <p className="font-serif-body text-muted-foreground text-sm mt-0.5">{t(option.descKey as any)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="text-center">
              <div className="divider-gold mx-auto w-24 mb-8" />
              <p className="text-xs font-ui tracking-[0.25em] uppercase text-gold mb-3">{t("onboarding.yourProfile" as any)}</p>
              <div className="text-6xl mb-6 animate-float">{levelIcons[result]}</div>
              <h2 className="font-display text-4xl md:text-5xl text-cream mb-3">{t(`level.${result}.title` as any)}</h2>
              <p className="font-serif-body text-lg text-gold italic mb-6">{t(`level.${result}.subtitle` as any)}</p>
              <div className="divider-gold mx-auto w-16 mb-6" />
              <p className="font-serif-body text-muted-foreground leading-relaxed max-w-md mx-auto mb-10">{t(`level.${result}.desc` as any)}</p>
              <button onClick={() => onComplete(result)}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-gold text-mahogany font-ui font-semibold tracking-[0.12em] uppercase text-sm transition-all duration-300 hover:shadow-gold hover:scale-[1.02]">
                <span>{t("onboarding.enter" as any)}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
