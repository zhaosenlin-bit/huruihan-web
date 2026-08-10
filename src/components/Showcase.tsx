import { showcase } from "@/data/content";
import DepthCarousel from "./DepthCarousel";

export default function Showcase() {
  return (
    <section id="showcase" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            05 / 沿途留下的脚印
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          沿途留下的脚印。
        </h2>

        <p className="text-text-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
          奖状、作品里的某一瞬间、项目跑到一半的影子。
          <br />
          截图比说明更诚实。
        </p>

        <div className="space-y-20 mt-20">
          {showcase.map((group) => (
            <div key={group.label}>
              <div className="flex items-baseline gap-4 mb-6">
                <p className="font-serif italic text-accent text-lg sm:text-xl">
                  {group.poetic}
                </p>
                <span className="flex-1 h-px bg-border/60" />
                <p className="text-text-subtle text-xs uppercase tracking-[0.25em] shrink-0">
                  {group.label}
                </p>
              </div>

              {group.galleryType === "carousel" ? (
                <div className="border border-border rounded-2xl overflow-hidden bg-surface/40 p-6 sm:p-10">
                  <div
                    className="relative w-full"
                    style={{ height: "min(520px, 70vh)" }}
                  >
                    <DepthCarousel
                      items={group.items.map((item) => ({
                        image: item.src,
                        alt: item.title,
                      }))}
                      cardWidth={300}
                      cardHeight={380}
                      radius={18}
                      tint="#0A0A0A"
                      depth={220}
                      spread={90}
                      tilt={22}
                      tiltDirection="right"
                      perspective={1400}
                      visibleCards={4}
                      falloff={0.2}
                      blur={6}
                      autoplay
                      loop
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {group.items.map((item) => (
                      <div key={item.src} className="text-center sm:text-left">
                        <p className="font-display text-text text-base tracking-tightish">
                          {item.title}
                        </p>
                        <p className="font-serif italic text-text-subtle text-xs sm:text-sm mt-1">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                  {group.items.map((item) => (
                    <figure
                      key={item.src}
                      className="group relative border border-border rounded-2xl overflow-hidden bg-surface/40 card-lift hover:border-accent/40"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      />

                      <div className="relative aspect-[4/3] overflow-hidden bg-bg">
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.04]"
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity"
                        />
                        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                          <p className="font-display text-text text-base sm:text-lg tracking-tightish">
                            {item.title}
                          </p>
                          <p className="font-serif italic text-text-subtle text-xs sm:text-sm mt-1">
                            {item.desc}
                          </p>
                        </figcaption>
                      </div>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-20">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            继续往前走，下一站见。
          </p>
        </div>
      </div>
    </section>
  );
}
