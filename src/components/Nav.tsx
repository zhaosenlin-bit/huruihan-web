import Link from "next/link";

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/70 border-b border-border/40">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-text tracking-tightish text-sm sm:text-base">
          胡睿涵 <span className="font-serif italic text-accent">H</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-text-muted">
          <a href="#about" className="hover:text-text transition-colors">关于</a>
          <a href="#skills" className="hover:text-text transition-colors">能力</a>
          <a href="#concepts" className="hover:text-text transition-colors">方法</a>
          <a href="#works" className="hover:text-text transition-colors">作品</a>
          <a href="#showcase" className="hover:text-text transition-colors">掠影</a>
          <a href="#learning" className="hover:text-text transition-colors">学习</a>
          <a href="#path" className="hover:text-text transition-colors">路线</a>
          <a href="#contact" className="hover:text-text transition-colors">联系</a>
        </nav>
      </div>
    </header>
  );
}