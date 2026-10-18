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
type Mission = "indonesia" | "japan" | "india" | "brazil" | "mexico" | "china" | "cambodia" | "vietnam";
type LogType = "expression" | "prayer" | "memory";
interface LogEntry {
  id: string;
  date: Date;
  type: LogType;
  title: string;
  body: string;
  photoUrl?: string;
  emoji?: string;
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
  { flag: "🇻🇳", name: "Vietnam",     code: "VNM", mission: "vietnam" },
  { flag: "🇰🇭", name: "Cambodia",    code: "KHM", mission: "cambodia" },
  { flag: "🇮🇩", name: "Indonesia",   code: "IDN", mission: "indonesia" },
  { flag: "🇯🇵", name: "Japan",       code: "JPN", mission: "japan" },
  { flag: "🇮🇳", name: "India",       code: "IND", mission: "india" },
  { flag: "🇨🇳", name: "China",       code: "CHN", mission: "china" },
  { flag: "🇲🇽", name: "Mexico",      code: "MEX", mission: "mexico" },
  { flag: "🇧🇷", name: "Brazil",      code: "BRA", mission: "brazil" },
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

        {/* Country selectors — Flight booking style */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", fontFamily: SANS, color: "#0C1F35", textTransform: "uppercase", marginBottom: 14 }}>Find Your Flight</p>

          {/* Flight booking container */}
          <div style={{ background: "rgba(74,159,224,0.04)", borderRadius: 20, padding: "18px", border: "1.5px solid rgba(74,159,224,0.12)", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* From — Departure */}
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", fontFamily: SANS, color: "#5C82A8", textTransform: "uppercase", marginBottom: 8 }}>✈️ Departing from</p>
              <motion.button onClick={() => setShowHomePicker(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: homeOpt ? "#FFFFFF" : "rgba(255,255,255,0.6)", border: homeOpt ? "1.5px solid #4A9FE0" : "1.5px solid rgba(74,159,224,0.2)", cursor: "pointer", textAlign: "left", boxShadow: homeOpt ? "0 4px 12px rgba(74,159,224,0.15)" : "0 1px 4px rgba(74,159,224,0.05)", transition: "all 0.2s" }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{homeOpt ? homeOpt.flag : "🌍"}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontFamily: SANS, color: homeOpt ? "#0C1F35" : "#7A91AB", fontWeight: 700 }}>{homeOpt ? homeOpt.name : "Select departure country"}</p>
                </div>
                <ChevronDown size={16} style={{ color: "#4A9FE0", flexShrink: 0 }} />
              </motion.button>
            </div>

            {/* Divider with flight icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: "1.5px", background: "linear-gradient(90deg, rgba(74,159,224,0.1) 0%, rgba(74,159,224,0.3) 50%, rgba(74,159,224,0.1) 100%)" }} />
              <div style={{ width: 28, height: 28, borderRadius: 14, background: "#FFFFFF", border: "1.5px solid rgba(74,159,224,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✈️</div>
              <div style={{ flex: 1, height: "1.5px", background: "linear-gradient(90deg, rgba(74,159,224,0.1) 0%, rgba(74,159,224,0.3) 50%, rgba(74,159,224,0.1) 100%)" }} />
            </div>

            {/* To — Destination */}
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", fontFamily: SANS, color: "#5C82A8", textTransform: "uppercase", marginBottom: 8 }}>📍 Mission destination</p>
              <motion.button onClick={() => setShowDestPicker(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: destOpt ? "#FFFFFF" : "rgba(255,255,255,0.6)", border: destOpt ? "1.5px solid #7CA88A" : "1.5px solid rgba(124,168,138,0.2)", cursor: "pointer", textAlign: "left", boxShadow: destOpt ? "0 4px 12px rgba(124,168,138,0.15)" : "0 1px 4px rgba(124,168,138,0.05)", transition: "all 0.2s" }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{destOpt ? destOpt.flag : "🌎"}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontFamily: SANS, color: destOpt ? "#0C1F35" : "#7A91AB", fontWeight: 700 }}>{destOpt ? destOpt.name : "Select destination"}</p>
                </div>
                <ChevronDown size={16} style={{ color: "#7CA88A", flexShrink: 0 }} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Issue button — Book Flight style */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.4 }} style={{ marginTop: 22, paddingBottom: 8 }}>
          <motion.button onClick={handleIssue} disabled={phase !== "idle"}
            style={{ width: "100%", padding: "16px 24px", borderRadius: 16, background: phase !== "idle" ? "rgba(12,31,53,0.4)" : "linear-gradient(135deg, #0C1F35 0%, #1A2F47 100%)", border: "none", cursor: phase !== "idle" ? "default" : "pointer", fontSize: 15, fontWeight: 700, fontFamily: SANS, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: phase !== "idle" ? "0 4px 16px rgba(12,31,53,0.15)" : "0 12px 40px rgba(12,31,53,0.35)", opacity: phase !== "idle" ? 0.7 : 1, letterSpacing: "0.05em" }}
            whileHover={phase === "idle" ? { scale: 1.02, boxShadow: "0 16px 48px rgba(12,31,53,0.4)" } : {}} whileTap={phase === "idle" ? { scale: 0.96 } : {}}
          >
            {phase === "idle" ? <><span>🎫</span> Book My Journey</> : phase === "stamping" ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>📍</motion.span> Booking...</> : <><span>✅</span> Journey Confirmed</>}
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
  quiz?: { question: string; options: string[]; answer: string; explanation: string };
  cultureTip: { emoji: string; body: string; bridge: string };
  missionTip: { body: string; sub: string };
  prayer: string;
}

const INDIA_SONG_LYRICS = `1. Yeeshu ke peechhe main chalne laga
   Na lautoonga

2. Sansaar ko chhokar saleeb ko lekar
   Na lautoonga

3. Gar kori mere saath na aave
   Na lautoonga

4. Agar main uska inkaar na karoon
   Taaj paunga, Na lautoonga

5. Yeeshu ke peechhe main chalne laga
   Na lautoonga

English translation:

1. I began to follow Jesus
   I will not turn back

2. Leaving the world behind, carrying the cross
   I will not turn back

3. If the cross does not go with me
   I will not turn back

4. If I do not deny Him
   I will be crowned, I will not turn back

5. I began to follow Jesus
   I will not turn back`;

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
    title: "Jai Masih Ki — Greetings", subtitle: "Greeting in the name of Jesus",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Colorful streets of India",
    vocab: [
      { word: "जय मसीह की", romanization: "Jai Masih Ki", english: "Hail Christ / Praise Jesus" },
      { word: "धन्यवाद", romanization: "Dhanyavaad", english: "Thank you" },
      { word: "भगवान", romanization: "Bhagwaan", english: "God / Lord" },
      { word: "प्रेम", romanization: "Prem", english: "Love" },
      { word: "यीशु", romanization: "Yeesu", english: "Jesus" },
    ],
    conversation: [
      { word: "जय मसीह की! आपका नाम क्या है?", romanization: "Jai Masih Ki! Aapka naam kya hai?", english: "Hail Christ! What is your name?", mine: false },
      { word: "मेरा नाम [नाम] है। आपसे मिलकर खुशी हुई! जय मसीह की!", romanization: "Mera naam [naam] hai. Aapse milkar khushi hui! Jai Masih Ki!", english: "My name is [name]. It is a joy to meet you! Hail Christ!", mine: true },
    ],
    convCaption: '"Hail Christ! What is your name?" · "My name is [name]. It is a joy to meet you! Hail Christ!"',
    quiz: {
      question: "Which Christian greeting is a joyful way to greet someone in India?",
      options: ["Jai Masih Ki", "Dhanyavaad", "Mera naam hai", "Aashirvaad"],
      answer: "Jai Masih Ki",
      explanation: "Jai Masih Ki is a warm Christian greeting that honors Jesus and opens conversation with joy and faith.",
    },
    cultureTip: { emoji: "✝️", body: "Namaste is a beautiful and respectful greeting in general Indian culture, but among many Christians, 'Jai Masih Ki' is a joyful and deeply spiritual greeting that honors Jesus and shares the hope of Christ.", bridge: "When you greet in Jesus' name, you are not only being polite — you are declaring that the risen Christ is with you." },
    missionTip: { body: "When speaking with believers or Christian communities, begin with a warm 'Jai Masih Ki' and then move into conversation with sincerity. It opens the heart and shows you come in the name of Christ.", sub: "Jesus was known for meeting people with grace and love. A Christ-centered greeting meets people with warmth and truth." },
    prayer: "\"Lord, as I greet the people of India, may my words carry the joy of Christ. Let every 'Jai Masih Ki' be a testimony of your love and hope.\"",
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
    quiz: {
      question: "What is a good question to ask when you want to build trust in India?",
      options: ["What is your family like?", "How much money do you make?", "Do you have a car?", "What is the weather today?"],
      answer: "What is your family like?",
      explanation: "Family is one of the strongest bridge points in Indian culture, and it helps build trust and connection quickly.",
    },
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
    quiz: {
      question: "Which word means 'faith' or 'trust'?",
      options: ["Vishwaas", "Khaana", "Aashirvaad", "Dost"],
      answer: "Vishwaas",
      explanation: "Vishwaas means faith or trust, which is a helpful word when talking about spiritual conversations in India.",
    },
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
    quiz: {
      question: "Which word means 'forgiveness'?",
      options: ["Kshama", "Chai", "Saath", "Mukti"],
      answer: "Kshama",
      explanation: "Kshama means forgiveness, which is a key part of the Gospel message in India.",
    },
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
    quiz: {
      question: "Which word means 'prayer'?",
      options: ["Praarthana", "Dost", "Aashirvaad", "Gaanv"],
      answer: "Praarthana",
      explanation: "Praarthana means prayer, and it is a simple but powerful word in spiritual conversations in India.",
    },
    cultureTip: { emoji: "🙏", body: "Prayer and blessing are deeply woven into Indian life. Elders bless children daily. Priests bless food. Asking to pray for someone is an act of honor.", bridge: "When you offer to pray in Jesus\' name, you are entering an ancient spiritual current — redirect it toward its source." },
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
    quiz: {
      question: "What is one of the clearest signs of hospitality in India?",
      options: ["Offering chai", "Asking for a car", "Talking only about work", "Leaving early"],
      answer: "Offering chai",
      explanation: "Offering chai is a classic sign of welcome and hospitality in India, and it often opens the door to deeper connection.",
    },
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
    quiz: {
      question: "Which phrase means 'We will meet again'?",
      options: ["Phir Milenge", "Praarthana", "Aashirvaad", "Dost"],
      answer: "Phir Milenge",
      explanation: "Phir Milenge is a warm farewell phrase that means 'We will meet again.'",
    },
    cultureTip: { emoji: "🌅", body: "Indian goodbyes can last a long time — walking someone to the gate, the street, the corner. Rushing a goodbye is rude. The farewell itself is part of the relationship.", bridge: "A goodbye that takes time says: this relationship matters. That is the Gospel in action." },
    missionTip: { body: "Speak a specific blessing over each person. In Hindi culture, the blessing of an elder or a holy person is treasured. You carry that authority.", sub: "'May God's peace follow you every day' — spoken with sincerity — will be remembered long after you leave." },
    prayer: '"Father, I release every person I met in India into your hands. You love them more than I do. Continue the work you began — in your time, in your way, by your Spirit."',
  },
];

const GATES_MEXICO: GateData[] = [
  {
    title: "Hola — Saludos",
    subtitle: "Conexión con el corazón",
    image: "https://images.unsplash.com/photo-1552283028-1b34444968f8?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Colores vibrantes de México",
    vocab: [
      { word: "Hola", romanization: "Ola", english: "Hello" },
      { word: "Gracias", romanization: "Gracias", english: "Thank you" },
      { word: "Dios", romanization: "Dios", english: "God" },
      { word: "Amor", romanization: "Amor", english: "Love" },
      { word: "Jesús", romanization: "Jesús", english: "Jesus" },
    ],
    conversation: [
      { word: "¡Hola! ¿Cuál es tu nombre?", romanization: "Ola! Kwal es tu nombre?", english: "Hello! What is your name?", mine: false },
      { word: "Mi nombre es [nombre]. ¡Mucho gusto!", romanization: "Mi nombre es [nombre]. Mucho gusto!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"¡Hola! What is your name?" · "Mi nombre es [nombre]"',
    cultureTip: { emoji: "🌺", body: "In Mexico, greetings are warm and personal. A handshake with direct eye contact shows respect and genuine interest.", bridge: "Jesús greeted the outcast and the enemy with warmth. That is your model." },
    missionTip: { body: "Mexican people value family and community above all. Personalize your greeting — learn names, remember details, show you care.", sub: "Every greeting is an opportunity to demonstrate the love of Christ." },
    prayer: '"Lord, let my greetings in Mexico be genuine and warm. Help me see Jesus in every face I meet today."',
  },
  {
    title: "Historia — Tu Camino",
    subtitle: "Compartiendo vidas, no solo palabras",
    image: "https://images.unsplash.com/photo-1484707849519-3aceffb790d9?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Pueblo colorido en México",
    vocab: [
      { word: "Familia", romanization: "Familia", english: "Family" },
      { word: "Trabajo", romanization: "Trabajo", english: "Work" },
      { word: "Casa", romanization: "Casa", english: "Home" },
      { word: "Sueño", romanization: "Sueño", english: "Dream" },
      { word: "Amigo", romanization: "Amigo", english: "Friend" },
    ],
    conversation: [
      { word: "¿De dónde eres?", romanization: "De donde eres?", english: "Where are you from?", mine: false },
      { word: "Soy de [pueblo]. Tengo una familia hermosa.", romanization: "Soy de [pueblo]. Tengo una familia hermosa.", english: "I'm from [town]. I have a beautiful family.", mine: true },
    ],
    convCaption: '"Where are you from?" · "I\'m from [town]. I have a beautiful family."',
    cultureTip: { emoji: "🏡", body: "Family is the center of Mexican life. When you ask about family, you ask about what matters most.", bridge: "Jesus built His church on family — a new kind of family that transcends blood." },
    missionTip: { body: "Listen to the whole story before sharing yours. Mexicans tell stories in layers — take time to understand the depth.", sub: "Your attentiveness to their story is a reflection of Jesus' attentiveness to yours." },
    prayer: '"Father, help me listen with the heart of Jesus. Let me understand not just words, but the dreams and struggles behind them."',
  },
  {
    title: "Fe — Palabras del Corazón",
    subtitle: "Lo que creemos determina cómo vivimos",
    image: "https://images.unsplash.com/photo-1504681869696-d977e3928dd1?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Iglesia tradicional en México",
    vocab: [
      { word: "Fe", romanization: "Fe", english: "Faith" },
      { word: "Oración", romanization: "Oración", english: "Prayer" },
      { word: "Paz", romanization: "Paz", english: "Peace" },
      { word: "Esperanza", romanization: "Esperanza", english: "Hope" },
      { word: "Salvación", romanization: "Salvación", english: "Salvation" },
    ],
    conversation: [
      { word: "¿En qué crees?", romanization: "En que crees?", english: "What do you believe in?", mine: false },
      { word: "Creo en Jesús. Él da paz verdadera.", romanization: "Creo en Jesús. Él da paz verdadera.", english: "I believe in Jesus. He gives true peace.", mine: true },
    ],
    convCaption: '"What do you believe?" · "I believe in Jesus. He gives true peace."',
    cultureTip: { emoji: "✝️", body: "Mexico has deep Catholic roots, but Mexicans are open to spiritual conversation. Faith is part of daily life and struggle.", bridge: "Jesus meets people where they are spiritually and invites them deeper into truth." },
    missionTip: { body: "Speak about Jesus with confidence, not apology. Mexicans respect conviction paired with humility.", sub: "Share how Jesus changed your life — personal testimony is powerful." },
    prayer: '"Jesus, give me boldness to speak your name in Mexico. Meet me with your peace as I share about you."',
  },
  {
    title: "Evangelio — Buenas Noticias",
    subtitle: "La historia que cambia todo",
    image: "https://images.unsplash.com/photo-1578926078328-123d5d3f3b20?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Paisaje hermoso de México",
    vocab: [
      { word: "Pecado", romanization: "Pecado", english: "Sin" },
      { word: "Perdón", romanization: "Perdón", english: "Forgiveness" },
      { word: "Vida", romanization: "Vida", english: "Life" },
      { word: "Cruz", romanization: "Cruz", english: "Cross" },
      { word: "Resurrección", romanization: "Resurrección", english: "Resurrection" },
    ],
    conversation: [
      { word: "Dios te ama profundamente.", romanization: "Dios te ama profundamente.", english: "God loves you deeply.", mine: true },
      { word: "¿De verdad? ¿Cómo lo sabes?", romanization: "De verdad? Como lo sabes?", english: "Really? How do you know?", mine: false },
      { word: "Jesús murió en la cruz por nosotros.", romanization: "Jesús murió en la cruz por nosotros.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you deeply." · "How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "❤️", body: "Mexican spirituality is passionate and communal. People respond to the love of Christ when it is spoken with emotion and conviction.", bridge: "The death and resurrection of Jesus is not doctrine — it is love in action." },
    missionTip: { body: "Appeal to the heart, not just the mind. Mexicans respond to a God who feels, suffers, and loves.", sub: "Jesus at the cross is God's ultimate act of love — present that clearly." },
    prayer: '"Holy Spirit, help me speak with the heart of Jesus to the heart of Mexico. Let them feel your love, not just hear about it."',
  },
  {
    title: "Oración Juntos — Encuentro Sagrado",
    subtitle: "Lo que el cielo puede dar",
    image: "https://images.unsplash.com/photo-1470240331399-33f3974ba5a0?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Templo tranquilo",
    vocab: [
      { word: "Juntos", romanization: "Juntos", english: "Together" },
      { word: "Bendición", romanization: "Bendición", english: "Blessing" },
      { word: "Sanación", romanization: "Sanación", english: "Healing" },
      { word: "Gratitud", romanization: "Gratitud", english: "Gratitude" },
      { word: "Amén", romanization: "Amén", english: "Amen" },
    ],
    conversation: [
      { word: "¿Puedo orar por ti?", romanization: "Puedo orar por ti?", english: "May I pray for you?", mine: true },
      { word: "Sí, por favor.", romanization: "Si, por favor.", english: "Yes, please.", mine: false },
      { word: "Señor, bendice a esta persona. Amén.", romanization: "Señor, bendice a esta persona. Amén.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes, please." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer is central to Mexican culture and family life. Offering to pray is a profound gesture of care and respect.", bridge: "When you pray in Jesus\' name, you declare that He is alive, present, and powerful." },
    missionTip: { body: "Pray specifically and boldly. Mexicans believe in a God who acts, heals, and responds to prayer.", sub: "Healing prayer opens doors that arguments never could." },
    prayer: '"Spirit of God, move powerfully in Mexico. Let healing and transformation accompany your Word."',
  },
  {
    title: "Hospitalidad — Casa Abierta",
    subtitle: "Dios en la mesa",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Comida mexicana tradicional",
    vocab: [
      { word: "Sírvete", romanization: "Sírvete", english: "Help yourself / Eat" },
      { word: "Delicioso", romanization: "Delicioso", english: "Delicious" },
      { word: "Café", romanization: "Café", english: "Coffee" },
      { word: "Invitación", romanization: "Invitación", english: "Invitation" },
      { word: "Mesa", romanization: "Mesa", english: "Table" },
    ],
    conversation: [
      { word: "¿Quieres comer conmigo?", romanization: "Quieres comer conmigo?", english: "Will you eat with me?", mine: true },
      { word: "¡Claro! Gracias.", romanization: "Claro! Gracias.", english: "Of course! Thank you.", mine: false },
      { word: "¿Podemos dar gracias antes de comer?", romanization: "Podemos dar gracias antes de comer?", english: "May we give thanks before eating?", mine: true },
    ],
    convCaption: '"Will you eat with me?" · "Of course!" · "May we give thanks?"',
    cultureTip: { emoji: "🌶️", body: "Mexican meals are acts of love. Food brings family and community together. To share a meal is to share life itself.", bridge: "Jesus broke bread with everyone — the righteous and the outcast. The table is holy ground." },
    missionTip: { body: "Accept every offer of food graciously. Refusing is rejecting the relationship being offered.", sub: "The Gospel is lived at the table — hospitality is evangelism." },
    prayer: '"Lord, bless this table and the hands that prepared this meal. Let our eating together be a foretaste of your kingdom feast."',
  },
  {
    title: "Despedida — Hasta Siempre",
    subtitle: "La bendición que perdura",
    image: "https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Puesta de sol en México",
    vocab: [
      { word: "Nos vemos", romanization: "Nos vemos", english: "See you again" },
      { word: "Cuídate", romanization: "Cuídate", english: "Take care" },
      { word: "Bendición de Dios", romanization: "Bendición de Dios", english: "God's blessing" },
      { word: "No te olvidaré", romanization: "No te olvidaré", english: "I will not forget you" },
      { word: "Hasta luego", romanization: "Hasta luego", english: "See you later" },
    ],
    conversation: [
      { word: "Fue hermoso conocerte.", romanization: "Fue hermoso conocerte.", english: "It was beautiful to meet you.", mine: true },
      { word: "A mí también. ¿Volverás?", romanization: "A mí también. Volverás?", english: "Me too. Will you come back?", mine: false },
      { word: "Dios te cuida siempre. Nos vemos.", romanization: "Dios te cuida siempre. Nos vemos.", english: "God watches over you always. See you again.", mine: true },
    ],
    convCaption: '"Beautiful to meet you." · "Will you come back?" · "God watches over you."',
    cultureTip: { emoji: "🌅", body: "Mexican goodbyes are warm and often lengthy. The farewell itself is meaningful — don't rush it.", bridge: "A lingering goodbye says: this person and this relationship matter. That reflects the heart of Jesus." },
    missionTip: { body: "Speak a specific blessing as you part. In Mexican culture, the blessing of someone you\\\'ve shared with is treasured and remembered.", sub: "May God\\\'s peace and presence go with you every day." },
    prayer: '"Father, I release this friend into your hands. Continue the work you\\\'ve begun. Love them more than I ever could."',
  },
];

const GATES_BRAZIL: GateData[] = [
  {
    title: "Olá — Boas-vindas",
    subtitle: "Conexão com o coração",
    image: "https://images.unsplash.com/photo-1483729558449-99ef3a8e3246?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Vibrantes cores do Brasil",
    vocab: [
      { word: "Olá", romanization: "Ola", english: "Hello" },
      { word: "Obrigado", romanization: "Obrigado", english: "Thank you" },
      { word: "Deus", romanization: "Deus", english: "God" },
      { word: "Amor", romanization: "Amor", english: "Love" },
      { word: "Jesus", romanization: "Jesus", english: "Jesus" },
    ],
    conversation: [
      { word: "Olá! Qual é o seu nome?", romanization: "Ola! Qual é o seu nome?", english: "Hello! What is your name?", mine: false },
      { word: "Meu nome é [nome]. Prazer em conhecê-lo!", romanization: "Meu nome é [nome]. Prazer em conhecê-lo!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Olá! What is your name?" · "Meu nome é [nome]"',
    cultureTip: { emoji: "🎉", body: "Brazilians are warm, expressive, and joyful in their greetings. A genuine smile and open body language matter more than formal words.", bridge: "Jesus greeted people with joy and genuine interest. That is your model here." },
    missionTip: { body: "Brazilians value warmth and personal connection. Be genuine, smile often, and show you care about the person, not just the conversation.", sub: "Every greeting is a chance to reflect Jesus\' love and warmth." },
    prayer: '"Lord, let my greetings in Brazil overflow with genuine joy and warmth. Help me see your image in every face."',
  },
  {
    title: "História — Sua Jornada",
    subtitle: "Compartilhando vidas, não apenas palavras",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Comunidade colorida no Brasil",
    vocab: [
      { word: "Família", romanization: "Família", english: "Family" },
      { word: "Trabalho", romanization: "Trabalho", english: "Work" },
      { word: "Casa", romanization: "Casa", english: "Home" },
      { word: "Sonho", romanization: "Sonho", english: "Dream" },
      { word: "Amigo", romanization: "Amigo", english: "Friend" },
    ],
    conversation: [
      { word: "De onde você é?", romanization: "De onde você é?", english: "Where are you from?", mine: false },
      { word: "Sou de [cidade]. Tenho uma família linda.", romanization: "Sou de [cidade]. Tenho uma família linda.", english: "I'm from [city]. I have a beautiful family.", mine: true },
    ],
    convCaption: '"Where are you from?" · "I\'m from [city]. I have a beautiful family."',
    cultureTip: { emoji: "👨‍👩‍👧‍👦", body: "Family is deeply important in Brazilian culture, even as the culture is modern and outward-looking. Stories about family build connection.", bridge: "Jesus created a new kind of family — one based not on blood but on being loved by God." },
    missionTip: { body: "Brazilians are open and expressive. Listen fully, respond emotionally, and don't be afraid to share your own story in return.", sub: "Authentic connection opens doors that surface-level conversation never could." },
    prayer: '"Father, help me listen with the heart of Jesus. Let me understand the dreams and struggles behind the words I hear."',
  },
  {
    title: "Fé — Palavras do Coração",
    subtitle: "O que acreditamos determina como vivemos",
    image: "https://images.unsplash.com/photo-1604107176636-b5f5e02b9d00?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Espiritualidade brasileira",
    vocab: [
      { word: "Fé", romanization: "Fé", english: "Faith" },
      { word: "Oração", romanization: "Oração", english: "Prayer" },
      { word: "Paz", romanization: "Paz", english: "Peace" },
      { word: "Esperança", romanization: "Esperança", english: "Hope" },
      { word: "Salvação", romanization: "Salvação", english: "Salvation" },
    ],
    conversation: [
      { word: "Em que você acredita?", romanization: "Em que você acredita?", english: "What do you believe in?", mine: false },
      { word: "Acredito em Jesus. Ele dá verdadeira paz.", romanization: "Acredito em Jesus. Ele dá verdadeira paz.", english: "I believe in Jesus. He gives true peace.", mine: true },
    ],
    convCaption: '"What do you believe?" · "I believe in Jesus. He gives true peace."',
    cultureTip: { emoji: "✨", body: "Brazil has a rich spiritual tradition. Brazilians are open to conversation about faith, spirituality, and the divine.", bridge: "Jesus meets people where they are spiritually and invites them into truth." },
    missionTip: { body: "Speak about Jesus with warmth and conviction. Brazilians respond to authentic faith lived out in joy and generosity.", sub: "Share your testimony — how Jesus changed your life is powerful." },
    prayer: '"Jesus, give me confidence to speak your name in Brazil. Meet me with your joy as I share about you."',
  },
  {
    title: "Evangelho — Boas Notícias",
    subtitle: "A história que muda tudo",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Paisagem bela do Brasil",
    vocab: [
      { word: "Pecado", romanization: "Pecado", english: "Sin" },
      { word: "Perdão", romanization: "Perdão", english: "Forgiveness" },
      { word: "Vida", romanization: "Vida", english: "Life" },
      { word: "Cruz", romanization: "Cruz", english: "Cross" },
      { word: "Ressurreição", romanization: "Ressurreição", english: "Resurrection" },
    ],
    conversation: [
      { word: "Deus o ama profundamente.", romanization: "Deus o ama profundamente.", english: "God loves you deeply.", mine: true },
      { word: "De verdade? Como você sabe?", romanization: "De verdade? Como você sabe?", english: "Really? How do you know?", mine: false },
      { word: "Jesus morreu na cruz por nós.", romanization: "Jesus morreu na cruz por nós.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you deeply." · "How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "❤️", body: "Brazilian spirituality is passionate and communal. People respond to the love of Christ when expressed with genuine emotion.", bridge: "Jesus at the cross is God's ultimate act of love — present that with clarity and warmth." },
    missionTip: { body: "Appeal to both heart and mind. Brazilians are intelligent and spiritual — they want to understand, but they also want to feel.", sub: "Jesus\' death and resurrection is not just doctrine — it is love demonstrated." },
    prayer: '"Holy Spirit, help me speak with the joy and conviction of Jesus to the heart of Brazil. Let them feel your love."',
  },
  {
    title: "Oração Juntos — Encontro Sagrado",
    subtitle: "O que o céu pode dar",
    image: "https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Templo tranquilo",
    vocab: [
      { word: "Juntos", romanization: "Juntos", english: "Together" },
      { word: "Bênção", romanization: "Bênção", english: "Blessing" },
      { word: "Cura", romanization: "Cura", english: "Healing" },
      { word: "Gratidão", romanization: "Gratidão", english: "Gratitude" },
      { word: "Amém", romanization: "Amém", english: "Amen" },
    ],
    conversation: [
      { word: "Posso orar por você?", romanization: "Posso orar por você?", english: "May I pray for you?", mine: true },
      { word: "Sim, por favor.", romanization: "Sim, por favor.", english: "Yes, please.", mine: false },
      { word: "Senhor, abençoe esta pessoa. Amém.", romanization: "Senhor, abençoe esta pessoa. Amém.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes, please." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer is woven into Brazilian spiritual life. Offering to pray for someone is a profound gesture of care and spiritual power.", bridge: "When you pray in Jesus\' name, you declare His presence and power." },
    missionTip: { body: "Pray with boldness and specificity. Brazilians believe in a God who acts, responds, and transforms lives.", sub: "Healing prayer is a powerful testimony to Jesus\' authority." },
    prayer: '"Spirit of God, move mightily in Brazil. Let transformation and healing accompany your Word."',
  },
  {
    title: "Hospitalidade — Casa Aberta",
    subtitle: "Deus na mesa",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Comida brasileira tradicional",
    vocab: [
      { word: "Sirva-se", romanization: "Sirva-se", english: "Help yourself / Eat" },
      { word: "Delicioso", romanization: "Delicioso", english: "Delicious" },
      { word: "Café", romanization: "Café", english: "Coffee" },
      { word: "Convite", romanization: "Convite", english: "Invitation" },
      { word: "Mesa", romanization: "Mesa", english: "Table" },
    ],
    conversation: [
      { word: "Quer comer comigo?", romanization: "Quer comer comigo?", english: "Will you eat with me?", mine: true },
      { word: "Claro! Obrigado.", romanization: "Claro! Obrigado.", english: "Of course! Thank you.", mine: false },
      { word: "Podemos agradecer antes de comer?", romanization: "Podemos agradecer antes de comer?", english: "May we give thanks before eating?", mine: true },
    ],
    convCaption: '"Will you eat with me?" · "Of course!" · "May we give thanks?"',
    cultureTip: { emoji: "🍲", body: "Brazilian meals are joyful, social occasions. Food brings people together. To share a meal is to share life and build community.", bridge: "Jesus broke bread with everyone — sacred fellowship through food." },
    missionTip: { body: "Accept food graciously and express genuine gratitude. Refusing is rejecting the relationship and generosity offered.", sub: "The Gospel is lived at the table — hospitality is witness." },
    prayer: '"Lord, bless this table and the hands that prepared it. Let our eating together reflect your kingdom feast."',
  },
  {
    title: "Despedida — Até Logo",
    subtitle: "A bênção que permanece",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Pôr do sol no Brasil",
    vocab: [
      { word: "Até logo", romanization: "Até logo", english: "See you later" },
      { word: "Cuide-se", romanization: "Cuide-se", english: "Take care" },
      { word: "Bênção de Deus", romanization: "Bênção de Deus", english: "God's blessing" },
      { word: "Não vou esquecer", romanization: "Não vou esquecer", english: "I will not forget" },
      { word: "Reencontro", romanization: "Reencontro", english: "Reunion" },
    ],
    conversation: [
      { word: "Foi lindo conhecer você.", romanization: "Foi lindo conhecer você.", english: "It was beautiful to meet you.", mine: true },
      { word: "Para mim também. Você volta?", romanization: "Para mim também. Você volta?", english: "Me too. Will you come back?", mine: false },
      { word: "Deus cuida de você sempre. Até logo.", romanization: "Deus cuida de você sempre. Até logo.", english: "God watches over you always. See you soon.", mine: true },
    ],
    convCaption: '"Beautiful to meet you." · "Will you come back?" · "God watches over you."',
    cultureTip: { emoji: "🌅", body: "Brazilian goodbyes are warm, expressive, and often lingering. The goodbye itself is an expression of care and relationship.", bridge: "A warm, lingering goodbye says: you matter, this relationship matters — that reflects Jesus\' love." },
    missionTip: { body: "Speak a specific blessing over the person. In Brazilian culture, a blessing given with warmth and conviction is treasured and remembered.", sub: "May God\\\'s peace and joy go with you every day." },
    prayer: '"Father, I release this friend into your hands. Love them, guide them, transform them — far more than I ever could."',
  },
];

const GATES_CHINA: GateData[] = [
  {
    title: "你好 — 问候",
    subtitle: "用心灵连接",
    image: "https://images.unsplash.com/photo-1508984411871-a01040fc01a18?w=700&h=380&fit=crop&auto=format",
    imageAlt: "中国生机勃勃的街道",
    vocab: [
      { word: "你好", romanization: "Nǐ hǎo", english: "Hello" },
      { word: "谢谢", romanization: "Xièxiè", english: "Thank you" },
      { word: "上帝", romanization: "Shàngdì", english: "God" },
      { word: "爱", romanization: "Ài", english: "Love" },
      { word: "耶稣", romanization: "Yēsū", english: "Jesus" },
    ],
    conversation: [
      { word: "你好！你叫什么名字？", romanization: "Nǐ hǎo! Nǐ jiào shénme míngzi?", english: "Hello! What is your name?", mine: false },
      { word: "我叫[名字]。很高兴认识你！", romanization: "Wǒ jiào [míngzi]. Hěn gāoxìng rènshi nǐ!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]"',
    cultureTip: { emoji: "🙏", body: "In China, respect and relationship are foundational. A genuine greeting with attention and respect opens every door.", bridge: "Jesus met everyone with respect and saw them truly. That is your model." },
    missionTip: { body: "Chinese people value sincere respect and long-term relationship. Invest time in genuine greeting and personal connection.", sub: "Your respect is reflected in your attention to their name and story." },
    prayer: '"Lord, help me greet each person in China with genuine respect and warmth. Let them feel truly seen."',
  },
  {
    title: "故事 — 你的旅程",
    subtitle: "分享生命，不仅仅是言语",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=380&fit=crop&auto=format",
    imageAlt: "中国的传统文化",
    vocab: [
      { word: "家庭", romanization: "Jiātíng", english: "Family" },
      { word: "工作", romanization: "Gōngzuò", english: "Work" },
      { word: "家", romanization: "Jiā", english: "Home" },
      { word: "梦想", romanization: "Mèngxiǎng", english: "Dream" },
      { word: "朋友", romanization: "Péngyou", english: "Friend" },
    ],
    conversation: [
      { word: "你从哪里来？", romanization: "Nǐ cóng nǎlǐ lái?", english: "Where are you from?", mine: false },
      { word: "我来自[地方]。我有一个美好的家庭。", romanization: "Wǒ láizì [dìfang]. Wǒ yǒu yīgè měihǎo de jiātíng.", english: "I'm from [place]. I have a beautiful family.", mine: true },
    ],
    convCaption: '"Where are you from?" · "I\'m from [place]. I have a beautiful family."',
    cultureTip: { emoji: "🏯", body: "Family and heritage are central to Chinese identity. When you ask about someone's hometown and family, you touch their heart.", bridge: "Jesus valued family and roots — He honors where we come from." },
    missionTip: { body: "Listen deeply to stories about family, hometown, and dreams. Chinese storytelling is rich with layers of meaning.", sub: "Your attentive listening is a form of honor and respect." },
    prayer: '"Father, help me listen with Jesus\' heart to the stories of China. Let me understand the dreams and hopes beneath the words."',
  },
  {
    title: "信仰 — 心的语言",
    subtitle: "我们相信什么决定我们如何生活",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "中国精神的风景",
    vocab: [
      { word: "信仰", romanization: "Xìnyǎng", english: "Faith" },
      { word: "祈祷", romanization: "Qǐdào", english: "Prayer" },
      { word: "平安", romanization: "Píng'ān", english: "Peace" },
      { word: "希望", romanization: "Xīwàng", english: "Hope" },
      { word: "救恩", romanization: "Jiùhuó'ēn", english: "Salvation" },
    ],
    conversation: [
      { word: "你相信什么？", romanization: "Nǐ xiāngxìn shénme?", english: "What do you believe in?", mine: false },
      { word: "我相信耶稣。他给予真正的平安。", romanization: "Wǒ xiāngxìn Yēsū. Tā jǐyǔ zhēnzhèng de píng'ān.", english: "I believe in Jesus. He gives true peace.", mine: true },
    ],
    convCaption: '"What do you believe?" · "I believe in Jesus. He gives true peace."',
    cultureTip: { emoji: "✨", body: "China has ancient spiritual traditions. Conversations about belief and meaning are natural and deeply valued in Chinese culture.", bridge: "Jesus came to bring peace that surpasses all understanding — that resonates with the Chinese heart." },
    missionTip: { body: "Speak about Jesus with confidence and humility. Chinese people respect conviction paired with genuine wisdom.", sub: "Share how Jesus transformed your life — testimony is powerful." },
    prayer: '"Jesus, give me wisdom and boldness to speak your name in China. Meet me with your peace."',
  },
  {
    title: "福音 — 好消息",
    subtitle: "改变一切的故事",
    image: "https://images.unsplash.com/photo-1470240331399-33f3974ba5a0?w=700&h=380&fit=crop&auto=format",
    imageAlt: "中国的希望景观",
    vocab: [
      { word: "罪", romanization: "Zuì", english: "Sin" },
      { word: "赦免", romanization: "Shèmiǎn", english: "Forgiveness" },
      { word: "生命", romanization: "Shēngmìng", english: "Life" },
      { word: "十字架", romanization: "Shízìjiàng", english: "Cross" },
      { word: "复活", romanization: "Fùhuó", english: "Resurrection" },
    ],
    conversation: [
      { word: "上帝深深地爱你。", romanization: "Shàngdì shēnshēn de ài nǐ.", english: "God loves you deeply.", mine: true },
      { word: "真的吗？你怎么知道？", romanization: "Zhēn de ma? Nǐ zěnme zhīdào?", english: "Really? How do you know?", mine: false },
      { word: "耶稣为我们死在十字架上。", romanization: "Yēsū wèi wǒmen sǐ zài shízìjiàng shàng.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you deeply." · "How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "❤️", body: "The concept of ultimate sacrifice — a God who comes near in suffering — is profoundly moving in Chinese culture.", bridge: "Jesus at the cross is love demonstrated, not just proclaimed." },
    missionTip: { body: "Appeal to both mind and heart. Chinese people are thoughtful and spiritual — they want truth and meaning.", sub: "Jesus\' death and resurrection is the ultimate expression of love." },
    prayer: '"Holy Spirit, help me communicate the Gospel in ways the Chinese heart can receive. Let them encounter Jesus\' love."',
  },
  {
    title: "一起祈祷 — 神圣相遇",
    subtitle: "天堂能够给予的",
    image: "https://images.unsplash.com/photo-1479142506502-81e56a671538?w=700&h=380&fit=crop&auto=format",
    imageAlt: "宁静的中国寺庙",
    vocab: [
      { word: "一起", romanization: "Yīqǐ", english: "Together" },
      { word: "祝福", romanization: "Zhùfú", english: "Blessing" },
      { word: "医治", romanization: "Yīzhì", english: "Healing" },
      { word: "感谢", romanization: "Gǎnxiè", english: "Gratitude" },
      { word: "阿门", romanization: "Āmén", english: "Amen" },
    ],
    conversation: [
      { word: "我可以为你祈祷吗？", romanization: "Wǒ kěyǐ wèi nǐ qǐdào ma?", english: "May I pray for you?", mine: true },
      { word: "可以。", romanization: "Kěyǐ.", english: "Yes, please.", mine: false },
      { word: "主啊，祝福这个人。阿门。", romanization: "Zhǔ a, zhùfú zhège rén. Āmén.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer and spiritual practice are woven into Chinese culture. Offering to pray is a profound gesture of care and connection.", bridge: "When you pray in Jesus\' name, you declare His power and presence." },
    missionTip: { body: "Pray with specific faith and boldness. Chinese people believe in a God who acts and responds to prayer.", sub: "Healing prayer demonstrates Jesus\' authority and love." },
    prayer: '"Spirit of God, move powerfully in China. Let transformation and healing accompany your Word."',
  },
  {
    title: "待客之道 — 敞开的家",
    subtitle: "上帝在饭桌上",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=380&fit=crop&auto=format",
    imageAlt: "传统中国美食",
    vocab: [
      { word: "请坐", romanization: "Qǐng zuò", english: "Please sit / Eat" },
      { word: "美味", romanization: "Měiwèi", english: "Delicious" },
      { word: "茶", romanization: "Chá", english: "Tea" },
      { word: "邀请", romanization: "Yāoqǐng", english: "Invitation" },
      { word: "桌子", romanization: "Zhuōzi", english: "Table" },
    ],
    conversation: [
      { word: "你想和我一起吃饭吗？", romanization: "Nǐ xiǎng hé wǒ yīqǐ chīfàn ma?", english: "Will you eat with me?", mine: true },
      { word: "好的！谢谢。", romanization: "Hǎo de! Xièxiè.", english: "Yes! Thank you.", mine: false },
      { word: "我们可以在吃饭前感谢吗？", romanization: "Wǒmen kěyǐ zài chīfàn qián gǎnxiè ma?", english: "May we give thanks before eating?", mine: true },
    ],
    convCaption: '"Will you eat with me?" · "Yes! Thank you." · "May we give thanks?"',
    cultureTip: { emoji: "🍜", body: "In Chinese culture, sharing food is sharing relationship and community. The table is sacred space for connection and blessing.", bridge: "Jesus broke bread with everyone — the table is holy ground where the Gospel unfolds." },
    missionTip: { body: "Accept food with genuine gratitude and joy. Sharing a meal is one of the most natural ways to share the Gospel.", sub: "The Gospel is lived at the table — hospitality is witness to God's love." },
    prayer: '"Lord, bless this table and the hands that prepared it. Let our eating together reflect your kingdom feast."',
  },
  {
    title: "告别 — 永远的祝福",
    subtitle: "留下永恒的祝福",
    image: "https://images.unsplash.com/photo-1504681869696-d977e3928dd1?w=700&h=380&fit=crop&auto=format",
    imageAlt: "中国的日落",
    vocab: [
      { word: "再见", romanization: "Zàijiàn", english: "Goodbye" },
      { word: "照顾好自己", romanization: "Zhàogu hǎo zìjǐ", english: "Take care" },
      { word: "上帝的祝福", romanization: "Shàngdì de zhùfú", english: "God's blessing" },
      { word: "我不会忘记你", romanization: "Wǒ búhuì wàngjì nǐ", english: "I will not forget you" },
      { word: "重聚", romanization: "Chóngjù", english: "Reunion" },
    ],
    conversation: [
      { word: "认识你真是太美好了。", romanization: "Rènshi nǐ zhēn shi tài měihǎo le.", english: "It was beautiful to meet you.", mine: true },
      { word: "对我来说也是。你会再来吗？", romanization: "Duì wǒ láishuō yě shi. Nǐ huì zàilái ma?", english: "Me too. Will you come back?", mine: false },
      { word: "上帝永远守护你。再见。", romanization: "Shàngdì yǒngyuǎn shǒuhù nǐ. Zàijiàn.", english: "God watches over you always. Goodbye.", mine: true },
    ],
    convCaption: '"Beautiful to meet you." · "Will you come back?" · "God watches over you always."',
    cultureTip: { emoji: "🌅", body: "Chinese goodbyes carry weight and meaning. The farewell is itself a form of relationship — taking time matters deeply.", bridge: "A lingering, warm goodbye says: you matter, this relationship matters — that reflects Jesus\' love." },
    missionTip: { body: "Speak a specific blessing as you part. In Chinese culture, the blessing of someone you\'ve shared with is treasured and remembered long after.", sub: "May God\'s peace and presence go with you every day." },
    prayer: '"Father, I release this friend into your hands. Love them, guide them, transform them — far more than I ever could."',
  },
];

const GATES_CAMBODIA: GateData[] = [
  {
    title: "សូបលើ — ការស្វាគមន៍",
    subtitle: "ចូលដល់បេះដូងនៃកម្ពុជា",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ប្រាសាទខ្មែរដ៏ស្វាគមន៍",
    vocab: [
      { word: "សូបលើ", romanization: "Sobley", english: "Hello" },
      { word: "សូមស្វាគមន៍", romanization: "Suom svagom", english: "Welcome" },
      { word: "ខ្ញុំឈ្មោះ", romanization: "Khnyom chmoas", english: "My name is" },
      { word: "ព្រះ", romanization: "Preah", english: "God" },
      { word: "ស្រលាញ់", romanization: "Srolahn", english: "Love" },
    ],
    conversation: [
      { word: "សូបលើ! ឈ្មោះលោកអ្នកជាអ្វី?", romanization: "Sobley! Chmoas lok anak chia ovy?", english: "Hello! What is your name?", mine: false },
      { word: "ខ្ញុំឈ្មោះ [ឈ្មោះ]។ រីករាយក្នុងការស្វាគមន៍លោកអ្នក។", romanization: "Khnyom chmoas [chmoas]. Rikriay knong kar svagom lok anak.", english: "My name is [name]. Pleased to welcome you.", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]. Pleased to meet you."',
    cultureTip: { emoji: "🙏", body: "In Cambodia, greetings are respectful and warm. A genuine welcome opens every door and creates deep connection.", bridge: "Jesus greeted everyone with profound respect and genuine interest. That is your model." },
    missionTip: { body: "Khmer people value respectful greeting and genuine interest in their wellbeing. Take time to honor their name and story.", sub: "Your warmth and respect will be remembered long after words fade." },
    prayer: '"Lord, help me greet each person in Cambodia with genuine warmth and respect. Let them feel truly welcomed."',
  },
  {
    title: "ប្រវត្តិ — របស់អ្នក",
    subtitle: "ចែករំលែកជីវិតគឺដល់បេះដូង",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ដងៃកម្ពុជាដ៏ស្រស់ស្អាត",
    vocab: [
      { word: "គ្រួសារ", romanization: "Kruosar", english: "Family" },
      { word: "ធ្វើការ", romanization: "Thveu kar", english: "Work" },
      { word: "ផ្ទះ", romanization: "Plas", english: "Home" },
      { word: "សុបិន្ត", romanization: "Supin", english: "Dream" },
      { word: "មិត្ត", romanization: "Mitt", english: "Friend" },
    ],
    conversation: [
      { word: "លោកអ្នកមកពីកន្លែងណា?", romanization: "Lok anak mok pi kanlaeng na?", english: "Where are you from?", mine: false },
      { word: "ខ្ញុំមកពី [កន្លែង]។ ខ្ញុំមានគ្រួសារដ៏ស្និដ្ឋ។", romanization: "Khnyom mok pi [kanlaeng]. Khnyom mean kruosar day snit.", english: "I'm from [place]. I have a wonderful family.", mine: true },
    ],
    convCaption: '"Where are you from?" · "I\'m from [place]. I have a wonderful family."',
    cultureTip: { emoji: "🌾", body: "Family and heritage are the foundation of Cambodian identity. When you ask about someone's hometown and family, you touch their heart.", bridge: "Jesus valued family and roots — He honors where we come from and who shaped us." },
    missionTip: { body: "Listen deeply to stories about family, hometown, and dreams. Cambodian storytelling carries generations of wisdom and resilience.", sub: "Your attentive listening is a form of honor that builds lasting trust." },
    prayer: '"Father, help me listen with Jesus\' heart to the stories of Cambodia. Let me understand the hopes and dreams beneath the words."',
  },
  {
    title: "ជំនឹក — ចម្ងាយនៃបេះដូង",
    subtitle: "យើងគ្រឹងឹងក្នុង ដែលយើងជឿ",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&h=380&fit=crop&auto=format",
    imageAlt: "វិស័យរបស់ព្រះ",
    vocab: [
      { word: "ជំនឹក", romanization: "Chamnork", english: "Memory" },
      { word: "ជឿ", romanization: "Chua", english: "Believe" },
      { word: "សន្តិភាព", romanization: "Sontiphap", english: "Peace" },
      { word: "ស្ឆង្ហាក់", romanization: "Schanghak", english: "Hope" },
      { word: "សង្រ្គោះ", romanization: "Sangrok", english: "Salvation" },
    ],
    conversation: [
      { word: "លោកអ្នកជឿលើអ្វី?", romanization: "Lok anak chua le ovy?", english: "What do you believe in?", mine: false },
      { word: "ខ្ញុំជឿលើព្រះយេស៊ូ។ គាត់ផ្តល់ឱ្យសន្តិភាពពិតប្រាកដ។", romanization: "Khnyom chua le preah yesu. Gat thdal oy sontiphap pitprakt.", english: "I believe in Jesus. He gives true peace.", mine: true },
    ],
    convCaption: '"What do you believe?" · "I believe in Jesus. He gives true peace."',
    cultureTip: { emoji: "✨", body: "Cambodia has rich spiritual traditions. Conversations about belief and meaning are deeply valued in Khmer culture.", bridge: "Jesus came to bring peace that surpasses all understanding — that resonates with the searching Cambodian heart." },
    missionTip: { body: "Appeal to both heart and mind. Cambodian people are spiritual and thoughtful — they seek truth and genuine meaning.", sub: "Share not just doctrine, but the peace that transforms." },
    prayer: '"Holy Spirit, help me communicate Jesus in ways the Cambodian heart can receive. Let them encounter His peace."',
  },
  {
    title: "ព្រះគម្ពីរ — សង្ឃឹម",
    subtitle: "ព្រះស្រឡាញ់ត្រូវបានបង្ហាញលើឯក",
    image: "https://images.unsplash.com/photo-1504681869696-d977e3901d4f?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ព្រះគម្ពីរ",
    vocab: [
      { word: "ព្រះស្រឡាញ់", romanization: "Preah srolahn", english: "God's love" },
      { word: "ព្រះគម្ពីរ", romanization: "Preah kompi", english: "Gospel" },
      { word: "ឈឺចាប់", romanization: "Choeurchap", english: "Suffering" },
      { word: "ឈឺរាប់", romanization: "Choeurap", english: "Sacrifice" },
      { word: "សឹង", romanization: "Saing", english: "Stand" },
    ],
    conversation: [
      { word: "ព្រះស្រឡាញ់លោកអ្នកយ៉ាងដូច្នេះ។", romanization: "Preah srolahn lok anak yang douchni.", english: "God loves you like this.", mine: true },
      { word: "ព្រាប់ម៉ាង? តើលោកអ្នកដឹងលទ្ធផលយ៉ាងដូច្នេះ?", romanization: "Prab mang? Tuea lok anak dang lantheaph yang douchni?", english: "Really? How do you know?", mine: false },
      { word: "ព្រះយេស៊ូបានស្លាប់ឡើងលើឈើឆ្កាងសម្រាប់យើងខ្ញុំ។", romanization: "Preah yesu ban slab laeng le chheur chhkang samrap yeung khnyom.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you." · "How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "❤️", body: "The concept of ultimate sacrifice — a God who comes near in suffering — is profoundly moving in Cambodian culture.", bridge: "Jesus at the cross is love demonstrated, not just proclaimed. That love heals and transforms." },
    missionTip: { body: "Appeal to both mind and heart. Cambodian people are thoughtful and spiritual — they want truth and meaning.", sub: "Jesus\' death and resurrection is the ultimate expression of love." },
    prayer: '"Holy Spirit, help me communicate the Gospel in ways the Cambodian heart can receive. Let them encounter Jesus\' love."',
  },
  {
    title: "ព្រាក្ខ្ល — ពេលវេលាដ៏ពិសេស",
    subtitle: "ព្រះស្វាគមន៍នៅលើតុ",
    image: "https://images.unsplash.com/photo-1479142506502-81e56a671538?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ច្រាក់ម្លប់របស់ព្រះ",
    vocab: [
      { word: "ព្រាក្ខ្ល", romanization: "Prak", english: "Prayer" },
      { word: "ស្វាគមន៍", romanization: "Svagom", english: "Welcome" },
      { word: "ព្រះក្សត្រ", romanization: "Preah ksat", english: "Lord" },
      { word: "សូលាប់", romanization: "Suolab", english: "Bless" },
      { word: "លោយ", romanization: "Loy", english: "Amen" },
    ],
    conversation: [
      { word: "ក្នុងលោយខ្ញុំលោក? តើក្រម", romanization: "Knong loy khnyom lok? Tuea krom", english: "May I pray for you?", mine: true },
      { word: "បាទ។", romanization: "Bat", english: "Yes, please.", mine: false },
      { word: "ព្រះក្សត្រ, សូលាប់មនុស្សនេះ។ លោយ។", romanization: "Preah ksat, suolab monusah nih. Loy.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer and spiritual practice are woven into Cambodian culture. Offering to pray is a profound gesture of care and connection.", bridge: "When you pray in Jesus\' name, you declare His power and presence in that person\'s life." },
    missionTip: { body: "Pray with specific faith and boldness. Cambodian people believe in a God who acts and responds to prayer.", sub: "Healing prayer demonstrates Jesus\' authority and love." },
    prayer: '"Spirit of God, move powerfully in Cambodia. Let transformation and healing accompany your Word."',
  },
  {
    title: "ភ្ញៀវ — គ្រឹះស្ថានផ្តល់ឱ្យ",
    subtitle: "ព្រះស្វាគមន៍រៀបចំលក្ខណ៍នៅផ្ទះ",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ម្ហូបឯងកម្ពុជា",
    vocab: [
      { word: "សូមដាក់ចូល", romanization: "Suom dak chul", english: "Please sit" },
      { word: "ឆ្ងាយ", romanization: "Chngay", english: "Delicious" },
      { word: "ទឹកក្រម", romanization: "Tuek krom", english: "Tea" },
      { word: "ចូលរៀងរាល់", romanization: "Chul rieng ral", english: "Invitation" },
      { word: "តុ", romanization: "Tu", english: "Table" },
    ],
    conversation: [
      { word: "សូមដាក់ចូល! ម្ហូប។", romanization: "Suom dak chul! Mhup.", english: "Please sit! Food.", mine: true },
      { word: "សូមគាប់។ ឆ្ងាយណាស់។", romanization: "Suom kop. Chngay nas.", english: "Thank you. It\'s delicious.", mine: false },
      { word: "ទីឡើយ។ ខ្ញុំរីករាយក្នុងការលា។", romanization: "Ti laey. Khnyom rikriay knong kar la.", english: "Always. I\'m happy to share.", mine: true },
    ],
    convCaption: '"Please sit! Food." · "It\'s delicious." · "I\'m happy to share."',
    cultureTip: { emoji: "🍚", body: "Hospitality at the table is sacred in Cambodia. Sharing food is sharing life, relationship, and blessing.", bridge: "Jesus broke bread with friends and strangers alike. Table fellowship is His love in action." },
    missionTip: { body: "Accept Cambodian hospitality gracefully. Eating together builds trust and shows respect for their culture.", sub: "Sharing a meal opens hearts for deeper spiritual conversation." },
    prayer: '"Jesus, open my heart to receive and give hospitality like You did. Let tables become places of grace."',
  },
  {
    title: "លាហើយ — សេរីភាព",
    subtitle: "ព្រះស្ហាយផ្តល់ឱ្យក្នុងការចាក់សក់",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "ព្រះស្ហាយលើកម្ពុជា",
    vocab: [
      { word: "លាហើយ", romanization: "Lahey", english: "Goodbye" },
      { word: "ព្រះស្ហាយ", romanization: "Preah shay", english: "God\'s peace" },
      { word: "ក្រម", romanization: "Krom", english: "Stay" },
      { word: "លួង", romanization: "Luong", english: "Remember" },
      { word: "ម៉ិង", romanization: "Ming", english: "May" },
    ],
    conversation: [
      { word: "លាហើយ។ ឱ្យព្រះស្ហាយក្នុងលោក។", romanization: "Lahey. Oy preah shay knong lok.", english: "Goodbye. May God\'s peace be with you.", mine: true },
      { word: "លាហើយ។ សូមត្រឡប់មកវិញ។", romanization: "Lahey. Suom trolab mok vin.", english: "Goodbye. Please come back.", mine: false },
    ],
    convCaption: '"Goodbye. May God\'s peace be with you." · "Please come back again."',
    cultureTip: { emoji: "🌅", body: "Cambodian goodbyes carry weight and meaning. The farewell itself is a form of relationship — taking time matters deeply.", bridge: "A warm, lingering goodbye says: you matter, this relationship matters — that reflects Jesus\' love." },
    missionTip: { body: "Don\'t rush the goodbye. Exchange contact info. New believers need ongoing care and connection.", sub: "Your follow-up and support demonstrate Jesus\' commitment to relationship." },
    prayer: '"Father, I release this friend into your hands. Love them, guide them, transform them — far more than I ever could."',
  },
];

const GATES_VIETNAM: GateData[] = [
  {
    title: "Xin Chào — Chào Hỏi",
    subtitle: "Kết nối bằng trái tim chân thành",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Phố cổ Hội An đầy màu sắc",
    vocab: [
      { word: "Xin chào", romanization: "Sin chow", english: "Hello" },
      { word: "Cảm ơn", romanization: "Cam un", english: "Thank you" },
      { word: "Thiên Chúa", romanization: "Tien Chua", english: "God" },
      { word: "Tình yêu", romanization: "Tinh yew", english: "Love" },
      { word: "Chúa Giêsu", romanization: "Chua Giesu", english: "Jesus" },
    ],
    conversation: [
      { word: "Xin chào! Bạn tên gì?", romanization: "Sin chow! Ban ten zi?", english: "Hello! What is your name?", mine: false },
      { word: "Tôi tên là [tên]. Rất vui được gặp bạn!", romanization: "Toi ten la [ten]. Rat vui duoc gap ban!", english: "My name is [name]. Nice to meet you!", mine: true },
    ],
    convCaption: '"Hello! What is your name?" · "My name is [name]. Nice to meet you!"',
    cultureTip: { emoji: "🌸", body: "In Vietnam, respectful greetings open every door. A warm smile and genuine interest in someone\'s story creates deep connection.", bridge: "Jesus greeted everyone with genuine love and attention. That is your model in Vietnam." },
    missionTip: { body: "Vietnamese people value warmth, respect, and relational connection. Take time to learn names and show genuine care.", sub: "Your sincere greeting will be remembered long after words fade." },
    prayer: '"Lord, help me greet each person in Vietnam with genuine warmth and love. Let them feel truly seen and welcomed."',
  },
  {
    title: "Câu Chuyện — Hành Trình",
    subtitle: "Chia sẻ cuộc sống, không chỉ là lời nói",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Phong cảnh ruộng bậc thang Việt Nam",
    vocab: [
      { word: "Gia đình", romanization: "Gia dinh", english: "Family" },
      { word: "Công việc", romanization: "Cong viec", english: "Work" },
      { word: "Nhà", romanization: "Nha", english: "Home" },
      { word: "Ước mơ", romanization: "Uoc mo", english: "Dream" },
      { word: "Bạn bè", romanization: "Ban be", english: "Friend" },
    ],
    conversation: [
      { word: "Bạn đến từ đâu?", romanization: "Ban den tu dau?", english: "Where are you from?", mine: false },
      { word: "Tôi đến từ [nơi]. Tôi có một gia đình tuyệt vời.", romanization: "Toi den tu [noi]. Toi co mot gia dinh tuyet voi.", english: "I\'m from [place]. I have a wonderful family.", mine: true },
    ],
    convCaption: '"Where are you from?" · "I\'m from [place]. I have a wonderful family."',
    cultureTip: { emoji: "🌾", body: "Family and community are the heart of Vietnamese identity. Asking about family and hometown touches the deepest part of who they are.", bridge: "Jesus honored family and roots — He meets us in the stories of where we come from." },
    missionTip: { body: "Listen deeply to stories about family, hometown, and dreams. Vietnamese people carry generations of resilience and beauty in their stories.", sub: "Your attentive listening is a profound act of love and respect." },
    prayer: '"Father, help me listen with Jesus\' heart to the stories of Vietnam. Let me understand the hopes and dreams beneath the words."',
  },
  {
    title: "Đức Tin — Ngôn Ngữ Tâm Hồn",
    subtitle: "Những gì chúng ta tin định hình cách chúng ta sống",
    image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Chùa Một Cột Hà Nội",
    vocab: [
      { word: "Đức tin", romanization: "Duc tin", english: "Faith" },
      { word: "Cầu nguyện", romanization: "Cau nguyen", english: "Prayer" },
      { word: "Bình an", romanization: "Binh an", english: "Peace" },
      { word: "Hi vọng", romanization: "Hi vong", english: "Hope" },
      { word: "Cứu rỗi", romanization: "Cuu roi", english: "Salvation" },
    ],
    conversation: [
      { word: "Bạn tin vào điều gì?", romanization: "Ban tin vao dieu gi?", english: "What do you believe in?", mine: false },
      { word: "Tôi tin vào Chúa Giêsu. Ngài ban bình an thật sự.", romanization: "Toi tin vao Chua Giesu. Ngai ban binh an that su.", english: "I believe in Jesus. He gives true peace.", mine: true },
    ],
    convCaption: '"What do you believe?" · "I believe in Jesus. He gives true peace."',
    cultureTip: { emoji: "✨", body: "Vietnam has rich spiritual traditions. Conversations about belief and meaning are naturally welcomed in Vietnamese culture.", bridge: "Jesus came to bring a peace that surpasses all understanding — that speaks to the searching Vietnamese heart." },
    missionTip: { body: "Appeal to both heart and mind. Vietnamese people are thoughtful and spiritual — they seek truth and genuine meaning.", sub: "Share the peace that transforms, not just doctrine." },
    prayer: '"Holy Spirit, help me communicate Jesus in ways the Vietnamese heart can receive. Let them encounter His peace."',
  },
  {
    title: "Tin Lành — Tin Tốt",
    subtitle: "Thiên Chúa đã đến gần trong đau khổ",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Ánh sáng bình minh trên sông Mekong",
    vocab: [
      { word: "Tình yêu Chúa", romanization: "Tinh yeu Chua", english: "God\'s love" },
      { word: "Tin lành", romanization: "Tin lanh", english: "Gospel" },
      { word: "Đau khổ", romanization: "Dau kho", english: "Suffering" },
      { word: "Hy sinh", romanization: "Hy sinh", english: "Sacrifice" },
      { word: "Sống lại", romanization: "Song lai", english: "Resurrection" },
    ],
    conversation: [
      { word: "Thiên Chúa yêu bạn thật sự.", romanization: "Thien Chua yeu ban that su.", english: "God loves you truly.", mine: true },
      { word: "Thật sao? Làm sao bạn biết?", romanization: "That sao? Lam sao ban biet?", english: "Really? How do you know?", mine: false },
      { word: "Chúa Giêsu đã chết trên thập tự giá vì chúng ta.", romanization: "Chua Giesu da chet tren thap tu gia vi chung ta.", english: "Jesus died on the cross for us.", mine: true },
    ],
    convCaption: '"God loves you truly." · "How do you know?" · "Jesus died on the cross for us."',
    cultureTip: { emoji: "❤️", body: "The concept of ultimate sacrifice — a God who suffers alongside us — is profoundly moving in Vietnamese culture shaped by hardship.", bridge: "Jesus at the cross is love demonstrated in the darkest moment. That love heals generations." },
    missionTip: { body: "Appeal to both mind and heart. Vietnamese people have known deep suffering — a God who enters suffering speaks volumes.", sub: "Jesus\' death and resurrection is the ultimate expression of love." },
    prayer: '"Holy Spirit, help me communicate the Gospel in ways the Vietnamese heart can receive. Let them encounter Jesus\' love."',
  },
  {
    title: "Cầu Nguyện — Gặp Gỡ Thánh",
    subtitle: "Điều thiên đàng có thể ban tặng",
    image: "https://images.unsplash.com/photo-1543429257-4de58b9b4574?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Đồng lúa bình yên Việt Nam",
    vocab: [
      { word: "Cầu nguyện", romanization: "Cau nguyen", english: "Prayer" },
      { word: "Phước lành", romanization: "Phuoc lanh", english: "Blessing" },
      { word: "Chữa lành", romanization: "Chua lanh", english: "Healing" },
      { word: "Cảm tạ", romanization: "Cam ta", english: "Gratitude" },
      { word: "A-men", romanization: "A-men", english: "Amen" },
    ],
    conversation: [
      { word: "Tôi có thể cầu nguyện cho bạn không?", romanization: "Toi co the cau nguyen cho ban khong?", english: "May I pray for you?", mine: true },
      { word: "Được, cảm ơn bạn.", romanization: "Duoc, cam on ban.", english: "Yes, thank you.", mine: false },
      { word: "Chúa ơi, xin phước lành cho người này. A-men.", romanization: "Chua oi, xin phuoc lanh cho nguoi nay. A-men.", english: "Lord, bless this person. Amen.", mine: true },
    ],
    convCaption: '"May I pray for you?" · "Yes, thank you." · "Lord, bless this person. Amen."',
    cultureTip: { emoji: "🙏", body: "Prayer and spiritual practice resonate deeply in Vietnamese culture. Offering to pray is a profound gesture of care and genuine love.", bridge: "When you pray in Jesus\' name, you declare His power and presence in that person\'s life." },
    missionTip: { body: "Pray with specific faith and boldness. Vietnamese people believe in a God who acts and responds to sincere prayer.", sub: "Healing prayer demonstrates Jesus\' authority and love." },
    prayer: '"Spirit of God, move powerfully in Vietnam. Let transformation and healing accompany your Word."',
  },
  {
    title: "Hiếu Khách — Bàn Ăn Mở",
    subtitle: "Thiên Chúa hiện diện trong bữa ăn",
    image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Bữa ăn truyền thống Việt Nam",
    vocab: [
      { word: "Mời ngồi", romanization: "Moi ngoi", english: "Please sit" },
      { word: "Ngon lắm", romanization: "Ngon lam", english: "Very delicious" },
      { word: "Trà", romanization: "Tra", english: "Tea" },
      { word: "Lời mời", romanization: "Loi moi", english: "Invitation" },
      { word: "Cùng nhau", romanization: "Cung nhau", english: "Together" },
    ],
    conversation: [
      { word: "Mời bạn ngồi! Ăn đi!", romanization: "Moi ban ngoi! An di!", english: "Please sit! Eat!", mine: true },
      { word: "Cảm ơn! Ngon lắm!", romanization: "Cam on! Ngon lam!", english: "Thank you! It\'s delicious!", mine: false },
      { word: "Tôi vui khi được chia sẻ cùng bạn.", romanization: "Toi vui khi duoc chia se cung ban.", english: "I\'m happy to share with you.", mine: true },
    ],
    convCaption: '"Please sit! Eat!" · "It\'s delicious!" · "I\'m happy to share with you."',
    cultureTip: { emoji: "🍜", body: "Hospitality at the table is sacred in Vietnam. Sharing a meal is sharing life, relationship, and blessing.", bridge: "Jesus broke bread with friends and strangers alike. Table fellowship is His love made visible." },
    missionTip: { body: "Accept Vietnamese hospitality gracefully. Eating together builds deep trust and shows genuine respect for their culture.", sub: "Sharing a meal opens hearts for deeper spiritual conversation." },
    prayer: '"Jesus, open my heart to give and receive hospitality like You did. Let every table become a place of grace."',
  },
  {
    title: "Tạm Biệt — Hy Vọng",
    subtitle: "Thiên Chúa đi cùng bạn trong hành trình",
    image: "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=700&h=380&fit=crop&auto=format",
    imageAlt: "Hoàng hôn trên vịnh Hạ Long",
    vocab: [
      { word: "Tạm biệt", romanization: "Tam biet", english: "Goodbye" },
      { word: "Bình an của Chúa", romanization: "Binh an cua Chua", english: "God\'s peace" },
      { word: "Ở lại", romanization: "O lai", english: "Stay" },
      { word: "Nhớ mãi", romanization: "Nho mai", english: "Remember always" },
      { word: "Gặp lại", romanization: "Gap lai", english: "Meet again" },
    ],
    conversation: [
      { word: "Tạm biệt. Xin Chúa ban bình an cho bạn.", romanization: "Tam biet. Xin Chua ban binh an cho ban.", english: "Goodbye. May God\'s peace be with you.", mine: true },
      { word: "Tạm biệt. Hẹn gặp lại!", romanization: "Tam biet. Hen gap lai!", english: "Goodbye. See you again!", mine: false },
    ],
    convCaption: '"Goodbye. May God\'s peace be with you." · "See you again!"',
    cultureTip: { emoji: "🌅", body: "Vietnamese goodbyes are warm and relational. The farewell itself carries meaning — taking time to part well shows deep respect.", bridge: "A warm, lingering goodbye says: you matter, this relationship matters — that reflects Jesus\' love." },
    missionTip: { body: "Don\'t rush the goodbye. Exchange contact info and pray for ongoing connection. New believers need continued care.", sub: "Your follow-up demonstrates Jesus\' commitment to lasting relationship." },
    prayer: '"Father, I release this friend into your hands. Love them, guide them, transform them — far more than I ever could."',
  },
];

const MISSION_META = {
  indonesia: { flag: "🇮🇩", country: "Indonesia", name: "Nusantara Mission", lang: "Bahasa Indonesia", heroImg: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=380&fit=crop&auto=format", gates: GATES_INDONESIA, speechLang: "id-ID" },
  japan:     { flag: "🇯🇵", country: "Japan",     name: "Sakura Mission",    lang: "日本語",           heroImg: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=700&h=380&fit=crop&auto=format", gates: GATES_JAPAN,     speechLang: "ja-JP" },
  india:     { flag: "🇮🇳", country: "India",     name: "Bharat Mission",    lang: "हिंदी",            heroImg: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=380&fit=crop&auto=format", gates: GATES_INDIA,     speechLang: "hi-IN" },
  mexico:    { flag: "🇲🇽", country: "Mexico",    name: "Amor Mission",      lang: "Español",          heroImg: "https://images.unsplash.com/photo-1569156381623-aa66c3008b7c?w=700&h=380&fit=crop&auto=format", gates: GATES_MEXICO,    speechLang: "es-MX" },
  brazil:    { flag: "🇧🇷", country: "Brazil",    name: "Alegria Mission",   lang: "Português",        heroImg: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=700&h=380&fit=crop&auto=format", gates: GATES_BRAZIL,    speechLang: "pt-BR" },
  china:     { flag: "🇨🇳", country: "China",     name: "Silk Road Mission", lang: "中文",             heroImg: "https://images.unsplash.com/photo-1508984411871-a01040fc01a18?w=700&h=380&fit=crop&auto=format", gates: GATES_CHINA,     speechLang: "zh-CN" },
  cambodia:  { flag: "🇰🇭", country: "Cambodia",  name: "Angkor Mission",    lang: "ភាសាខ្មែរ",        heroImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=380&fit=crop&auto=format", gates: GATES_CAMBODIA,  speechLang: "km-KH" },
  vietnam:   { flag: "🇻🇳", country: "Vietnam",   name: "Mekong Mission",    lang: "Tiếng Việt",       heroImg: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=700&h=380&fit=crop&auto=format", gates: GATES_VIETNAM,   speechLang: "vi-VN" },
};

// ══════════════════════════════════════════════════════════════════════════════
// TOOL — 사영리 (Four Spiritual Laws)
// ══════════════════════════════════════════════════════════════════════════════
type LawLang = "ko" | "en" | "id" | "ja" | "hi" | "es" | "pt" | "zh" | "km" | "vi";

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
      es: "Dios te ama y tiene un plan maravilloso para tu vida",
      pt: "Deus te ama e tem um plano maravilhoso para a tua vida",
      zh: "上帝爱你，并为你的生命有一个奇妙的计划",
      km: "ព្រះជាម្ចាស់ស្រឡាញ់អ្នក ហើយមានផែនការអស្ចារ្យសម្រាប់ជីវិតអ្នក",
      vi: "Đức Chúa Trời yêu bạn và có một kế hoạch kỳ diệu cho cuộc đời bạn",
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
          es: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, sino que tenga vida eterna.",
          pt: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.",
          zh: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
          km: "ព្រោះថាព្រះជាម្ចាស់បានស្រឡាញ់ពិភពលោកដល់ម្លឹង ដែលទ្រង់បានប្រទានព្រះបុត្រាតែមួយ ដើម្បីឲ្យអ្នកណាដែលជឿលើទ្រង់ មិនអន្តរាយ ប៉ុន្តែទទួលបានជីវិតអស់កាល។",
          vi: "Vì Đức Chúa Trời yêu thương thế gian đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.",
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
          es: "Yo he venido para que tengan vida, y para que la tengan en abundancia.",
          pt: "Eu vim para que tenham vida e a tenham em abundância.",
          zh: "我来了，是要叫羊得生命，并且得的更丰盛。",
          km: "ខ្ញុំបានមកដើម្បីឲ្យពួកគេមានជីវិត ហើយជីវិតដ៏សម្បូរបែប។",
          vi: "Ta đã đến để chiên được sống, và được sống dồi dào.",
        },
      },
    ],
    tip: {
      ko: "하나님의 사랑은 조건 없습니다. 당신이 어디 있든, 무엇을 했든 — 그분의 계획은 당신을 향해 있습니다.",
      en: "God's love is unconditional. Wherever you are, whatever you've done — His plan is for you.",
      id: "Kasih Allah tidak bersyarat. Di mana pun Anda berada — rencana-Nya adalah untuk Anda.",
      ja: "神の愛は無条件です。あなたがどこにいても — 神の計画はあなたのためにあります。",
      hi: "परमेश्वर का प्रेम बिना शर्त है। आप जहाँ भी हों — उनकी योजना आपके लिए है।",
      es: "El amor de Dios es incondicional. Donde quiera que estés — Su plan es para ti.",
      pt: "O amor de Deus é incondicional. Onde quer que você esteja — Seu plano é para você.",
      zh: "神的爱是无条件的。无论你在哪里，无论你做了什么——祂的计划是为了你。",
      km: "ព្រះជាម្ចាស់ស្រឡាញ់ដោយគ្មានលក្ខខណ្ឌ។ អ្នកនៅឯណាក៏ដោយ — ផែនការរបស់ទ្រង់គឺសម្រាប់អ្នក។",
      vi: "Tình yêu của Đức Chúa Trời là vô điều kiện. Dù bạn ở đâu — Kế hoạch của Ngài là dành cho bạn.",
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
      es: "El hombre es pecador y está separado de Dios",
      pt: "O homem é pecador e está separado de Deus",
      zh: "人是有罪的，与上帝分离",
      km: "មនុស្សបានធ្វើបាបហើយបានបំបែកចេញពីព្រះជាម្ចាស់",
      vi: "Con người là tội nhân và bị tách biệt khỏi Đức Chúa Trời",
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
          es: "Por cuanto todos pecaron y están privados de la gloria de Dios.",
          pt: "Pois todos pecaram e carecem da glória de Deus.",
          zh: "因为世人都犯了罪，亏缺了神的荣耀。",
          km: "ពីព្រោះអ្នកទាំងអស់គ្នាបានធ្វើបាប ហើយខ្វះចន្លោះព្រះរុងរឿងរបស់ព្រះជាម្ចាស់។",
          vi: "Vì mọi người đều đã phạm tội, thiếu mất sự vinh hiển của Đức Chúa Trời.",
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
          es: "Porque la paga del pecado es muerte; pero la dádiva de Dios es vida eterna en Cristo Jesús, Señor nuestro.",
          pt: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna em Cristo Jesus, nosso Senhor.",
          zh: "因为罪的工价乃是死；惟有神的恩赐，在我们的主基督耶稣里，乃是永生。",
          km: "ដ្បិតថ្លៃខែនៃបាបគឺជាសេចក្តីស្លាប់ ប៉ុន្តែអំណោយរបស់ព្រះជាម្ចាស់គឺជាជីវិតអស់កាលក្នុងព្រះគ្រិស្តយេស៊ូ ព្រះអម្ចាស់យើង។",
          vi: "Vì tiền công của tội lỗi là sự chết; nhưng sự ban cho của Đức Chúa Trời là sự sống đời đời trong Đức Chúa Jêsus Christ, Chúa chúng ta.",
        },
      },
    ],
    tip: {
      ko: "죄는 단순한 '나쁜 행동'이 아니라 하나님과의 관계가 끊어진 상태입니다. 이 단절이 인생의 공허함의 근원입니다.",
      en: "Sin is not merely 'bad behavior' — it is a broken relationship with God. This separation is the source of life's emptiness.",
      id: "Dosa bukan sekadar 'perilaku buruk' — melainkan hubungan yang terputus dengan Allah. Keterpisahan inilah sumber kekosongan hidup.",
      ja: "罪は単なる「悪い行い」ではなく、神との関係が断たれた状態です。この断絶が人生の虚しさの根源です。",
      hi: "पाप केवल 'बुरा व्यवहार' नहीं है — यह परमेश्वर के साथ टूटा हुआ रिश्ता है। यह अलगाव ही जीवन की रिक्तता का कारण है।",
      es: "El pecado no es solo 'mal comportamiento' — es una relación rota con Dios. Esta separación es la fuente del vacío en la vida.",
      pt: "O pecado não é apenas 'mau comportamento' — é um relacionamento quebrado com Deus. Essa separação é a fonte do vazio na vida.",
      zh: "罪不仅仅是'坏行为'——它是与神关系的破裂。这种分离是生命空虚的根源。",
      km: "បាបមិនមែនតែ 'ឥរិយាបថអាក្រក់' ប៉ុណ្ណោះទេ — វាជាទំនាក់ទំនងដែលខូចជាមួយព្រះជាម្ចាស់។ ការបំបែកនេះជាប្រភពនៃការទទេនៅក្នុងជីវិត។",
      vi: "Tội lỗi không chỉ là 'hành vi xấu' — đó là mối quan hệ bị đứt vỡ với Đức Chúa Trời. Sự tách biệt này là nguồn gốc của sự trống rỗng trong cuộc sống.",
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
      es: "Jesucristo es la única provisión de Dios para el pecado del hombre",
      pt: "Jesus Cristo é a única provisão de Deus para o pecado do homem",
      zh: "耶稣基督是上帝为人类罪的唯一解决之道",
      km: "ព្រះយេស៊ូគ្រិស្តគឺជាផ្លូវតែមួយគត់ដែលព្រះជាម្ចាស់ផ្តល់",
      vi: "Chúa Giêsu là sự cung cấp duy nhất của Đức Chúa Trời cho tội lỗi của con người",
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
          es: "Pero Dios demuestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.",
          pt: "Mas Deus demonstra o seu amor por nós pelo fato de Cristo ter morrido por nós enquanto ainda éramos pecadores.",
          zh: "惟有基督在我们还作罪人的时候为我们死，神的爱就在此向我们显明了。",
          km: "ប៉ុន្តែព្រះជាម្ចាស់បានបង្ហាញព្រះអង្គប្រណីគ្នា ដោយការដែលព្រះគ្រិស្តបានសុគតដើម្បីយើង ខណៈពេលដែលយើងនៅតែជាមនុស្សបាប។",
          vi: "Nhưng Đức Chúa Trời tỏ lòng yêu thương của Ngài đối với chúng ta, khi chúng ta còn là người có tội thì Đấng Christ vì chúng ta mà chết.",
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
          es: "Jesús le dijo: 'Yo soy el camino, la verdad y la vida. Nadie viene al Padre sino por mí.'",
          pt: "Jesus disse-lhe: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim.'",
          zh: "耶稣说：我就是道路、真理、生命；若不借着我，没有人能到父那里去。",
          km: "ព្រះយេស៊ូមានបន្ទូលថា 'ខ្ញុំជាផ្លូវ សេចក្តីពិត និងជីវិត។ គ្មាននរណាម្នាក់អាចទៅឯព្រះវរបិតា បើមិនតាមមកខ្ញុំ'",
          vi: "Đức Chúa Jêsus phán rằng: 'Ta là đường đi, lẽ thật, và sự sống; chẳng bởi ta thì không ai được đến cùng Cha.'",
        },
      },
    ],
    tip: {
      ko: "예수님은 우리가 건너갈 수 없는 그 다리를 직접 몸으로 놓으셨습니다. 그분만이 하나님께 이르는 유일한 길입니다.",
      en: "Jesus personally became the bridge we could never cross. He alone is the only way to God.",
      id: "Yesus secara pribadi menjadi jembatan yang tidak bisa kita seberangi sendiri. Hanya Dia satu-satunya jalan kepada Allah.",
      ja: "イエスは私たちが渡ることのできないその橋を、ご自身の体で架けてくださいました。神へと至る唯一の道は彼だけです。",
      hi: "यीशु ने व्यक्तिगत रूप से वह पुल बनाया जिसे हम कभी पार नहीं कर सकते थे। परमेश्वर तक पहुँचने का एकमात्र मार्ग वही है।",
      es: "Jesús personalmente se convirtió en el puente que nosotros jamás pudimos cruzar. Solo Él es el único camino a Dios.",
      pt: "Jesus pessoalmente se tornou a ponte que jamais poderíamos cruzar. Somente Ele é o único caminho para Deus.",
      zh: "耶稣亲自成为我们无法跨越的那座桥。只有他才是通往神的唯一道路。",
      km: "ព្រះយេស៊ូបានក្លាយជាស្ពានដែលយើងមិនអាចឆ្លងបាន។ តែទ្រង់ប៉ុណ្ណោះជាផ្លូវតែមួយទៅកាន់ព្រះជាម្ចាស់។",
      vi: "Chúa Giêsu đã trở thành chiếc cầu mà chúng ta không bao giờ tự mình có thể bước qua được. Chỉ một mình Ngài là con đường duy nhất đến với Đức Chúa Trời.",
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
      es: "Debemos recibir individualmente a Jesucristo como Salvador y Señor",
      pt: "Devemos individualmente receber Jesus Cristo como Salvador e Senhor",
      zh: "我们必须个人接受耶稣基督为救主和主",
      km: "យើងត្រូវតែទទួលព្រះយេស៊ូគ្រិស្តជាផ្ទាល់ខ្លួនជាព្រះអង្គសង្គ្រោះ",
      vi: "Chúng ta phải cá nhân tiếp nhận Chúa Giêsu là Cứu Chúa và Chúa",
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
          es: "Pero a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.",
          pt: "Mas a todos os que o receberam, aos que creram no seu nome, deu-lhes o direito de se tornarem filhos de Deus.",
          zh: "凡接待他的，就是信他名的人，他就赐他们权柄，作神的儿女。",
          km: "ប៉ុន្តែអស់អ្នកណាដែលបានទទួលទ្រង់ ចំពោះអ្នកដែលជឿលើព្រះនាមរបស់ទ្រង់ ទ្រង់ប្រទានអំណាចឲ្យពួកគេជាកូនរបស់ព្រះជាម្ចាស់។",
          vi: "Nhưng hễ ai đã nhận Ngài thì Ngài ban cho quyền phép trở nên con cái Đức Chúa Trời, là những kẻ tin danh Ngài.",
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
          es: "He aquí, yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él y cenaré con él y él conmigo.",
          pt: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa e cearei com ele e ele comigo.",
          zh: "看哪，我站在门外叩门，若有人听见我声音，就开门的，我要进到他那里去，我与他，他与我一同坐席。",
          km: "នេះ​ហោ! ខ្ញុំ​ឈរ​នៅ​ខាង​ក្រៅ​ទ្វារ​ហើយ​គោះ ប្រសិន​បើ​អ្នក​ណា​ស្ដាប់​ឮ​សំឡេង​ខ្ញុំ ហើយ​បើក​ទ្វារ ខ្ញុំ​នឹង​ចូល​ទៅ​រក​គាត់ ហើយ​ញ៉ាំ​ជាមួយ​គាត់ ហើយ​គាត់​ជាមួយ​ខ្ញុំ​ដែរ​។",
          vi: "Này, ta đứng trước cửa mà gõ; nếu ai nghe tiếng ta mà mở cửa cho, thì ta sẽ vào cùng người ấy, ăn bữa tối với người, và người với ta.",
        },
      },
    ],
    tip: {
      ko: "지식만으로는 부족합니다. 예수님은 당신의 마음 문을 두드리고 계십니다 — 문을 여는 것은 당신의 결단입니다.",
      en: "Knowledge alone is not enough. Jesus is knocking at the door of your heart — opening it is your decision.",
      id: "Pengetahuan saja tidak cukup. Yesus mengetuk pintu hatimu — membukanya adalah keputusanmu.",
      ja: "知識だけでは十分ではありません。イエスはあなたの心の扉をたたいています — 開けるかどうかはあなたの決断です。",
      hi: "केवल ज्ञान पर्याप्त नहीं है। यीशु आपके हृदय के द्वार पर दस्तक दे रहे हैं — दरवाजा खोलना आपका निर्णय है।",
      es: "El conocimiento solo no es suficiente. Jesús está llamando a la puerta de tu corazón — abrirla es tu decisión.",
      pt: "O conhecimento por si só não é suficiente. Jesus está batendo à porta do seu coração — abri-la é sua decisão.",
      zh: "仅有知识是不够的。耶稣正在敲你心门——开门是你的决定。",
      km: "ចំណេះដឹងតែឯងមិនគ្រប់គ្រាន់ទេ។ ព្រះយេស៊ូកំពុងគោះទ្វារចិត្តរបស់អ្នក — ការបើកទ្វារគឺជាការសម្រេចចិត្តរបស់អ្នក។",
      vi: "Chỉ có kiến thức thôi là chưa đủ. Chúa Giêsu đang gõ cửa lòng bạn — mở cửa là quyết định của bạn.",
    },
    prayer: {
      ko: "하나님 아버지, 저는 죄인입니다. 지금 예수 그리스도를 제 구주로 영접합니다. 제 죄를 용서해 주시고, 제 삶을 인도해 주십시오. 예수님의 이름으로 기도합니다. 아멘.",
      en: "Heavenly Father, I am a sinner. I now receive Jesus Christ as my Savior. Forgive my sins and guide my life. In Jesus\' name, Amen.",
      id: "Bapa di Surga, saya adalah orang berdosa. Saya menerima Yesus Kristus sebagai Juruselamat saya. Ampunilah dosa saya dan pimpin hidup saya. Dalam nama Yesus, Amin.",
      ja: "天の父よ、私は罪人です。今、イエス・キリストを私の救い主として受け入れます。私の罪を赦し、私の人生を導いてください。イエスの名によって、アーメン。",
      hi: "स्वर्गीय पिता, मैं पापी हूँ। मैं अभी यीशु मसीह को अपने उद्धारकर्ता के रूप में स्वीकार करता हूँ। मेरे पापों को क्षमा करें और मेरे जीवन का मार्गदर्शन करें। यीशु के नाम में, आमीन।",
      es: "Padre Celestial, soy un pecador. Ahora recibo a Jesucristo como mi Salvador. Perdona mis pecados y guía mi vida. En el nombre de Jesús, Amén.",
      pt: "Pai Celestial, eu sou um pecador. Agora recebo Jesus Cristo como meu Salvador. Perdoa os meus pecados e guia a minha vida. Em nome de Jesus, Amém.",
      zh: "天父，我是罪人。我现在接受耶稣基督为我的救主。请赦免我的罪，引导我的生命。奉耶稣的名，阿门。",
      km: "ព្រះវរបិតានៅស្ថានសួគ៌ ខ្ញុំជាមនុស្សបាប។ ខ្ញុំទទួលព្រះយេស៊ូគ្រិស្តជាព្រះអង្គសង្គ្រោះរបស់ខ្ញុំ។ សូមអត់ទោសបាបរបស់ខ្ញុំ ហើយណែនាំជីវិតរបស់ខ្ញុំ។ ក្នុងព្រះនាមព្រះយេស៊ូ អាម៉ែន។",
      vi: "Lạy Cha Thiên Thượng, con là người có tội. Con bây giờ tiếp nhận Chúa Giêsu là Cứu Chúa của con. Xin tha tội cho con và hướng dẫn cuộc đời con. Nhân danh Chúa Giêsu, Amen.",
    },
  },
];

const LAW_LANG_TABS: { lang: LawLang; label: string }[] = [
  { lang: "ko", label: "한국어" },
  { lang: "en", label: "English" },
  { lang: "id", label: "Bahasa" },
  { lang: "ja", label: "日本語" },
  { lang: "hi", label: "हिन्दी" },
  { lang: "es", label: "Español" },
  { lang: "pt", label: "Português" },
  { lang: "zh", label: "中文" },
  { lang: "km", label: "ខ្មែរ" },
  { lang: "vi", label: "Tiếng Việt" },
];

const PRAYER_LABELS: Record<LawLang, string> = {
  ko: "영접 기도",
  en: "Sinner's Prayer",
  id: "Doa Penerimaan",
  ja: "受容の祈り",
  hi: "स्वीकृति की प्रार्थना",
  es: "Oración de Salvación",
  pt: "Oração de Salvação",
  zh: "决志祷告",
  km: "ការអធិស្ឋានទទួលព្រះ",
  vi: "Lời Cầu Nguyện Tiếp Nhận",
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
  es: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "Acercarse Naturalmente",
      subtitle: "Iniciando la conversación",
      steps: [
        { label: "Enfoque de encuesta", desc: "\"Hola, ¿tienes un momento? ¿Puedo hacerte algunas preguntas sobre tu vida espiritual?\"" },
        { label: "Mostrar interés", desc: "Mírala a los ojos y acércate con una sonrisa sincera. Sin amenaza, postura abierta." },
        { label: "Encontrar puntos en común", desc: "Empieza con temas ligeros: el tiempo, el lugar, la situación actual." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "Tres Preguntas Clave",
      subtitle: "Preguntas diagnósticas",
      steps: [
        { label: "Pregunta 1", desc: "\"¿Estás interesado en las cosas espirituales ahora mismo?\"" },
        { label: "Pregunta 2", desc: "\"Si murieras hoy, ¿crees que estarías ante Dios?\"" },
        { label: "Pregunta 3", desc: "\"Si Dios te preguntara por qué debería dejarte entrar al cielo, ¿qué dirías?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "La Ilustración del Puente",
      subtitle: "Presentación visual del evangelio",
      steps: [
        { label: "Izquierda — Humanidad", desc: "Escribe 'Hombre' en el lado izquierdo de un papel. Estamos separados de Dios (Rom 3:23)." },
        { label: "Derecha — Dios", desc: "Escribe 'Dios' a la derecha. Hay una gran brecha entre ellos: pecado y muerte." },
        { label: "Puente — Jesús", desc: "Dibuja una cruz como el puente. Solo Jesús puede cruzar esa brecha (Juan 14:6)." },
        { label: "Decisión", desc: "\"¿Cruzarás este puente?\" Espera la respuesta de la persona." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "Presentando el Evangelio",
      subtitle: "Las buenas noticias claramente",
      steps: [
        { label: "Amor", desc: "Dios te ama (Juan 3:16). Este es el punto de partida." },
        { label: "Problema", desc: "Toda persona ha pecado y está separada de Dios (Rom 3:23)." },
        { label: "Solución", desc: "Jesús murió por nuestros pecados y resucitó (Rom 5:8)." },
        { label: "Respuesta", desc: "Debemos recibir personalmente a Jesús (Juan 1:12). Ahora es el momento." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "Guiando a la Oración",
      subtitle: "Invitando una decisión",
      steps: [
        { label: "Invitación", desc: "\"¿Te gustaría recibir a Jesús ahora? Puedo guiarte en una oración.\"" },
        { label: "Guía de oración", desc: "Oración corta y sincera: reconocer el pecado, recibir a Jesús como Salvador, pedir guía." },
        { label: "Confirmar", desc: "Después de la oración: \"¿Cómo te sientes ahora?\" Regocíjate juntos por su decisión." },
        { label: "Próximos pasos", desc: "Da una Biblia, encuentra una iglesia, intercambia contactos. No los dejes solos — los nuevos creyentes necesitan cuidado." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "Respuestas Comunes",
      subtitle: "Manejando objeciones",
      steps: [
        { label: "\"Ya soy una buena persona\"", desc: "\"Estoy seguro de que lo eres. Pero el estándar de Dios no es bondad — es perfección (Rom 3:23). Solo Jesús puede cruzar esa brecha.\"" },
        { label: "\"Todas las religiones son iguales\"", desc: "\"Comparten ética similar, pero Jesús dijo de manera única 'Yo soy el camino' (Juan 14:6). ¿Podemos ver esa afirmación juntos?\"" },
        { label: "\"Lo pensaré después\"", desc: "\"Totalmente comprensible. Solo una cosa más — recuerda esta conversación de hoy.\" Deja tu información de contacto." },
      ],
    },
  ],
  pt: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "Aproximar-se Naturalmente",
      subtitle: "Iniciando a conversa",
      steps: [
        { label: "Abordagem de pesquisa", desc: "\"Olá, você tem um momento? Posso fazer algumas perguntas sobre sua vida espiritual?\"" },
        { label: "Mostrar interesse", desc: "Olhe nos olhos e aproxime-se com um sorriso sincero. Sem ameaça, postura aberta." },
        { label: "Encontrar pontos em comum", desc: "Comece com tópicos leves: o tempo, o lugar, a situação atual." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "Três Perguntas Chave",
      subtitle: "Perguntas diagnósticas",
      steps: [
        { label: "Pergunta 1", desc: "\"Você está interessado em coisas espirituais agora?\"" },
        { label: "Pergunta 2", desc: "\"Se você morresse hoje, você acha que estaria diante de Deus?\"" },
        { label: "Pergunta 3", desc: "\"Se Deus perguntasse por que deveria deixar você entrar no céu, o que você diria?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "A Ilustração da Ponte",
      subtitle: "Apresentação visual do evangelho",
      steps: [
        { label: "Esquerda — Humanidade", desc: "Escreva 'Homem' no lado esquerdo de um papel. Estamos separados de Deus (Rm 3:23)." },
        { label: "Direita — Deus", desc: "Escreva 'Deus' à direita. Há uma grande lacuna entre eles: pecado e morte." },
        { label: "Ponte — Jesus", desc: "Desenhe uma cruz como a ponte. Somente Jesus pode cobrir essa lacuna (Jo 14:6)." },
        { label: "Decisão", desc: "\"Você vai cruzar essa ponte?\" Aguarde a resposta da pessoa." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "Apresentando o Evangelho",
      subtitle: "As boas notícias claramente",
      steps: [
        { label: "Amor", desc: "Deus te ama (Jo 3:16). Este é o ponto de partida." },
        { label: "Problema", desc: "Toda pessoa pecou e está separada de Deus (Rm 3:23)." },
        { label: "Solução", desc: "Jesus morreu pelos nossos pecados e ressuscitou (Rm 5:8)." },
        { label: "Resposta", desc: "Devemos receber pessoalmente Jesus (Jo 1:12). Agora é a hora." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "Guiando para a Oração",
      subtitle: "Convidando uma decisão",
      steps: [
        { label: "Convite", desc: "\"Você gostaria de receber Jesus agora? Posso guiá-lo em uma oração.\"" },
        { label: "Guia de oração", desc: "Oração curta e sincera: reconhecer o pecado, receber Jesus como Salvador, pedir orientação." },
        { label: "Confirmar", desc: "Após a oração: \"Como você se sente agora?\" Rejoice juntos pela decisão deles." },
        { label: "Próximos passos", desc: "Dê uma Bíblia, encontre uma igreja, troque contatos. Não os deixe sozinhos — novos crentes precisam de cuidado." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "Respostas Comuns",
      subtitle: "Como lidar com objeções",
      steps: [
        { label: "\"Já sou uma boa pessoa\"", desc: "\"Tenho certeza que sim. Mas o padrão de Deus não é bondade — é perfeição (Rm 3:23). Somente Jesus pode cobrir essa lacuna.\"" },
        { label: "\"Todas as religiões são iguais\"", desc: "\"Compartilham ética similar, mas Jesus disse unicamente 'Eu sou o caminho' (Jo 14:6). Podemos ver essa afirmação juntos?\"" },
        { label: "\"Vou pensar depois\"", desc: "\"Totalmente compreensível. Só mais uma coisa — lembre-se desta conversa hoje.\" Deixe suas informações de contato." },
      ],
    },
  ],
  zh: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "自然地接近",
      subtitle: "开始对话",
      steps: [
        { label: "问卷调查方式", desc: "\"你好，你有一点时间吗？我能问你一些关于你灵性生活的问题吗？\"" },
        { label: "表示兴趣", desc: "看着对方的眼睛，带着真诚的微笑靠近。不具威胁性，姿态开放。" },
        { label: "寻找共同点", desc: "从轻松的话题开始——天气、地点、当前情况。" },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "三个关键问题",
      subtitle: "诊断性问题",
      steps: [
        { label: "问题1", desc: "\"你现在对灵性的事情感兴趣吗？\"" },
        { label: "问题2", desc: "\"如果你今天去世，你认为你会站在上帝面前吗？\"" },
        { label: "问题3", desc: "\"如果上帝问你为什么要让你进天堂，你会怎么说？\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "桥梁图示",
      subtitle: "福音的视觉呈现",
      steps: [
        { label: "左边——人", desc: "在纸的左侧写上'人'。我们与上帝分离（罗3:23）。" },
        { label: "右边——上帝", desc: "在右侧写上'上帝'。他们之间有一条大沟——罪和死亡。" },
        { label: "桥——耶稣", desc: "画一个十字架作为桥梁。只有耶稣才能跨越那条沟（约14:6）。" },
        { label: "决定", desc: "\"你愿意过这座桥吗？\"等待对方的回应。" },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "传讲福音",
      subtitle: "清晰地传递好消息",
      steps: [
        { label: "爱", desc: "上帝爱你（约3:16）。这是起点。" },
        { label: "问题", desc: "每个人都犯了罪，与上帝的荣耀相差甚远（罗3:23）。" },
        { label: "解决方案", desc: "耶稣为我们的罪死了，并且复活了（罗5:8）。" },
        { label: "回应", desc: "我们必须亲自接受耶稣（约1:12）。现在就是时候了。" },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "引导祷告",
      subtitle: "邀请做决定",
      steps: [
        { label: "邀请", desc: "\"你愿意现在接受耶稣吗？我可以引导你做一个祷告。\"" },
        { label: "祷告引导", desc: "简短、真诚的祷告：承认罪，接受耶稣为救主，祈求引导。" },
        { label: "确认", desc: "祷告后：\"你现在感觉如何？\"一起为他们的决定欢喜。" },
        { label: "下一步", desc: "给一本圣经，找一间教会，交换联系方式。不要让他们独自离去——新信徒需要关怀。" },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "常见回应",
      subtitle: "如何处理反对意见",
      steps: [
        { label: "\"我已经是个好人了\"", desc: "\"我相信你是。但上帝的标准不是善良——而是完美（罗3:23）。只有耶稣才能填补这个缺口。\"" },
        { label: "\"所有宗教都一样\"", desc: "\"它们有相似的伦理，但耶稣独特地说'我是道路'（约14:6）。我们能一起来看这个声明吗？\"" },
        { label: "\"我以后再想\"", desc: "\"完全理解。只有一件事——记住今天的这个对话。\"留下你的联系方式。" },
      ],
    },
  ],
  km: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "ការចូលទៅជិតដោយធម្មជាតិ",
      subtitle: "ការចាប់ផ្ដើមការសន្ទនា",
      steps: [
        { label: "វិធីសម្ភាស", desc: "\"សូបលើ! តើអ្នកមានពេលមួយភ្លែតទេ? តើខ្ញុំអាចសួរអ្នកអំពីជីវិតខាងវិញ្ញាណបានទេ?\"" },
        { label: "បង្ហាញការចាប់អារម្មណ៍", desc: "មើលទៅក្នុងភ្នែករបស់ពួកគេ ហើយចូលទៅជិតដោយស្នាមញញឹមដ៏ស្មោះត្រង់។ មិនបង្ហាញការគំរាមកំហែង ជំហរបើចំហ។" },
        { label: "រកចំណុចដូចគ្នា", desc: "ចាប់ផ្ដើមដោយប្រធានបទស្រាល ដូចជា អាកាសធាតុ ទីកន្លែង ស្ថានការណ៍បច្ចុប្បន្ន។" },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "សំណួរសំខាន់បី",
      subtitle: "សំណួរវិនិច្ឆ័យ",
      steps: [
        { label: "សំណួរទី១", desc: "\"តើអ្នកមានចំណាប់អារម្មណ៍លើរឿងខាងវិញ្ញាណឥឡូវនេះទេ?\"" },
        { label: "សំណួរទី២", desc: "\"ប្រសិនបើអ្នកស្លាប់ថ្ងៃនេះ តើអ្នកគិតថាអ្នកនឹងឈរនៅចំពោះព្រះជាម្ចាស់ទេ?\"" },
        { label: "សំណួរទី៣", desc: "\"ប្រសិនបើព្រះជាម្ចាស់សួរថាហេតុអ្វីបានជាទ្រង់គួរឲ្យអ្នកចូលស្ថានសួគ៌ តើអ្នកនឹងនិយាយថាម្ដេច?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "រូបភាពស្ពាន",
      subtitle: "ការបង្ហាញដំណឹងល្អជាមួយរូបភាព",
      steps: [
        { label: "ខាងឆ្វេង — មនុស្ស", desc: "សរសេរ 'មនុស្ស' នៅខាងឆ្វេងនៃក្រដាស។ យើងបំបែកចេញពីព្រះជាម្ចាស់ (រម ៣:២៣)។" },
        { label: "ខាងស្តាំ — ព្រះ", desc: "សរសេរ 'ព្រះ' នៅខាងស្ដាំ។ មានប្រឡាយធំមួយនៅចន្លោះ ជាបាបនិងការស្លាប់។" },
        { label: "ស្ពាន — ព្រះយេស៊ូ", desc: "គូរឈើឆ្កាងជាស្ពាន។ មានតែព្រះយេស៊ូប៉ុណ្ណោះអាចឆ្លងប្រឡាយបាន (យន ១៤:៦)។" },
        { label: "ការសម្រេចចិត្ត", desc: "\"តើអ្នកនឹងឆ្លងស្ពាននេះទេ?\" រង់ចាំការឆ្លើយតបរបស់ពួកគេ។" },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "ប្រកាសដំណឹងល្អ",
      subtitle: "ដំណឹងល្អដោយច្បាស់លាស់",
      steps: [
        { label: "ការស្រឡាញ់", desc: "ព្រះជាម្ចាស់ស្រឡាញ់អ្នក (យន ៣:១៦)។ នេះជាចំណុចចាប់ផ្ដើម។" },
        { label: "បញ្ហា", desc: "មនុស្សគ្រប់រូបបានធ្វើបាប ហើយខ្វះចន្លោះព្រះរុងរឿងរបស់ព្រះ (រម ៣:២៣)។" },
        { label: "ដំណោះស្រាយ", desc: "ព្រះយេស៊ូបានសុគតដើម្បីបាបរបស់យើង ហើយបានប្រោបឡើងវិញ (រម ៥:៨)។" },
        { label: "ការឆ្លើយតប", desc: "យើងត្រូវទទួលព្រះយេស៊ូជាផ្ទាល់ខ្លួន (យន ១:១២)។ ឥឡូវនេះជាពេលវេលា។" },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "ណែនាំទៅការអធិស្ឋាន",
      subtitle: "ការអញ្ជើញការសម្រេចចិត្ត",
      steps: [
        { label: "ការអញ្ជើញ", desc: "\"តើអ្នកចង់ទទួលព្រះយេស៊ូឥឡូវនេះទេ? ខ្ញុំអាចណែនាំអ្នកអធិស្ឋានបាន។\"" },
        { label: "ការណែនាំការអធិស្ឋាន", desc: "ការអធិស្ឋានខ្លី ស្មោះ: ទទួលស្គាល់បាប ទទួលព្រះយេស៊ូជាព្រះអង្គសង្គ្រោះ ស្នើសុំការដឹកនាំ។" },
        { label: "ការបញ្ជាក់", desc: "បន្ទាប់ពីការអធិស្ឋាន: \"ឥឡូវនេះអ្នកមានអារម្មណ៍យ៉ាងណា?\" រីករាយជាមួយការសម្រេចចិត្តរបស់ពួកគេ។" },
        { label: "ជំហានបន្ទាប់", desc: "ផ្ដល់ព្រះគម្ពីរ រកសហគមន៍ ផ្លាស់ប្ដូរព័ត៌មានទំនាក់ទំនង។ កុំទុកពួកគេឯង — អ្នកជឿថ្មីត្រូវការការថែទាំ។" },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "ការឆ្លើយតបធម្មតា",
      subtitle: "របៀបដោះស្រាយការជំទាស់",
      steps: [
        { label: "\"ខ្ញុំជាមនុស្សល្អហើយ\"", desc: "\"ខ្ញុំប្រាកដថាអ្នកជាមនុស្សល្អ។ ប៉ុន្តែស្តង់ដារព្រះជាម្ចាស់មិនមែនជាភាពល្អ — វាជាភាពល្អឥតខ្ចោះ (រម ៣:២៣)។ មានតែព្រះយេស៊ូប៉ុណ្ណោះអាចបំពេញចន្លោះបាន។\"" },
        { label: "\"សាសនាទាំងអស់ដូចគ្នា\"", desc: "\"ពួកគេចែករំលែកក្រមសីលធម៌ ប៉ុន្តែព្រះយេស៊ូបានថ្លែងដោយខុសប្លែកថា 'ខ្ញុំជាផ្លូវ' (យន ១៤:៦)។ តើយើងអាចពិនិត្យការអះអាងនោះជាមួយគ្នាបានទេ?\"" },
        { label: "\"ខ្ញុំនឹងគិតក្រោយ\"", desc: "\"ខ្ញុំយល់ស្របទាំងស្រុង។ តែតែមួយរឿង — ចាំការសន្ទនានេះ។\" ទុកព័ត៌មានទំនាក់ទំនងរបស់អ្នក។" },
      ],
    },
  ],
  vi: [
    {
      icon: "👋",
      color: "#4A9FE0",
      title: "Tiếp Cận Tự Nhiên",
      subtitle: "Bắt đầu cuộc trò chuyện",
      steps: [
        { label: "Cách tiếp cận khảo sát", desc: "\"Xin chào, bạn có một chút thời gian không? Tôi có thể hỏi bạn một vài câu về đời sống tâm linh không?\"" },
        { label: "Thể hiện sự quan tâm", desc: "Nhìn vào mắt họ và tiếp cận với nụ cười chân thành. Không đe dọa, thái độ cởi mở." },
        { label: "Tìm điểm chung", desc: "Bắt đầu với những chủ đề nhẹ nhàng — thời tiết, địa điểm, tình huống hiện tại." },
      ],
    },
    {
      icon: "❓",
      color: "#7CA88A",
      title: "Ba Câu Hỏi Chính",
      subtitle: "Câu hỏi chẩn đoán",
      steps: [
        { label: "Câu hỏi 1", desc: "\"Bạn có đang quan tâm đến những điều thuộc linh ngay lúc này không?\"" },
        { label: "Câu hỏi 2", desc: "\"Nếu bạn qua đời hôm nay, bạn có nghĩ mình sẽ đứng trước mặt Đức Chúa Trời không?\"" },
        { label: "Câu hỏi 3", desc: "\"Nếu Đức Chúa Trời hỏi tại sao Ngài nên cho bạn vào thiên đàng, bạn sẽ nói gì?\"" },
      ],
    },
    {
      icon: "🌉",
      color: "#B89A5E",
      title: "Minh Họa Cây Cầu",
      subtitle: "Trình bày phúc âm bằng hình ảnh",
      steps: [
        { label: "Bên trái — Con người", desc: "Viết 'Con người' ở phía bên trái của tờ giấy. Chúng ta bị tách biệt khỏi Đức Chúa Trời (Rm 3:23)." },
        { label: "Bên phải — Đức Chúa Trời", desc: "Viết 'Đức Chúa Trời' ở bên phải. Có một hố sâu giữa họ — tội lỗi và cái chết." },
        { label: "Cây cầu — Chúa Giêsu", desc: "Vẽ một cây thánh giá như cây cầu. Chỉ có Chúa Giêsu mới có thể bắc qua hố sâu đó (Gi 14:6)." },
        { label: "Quyết định", desc: "\"Bạn có muốn bước qua cây cầu này không?\" Chờ phản hồi của người đó." },
      ],
    },
    {
      icon: "✝️",
      color: "#C4423A",
      title: "Chia Sẻ Phúc Âm",
      subtitle: "Tin tốt lành một cách rõ ràng",
      steps: [
        { label: "Tình yêu", desc: "Đức Chúa Trời yêu thương bạn (Gi 3:16). Đây là điểm xuất phát." },
        { label: "Vấn đề", desc: "Mọi người đều đã phạm tội và thiếu mất sự vinh hiển của Đức Chúa Trời (Rm 3:23)." },
        { label: "Giải pháp", desc: "Chúa Giêsu đã chết vì tội lỗi của chúng ta và sống lại (Rm 5:8)." },
        { label: "Phản hồi", desc: "Chúng ta phải cá nhân tiếp nhận Chúa Giêsu (Gi 1:12). Bây giờ là lúc." },
      ],
    },
    {
      icon: "🙏",
      color: "#6B5BCE",
      title: "Dẫn Dắt Đến Cầu Nguyện",
      subtitle: "Mời gọi quyết định",
      steps: [
        { label: "Lời mời", desc: "\"Bạn có muốn tiếp nhận Chúa Giêsu ngay bây giờ không? Tôi có thể hướng dẫn bạn cầu nguyện.\"" },
        { label: "Hướng dẫn cầu nguyện", desc: "Lời cầu nguyện ngắn, chân thành: thừa nhận tội lỗi, tiếp nhận Chúa Giêsu là Cứu Chúa, xin sự hướng dẫn." },
        { label: "Xác nhận", desc: "Sau khi cầu nguyện: \"Bạn cảm thấy thế nào bây giờ?\" Cùng nhau vui mừng về quyết định của họ." },
        { label: "Các bước tiếp theo", desc: "Tặng Kinh Thánh, tìm nhà thờ, trao đổi thông tin liên lạc. Đừng để họ một mình — tín hữu mới cần được quan tâm." },
      ],
    },
    {
      icon: "💬",
      color: "#3B6FE0",
      title: "Các Phản Hồi Thường Gặp",
      subtitle: "Cách xử lý phản đối",
      steps: [
        { label: "\"Tôi đã là người tốt rồi\"", desc: "\"Tôi chắc chắn bạn là người tốt. Nhưng tiêu chuẩn của Đức Chúa Trời không phải là sự tốt lành — đó là sự hoàn hảo (Rm 3:23). Chỉ có Chúa Giêsu mới có thể lấp đầy khoảng cách đó.\"" },
        { label: "\"Tất cả tôn giáo đều giống nhau\"", desc: "\"Họ chia sẻ đạo đức tương tự, nhưng Chúa Giêsu đã nói riêng 'Ta là đường đi' (Gi 14:6). Chúng ta có thể cùng nhau xem xét tuyên bố đó không?\"" },
        { label: "\"Tôi sẽ nghĩ sau\"", desc: "\"Hoàn toàn hiểu. Chỉ một điều nữa — hãy nhớ cuộc trò chuyện hôm nay này.\" Để lại thông tin liên lạc của bạn." },
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

function MissionBoardScreen({ onTab, currentTab, onStartJourney, gateIdx, missionGates, onOpenTool, activeMission, onChangeMission }: {
  onTab: (t: NavTab) => void; currentTab: NavTab;
  onStartJourney: (m: Mission) => void;
  gateIdx: Record<Mission, number>;
  missionGates: Record<Mission, number>;
  onOpenTool: (s: "four-laws" | "street-ev") => void;
  activeMission: Mission;
  onChangeMission: (m: Mission) => void;
}) {
  const missions: Mission[] = ["indonesia", "japan", "india", "mexico", "brazil", "china", "cambodia", "vietnam"];
  const [showMissionPicker, setShowMissionPicker] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F6F5F1" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 20px 100px", display: "flex", flexDirection: "column", gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase", marginBottom: 4 }}>Mission Board</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 30, fontFamily: SERIF, color: "#0C1F35", lineHeight: 1.15 }}>Choose Your Journey</h2>
            <motion.button
              onClick={() => setShowMissionPicker(!showMissionPicker)}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "#0C1F35",
                border: "none",
                cursor: "pointer",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: SANS,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{MISSION_META[activeMission].flag}</span>
              <span>Change Country</span>
            </motion.button>
          </div>
          {showMissionPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {missions.map((m) => {
                const meta = MISSION_META[m];
                const isActive = m === activeMission;
                return (
                  <motion.button
                    key={m}
                    onClick={() => {
                      onChangeMission(m);
                      setShowMissionPicker(false);
                    }}
                    style={{
                      padding: "12px 10px",
                      borderRadius: 12,
                      background: isActive ? "#0C1F35" : "rgba(12,31,53,0.08)",
                      border: isActive ? "2px solid #4A9FE0" : "1px solid rgba(12,31,53,0.2)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: SANS,
                      color: isActive ? "#FFFFFF" : "#0C1F35",
                      transition: "all 0.2s",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span style={{ fontSize: 16 }}>{meta.flag}</span>
                    <div style={{ textAlign: "left" }}>
                      <div>{meta.country}</div>
                      <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2 }}>Gate {gateIdx[m] + 1}/7</div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {missions.filter(m => m === activeMission).map((m, i) => {
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

        {activeMission === "india" && (
          <motion.button
            onClick={(event) => {
              event.stopPropagation();
              setLyricsOpen(true);
            }}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 18, background: "#E8F1F8", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: SANS, color: "#0C1F35", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 12px rgba(12,31,53,0.08)" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>🎵</span>
            <span>Song Lyrics</span>
          </motion.button>
        )}

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

      {lyricsOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(12,31,53,0.58)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, zIndex: 50 }}>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.22 }} style={{ width: "100%", maxWidth: 420, background: "#FFFFFF", borderRadius: 24, padding: 20, boxShadow: "0 24px 60px rgba(12,31,53,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontFamily: SANS, color: "#6B7C92", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>India Song</p>
                <h3 style={{ margin: "6px 0 0", fontSize: 20, fontFamily: SERIF, color: "#0C1F35" }}>Yeeshu ke peechhe</h3>
              </div>
              <button onClick={() => setLyricsOpen(false)} style={{ border: "none", background: "rgba(12,31,53,0.08)", width: 32, height: 32, borderRadius: 16, cursor: "pointer", color: "#0C1F35", fontWeight: 700 }}>×</button>
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
              <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: 14.5, lineHeight: 1.8, color: "#0C1F35", fontFamily: SERIF }}>{INDIA_SONG_LYRICS}</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNav current={currentTab} onTab={onTab} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSATION CARD
// ══════════════════════════════════════════════════════════════════════════════
function ConversationCard({ lines, caption, speechLang }: { lines: ConvLine[]; caption: string; speechLang: string }) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [slowMode, setSlowMode] = useState(false);
  
  const handlePlay = (idx: number, isSlow: boolean = false) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lines[idx].word);
    utterance.lang = speechLang; 
    utterance.rate = isSlow ? 0.6 : 0.85; 
    utterance.pitch = 1.0;
    setPlayingIdx(idx);
    setSlowMode(isSlow);
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
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 220, alignItems: line.mine ? "flex-end" : "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: 18, borderTopLeftRadius: line.mine ? 18 : 6, borderTopRightRadius: line.mine ? 6 : 18, background: line.mine ? "#0C1F35" : "#F0F4F9" }}>
              <p style={{ fontSize: 13, fontFamily: SANS, fontWeight: 600, color: line.mine ? "#FFFFFF" : "#0C1F35", marginBottom: 3 }}>{line.word}</p>
              <p style={{ fontSize: 10, fontFamily: SANS, color: line.mine ? "rgba(255,255,255,0.5)" : "#6B7C92", lineHeight: 1.4 }}>{line.english}</p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <motion.button onClick={() => handlePlay(idx, false)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: playingIdx === idx && !slowMode ? "#4A9FE0" : "rgba(74,159,224,0.1)", color: playingIdx === idx && !slowMode ? "#FFFFFF" : "#4A9FE0", fontSize: 10, fontWeight: 600, fontFamily: SANS, transition: "background 0.2s" }} whileTap={{ scale: 0.92 }}>
                <motion.div animate={playingIdx === idx && !slowMode ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.5, repeat: playingIdx === idx && !slowMode ? Infinity : 0 }}><Volume2 size={10} strokeWidth={2} /></motion.div>
                {playingIdx === idx && !slowMode ? "재생 중…" : "듣기"}
              </motion.button>
              <motion.button onClick={() => handlePlay(idx, true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, border: "none", cursor: "pointer", background: playingIdx === idx && slowMode ? "#B89A5E" : "rgba(184,137,42,0.1)", color: playingIdx === idx && slowMode ? "#FFFFFF" : "#B89A5E", fontSize: 9, fontWeight: 600, fontFamily: SANS, transition: "background 0.2s" }} whileTap={{ scale: 0.92 }}>
                <motion.div animate={playingIdx === idx && slowMode ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.5, repeat: playingIdx === idx && slowMode ? Infinity : 0 }}><Volume2 size={9} strokeWidth={2} /></motion.div>
                {playingIdx === idx && slowMode ? "재생 중…" : "느리게"}
              </motion.button>
            </div>
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
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [quizSelections, setQuizSelections] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = MISSION_META[mission];
  const gates = meta.gates;
  const gate = gates[gateIdx];
  const gateNum = gateIdx + 1;
  const isLast = gateIdx === gates.length - 1;

  useEffect(() => {
    setPlayingIdx(null); setPrayerOpen(false); setLyricsOpen(false);
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

          {mission === "india" && (() => {
            const recallWord = gate.vocab[gateIdx % gate.vocab.length];
            const distractors = gate.vocab
              .filter((v) => v.word !== recallWord.word)
              .map((v) => v.english)
              .slice(0, 3);
            const recallOptions = [...distractors, recallWord.english].sort(() => Math.random() - 0.5);
            const recallKey = `${mission}-${gateIdx}-recall`;
            const selectedRecall = quizSelections[recallKey];
            const isRecallCorrect = selectedRecall === recallWord.english;

            return (
              <>
                <section>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                    <span style={{ fontSize: 13 }}>🧠</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase" }}>Word Recall</span>
                  </div>
                  <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 16px rgba(12,31,53,0.06)" }}>
                    <p style={{ fontSize: 15, fontFamily: SANS, color: "#0C1F35", fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>
                      Match this word: <span style={{ color: "#B89A5E" }}>{recallWord.word}</span>
                    </p>
                    <div style={{ display: "grid", gap: 8 }}>
                      {recallOptions.map((option) => {
                        const isChosen = selectedRecall === option;
                        const isAnswer = option === recallWord.english;
                        const optionStyle = {
                          width: "100%",
                          borderRadius: 12,
                          border: "1px solid rgba(12,31,53,0.12)",
                          background: selectedRecall ? (isAnswer ? "rgba(69, 160, 108, 0.12)" : isChosen ? "rgba(244, 104, 104, 0.1)" : "#F7F7F5") : "#F7F7F5",
                          color: "#0C1F35",
                          fontFamily: SANS,
                          fontSize: 13,
                          padding: "11px 12px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontWeight: 600,
                        } as const;

                        return (
                          <button key={option} onClick={() => setQuizSelections((prev) => ({ ...prev, [recallKey]: option }))} style={optionStyle}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {selectedRecall && (
                      <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6, fontFamily: SANS, color: isRecallCorrect ? "#1F6B48" : "#8B3A3A", fontWeight: 600 }}>
                        {isRecallCorrect ? `✅ Correct! “${recallWord.word}” means “${recallWord.english}.”` : `❌ Not quite. “${recallWord.word}” means “${recallWord.english}.”`}
                      </p>
                    )}
                  </div>
                </section>

                {gate.quiz && (() => {
                  const currentQuizKey = `${mission}-${gateIdx}`;
                  const selectedAnswer = quizSelections[currentQuizKey];
                  const isCorrect = selectedAnswer === gate.quiz.answer;
                  return (
                    <section>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                        <span style={{ fontSize: 13 }}>🧠</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", fontFamily: SANS, color: "#A8B5C4", textTransform: "uppercase" }}>Quick Check</span>
                      </div>
                      <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 16px rgba(12,31,53,0.06)" }}>
                        <p style={{ fontSize: 15, fontFamily: SANS, color: "#0C1F35", fontWeight: 700, lineHeight: 1.5, marginBottom: 12 }}>{gate.quiz.question}</p>
                        <div style={{ display: "grid", gap: 8 }}>
                          {gate.quiz.options.map((option) => {
                            const isChosen = selectedAnswer === option;
                            const isAnswer = option === gate.quiz.answer;
                            const optionStyle = {
                              width: "100%",
                              borderRadius: 12,
                              border: "1px solid rgba(12,31,53,0.12)",
                              background: selectedAnswer ? (isAnswer ? "rgba(69, 160, 108, 0.12)" : isChosen ? "rgba(244, 104, 104, 0.1)" : "#F7F7F5") : "#F7F7F5",
                              color: "#0C1F35",
                              fontFamily: SANS,
                              fontSize: 13,
                              padding: "11px 12px",
                              textAlign: "left",
                              cursor: "pointer",
                              fontWeight: 600,
                            } as const;

                            return (
                              <button key={option} onClick={() => setQuizSelections((prev) => ({ ...prev, [currentQuizKey]: option }))} style={optionStyle}>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {selectedAnswer && (
                          <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6, fontFamily: SANS, color: isCorrect ? "#1F6B48" : "#8B3A3A", fontWeight: 600 }}>
                            {isCorrect ? `✅ Correct! ${gate.quiz.explanation}` : `❌ Not quite. Correct answer: ${gate.quiz.answer}. ${gate.quiz.explanation}`}
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })()}
              </>
            );
          })()}

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

          {mission === "india" && (
            <motion.button onClick={() => setLyricsOpen(true)} style={{ width: "100%", padding: "14px 18px", borderRadius: 18, background: "#E8F1F8", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: SANS, color: "#0C1F35", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              <span>🎵</span>
              <span>Song Lyrics</span>
            </motion.button>
          )}

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

          <AnimatePresence>
            {lyricsOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(12,31,53,0.58)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, zIndex: 50 }}>
                <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.22 }} style={{ width: "100%", maxWidth: 420, background: "#FFFFFF", borderRadius: 24, padding: 20, boxShadow: "0 24px 60px rgba(12,31,53,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontFamily: SANS, color: "#6B7C92", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>India Song</p>
                      <h3 style={{ margin: "6px 0 0", fontSize: 20, fontFamily: SERIF, color: "#0C1F35" }}>Yeeshu ke peechhe</h3>
                    </div>
                    <button onClick={() => setLyricsOpen(false)} style={{ border: "none", background: "rgba(12,31,53,0.08)", width: 32, height: 32, borderRadius: 16, cursor: "pointer", color: "#0C1F35", fontWeight: 700 }}>×</button>
                  </div>
                  <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                    <p style={{ margin: 0, whiteSpace: "pre-line", fontSize: 14.5, lineHeight: 1.8, color: "#0C1F35", fontFamily: SERIF }}>{INDIA_SONG_LYRICS}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
  const [showDonation, setShowDonation] = useState(false);
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

          {/* Gospel Stamps Section */}
          <div style={{ marginBottom: 24, padding: "12px 14px", background: "rgba(196,160,48,0.08)", borderRadius: 12, border: "1px solid rgba(196,160,48,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <p style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS, color: "#C9A84C", letterSpacing: "0.02em" }}>Gospel Stamps</p>
            </div>
            <p style={{ fontSize: 10, fontFamily: SANS, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Record your journey learning about God's love in different cultures & languages 🌍💖</p>
          </div>

          {/* Language row */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", fontFamily: SANS, color: "rgba(196,160,48,0.7)", textTransform: "uppercase", marginBottom: 12 }}>{t("settings.language")}</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
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

          {/* Donation Section */}
          <motion.button onClick={() => setShowDonation(!showDonation)} whileTap={{ scale: 0.97 }} style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, fontFamily: SANS, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Heart size={14} fill="currentColor" /> Support This Mission
          </motion.button>

          {showDonation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 12, padding: "12px 14px", background: "rgba(196,160,48,0.08)", borderRadius: 12, border: "1px solid rgba(196,160,48,0.2)" }}>
              <p style={{ fontSize: 10, fontWeight: 600, fontFamily: SANS, color: "#C9A84C", marginBottom: 8 }}>Support our mission work:</p>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="https://venmo.com/" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(196,160,48,0.15)", textAlign: "center", color: "#C9A84C", fontSize: 11, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(196,160,48,0.3)", cursor: "pointer" }}>Venmo</a>
                <a href="https://paypal.me/" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "10px", borderRadius: 8, background: "rgba(196,160,48,0.15)", textAlign: "center", color: "#C9A84C", fontSize: 11, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(196,160,48,0.3)", cursor: "pointer" }}>PayPal</a>
              </div>
            </motion.div>
          )}

          <motion.button onClick={onClose} whileTap={{ scale: 0.97 }} style={{ width: "100%", padding: "14px 0", borderRadius: 16, background: "#C9A84C", border: "none", cursor: "pointer", color: "#0B1829", fontSize: 15, fontWeight: 700, fontFamily: SANS }}>
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
    { country: "Mexico",    emoji: "🇲🇽", obtained: true,  gates: gateIdx.mexico + 1,   total: 7, color: "#C15B3D" },
    { country: "Brazil",    emoji: "🇧🇷", obtained: true,  gates: gateIdx.brazil + 1,   total: 7, color: "#1B7A3D" },
    { country: "China",     emoji: "🇨🇳", obtained: true,  gates: gateIdx.china + 1,    total: 7, color: "#D41245" },
    { country: "Cambodia",  emoji: "🇰🇭", obtained: true,  gates: gateIdx.cambodia + 1, total: 7, color: "#E8334A" },
    { country: "Vietnam",   emoji: "🇻🇳", obtained: true,  gates: gateIdx.vietnam + 1,  total: 7, color: "#DA251D" },
  ];
  const totalGates = gateIdx.indonesia + gateIdx.japan + gateIdx.india + gateIdx.mexico + gateIdx.brazil + gateIdx.china + gateIdx.cambodia + gateIdx.vietnam + 1;
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderTop: "1px solid rgba(12,35,64,0.08)", borderBottom: "1px solid rgba(12,35,64,0.08)" }}>
              {[{ label: "Gates", value: String(totalGates) }, { label: "Missions", value: "8" }, { label: "Nations", value: "8" }, { label: "Passion", value: "🩵" }].map((s, i) => (
                <div key={s.label} style={{ padding: "8px 0", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(12,35,64,0.08)" : "none" }}>
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
              <p style={{ fontSize: 8, fontWeight: 700, fontFamily: SANS, color: "#1565A8", letterSpacing: "0.08em" }}>8 / 8</p>
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

const EXPRESSION_EMOJIS = [
  "😊", "😂", "😍", "🥰", "😌",
  "😮", "🤔", "😌", "😅", "😎",
  "❤️", "💪", "🙌", "🤝", "💝",
  "🎯", "⚡", "✨", "🌟", "🔥",
  "😇", "🤗", "😌", "💕", "🕊️",
  "🌈", "🌸", "🌺", "🌻", "🌼"
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
          {entry.type === "expression" && entry.emoji && <span style={{ fontSize: 11 }}>{entry.emoji}</span>}
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
  const [selectedEmoji, setSelectedEmoji] = useState<string>("💬");
  const [customEmoji, setCustomEmoji] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = LOG_TYPE_META.find(m => m.id === type)!;

  const handleSave = () => {
    if (!body.trim()) return;
    const emojiToSave = type === "expression" && customEmoji ? customEmoji : type === "expression" ? selectedEmoji : undefined;
    onSave({ type, title, body, photoUrl: photo ?? undefined, emoji: emojiToSave });
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
                <motion.button key={m.id} onClick={() => { setType(m.id); if (m.id === "expression") setSelectedEmoji("💬"); setCustomEmoji(""); }} whileTap={{ scale: 0.95 }}
                  style={{ flex: 1, padding: "9px 6px", borderRadius: 14, border: `1.5px solid ${type === m.id ? m.color : "rgba(12,31,53,0.1)"}`, background: type === m.id ? m.bg : "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.18s" }}>
                  <span style={{ fontSize: 18 }}>{m.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: SANS, color: type === m.id ? m.color : "rgba(12,31,53,0.4)" }}>{t(lk)}</span>
                </motion.button>
              );
            })}
          </div>
          
          {type === "expression" && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, fontFamily: SANS, color: "#0B1829", marginBottom: 10 }}>이모지 선택 또는 입력</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 12 }}>
                {EXPRESSION_EMOJIS.map((emoji, i) => (
                  <motion.button key={i} onClick={() => { setSelectedEmoji(emoji); setCustomEmoji(""); }} whileTap={{ scale: 0.9 }}
                    style={{ padding: "10px 0", borderRadius: 12, border: selectedEmoji === emoji && !customEmoji ? `2px solid #3B6FE0` : "1.5px solid rgba(12,31,53,0.1)", background: selectedEmoji === emoji && !customEmoji ? "#EEF3FF" : "#FFFFFF", cursor: "pointer", fontSize: 22, transition: "all 0.15s" }}>
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={customEmoji} onChange={e => { setCustomEmoji(e.target.value.slice(0, 2)); if (e.target.value) setSelectedEmoji(""); }} placeholder="커스텀 이모지..."
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: customEmoji ? "2px solid #3B6FE0" : "1.5px solid rgba(12,31,53,0.1)", background: "#FFFFFF", fontFamily: SANS, fontSize: 16, outline: "none", textAlign: "center", transition: "all 0.15s" }} />
                {customEmoji && <button onClick={() => { setCustomEmoji(""); setSelectedEmoji("💬"); }} style={{ padding: "10px 12px", borderRadius: 12, border: "1.5px solid rgba(12,31,53,0.1)", background: "#FFFFFF", cursor: "pointer" }}><X size={14} /></button>}
              </div>
            </div>
          )}
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
// LAUNCH FEEDBACK MODAL
// ══════════════════════════════════════════════════════════════════════════════
function LaunchFeedbackModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div className="absolute inset-0 z-30" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="absolute inset-0 z-40 flex items-center justify-center" style={{ pointerEvents: "none" }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 260, damping: 25 }}>
        <motion.div style={{ pointerEvents: "auto", background: "#FFFFFF", borderRadius: 28, padding: "28px 24px", boxShadow: "0 12px 48px rgba(12,31,53,0.18)", border: "1px solid rgba(12,31,53,0.08)", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12, display: "flex", justifyContent: "center" }}>✈️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: SANS, color: "#0C1F35", marginBottom: 12 }}>곧 앱이 출시돼요!</h3>
            <p style={{ fontSize: 13, fontFamily: SANS, color: "rgba(12,31,53,0.65)", lineHeight: 1.7, marginBottom: 8 }}>앱 출시 후 가장 먼저 연락드릴까요?</p>
            <p style={{ fontSize: 12, fontFamily: SANS, color: "rgba(12,31,53,0.55)", lineHeight: 1.6 }}>선교 준비 중이신가요? 원하는 기능이나 나라가 있으면 바로 알려주세요!</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.a href="https://forms.gle/YVhnuzpGVV9WJMzUA" target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.96 }}
              style={{ padding: "14px 0", borderRadius: 16, background: "#3A6FE0", border: "none", cursor: "pointer", color: "#FFFFFF", fontSize: 14, fontWeight: 700, fontFamily: SANS, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Mail size={16} />
              앱 출시되면 가장 먼저 알림받기
            </motion.a>
            <motion.button onClick={onClose} whileTap={{ scale: 0.96 }}
              style={{ padding: "14px 0", borderRadius: 16, background: "rgba(12,31,53,0.08)", border: "1px solid rgba(12,31,53,0.12)", cursor: "pointer", color: "#0C1F35", fontSize: 14, fontWeight: 600, fontFamily: SANS }}>
              나중에
            </motion.button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(12,31,53,0.08)", margin: "20px 0" }} />

          {/* Donation section */}
          <div style={{ marginBottom: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", fontFamily: SANS, color: "#C4A96A", textTransform: "uppercase", marginBottom: 10 }}>💝 앱 지원하기</p>
            <p style={{ fontSize: 12, fontFamily: SANS, color: "rgba(12,31,53,0.6)", lineHeight: 1.6, marginBottom: 12 }}>지속적인 개선과 서버 유지를 위해 작은 후원이 큰 도움이 됩니다.</p>
            <div style={{ background: "rgba(196,160,48,0.08)", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(196,160,48,0.2)" }}>
              <p style={{ fontSize: 11, fontFamily: SANS, color: "rgba(12,31,53,0.5)", marginBottom: 6 }}>Venmo:</p>
              <p style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#C4A96A", letterSpacing: "0.02em" }}>@yongbekah</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
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
  const [gateIdx, setGateIdx] = useState<Record<Mission, number>>({ indonesia: 0, japan: 0, india: 0, brazil: 0, mexico: 0, china: 0, cambodia: 0, vietnam: 0 });
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [userName, setUserName] = useState("");
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith("ko") ? "ko" : "en");
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchModalShown, setLaunchModalShown] = useState(false);
  const sky = useLivingSky();

  const handleAddLog = (entry: Omit<LogEntry, "id" | "date">) => {
    setLogEntries(prev => [...prev, { ...entry, id: Date.now().toString(), date: new Date() }]);
  };

  const handleDeleteLog = (id: string) => {
    setLogEntries(prev => prev.filter(e => e.id !== id));
  };

  useEffect(() => {
    if (!launchModalShown && screen !== "welcome") {
      const timer = setTimeout(() => {
        setShowLaunchModal(true);
        setLaunchModalShown(true);
      }, 40000);
      return () => clearTimeout(timer);
    }
  }, [launchModalShown, screen]);

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
          goToScreen("journey", "journey");
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
      case "board": return <MissionBoardScreen onTab={handleTab} currentTab={navTab} onStartJourney={handleStartJourney} gateIdx={gateIdx} missionGates={{ indonesia: 7, japan: 7, india: 7, brazil: 7, mexico: 7, china: 7, cambodia: 7, vietnam: 7 }} onOpenTool={(s) => goToScreen(s)} activeMission={activeMission} onChangeMission={setActiveMission} />;
      case "journey": return <MissionJourneyScreen mission={activeMission} onFinish={() => goToScreen("passport", "passport")} onTab={handleTab} currentTab={navTab} gateIdx={gateIdx[activeMission]} onGateChange={handleGateChange} />;
      case "four-laws": return <FourLawsScreen onBack={() => goToScreen("board", "home")} />;
      case "street-ev": return <StreetEvScreen onBack={() => goToScreen("board", "home")} />;
      case "log": return <MissionLogScreen entries={logEntries} onAdd={handleAddLog} onDelete={handleDeleteLog} onTab={handleTab} currentTab={navTab} />;
      case "passport": return <MissionPassportScreen onTab={handleTab} currentTab={navTab} photoUrl={photoUrl} userName={userName} gateIdx={gateIdx} homeCountry={homeCountry} destination={destination} />;
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <motion.div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }} animate={{ background: sky.outerBg }} transition={{ duration: 3, ease: "easeInOut" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", perspective: "1000px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={screen} style={{ position: "absolute", inset: 0, transformOrigin: "center bottom", transformStyle: "preserve-3d" }} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.46, ease: [0.25, 0.46, 0.45, 0.94], opacity: { duration: 0.28 } }}>
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showLaunchModal && <LaunchFeedbackModal onClose={() => setShowLaunchModal(false)} />}
      </AnimatePresence>
    </motion.div>
    </LangContext.Provider>
  );
}
