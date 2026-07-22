import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Compass, BookOpen, User, Home,
  ChevronRight, Volume2, Heart, Star,
  Globe, Award, Bookmark, Sunrise, Camera, ImagePlus, Shuffle, X, ChevronDown,
  Mail, CreditCard, PenLine, Plus, BookMarked, Settings, Trash2
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE / i18n
// ══════════════════════════════════════════════════════════════════════════════
type Lang = "ko" | "en";
const STRINGS = {
  ko: {
    "nav.home": "홈", "nav.journey": "여정", "nav.log": "로그", "nav.passport": "패스포트",
    "log.title": "Mission Log", "log.subtitle": "하나님과의 편지통",
    "log.subtitleSub": "Letters to God",
    "log.expression": "오늘의 표현", "log.prayer": "기도 제목", "log.memory": "추억",
    "log.compose": "새 편지 쓰기", "log.send": "편지 부치기 ✉️",
    "log.addPhoto": "사진 추가", "log.titlePlaceholder": "제목 (선택)",
    "log.bodyExpression": "오늘 배운 표현을 적어보세요...",
    "log.bodyPrayer": "기도 제목을 적어보세요...",
    "log.bodyMemory": "오늘의 추억을 적어보세요...",
    "log.empty": "아직 편지가 없어요.\n첫 번째 편지를 써보세요!",
    "passport.title": "Mission Passport", "passport.stamps": "Visa Stamps",
    "settings.title": "설정", "settings.language": "언어",
    "settings.ko": "한국어", "settings.en": "English",
    "settings.done": "완료",
  },
  en: {
    "nav.home": "Home", "nav.journey": "Journey", "nav.log": "Log", "nav.passport": "Passport",
    "log.title": "Mission Log", "log.subtitle": "Letters to God",
    "log.subtitleSub": "하나님과의 편지통",
    "log.expression": "Expression", "log.prayer": "Prayer", "log.memory": "Memory",
    "log.compose": "New Letter", "log.send": "Send Letter ✉️",
    "log.addPhoto": "Add Photo", "log.titlePlaceholder": "Title (optional)",
    "log.bodyExpression": "Write an expression you learned today...",
    "log.bodyPrayer": "Write a prayer request...",
    "log.bodyMemory": "Write a memory from today...",
    "log.empty": "No letters yet.\nWrite your first one!",
    "passport.title": "Mission Passport", "passport.stamps": "Visa Stamps",
    "settings.title": "Settings", "settings.language": "Language",
    "settings.ko": "한국어", "settings.en": "English",
    "settings.done": "Done",
  },
} as const;
type StringKey = keyof typeof STRINGS.ko;
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "ko", setLang: () => {} });
function useT() {
  const { lang } = useContext(LangContext);
  return (key: StringKey) => STRINGS[lang][key];
}

type Screen = "welcome" | "passport-office" | "board" | "journey" | "passport" | "four-laws" | "street-ev" | "log";
type NavTab = "home" | "journey" | "log" | "passport";
type Mission = "indonesia" | "japan" | "india";
type LogType = "expression" | "prayer" | "memory";
interface LogEntry {
  id: string;
  date: Date;
  type: LogType;
  title: string;
  body: string;
  photoUrl?: string;
}

const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const MONO = "'SF Mono', 'JetBrains Mono', ui-monospace, monospace";

// ══════════════════════════════════════════════════════════════════════════════
// LIVING SKY
// ══════════════════════════════════════════════════════════════════════════════
interface SkyState {
  gradient: string; cloudOpacity: number; starOpacity: number;
  label: string; textLight: boolean; outerBg: string;
}
function getSkyState(hour: number): SkyState {
  if (hour < 4) return { gradient: "linear-gradient(175deg, #0A0E1A 0%, #0D1B3A 25%, #141E3C 55%, #1A2448 80%, #0D1425 100%)", cloudOpacity: 0.08, starOpacity: 1, label: "밤하늘", textLight: true, outerBg: "linear-gradient(135deg, #0D1425 0%, #141E3C 50%, #0A0E1A 100%)" };
  if (hour < 6) return { gradient: "linear-gradient(175deg, #1A1040 0%, #2C1F6B 20%, #5B3A8A 40%, #8B5E9E 58%, #C47EB8 75%, #E8B4C8 90%, #F5D8C8 100%)", cloudOpacity: 0.28, starOpacity: 0.5, label: "여명", textLight: true, outerBg: "linear-gradient(135deg, #1A1040 0%, #3B2070 50%, #8B4A8A 100%)" };
  if (hour < 8) return { gradient: "linear-gradient(175deg, #FFD580 0%, #FFAA5A 10%, #FF8E78 22%, #D97ABA 38%, #8FB8E8 58%, #5499D9 78%, #2A6BB8 100%)", cloudOpacity: 0.55, starOpacity: 0, label: "일출", textLight: false, outerBg: "linear-gradient(135deg, #FFD099 0%, #FFB3A0 50%, #C8D8F0 100%)" };
  if (hour < 11) return { gradient: "linear-gradient(175deg, #FDEEA0 0%, #F9D077 12%, #C8E8F8 38%, #7ABEE8 62%, #4A92D4 82%, #2260A8 100%)", cloudOpacity: 0.62, starOpacity: 0, label: "아침", textLight: false, outerBg: "linear-gradient(135deg, #C8E4F8 0%, #D8EEF0 50%, #E8F4D8 100%)" };
  if (hour < 15) return { gradient: "linear-gradient(175deg, #E8F4FF 0%, #B8DCFF 20%, #7EC5FF 45%, #4CA8F5 68%, #2880E0 88%, #1660C8 100%)", cloudOpacity: 0.72, starOpacity: 0, label: "낮", textLight: false, outerBg: "linear-gradient(135deg, #C0DCF8 0%, #D0E8FF 50%, #E8F0FF 100%)" };
  if (hour < 18) return { gradient: "linear-gradient(175deg, #FFF0C8 0%, #FFD888 18%, #F8B870 32%, #7EC0F0 55%, #3A90D8 78%, #1A62B8 100%)", cloudOpacity: 0.58, starOpacity: 0, label: "오후", textLight: false, outerBg: "linear-gradient(135deg, #F0E0C0 0%, #E8D8C0 50%, #C8D8E8 100%)" };
  if (hour < 20) return { gradient: "linear-gradient(175deg, #FF6B35 0%, #FF9438 12%, #FFB347 22%, #E8636A 38%, #A0449A 55%, #4A2878 75%, #1A1040 100%)", cloudOpacity: 0.48, starOpacity: 0.15, label: "일몰", textLight: true, outerBg: "linear-gradient(135deg, #FF8855 0%, #CC5080 50%, #441870 100%)" };
  if (hour < 22) return { gradient: "linear-gradient(175deg, #2A1555 0%, #3D1F78 20%, #5C3090 40%, #3A2060 62%, #1E1440 82%, #0D0E20 100%)", cloudOpacity: 0.16, starOpacity: 0.65, label: "황혼", textLight: true, outerBg: "linear-gradient(135deg, #2A1555 0%, #1E1050 50%, #0D0820 100%)" };
  return { gradient: "linear-gradient(175deg, #060A14 0%, #0D1530 25%, #111A3C 55%, #181E3A 80%, #090C18 100%)", cloudOpacity: 0.06, starOpacity: 1, label: "밤", textLight: true, outerBg: "linear-gradient(135deg, #0A0E20 0%, #111830 50%, #060A14 100%)" };
}
function useLivingSky() {
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => { const t = setInterval(() => setHour(new Date().getHours()), 30000); return () => clearInterval(t); }, []);
  return getSkyState(hour);
}

function StarField({ opacity }: { opacity: number }) {
  const stars = useRef(Array.from({ length: 48 }, () => ({ x: Math.random() * 100, y: Math.random() * 55, r: Math.random() * 1.4 + 0.4, delay: Math.random() * 4 })));
  if (opacity === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      {stars.current.map((s, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5 + s.delay, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </div>
  );
}
function FloatingCloud({ x, y, size, delay, opacity }: { x: number; y: number; size: number; delay: number; opacity: number }) {
  return (
    <motion.div className="absolute pointer-events-none select-none" style={{ left: `${x}%`, top: `${y}%`, opacity }}
      animate={{ x: [0, 14, 0], y: [0, -7, 0] }} transition={{ duration: 9 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width={size} height={size * 0.55} viewBox="0 0 120 66" fill="none">
        <ellipse cx="60" cy="48" rx="54" ry="18" fill="white" fillOpacity="0.75" />
        <ellipse cx="42" cy="38" rx="28" ry="22" fill="white" fillOpacity="0.75" />
        <ellipse cx="72" cy="34" rx="24" ry="20" fill="white" fillOpacity="0.68" />
        <ellipse cx="55" cy="30" rx="20" ry="18" fill="white" fillOpacity="0.62" />
      </svg>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STAMP ANIMATION + PASSPORT STAMP
// ══════════════════════════════════════════════════════════════════════════════
function PassportStampOverlay({ active, done }: { active: boolean; done: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
        >
          <motion.div className="absolute flex flex-col items-center"
            initial={{ y: -90, opacity: 0 }} animate={{ y: [-90, 8, -4, 0], opacity: [0, 1, 1, 1] }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ top: "calc(50% - 72px)" }}
          >
            <div className="w-4 rounded-t-sm" style={{ height: 26, background: "linear-gradient(180deg, #8A6A28 0%, #C8A050 100%)" }} />
            <motion.div className="w-20 flex items-center justify-center rounded-sm"
              style={{ height: 38, background: "linear-gradient(180deg, #A87828 0%, #C8A050 60%, #B89040 100%)", boxShadow: "0 4px 0 rgba(0,0,0,0.25)" }}
              animate={done ? { boxShadow: "0 0px 0 rgba(0,0,0,0.1)" } : {}}
            >
              <Compass size={16} className="text-white" strokeWidth={2} />
            </motion.div>
          </motion.div>
          {done && (<>
            <motion.div className="absolute rounded-full border border-[#B89A5E]" style={{ width: 80, height: 80 }} initial={{ scale: 0.3, opacity: 0.8 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
            <motion.div className="absolute rounded-full border border-[#B89A5E]" style={{ width: 80, height: 80 }} initial={{ scale: 0.2, opacity: 0.5 }} animate={{ scale: 3.2, opacity: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} />
          </>)}
          {done && Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60) * (Math.PI / 180); const dist = 44 + Math.random() * 10;
            return (<motion.div key={i} className="absolute rounded-full bg-[#B89A5E]" style={{ width: 3 + i % 3 * 2, height: 3 + i % 3 * 2 }} initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: [0, 0.7, 0] }} transition={{ duration: 0.5, delay: 0.1 + i * 0.02, ease: "easeOut" }} />);
          })}
          <motion.div className="absolute flex flex-col items-center justify-center rounded-full"
            style={{ width: 88, height: 88, border: "2px solid #B89A5E", background: done ? "rgba(184,154,94,0.15)" : "rgba(184,154,94,0.05)", backdropFilter: "blur(8px)" }}
            initial={{ scale: 0, opacity: 0, rotate: -22 }} animate={done ? { scale: [0, 1.15, 0.96, 1], opacity: 1, rotate: [-22, 3, -1, 0] } : { scale: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Award size={24} style={{ color: "#B89A5E" }} />
            <p style={{ color: "#B89A5E", fontSize: 6, fontWeight: 800, letterSpacing: "0.24em", marginTop: 3 }}>ISSUED</p>
          </motion.div>
          {done && (<motion.div className="absolute rounded-full" style={{ width: 94, height: 94, border: "1px solid rgba(184,154,94,0.3)", boxShadow: "0 0 24px rgba(184,154,94,0.18)" }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }} />)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PassportStamp({ country, emoji, obtained, gates, total, dark }: { country: string; emoji: string; obtained: boolean; gates?: number; total?: number; dark?: boolean }) {
  const activeBg  = "rgba(196,160,48,0.10)";
  const activeBdr = "1px solid rgba(196,160,48,0.3)";
  const emptyBdr  = "1px dashed rgba(12,35,64,0.15)";
  const nameTxt   = obtained ? "#0C2340" : "#A8B5C4";
  return (
    <motion.div className="flex flex-col items-center gap-1"
      style={{ borderRadius: 14, padding: "10px 6px", background: obtained ? activeBg : "transparent", border: obtained ? activeBdr : emptyBdr }}
      whileHover={obtained ? { scale: 1.04 } : {}}
    >
      <span style={{ fontSize: 22, opacity: obtained ? 1 : 0.2, filter: obtained ? "none" : "grayscale(1)" }}>{emoji}</span>
      <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.05em", fontFamily: SANS, color: nameTxt, textAlign: "center" }}>{country}</span>
      {obtained && gates !== undefined && <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.08em", color: "#C4A96A", fontFamily: SANS }}>{gates}/{total}</span>}
    </motion.div>
  );
}

function VocabCard({ word, romanization, english, isPlaying, onPlay }: {
  word: string; romanization: string; english: string; isPlaying: boolean; onPlay: () => void;
}) {
  return (
    <motion.div
      style={{ background: "#FFFFFF", borderRadius: 20, padding: "16px 18px", boxShadow: isPlaying ? "0 4px 24px rgba(74,159,224,0.18), 0 1px 6px rgba(12,31,53,0.06)" : "0 2px 16px rgba(12,31,53,0.07), 0 1px 4px rgba(12,31,53,0.04)", border: isPlaying ? "1px solid rgba(74,159,224,0.2)" : "1px solid rgba(12,31,53,0.05)", transition: "box-shadow 0.2s, border-color 0.2s" }}
      whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 30, lineHeight: 1.2, fontFamily: SERIF, color: "#0C1F35", marginBottom: 5, fontStyle: "italic" }}>{word}</p>
          <p style={{ fontSize: 12, fontFamily: SANS, color: "#6B7C92", fontWeight: 500, letterSpacing: "0.02em" }}>{romanization}</p>
        </div>
        <motion.button onClick={onPlay}
          style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isPlaying ? "#4A9FE0" : "rgba(74,159,224,0.1)", color: isPlaying ? "#FFFFFF" : "#4A9FE0", border: "none", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
          whileTap={{ scale: 0.9 }} animate={isPlaying ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
        >
          <Volume2 size={16} strokeWidth={1.8} />
        </motion.button>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, fontFamily: SANS, color: "#0C1F35", marginTop: 10 }}>{english}</p>
    </motion.div>
  );
}

function GateProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 3, borderRadius: 2, transition: "all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)", width: i < current ? 14 : i === current - 1 ? 20 : 8, background: i < current ? "#B89A5E" : i === current - 1 ? "#4A9FE0" : "rgba(12,31,53,0.15)", opacity: i >= current ? 0.5 : 1 }} />
      ))}
    </div>
  );
}

function BottomNav({ current, onTab, dark = false }: { current: NavTab; onTab: (t: NavTab) => void; dark?: boolean }) {
  const t = useT();
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "home",     label: t("nav.home"),    icon: <Home size={20} strokeWidth={1.6} /> },
    { id: "journey",  label: t("nav.journey"), icon: <Compass size={20} strokeWidth={1.6} /> },
    { id: "log",      label: t("nav.log"),     icon: <Mail size={20} strokeWidth={1.6} /> },
    { id: "passport", label: t("nav.passport"),icon: <CreditCard size={20} strokeWidth={1.6} /> },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: dark ? "rgba(8,16,30,0.95)" : "rgba(246,245,241,0.96)", backdropFilter: "blur(24px) saturate(1.8)", borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(12,31,53,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", paddingTop: 8, paddingBottom: 10 }}>
        {tabs.map((tab) => {
          const active = tab.id === current;
          const activeColor = dark ? "#C9A84C" : "#0C1F35";
          const inactiveColor = dark ? "rgba(255,255,255,0.28)" : "rgba(12,31,53,0.28)";
          return (
            <button key={tab.id} onClick={() => onTab(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 14px", background: "none", border: "none", cursor: "pointer" }}>
              <motion.div animate={{ color: active ? activeColor : inactiveColor, y: active ? -1 : 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>{tab.icon}</motion.div>
              <motion.span style={{ fontSize: 9, fontWeight: 600, fontFamily: SANS, letterSpacing: "0.02em" }} animate={{ color: active ? activeColor : inactiveColor, opacity: active ? 1 : 0.65 }} transition={{ duration: 0.2 }}>{tab.label}</motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Welcome
// ══════════════════════════════════════════════════════════════════════════════
const SPLASH_DESTINATIONS = [
  { country: "Indonesia", flag: "🇮🇩", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=1400&fit=crop&auto=format", alt: "Bali temple gates" },
  { country: "Japan", flag: "🇯🇵", img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=1400&fit=crop&auto=format", alt: "Tokyo streets at night" },
  { country: "India", flag: "🇮🇳", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=1400&fit=crop&auto=format", alt: "Taj Mahal at golden hour" },
  { country: "USA", flag: "🇺🇸", img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1400&fit=crop&auto=format", alt: "Grand Canyon vista" },
  { country: "Brazil", flag: "🇧🇷", img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=1400&fit=crop&auto=format", alt: "Rio de Janeiro" },
  { country: "Kenya", flag: "🇰🇪", img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=1400&fit=crop&auto=format", alt: "African savanna" },
  { country: "South Korea", flag: "🇰🇷", img: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=1400&fit=crop&auto=format", alt: "Seoul Gyeongbokgung Palace" },
  { country: "Egypt", flag: "🇪🇬", img: "https://images.unsplash.com/photo-1539650116574-75c0c6d73e0e?w=800&h=1400&fit=crop&auto=format", alt: "Pyramids of Giza" },
];

function WelcomeScreen({ onNext, onSkip, sky }: { onNext: () => void; onSkip: () => void; sky: SkyState }) {
  const [destIdx, setDestIdx] = useState(() => Math.floor(Math.random() * SPLASH_DESTINATIONS.length));

  useEffect(() => {
    const t = setInterval(() => setDestIdx(i => (i + 1) % SPLASH_DESTINATIONS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const dest = SPLASH_DESTINATIONS[destIdx];

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <motion.div className="absolute inset-0" style={{ background: sky.gradient }} animate={{ background: sky.gradient }} transition={{ duration: 3, ease: "easeInOut" }} />

      {/* Crossfading destination images */}
      <AnimatePresence mode="sync">
        <motion.img
          key={dest.img}
          src={dest.img}
          alt={dest.alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: sky.textLight ? 0.28 : 0.35, mixBlendMode: "luminosity" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: sky.textLight ? 0.28 : 0.35 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <StarField opacity={sky.starOpacity} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 25%, rgba(0,0,0,0.65) 100%)" }} />
      <FloatingCloud x={-10} y={6} size={190} delay={0} opacity={sky.cloudOpacity} />
      <FloatingCloud x={52} y={1} size={150} delay={2.8} opacity={sky.cloudOpacity * 0.82} />
      <FloatingCloud x={68} y={16} size={115} delay={1.4} opacity={sky.cloudOpacity * 0.7} />

      {/* Sky label */}
      <div style={{ position: "absolute", top: 56, right: 20, zIndex: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", padding: "4px 10px", borderRadius: 20, fontFamily: SANS, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.15)" }}>{sky.label}</span>
      </div>

      {/* Destination ticker — top left */}
      <div style={{ position: "absolute", top: 54, left: 20, zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div key={destIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45 }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ fontSize: 14 }}>{dest.flag}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", fontFamily: SANS, color: "rgba(255,255,255,0.82)" }}>{dest.country}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 220, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 10 }}>
        {SPLASH_DESTINATIONS.map((_, i) => (
          <motion.div key={i} animate={{ width: i === destIdx ? 16 : 5, background: i === destIdx ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}
            style={{ height: 5, borderRadius: 2.5, cursor: "pointer" }} onClick={() => setDestIdx(i)} transition={{ duration: 0.28 }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full" style={{ padding: "0 32px 44px" }}>
        <div className="flex-1 flex flex-col justify-end" style={{ paddingBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", fontFamily: SANS, color: "rgba(255,255,255,0.55)", marginBottom: 14, textTransform: "uppercase" }}>Mission Trip</p>
            <h1 style={{ fontSize: 62, lineHeight: 0.95, fontFamily: SERIF, color: "#FFFFFF", marginBottom: 28, textShadow: "0 4px 32px rgba(0,0,0,0.3)", fontStyle: "italic" }}>
              Go into<br />all the<br />world.
            </h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 16, fontFamily: SANS, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, fontWeight: 300, maxWidth: 260, textShadow: "0 1px 8px rgba(0,0,0,0.2)" }}>
              Learn the language.<br />Love the people.<br />Share the Gospel.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button onClick={onNext} style={{ width: "100%", padding: "16px 24px", borderRadius: 18, background: "#FFFFFF", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: SANS, color: "#0C1F35", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
              Begin My Journey <ChevronRight size={16} strokeWidth={2.5} />
            </motion.button>
            <motion.button onClick={onSkip} style={{ width: "100%", padding: "15px 24px", borderRadius: 18, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: SANS, color: "rgba(255,255,255,0.8)" }} whileTap={{ scale: 0.96 }}>
              I already have a passport
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PHOTO PICKER
// ══════════════════════════════════════════════════════════════════════════════
const RANDOM_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face&auto=format",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face&auto=format",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face&auto=format",
];

function PhotoPickerSheet({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; onSelect(URL.createObjectURL(file)); };
  const options = [
    { icon: <Camera size={20} strokeWidth={1.6} />, label: "Take Photo", sub: "Use your camera", color: "#4A9FE0", action: () => cameraRef.current?.click() },
    { icon: <ImagePlus size={20} strokeWidth={1.6} />, label: "Choose from Library", sub: "Select from your photos", color: "#7CA88A", action: () => galleryRef.current?.click() },
    { icon: <Shuffle size={20} strokeWidth={1.6} />, label: "Random Avatar", sub: "Pick a random portrait", color: "#B89A5E", action: () => onSelect(RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)]) },
  ];
  return (
    <>
      <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(8,16,32,0.5)", backdropFilter: "blur(6px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute bottom-0 inset-x-0 z-40 overflow-hidden" style={{ background: "#F6F5F1", borderRadius: "28px 28px 0 0" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(12,31,53,0.15)" }} />
        </div>
        <div style={{ padding: "12px 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: SANS, color: "#0C1F35" }}>Add Photo</h3>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(12,31,53,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} style={{ color: "#0C1F35" }} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((opt) => (
              <motion.button key={opt.label} onClick={opt.action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 18, background: "#FFFFFF", border: "1px solid rgba(12,31,53,0.06)", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 8px rgba(12,31,53,0.05)" }} whileTap={{ scale: 0.98 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${opt.color}18`, color: opt.color }}>{opt.icon}</div>
                <div><p style={{ fontSize: 14, fontWeight: 600, fontFamily: SANS, color: "#0C1F35" }}>{opt.label}</p><p style={{ fontSize: 11, fontFamily: SANS, color: "#6B7C92", marginTop: 2 }}>{opt.sub}</p></div>
                <ChevronRight size={16} style={{ color: "#A8B5C4", marginLeft: "auto" }} />
              </motion.button>
            ))}
          </div>
        </div>
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </motion.div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Passport Office (with country selection)
// ══════════════════════════════════════════════════════════════════════════════
interface CountryOption { flag: string; name: string; code: string }

const HOME_COUNTRIES: CountryOption[] = [
  { flag: "🇺🇸", name: "United States", code: "USA" },
  { flag: "🇰🇷", name: "South Korea", code: "KOR" },
  { flag: "🇧🇷", name: "Brazil", code: "BRA" },
  { flag: "🇨🇦", name: "Canada", code: "CAN" },
  { flag: "🇦🇺", name: "Australia", code: "AUS" },
  { flag: "🇬🇧", name: "United Kingdom", code: "GBR" },
  { flag: "🇸🇬", name: "Singapore", code: "SGP" },
  { flag: "🇩🇪", name: "Germany", code: "DEU" },
  { flag: "🇳🇬", name: "Nigeria", code: "NGA" },
  { flag: "🇿🇦", name: "South Africa", code: "ZAF" },
  { flag: "🇵🇭", name: "Philippines", code: "PHL" },
  { flag: "🇲🇽", name: "Mexico", code: "MEX" },
  { flag: "🇮🇳", name: "India", code: "IND" },
  { flag: "🇹🇼", name: "Taiwan", code: "TWN" },
  { flag: "🇫🇷", name: "France", code: "FRA" },
  { flag: "🇳🇱", name: "Netherlands", code: "NLD" },
  { flag: "🇸🇪", name: "Sweden", code: "SWE" },
  { flag: "🇰🇪", name: "Kenya", code: "KEN" },
  { flag: "🇳🇿", name: "New Zealand", code: "NZL" },
  { flag: "🇨🇳", name: "China", code: "CHN" },
];

const DESTINATION_OPTIONS: (CountryOption & { mission: Mission })[] = [
  { flag: "🇮🇩", name: "Indonesia", code: "IDN", mission: "indonesia" },
  { flag: "🇯🇵", name: "Japan",     code: "JPN", mission: "japan" },
  { flag: "🇮🇳", name: "India",     code: "IND", mission: "india" },
];

function CountryPickerSheet({ title, options, selected, onSelect, onClose }: {
  title: string;
  options: CountryOption[];
  selected: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(8,16,32,0.5)", backdropFilter: "blur(6px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute bottom-0 inset-x-0 z-40" style={{ background: "#F6F5F1", borderRadius: "28px 28px 0 0", maxHeight: "72%" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(12,31,53,0.15)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 10px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: SANS, color: "#0C1F35" }}>{title}</h3>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(12,31,53,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} style={{ color: "#0C1F35" }} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "4px 16px 32px", display: "flex", flexDirection: "column", gap: 6, maxHeight: "calc(72vh - 80px)" }}>
          {options.map((opt) => {
            const active = opt.code === selected;
            return (
              <motion.button key={opt.code} onClick={() => { onSelect(opt.code); onClose(); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 16, background: active ? "#0C1F35" : "#FFFFFF", border: active ? "none" : "1px solid rgba(12,31,53,0.06)", cursor: "pointer", textAlign: "left", boxShadow: active ? "0 4px 16px rgba(12,31,53,0.2)" : "0 1px 6px rgba(12,31,53,0.04)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.flag}</span>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: SANS, color: active ? "#FFFFFF" : "#0C1F35" }}>{opt.name}</span>
                {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: "#B89A5E" }} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

function PassportOfficeScreen({ onNext, photoUrl, onPhotoChange, userName, onUserNameChange, homeCountry, destination, onHomeCountryChange, onDestinationChange }: {
  onNext: () => void; photoUrl: string | null; onPhotoChange: (url: string) => void;
  userName: string; onUserNameChange: (v: string) => void;
  homeCountry: string | null; destination: string | null;
  onHomeCountryChange: (code: string) => void; onDestinationChange: (code: string) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "stamping" | "done">("idle");
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);

  const homeOpt = HOME_COUNTRIES.find(c => c.code === homeCountry);
  const destOpt = DESTINATION_OPTIONS.find(c => c.code === destination);

  const handleIssue = () => {
    if (phase !== "idle") return;
    setPhase("stamping");
    setTimeout(() => setPhase("done"), 540);
    setTimeout(() => onNext(), 1600);
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ background: "#F6F5F1" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 22px 28px", display: "flex", flexDirection: "column", gap: 0 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", fontFamily: SANS, color: "#A8B5C4", marginBottom: 6, textTransform: "uppercase" }}>Passport Office</p>
          <h2 style={{ fontSize: 28, fontFamily: SERIF, color: "#0C1F35", lineHeight: 1.15 }}>Your Mission Passport</h2>
        </motion.div>

        {/* Passport card — real passport book style */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.12 }}
          style={{ filter: "drop-shadow(0 22px 48px rgba(8,32,16,0.38)) drop-shadow(0 6px 16px rgba(8,32,16,0.22))" }}>

          {/* Passport COVER — matches Passport tab */}
          <div style={{ borderRadius: "16px 16px 0 0", background: "linear-gradient(160deg, #0D4A8A 0%, #1A6BB5 45%, #0D4A8A 100%)", padding: "18px 20px 20px", position: "relative", overflow: "hidden" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.1, pointerEvents: "none" }}>
              <defs>
                <pattern id="sec2" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="10" stroke="#C8E4F8" strokeWidth="0.5" fill="none" />
                  <circle cx="16" cy="16" r="6.5" stroke="#C8E4F8" strokeWidth="0.4" fill="none" />
                  <circle cx="16" cy="16" r="3"   stroke="#C8E4F8" strokeWidth="0.4" fill="none" />
                  <circle cx="16" cy="16" r="1"   fill="#C8E4F8" />
                  <line x1="16" y1="6"  x2="16" y2="26" stroke="#C8E4F8" strokeWidth="0.3" />
                  <line x1="6"  y1="16" x2="26" y2="16" stroke="#C8E4F8" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sec2)" />
            </svg>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #7A560F, #B8892A, #DDB84A, #B8892A, #7A560F)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px solid rgba(221,184,74,0.7)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(221,184,74,0.08)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 4, borderRadius: "50%", border: "1px dashed rgba(221,184,74,0.4)" }} />
                <Globe size={20} style={{ color: "rgba(221,184,74,0.9)" }} strokeWidth={1.4} />
              </div>
              <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.3em", fontFamily: SANS, color: "rgba(221,184,74,0.9)", textTransform: "uppercase" }}>Kingdom of God</p>
              <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", fontFamily: SANS, color: "#FFFFFF", textTransform: "uppercase" }}>MISSION PASSPORT</p>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #7A560F, #B8892A, #DDB84A, #B8892A, #7A560F)" }} />
          </div>

          {/* Data page — matches Passport tab white card */}
          <div style={{ background: "#FFFFFF", borderRadius: "0 0 16px 16px", position: "relative", overflow: "hidden", border: "1px solid rgba(21,101,168,0.1)", borderTop: "none" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}>
              <defs>
                <pattern id="dp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 4 L36 14 L36 26 L20 36 L4 26 L4 14 Z" stroke="#1A6BB5" strokeWidth="0.6" fill="none" />
                  <circle cx="20" cy="20" r="3" stroke="#1A6BB5" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dp)" />
            </svg>

            {/* Photo + identity row */}
            <div style={{ padding: "14px 18px 10px", display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
              <motion.button
                style={{ width: 64, height: 80, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: photoUrl ? "2px solid #B8892A" : "1.5px dashed rgba(21,101,168,0.2)", background: photoUrl ? "transparent" : "#F0F6FC", cursor: "pointer", position: "relative" }}
                onClick={() => setShowPhotoPicker(true)} whileTap={{ scale: 0.95 }}>
                {photoUrl
                  ? <><img src={photoUrl} alt="Passport photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 0", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}><Camera size={7} style={{ color: "#FFFFFF" }} /></div></>
                  : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}><Camera size={18} style={{ color: "rgba(21,101,168,0.3)" }} strokeWidth={1.5} /><span style={{ fontSize: 6.5, fontFamily: SANS, color: "rgba(21,101,168,0.35)", textAlign: "center", lineHeight: 1.4 }}>Add<br />Photo</span></div>}
              </motion.button>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 2 }}>
                {/* Editable name */}
                <div>
                  <p style={{ fontSize: 6.5, fontFamily: SANS, color: "#5C82A8", letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Surname / 성</p>
                  <input
                    value={userName}
                    onChange={e => onUserNameChange(e.target.value)}
                    placeholder="이름 또는 닉네임"
                    style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${userName ? "rgba(21,101,168,0.35)" : "rgba(21,101,168,0.15)"}`, outline: "none", fontSize: 12, fontFamily: SANS, fontWeight: 700, color: "#0D3666", padding: "2px 0 3px", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  />
                </div>
                {[{ label: "Nationality / 국적", value: "Kingdom of God" }, { label: "Document No.", value: "MT-000001" }].map(row => (
                  <div key={row.label}>
                    <p style={{ fontSize: 6.5, fontFamily: SANS, color: "#5C82A8", letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase" }}>{row.label}</p>
                    <p style={{ fontSize: 11.5, fontFamily: SANS, color: "#0D3666", fontWeight: 700, marginTop: 1 }}>{row.value}</p>
                  </div>
                ))}
                {/* Route line */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 15 }}>{homeOpt ? homeOpt.flag : "🌐"}</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(184,137,42,0.35)", position: "relative" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 8 }}>✈️</div>
                  </div>
                  <span style={{ fontSize: 15 }}>{destOpt ? destOpt.flag : "🌐"}</span>
                </div>
              </div>
            </div>

            {/* MRZ strip — matches Passport tab */}
            <div style={{ borderTop: "1px solid rgba(21,101,168,0.07)", padding: "6px 18px 9px", background: "#EAF4FC" }}>
              <p style={{ fontSize: 6, fontFamily: MONO, color: "#7AA0C0", letterSpacing: "0.12em", lineHeight: 2 }}>P&lt;KGD&lt;YOUR&lt;NAME&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />MT0000010KGD0000000&lt;0000000&lt;0</p>
            </div>

            <PassportStampOverlay active={phase !== "idle"} done={phase === "done"} />
          </div>
        </motion.div>

        {/* Country selectors */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", fontFamily: SANS, color: "#0C1F35", textTransform: "uppercase", marginBottom: 2 }}>Your Trip</p>

          {/* From */}
          <motion.button onClick={() => setShowHomePicker(true)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, background: "#FFFFFF", border: homeOpt ? "1px solid rgba(12,31,53,0.08)" : "1.5px dashed rgba(12,31,53,0.14)", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(12,31,53,0.06)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(74,159,224,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {homeOpt ? <span style={{ fontSize: 22 }}>{homeOpt.flag}</span> : <MapPin size={16} style={{ color: "#4A9FE0" }} strokeWidth={1.8} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontFamily: SANS, color: "#A8B5C4", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Traveling from</p>
              <p style={{ fontSize: 14, fontFamily: SANS, color: homeOpt ? "#0C1F35" : "#A8B5C4", fontWeight: 600, marginTop: 2 }}>{homeOpt ? homeOpt.name : "Select your home country"}</p>
            </div>
            <ChevronDown size={15} style={{ color: "#A8B5C4", flexShrink: 0 }} />
          </motion.button>

          {/* To */}
          <motion.button onClick={() => setShowDestPicker(true)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, background: "#FFFFFF", border: destOpt ? "1px solid rgba(12,31,53,0.08)" : "1.5px dashed rgba(12,31,53,0.14)", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(12,31,53,0.06)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(124,168,138,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {destOpt ? <span style={{ fontSize: 22 }}>{destOpt.flag}</span> : <Globe size={16} style={{ color: "#7CA88A" }} strokeWidth={1.8} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontFamily: SANS, color: "#A8B5C4", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Mission destination</p>
              <p style={{ fontSize: 14, fontFamily: SANS, color: destOpt ? "#0C1F35" : "#A8B5C4", fontWeight: 600, marginTop: 2 }}>{destOpt ? destOpt.name : "Select your destination"}</p>
            </div>
            <ChevronDown size={15} style={{ color: "#A8B5C4", flexShrink: 0 }} />
          </motion.button>
        </motion.div>

        {/* Issue button */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.4 }} style={{ marginTop: 18, paddingBottom: 8 }}>
          <motion.button onClick={handleIssue} disabled={phase !== "idle"}
            style={{ width: "100%", padding: "16px 24px", borderRadius: 18, background: "#0C1F35", border: "none", cursor: phase !== "idle" ? "default" : "pointer", fontSize: 15, fontWeight: 600, fontFamily: SANS, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 32px rgba(12,31,53,0.3)", opacity: phase !== "idle" ? 0.6 : 1 }}
            whileHover={phase === "idle" ? { scale: 1.02 } : {}} whileTap={phase === "idle" ? { scale: 0.96 } : {}}
          >
            <Award size={16} strokeWidth={1.8} />
            {phase === "idle" ? "Issue Passport" : phase === "stamping" ? "Stamping…" : "Issued ✓"}
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPhotoPicker && <PhotoPickerSheet onSelect={(url) => { onPhotoChange(url); setShowPhotoPicker(false); }} onClose={() => setShowPhotoPicker(false)} />}
        {showHomePicker && <CountryPickerSheet title="Home Country" options={HOME_COUNTRIES} selected={homeCountry} onSelect={onHomeCountryChange} onClose={() => setShowHomePicker(false)} />}
        {showDestPicker && <CountryPickerSheet title="Mission Destination" options={DESTINATION_OPTIONS} selected={destination} onSelect={onDestinationChange} onClose={() => setShowDestPicker(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GATE CURRICULUM DATA
// ══════════════════════════════════════════════════════════════════════════════
interface ConvLine { word: string; romanization: string; english: string; mine: boolean }
interface GateData {
  title: string; subtitle: string; image: string; imageAlt: string;
  vocab: { word: string; romanization: string; english: string }[];
  conversation: ConvLine[]; convCaption: string;
  cultureTip: { emoji: string; body: string; bridge: string };
  missionTip: { body: string; sub: string };
  prayer: string;
}

const GATES_INDONESIA: GateData[] = [
  {
    title: "Salam! — Greetings", subtitle: "Making a warm first impression",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Bali temple gates at sunrise",
    vocab: [
      { word: "Halo", romanization: "hah-loh", english: "Hello" },
      { word: "Terima kasih", romanization: "teh-REE-mah KAH-see", english: "Thank you" },
      { word: "Tuhan", romanization: "TOO-hahn", english: "God / Lord" },
      { word: "Kasih", romanization: "KAH-see", english: "Love / Grace" },
      { word: "Yesus", romanization: "YEH-soos", english: "Jesus" },
    ],
    conversation: [
      { word: "Halo! Siapa nama Anda?", romanization: "Halo! Siapa nama Anda?", english: "Hello! What is your name?", mine: false },
      { word: "Nama saya [nama]. Senang bertemu Anda!", romanization: "Nama saya [nama]. Senang bertemu Anda!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]. Nice to meet you!"',
    cultureTip: { emoji: "🌺", body: "Greet with 'Selamat pagi / siang / malam' based on time of day. A warm smile and slightly bowed head communicate deep respect.", bridge: "Indonesian culture's warmth (ramah tamah) opens every door for the Gospel." },
    missionTip: { body: "Ask about family and community before sharing anything about yourself.", sub: "Indonesians are deeply communal. Being accepted by the community often precedes personal faith decisions." },
    prayer: '"Lord, give me a heart full of peace as I meet the people of Indonesia. May my presence reflect your love, and may many find you through our conversations."',
  },
  {
    title: "Berkenalan — Getting to Know You", subtitle: "Building trust through conversation",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Ubud rice terraces in Bali",
    vocab: [
      { word: "Keluarga", romanization: "keh-loo-AR-gah", english: "Family" },
      { word: "Pekerjaan", romanization: "peh-ker-JAH-ahn", english: "Work / Occupation" },
      { word: "Kampung", romanization: "KAHM-poong", english: "Village / Hometown" },
      { word: "Mimpi", romanization: "MEEM-pee", english: "Dream" },
      { word: "Teman", romanization: "TEH-mahn", english: "Friend" },
    ],
    conversation: [
      { word: "Apakah Anda punya keluarga di sini?", romanization: "Apakah Anda punya keluarga di sini?", english: "Do you have family here?", mine: false },
      { word: "Ya, saya punya dua anak.", romanization: "Ya, saya punya dua anak.", english: "Yes, I have two children.", mine: true },
      { word: "Apa mimpi Anda?", romanization: "Apa mimpi Anda?", english: "What is your dream?", mine: false },
    ],
    convCaption: '"Do you have family here?" · "Yes, two children." · "What is your dream?"',
    cultureTip: { emoji: "🍵", body: "Sharing teh manis (sweet tea) is a gesture of deep welcome. Receiving it graciously shows respect for the host.", bridge: "Sitting together over tea echoes the table fellowship Jesus used throughout his ministry." },
    missionTip: { body: "Remember names. Ask about parents, siblings, and the village — not just the individual.", sub: "Indonesian identity is rooted in community. Honor the community and the individual opens up." },
    prayer: '"Father, give me ears to hear what people carry beneath their words. Help me to be truly present — not in a hurry, not with an agenda, but with genuine love."',
  },
  {
    title: "Kosakata Iman — Faith Vocabulary", subtitle: "Words that open spiritual conversations",
    image: "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Borobudur temple at dawn",
    vocab: [
      { word: "Iman", romanization: "EE-mahn", english: "Faith / Belief" },
      { word: "Doa", romanization: "DOH-ah", english: "Prayer" },
      { word: "Damai sejahtera", romanization: "DAH-mai seh-jah-TEH-rah", english: "Peace / Shalom" },
      { word: "Harapan", romanization: "hah-RAH-pahn", english: "Hope" },
      { word: "Keselamatan", romanization: "keh-seh-lah-MAH-tahn", english: "Salvation" },
    ],
    conversation: [
      { word: "Apakah ada sesuatu yang Anda percayai?", romanization: "Apakah ada sesuatu yang Anda percayai?", english: "Is there something you believe in?", mine: false },
      { word: "Saya percaya pada Yesus. Dia memberi damai sejahtera.", romanization: "Saya percaya pada Yesus. Dia memberi damai sejahtera.", english: "I believe in Jesus. He gives peace.", mine: true },
    ],
    convCaption: '"Is there something you believe in?" · "I believe in Jesus — He gives peace."',
    cultureTip: { emoji: "🕌", body: "Indonesia is the world's largest Muslim-majority nation. Approach faith conversations with deep respect and genuine curiosity.", bridge: "Both Islam and Christianity value God's mercy. Begin with what is shared — and let love do the rest." },
    missionTip: { body: "Ask 'What do you think God is like?' before sharing what you believe.", sub: "In a high-respect culture, questions honor the person more than declarations." },
    prayer: '"Holy Spirit, go before me into every spiritual conversation. Give me the right words at the right time — and wisdom to stay silent when silence is needed."',
  },
  {
    title: "Kabar Baik — The Gospel", subtitle: "The heart of the mission",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Mount Bromo volcanic crater at sunrise",
    vocab: [
      { word: "Dosa", romanization: "DOH-sah", english: "Sin" },
      { word: "Pengampunan", romanization: "peng-ahm-POO-nahn", english: "Forgiveness" },
      { word: "Hidup", romanization: "HEE-doop", english: "Life" },
      { word: "Salib", romanization: "SAH-leeb", english: "Cross" },
      { word: "Kebangkitan", romanization: "keh-bahng-KEE-tahn", english: "Resurrection" },
    ],
    conversation: [
      { word: "Tuhan mengasihi Anda.", romanization: "Tuhan mengasihi Anda.", english: "God loves you.", mine: true },
      { word: "Benarkah? Bagaimana Anda tahu?", romanization: "Benarkah? Bagaimana Anda tahu?", english: "Really? How do you know?", mine: false },
      { word: "Yesus mati di salib untuk kita.", romanization: "Yesus mati di salib untuk kita.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you." · "Really? How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "✝️", body: "The concept of pengorbanan (sacrifice for others) resonates deeply in Indonesian culture — in family, community, and national history.", bridge: "The cross is not foreign to Indonesian hearts. Sacrificial love is already understood and honored." },
    missionTip: { body: "Share your personal testimony before doctrine. 'This is what changed my life' opens more hearts than systematic theology.", sub: "Personal stories bypass argument. They invite people into an experience rather than a debate." },
    prayer: '"Lord Jesus, give me courage to speak your name clearly and lovingly. May the seeds we plant be watered by your Spirit long after we leave."',
  },
  {
    title: "Berdoa Bersama — Praying Together", subtitle: "Inviting people into God's presence",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Bali rice fields at golden hour",
    vocab: [
      { word: "Bersama", romanization: "ber-SAH-mah", english: "Together" },
      { word: "Berkat", romanization: "BER-kaht", english: "Blessing" },
      { word: "Kesembuhan", romanization: "keh-sem-BOO-hahn", english: "Healing" },
      { word: "Syukur", romanization: "SHOO-koor", english: "Gratitude / Thanksgiving" },
      { word: "Amin", romanization: "AH-min", english: "Amen" },
    ],
    conversation: [
      { word: "Boleh saya mendoakan Anda?", romanization: "Boleh saya mendoakan Anda?", english: "May I pray for you?", mine: true },
      { word: "…Ya, silakan.", romanization: "…Ya, silakan.", english: "…Yes, please.", mine: false },
      { word: "Tuhan, berkatilah orang ini. Amin.", romanization: "Tuhan, berkatilah orang ini. Amin.", english: "God, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes, please." · "God, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer is deeply normal in Indonesian culture across all faiths. Offering to pray is rarely refused — it is seen as an act of genuine care.", bridge: "This openness to prayer is a gift. Use it with sincerity, not as a strategy." },
    missionTip: { body: "Pray in Bahasa Indonesia when possible — even imperfectly. The effort itself communicates love.", sub: "A prayer in someone's language says: 'I came here for you, not for myself.'" },
    prayer: '"Spirit of God, make me a channel of your healing today. When I pray for others, may they feel not just words — but your very presence with them."',
  },
  {
    title: "Keramahtamahan — Hospitality", subtitle: "The table as a place of grace",
    image: "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Indonesian street food market at night",
    vocab: [
      { word: "Selamat makan", romanization: "seh-LAH-maht MAH-kahn", english: "Enjoy your meal" },
      { word: "Enak", romanization: "EH-nahk", english: "Delicious" },
      { word: "Teh manis", romanization: "teh MAH-nees", english: "Sweet tea" },
      { word: "Undangan", romanization: "oon-DAHNG-ahn", english: "Invitation" },
      { word: "Gotong royong", romanization: "GOH-tong ROH-yong", english: "Community helping together" },
    ],
    conversation: [
      { word: "Maukah kita minum teh bersama?", romanization: "Maukah kita minum teh bersama?", english: "Would you like to have tea together?", mine: true },
      { word: "Tentu! Terima kasih.", romanization: "Tentu! Terima kasih.", english: "Of course! Thank you.", mine: false },
      { word: "Boleh saya berdoa syukur sebelum makan?", romanization: "Boleh saya berdoa syukur sebelum makan?", english: "May I say a prayer of thanks before we eat?", mine: true },
    ],
    convCaption: '"Tea together?" · "Of course!" · "May I say a prayer of thanks?"',
    cultureTip: { emoji: "🍚", body: "Nasi (rice) at the table is sacred. To be invited to eat together is to be accepted as family — makan bersama is communion.", bridge: "Jesus transformed the table into the most powerful place for the Kingdom. So can we." },
    missionTip: { body: "Never rush a shared meal. Linger. Ask for seconds. Ask what the dish means to the family.", sub: "Food carries stories. Honoring the food is honoring the people who prepared it." },
    prayer: '"Lord, thank you for every shared meal, every cup of tea, every moment of welcome. May the joy we share at the table be a foretaste of your eternal feast."',
  },
  {
    title: "Sampai Jumpa — Farewell", subtitle: "Sending people forward with hope",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Bali ocean cliff at sunset",
    vocab: [
      { word: "Sampai jumpa lagi", romanization: "sahm-PAI JOOM-pah LAH-gee", english: "See you again" },
      { word: "Hati-hati", romanization: "HAH-tee HAH-tee", english: "Take care" },
      { word: "Berkat Tuhan", romanization: "BER-kaht TOO-hahn", english: "God's blessing upon you" },
      { word: "Tidak akan lupa", romanization: "TEE-dahk AH-kahn LOO-pah", english: "I won't forget you" },
      { word: "Reuni", romanization: "reh-OO-nee", english: "Reunion" },
    ],
    conversation: [
      { word: "Saya sangat senang bisa berbicara dengan Anda.", romanization: "Saya sangat senang bisa berbicara dengan Anda.", english: "I'm so glad I got to talk with you.", mine: true },
      { word: "Saya juga. Bisakah kita bertemu lagi?", romanization: "Saya juga. Bisakah kita bertemu lagi?", english: "Me too. Can we meet again?", mine: false },
      { word: "Tuhan selalu mengingatmu. Sampai jumpa lagi!", romanization: "Tuhan selalu mengingatmu. Sampai jumpa lagi!", english: "God always remembers you. See you again!", mine: true },
    ],
    convCaption: '"I\'m glad I met you." · "Can we meet again?" · "God always remembers you."',
    cultureTip: { emoji: "🌅", body: "Indonesian goodbyes are warm and extended. To leave quickly implies the relationship wasn't important. Stay present until the very end.", bridge: "A slow, loving goodbye plants seeds of longing — and points toward the ultimate reunion." },
    missionTip: { body: "Speak a specific blessing over each person before you leave. Name something you genuinely saw in them.", sub: "'The way you love your family reflects God's heart' lands differently than a generic blessing." },
    prayer: '"Father, into your hands I release every person I met in Indonesia. You knew them before I arrived and you will be with them long after I leave. Continue the good work you began."',
  },
];

const GATES_JAPAN: GateData[] = [
  {
    title: "こんにちは — Greetings", subtitle: "Opening words, opening hearts",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Cherry blossoms in Tokyo",
    vocab: [
      { word: "こんにちは", romanization: "Konnichiwa", english: "Hello" },
      { word: "ありがとう", romanization: "Arigatou", english: "Thank you" },
      { word: "神様", romanization: "Kami-sama", english: "God / Lord" },
      { word: "愛", romanization: "Ai", english: "Love" },
      { word: "イエス様", romanization: "Iesu-sama", english: "Lord Jesus" },
    ],
    conversation: [
      { word: "こんにちは！お名前は？", romanization: "Konnichiwa! Onamae wa?", english: "Hello! What is your name?", mine: false },
      { word: "私の名前は[名前]です。はじめまして！", romanization: "Watashi no namae wa [namae] desu. Hajimemashite!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]. Nice to meet you!"',
    cultureTip: { emoji: "🌸", body: "Bow slightly when greeting — the deeper the bow, the more respect shown. Business cards are received with two hands and a bow.", bridge: "Respect and humility are already woven into Japanese culture. They prepare the heart to receive grace." },
    missionTip: { body: "Earn the right to be heard through consistency. Japanese trust is built slowly, through repeated actions over time.", sub: "One month of faithful presence often opens more doors than one week of bold proclamation." },
    prayer: '"Lord, give me patience and perseverance. Let my presence in Japan reflect your steadfast, unhurrying love — the kind that never gives up on anyone."',
  },
  {
    title: "よく知る — Getting to Know You", subtitle: "Building trust through presence",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Traditional Japanese shrine pathway",
    vocab: [
      { word: "家族", romanization: "Kazoku", english: "Family" },
      { word: "仕事", romanization: "Shigoto", english: "Work / Job" },
      { word: "故郷", romanization: "Furusato", english: "Hometown / Origin" },
      { word: "夢", romanization: "Yume", english: "Dream" },
      { word: "友達", romanization: "Tomodachi", english: "Friend" },
    ],
    conversation: [
      { word: "ご家族はいらっしゃいますか？", romanization: "Gokazoku wa irasshaimasu ka?", english: "Do you have family?", mine: false },
      { word: "はい、妻と子供が二人います。", romanization: "Hai, tsuma to kodomo ga futari imasu.", english: "Yes, a wife and two children.", mine: true },
      { word: "夢は何ですか？", romanization: "Yume wa nan desu ka?", english: "What is your dream?", mine: false },
    ],
    convCaption: '"Do you have family?" · "A wife and two children." · "What is your dream?"',
    cultureTip: { emoji: "🍵", body: "Sharing ocha (green tea) is an act of quiet intimacy. Silence at the table is not awkward — it means you are comfortable together.", bridge: "Japanese tea culture is a form of presence without agenda. This is how Jesus often connected." },
    missionTip: { body: "Ask about someone's work and listen with genuine interest — work is central to Japanese identity.", sub: "When someone feels heard in what they do, they trust you with who they are." },
    prayer: '"Father, help me to be genuinely interested in every person I meet in Japan. Give me curiosity as a spiritual discipline, not a technique."',
  },
  {
    title: "信仰の言葉 — Faith Vocabulary", subtitle: "Words that bridge the spiritual gap",
    image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Torii gate reflection at sunset",
    vocab: [
      { word: "信仰", romanization: "Shinkou", english: "Faith / Belief" },
      { word: "祈り", romanization: "Inori", english: "Prayer" },
      { word: "平和", romanization: "Heiwa", english: "Peace" },
      { word: "希望", romanization: "Kibou", english: "Hope" },
      { word: "救い", romanization: "Sukui", english: "Salvation / Rescue" },
    ],
    conversation: [
      { word: "何か信じていることはありますか？", romanization: "Nanika shinjite iru koto wa arimasu ka?", english: "Is there something you believe in?", mine: false },
      { word: "イエスを信じています。彼は平和をくださいます。", romanization: "Iesu wo shinjite imasu. Kare wa heiwa wo kudasaimasu.", english: "I believe in Jesus. He gives peace.", mine: true },
    ],
    convCaption: '"Is there something you believe in?" · "I believe in Jesus — He gives peace."',
    cultureTip: { emoji: "⛩️", body: "Japan has many faiths layered together — Shinto, Buddhism, folk religion. Most Japanese are spiritual but not exclusive to one path.", bridge: "Asking 'what brings you peace?' is a more natural entry into spiritual conversation than 'do you believe in God?'" },
    missionTip: { body: "Use the word 平和 (heiwa, peace) as a bridge. Everyone in Japan recognizes and longs for it.", sub: "Post-war Japan carries a deep cultural memory of both tragedy and the longing for lasting peace." },
    prayer: '"Prince of Peace, go before me into every spiritual conversation. May the peace you give be visible in me before it is ever spoken by me."',
  },
  {
    title: "福音 — Sharing the Gospel", subtitle: "The message that changes everything",
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Mount Fuji at sunrise",
    vocab: [
      { word: "罪", romanization: "Tsumi", english: "Sin" },
      { word: "赦し", romanization: "Yurushi", english: "Forgiveness" },
      { word: "命", romanization: "Inochi", english: "Life" },
      { word: "十字架", romanization: "Juujika", english: "Cross" },
      { word: "復活", romanization: "Fukkatsu", english: "Resurrection" },
    ],
    conversation: [
      { word: "神様はあなたを愛しています。", romanization: "Kami-sama wa anata wo ai shite imasu.", english: "God loves you.", mine: true },
      { word: "本当ですか？どうしてわかりますか？", romanization: "Hontou desu ka? Doushite wakarimasu ka?", english: "Really? How do you know?", mine: false },
      { word: "イエスは私たちのために十字架で死なれました。", romanization: "Iesu wa watashitachi no tame ni juujika de shinaremashita.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you." · "Really, how do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "🌿", body: "The concept of on (debt of gratitude) is central to Japanese culture. The idea that someone died in our place resonates with this cultural understanding.", bridge: "On can become a doorway: 'Have you ever owed someone a debt you could never repay? Jesus already paid that debt for you.'" },
    missionTip: { body: "Use story over argument. The Gospel as a narrative lands far better than the Gospel as a proposition in Japan.", sub: "Japanese culture values subtlety and implication. Plant seeds gently — trust the Spirit to water them." },
    prayer: '"Lord Jesus, may the beauty of your sacrifice speak where my words cannot. Let the story of the cross find its way into every heart I touch in Japan."',
  },
  {
    title: "共に祈る — Praying Together", subtitle: "Offering what only God can give",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Traditional Japanese garden with still water",
    vocab: [
      { word: "一緒に", romanization: "Issho ni", english: "Together" },
      { word: "祝福", romanization: "Shukufuku", english: "Blessing" },
      { word: "癒し", romanization: "Iyashi", english: "Healing" },
      { word: "感謝", romanization: "Kansha", english: "Gratitude" },
      { word: "アーメン", romanization: "Āmen", english: "Amen" },
    ],
    conversation: [
      { word: "一緒にお祈りしてもいいですか？", romanization: "Issho ni oInori shite mo ii desu ka?", english: "May I pray with you?", mine: true },
      { word: "…はい、お願いします。", romanization: "…Hai, onegai shimasu.", english: "…Yes, please.", mine: false },
      { word: "神様、この方を祝福してください。アーメン。", romanization: "Kami-sama, kono kata wo shukufuku shite kudasai. Āmen.", english: "God, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray with you?" · "Yes, please." · "God, bless this person. Amen."',
    cultureTip: { emoji: "🕯️", body: "Prayer may be unfamiliar in the Christian sense, but the act of closing your eyes and being still is familiar from Buddhist tradition. Explain gently before praying.", bridge: "Saying 'I would like to speak to God about you' is both unusual and deeply touching in Japanese culture." },
    missionTip: { body: "Pray short prayers — two to three sentences. Long prayers can feel performative in Japanese culture.", sub: "A quiet, specific prayer for something a person just shared will be remembered for years." },
    prayer: '"Spirit of God, let every prayer I pray in Japan be a small window — and may people glimpse your light through it."',
  },
  {
    title: "おもてなし — Hospitality", subtitle: "Loving through food and presence",
    image: "https://images.unsplash.com/photo-1504204267155-aaad8e81290d?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Japanese market with fresh food",
    vocab: [
      { word: "いただきます", romanization: "Itadakimasu", english: "Let's receive / Grace before meals" },
      { word: "美味しい", romanization: "Oishii", english: "Delicious" },
      { word: "お茶", romanization: "Ocha", english: "Green tea" },
      { word: "招待", romanization: "Shoutai", english: "Invitation" },
      { word: "おもてなし", romanization: "Omotenashi", english: "Selfless hospitality" },
    ],
    conversation: [
      { word: "一緒にお茶を飲みませんか？", romanization: "Issho ni ocha wo nomimasen ka?", english: "Would you like to have tea together?", mine: true },
      { word: "ぜひ！ありがとうございます。", romanization: "Zehi! Arigatou gozaimasu.", english: "I'd love to! Thank you.", mine: false },
      { word: "食事の前に感謝の祈りをしてもいいですか？", romanization: "Shokuji no mae ni kansha no inori wo shite mo ii desu ka?", english: "May I say a prayer of thanks before we eat?", mine: true },
    ],
    convCaption: '"Tea together?" · "I\'d love to!" · "May I say a prayer of thanks before we eat?"',
    cultureTip: { emoji: "🍱", body: "Omotenashi means wholehearted hospitality — anticipating needs before they are expressed. It is considered one of Japan's greatest cultural gifts.", bridge: "Omotenashi is a reflection of God's character: selfless, attentive, never keeping score." },
    missionTip: { body: "Receive hospitality as generously as you give it. In Japan, refusing a gift or refusing to be served is a form of rejection.", sub: "Allowing someone to serve you honors their dignity. Jesus modeled this when he received the woman's offering." },
    prayer: '"Lord, thank you for the gift of Japanese hospitality. May every shared meal be a moment where you are the unseen guest — present, welcome, and recognized."',
  },
  {
    title: "さようなら — Farewell", subtitle: "Leaving a lasting blessing",
    image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Torii gate at sunset in Japan",
    vocab: [
      { word: "またね", romanization: "Mata ne", english: "See you again (casual)" },
      { word: "気をつけて", romanization: "Ki wo tsukete", english: "Take care" },
      { word: "神の祝福を", romanization: "Kami no shukufuku wo", english: "God's blessing upon you" },
      { word: "忘れません", romanization: "Wasuremasen", english: "I won't forget you" },
      { word: "再会", romanization: "Saikai", english: "Reunion" },
    ],
    conversation: [
      { word: "一緒に過ごせて、本当に嬉しかったです。", romanization: "Issho ni sugosete, hontou ni ureshikatta desu.", english: "I'm truly glad I got to spend this time with you.", mine: true },
      { word: "私もです。また会えますか？", romanization: "Watashi mo desu. Mata aemasu ka?", english: "Me too. Will we meet again?", mine: false },
      { word: "神様はいつもあなたを覚えています。またね！", romanization: "Kami-sama wa itsumo anata wo oboete imasu. Mata ne!", english: "God always remembers you. See you again!", mine: true },
    ],
    convCaption: '"Glad to spend this time with you." · "Will we meet again?" · "God always remembers you."',
    cultureTip: { emoji: "🌸", body: "Japanese farewells are measured and meaningful. Waving until someone is out of sight is common — it shows the relationship mattered.", bridge: "The Japanese word for reunion, 再会 (saikai), carries a sense of destiny. Point it toward eternity." },
    missionTip: { body: "Write a short handwritten note before leaving. Japanese culture highly values written communication as an expression of care.", sub: "A note that says 'I will pray for you' and is signed by name will often be kept for years." },
    prayer: '"Father, into your hands I release every person I met in Japan. You are not limited by distance or time. What we began together, you will complete."',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Mission Board
// ══════════════════════════════════════════════════════════════════════════════
const GATES_INDIA: GateData[] = [
  {
    title: "नमस्ते — Greetings", subtitle: "Welcoming with folded hands",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Colorful streets of India",
    vocab: [
      { word: "नमस्ते", romanization: "Namaste", english: "Hello / I bow to you" },
      { word: "धन्यवाद", romanization: "Dhanyavaad", english: "Thank you" },
      { word: "भगवान", romanization: "Bhagwaan", english: "God / Lord" },
      { word: "प्रेम", romanization: "Prem", english: "Love" },
      { word: "यीशु", romanization: "Yeesu", english: "Jesus" },
    ],
    conversation: [
      { word: "नमस्ते! आपका नाम क्या है?", romanization: "Namaste! Aapka naam kya hai?", english: "Hello! What is your name?", mine: false },
      { word: "मेरा नाम [नाम] है। आपसे मिलकर खुशी हुई!", romanization: "Mera naam [naam] hai. Aapse milkar khushi hui!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]. Nice to meet you!"',
    cultureTip: { emoji: "🙏", body: "Namaste — palms together with a slight bow — is one of the world's most beautiful greetings. It means 'the divine in me honors the divine in you.'", bridge: "Every namaste is an acknowledgment that God is present. Begin there." },
    missionTip: { body: "Sit at the same level as those you meet. In India, getting down to someone's level — literally — communicates profound respect.", sub: "Jesus sat with sinners, tax collectors, and the sick. Posture of humility opens every door." },
    prayer: '"Lord, as I greet the people of India, may every namaste I give be genuine — may they feel seen, honored, and loved. Let your presence begin before I speak a word."',
  },
  {
    title: "परिचय — Getting to Know You", subtitle: "Building bonds through story",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Vibrant Indian bazaar",
    vocab: [
      { word: "परिवार", romanization: "Parivaar", english: "Family" },
      { word: "काम", romanization: "Kaam", english: "Work / Livelihood" },
      { word: "गाँव", romanization: "Gaanv", english: "Village / Hometown" },
      { word: "सपना", romanization: "Sapna", english: "Dream" },
      { word: "दोस्त", romanization: "Dost", english: "Friend" },
    ],
    conversation: [
      { word: "आपका परिवार यहाँ है?", romanization: "Aapka parivaar yahaan hai?", english: "Is your family here?", mine: false },
      { word: "हाँ, मेरे दो बच्चे हैं।", romanization: "Haan, mere do bachche hain.", english: "Yes, I have two children.", mine: true },
      { word: "आपका सपना क्या है?", romanization: "Aapka sapna kya hai?", english: "What is your dream?", mine: false },
    ],
    convCaption: '"Is your family here?" · "Yes, two children." · "What is your dream?"',
    cultureTip: { emoji: "🍵", body: "Chai is India's love language. Being offered a cup of tea means you are welcome. Drink it slowly. Refuse it and you refuse the relationship.", bridge: "Sharing chai is one of the most natural ways to turn a stranger into a brother." },
    missionTip: { body: "Ask about the village and caste background gently — these shape identity and can affect how the Gospel is received in community contexts.", sub: "Understanding where someone comes from helps you honor their dignity rather than overlook their context." },
    prayer: '"Father, give me genuine curiosity about every person I meet in India. Help me to listen not just to their words, but to their story — the whole of it."',
  },
  {
    title: "विश्वास की भाषा — Faith Vocabulary", subtitle: "Words that cross every border",
    image: "https://images.unsplash.com/photo-1561361058-c24e013bca3a?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Varanasi ghats at sunrise",
    vocab: [
      { word: "विश्वास", romanization: "Vishwaas", english: "Faith / Trust" },
      { word: "प्रार्थना", romanization: "Praarthana", english: "Prayer" },
      { word: "शांति", romanization: "Shaanti", english: "Peace" },
      { word: "आशा", romanization: "Aasha", english: "Hope" },
      { word: "मुक्ति", romanization: "Mukti", english: "Salvation / Liberation" },
    ],
    conversation: [
      { word: "आप किस पर विश्वास करते हैं?", romanization: "Aap kis par vishwaas karte hain?", english: "What do you believe in?", mine: false },
      { word: "मैं यीशु पर विश्वास करता हूँ। वो शांति देते हैं।", romanization: "Main Yeesu par vishwaas karta hoon. Vo shaanti dete hain.", english: "I believe in Jesus. He gives peace.", mine: true },
    ],
    convCaption: '"What do you believe in?" · "I believe in Jesus — He gives peace."',
    cultureTip: { emoji: "🪔", body: "India is the birthplace of four world religions. Spiritual conversation is completely natural — Indians talk about God, karma, dharma, and liberation openly.", bridge: "Mukti (liberation/salvation) is a concept every Hindu and Buddhist understands. Start there — not with sin management, but with freedom." },
    missionTip: { body: "Use the word mukti over 'salvation' — it carries the same meaning but lands inside the Indian spiritual framework.", sub: "When you speak someone's language — spiritually and linguistically — you invite rather than impose." },
    prayer: '"Holy Spirit, give me wisdom to speak about Jesus in ways that resonate with Indian hearts. You were in India before I arrived. Show me where you are already at work."',
  },
  {
    title: "सुसमाचार — The Gospel", subtitle: "The good news for every nation",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Golden sunrise over Indian landscape",
    vocab: [
      { word: "पाप", romanization: "Paap", english: "Sin" },
      { word: "क्षमा", romanization: "Kshama", english: "Forgiveness" },
      { word: "जीवन", romanization: "Jeevan", english: "Life" },
      { word: "क्रूस", romanization: "Kroos", english: "Cross" },
      { word: "पुनरुत्थान", romanization: "Punarutthan", english: "Resurrection" },
    ],
    conversation: [
      { word: "परमेश्वर आपसे प्रेम करते हैं।", romanization: "Parmeshwar aapse prem karte hain.", english: "God loves you.", mine: true },
      { word: "सच में? आपको कैसे पता?", romanization: "Sach mein? Aapko kaise pata?", english: "Really? How do you know?", mine: false },
      { word: "यीशु हमारे लिए क्रूस पर मरे।", romanization: "Yeesu hamare liye kroos par mare.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you." · "Really? How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "✝️", body: "The concept of a God who dies for humanity is radical in every religion — but it maps powerfully onto the bhakti tradition's idea of a God who comes near out of love.", bridge: "In bhakti, the devotee longs to be near God. In the Gospel, God bridges the gap himself. That is the surprise." },
    missionTip: { body: "Tell your own story of how Jesus changed you before explaining theology. Indians respond to transformation narratives — they understand that reality changes people.", sub: "Testimony is your most powerful tool in a culture that respects experience over argument." },
    prayer: '"Jesus, give me boldness to speak your name in India — gently, clearly, and with love. May every seed planted in this soil bear fruit in your time, not mine."',
  },
  {
    title: "मिलकर प्रार्थना — Praying Together", subtitle: "Offering what only heaven can give",
    image: "https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Peaceful temple by the water in India",
    vocab: [
      { word: "साथ", romanization: "Saath", english: "Together" },
      { word: "आशीष", romanization: "Aasheesh", english: "Blessing" },
      { word: "चंगाई", romanization: "Changaai", english: "Healing" },
      { word: "धन्यवाद", romanization: "Dhanyavaad", english: "Gratitude" },
      { word: "आमेन", romanization: "Aamen", english: "Amen" },
    ],
    conversation: [
      { word: "क्या मैं आपके लिए प्रार्थना कर सकता हूँ?", romanization: "Kya main aapke liye praarthana kar sakta hoon?", english: "May I pray for you?", mine: true },
      { word: "...हाँ, ज़रूर।", romanization: "...Haan, zaroor.", english: "...Yes, of course.", mine: false },
      { word: "प्रभु, इस व्यक्ति को आशीष दीजिए। आमेन।", romanization: "Prabhu, is vyakti ko aasheesh deejiye. Aamen.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes, of course." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer and blessing are deeply woven into Indian life. Elders bless children daily. Priests bless food. Asking to pray for someone is an act of honor.", bridge: "When you offer to pray in Jesus' name, you are entering an ancient spiritual current — redirect it toward its source." },
    missionTip: { body: "If someone is sick or in pain, ask to pray for healing specifically. India has a rich history of God healing through prayer — expect the unexpected.", sub: "Healing prayer opens conversations that theological debate never could." },
    prayer: '"Spirit of God, move powerfully in India. Let signs and wonders accompany the Word. May every prayer I pray be a demonstration that Jesus is alive and present today."',
  },
  {
    title: "आतिथ्य — Hospitality", subtitle: "Guest is God — Atithi Devo Bhava",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Indian chai and street food",
    vocab: [
      { word: "खाना खाइए", romanization: "Khaana Khaiye", english: "Please eat / Come eat" },
      { word: "स्वादिष्ट", romanization: "Svaadisht", english: "Delicious" },
      { word: "चाय", romanization: "Chaai", english: "Tea" },
      { word: "निमंत्रण", romanization: "Nimantran", english: "Invitation" },
      { word: "अतिथि देवो भव", romanization: "Atithi Devo Bhava", english: "Guest is God" },
    ],
    conversation: [
      { word: "क्या हम साथ चाय पी सकते हैं?", romanization: "Kya hum saath chaai pee sakte hain?", english: "Can we have chai together?", mine: true },
      { word: "बिल्कुल! आइए!", romanization: "Bilkul! Aaiye!", english: "Absolutely! Come!", mine: false },
      { word: "खाने से पहले धन्यवाद की प्रार्थना करूँ?", romanization: "Khaane se pehle dhanyavaad ki praarthana karoon?", english: "May I say a prayer of thanks before we eat?", mine: true },
    ],
    convCaption: '"Chai together?" · "Absolutely, come!" · "May I say a prayer of thanks?"',
    cultureTip: { emoji: "🫖", body: "Atithi Devo Bhava — 'the guest is God' — is one of India's oldest values. You will likely be served more than you can eat. Receive it with gratitude.", bridge: "This ancient hospitality law was meant to honor God through the stranger. Tell them the story behind it — that Jesus himself came as a stranger." },
    missionTip: { body: "Accept every food offered, even if unfamiliar. Refusing food in India is refusing love.", sub: "Paul said he became 'all things to all people.' At the Indian table, that begins with saying yes to the food." },
    prayer: '"Lord, thank you for the extraordinary generosity of the Indian people. May every meal shared become holy ground — a place where you are recognized as the host of all hosts."',
  },
  {
    title: "विदाई — Farewell", subtitle: "Leaving a blessing that stays",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Taj Mahal at golden hour",
    vocab: [
      { word: "फिर मिलेंगे", romanization: "Phir Milenge", english: "We will meet again" },
      { word: "ध्यान रखना", romanization: "Dhyaan Rakhna", english: "Take care of yourself" },
      { word: "ईश्वर का आशीर्वाद", romanization: "Ishwar ka Aashirvaad", english: "God's blessing upon you" },
      { word: "नहीं भूलूंगा", romanization: "Nahi Bhoolunga", english: "I will not forget you" },
      { word: "पुनर्मिलन", romanization: "Punarmilan", english: "Reunion" },
    ],
    conversation: [
      { word: "आपसे मिलकर बहुत अच्छा लगा।", romanization: "Aapse milkar bahut achha laga.", english: "It was so good to meet you.", mine: true },
      { word: "मुझे भी। क्या हम फिर मिल सकते हैं?", romanization: "Mujhe bhi. Kya hum phir mil sakte hain?", english: "Me too. Can we meet again?", mine: false },
      { word: "परमेश्वर हमेशा आपको याद रखते हैं। फिर मिलेंगे!", romanization: "Parmeshwar hamesha aapko yaad rakhte hain. Phir milenge!", english: "God always remembers you. We will meet again!", mine: true },
    ],
    convCaption: '"So good to meet you." · "Can we meet again?" · "God always remembers you."',
    cultureTip: { emoji: "🌅", body: "Indian goodbyes can last a long time — walking someone to the gate, the street, the corner. Rushing a goodbye is rude. The farewell itself is part of the relationship.", bridge: "A goodbye that takes time says: this relationship matters. That is the Gospel in action." },
    missionTip: { body: "Speak a specific blessing over each person. In Hindi culture, the blessing of an elder or a holy person is treasured. You carry that authority.", sub: "'May God's peace follow you every day' — spoken with sincerity — will be remembered long after you leave." },
    prayer: '"Father, I release every person I met in India into your hands. You love them more than I do. Continue the work you began — in your time, in your way, by your Spirit."',
  },
];

const MISSION_META = {
  indonesia: { flag: "🇮🇩", country: "Indonesia", name: "Nusantara Mission", lang: "Bahasa Indonesia", heroImg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=380&fit=crop&auto=format", gates: GATES_INDONESIA, speechLang: "id-ID" },
  japan:     { flag: "🇯🇵", country: "Japan",     name: "Sakura Mission",    lang: "日本語",           heroImg: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=700&h=380&fit=crop&auto=format", gates: GATES_JAPAN,     speechLang: "ja-JP" },
  india:     { flag: "🇮🇳", country: "India",     name: "Bharat Mission",    lang: "हिंदी",            heroImg: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=380&fit=crop&auto=format", gates: GATES_INDIA,     speechLang: "hi-IN" },
};

// ══════════════════════════════════════════════════════════════════════════════
// TOOL — 사영리 (Four Spiritual Laws)
// ══════════════════════════════════════════════════════════════════════════════
type LawLang = "ko" | "en" | "id" | "ja" | "hi";

interface FourLaw {
  num: string;
  color: string;
  lightColor: string;
  emoji: string;
  title: Record<LawLang, string>;
  verses: { ref: string; text: Record<LawLang, string> }[];
  tip: Record<LawLang, string>;
  prayer?: Record<LawLang, string>;
}

const FOUR_LAWS_DATA: FourLaw[] = [
  {
    num: "01",
    color: "#3B6FE0",
    lightColor: "#EEF3FF",
    emoji: "❤️",
    title: {
      ko: "하나님은 당신을 사랑하시며\n당신의 삶에 놀라운 계획을\n갖고 계십니다",
      en: "God loves you and has a wonderful plan for your life",
      id: "Allah mengasihi Anda dan memiliki rencana yang indah bagi hidup Anda",
      ja: "神はあなたを愛し、あなたの人生に素晴らしい計画を持っておられます",
      hi: "परमेश्वर आपसे प्रेम करते हैं और आपके जीवन के लिए एक अद्भुत योजना रखते हैं",
    },
    verses: [
      {
        ref: "요한복음 3:16",
        text: {
          ko: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
          en: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
          id: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.",
          ja: "神は、実に、そのひとり子をお与えになったほどに世を愛された。それは御子を信じる者が、一人として滅びることなく、永遠のいのちを持つためである。",
          hi: "क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे वह नष्ट न हो, बल्कि अनन्त जीवन पाए।",
        },
      },
      {
        ref: "요한복음 10:10",
        text: {
          ko: "내가 온 것은 양으로 생명을 얻게 하고 더 풍성히 얻게 하려는 것이라",
          en: "I have come that they may have life, and have it to the full.",
          id: "Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan.",
          ja: "わたしが来たのは、羊がいのちを得るため、それも豊かに得るためです。",
          hi: "मैं इसलिए आया कि वे जीवन पाएं और उसे भरपूरी से पाएं।",
        },
      },
    ],
    tip: {
      ko: "하나님의 사랑은 조건 없습니다. 당신이 어디 있든, 무엇을 했든 — 그분의 계획은 당신을 향해 있습니다.",
      en: "God's love is unconditional. Wherever you are, whatever you've done — His plan is for you.",
      id: "Kasih Allah tidak bersyarat. Di mana pun Anda berada — rencana-Nya adalah untuk Anda.",
      ja: "神の愛は無条件です。あなたがどこにいても — 神の計画はあなたのためにあります。",
      hi: "परमेश्वर का प्रेम बिना शर्त है। आप जहाँ भी हों — उनकी योजना आपके लिए है।",
    },
  },
  {
    num: "02",
    color: "#C4423A",
    lightColor: "#FFF0EF",
    emoji: "⛓️",
    title: {
      ko: "인간은 죄를 범하였고\n하나님과 단절되어 있습니다",
      en: "Man is sinful and separated from God",
      id: "Manusia telah berdosa dan terpisah dari Allah",
      ja: "人は罪を犯し、神から離れています",
      hi: "मनुष्य पापी है और परमेश्वर से अलग है",
    },
    verses: [
      {
        ref: "로마서 3:23",
        text: {
          ko: "모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니",
          en: "For all have sinned and fall short of the glory of God.",
          id: "Karena semua orang telah berbuat dosa dan telah kehilangan kemuliaan Allah.",
          ja: "すべての人は罪を犯したので、神の栄光を受けることができず、",
          hi: "क्योंकि सभी ने पाप किया है और परमेश्वर की महिमा से रहित हैं।",
        },
      },
      {
        ref: "로마서 6:23",
        text: {
          ko: "죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라",
          en: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.",
          id: "Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita.",
          ja: "罪の報酬は死です。しかし神の賜物は、私たちの主キリスト・イエスにある永遠のいのちです。",
          hi: "क्योंकि पाप की मजदूरी मृत्यु है, परन्तु परमेश्वर का वरदान हमारे प्रभु मसीह यीशु में अनन्त जीवन है।",
        },
      },
    ],
    tip: {
      ko: "죄는 단순한 '나쁜 행동'이 아니라 하나님과의 관계가 끊어진 상태입니다. 이 단절이 인생의 공허함의 근원입니다.",
      en: "Sin is not merely 'bad behavior' — it is a broken relationship with God. This separation is the source of life's emptiness.",
      id: "Dosa bukan sekadar 'perilaku buruk' — melainkan hubungan yang terputus dengan Allah. Keterpisahan inilah sumber kekosongan hidup.",
      ja: "罪は単なる「悪い行い」ではなく、神との関係が断たれた状態です。この断絶が人生の虚しさの根源です。",
      hi: "पाप केवल 'बुरा व्यवहार' नहीं है — यह परमेश्वर के साथ टूटा हुआ रिश्ता है। यह अलगाव ही जीवन की रिक्तता का कारण है।",
    },
  },
  {
    num: "03",
    color: "#2A8A5C",
    lightColor: "#EDFAF3",
    emoji: "✝️",
    title: {
      ko: "예수 그리스도만이 인간의 죄에 대한\n하나님의 유일한 해결책입니다",
      en: "Jesus Christ is God's only provision for man's sin",
      id: "Yesus Kristus adalah satu-satunya jalan yang disediakan Allah",
      ja: "イエス・キリストだけが、人間の罪に対する神の唯一の解決策です",
      hi: "यीशु मसीह ही मनुष्य के पाप के लिए परमेश्वर का एकमात्र प्रावधान है",
    },
    verses: [
      {
        ref: "로마서 5:8",
        text: {
          ko: "우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에 대한 자기의 사랑을 확증하셨느니라",
          en: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
          id: "Akan tetapi Allah menunjukkan kasih-Nya kepada kita, oleh karena Kristus telah mati untuk kita, ketika kita masih berdosa.",
          ja: "しかし私たちがまだ罪人であったとき、キリストが私たちのために死んでくださったことで、神は私たちに対するご自身の愛を示されました。",
          hi: "परन्तु परमेश्वर हमारे प्रति अपने प्रेम को इस रीति से प्रकट करता है, कि जब हम पापी ही थे तभी मसीह हमारे लिए मरा।",
        },
      },
      {
        ref: "요한복음 14:6",
        text: {
          ko: "예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라",
          en: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
          id: "Kata Yesus kepadanya: 'Akulah jalan dan kebenaran dan hidup. Tidak ada seorangpun yang datang kepada Bapa, kalau tidak melalui Aku.'",
          ja: "イエスは彼に言われた。「わたしは道であり、真理であり、いのちです。わたしを通してでなければ、だれも父のみもとに来ることはできません。」",
          hi: "यीशु ने उससे कहा, 'मार्ग और सत्य और जीवन मैं ही हूँ; बिना मेरे द्वारा कोई पिता के पास नहीं पहुँच सकता।'",
        },
      },
    ],
    tip: {
      ko: "예수님은 우리가 건너갈 수 없는 그 다리를 직접 몸으로 놓으셨습니다. 그분만이 하나님께 이르는 유일한 길입니다.",
      en: "Jesus personally became the bridge we could never cross. He alone is the only way to God.",
      id: "Yesus secara pribadi menjadi jembatan yang tidak bisa kita seberangi sendiri. Hanya Dia satu-satunya jalan kepada Allah.",
      ja: "イエスは私たちが渡ることのできないその橋を、ご自身の体で架けてくださいました。神へと至る唯一の道は彼だけです。",
      hi: "यीशु ने व्यक्तिगत रूप से वह पुल बनाया जिसे हम कभी पार नहीं कर सकते थे। परमेश्वर तक पहुँचने का एकमात्र मार्ग वही है।",
    },
  },
  {
    num: "04",
    color: "#B89A5E",
    lightColor: "#FDF8EE",
    emoji: "🚪",
    title: {
      ko: "우리는 각자 예수 그리스도를\n구주와 주님으로 영접해야 합니다",
      en: "We must individually receive Jesus Christ as Savior and Lord",
      id: "Kita harus secara pribadi menerima Yesus Kristus sebagai Juruselamat dan Tuhan",
      ja: "私たちは個人的にイエス・キリストを救い主と主として受け入れなければなりません",
      hi: "हमें व्यक्तिगत रूप से यीशु मसीह को उद्धारकर्ता और प्रभु के रूप में स्वीकार करना होगा",
    },
    verses: [
      {
        ref: "요한복음 1:12",
        text: {
          ko: "영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니",
          en: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.",
          id: "Tetapi semua orang yang menerima-Nya diberi-Nya kuasa supaya menjadi anak-anak Allah, yaitu mereka yang percaya dalam nama-Nya.",
          ja: "しかし、この方を受け入れた人々、すなわち、その名を信じた人々には、神の子どもとなる権威を与えられた。",
          hi: "परन्तु जितनों ने उसे ग्रहण किया, उसने उन्हें परमेश्वर की सन्तान होने का अधिकार दिया, अर्थात् उन्हें जो उसके नाम पर विश्वास रखते हैं।",
        },
      },
      {
        ref: "요한계시록 3:20",
        text: {
          ko: "볼지어다 내가 문 밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그와 더불어 먹고 그는 나와 더불어 먹으리라",
          en: "Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.",
          id: "Lihatlah, Aku berdiri di muka pintu dan mengetok; jikalau ada orang yang mendengar suara-Ku dan membukakan pintu, Aku akan masuk mendapatkannya dan Aku makan bersama-sama dengan dia.",
          ja: "見よ。わたしは戸の外に立ってたたいている。だれでも、わたしの声を聞いて戸を開けるなら、わたしはその人のところに入って、彼とともに食事をし、彼もわたしとともに食事をする。",
          hi: "देख, मैं द्वार पर खड़ा हूँ और खटखटाता हूँ; यदि कोई मेरी आवाज़ सुने और द्वार खोले, तो मैं उसके पास अन्दर आऊँगा और उसके साथ भोजन करूँगा और वह मेरे साथ।",
        },
      },
    ],
    tip: {
      ko: "지식만으로는 부족합니다. 예수님은 당신의 마음 문을 두드리고 계십니다 — 문을 여는 것은 당신의 결단입니다.",
      en: "Knowledge alone is not enough. Jesus is knocking at the door of your heart — opening it is your decision.",
      id: "Pengetahuan saja tidak cukup. Yesus mengetuk pintu hatimu — membukanya adalah keputusanmu.",
      ja: "知識だけでは十分ではありません。イエスはあなたの心の扉をたたいています — 開けるかどうかはあなたの決断です。",
      hi: "केवल ज्ञान पर्याप्त नहीं है। यीशु आपके हृदय के द्वार पर दस्तक दे रहे हैं — दरवाजा खोलना आपका निर्णय है।",
    },
    prayer: {
      ko: "하나님 아버지, 저는 죄인입니다. 지금 예수 그리스도를 제 구주로 영접합니다. 제 죄를 용서해 주시고, 제 삶을 인도해 주십시오. 예수님의 이름으로 기도합니다. 아멘.",
      en: "Heavenly Father, I am a sinner. I now receive Jesus Christ as my Savior. Forgive my sins and guide my life. In Jesus' name, Amen.",
      id: "Bapa di Surga, saya adalah orang berdosa. Saya menerima Yesus Kristus sebagai Juruselamat saya. Ampunilah dosa saya dan pimpin hidup saya. Dalam nama Yesus, Amin.",
      ja: "天の父よ、私は罪人です。今、イエス・キリストを私の救い主として受け入れます。私の罪を赦し、私の人生を導いてください。イエスの名によって、アーメン。",
      hi: "स्वर्गीय पिता, मैं पापी हूँ। मैं अभी यीशु मसीह को अपने उद्धारकर्ता के रूप में स्वीकार करता हूँ। मेरे पापों को क्षमा करें और मेरे जीवन का मार्गदर्शन करें। यीशु के नाम में, आमीन।",
    },
  },
];

const LAW_LANG_TABS: { lang: LawLang; label: string }[] = [
  { lang: "ko", label: "한국어" },
  { lang: "en", label: "English" },
  { lang: "id", label: "Bahasa" },
  { lang: "ja", label: "日本語" },
  { lang: "hi", label: "हिन्दी" },
];

const PRAYER_LABELS: Record<LawLang, string> = {
  ko: "영접 기도",
  en: "Sinner's Prayer",
  id: "Doa Penerimaan",
  ja: "受容の祈り",
  hi: "स्वीकृति की प्रार्थना",
};

function FourLawsScreen({ onBack }: { onBack: () => void }) {
  const dark = useSystemDark();
  const [idx, setIdx] = useState(0);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [lawLang, setLawLang] = useState<LawLang>("ko");
  const law = FOUR_LAWS_DATA[idx];
  const isLast = idx === FOUR_LAWS_DATA.length - 1;

  const bg    = dark ? "#0F1923" : "#F4F2EE";
  const card  = dark ? "#1A2535" : "#FFFFFF";
  const txt   = dark ? "#F0EDE8" : "#0C1F35";
  const sub   = dark ? "rgba(240,237,232,0.5)" : "rgba(12,31,53,0.48)";
  const bdr   = dark ? "rgba(255,255,255,0.08)" : "rgba(12,31,53,0.08)";
  const verseBg = dark ? "rgba(255,255,255,0.05)" : `${law.lightColor}`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "52px 20px 12px", gap: 12 }}>
        <motion.button onClick={onBack} whileTap={{ scale: 0.9 }}
          style={{ width: 36, height: 36, borderRadius: 18, border: `1px solid ${bdr}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <X size={16} style={{ color: txt }} strokeWidth={2} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", fontFamily: SANS, color: law.color, textTransform: "uppercase" }}>사영리</p>
          <p style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS, color: txt }}>Four Spiritual Laws</p>
        </div>
        {/* Dots */}
        <div style={{ display: "flex", gap: 5 }}>
          {FOUR_LAWS_DATA.map((_, i) => (
            <motion.div key={i} animate={{ width: i === idx ? 18 : 6, background: i === idx ? law.color : (dark ? "rgba(255,255,255,0.2)" : "rgba(12,31,53,0.18)") }}
              style={{ height: 6, borderRadius: 3, cursor: "pointer" }} onClick={() => setIdx(i)} transition={{ duration: 0.25 }} />
          ))}
        </div>
      </div>

      {/* Language picker */}
      <div style={{ overflowX: "auto", padding: "0 20px 10px", display: "flex", gap: 6, flexShrink: 0, scrollbarWidth: "none" }}>
        {LAW_LANG_TABS.map(({ lang, label }) => {
          const active = lawLang === lang;
          return (
            <motion.button key={lang} onClick={() => setLawLang(lang)} whileTap={{ scale: 0.93 }}
              style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? law.color : bdr}`, background: active ? law.color : "transparent", color: active ? "#FFFFFF" : sub, fontSize: 10, fontWeight: 600, fontFamily: SANS, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ borderRadius: 26, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(12,31,53,0.1)", display: "flex", flexDirection: "column" }}>
            {/* Color bar + law number */}
            <div style={{ background: law.color, padding: "16px 22px 14px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }}>{law.emoji}</span>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.65)", fontFamily: SANS, textTransform: "uppercase" }}>Law {law.num}</p>
                <p style={{ fontSize: 13, fontFamily: SANS, color: "rgba(255,255,255,0.9)", fontWeight: 500, marginTop: 1 }}>{law.title[lawLang]}</p>
              </div>
            </div>
            {/* Title text */}
            <div style={{ padding: "18px 22px 10px" }}>
              <p style={{ fontSize: 20, fontFamily: SERIF, color: txt, lineHeight: 1.5, whiteSpace: "pre-line", fontStyle: "italic" }}>{law.title[lawLang]}</p>
            </div>
            {/* Verses */}
            <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {law.verses.map((v) => (
                <div key={v.ref} style={{ borderRadius: 14, background: verseBg, padding: "10px 14px", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(12,31,53,0.06)"}` }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: law.color, fontFamily: SANS, marginBottom: 4, textTransform: "uppercase" }}>{v.ref}</p>
                  <p style={{ fontSize: 12, fontFamily: SANS, color: txt, lineHeight: 1.65 }}>{v.text[lawLang]}</p>
                </div>
              ))}
            </div>
            {/* Tip */}
            <div style={{ padding: "0 22px 16px" }}>
              <p style={{ fontSize: 12, fontFamily: SANS, color: sub, lineHeight: 1.65 }}>{law.tip[lawLang]}</p>
            </div>
            {/* Prayer (last card) */}
            {isLast && law.prayer && (
              <div style={{ margin: "0 14px 14px", borderRadius: 14, background: dark ? "rgba(196,169,106,0.1)" : "rgba(196,169,106,0.08)", border: "1px solid rgba(196,169,106,0.25)", overflow: "hidden" }}>
                <motion.button onClick={() => setPrayerOpen(p => !p)} style={{ width: "100%", padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>🙏</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", fontFamily: SANS, color: "#C4A96A", textTransform: "uppercase", flex: 1, textAlign: "left" }}>{PRAYER_LABELS[lawLang]}</span>
                  <motion.div animate={{ rotate: prayerOpen ? 180 : 0 }} transition={{ duration: 0.22 }}><ChevronDown size={14} style={{ color: "#C4A96A" }} strokeWidth={2.5} /></motion.div>
                </motion.button>
                <AnimatePresence>
                  {prayerOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                      <p style={{ fontSize: 13, fontFamily: SERIF, color: txt, lineHeight: 1.8, padding: "0 16px 16px", fontStyle: "italic" }}>{law.prayer[lawLang]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 10, paddingBottom: 20 }}>
          {idx > 0 && (
            <motion.button onClick={() => { setIdx(i => i - 1); setPrayerOpen(false); }} whileTap={{ scale: 0.96 }}
              style={{ flex: 1, padding: "13px 0", borderRadius: 16, background: card, border: `1px solid ${bdr}`, color: txt, fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: "pointer" }}>
              ← 이전
            </motion.button>
          )}
          <motion.button onClick={() => isLast ? onBack() : (setIdx(i => i + 1), setPrayerOpen(false))} whileTap={{ scale: 0.96 }}
            style={{ flex: 2, padding: "13px 0", borderRadius: 16, background: law.color, border: "none", color: "#FFFFFF", fontSize: 14, fontWeight: 700, fontFamily: SANS, cursor: "pointer" }}>
            {isLast ? "완료 ✓" : `다음 — Law ${String(idx + 2).padStart(2, "0")} →`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TOOL — 노방전도 (Street Evangelism Guide)
// ══════════════════════════════════════════════════════════════════════════════
interface EvSection {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  steps: { label: string; desc: string }[];
}

const STREET_EV_DATA: Record<LawLang, EvSection[]> = {
  ko: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "자연스럽게 접근하기",
      subtitle: "Opening the conversation",
      steps: [
        { label: "설문 접근법", desc: "\"안녕하세요, 잠깐 시간 있으신가요? 영적인 삶에 대해 몇 가지 여쭤봐도 될까요?\"" },
        { label: "관심 보이기", desc: "상대방의 눈을 보고 진심 어린 미소로 다가갑니다. 위협적이지 않게, 열린 자세로." },
        { label: "공통점 찾기", desc: "날씨, 장소, 현재 상황 등 가벼운 주제로 먼저 대화를 시작하세요." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "핵심 질문 3가지",
      subtitle: "Three diagnostic questions",
      steps: [
        { label: "질문 1", desc: "\"지금 영적인 삶에 관심이 있으신가요?\"" },
        { label: "질문 2", desc: "\"만약 오늘 돌아가신다면, 하나님 앞에 서게 되실 것이라 생각하십니까?\"" },
        { label: "질문 3", desc: "\"하나님이 왜 당신을 천국에 받아들여야 하냐고 물으신다면, 뭐라고 대답하시겠습니까?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "다리 예화",
      subtitle: "The Bridge Illustration",
      steps: [
        { label: "왼쪽 — 인간", desc: "종이에 왼쪽에 '인간'을 씁니다. 우리는 하나님과 단절되어 있습니다 (롬 3:23)." },
        { label: "오른쪽 — 하나님", desc: "오른쪽에 '하나님'을 씁니다. 그 사이에 큰 간격(죄, 사망)이 있습니다." },
        { label: "다리 — 예수님", desc: "십자가를 다리로 그립니다. 예수님만이 그 간격을 메우십니다 (요 14:6)." },
        { label: "결단", desc: "\"이 다리를 건너겠습니까?\" 상대방의 응답을 기다립니다." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "복음 제시",
      subtitle: "Presenting the Gospel",
      steps: [
        { label: "사랑", desc: "하나님은 당신을 사랑하십니다 (요 3:16). 이것이 출발점입니다." },
        { label: "문제", desc: "모든 인간은 죄를 지었고 하나님과 단절되어 있습니다 (롬 3:23)." },
        { label: "해결", desc: "예수님이 우리의 죄를 위해 죽으시고 부활하셨습니다 (롬 5:8)." },
        { label: "반응", desc: "예수님을 개인적으로 영접해야 합니다 (요 1:12). 지금이 그 때입니다." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "영접 기도로 이끌기",
      subtitle: "Leading to prayer",
      steps: [
        { label: "초청", desc: "\"지금 예수님을 영접하시겠습니까? 제가 기도를 인도해 드릴게요.\"" },
        { label: "기도 안내", desc: "짧고 진심 어린 기도: 죄를 인정하고, 예수님을 구주로 영접하고, 인도를 구함." },
        { label: "확인", desc: "기도 후: \"지금 마음에 어떠세요?\" 결신자의 변화를 함께 기뻐하세요." },
        { label: "다음 단계", desc: "성경, 교회, 연락처 교환. 혼자 내버려 두지 마세요 — 새 신자는 돌봄이 필요합니다." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "자주 받는 반응들",
      subtitle: "Common responses & how to respond",
      steps: [
        { label: "\"나는 이미 좋은 사람이에요\"", desc: "\"맞아요, 당신은 좋은 분이시죠. 그런데 하나님의 기준은 선함이 아니라 완전함입니다 (롬 3:23). 예수님만이 그 간격을 메울 수 있어요.\"" },
        { label: "\"종교는 다 같아요\"", desc: "\"다들 비슷한 도덕을 가르치지만, 예수님은 유일하게 '내가 길이다'라고 하셨어요 (요 14:6). 그 주장을 함께 살펴볼까요?\"" },
        { label: "\"나중에 생각해볼게요\"", desc: "\"충분히 이해해요. 혹시 한 가지만 더 — 오늘 이 대화가 있었다는 것, 기억해 주세요.\" 연락처를 남기세요." },
      ],
    },
  ],
  en: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "Opening the Conversation",
      subtitle: "Approach naturally",
      steps: [
        { label: "Survey Approach", desc: "\"Hello, do you have a moment? May I ask you a few questions about your spiritual life?\"" },
        { label: "Show Interest", desc: "Make eye contact and approach with a genuine smile. Non-threatening, open posture." },
        { label: "Find Common Ground", desc: "Start with light topics — weather, the place, the current situation." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "Three Key Questions",
      subtitle: "Three diagnostic questions",
      steps: [
        { label: "Question 1", desc: "\"Are you interested in spiritual things right now?\"" },
        { label: "Question 2", desc: "\"If you were to die today, do you believe you would stand before God?\"" },
        { label: "Question 3", desc: "\"If God asked you why He should let you into heaven, what would you say?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "The Bridge Illustration",
      subtitle: "Visual gospel presentation",
      steps: [
        { label: "Left — Humanity", desc: "Write 'Man' on the left side of a paper. We are separated from God (Rom 3:23)." },
        { label: "Right — God", desc: "Write 'God' on the right. There is a great gap between them — sin and death." },
        { label: "Bridge — Jesus", desc: "Draw a cross as the bridge. Only Jesus can bridge that gap (John 14:6)." },
        { label: "Decision", desc: "\"Will you cross this bridge?\" Wait for the person's response." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "Presenting the Gospel",
      subtitle: "The good news clearly",
      steps: [
        { label: "Love", desc: "God loves you (John 3:16). This is the starting point." },
        { label: "Problem", desc: "Every person has sinned and is separated from God (Rom 3:23)." },
        { label: "Solution", desc: "Jesus died for our sins and rose again (Rom 5:8)." },
        { label: "Response", desc: "We must personally receive Jesus (John 1:12). Now is the time." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "Leading to Prayer",
      subtitle: "Inviting a decision",
      steps: [
        { label: "Invitation", desc: "\"Would you like to receive Jesus now? I can guide you through a prayer.\"" },
        { label: "Prayer Guide", desc: "Short, sincere prayer: acknowledge sin, receive Jesus as Savior, ask for guidance." },
        { label: "Confirm", desc: "After prayer: \"How do you feel now?\" Rejoice together in their decision." },
        { label: "Next Steps", desc: "Give a Bible, find a church, exchange contact info. Don't leave them alone — new believers need care." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "Common Responses",
      subtitle: "How to handle objections",
      steps: [
        { label: "\"I'm already a good person\"", desc: "\"I'm sure you are. But God's standard isn't goodness — it's perfection (Rom 3:23). Only Jesus can bridge that gap.\"" },
        { label: "\"All religions are the same\"", desc: "\"They share similar ethics, but Jesus uniquely said 'I am the way' (John 14:6). Shall we look at that claim together?\"" },
        { label: "\"I'll think about it later\"", desc: "\"Totally understand. Just one more thing — remember this conversation today.\" Leave your contact info." },
      ],
    },
  ],
  id: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "Memulai Percakapan",
      subtitle: "Pendekatan yang alami",
      steps: [
        { label: "Pendekatan Survei", desc: "\"Halo, apakah Anda punya waktu sebentar? Bolehkah saya bertanya tentang kehidupan rohani Anda?\"" },
        { label: "Tunjukkan Minat", desc: "Tatap matanya dan dekati dengan senyum tulus. Tidak mengancam, postur terbuka." },
        { label: "Temukan Kesamaan", desc: "Mulai dengan topik ringan — cuaca, tempat, situasi saat ini." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "Tiga Pertanyaan Kunci",
      subtitle: "Pertanyaan diagnostik",
      steps: [
        { label: "Pertanyaan 1", desc: "\"Apakah Anda tertarik dengan hal-hal rohani saat ini?\"" },
        { label: "Pertanyaan 2", desc: "\"Jika Anda meninggal hari ini, apakah Anda pikir Anda akan berdiri di hadapan Allah?\"" },
        { label: "Pertanyaan 3", desc: "\"Jika Allah bertanya mengapa Dia harus membiarkan Anda masuk surga, apa yang akan Anda katakan?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "Ilustrasi Jembatan",
      subtitle: "Presentasi visual Injil",
      steps: [
        { label: "Kiri — Manusia", desc: "Tulis 'Manusia' di sisi kiri kertas. Kita terpisah dari Allah (Rm 3:23)." },
        { label: "Kanan — Allah", desc: "Tulis 'Allah' di sisi kanan. Ada jurang besar di antaranya — dosa dan kematian." },
        { label: "Jembatan — Yesus", desc: "Gambar salib sebagai jembatan. Hanya Yesus yang bisa menjembatani jurang itu (Yoh 14:6)." },
        { label: "Keputusan", desc: "\"Apakah Anda ingin menyeberangi jembatan ini?\" Tunggu respons orang tersebut." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "Menyampaikan Injil",
      subtitle: "Kabar baik dengan jelas",
      steps: [
        { label: "Kasih", desc: "Allah mengasihi Anda (Yoh 3:16). Inilah titik awalnya." },
        { label: "Masalah", desc: "Setiap orang telah berdosa dan terpisah dari Allah (Rm 3:23)." },
        { label: "Solusi", desc: "Yesus mati untuk dosa kita dan bangkit kembali (Rm 5:8)." },
        { label: "Respons", desc: "Kita harus secara pribadi menerima Yesus (Yoh 1:12). Sekarang adalah waktunya." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "Membimbing ke Doa",
      subtitle: "Mengundang keputusan",
      steps: [
        { label: "Undangan", desc: "\"Apakah Anda ingin menerima Yesus sekarang? Saya bisa membimbing Anda berdoa.\"" },
        { label: "Panduan Doa", desc: "Doa singkat dan tulus: akui dosa, terima Yesus sebagai Juru Selamat, minta bimbingan." },
        { label: "Konfirmasi", desc: "Setelah berdoa: \"Bagaimana perasaan Anda sekarang?\" Bersukacitalah bersama atas keputusan mereka." },
        { label: "Langkah Selanjutnya", desc: "Berikan Alkitab, temukan gereja, tukarkan kontak. Jangan tinggalkan mereka sendiri — percaya baru membutuhkan perawatan." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "Respons Umum",
      subtitle: "Cara menangani keberatan",
      steps: [
        { label: "\"Saya sudah orang baik\"", desc: "\"Tentu saja. Tapi standar Allah bukan kebaikan — melainkan kesempurnaan (Rm 3:23). Hanya Yesus yang bisa menjembatani jurang itu.\"" },
        { label: "\"Semua agama sama\"", desc: "\"Mereka berbagi etika serupa, tapi Yesus secara unik berkata 'Akulah jalan' (Yoh 14:6). Maukah kita melihat klaim itu bersama?\"" },
        { label: "\"Saya pikir-pikir dulu\"", desc: "\"Saya mengerti. Satu hal lagi — ingatlah percakapan ini hari ini.\" Tinggalkan info kontak Anda." },
      ],
    },
  ],
  ja: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "自然に近づく",
      subtitle: "会話を始める",
      steps: [
        { label: "アンケート形式", desc: "「こんにちは、少しお時間ありますか？霊的な生活についていくつか質問してもいいですか？」" },
        { label: "関心を示す", desc: "目を見て、真心のある笑顔で近づきます。脅威を与えず、開かれた姿勢で。" },
        { label: "共通点を見つける", desc: "天気、場所、現在の状況など軽い話題から始めましょう。" },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "3つの重要な質問",
      subtitle: "診断のための質問",
      steps: [
        { label: "質問1", desc: "「今、霊的なことに関心がありますか？」" },
        { label: "質問2", desc: "「もし今日亡くなったとしたら、神の前に立つと思いますか？」" },
        { label: "質問3", desc: "「神が天国に入れるべき理由を尋ねたら、何と答えますか？」" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "橋のたとえ",
      subtitle: "福音のビジュアル説明",
      steps: [
        { label: "左 — 人間", desc: "紙の左側に「人間」と書きます。私たちは神から切り離されています（ロマ3:23）。" },
        { label: "右 — 神", desc: "右側に「神」と書きます。その間には大きな隔たり（罪と死）があります。" },
        { label: "橋 — イエス", desc: "十字架を橋として描きます。イエスだけがその隔たりを埋めることができます（ヨハ14:6）。" },
        { label: "決断", desc: "「この橋を渡りますか？」相手の返答を待ちます。" },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "福音を伝える",
      subtitle: "良い知らせを明確に",
      steps: [
        { label: "愛", desc: "神はあなたを愛しています（ヨハ3:16）。これが出発点です。" },
        { label: "問題", desc: "すべての人は罪を犯し、神から離れています（ロマ3:23）。" },
        { label: "解決策", desc: "イエスは私たちの罪のために死に、復活されました（ロマ5:8）。" },
        { label: "応答", desc: "私たちは個人的にイエスを受け入れなければなりません（ヨハ1:12）。今がその時です。" },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "祈りへの導き",
      subtitle: "決断への招待",
      steps: [
        { label: "招待", desc: "「今イエスを受け入れますか？祈りを案内しましょうか？」" },
        { label: "祈りの案内", desc: "短く真心のある祈り：罪を認め、イエスを救い主として受け入れ、導きを求める。" },
        { label: "確認", desc: "祈りの後：「今、心はいかがですか？」決心した変化を共に喜びましょう。" },
        { label: "次のステップ", desc: "聖書、教会、連絡先の交換。一人にしないでください — 新しい信者にはケアが必要です。" },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "よくある反応",
      subtitle: "異議への対応方法",
      steps: [
        { label: "「私はすでに良い人です」", desc: "「そうですね。でも神の基準は善さではなく完全さです（ロマ3:23）。イエスだけがその隔たりを埋めることができます。」" },
        { label: "「宗教はみな同じ」", desc: "「同様の倫理を教えていますが、イエスは独自に『わたしが道だ』と言いました（ヨハ14:6）。その主張を一緒に見てみましょうか？」" },
        { label: "「後で考えます」", desc: "「十分理解します。一つだけ — 今日のこの会話を覚えておいてください。」連絡先を残してください。" },
      ],
    },
  ],
  hi: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "स्वाभाविक रूप से संपर्क करें",
      subtitle: "बातचीत शुरू करना",
      steps: [
        { label: "सर्वेक्षण दृष्टिकोण", desc: "\"नमस्ते, क्या आपके पास एक पल है? क्या मैं आपके आध्यात्मिक जीवन के बारे में कुछ पूछ सकता हूँ?\"" },
        { label: "रुचि दिखाएं", desc: "आँखों में देखें और सच्ची मुस्कान के साथ नजदीक आएं। खुले और मैत्रीपूर्ण तरीके से।" },
        { label: "समानता खोजें", desc: "मौसम, जगह, वर्तमान स्थिति जैसे हल्के विषयों से शुरू करें।" },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "तीन मुख्य प्रश्न",
      subtitle: "निदान संबंधी प्रश्न",
      steps: [
        { label: "प्रश्न 1", desc: "\"क्या आप अभी आध्यात्मिक बातों में रुचि रखते हैं?\"" },
        { label: "प्रश्न 2", desc: "\"यदि आज आपकी मृत्यु हो जाए, तो क्या आप सोचते हैं कि आप परमेश्वर के सामने खड़े होंगे?\"" },
        { label: "प्रश्न 3", desc: "\"यदि परमेश्वर पूछे कि उन्हें आपको स्वर्ग में क्यों आने देना चाहिए, तो आप क्या कहेंगे?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "पुल का दृष्टांत",
      subtitle: "सुसमाचार का दृश्य वर्णन",
      steps: [
        { label: "बाईं ओर — मनुष्य", desc: "कागज के बाईं ओर 'मनुष्य' लिखें। हम परमेश्वर से अलग हैं (रोम 3:23)।" },
        { label: "दाईं ओर — परमेश्वर", desc: "दाईं ओर 'परमेश्वर' लिखें। उनके बीच एक बड़ी खाई है — पाप और मृत्यु।" },
        { label: "पुल — यीशु", desc: "क्रूस को पुल के रूप में बनाएं। केवल यीशु ही उस खाई को पाट सकते हैं (यूह 14:6)।" },
        { label: "निर्णय", desc: "\"क्या आप इस पुल को पार करेंगे?\" व्यक्ति की प्रतिक्रिया की प्रतीक्षा करें।" },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "सुसमाचार सुनाना",
      subtitle: "खुशखबरी स्पष्ट रूप से",
      steps: [
        { label: "प्रेम", desc: "परमेश्वर आपसे प्रेम करते हैं (यूह 3:16)। यही शुरुआत है।" },
        { label: "समस्या", desc: "हर इंसान ने पाप किया है और परमेश्वर से अलग है (रोम 3:23)।" },
        { label: "समाधान", desc: "यीशु हमारे पापों के लिए मरे और जी उठे (रोम 5:8)।" },
        { label: "प्रतिक्रिया", desc: "हमें व्यक्तिगत रूप से यीशु को स्वीकार करना होगा (यूह 1:12)। अभी वह समय है।" },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "प्रार्थना की ओर ले जाना",
      subtitle: "निर्णय के लिए आमंत्रण",
      steps: [
        { label: "आमंत्रण", desc: "\"क्या आप अभी यीशु को स्वीकार करना चाहते हैं? मैं आपको प्रार्थना में मार्गदर्शन कर सकता हूँ।\"" },
        { label: "प्रार्थना मार्गदर्शन", desc: "छोटी, सच्ची प्रार्थना: पाप स्वीकार करें, यीशु को उद्धारकर्ता के रूप में ग्रहण करें, मार्गदर्शन माँगें।" },
        { label: "पुष्टि", desc: "प्रार्थना के बाद: \"अब आप कैसा महसूस कर रहे हैं?\" उनके निर्णय पर साथ मिलकर खुशी मनाएं।" },
        { label: "अगले कदम", desc: "बाइबल दें, चर्च खोजें, संपर्क जानकारी साझा करें। उन्हें अकेला न छोड़ें — नए विश्वासियों को देखभाल की जरूरत है।" },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "सामान्य प्रतिक्रियाएं",
      subtitle: "आपत्तियों से निपटना",
      steps: [
        { label: "\"मैं पहले से अच्छा इंसान हूँ\"", desc: "\"बिल्कुल। लेकिन परमेश्वर का मानक अच्छाई नहीं — पूर्णता है (रोम 3:23)। केवल यीशु ही उस खाई को पाट सकते हैं।\"" },
        { label: "\"सभी धर्म एक समान हैं\"", desc: "\"वे समान नैतिकता सिखाते हैं, लेकिन यीशु ने अनोखे रूप से कहा 'मैं ही मार्ग हूँ' (यूह 14:6)। क्या हम उस दावे को मिलकर देखें?\"" },
        { label: "\"मैं बाद में सोचूँगा\"", desc: "\"पूरी तरह समझता हूँ। बस एक बात — आज की इस बातचीत को याद रखें।\" अपनी संपर्क जानकारी छोड़ें।" },
      ],
    },
  ],
};

function StreetEvScreen({ onBack }: { onBack: () => void }) {
  const dark = useSystemDark();
  const [open, setOpen] = useState<number | null>(0);
  const [evLang, setEvLang] = useState<LawLang>("ko");

  const bg   = dark ? "#0F1923" : "#F4F2EE";
  const card = dark ? "#1A2535" : "#FFFFFF";
  const txt  = dark ? "#F0EDE8" : "#0C1F35";
  const sub  = dark ? "rgba(240,237,232,0.45)" : "rgba(12,31,53,0.45)";
  const bdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(12,31,53,0.08)";

  const sections = STREET_EV_DATA[evLang];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "52px 20px 10px", gap: 12, flexShrink: 0 }}>
        <motion.button onClick={onBack} whileTap={{ scale: 0.9 }}
          style={{ width: 36, height: 36, borderRadius: 18, border: `1px solid ${bdr}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <X size={16} style={{ color: txt }} strokeWidth={2} />
        </motion.button>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", fontFamily: SANS, color: "#4A9FE0", textTransform: "uppercase" }}>노방전도 가이드</p>
          <p style={{ fontSize: 13, fontWeight: 600, fontFamily: SANS, color: txt }}>Street Evangelism Guide</p>
        </div>
      </div>

      {/* Language picker */}
      <div style={{ overflowX: "auto", padding: "0 20px 10px", display: "flex", gap: 6, flexShrink: 0, scrollbarWidth: "none" }}>
        {LAW_LANG_TABS.map(({ lang, label }) => {
          const active = evLang === lang;
          return (
            <motion.button key={lang} onClick={() => { setEvLang(lang); setOpen(0); }} whileTap={{ scale: 0.93 }}
              style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${active ? "#4A9FE0" : bdr}`, background: active ? "#4A9FE0" : "transparent", color: active ? "#FFFFFF" : sub, fontSize: 10, fontWeight: 600, fontFamily: SANS, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Accordion list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
        {sections.map((sec, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ borderRadius: 20, background: card, border: `1px solid ${bdr}`, overflow: "hidden", boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(12,31,53,0.07)" }}>
              <motion.button onClick={() => setOpen(isOpen ? null : i)} style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: isOpen ? sec.color : (dark ? "rgba(255,255,255,0.07)" : "rgba(12,31,53,0.05)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.25s" }}>
                  <span style={{ fontSize: 18 }}>{sec.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, fontFamily: SANS, color: isOpen ? sec.color : txt, transition: "color 0.25s" }}>{sec.title}</p>
                  <p style={{ fontSize: 11, fontFamily: SANS, color: sub, marginTop: 1 }}>{sec.subtitle}</p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  <ChevronDown size={16} style={{ color: isOpen ? sec.color : sub }} strokeWidth={2.5} />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${bdr}` }}>
                      {sec.steps.map((step, j) => (
                        <div key={j} style={{ padding: "10px 14px", borderRadius: 14, background: dark ? "rgba(255,255,255,0.04)" : `${sec.color}0D`, borderLeft: `3px solid ${sec.color}` }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: sec.color, fontFamily: SANS, textTransform: "uppercase", marginBottom: 4 }}>{step.label}</p>
                          <p style={{ fontSize: 13, fontFamily: SANS, color: txt, lineHeight: 1.65 }}>{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MissionBoardScreen({ onTab, currentTab, onStartJourney, gateIdx, missionGates, onOpenTool }: {
  onTab: (t: NavTab) => void; currentTab: NavTab;
  onStartJourney: (m: Mission) => void;
  gateIdx: Record<Mission, number>;
  missionGates: Record<Mission, number>;
  onOpenTool: (s: "four-laws" | "street-ev") => void;
}) {
  const missions: Mission[] = ["indonesia", "japan", "india"];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F6F5F1" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 20px 100px", display: "flex", flexDirection: "column", gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase", marginBottom: 4 }}>Mission Board</p>
          <h2 style={{ fontSize: 30, fontFamily: SERIF, color: "#0C1F35", lineHeight: 1.15 }}>Choose Your Journey</h2>
        </motion.div>

        {missions.map((m, i) => {
          const meta = MISSION_META[m];
          const gIdx = gateIdx[m];
          return (
            <motion.div key={m} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 * i }}
              style={{ position: "relative", borderRadius: 26, overflow: "hidden", cursor: "pointer", boxShadow: "0 12px 48px rgba(12,31,53,0.18), 0 4px 16px rgba(12,31,53,0.1)" }}
              onClick={() => onStartJourney(m)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            >
              <img src={meta.heroImg} alt={meta.country} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(8,20,38,0.68) 0%, rgba(8,20,38,0.18) 55%, rgba(8,20,38,0.5) 100%)" }} />
              <div style={{ position: "relative", padding: "18px 20px 20px", minHeight: 160 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{meta.flag}</span>
                    <div>
                      <p style={{ fontSize: 11, fontFamily: SANS, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{meta.lang}</p>
                      <p style={{ fontSize: 13, fontFamily: SANS, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{meta.country}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 10, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: 2.5, background: "#7CA88A" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", fontFamily: SANS, color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>Available</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 26, fontFamily: SERIF, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 14, fontStyle: "italic" }}>{meta.name}</h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <GateProgress current={gIdx + 1} total={7} />
                    <span style={{ fontSize: 11, fontFamily: SANS, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Gate {gIdx + 1} of 7</span>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                    <ChevronRight size={14} style={{ color: "#FFFFFF" }} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Evangelism Tools */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "four-laws" as const, icon: "📖", color: "#3B6FE0", bg: "#1E2D5A", label: "Four Laws", sub: "Four Spiritual Laws" },
              { id: "street-ev" as const, icon: "🌍", color: "#7CA88A", bg: "#1A2E22", label: "Street Ev", sub: "Street Evangelism" },
            ].map((tool) => (
              <motion.button key={tool.id} onClick={() => onOpenTool(tool.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ background: tool.bg, borderRadius: 20, padding: "16px 14px", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tool.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20 }}>{tool.icon}</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, fontFamily: SANS, color: "#FFFFFF" }}>{tool.label}</p>
                  <p style={{ fontSize: 10, fontFamily: SANS, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{tool.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}
          style={{ borderRadius: 20, background: "#F8F5EE", border: "1px solid rgba(196,160,48,0.2)", boxShadow: "0 2px 12px rgba(12,31,53,0.06)" }}>
          <div style={{ padding: "16px 18px" }}>
            <div>
              <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", fontFamily: SANS, color: "#C4A030", textTransform: "uppercase", marginBottom: 6 }}>Vision Statement</p>
              <p style={{ fontSize: 14, fontFamily: SERIF, color: "#0B1829", lineHeight: 1.6, fontStyle: "italic" }}>"Go therefore and make disciples of all nations…"</p>
              <p style={{ fontSize: 11, fontFamily: SANS, color: "rgba(12,35,64,0.4)", fontWeight: 500, marginTop: 5 }}>Matthew 28:19</p>
            </div>
          </div>
        </motion.div>
      </div>
      <BottomNav current={currentTab} onTab={onTab} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION CARD
// ══════════════════════════════════════════════════════════════════════════════
function ConversationCard({ lines, caption, speechLang }: { lines: ConvLine[]; caption: string; speechLang: string }) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const handlePlay = (idx: number) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[idx].word);
    utterance.lang = speechLang; utterance.rate = 0.85; utterance.pitch = 1.0;
    setPlayingIdx(idx);
    utterance.onend = () => setPlayingIdx(null);
    utterance.onerror = () => setPlayingIdx(null);
    window.speechSynthesis.speak(utterance);
    setTimeout(() => setPlayingIdx((cur) => (cur === idx ? null : cur)), 5000);
  };
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "16px 16px 12px", boxShadow: "0 2px 16px rgba(12,31,53,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
      {lines.map((line, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: line.mine ? "row-reverse" : "row" }}>
          {!line.mine && (<div style={{ width: 28, height: 28, borderRadius: 14, background: "#4A9FE0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={12} style={{ color: "#FFFFFF" }} strokeWidth={2} /></div>)}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: 220, alignItems: line.mine ? "flex-end" : "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: 18, borderTopLeftRadius: line.mine ? 18 : 6, borderTopRightRadius: line.mine ? 6 : 18, background: line.mine ? "#0C1F35" : "#F0F4F9" }}>
              <p style={{ fontSize: 13, fontFamily: SANS, fontWeight: 600, color: line.mine ? "#FFFFFF" : "#0C1F35", marginBottom: 3 }}>{line.word}</p>
              <p style={{ fontSize: 10, fontFamily: SANS, color: line.mine ? "rgba(255,255,255,0.5)" : "#6B7C92", lineHeight: 1.4 }}>{line.english}</p>
            </div>
            <motion.button onClick={() => handlePlay(idx)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: playingIdx === idx ? "#4A9FE0" : "rgba(74,159,224,0.1)", color: playingIdx === idx ? "#FFFFFF" : "#4A9FE0", fontSize: 10, fontWeight: 600, fontFamily: SANS, transition: "background 0.2s" }} whileTap={{ scale: 0.92 }}>
              <motion.div animate={playingIdx === idx ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.5, repeat: playingIdx === idx ? Infinity : 0 }}><Volume2 size={10} strokeWidth={2} /></motion.div>
              {playingIdx === idx ? "재생 중…" : "듣기"}
            </motion.button>
          </div>
        </div>
      ))}
      <p style={{ fontSize: 11, fontFamily: SANS, color: "#A8B5C4", textAlign: "center", borderTop: "1px solid rgba(12,31,53,0.05)", paddingTop: 10 }}>{caption}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Mission Journey (shared for both countries)
// ══════════════════════════════════════════════════════════════════════════════
function MissionJourneyScreen({ mission, onFinish, onTab, currentTab, gateIdx, onGateChange }: {
  mission: Mission; onFinish: () => void; onTab: (t: NavTab) => void;
  currentTab: NavTab; gateIdx: number; onGateChange: (idx: number) => void;
}) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = MISSION_META[mission];
  const gates = meta.gates;
  const gate = gates[gateIdx];
  const gateNum = gateIdx + 1;
  const isLast = gateIdx === gates.length - 1;

  useEffect(() => {
    setPlayingIdx(null); setPrayerOpen(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [gateIdx, mission]);

  const handleVocabPlay = (idx: number) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(gate.vocab[idx].word);
    utterance.lang = meta.speechLang; utterance.rate = 0.82; utterance.pitch = 1.0;
    setPlayingIdx(idx);
    utterance.onend = () => setPlayingIdx(null);
    utterance.onerror = () => setPlayingIdx(null);
    window.speechSynthesis.speak(utterance);
    setTimeout(() => setPlayingIdx((cur) => (cur === idx ? null : cur)), 3500);
  };

  const TINTS_ID = ["#FFF5E8", "#E8F5E0", "#E8E4F0", "#FFE8D8", "#E0F0E8", "#FFF8E0", "#FFE8E0"];
  const TINTS_JP = ["#FFF0F5", "#F0F8FF", "#F5F0FF", "#FFF5E0", "#F0FFF5", "#FFF8E8", "#FFE8F0"];
  const tints = mission === "indonesia" ? TINTS_ID : TINTS_JP;
  const tintHex = tints[gateIdx] ?? tints[0];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F6F5F1" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${mission}-${gateIdx}`} style={{ position: "relative", height: 200, overflow: "hidden" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <img src={gate.image} alt={gate.imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(12,31,53,0.06) 0%, ${tintHex}F2 100%)` }} />
            <div style={{ position: "absolute", inset: "0 0 0 0", padding: "0 20px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{meta.flag}</span>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: SANS, padding: "3px 9px", borderRadius: 10, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", color: "#0C1F35" }}>Gate {gateNum}</span>
                <GateProgress current={gateNum} total={7} />
              </div>
              <h2 style={{ fontSize: 20, fontFamily: SERIF, color: "#0C1F35", lineHeight: 1.2, marginBottom: 2 }}>{gate.title}</h2>
              <p style={{ fontSize: 11, fontFamily: SANS, color: "#6B7C92", fontWeight: 500 }}>{gate.subtitle}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0 2px" }}>
          {gates.map((_, i) => (
            <button key={i} onClick={() => onGateChange(i)} style={{ height: 5, borderRadius: 2.5, border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0, width: i === gateIdx ? 20 : 7, background: i === gateIdx ? "#0C1F35" : i < gateIdx ? "#B89A5E" : "rgba(12,31,53,0.15)" }} />
          ))}
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <BookOpen size={12} style={{ color: "#4A9FE0" }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase" }}>Vocabulary</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gate.vocab.map((v, i) => (
                <VocabCard key={i} word={v.word} romanization={v.romanization} english={v.english} isPlaying={playingIdx === i} onPlay={() => handleVocabPlay(i)} />
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: 13 }}>💬</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase" }}>Conversation</span>
            </div>
            <ConversationCard lines={gate.conversation} caption={gate.convCaption} speechLang={meta.speechLang} />
          </section>

          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 16px rgba(12,31,53,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{gate.cultureTip.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", fontFamily: SANS, color: "#7CA88A", textTransform: "uppercase" }}>Culture Tip</span>
            </div>
            <p style={{ fontSize: 14, fontFamily: SANS, fontWeight: 500, color: "#0C1F35", lineHeight: 1.65, marginBottom: 8 }}>{gate.cultureTip.body}</p>
            <p style={{ fontSize: 12, fontFamily: SANS, color: "#6B7C92", lineHeight: 1.6 }}>{gate.cultureTip.bridge}</p>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "18px 20px", borderLeft: "3px solid #B89A5E", boxShadow: "0 2px 16px rgba(12,31,53,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <Heart size={12} style={{ color: "#B89A5E" }} strokeWidth={2} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", fontFamily: SANS, color: "#B89A5E", textTransform: "uppercase" }}>Mission Tip</span>
            </div>
            <p style={{ fontSize: 14, fontFamily: SANS, fontWeight: 500, color: "#0C1F35", lineHeight: 1.65, marginBottom: 8 }}>{gate.missionTip.body}</p>
            <p style={{ fontSize: 12, fontFamily: SANS, color: "#6B7C92", lineHeight: 1.6 }}>{gate.missionTip.sub}</p>
          </div>

          <div style={{ borderRadius: 20, overflow: "hidden", background: "#0C1F35" }}>
            <button onClick={() => setPrayerOpen(!prayerOpen)} style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>🕊️</span>
                <span style={{ fontSize: 14, fontWeight: 600, fontFamily: SANS, color: "rgba(255,255,255,0.88)" }}>Prayer · Gate {gateNum}</span>
              </div>
              <motion.div animate={{ rotate: prayerOpen ? 90 : 0 }} transition={{ duration: 0.22 }}>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.35)" }} />
              </motion.div>
            </button>
            <AnimatePresence>
              {prayerOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                    <p style={{ fontSize: 13, fontFamily: SERIF, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, fontStyle: "italic" }}>{gate.prayer}</p>
                    <p style={{ fontSize: 11, fontFamily: SANS, color: "#B89A5E", fontWeight: 600, marginTop: 14 }}>
                      — {mission === "japan" ? "アーメン" : mission === "india" ? "आमेन" : "Amin"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button onClick={isLast ? onFinish : () => onGateChange(gateIdx + 1)}
            style={{ width: "100%", padding: "16px 24px", borderRadius: 18, background: "#0C1F35", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: SANS, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 24px rgba(12,31,53,0.28)" }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
          >
            {isLast ? "Complete Journey" : `Continue to Gate ${gateNum + 1}`}
            <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
          <div style={{ height: 4 }} />
        </div>
      </div>
      <BottomNav current={currentTab} onTab={onTab} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Mission Passport
// ══════════════════════════════════════════════════════════════════════════════
function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useContext(LangContext);
  const t = useT();
  return (
    <>
      <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute bottom-0 inset-x-0 z-40" style={{ background: "#0B1829", borderRadius: "24px 24px 0 0", border: "1px solid rgba(196,160,48,0.2)", borderBottom: "none" }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}>
        {/* Gold top stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #8B6914, #C9A84C, #F0D060, #C9A84C, #8B6914)", borderRadius: "24px 24px 0 0" }} />
        <div style={{ padding: "16px 22px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: SANS, color: "#FFFFFF", letterSpacing: "0.01em" }}>{t("settings.title")}</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} style={{ color: "rgba(255,255,255,0.7)" }} /></button>
          </div>
          {/* Language row */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", fontFamily: SANS, color: "rgba(196,160,48,0.7)", textTransform: "uppercase", marginBottom: 12 }}>{t("settings.language")}</p>
          <div style={{ display: "flex", gap: 10 }}>
            {(["ko", "en"] as Lang[]).map(l => {
              const label = l === "ko" ? t("settings.ko") : t("settings.en");
              const active = lang === l;
              return (
                <motion.button key={l} onClick={() => setLang(l)} whileTap={{ scale: 0.96 }}
                  style={{ flex: 1, padding: "14px 0", borderRadius: 16, border: `1.5px solid ${active ? "#C9A84C" : "rgba(255,255,255,0.1)"}`, background: active ? "rgba(196,160,48,0.12)" : "rgba(255,255,255,0.04)", cursor: "pointer", color: active ? "#C9A84C" : "rgba(255,255,255,0.45)", fontSize: 15, fontWeight: active ? 700 : 500, fontFamily: SANS, transition: "all 0.2s" }}>
                  {label}
                </motion.button>
              );
            })}
          </div>
          <motion.button onClick={onClose} whileTap={{ scale: 0.97 }} style={{ width: "100%", padding: "14px 0", borderRadius: 16, background: "#C9A84C", border: "none", cursor: "pointer", color: "#0B1829", fontSize: 15, fontWeight: 700, fontFamily: SANS, marginTop: 18 }}>
            {t("settings.done")}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

function MissionPassportScreen({ onTab, currentTab, photoUrl, userName, gateIdx, homeCountry, destination }: {
  onTab: (t: NavTab) => void; currentTab: NavTab; photoUrl: string | null; userName: string;
  gateIdx: Record<Mission, number>; homeCountry: string | null; destination: string | null;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const stamps = [
    { country: "Indonesia", emoji: "🇮🇩", obtained: true,  gates: gateIdx.indonesia + 1, total: 7, color: "#2A6B3A" },
    { country: "Japan",     emoji: "🇯🇵", obtained: true,  gates: gateIdx.japan + 1,     total: 7, color: "#8B1A2A" },
    { country: "India",     emoji: "🇮🇳", obtained: true,  gates: gateIdx.india + 1,     total: 7, color: "#1A4A8A" },
    { country: "Philippines", emoji: "🇵🇭", obtained: false, color: "#888" },
    { country: "Thailand",    emoji: "🇹🇭", obtained: false, color: "#888" },
    { country: "Vietnam",     emoji: "🇻🇳", obtained: false, color: "#888" },
  ];
  const totalGates = gateIdx.indonesia + gateIdx.japan + gateIdx.india + 3;
  const h = HOME_COUNTRIES.find(c => c.code === homeCountry);
  const d = DESTINATION_OPTIONS.find(c => c.code === destination);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #DAEEFF 0%, #C2E4FA 50%, #D8EEFF 100%)", overflow: "hidden" }}>

      {/* Sky texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(30,100,180,0.04) 27px, rgba(30,100,180,0.04) 28px)", pointerEvents: "none" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 20px 8px", gap: 12, overflow: "hidden", position: "relative" }}>

        {/* Cover header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.28em", fontFamily: SANS, color: "#1565A8", textTransform: "uppercase" }}>Kingdom of God</p>
            <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.12em", fontFamily: SANS, color: "#0D3666", textTransform: "uppercase", marginTop: 2 }}>Mission Passport</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <button onClick={() => setShowSettings(true)}
              style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(21,101,168,0.12)", border: "1px solid rgba(21,101,168,0.28)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Settings size={15} style={{ color: "#1565A8" }} strokeWidth={1.8} />
            </button>
            <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", fontFamily: SANS, color: "#1565A8", textTransform: "uppercase" }}>MT-000001</p>
          </div>
        </motion.div>

        {/* Biographical data page */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
          style={{ borderRadius: 20, overflow: "hidden", background: "#FFFFFF", boxShadow: "0 6px 28px rgba(13,54,102,0.14), 0 1px 6px rgba(13,54,102,0.08)", border: "1px solid rgba(21,101,168,0.1)" }}>

          {/* Gold top bar */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #7A560F, #B8892A, #DDB84A, #B8892A, #7A560F)" }} />

          <div style={{ padding: "14px 16px 0" }}>
            {/* Photo + identity */}
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ width: 64, height: 80, borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "2px solid #B8892A", background: "#F5F0E8" }}>
                {photoUrl
                  ? <img src={photoUrl} alt="Passport photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={24} style={{ color: "rgba(12,35,64,0.25)" }} strokeWidth={1.5} /></div>}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  {[
                    { label: "Surname / 성", value: userName || "YOUR NAME" },
                    { label: "Nationality / 국적", value: "Kingdom of God" },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", fontFamily: SANS, color: "#5C82A8", textTransform: "uppercase" }}>{f.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS, color: "#0D3666", letterSpacing: "0.03em" }}>{f.value}</p>
                    </div>
                  ))}
                </div>
                {/* Route pill */}
                {(h || d) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#E3F2FC", borderRadius: 8, padding: "5px 10px", alignSelf: "flex-start" }}>
                    <span style={{ fontSize: 14 }}>{h ? h.flag : "🌐"}</span>
                    <span style={{ fontSize: 9, color: "#5C82A8" }}>✈</span>
                    <span style={{ fontSize: 14 }}>{d ? d.flag : "🌐"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid rgba(12,35,64,0.08)", borderBottom: "1px solid rgba(12,35,64,0.08)" }}>
              {[{ label: "Gates", value: String(totalGates) }, { label: "Missions", value: "3" }, { label: "Nations", value: "3" }].map((s, i) => (
                <div key={s.label} style={{ padding: "8px 0", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(12,35,64,0.08)" : "none" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, fontFamily: SANS, color: "#0D3666" }}>{s.value}</p>
                  <p style={{ fontSize: 7, fontFamily: SANS, color: "#5C82A8", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MRZ strip */}
          <div style={{ padding: "6px 14px 8px", background: "#EAF4FC" }}>
            <p style={{ fontSize: 6, fontFamily: MONO, color: "#7AA0C0", letterSpacing: "0.14em", lineHeight: 2 }}>P&lt;KGD&lt;YOUR&lt;NAME&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />MT0000010KGD0000000&lt;0000000&lt;0</p>
          </div>
        </motion.div>

        {/* Stamps — visa pages */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
          style={{ flex: 1, borderRadius: 20, background: "#FFFFFF", boxShadow: "0 6px 28px rgba(13,54,102,0.12), 0 1px 6px rgba(13,54,102,0.07)", border: "1px solid rgba(21,101,168,0.1)", overflow: "hidden" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, #7A560F, #B8892A, #DDB84A, #B8892A, #7A560F)" }} />
          <div style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", fontFamily: SANS, color: "#5C82A8", textTransform: "uppercase" }}>Visa Stamps</p>
              <p style={{ fontSize: 8, fontWeight: 700, fontFamily: SANS, color: "#1565A8", letterSpacing: "0.08em" }}>3 / 6</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {stamps.map((s, i) => (
                <motion.div key={s.country} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 * i, duration: 0.32, type: "spring", stiffness: 260, damping: 20 }}>
                  {s.obtained ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 62, height: 62, borderRadius: "50%", border: `2px solid ${s.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, position: "relative", background: `${s.color}12` }}>
                        <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: `1px dashed ${s.color}66` }} />
                        <span style={{ fontSize: 20, position: "relative" }}>{s.emoji}</span>
                        <p style={{ fontSize: 6, fontWeight: 800, letterSpacing: "0.06em", fontFamily: SANS, color: s.color, textTransform: "uppercase", position: "relative" }}>{s.gates}/{s.total}</p>
                      </div>
                      <p style={{ fontSize: 8, fontWeight: 700, fontFamily: SANS, color: "#0D3666", textAlign: "center", letterSpacing: "0.03em" }}>{s.country}</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 62, height: 62, borderRadius: "50%", border: "1.5px dashed #A8C8E8", display: "flex", alignItems: "center", justifyContent: "center", background: "#EAF4FC" }}>
                        <span style={{ fontSize: 20, opacity: 0.3, filter: "grayscale(1)" }}>{s.emoji}</span>
                      </div>
                      <p style={{ fontSize: 8, fontFamily: SANS, color: "#7AA0C0", textAlign: "center" }}>{s.country}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
      <BottomNav current={currentTab} onTab={onTab} />
      <AnimatePresence>{showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}</AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN — Mission Log (편지통)
// ══════════════════════════════════════════════════════════════════════════════
const LOG_TYPE_META: { id: LogType; emoji: string; color: string; bg: string }[] = [
  { id: "expression", emoji: "💬", color: "#3B6FE0", bg: "#EEF3FF" },
  { id: "prayer",     emoji: "🙏", color: "#C4A030", bg: "#FDF8EE" },
  { id: "memory",     emoji: "📸", color: "#7CA88A", bg: "#EDF6F0" },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function LetterCard({ entry, onClick }: { entry: LogEntry; onClick: () => void }) {
  const t = useT();
  const meta = LOG_TYPE_META.find(m => m.id === entry.type)!;
  const labelKey = `log.${entry.type}` as StringKey;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, rotate: -0.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(12,31,53,0.14)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ background: "#FFFCF5", borderRadius: 20, overflow: "hidden", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(12,31,53,0.08), 0 1px 3px rgba(12,31,53,0.04)",
        border: "1px solid rgba(12,31,53,0.06)",
        transition: "box-shadow 0.2s" }}
    >
      {/* Envelope V-flap visual */}
      <div style={{ position: "relative", height: 28, background: meta.bg, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
          borderLeft: "195px solid transparent", borderRight: "195px solid transparent",
          borderBottom: `18px solid #FFFCF5` }} />
        <div style={{ position: "absolute", top: 6, right: 14, width: 26, height: 32,
          border: `1.5px solid ${meta.color}66`, borderRadius: 3, background: "#FFFCF5",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <span style={{ fontSize: 11 }}>{meta.emoji}</span>
          <p style={{ fontSize: 4.5, fontWeight: 800, color: meta.color, fontFamily: MONO, letterSpacing: "0.06em" }}>SENT</p>
        </div>
      </div>
      <div style={{ padding: "10px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: meta.color, fontFamily: SANS, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t(labelKey)}</span>
          <span style={{ fontSize: 8, color: "rgba(12,31,53,0.3)", fontFamily: SANS }}>· {formatDate(entry.date)}</span>
        </div>
        {entry.title && <p style={{ fontSize: 13, fontWeight: 700, color: "#0B1829", fontFamily: SANS, marginBottom: 4 }}>{entry.title}</p>}
        <p style={{ fontSize: 12, color: "rgba(12,31,53,0.6)", fontFamily: SANS, lineHeight: 1.65,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{entry.body}</p>
        {entry.photoUrl && (
          <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", height: 76 }}>
            <img src={entry.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ComposeSheet({ onSave, onClose }: { onSave: (e: Omit<LogEntry, "id" | "date">) => void; onClose: () => void }) {
  const t = useT();
  const [type, setType] = useState<LogType>("expression");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = LOG_TYPE_META.find(m => m.id === type)!;

  const handleSave = () => {
    if (!body.trim()) return;
    onSave({ type, title, body, photoUrl: photo ?? undefined });
    onClose();
  };

  const bodyPlaceholder = type === "expression" ? t("log.bodyExpression") : type === "prayer" ? t("log.bodyPrayer") : t("log.bodyMemory");

  return (
    <>
      <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(8,16,32,0.5)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute bottom-0 inset-x-0 z-40" style={{ background: "#FFFCF5", borderRadius: "26px 26px 0 0", maxHeight: "82%" }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(12,31,53,0.15)" }} />
        </div>
        <div style={{ padding: "8px 20px 32px", overflowY: "auto", maxHeight: "75vh" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, fontFamily: SANS, color: "#0B1829" }}>{t("log.compose")}</h3>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(12,31,53,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} style={{ color: "#0B1829" }} /></button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {LOG_TYPE_META.map(m => {
              const lk = `log.${m.id}` as StringKey;
              return (
                <motion.button key={m.id} onClick={() => setType(m.id)} whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: "9px 6px", borderRadius: 14, border: `1.5px solid ${type === m.id ? m.color : "rgba(12,31,53,0.1)"}`, background: type === m.id ? m.bg : "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.18s" }}>
                  <span style={{ fontSize: 18 }}>{m.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: SANS, color: type === m.id ? m.color : "rgba(12,31,53,0.4)" }}>{t(lk)}</span>
                </motion.button>
              );
            })}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("log.titlePlaceholder")}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: "1.5px solid rgba(12,31,53,0.1)", background: "#FFFFFF", fontFamily: SANS, fontSize: 14, color: "#0B1829", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={bodyPlaceholder} rows={4}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1.5px solid rgba(12,31,53,0.1)", background: "#FFFFFF", fontFamily: SANS, fontSize: 14, color: "#0B1829", outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box", marginBottom: 12 }} />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
          {photo ? (
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", height: 120, marginBottom: 14 }}>
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setPhoto(null)} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} style={{ color: "#FFFFFF" }} /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              style={{ width: "100%", padding: "11px 0", borderRadius: 14, border: "1.5px dashed rgba(12,31,53,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              <ImagePlus size={16} style={{ color: "rgba(12,31,53,0.35)" }} />
              <span style={{ fontSize: 13, fontFamily: SANS, color: "rgba(12,31,53,0.4)" }}>{t("log.addPhoto")}</span>
            </button>
          )}
          <motion.button onClick={handleSave} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "14px 0", borderRadius: 16, background: body.trim() ? meta.color : "rgba(12,31,53,0.1)", border: "none", cursor: body.trim() ? "pointer" : "default", color: body.trim() ? "#FFFFFF" : "rgba(12,31,53,0.3)", fontSize: 15, fontWeight: 700, fontFamily: SANS, transition: "background 0.2s" }}>
            {t("log.send")}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

function MissionLogScreen({ entries, onAdd, onDelete, onTab, currentTab }: {
  entries: LogEntry[];
  onAdd: (e: Omit<LogEntry, "id" | "date">) => void;
  onDelete: (id: string) => void;
  onTab: (t: NavTab) => void;
  currentTab: NavTab;
}) {
  const t = useT();
  const [composing, setComposing] = useState(false);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const totalLetters = entries.length;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F5EFE3", overflow: "hidden" }}>

      {/* Rich hero header */}
      <div style={{ background: "linear-gradient(160deg, #0B1829 0%, #1A2E48 100%)", paddingTop: 52, paddingBottom: 24, paddingLeft: 22, paddingRight: 22, position: "relative", overflow: "hidden", flexShrink: 0 }}>
        {/* Decorative postmark ring */}
        <div style={{ position: "absolute", right: -28, top: -28, width: 140, height: 140, borderRadius: "50%", border: "2px dashed rgba(196,160,48,0.18)" }} />
        <div style={{ position: "absolute", right: -10, top: -10, width: 100, height: 100, borderRadius: "50%", border: "1.5px dashed rgba(196,160,48,0.12)" }} />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", fontFamily: SANS, color: "rgba(196,160,48,0.7)", textTransform: "uppercase", marginBottom: 6 }}>{t("log.title")}</p>
              <h2 style={{ fontSize: 32, fontFamily: SERIF, color: "#FFFFFF", lineHeight: 1.1, fontStyle: "italic", marginBottom: 4 }}>{t("log.subtitle")}</h2>
              <p style={{ fontSize: 11, fontFamily: SANS, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{t("log.subtitleSub")}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 32 }}>📬</span>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: SANS, color: "#C9A84C", marginTop: 4 }}>{totalLetters}</p>
              <p style={{ fontSize: 8, fontFamily: SANS, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>LETTERS</p>
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {LOG_TYPE_META.map(m => {
              const lk = `log.${m.id}` as StringKey;
              const count = entries.filter(e => e.type === m.id).length;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: 12 }}>{m.emoji}</span>
                  <span style={{ fontSize: 10, fontFamily: SANS, color: "rgba(255,255,255,0.6)" }}>{t(lk)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS, color: m.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Letters list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 96px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <AnimatePresence>
          {entries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 48, gap: 12 }}>
              <span style={{ fontSize: 48 }}>📬</span>
              <p style={{ fontSize: 15, fontFamily: SERIF, color: "rgba(12,31,53,0.45)", fontStyle: "italic", textAlign: "center", whiteSpace: "pre-line" }}>{t("log.empty")}</p>
            </motion.div>
          ) : (
            [...entries].reverse().map(entry => (
              <LetterCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button onClick={() => setComposing(true)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
        style={{ position: "absolute", bottom: 88, right: 22, width: 52, height: 52, borderRadius: 26, background: "#0B1829", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(11,24,41,0.35)" }}>
        <Plus size={22} style={{ color: "#FFFFFF" }} strokeWidth={2.5} />
      </motion.button>

      {/* Letter detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(8,16,32,0.5)", backdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelected(null); setConfirmDelete(null); }} />
            <motion.div className="absolute inset-x-0 bottom-0 z-40" style={{ background: "#FDFAF4", borderRadius: "26px 26px 0 0", maxHeight: "78%" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(12,31,53,0.15)" }} />
              </div>
              {(() => {
                const meta = LOG_TYPE_META.find(x => x.id === selected.type)!;
                const lk = `log.${selected.type}` as StringKey;
                return (
                  <div style={{ padding: "8px 22px 36px", overflowY: "auto", maxHeight: "70vh" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, fontFamily: SANS }}>{t(lk)}</p>
                        <p style={{ fontSize: 10, color: "rgba(12,31,53,0.38)", fontFamily: SANS }}>{formatDate(selected.date)}</p>
                      </div>
                      <button onClick={() => { setSelected(null); setConfirmDelete(null); }} style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 15, background: "rgba(12,31,53,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} style={{ color: "#0B1829" }} /></button>
                    </div>
                    {selected.title && <p style={{ fontSize: 18, fontWeight: 700, fontFamily: SANS, color: "#0B1829", marginBottom: 10 }}>{selected.title}</p>}
                    <p style={{ fontSize: 14, fontFamily: SANS, color: "rgba(12,31,53,0.75)", lineHeight: 1.75 }}>{selected.body}</p>
                    {selected.photoUrl && (
                      <div style={{ marginTop: 16, borderRadius: 16, overflow: "hidden" }}>
                        <img src={selected.photoUrl} alt="" style={{ width: "100%", objectFit: "cover", maxHeight: 220 }} />
                      </div>
                    )}
                    {/* Delete button */}
                    <div style={{ marginTop: 24, borderTop: "1px solid rgba(12,31,53,0.07)", paddingTop: 16 }}>
                      {confirmDelete === selected.id ? (
                        <div style={{ display: "flex", gap: 10 }}>
                          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setConfirmDelete(null)}
                            style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "1.5px solid rgba(12,31,53,0.12)", background: "transparent", cursor: "pointer", fontSize: 14, fontFamily: SANS, color: "rgba(12,31,53,0.55)", fontWeight: 500 }}>
                            취소
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { onDelete(selected.id); setSelected(null); setConfirmDelete(null); }}
                            style={{ flex: 1, padding: "12px 0", borderRadius: 14, border: "none", background: "#E53935", cursor: "pointer", fontSize: 14, fontFamily: SANS, color: "#FFFFFF", fontWeight: 700 }}>
                            삭제하기
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmDelete(selected.id)}
                          style={{ width: "100%", padding: "12px 0", borderRadius: 14, border: "1.5px solid rgba(229,57,53,0.25)", background: "rgba(229,57,53,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                          <Trash2 size={15} style={{ color: "#E53935" }} strokeWidth={1.8} />
                          <span style={{ fontSize: 14, fontFamily: SANS, color: "#E53935", fontWeight: 600 }}>편지 삭제</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {composing && <ComposeSheet onSave={onAdd} onClose={() => setComposing(false)} />}
      </AnimatePresence>

      <BottomNav current={currentTab} onTab={onTab} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN TRANSITIONS
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_ORDER: Screen[] = ["welcome", "passport-office", "board", "journey", "passport"];

function getBoardingPassVariants(direction: 1 | -1) {
  return {
    enter: { y: direction > 0 ? "100%" : "-100%", rotateX: direction > 0 ? -6 : 6, scale: 0.97, opacity: 0 },
    center: { y: 0, rotateX: 0, scale: 1, opacity: 1 },
    exit: { y: direction > 0 ? "-10%" : "10%", rotateX: direction > 0 ? 4 : -4, scale: 0.94, opacity: 0 },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [homeCountry, setHomeCountry] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [activeMission, setActiveMission] = useState<Mission>("indonesia");
  const [gateIdx, setGateIdx] = useState<Record<Mission, number>>({ indonesia: 0, japan: 0, india: 0 });
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [userName, setUserName] = useState("");
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith("ko") ? "ko" : "en");
  const sky = useLivingSky();

  const handleAddLog = (entry: Omit<LogEntry, "id" | "date">) => {
    setLogEntries(prev => [...prev, { ...entry, id: Date.now().toString(), date: new Date() }]);
  };

  const handleDeleteLog = (id: string) => {
    setLogEntries(prev => prev.filter(e => e.id !== id));
  };

  const goToScreen = (next: Screen, tab?: NavTab) => {
    const cur = SCREEN_ORDER.indexOf(screen); const nxt = SCREEN_ORDER.indexOf(next);
    setDirection(nxt >= cur ? 1 : -1); setScreen(next);
    if (tab) setNavTab(tab);
  };

  const handleTab = (tab: NavTab) => {
    setNavTab(tab);
    if (tab === "home") goToScreen("board");
    else if (tab === "journey") goToScreen("journey");
    else if (tab === "log") goToScreen("log");
    else if (tab === "passport") goToScreen("passport");
  };

  const handleStartJourney = (m: Mission) => {
    setActiveMission(m);
    goToScreen("journey", "journey");
  };

  const handleGateChange = (idx: number) => {
    setGateIdx((prev) => ({ ...prev, [activeMission]: idx }));
  };

  const variants = getBoardingPassVariants(direction);
  const statusLight = screen === "passport" || screen === "welcome" || sky.textLight;

  const renderScreen = () => {
    switch (screen) {
      case "welcome": return <WelcomeScreen sky={sky} onNext={() => goToScreen("passport-office")} onSkip={() => goToScreen("board", "home")} />;
      case "passport-office": return <PassportOfficeScreen
        onNext={() => {
          const destMission = DESTINATION_OPTIONS.find(d => d.code === destination)?.mission;
          if (destMission) setActiveMission(destMission);
          goToScreen("board", "home");
        }}
        photoUrl={photoUrl} onPhotoChange={setPhotoUrl}
        userName={userName} onUserNameChange={setUserName}
        homeCountry={homeCountry} destination={destination}
        onHomeCountryChange={setHomeCountry}
        onDestinationChange={(code) => {
          setDestination(code);
          const m = DESTINATION_OPTIONS.find(d => d.code === code)?.mission;
          if (m) setActiveMission(m);
        }}
      />;
      case "board": return <MissionBoardScreen onTab={handleTab} currentTab={navTab} onStartJourney={handleStartJourney} gateIdx={gateIdx} missionGates={{ indonesia: 7, japan: 7, india: 7 }} onOpenTool={(s) => goToScreen(s)} />;
      case "journey": return <MissionJourneyScreen mission={activeMission} onFinish={() => goToScreen("passport", "passport")} onTab={handleTab} currentTab={navTab} gateIdx={gateIdx[activeMission]} onGateChange={handleGateChange} />;
      case "four-laws": return <FourLawsScreen onBack={() => goToScreen("board", "home")} />;
      case "street-ev": return <StreetEvScreen onBack={() => goToScreen("board", "home")} />;
      case "log": return <MissionLogScreen entries={logEntries} onAdd={handleAddLog} onDelete={handleDeleteLog} onTab={handleTab} currentTab={navTab} />;
      case "passport": return <MissionPassportScreen onTab={handleTab} currentTab={navTab} photoUrl={photoUrl} userName={userName} gateIdx={gateIdx} homeCountry={homeCountry} destination={destination} />;
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <motion.div className="min-h-screen flex items-center justify-center" animate={{ background: sky.outerBg }} transition={{ duration: 3, ease: "easeInOut" }}>
      <div style={{ position: "relative", width: 390, height: 844, borderRadius: 54, background: "#0A0A0A", boxShadow: "0 0 0 1px #2A2A2A, 0 0 0 8px #151515, 0 0 0 10px #222222, 0 56px 140px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.35)", fontFamily: SANS, overflow: "hidden", perspective: "1200px" }}>
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 50, width: 120, height: 34, background: "#000000", borderRadius: 20 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px 0" }}>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: SANS, color: statusLight ? "rgba(255,255,255,0.72)" : "rgba(12,31,53,0.65)" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>{[3, 5, 7, 9].map((h, i) => (<div key={i} style={{ width: 3, height: h, borderRadius: 1, background: statusLight ? "rgba(255,255,255,0.58)" : "rgba(12,31,53,0.45)" }} />))}</div>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 2.5C9.2 2.5 10.7 3.2 11.8 4.3L13.2 2.9C11.7 1.4 9.7 0.5 7.5 0.5C5.3 0.5 3.3 1.4 1.8 2.9L3.2 4.3C4.3 3.2 5.8 2.5 7.5 2.5Z" fill={statusLight ? "rgba(255,255,255,0.58)" : "rgba(12,31,53,0.45)"} />
              <path d="M7.5 5.5C8.5 5.5 9.4 5.9 10 6.6L11.4 5.2C10.4 4.2 9 3.5 7.5 3.5C6 3.5 4.6 4.2 3.6 5.2L5 6.6C5.6 5.9 6.5 5.5 7.5 5.5Z" fill={statusLight ? "rgba(255,255,255,0.58)" : "rgba(12,31,53,0.45)"} />
              <circle cx="7.5" cy="9" r="1.5" fill={statusLight ? "rgba(255,255,255,0.58)" : "rgba(12,31,53,0.45)"} />
            </svg>
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              <div style={{ width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${statusLight ? "rgba(255,255,255,0.45)" : "rgba(12,31,53,0.38)"}`, padding: 1.5, display: "flex", alignItems: "center" }}>
                <div style={{ width: "75%", height: "100%", borderRadius: 1.5, background: statusLight ? "rgba(255,255,255,0.6)" : "rgba(12,31,53,0.5)" }} />
              </div>
              <div style={{ width: 2, height: 5, borderRadius: 1, background: statusLight ? "rgba(255,255,255,0.35)" : "rgba(12,31,53,0.3)" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 54, perspective: "1000px" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={screen} style={{ position: "absolute", inset: 0, transformOrigin: "center bottom", transformStyle: "preserve-3d" }} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.46, ease: [0.25, 0.46, 0.45, 0.94], opacity: { duration: 0.28 } }}>
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 50, width: 120, height: 4, borderRadius: 2, background: statusLight ? "rgba(255,255,255,0.28)" : "rgba(12,31,53,0.18)" }} />
      </div>
      <div style={{ position: "absolute", bottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        {SCREEN_ORDER.map((s) => (
          <button key={s} onClick={() => { if (s === "board") goToScreen(s, "home"); else if (s === "journey") goToScreen(s, "journey"); else if (s === "passport") goToScreen(s, "passport"); else goToScreen(s); }} style={{ height: 6, borderRadius: 3, border: "none", cursor: "pointer", transition: "all 0.3s ease", width: screen === s ? 24 : 6, background: screen === s ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
    </motion.div>
    </LangContext.Provider>
  );
}
