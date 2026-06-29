import { notFound } from 'next/navigation'
import { isValidLang } from '@/lib/i18n'

export function generateStaticParams() {
  return [{ lang: 'nl' }, { lang: 'en' }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLang(lang)) notFound()

  return <>{children}</>
}
