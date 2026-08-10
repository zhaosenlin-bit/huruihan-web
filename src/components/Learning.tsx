import { learning } from "@/data/content";

export default function Learning() {
  return (
    <section id="learning" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            06 / 我的学习记录
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          {learning.poetic}
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          从知识库 5-daily/ 和 2-concepts/ 同步过来 — 每天学一点，每天写一篇。
        </p>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 mt-16">
          <div>
            <p className="text-text-subtle text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="block w-4 h-px bg-text-subtle/60" />
              最近 Daily
            </p>

            <ol className="relative space-y-7 pl-6 border-l border-border/60">
              {learning.recentDailies.map((d) => (
                <li key={d.date} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-accent ring-4 ring-bg"
                  />
                  <p className="text-text-subtle text-xs font-mono tabular-nums">
                    {d.date}
                  </p>
                  <p className="text-text mt-1.5 text-sm sm:text-base leading-snug">
                    {d.title}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-text-subtle text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="block w-4 h-px bg-text-subtle/60" />
              推荐概念卡
            </p>

            <ul className="space-y-5">
              {learning.conceptCards.map((c) => (
                <li
                  key={c.name}
                  className="group flex items-start gap-4 p-4 -mx-4 rounded-xl hover:bg-surface/40 transition-colors"
                >
                  <span
                    aria-hidden
                    className="shrink-0 mt-1 font-serif italic text-accent/70 group-hover:text-accent transition-colors text-lg leading-none"
                  >
                    ✦
                  </span>
                  <div>
                    <p className="font-display text-text text-base group-hover:text-accent transition-colors">
                      {c.name}
                    </p>
                    <p className="text-text-muted text-sm mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-16">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            每天学一点，每天写一篇。
          </p>
        </div>
      </div>
    </section>
  );
}