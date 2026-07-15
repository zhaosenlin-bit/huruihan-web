import { missions } from "../data/missions";
import Stars from "./Stars";

const STATUS_COLOR: Record<string, string> = {
  Active: "bg-emerald-400/20 text-emerald-200 border-emerald-300/40",
  Extended: "bg-cyan-400/20 text-cyan-200 border-cyan-300/40",
  "En Route": "bg-amber-400/20 text-amber-200 border-amber-300/40",
  Future: "bg-violet-400/20 text-violet-200 border-violet-300/40",
  Completed: "bg-slate-300/20 text-slate-200 border-slate-300/40",
};

const STATUS_ZH: Record<string, string> = {
  Active: "运行中",
  Extended: "延长任务",
  "En Route": "在途",
  Future: "未来任务",
  Completed: "已结束",
};

export default function MissionsSection() {
  return (
    <section id="missions" className="relative w-full bg-gradient-to-b from-black via-[#06070d] to-black text-white py-24 px-6 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
              太空任务
            </p>
            <h2 className="text-4xl md:text-5xl font-playfair">
              飞向其他世界的旅程
            </h2>
            <p className="mt-3 max-w-2xl text-white/70">
              从带回小行星样品的探测器，到下一段通往冰巨星的长征，我们一一梳理。
            </p>
          </div>
          <a
            href="https://science.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="self-start md:self-end text-sm px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition"
          >
            全部 NASA 任务 →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {missions.map((m) => (
            <a
              key={m.id}
              href={m.href}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-widest border ${STATUS_COLOR[m.status]}`}
                >
                  {STATUS_ZH[m.status] || m.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-white/50">{m.tag}</p>
                <h3 className="font-playfair text-2xl mt-1">{m.name}</h3>
                <p className="mt-2 text-sm text-white/70 line-clamp-3">
                  {m.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}