import { Loader2 } from 'lucide-react'

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin text-primary-600`} />
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  )
}
