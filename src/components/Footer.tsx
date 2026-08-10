export default function Footer() {
  return (
    <footer className="relative pt-16 pb-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-5xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-serif italic text-text-subtle text-sm">
          持续做，持续写。
        </p>
        <p className="text-text-subtle text-xs">
          © 2026 胡睿涵 · 一个用 AI 做出东西的小学生
        </p>
      </div>
    </footer>
  );
}