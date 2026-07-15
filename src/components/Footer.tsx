export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/10 bg-black text-white/70 py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
            </svg>
            <span className="font-playfair text-xl text-white">Lithos</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            一个关于太阳系与深空的科普学习站点，灵感与素材均来自 NASA Science 及其合作任务。
          </p>
        </div>

        <div>
          <p className="font-grotesk text-xs uppercase tracking-widest text-white/50 mb-3">
            探索本站
          </p>
          <ul className="space-y-2 text-sm">
            <li><a href="#planets" className="hover:text-white">行星世界</a></li>
            <li><a href="#missions" className="hover:text-white">太空任务</a></li>
            <li><a href="#stories" className="hover:text-white">宇宙故事</a></li>
            <li><a href="#ten-things" className="hover:text-white">十大知识</a></li>
            <li><a href="#resources" className="hover:text-white">工具资源</a></li>
          </ul>
        </div>

        <div>
          <p className="font-grotesk text-xs uppercase tracking-widest text-white/50 mb-3">
            数据来源
          </p>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-white" href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">NASA 科学 - 太阳系</a></li>
            <li><a className="hover:text-white" href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noreferrer">Eyes on the Solar System</a></li>
            <li><a className="hover:text-white" href="https://science.nasa.gov/3d-resources/" target="_blank" rel="noreferrer">3D 模型资源</a></li>
            <li><a className="hover:text-white" href="https://science.nasa.gov/solar-system/stories/" target="_blank" rel="noreferrer">全部故事</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-white/40">
        本站仅作本地学习参考使用，所有文字内容来源于{" "}
        <a className="text-white/60 hover:text-white" href="https://science.nasa.gov/solar-system/" target="_blank" rel="noreferrer">
          science.nasa.gov
        </a>，不作商业用途。
      </div>
    </footer>
  );
}