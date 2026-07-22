export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Загрузка страницы"
      className="mx-auto min-h-[70vh] w-full max-w-[1640px] px-5 py-10 sm:px-8"
    >
      <span className="sr-only">Загружаем страницу…</span>
      <div className="h-3 w-24 animate-pulse rounded-full bg-accent/45 motion-reduce:animate-none" />
      <div className="mt-5 h-10 w-full max-w-lg animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none" />
      <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-48 animate-pulse rounded-[26px] border bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
    </main>
  );
}
