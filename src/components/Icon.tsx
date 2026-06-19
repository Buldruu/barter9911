import {
  Smartphone,
  Car,
  Sofa,
  Shirt,
  Building2,
  Dumbbell,
  Baby,
  BookOpen,
  Sparkles,
  Wrench,
  PawPrint,
  Handshake,
  Tag,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Car,
  Sofa,
  Shirt,
  Building2,
  Dumbbell,
  Baby,
  BookOpen,
  Sparkles,
  Wrench,
  PawPrint,
  Handshake,
  Tag,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Cmp = ICONS[name] ?? Tag
  return <Cmp className={className} />
}
