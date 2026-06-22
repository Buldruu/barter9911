import { Link } from 'react-router-dom'
import { Gavel, Heart, Repeat, ShieldCheck, Store, Target } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { ScrollReveal } from '../components/ScrollReveal'
import { buttonStyles } from '../components/ui/Button'
import { useLanguage } from '../i18n/LanguageContext'
import { ContactSection } from '../components/ContactSection'

export function About() {
  const { t } = useLanguage()

  const pillars = [
    { icon: Repeat, title: t('nav_barter'), desc: t('p_typeBarterD') },
    { icon: Gavel, title: t('nav_auction'), desc: t('p_typeAuctionD') },
    { icon: Store, title: t('nav_marketplace'), desc: t('p_typeSaleD') },
  ]

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 to-white">
        <div className="absolute inset-0 -z-10 bg-hero-grid [background-size:22px_22px] opacity-50" />
        <div className="container-app py-16 text-center lg:py-24">
          <ScrollReveal>
            <h1 className="text-4xl font-black tracking-tight text-navy sm:text-5xl">
              {t('ab_title')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              {t('ab_body')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="container-app py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <div className="rounded-3xl bg-navy p-10 text-white">
              <Target className="h-9 w-9 text-primary-400" />
              <h2 className="mt-4 text-2xl font-extrabold">{t('ab_missionTitle')}</h2>
              <p className="mt-3 leading-relaxed text-slate-300">{t('ab_mission')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="grid gap-4">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-navy">{p.title}</h3>
                    <p className="text-sm text-slate-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50/70 py-16">
        <div className="container-app grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: t('h_trust1'), desc: t('h_trust1d') },
            { icon: Heart, title: t('h_trust2'), desc: t('h_trust2d') },
            { icon: Gavel, title: t('h_trust3'), desc: t('h_trust3d') },
          ].map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact (merged from the old Contact page) */}
      <ContactSection />

      {/* CTA */}
      <section className="container-app py-16 text-center">
        <ScrollReveal>
          <h2 className="text-2xl font-extrabold text-navy">{t('h_ctaTitle')}</h2>
          <p className="mt-2 text-slate-500">{t('h_ctaSubtitle')}</p>
          <Link to="/post" className={buttonStyles('primary', 'lg', 'mt-6')}>
            {t('h_ctaButton')}
          </Link>
        </ScrollReveal>
      </section>
    </PageTransition>
  )
}
