import { ListingExplorer } from '../components/ListingExplorer'
import { useLanguage } from '../i18n/LanguageContext'

export function Barter() {
  const { t } = useLanguage()
  return (
    <ListingExplorer type="barter" title={t('b_title')} subtitle={t('b_subtitle')} />
  )
}
