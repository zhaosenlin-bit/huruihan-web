import { profile } from "@/data/content";

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            01 / 关于
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          {profile.poeticLine}
        </h2>

        <div className="grid md:grid-cols-12 gap-10 md:gap-12 mt-16">
          <div className="md:col-span-7 space-y-6 text-text-muted text-base sm:text-lg leading-relaxed">
            {profile.bio.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="font-serif italic text-text-subtle text-sm pt-4">
              &ldquo;{profile.quote}&rdquo;
            </p>
          </div>
          <aside className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-5">
              <div
                className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-accent/30 bg-surface/60 flex items-center justify-center group hover:border-accent transition-colors"
                aria-label={`${profile.name} 头像占位`}
              >
                <span className="font-serif italic text-accent text-4xl sm:text-5xl leading-none">
                  {profile.shortName}
                </span>
              </div>
              <div>
                <p className="font-display text-text text-lg tracking-tightish">
                  {profile.name}
                </p>
                <p className="text-text-subtle text-xs uppercase tracking-[0.2em] mt-1">
                  {profile.age}
                </p>
              </div>
            </div>

            <div className="border border-border rounded-2xl p-6 bg-surface/40">
              <p className="text-text-subtle text-xs uppercase tracking-[0.2em] mb-4">
                战绩
              </p>
              <p className="font-display text-text text-base leading-snug">
                {profile.badge}
              </p>
              <div className="mt-5 pt-5 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-accent text-xl">5+</p>
                  <p className="text-text-subtle text-[11px] uppercase tracking-[0.15em] mt-1">
                    项目
                  </p>
                </div>
                <div>
                  <p className="font-display text-accent text-xl">15+</p>
                  <p className="text-text-subtle text-[11px] uppercase tracking-[0.15em] mt-1">
                    Prompt
                  </p>
                </div>
                <div>
                  <p className="font-display text-accent text-xl">3</p>
                  <p className="text-text-subtle text-[11px] uppercase tracking-[0.15em] mt-1">
                    比赛
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border/60 rounded-2xl p-6 bg-bg/40">
              <p className="text-text-subtle text-xs uppercase tracking-[0.2em] mb-3">
                一句话定位
              </p>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed">
                {profile.shortIntro}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}