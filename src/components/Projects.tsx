import { projects } from "@/data/content";

export default function Projects() {
  return (
    <section id="works" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            04 / 我的作品
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          作品不是装饰，是脚印。
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          比赛做的、训练营做的、自己想做的 — 每一个都是从 0 跑到能交付的东西。
        </p>

        <div className="space-y-6 mt-16">
          {projects.map((p, idx) => (
            <article
              key={p.title}
              className="group relative border border-border rounded-2xl p-6 sm:p-8 bg-surface/40 card-lift hover:border-accent/40 hover:bg-surface/70 overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute top-6 right-6 font-mono text-text-subtle text-[11px] tabular-nums opacity-50 group-hover:opacity-90 transition-opacity"
              >
                {String(idx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>

              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />

              <div className="flex items-start justify-between gap-6 mb-4">
                <div className="flex-1">
                  <p className="font-serif italic text-text-muted text-sm mb-2">
                    {p.poetic}
                  </p>
                  <h3 className="font-display text-text text-2xl sm:text-3xl tracking-tightish">
                    {p.title}
                  </h3>
                </div>
                <span className="text-text-subtle text-xs uppercase tracking-[0.2em] mt-2 shrink-0">
                  {p.status}
                </span>
              </div>
              <p className="text-text-muted text-base leading-relaxed max-w-2xl">
                {p.description}
              </p>

              {p.highlights && p.highlights.length > 0 && (
                <ul className="mt-5 space-y-2 max-w-2xl">
                  {p.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-text-muted text-sm leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-2 shrink-0 w-1 h-1 rounded-full bg-accent/70"
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-6">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-text-subtle text-xs px-3 py-1 border border-border/60 rounded-full"
                  >
                    {t}
                  </span>
                ))}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ml-auto inline-flex items-center gap-2 text-sm text-text hover:text-accent transition-colors"
                  >
                    看看作品
                    <span className="cta-arrow">→</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-20">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            每一个项目，都有一份知识库里的项目卡。
          </p>
        </div>
      </div>
    </section>
  );
}