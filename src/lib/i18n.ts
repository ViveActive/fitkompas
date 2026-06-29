import type nl from '@/dictionaries/nl.json'

export type Lang = 'nl' | 'en'
export type Dict = typeof nl

const dictionaries = {
  nl: () => import('@/dictionaries/nl.json').then(m => m.default),
  en: () => import('@/dictionaries/en.json').then(m => m.default),
}

export function isValidLang(lang: string): lang is Lang {
  return lang === 'nl' || lang === 'en'
}

export async function getDictionary(lang: Lang): Promise<Dict> {
  return dictionaries[lang]() as Promise<Dict>
}
