import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import type { UserLevel, UserProfile } from "@/components/auth/OnboardingQuiz";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConciergeProps {
  level: UserLevel;
  profile: UserProfile;
}

const suggestions: Record<UserLevel, string[]> = {
  novice: [
    "What's a good first cigar for a beginner?",
    "How do I properly cut and light a cigar?",
    "What does 'full-bodied' mean?",
    "How do I store cigars at home?",
  ],
  aficionado: [
    "Compare Nicaraguan vs Cuban cigars",
    "What makes a great Robusto?",
    "Best cigars to pair with whisky?",
    "How long should I age a cigar?",
  ],
  collector: [
    "Best pre-embargo Cuban cigars worth seeking",
    "Advise me on humidor humidity levels for aging",
    "Most collectible limited editions this decade?",
    "How to authenticate a Cuban cigar?",
  ],
};

export function Concierge({ level, profile }: ConciergeProps) {
  const { t } = useLanguage();
  const levelContext = t(`concierge.levelContext.${level}` as TranslationKey);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("concierge.greeting" as TranslationKey, { level: levelContext }) },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const responses: Record<string, string> = {
      "What's a good first cigar for a beginner?":
        "For your first cigar, I recommend the **Montecristo No. 4** — a mild to medium Cuban that's approachable yet complex. Alternatively, the **Romeo y Julieta Reserva Real** offers wonderful creaminess with very little harshness. Pair it with a single malt Scotch and enjoy in a comfortable setting.",
      "How do I properly cut and light a cigar?":
        "Cut approximately 1/16 inch above the cap using a sharp guillotine cutter — never bite. For lighting, use a cedar spill or butane lighter, never a petroleum lighter. Toast the foot slowly at 45°, rotating to ensure even ignition before drawing. A proper draw should feel like sipping through a cocktail straw.",
      "Best cigars to pair with whisky?":
        "The marriage of cigar and whisky is sublime. A **Padron 1964** with its chocolate and leather notes pairs beautifully with an Islay Scotch. For Bourbon, try a **Liga Privada No. 9** — its dark fruit complexity complements vanilla-forward whiskeys. Peaty Scotch calls for a full-bodied Nicaraguan, perhaps a **My Father Le Bijou**.",
    };

    const reply = responses[userMessage] ||
      `An excellent question for a ${levelContext}. The world of premium cigars is vast and rewarding. Each cigar tells the story of its terroir, the master blender's vision, and the artisan's craft. I'd be delighted to guide you further — could you share more about what you're looking to explore or experience?`;

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const renderContent = (text: string) => {
    return text.split("**").map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-gold font-semibold">{part}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] max-w-5xl ml-0">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-gold/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="p-4 md:p-8 pb-3 md:pb-4 flex-shrink-0 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-px bg-gradient-to-r from-gold/40 to-transparent mb-4" />
          <p className="text-xs font-ui tracking-[0.4em] uppercase text-gold/50 mb-2">{t("concierge.aiPowered" as TranslationKey)}</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-3 text-gold-gradient">{t("concierge.title" as TranslationKey)}</h1>
          <p className="font-serif-body text-cream/35">{t("concierge.subtitle" as TranslationKey)}</p>
          <div className="divider-gold mt-4" />
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border ${msg.role === "assistant" ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-muted text-muted-foreground"}`}>
              {msg.role === "assistant" ? <Bot size={13} /> : <User size={13} />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 ${msg.role === "assistant" ? "gradient-card border border-border" : "bg-gold/10 border border-gold/30"}`}>
              <p className={`text-sm leading-relaxed font-serif-body ${msg.role === "assistant" ? "text-foreground" : "text-gold"}`}>
                {renderContent(msg.content)}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
            <div className="w-7 h-7 flex items-center justify-center border border-gold/40 bg-gold/10 text-gold animate-pulse-gold"><Bot size={13} /></div>
            <div className="gradient-card border border-border">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 md:px-8 pb-3 flex gap-2 flex-wrap flex-shrink-0">
          {suggestions[level].map((s) => (
            <button key={s} onClick={() => handleSend(s)}
              className="text-xs font-ui px-3 py-1.5 border border-border text-muted-foreground hover:border-gold/40 hover:text-cream transition-all duration-200">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 md:px-8 py-4 border-t border-white/[0.04] flex-shrink-0 relative z-10">
        <div className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t("concierge.placeholder" as TranslationKey)}
            className="flex-1 bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-sm text-cream font-ui placeholder:text-cream/15 focus:outline-none focus:border-gold/25 transition-colors" />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading} title="Send message"
            className="px-5 py-3 bg-gold text-[#0a0604] hover:shadow-[0_0_40px_rgba(197,160,89,0.2)] transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
