import { path } from "@/data/content";

export default function Path() {
  return (
    <section id="path" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            07 / 成长路线
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          我想去哪里。
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          短期、中期、长期 — 一份给"未来的我"看的地图。
          <br />
          每两周更新一次，不给自己画大饼。
        </p>

        <div className="relative mt-16">
          <span
            aria-hidden
            className="absolute left-[19px] sm:left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-border to-border/40"
          />
          <ol className="space-y-10 sm:space-y-14">
            {path.map((phase) => (
              <li key={phase.label} className="relative pl-12 sm:pl-16">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-border bg-bg flex items-center justify-center font-serif italic text-accent text-base sm:text-lg"
                >
                  {phase.label}
                </span>
                <div className="ml-2 sm:ml-4">
                  <p className="font-serif italic text-text-subtle text-sm">
                    {phase.poetic}
                  </p>
                  <h3 className="font-display text-text text-xl sm:text-2xl tracking-tightish mt-1">
                    {phase.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {phase.items.map((it, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-text-muted text-sm sm:text-base leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="mt-2.5 shrink-0 w-1 h-1 rounded-full bg-accent/70"
                        />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-4 mt-20">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            每两周回来对一次这张表。
          </p>
        </div>
      </div>
    </section>
  );
}