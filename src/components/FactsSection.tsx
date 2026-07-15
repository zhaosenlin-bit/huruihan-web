import { solarFacts } from "../data/resources";
import Stars from "./Stars";

export default function FactsSection() {
  return (
    <section id="facts" className="relative w-full bg-gradient-to-b from-black via-[#06070d] to-black text-white py-24 px-6 overflow-hidden">
      <Stars />
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-14">
          <p className="font-grotesk tracking-[0.4em] uppercase text-xs text-orange-300/80 mb-3">
            趣味冷知识
          </p>
          <h2 className="text-4xl md:text-5xl font-playfair">
            你可能不知道的太阳系
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solarFacts.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition"
            >
              <span className="font-playfair text-4xl text-orange-300/80">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <p className="mt-3 text-white/80 leading-relaxed text-sm">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}