import { skills } from "@/data/content";

function ProgressBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-[3px] bg-border/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full bar-fill"
          style={{ width: `${level * 20}%` }}
        />
      </div>
      <span className="text-text-subtle text-[11px] font-mono w-6 text-right tabular-nums">
        {level}
      </span>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            02 / 我会什么
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          把想法变成作品，把作品变成脚印。
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          从 0-me/profile.md 到 CAPABILITY-MAP.md — 我现在会什么、在补什么、哪些是主力。
        </p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-16">
          {skills.map((cat) => (
            <div
              key={cat.category}
              className="group border border-border rounded-2xl p-6 bg-surface/40 card-lift hover:border-accent/40 hover:bg-surface/70"
            >
              <p className="font-serif italic text-text-muted text-sm mb-2">
                {cat.poetic}
              </p>
              <h3 className="font-display text-text text-xl mb-6 tracking-tightish">
                {cat.category}
              </h3>
              <ul className="space-y-4">
                {cat.items.map((item) => (
                  <li key={item.name} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-text text-sm">{item.name}</span>
                      {item.note && (
                        <span className="text-text-subtle text-[11px] tabular-nums shrink-0">
                          {item.note}
                        </span>
                      )}
                    </div>
                    <ProgressBar level={item.level} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-16">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            熟练度 1-5 · 持续更新，不画大饼。
          </p>
        </div>
      </div>
    </section>
  );
}