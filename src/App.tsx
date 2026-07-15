import { Component, Suspense, lazy, type ReactNode, useEffect, useState } from "react";
import Hero from "./Hero";
import OrbitSection from "./components/OrbitSection";
import PlanetShowcase from "./components/PlanetShowcase";
import FactsSection from "./components/FactsSection";
import TenThingsSection from "./components/TenThingsSection";
import MissionsSection from "./components/MissionsSection";
import StoriesSection from "./components/StoriesSection";
import ResourcesSection from "./components/ResourcesSection";
import Footer from "./components/Footer";
import TtsButton from "./components/TtsButton";
import "./components/TtsButton.css";
import { EXPLORE_3D_PATH, GAME_PATH, normalizePath } from "./route";

const Explore3DPage = lazy(() => import("./Explore3DPage"));
const GamePage = lazy(() => import("./GamePage"));

type RouteBoundaryProps = {
  children: ReactNode;
  onBackHome: () => void;
};

class RouteBoundary extends Component<RouteBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[RouteBoundary] render failure:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#02040c] text-white">
          <div className="max-w-md rounded-2xl border border-white/15 bg-slate-950/70 px-6 py-7 text-center backdrop-blur-xl">
            <p className="text-[11px] tracking-[0.36em] text-cyan-200/80">SUN-SYSTEM BAY</p>
            <h1 className="mt-3 text-2xl font-semibold">3D 场景启动失败</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/72">
              当前浏览器对 WebGL 或 3D 资源请求不稳定，已切换到安全占位界面。
              可以先返回主页，或刷新页面再试。
            </p>
            <button
              onClick={this.props.onBackHome}
              type="button"
              className="mt-5 rounded-full border border-cyan-300/40 bg-cyan-400/20 px-6 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/30"
            >
              返回主页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const routeLoadingFallback = (
  <div className="fixed inset-0 flex items-center justify-center bg-[#02040c] text-white">
    <div className="rounded-2xl border border-white/15 bg-slate-950/70 px-6 py-5 text-center backdrop-blur-xl">
      <p className="text-[11px] tracking-[0.32em] text-cyan-200/80">LOADING</p>
      <p className="mt-2 text-sm text-white/78">正在加载场景资源，请稍候…</p>
    </div>
  </div>
);

export default function App() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextPath: string) => {
    if (normalizePath(window.location.pathname) === normalizePath(nextPath)) return;
    window.history.pushState({}, "", nextPath);
    setPathname(normalizePath(nextPath));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname === GAME_PATH) {
    return (
      <RouteBoundary onBackHome={() => navigate("/")}>
        <Suspense fallback={routeLoadingFallback}>
          <GamePage onBackHome={() => navigate("/")} />
        </Suspense>
      </RouteBoundary>
    );
  }

  if (pathname === EXPLORE_3D_PATH) {
    return (
      <RouteBoundary onBackHome={() => navigate("/")}>
        <Suspense fallback={routeLoadingFallback}>
          <Explore3DPage onBackHome={() => navigate("/")} />
        </Suspense>
      </RouteBoundary>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white tracking-[-0.02em]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <Hero
        onOpenExplore3D={() => navigate(EXPLORE_3D_PATH)}
        onOpenGame={() => navigate(GAME_PATH)}
      />
      <div id="planets">
        <PlanetShowcase />
      </div>
      <OrbitSection />
      <FactsSection />
      <TenThingsSection />
      <MissionsSection />
      <StoriesSection />
      <ResourcesSection />
      <Footer />
      <TtsButton />
    </div>
  );
}
