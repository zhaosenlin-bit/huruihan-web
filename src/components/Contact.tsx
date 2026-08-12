import { contact } from "@/data/content";

export default function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-2 h-2 rounded-full bg-accent/60" />
          <p className="text-text-subtle text-[11px] sm:text-xs uppercase tracking-[0.3em]">
            08 / 联系
          </p>
        </div>

        <h2 className="font-display tracking-tightish text-text text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] max-w-3xl">
          {contact.poetic}
        </h2>

        <div className="mt-12 max-w-2xl space-y-6">
          <p className="text-text-muted text-base sm:text-lg leading-relaxed">
            {contact.intro}
          </p>
          <ul className="space-y-4">
            {contact.methods.map((m, i) => {
              const url = /(https?:\/\/[^\s]+)/.exec(m)?.[1];
              const label = url ? m.replace(url, "").trim().replace(/[:。]$/, "") : m;
              return (
                <li
                  key={i}
                  className="text-text-muted text-base leading-relaxed flex gap-3 group"
                >
                  <span className="font-serif italic text-accent/70 group-hover:text-accent shrink-0 transition-colors">
                    ·
                  </span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-text-subtle/40 hover:decoration-accent hover:text-text underline-offset-4 transition-colors break-all"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{m}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-4 mt-16">
          <span className="block w-6 h-px bg-text-subtle/40" />
          <p className="font-serif italic text-text-subtle text-sm">
            想合作 / 想聊 / 想提建议：找我的老师森林，或直接给我看你的作品。
          </p>
        </div>
      </div>
    </section>
  );
}