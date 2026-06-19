import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

interface ImageUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
}

export function ImageUploader({ files, onChange, max = 6 }: ImageUploaderProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files]
  )

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url))
  }, [previews])

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith('image/')
    )
    onChange([...files, ...picked].slice(0, max))
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <AnimatePresence initial={false}>
          {previews.map((p, i) => (
            <motion.div
              key={p.url}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <img
                src={p.url}
                alt={`upload-${i}`}
                className="h-full w-full object-cover"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-navy/70 p-1 text-white transition-colors hover:bg-rose-600"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 focus-ring"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px] font-medium">
              {files.length}/{max}
            </span>
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">{t('p_imagesHint')}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  )
}
