import Stars from "./Stars";
import SolarSystem from "./SolarSystem";

export default function OrbitSection() {
  return (
    <section className="relative w-full bg-black py-20 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <div className="text-center mb-10">
          <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
            实时轨道
          </p>
          <h2 className="text-4xl md:text-5xl font-playfair">
            一颗恒星，八颗行星
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/70">
            看着我们的宇宙邻居日复一日地真实运动：水星飞驰，海王星漫步。
          </p>
        </div>
        <SolarSystem />
      </div>
    </section>
  );
}