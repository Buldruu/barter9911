import { ShieldCheck } from 'lucide-react'
import { PageTransition } from '../components/PageTransition'
import { useLanguage } from '../i18n/LanguageContext'

const CONTENT = {
  mn: {
    title: 'Үйлчилгээний нөхцөл (дүрэм)',
    intro:
      'Barter9911.mn-д бүртгүүлэх болон зар байршуулснаар та доорх нөхцөлийг бүрэн хүлээн зөвшөөрсөнд тооцогдоно.',
    rules: [
      'Хууль бус бараа, бүтээгдэхүүн (хар тамхи, мансууруулах бодис, зэвсэг, сум, хулгайн эд зүйл, хуурамч мөнгө/баримт, хүний нэр төрийг гутаах зүйлс гэх мэт)-ийг зарах, солих, дуудлага худалдаанд оруулахыг хатуу хориглоно.',
      'Бусдыг хууран мэхлэх, залилах, төөрөгдүүлэх, спам тараах зорилготой зар байршуулахыг хориглоно.',
      'Хэрэглэгч өөрийн оруулсан зар, зураг, мэдээллийн үнэн зөв, хууль ёсны байдлыг бүрэн хариуцна.',
      'Гишүүд хоорондын бартер, худалдаа, дуудлага худалдааны хэлцэл нь талуудын хооронд шууд хийгдэх бөгөөд Barter9911.mn нь зуучлагч тал биш.',
      'Аливаа зар, гүйлгээ, уулзалт эсвэл зохион байгуулагдаж буй үйл ажиллагаатай холбоотойгоор үүссэн маргаан, хохирол, эрсдэл, асуудалд Barter9911.mn ямар нэгэн хариуцлага хүлээхгүй.',
      'Дүрэм зөрчсөн зар болон хэрэглэгчийн бүртгэлийг урьдчилан мэдэгдэлгүйгээр устгах, түр хаах, хязгаарлах эрхтэй.',
      'Та платформыг зориулалтын дагуу, бусдын эрх ашгийг хүндэтгэн ашиглах үүрэгтэй.',
      'Энэхүү нөхцөл шаардлагатай үед шинэчлэгдэж болох бөгөөд үргэлжлүүлэн ашигласнаар шинэчилсэн нөхцөлийг зөвшөөрсөнд тооцно.',
    ],
    footer: 'Эдгээр нөхцөлийг зөвшөөрөхгүй бол платформыг ашиглахаас татгалзана уу.',
  },
  en: {
    title: 'Terms of Service',
    intro:
      'By registering or posting a listing on Barter9911.mn you fully accept the following terms.',
    rules: [
      'Selling, exchanging or auctioning illegal goods (drugs, weapons, ammunition, stolen property, counterfeit money/documents, anything that degrades human dignity, etc.) is strictly prohibited.',
      'Posting listings intended to deceive, defraud, mislead, or spam others is prohibited.',
      'Each user is fully responsible for the accuracy and legality of their listings, photos and information.',
      'Barter, sale and auction deals happen directly between members; Barter9911.mn is not an intermediary.',
      'Barter9911.mn bears no liability for any dispute, loss, risk or problem arising from any listing, transaction, meeting or organized activity.',
      'We may remove, suspend or restrict any rule-violating listing or account without prior notice.',
      'You must use the platform for its intended purpose and respect the rights of others.',
      'These terms may be updated when necessary; continued use constitutes acceptance of the updated terms.',
    ],
    footer: 'If you do not accept these terms, please do not use the platform.',
  },
}

export function Terms() {
  const { lang } = useLanguage()
  const c = CONTENT[lang]
  return (
    <PageTransition>
      <div className="container-app max-w-3xl py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy">
            {c.title}
          </h1>
        </div>
        <p className="leading-relaxed text-slate-600">{c.intro}</p>
        <ol className="mt-6 space-y-3">
          {c.rules.map((r, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-700">{r}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {c.footer}
        </p>
      </div>
    </PageTransition>
  )
}
