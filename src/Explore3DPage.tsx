import Galaxy from "./components/Galaxy";
import TtsButton from "./components/TtsButton";
import SolarSystemStage from "./components/SolarSystemStage";

type Explore3DPageProps = {
  onBackHome: () => void;
};

export default function Explore3DPage({ onBackHome }: Explore3DPageProps) {
  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#0a1228] text-white">
      <div className="absolute inset-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.55}
          glowIntensity={0.7}
          saturation={0.95}
          hueShift={214}
          twinkleIntensity={0.7}
          rotationSpeed={0.18}
          repulsionStrength={2.4}
          starSpeed={0.7}
          speed={1.1}
          focal={[0.5, 0.5]}
          rotation={[1, 0.1]}
          transparent={true}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,rgba(8,16,38,0.0)_0%,rgba(2,4,12,0.18)_55%,rgba(2,4,12,0.42)_100%)]" />

      <div className="absolute inset-0 z-[2]">
        <SolarSystemStage className="h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col">
        <div className="pointer-events-auto flex items-start justify-between gap-3 p-5 sm:p-6">
          <button
            onClick={onBackHome}
            className="rounded-full border border-white/15 bg-slate-950/55 px-5 py-2 text-sm text-white/92 backdrop-blur-xl transition hover:bg-white/10"
            type="button"
          >
            返回主页
          </button>
          <p
            data-tts-target="primary"
            className="hidden max-w-xs text-right text-[11px] leading-relaxed text-white/55 sm:block"
          >
            拖动旋转视角，滚轮缩放；点击任意一颗行星或太阳，可查看简要介绍。
          </p>
        </div>
      </div>
      <TtsButton />
    </div>
  );
}
