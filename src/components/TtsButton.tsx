import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, X, Settings2, Wand2 } from "lucide-react";

type Status = "idle" | "playing" | "paused";

interface SpeechState {
  status: Status;
  text: string;
  voiceName: string;
}

const STORAGE_KEY = "lithos.tts.settings.v1";

const EXPLORATION_INTRO = [
  "欢迎来到 Lithos，一段跨越星辰的探索之旅。",
  "我们将离开地球的摇篮，飞越月球，掠过火星的红色荒原，穿越木星的风暴与土星的光环，最终驶向太阳系的边缘，遥望银河深处亿万颗恒星的故乡。",
  "在接下来的几分钟里，请闭上眼睛，让声音带你踏上这段探索宇宙的航程——从一颗蓝色的星球出发，去认识我们所在的家园，以及那片仍在等待被发现的无垠深空。",
].join(" ");

interface PersistedSettings {
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

const DEFAULT_SETTINGS: PersistedSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  lang: "zh-CN",
};

function loadSettings(): PersistedSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: PersistedSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

function getSelectedText(): string {
  const sel = window.getSelection();
  if (!sel) return "";
  const text = sel.toString().trim();
  if (text.length < 2) return "";
  const anchor = sel.anchorNode;
  if (anchor && anchor.nodeType === 1) {
    const el = anchor as Element;
    if (el.closest("input, textarea, [contenteditable='true']")) return "";
  }
  return text;
}

function getPrimaryTargetText(): string {
  const el = document.querySelector('[data-tts-target="primary"]');
  if (!el) return "";
  const t = (el.textContent || "").replace(/\s+/g, " ").trim();
  return t;
}

function collectSectionText(): string {
  const centerY = window.innerHeight / 2;
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main section, section")
  );
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.bottom < 60 || r.top > window.innerHeight - 40) continue;
    const score = Math.abs(r.top + r.height / 2 - centerY);
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  if (!best) return "";
  return (best.innerText || best.textContent || "").replace(/\s+/g, " ").trim();
}

export default function TtsButton() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [state, setState] = useState<SpeechState>({
    status: "idle",
    text: "",
    voiceName: "",
  });
  const settingsRef = useRef<PersistedSettings>(loadSettings());
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const sync = () => setVoices(window.speechSynthesis.getVoices());
    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", sync);
    };
  }, []);

  const resolvedVoice = useMemo(() => {
    if (voices.length === 0) return null;
    const s = settingsRef.current;
    if (s.voiceURI) {
      const exact = voices.find((v) => v.voiceURI === s.voiceURI);
      if (exact) return exact;
    }
    const want = (s.lang || "zh-CN").toLowerCase();
    const base = want.split("-")[0];
    return (
      voices.find((v) => v.lang.toLowerCase() === want) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
      voices.find((v) => /microsoft|google|natural/i.test(v.name)) ||
      voices[0]
    );
  }, [voices]);

  const updateSettings = useCallback((patch: Partial<PersistedSettings>) => {
    settingsRef.current = { ...settingsRef.current, ...patch };
    saveSettings(settingsRef.current);
  }, []);

  const stop = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setState((s) => ({ ...s, status: "idle" }));
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) {
        alert("当前浏览器不支持语音播报 (speechSynthesis)。");
        return;
      }
      const clean = text.replace(/\s+/g, " ").trim();
      if (!clean) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      const s = settingsRef.current;
      u.lang = s.lang;
      u.rate = s.rate;
      u.pitch = s.pitch;
      u.volume = s.volume;
      if (resolvedVoice) {
        u.voice = resolvedVoice;
      }
      u.onstart = () =>
        setState({ status: "playing", text: clean, voiceName: resolvedVoice?.name || "" });
      u.onpause = () => setState((st) => ({ ...st, status: "paused" }));
      u.onresume = () => setState((st) => ({ ...st, status: "playing" }));
      u.onend = () =>
        setState({ status: "idle", text: "", voiceName: resolvedVoice?.name || "" });
      u.onerror = () =>
        setState({ status: "idle", text: "", voiceName: resolvedVoice?.name || "" });
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [resolvedVoice]
  );

  const handlePrimary = useCallback(() => {
    if (state.status !== "idle") {
      stop();
      return;
    }
    const primary = getPrimaryTargetText();
    const selected = getSelectedText();
    const text = EXPLORATION_INTRO || primary || selected || collectSectionText();
    if (!text) {
      alert("未找到可朗读的内容。请先滚动到任意章节，或在页面上选中一段文字后再试。");
      return;
    }
    speak(text);
  }, [state.status, stop, speak]);

  const togglePause = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (state.status === "playing") {
      window.speechSynthesis.pause();
    } else if (state.status === "paused") {
      window.speechSynthesis.resume();
    }
  }, [state.status]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="tts-fab-wrap" aria-live="polite">
      {open && (
        <div className="tts-panel" role="dialog" aria-label="语音播报面板">
          <div className="tts-panel__head">
            <div className="tts-panel__title">
              <Volume2 size={16} />
              <span>语音播报</span>
            </div>
            <button
              className="tts-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="收起面板"
              type="button"
            >
              <X size={16} />
            </button>
          </div>

          <div className="tts-panel__body">
            {!supported ? (
              <p className="tts-hint">当前浏览器不支持语音合成 API。</p>
            ) : (
              <>
                <div className="tts-status">
                  {state.status === "idle" && (
                    <span className="tts-hint">
                      点击右下角语音按钮即可收听"探索宇宙"的介绍词；也可选中页面上的文字或滚动到任意章节后再次点击，朗读对应内容。
                    </span>
                  )}
                  {state.status !== "idle" && (
                    <div className="tts-playing">
                      <div className="tts-eq" data-active={state.status === "playing"} aria-hidden="true">
                        <span /><span /><span /><span />
                      </div>
                      <div className="tts-playing__text">
                        <div className="tts-playing__voice">
                          {state.voiceName || "默认语音"}
                        </div>
                        <div className="tts-playing__snippet" title={state.text}>
                          {state.text.slice(0, 60)}
                          {state.text.length > 60 ? "…" : ""}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="tts-actions">
                  <button
                    className="tts-btn tts-btn--primary"
                    onClick={handlePrimary}
                    type="button"
                  >
                    {state.status === "idle" ? (
                      <>
                        <Wand2 size={16} /> 开始朗读
                      </>
                    ) : (
                      <>
                        <Square size={16} /> 停止
                      </>
                    )}
                  </button>
                  <button
                    className="tts-btn"
                    onClick={togglePause}
                    disabled={state.status === "idle"}
                    type="button"
                  >
                    {state.status === "paused" ? (
                      <>
                        <Play size={16} /> 继续
                      </>
                    ) : (
                      <>
                        <Pause size={16} /> 暂停
                      </>
                    )}
                  </button>
                  <button
                    className="tts-btn tts-btn--ghost"
                    onClick={() => setSettingsOpen((v) => !v)}
                    type="button"
                    aria-expanded={settingsOpen}
                  >
                    <Settings2 size={16} /> 设置
                  </button>
                </div>

                {settingsOpen && (
                  <div className="tts-settings">
                    <label className="tts-row">
                      <span>语音</span>
                      <select
                        value={
                          settingsRef.current.voiceURI ||
                          resolvedVoice?.voiceURI ||
                          ""
                        }
                        onChange={(e) => updateSettings({ voiceURI: e.target.value })}
                      >
                        <option value="">系统默认（推荐中文）</option>
                        {voices
                          .filter((v) =>
                            (settingsRef.current.lang || "zh-CN")
                              .toLowerCase()
                              .startsWith(v.lang.toLowerCase().split("-")[0])
                          )
                          .concat(voices)
                          .filter((v, i, arr) => arr.findIndex((x) => x.voiceURI === v.voiceURI) === i)
                          .map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="tts-row">
                      <span>语言</span>
                      <select
                        value={settingsRef.current.lang}
                        onChange={(e) => updateSettings({ lang: e.target.value, voiceURI: undefined })}
                      >
                        <option value="zh-CN">中文（简体）</option>
                        <option value="zh-HK">中文（粤语/港）</option>
                        <option value="zh-TW">中文（繁体）</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="ja-JP">日本語</option>
                      </select>
                    </label>
                    <label className="tts-row">
                      <span>语速 {settingsRef.current.rate.toFixed(1)}x</span>
                      <input
                        type="range"
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={settingsRef.current.rate}
                        onChange={(e) => updateSettings({ rate: Number(e.target.value) })}
                      />
                    </label>
                    <label className="tts-row">
                      <span>音调 {settingsRef.current.pitch.toFixed(1)}</span>
                      <input
                        type="range"
                        min={0.5}
                        max={1.5}
                        step={0.1}
                        value={settingsRef.current.pitch}
                        onChange={(e) => updateSettings({ pitch: Number(e.target.value) })}
                      />
                    </label>
                    <label className="tts-row">
                      <span>音量 {Math.round(settingsRef.current.volume * 100)}%</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settingsRef.current.volume}
                        onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="tts-fab-row">
        <button
          className={`tts-fab ${state.status !== "idle" ? "is-active" : ""}`}
          onClick={() => {
            if (state.status === "idle") {
              setOpen(true);
              handlePrimary();
            } else {
              stop();
            }
          }}
          aria-label={state.status === "idle" ? "点击播放语音" : "停止语音播报"}
          title={state.status === "idle" ? "点击播放当前内容" : "点击停止"}
          type="button"
        >
          {state.status === "playing" ? (
            <span className="tts-fab__icon tts-fab__icon--playing" aria-hidden="true">
              <span /><span /><span />
            </span>
          ) : state.status === "paused" ? (
            <Play size={22} />
          ) : (
            <Volume2 size={22} />
          )}
        </button>
        <button
          className={`tts-fab tts-fab--small ${open ? "is-active" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "收起语音设置" : "打开语音设置"}
          title="语音设置"
          type="button"
        >
          <Settings2 size={16} />
        </button>
      </div>
    </div>
  );
}




