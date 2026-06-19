import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/utils'

const fieldBase =
  'w-full rounded-xl border bg-white text-navy placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-400'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, className, id, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-navy"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            fieldBase,
            'h-11 px-3.5 text-sm',
            leftIcon ? 'pl-10' : undefined,
            error ? 'border-rose-300 focus:ring-rose-400/60' : 'border-slate-200',
            className
          )}
          aria-invalid={!!error}
          {...rest}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, rows = 4, ...rest }, ref) {
    const autoId = useId()
    const inputId = id ?? autoId
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-navy"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            fieldBase,
            'px-3.5 py-2.5 text-sm resize-y',
            error ? 'border-rose-300 focus:ring-rose-400/60' : 'border-slate-200',
            className
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    )
  }
)
