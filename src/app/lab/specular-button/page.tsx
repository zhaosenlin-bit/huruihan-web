import SpecularButton from "@/components/SpecularButton";

export const metadata = {
  title: "SpecularButton · Lab",
};

const variants: Array<{
  title: string;
  caption: string;
  props: React.ComponentProps<typeof SpecularButton>;
}> = [
  {
    title: "无文字轮廓",
    caption: "默认 textStroke=0,纯填色",
    props: {
      children: "Get Started",
      textColor: "#f5f5f5",
      lineColor: "#ffffff",
      baseColor: "#525252",
      autoAnimate: true,
    },
  },
  {
    title: "细轮廓 1px",
    caption: "textStroke=1,深色描边",
    props: {
      children: "Get Started",
      textColor: "#f5f5f5",
      textStroke: 1,
      textStrokeColor: "#0a0a0a",
      lineColor: "#ffffff",
      baseColor: "#525252",
      autoAnimate: true,
    },
  },
  {
    title: "中等轮廓 2px",
    caption: "textStroke=2,跟随填充色",
    props: {
      children: "Get Started",
      textColor: "#f5f5f5",
      textStroke: 2,
      textStrokeColor: "#111111",
      lineColor: "#ffffff",
      baseColor: "#525252",
      autoAnimate: true,
    },
  },
  {
    title: "粗轮廓 3px",
    caption: "textStroke=3,黑色加发光阴影",
    props: {
      children: "Get Started",
      textColor: "#ffffff",
      textStroke: 3,
      textStrokeColor: "#000000",
      lineColor: "#ffffff",
      baseColor: "#525252",
      autoAnimate: true,
    },
  },
  {
    title: "彩色轮廓",
    caption: "textStrokeColor=品牌粉",
    props: {
      children: "RSVP",
      size: "md",
      textColor: "#ffe7f1",
      textStroke: 2,
      textStrokeColor: "#ff3d8b",
      tint: "#ff3d8b",
      tintOpacity: 0.08,
      lineColor: "#ff3d8b",
      baseColor: "#3a0a1f",
      autoAnimate: true,
    },
  },
  {
    title: "大号 + 模糊玻璃",
    caption: "size=lg + blur=14 背板模糊",
    props: {
      children: "Save the Date",
      size: "lg",
      textColor: "#ffffff",
      textStroke: 1.5,
      textStrokeColor: "#0a0a0a",
      tint: "#ffffff",
      tintOpacity: 0.1,
      blur: 14,
      lineColor: "#ffffff",
      baseColor: "#1f1f1f",
      autoAnimate: true,
    },
  },
];

export default function SpecularButtonLab() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-text">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Lab</p>
        <h1 className="mt-2 font-serif text-4xl">SpecularButton · 文字轮廓对比</h1>
        <p className="mt-4 max-w-2xl text-sm text-white/60">
          在 React Bits 原组件基础上,新增 <code className="rounded bg-white/10 px-1.5 py-0.5">textStroke</code> 与
          <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5">textStrokeColor</code> 两个属性,通过
          <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5">-webkit-text-stroke</code> 实现文字轮廓。
          值为 <code className="rounded bg-white/10 px-1.5 py-0.5">0</code> 时关闭轮廓,完全等价于原版。
        </p>
      </header>

      <section className="grid gap-8 sm:grid-cols-2">
        {variants.map((v) => (
          <article
            key={v.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          >
            <div className="flex min-h-[120px] items-center justify-center">
              <SpecularButton {...v.props} />
            </div>
            <h2 className="mt-6 font-medium">{v.title}</h2>
            <p className="mt-1 text-xs text-white/50">{v.caption}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h2 className="font-medium">用法</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-white/80"><code>{`import SpecularButton from "@/components/SpecularButton";

<SpecularButton
  textColor="#f5f5f5"
  textStroke={2}              {/* 文字轮廓宽度(px),0 表示关闭 */}
  textStrokeColor="#0a0a0a"   {/* 文字轮廓颜色 */}
  lineColor="#ffffff"
  baseColor="#525252"
>
  Get Started
</SpecularButton>`}</code></pre>
      </section>
    </main>
  );
}
