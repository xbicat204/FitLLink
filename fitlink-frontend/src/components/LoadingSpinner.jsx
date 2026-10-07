export default function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_32%),linear-gradient(180deg,#fbf6ef_0%,#f3ebdf_100%)]">
      <div className="brand-shell flex min-w-[220px] flex-col items-center rounded-[28px] px-8 py-7">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-orange-500/80 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-700">Loading FitLink</p>
      </div>
    </div>
  );
}
