import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
import type { UserLevel } from "./OnboardingQuiz";
import { useLanguage } from "@/i18n/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConciergeProps {
  level: UserLevel;
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

export function Concierge({ level }: ConciergeProps) {
  const { t } = useLanguage();
  const levelContext = t(`concierge.levelContext.${level}` as any);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("concierge.greeting" as any, { level: levelContext }) },
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
    <div className="flex flex-col h-screen md:h-auto md:min-h-0" style={{ height: "calc(100vh - 0px)" }}>
      <div className="p-6 md:p-10 pb-4 md:pb-6 flex-shrink-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-ui tracking-[0.2em] uppercase text-gold mb-2">{t("concierge.aiPowered" as any)}</p>
          <h1 className="font-display text-4xl md:text-5xl text-cream font-bold mb-2">{t("concierge.title" as any)}</h1>
          <p className="font-serif-body text-muted-foreground">{t("concierge.subtitle" as any)}</p>
          <div className="divider-gold mt-4" />
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-4 space-y-4 min-h-0">
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
            <div className="w-7 h-7 flex items-center justify-center border border-gold/40 bg-gold/10 text-gold"><Bot size={13} /></div>
            <div className="gradient-card border border-border px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-6 md:px-10 pb-3 flex gap-2 flex-wrap flex-shrink-0">
          {suggestions[level].map((s) => (
            <button key={s} onClick={() => handleSend(s)}
              className="text-xs font-ui px-3 py-1.5 border border-border text-muted-foreground hover:border-gold/40 hover:text-cream transition-all duration-200">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-6 md:px-10 py-4 border-t border-border flex-shrink-0">
        <div className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t("concierge.placeholder" as any)}
            className="flex-1 bg-input border border-border px-4 py-3 text-sm text-foreground font-ui placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 transition-colors" />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="px-4 py-3 bg-gold text-mahogany hover:shadow-gold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
