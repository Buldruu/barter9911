import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface FadeImageProps {
  src: string
  alt: string
  className?: string
}

// Image with a smooth fade-in once it has loaded.
export function FadeImage({ src, alt, className }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.02 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
