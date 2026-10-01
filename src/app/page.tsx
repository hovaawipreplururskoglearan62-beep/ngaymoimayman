export default function Home() {
  const services = [
    {
      title: "Market Research",
      desc: "Gain a comprehensive understanding of your industry landscape.",
      icon: "≡",
    },
    {
      title: "User Experience",
      desc: "Evaluate the viability and potential of new products or services.",
      icon: "◔",
    },
    {
      title: "Digital Marketing",
      desc: "Benchmark your performance against competitors, identify strengths.",
      icon: "▥",
    },
    {
      title: "SEO Services",
      desc: "Anticipate market shifts and emerging trends to stay ahead of the curve.",
      icon: "◫",
    },
    {
      title: "Brand Protection",
      desc: "Protect your online presence and improve trust with your customers.",
      icon: "◍",
    },
    {
      title: "Software Development",
      desc: "We go beyond data collection to provide actionable insights.",
      icon: "✈",
    },
    {
      title: "Affiliate Marketing",
      desc: "We understand that every business is unique. That is why we offer.",
      icon: "◈",
    },
    {
      title: "Website Development",
      desc: "In todays competitive market, timing is everything. Our efficient.",
      icon: "⤢",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f6fb] text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
          <div className="text-5xl font-bold text-[#5b7cf4] tracking-tight">somor</div>
          <nav className="hidden items-center gap-10 text-[28px] font-medium text-slate-700 md:flex">
            <a className="text-[#5b7cf4]" href="#">Home</a>
            <a href="#">Service</a>
            <a href="#">Features</a>
            <a href="#">About</a>
            <a href="#">Pricing</a>
            <a href="#">Portfolio</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </nav>
          <button className="rounded-xl bg-[#5b7cf4] px-7 py-3 text-lg font-semibold text-white">Download</button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-center text-6xl font-extrabold leading-tight md:text-7xl">marketing strategy</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-2xl text-slate-500">
          Ligula risus auctor tempus magna feugiat lacinia.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {services.map((item) => (
            <article key={item.title} className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#89a4ff] text-4xl text-white shadow-sm">
                {item.icon}
              </div>
              <h3 className="mt-6 text-4xl font-bold">{item.title}</h3>
              <p className="mt-4 text-2xl leading-relaxed text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
