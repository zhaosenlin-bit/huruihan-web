import { concepts } from "@/data/content";

export default function Methods() {
  return (
    <section id="concepts" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            03 / 创作方法
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          我怎么做东西。
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          三张概念卡：从范式、节奏、到给 AI 的说明书。
          <br />
          这是我从 5 天训练营里真正带走的东西。
        </p>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mt-16">
          {concepts.map((c, idx) => (
            <article
              key={c.name}
              className="group relative border border-border rounded-2xl p-6 sm:p-8 bg-surface/40 card-lift hover:border-accent/40 overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-60"
              />
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif italic text-accent text-2xl sm:text-3xl leading-none">
                  0{idx + 1}
                </span>
                <span className="text-text-subtle text-[10px] uppercase tracking-[0.25em]">
                  概念卡
                </span>
              </div>
              <h3 className="font-display text-text text-lg sm:text-xl tracking-tightish">
                {c.name}
              </h3>
              <p className="font-serif italic text-text-subtle text-sm mt-2">
                {c.poetic}
              </p>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed mt-5">
                {c.desc}
              </p>
              <ul className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
                {c.points?.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-text-muted text-sm leading-relaxed"
                  >
                    <span
                      aria-hidden
                      className="mt-2 shrink-0 w-1 h-1 rounded-full bg-accent/70"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-16">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            方法是脚手架，不是枷锁。
          </p>
        </div>
      </div>
    </section>
  );
}