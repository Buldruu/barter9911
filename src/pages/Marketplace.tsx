import { ListingExplorer } from '../components/ListingExplorer'
import { useLanguage } from '../i18n/LanguageContext'

export function Marketplace() {
  const { t } = useLanguage()
  return (
    <ListingExplorer type="sale" title={t('m_title')} subtitle={t('m_subtitle')} />
  )
}
