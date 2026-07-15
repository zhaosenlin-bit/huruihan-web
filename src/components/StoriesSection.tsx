import { stories } from "../data/stories";
import Stars from "./Stars";

export default function StoriesSection() {
  const [first, ...rest] = stories;
  return (
    <section id="stories" className="relative w-full bg-black text-white py-24 px-6 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="mb-12">
          <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
            宇宙故事
          </p>
          <h2 className="text-4xl md:text-5xl font-playfair">
            不只是新闻，是远方
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            来自 NASA Science 的长篇报道、摄影集与任务进展。
          </p>
        </div>

        <a
          href={first.href}
          target="_blank"
          rel="noreferrer"
          className="group block relative overflow-hidden rounded-3xl border border-white/10 mb-10"
        >
          <div className="relative h-72 md:h-[26rem] overflow-hidden">
            <img
              src={first.image}
              alt={first.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <span className="text-xs uppercase tracking-widest text-orange-300/90">
                {first.topic}
              </span>
              <h3 className="mt-2 font-playfair text-3xl md:text-5xl leading-tight max-w-3xl">
                {first.title}
              </h3>
              <p className="mt-3 max-w-2xl text-white/80">{first.blurb}</p>
            </div>
          </div>
        </a>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/30 transition overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-orange-300/80">
                  {s.topic}
                </span>
                <h3 className="mt-1 font-playfair text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-white/70">{s.blurb}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}