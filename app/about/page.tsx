const steps = [
  {
    no: "01",
    title: "録音",
    description: "マイクボタンを押して、最大120秒の音声を録音。思考をそのまま声に。",
    icon: "◉",
  },
  {
    no: "02",
    title: "文字起こし",
    description: "AIが音声をリアルタイムでテキストに変換。高精度な日本語認識。",
    icon: "▣",
  },
  {
    no: "03",
    title: "超圧縮要約",
    description: "要点を落とさず極限まで圧縮。数値・日付・固有名詞も自動抽出。",
    icon: "✣",
  },
  {
    no: "04",
    title: "星座化",
    description: "カテゴリ自動分類。メモが星に、カテゴリが星座に。宇宙に知識が広がる。",
    icon: "✦",
  },
];

const policies = [
  {
    title: "プライバシー",
    text: "音声データは文字起こし後に破棄。テキストデータはデバイス上に暗号化して保存します。",
    icon: "◌",
  },
  {
    title: "データ保存",
    text: "すべてのメモはローカルに保存。エクスポート機能で任意のタイミングでバックアップ可能です。",
    icon: "⌁",
  },
  {
    title: "120秒制限",
    text: "1回の録音は最大120秒。短く区切ることで要約精度と整理速度を両立します。",
    icon: "◍",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1 bg-black">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-[240px] pb-20 pt-[120px] max-[1200px]:px-16 max-[800px]:px-6">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.32em] text-[#8ab4f84d]">ABOUT</p>
          <h1 className="text-[48px] font-bold tracking-tight text-white">Nebula Notes</h1>
          <p className="text-[18px] text-[var(--text-muted)]">声を、星に変える。</p>
          <p className="max-w-[560px] text-[14px] leading-relaxed text-[var(--text-dim)]">
            話すだけで思考が整理され、美しい星座として蓄積される。
            <br />
            Nebula Notesは、音声から知識を紡ぎ出す静かなツールです。
          </p>
        </section>

        <div className="h-px bg-[var(--line-soft)]" />

        <section className="space-y-10">
          <p className="text-[11px] font-medium tracking-[0.28em] text-[var(--text-muted)]">仕 組 み</p>
          <div className="grid grid-cols-4 gap-6 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
            {steps.map((step) => (
              <article key={step.no} className="rounded-[12px] border border-[var(--line-soft)] bg-white/[0.02] p-6">
                <p className="text-[32px] font-bold text-[#8ab4f833]">{step.no}</p>
                <p className="mt-4 text-[16px] font-bold text-white">{step.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="h-px bg-[var(--line-soft)]" />

        <section className="space-y-10">
          <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--text-muted)]">プライバシーと制限</p>
          <div className="grid grid-cols-3 gap-8 max-[980px]:grid-cols-1">
            {policies.map((policy) => (
              <article key={policy.title} className="space-y-3">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-white">
                  <span className="text-[13px] text-[var(--text-accent)]">{policy.icon}</span>
                  {policy.title}
                </h2>
                <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">{policy.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="h-px bg-[var(--line-soft)]" />

        <footer className="py-6 text-center">
          <p className="text-[14px] font-bold text-white/10">Nebula Notes</p>
          <p className="mt-1 text-[12px] text-white/[0.08]">声を、星に。思考を、星座に。</p>
        </footer>
      </div>
    </main>
  );
}
