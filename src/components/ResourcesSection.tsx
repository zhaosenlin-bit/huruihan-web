import { resources } from "../data/resources";
import Stars from "./Stars";

export default function ResourcesSection() {
  return (
    <section id="resources" className="relative w-full bg-black text-white py-24 px-6 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
              工具与资源
            </p>
            <h2 className="text-4xl md:text-5xl font-playfair">
              看得更远，学得更深
            </h2>
            <p className="mt-3 max-w-2xl text-white/70">
              交互式 3D 模型、观星指南、教师资源包，离开首页也能继续探索宇宙。
            </p>
          </div>
          <a
            href="https://science.nasa.gov/solar-system/resources/"
            target="_blank"
            rel="noreferrer"
            className="self-start md:self-end text-sm px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition"
          >
            全部资源 →
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/30 transition"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-orange-300/90 bg-black/40 px-2 py-1 rounded-full">
                  {r.category}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-playfair text-lg leading-snug">{r.title}</h3>
                <p className="mt-2 text-sm text-white/65 flex-1">{r.blurb}</p>
                <span className="mt-3 text-sm text-orange-300 group-hover:translate-x-1 transition-transform">
                  {r.cta} →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}