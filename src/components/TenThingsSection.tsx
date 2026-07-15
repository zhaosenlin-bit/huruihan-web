import { useState } from "react";
import { tenThings } from "../data/tenThings";
import Stars from "./Stars";

export default function TenThingsSection() {
  const [activeId, setActiveId] = useState(tenThings[0].id);
  const active = tenThings.find((t) => t.id === activeId)!;

  return (
    <section id="ten-things" className="relative w-full bg-gradient-to-b from-black via-[#06070d] to-black text-white py-24 px-6 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-14">
          <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
            十大知识
          </p>
          <h2 className="text-4xl md:text-6xl font-playfair">
            边看边学的宇宙课堂
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/70">
            来自 NASA 的科普专题，每一篇都能带你更近一步理解宇宙。
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tenThings.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                activeId === t.id
                  ? "border-orange-400/60 bg-orange-400/10 text-orange-200"
                  : "border-white/15 text-white/80 hover:border-white/40"
              }`}
            >
              <span className="font-playfair mr-2">{t.number}</span>
              {t.title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 min-h-[280px]">
            <img
              src={active.image}
              alt={active.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 p-8 h-full flex flex-col justify-end">
              <span className="font-grotesk tracking-widest uppercase text-xs text-orange-300/80">
                {active.number}
              </span>
              <h3 className="font-playfair text-3xl md:text-4xl mt-1">
                {active.title}
              </h3>
              <p className="mt-3 max-w-md text-white/80">{active.description}</p>
              <a
                href={active.href}
                target="_blank"
                rel="noreferrer"
                className="mt-5 self-start px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 text-sm"
              >
                阅读完整章节 →
              </a>
            </div>
          </div>

          <ol className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            {active.items.map((it, i) => (
              <li
                key={i}
                className="group flex gap-5 py-4 border-b last:border-b-0 border-white/5"
              >
                <span className="font-playfair text-2xl text-orange-300/80 min-w-[2.5rem]">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-lg font-medium">{it.name}</h4>
                  <p className="text-sm text-white/65 mt-1 leading-relaxed">
                    {it.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}