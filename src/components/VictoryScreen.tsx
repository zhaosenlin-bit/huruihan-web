import type { SolarPlanet } from "./SolarSystem";

type VictoryScreenProps = {
  planet: SolarPlanet;
  onBackToMission: () => void;
  onPlayAgain: () => void;
};

export default function VictoryScreen({
  planet,
  onBackToMission,
  onPlayAgain,
}: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.18),transparent_40%),linear-gradient(180deg,#02040c_0%,#050a17_50%,#07101b_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.92)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.92)_1px,transparent_1px)] [background-size:90px_90px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.18),rgba(125,211,252,0.04)_36%,transparent_72%)] blur-3xl" />

      <div className="relative z-10 w-[min(520px,90vw)] rounded-3xl border border-cyan-300/24 bg-slate-950/82 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div
          className="mx-auto h-20 w-20 rounded-full border border-white/10"
          style={{
            background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.95), ${planet.color})`,
            boxShadow: `0 0 40px ${planet.glow}`,
          }}
        />
        <p className="mt-6 text-[10px] tracking-[0.42em] text-cyan-200/80">MISSION COMPLETE</p>
        <h2 className="mt-3 text-3xl font-semibold">{planet.nameEn} 任务胜利</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/72">
          穿梭阶段穿越了 {planet.nameEn} 高层大气，2D 收集阶段拿回了金属矿、能量晶与氦气云，最终顺利返航基地。
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-[11px] tracking-[0.18em]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
            <p className="text-amber-200/80">金属矿 ×3</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
            <p className="text-cyan-200/80">能量晶 ×3</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
            <p className="text-violet-200/80">氦气云 ×2</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-6 py-2.5 text-xs tracking-[0.28em] text-cyan-100 transition hover:bg-cyan-400/25"
          >
            再玩一次
          </button>
          <button
            type="button"
            onClick={onBackToMission}
            className="rounded-full border border-white/25 bg-white/[0.04] px-6 py-2.5 text-xs tracking-[0.28em] text-white/90 transition hover:bg-white/[0.12]"
          >
            返回任务
          </button>
        </div>
      </div>
    </div>
  );
}