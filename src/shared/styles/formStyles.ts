export const formStyles = {
  page:
    "min-h-[calc(100svh-5rem)] bg-surface px-4 py-10 text-ink sm:px-6",

  card:
    "rounded-2xl border border-line bg-panel p-6 shadow-xl shadow-black/20 sm:p-8",

  title:
    "bg-linear-to-r from-emerald-300 to-teal-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent",

  subtitle: "mt-2 text-sm leading-6 text-muted-ink",

  label: "mb-1.5 block text-sm font-medium text-ink",

  input:
    "block w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-ink/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",

  select:
    "block w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",

  textarea:
    "block w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-ink/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",

  file:
    "block w-full rounded-lg border border-line bg-surface p-2 text-sm text-muted-ink file:mr-4 file:rounded-md file:border-0 file:bg-emerald-900/40 file:px-3 file:py-2 file:font-medium file:text-emerald-200 hover:file:bg-emerald-900/60",

  primaryButton:
    "inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50",

  secondaryButton:
    "inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-emerald-700 hover:bg-emerald-950/30 disabled:opacity-50",

  error: "mt-1 text-sm text-red-400",

  success: "mt-3 text-sm text-emerald-300"
} as const;