export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-16 fade-up">
      <div className="flex items-center gap-3 mb-10 sm:mb-14">
        <span className="block w-8 sm:w-12 h-px bg-accent/50" />
        <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
          个人站 · Personal Site · 2026
        </p>
      </div>

      <h1 className="font-display tracking-tightish text-text text-[clamp(3rem,9vw,7rem)] leading-[1.02]">
        胡睿涵
      </h1>

      <p className="font-serif italic text-text-muted text-xl sm:text-2xl md:text-3xl mt-8 max-w-2xl leading-relaxed">
        一个用
        <span className="not-italic font-display text-accent ai-accent"> AI </span>
        做出东西的小学生，
        <br className="hidden sm:block" />
        让代码在我的脚下一步一步长出来。
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-8 text-text-subtle text-xs uppercase tracking-[0.2em]">
        <span>12 岁 · 即将升入六年级</span>
        <span aria-hidden className="text-accent/40">·</span>
        <span>全国信息素养提升活动 · 国赛入围</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 mt-14 sm:mt-16">
        <a
          href="#about"
          className="group inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-text hover:bg-surface hover:border-accent/40 transition-colors"
        >
          关于我
          <span className="cta-arrow text-accent">→</span>
        </a>
        <a
          href="#works"
          className="group inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors text-sm"
        >
          看作品
          <span className="cta-arrow">→</span>
        </a>
      </div>

      <div className="flex items-center gap-4 mt-24 sm:mt-32">
        <span className="block w-6 h-px bg-text-subtle/40" />
        <p className="font-serif italic text-text-subtle text-sm">
          持续做，持续写。
        </p>
      </div>
    </section>
  );
}