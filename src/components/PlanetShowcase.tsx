import { useState } from "react";
import { planets, sun } from "../data/planets";
import Stars from "./Stars";

export default function PlanetShowcase() {
  const [active, setActive] = useState(planets[0]);

  return (
    <section className="relative w-full overflow-hidden bg-black px-6 py-24 text-white">
      <Stars />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-grotesk text-xs uppercase tracking-[0.4em] text-orange-300/80">
            太阳系巡礼
          </p>
          <h2 className="font-playfair text-4xl md:text-6xl">我们的恒星与八大行星</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            从最靠近太阳的水星，到深蓝遥远的海王星——每一颗行星都拥有截然不同的环境与故事。
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <li>
              <button
                onClick={() => setActive(sun as never)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  active.name === sun.name
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                <div className="text-xs uppercase tracking-widest opacity-70">恒星</div>
                <div className="font-playfair text-lg">{sun.name}</div>
              </button>
            </li>
            {planets.map((planet) => (
              <li key={planet.id}>
                <button
                  onClick={() => setActive(planet)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    planet.id === active.id
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: planet.color }}
                  />
                  <div>
                    <div className="text-base">{planet.name}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-70">
                      {planet.tag}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <article
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
            style={{ boxShadow: `0 30px 80px -30px ${active.color}55` }}
          >
            <div className="relative h-64 overflow-hidden md:h-96">
              <img
                src={active.image}
                alt={active.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="font-grotesk text-xs uppercase tracking-widest text-white/80">
                  {active.tag}
                </p>
                <h3 className="mt-1 font-playfair text-3xl md:text-5xl">{active.name}</h3>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-8">
              <div>
                <p className="leading-relaxed text-white/80">{active.excerpt}</p>
                {active.facts && (
                  <ul className="mt-6 space-y-3">
                    {active.facts.map((fact, index) => (
                      <li key={index} className="flex gap-3 text-sm text-white/75">
                        <span
                          className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: active.color }}
                        />
                        {fact}
                      </li>
                    ))}
                  </ul>
                )}
                <a
                  href={active.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm text-white/90 transition hover:bg-white/10"
                >
                  查看 NASA 页面 →
                </a>
              </div>
              <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-3 text-xs uppercase tracking-widest text-white/50">一句话总结</p>
                <p className="text-sm text-white/80">{active.meta}</p>
              </aside>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
