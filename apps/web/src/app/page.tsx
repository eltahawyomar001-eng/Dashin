export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-gradient mb-4 text-6xl font-bold tracking-tight">
          Dashin Research
        </h1>
        <p className="text-balance mx-auto max-w-2xl text-xl text-slate-300">
          B2B SaaS platform for lead research and qualification
        </p>
        <div className="glass mt-8 rounded-2xl p-8">
          <p className="text-sm text-slate-400">
            Repository initialized. Authentication will be configured in the next segment.
          </p>
        </div>
      </div>
    </main>
  );
}
