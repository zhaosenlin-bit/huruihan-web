import { Menu } from "lucide-react";
import Galaxy from "./components/Galaxy";
import { EXPLORE_3D_PATH, GAME_PATH } from "./route";

const NAV_LINKS = [
  { href: "#planets", label: "太阳系巡礼" },
  { href: "#missions", label: "太空任务" },
  { href: "#stories", label: "宇宙故事" },
  { href: "#ten-things", label: "十大知识" },
  { href: "#resources", label: "工具资源" },
  { href: "#facts", label: "趣味冷知识" },
];

function navClass(active: boolean): string {
  return (
    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors " +
    (active ? "text-white" : "text-white/80 hover:bg-white/20 hover:text-white")
  );
}

type HeroProps = {
  onOpenExplore3D?: () => void;
  onOpenGame?: () => void;
};

export default function Hero({ onOpenExplore3D, onOpenGame }: HeroProps) {
  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <a href="#top" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
          </svg>
          <span className="font-playfair text-2xl tracking-[0.08em] text-white">Lithos</span>
        </a>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-md md:flex">
          {NAV_LINKS.map((link, index) => (
            <a key={link.href} href={link.href} className={navClass(index === 0)}>
              {link.label}
            </a>
          ))}
        </div>

        <button className="text-white md:hidden" aria-label="打开菜单" type="button">
          <Menu size={26} />
        </button>
      </nav>

      <section
        id="top"
        className="relative h-screen w-full overflow-hidden bg-black"
        style={{ height: "100dvh" }}
      >
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,#02040c_0%,#050915_52%,#070d18_100%)]" />
        <div className="absolute inset-0 z-20">
          <Galaxy
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1.35}
            glowIntensity={0.42}
            saturation={0.85}
            hueShift={218}
            twinkleIntensity={0.42}
            rotationSpeed={0.18}
            repulsionStrength={2.6}
            starSpeed={0.65}
            speed={1.05}
            focal={[0.5, 0.38]}
            rotation={[1, 0.12]}
            transparent={true}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-30 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:120px_120px]" />
        <div className="pointer-events-none absolute left-1/2 top-[18%] z-30 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(110,182,255,0.22),rgba(110,182,255,0.08)_34%,transparent_68%)] blur-3xl orbit-drift" />
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-black/25 via-transparent to-black/70" />

        <div className="pointer-events-none absolute left-0 right-0 top-[12%] z-50 flex flex-col items-center px-5 text-center">
          <h1 className="font-normal text-white">
            <span
              className="hero-display hero-subdisplay hero-anim hero-reveal block text-5xl sm:text-7xl md:text-[5.8rem] lg:text-[7rem]"
              style={{ animationDelay: "0.25s" }}
            >
              Beyond the veil
            </span>
            <span
              className="hero-chinese hero-anim hero-reveal mt-3 block text-[2.15rem] sm:text-5xl md:text-6xl lg:text-[4.6rem]"
              style={{ animationDelay: "0.42s" }}
            >
              穿越星海，触及遥远的世界
            </span>
          </h1>
        </div>

        <div
          className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[300px] sm:block md:left-14"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-sm leading-relaxed text-white/80">
            望向银河的一角：水星、金星、地球与火星，是离我们最近的几个世界。
            它们各自讲述着关于诞生、风暴、海洋与时间的故事。
          </p>
        </div>

        <div
          className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[320px] sm:gap-5 md:right-14"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
            这里整合了 NASA 任务影像、3D 模型与公开数据，既能浏览太阳系内容，
            也能继续进入沉浸式探索与互动页面。
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#planets"
              className="inline-block rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 active:scale-95"
            >
              开启星际之旅
            </a>
            <a
              href={EXPLORE_3D_PATH}
              onClick={(e) => {
                if (!onOpenExplore3D) return;
                e.preventDefault();
                onOpenExplore3D();
              }}
              className="inline-block rounded-full border border-white/25 bg-white/8 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/14"
            >
              进入 3D 探索页
            </a>
          </div>

          <a
            href={GAME_PATH}
            onClick={(e) => {
              if (!onOpenGame) return;
              e.preventDefault();
              onOpenGame();
            }}
            className="group w-full rounded-[1.4rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(10,18,42,0.9),rgba(7,28,54,0.72))] px-4 py-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:border-cyan-200/40 hover:bg-[linear-gradient(135deg,rgba(16,29,60,0.96),rgba(10,38,76,0.78))] sm:max-w-[18rem]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.26em] text-cyan-200/75">GAME ENTRY</p>
                <p className="mt-2 text-base font-medium">进入游戏页面</p>
                <p className="mt-1 text-sm leading-6 text-white/64">
                  打开独立游戏分支，继续体验飞行、收集和互动探索流程。
                </p>
              </div>
              <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-cyan-100 transition group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </a>
        </div>
      </section>
    </>
  );
}
