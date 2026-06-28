export type Question = {
  id: number
  nl: string
  en: string
  axis: 'x' | 'y'
  direction: 'positive' | 'negative'
  dimension: 1 | 2 | 3 | 4 | 5
}

export const QUESTIONS: Question[] = [
  { id: 1,  nl: 'Ik weet goed wat gezond en wat ongezond is', en: 'I know well what is healthy and what is unhealthy', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 2,  nl: 'Ik sport met grote regelmaat', en: 'I exercise on a regular basis', axis: 'x', direction: 'positive', dimension: 1 },
  { id: 3,  nl: 'Het heeft weinig nut om op je gezondheid te letten', en: 'There is little point in paying attention to your health', axis: 'y', direction: 'negative', dimension: 2 },
  { id: 4,  nl: 'Ik ben goed genoeg in sport om zo te kunnen beginnen', en: 'I am good enough at sports to start right away', axis: 'y', direction: 'positive', dimension: 4 },
  { id: 5,  nl: 'Ik eet bijna altijd gezond', en: 'I almost always eat healthily', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 6,  nl: 'In mijn familie wordt veel aan sport gedaan', en: 'In my family, a lot of sports are done', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 7,  nl: 'Ik ben niet van plan om te gaan sporten', en: 'I do not plan to start exercising', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 8,  nl: 'Het kost me te veel moeite om op mijn gewicht te letten', en: 'It takes too much effort to watch my weight', axis: 'x', direction: 'negative', dimension: 5 },
  { id: 9,  nl: 'Sporten is voor mij geen interessante bezigheid', en: 'Exercising is not an interesting activity for me', axis: 'y', direction: 'negative', dimension: 2 },
  { id: 10, nl: 'Als ik mezelf heb voorgenomen om te gaan sporten, dan doe ik dat ook', en: 'When I set my mind to exercising, I follow through', axis: 'y', direction: 'positive', dimension: 4 },
  { id: 11, nl: 'Mijn vrienden vinden het niet nodig om te sporten', en: 'My friends do not think it is necessary to exercise', axis: 'y', direction: 'negative', dimension: 3 },
  { id: 12, nl: 'Ik ben slecht in sport', en: 'I am bad at sports', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 13, nl: 'Ik val steeds weer terug in een luie manier van leven', en: 'I keep falling back into a lazy lifestyle', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 14, nl: 'Volgens mij vinden de meeste mensen dat je moet sporten', en: 'I think most people believe you should exercise', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 15, nl: 'In mijn vrije tijd ben ik graag lichamelijk actief bezig', en: 'In my free time, I enjoy being physically active', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 16, nl: 'Ik vind het moeilijk om gezond te blijven leven', en: 'I find it hard to keep living healthily', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 17, nl: 'De meeste mensen bewegen te weinig', en: 'Most people do not exercise enough', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 18, nl: 'Ik hou het niet vol om te blijven sporten', en: 'I cannot keep up with exercising consistently', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 19, nl: 'Ik let er niet op of ik wel genoeg beweeg', en: 'I do not pay attention to whether I exercise enough', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 20, nl: 'Sport is niks voor mij, het hoort niet bij mij', en: 'Sports are not for me, it does not suit me', axis: 'y', direction: 'negative', dimension: 2 },
  { id: 21, nl: 'Ik vind het leuk om gezonde maaltijden klaar te maken', en: 'I enjoy preparing healthy meals', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 22, nl: 'Als mensen in mijn omgeving ongezond leven, dan ga ik daar in mee', en: 'If people around me live unhealthily, I tend to follow along', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 23, nl: 'Ik heb te veel stress in mijn leven', en: 'I have too much stress in my life', axis: 'x', direction: 'negative', dimension: 5 },
  { id: 24, nl: 'Mijn vrienden stimuleren me om te gaan sporten', en: 'My friends encourage me to exercise', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 25, nl: 'Ik wil regelmatig sporten', en: 'I want to exercise regularly', axis: 'x', direction: 'positive', dimension: 1 },
  { id: 26, nl: 'Ik doe altijd erg mijn best als ik sport', en: 'I always try my best when I exercise', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 27, nl: 'Mijn familie reageert negatief als ik te veel passief voor de televisie zit', en: 'My family reacts negatively when I sit passively in front of the TV too much', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 28, nl: 'Ik hou het vol om niet te roken', en: 'I manage to keep not smoking', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 29, nl: 'Mijn familie stimuleert me om gezond te eten, niet te roken en niet te veel alcohol te drinken', en: 'My family encourages me to eat healthily, not smoke and not drink too much alcohol', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 30, nl: 'Ik heb te weinig tijd om te kunnen sporten', en: 'I do not have enough time to exercise', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 31, nl: 'In vergelijking met anderen ben ik best goed in sport', en: 'Compared to others, I am quite good at sports', axis: 'y', direction: 'positive', dimension: 4 },
  { id: 32, nl: 'Ik leid een actief leven', en: 'I lead an active life', axis: 'x', direction: 'positive', dimension: 1 },
  { id: 33, nl: 'Sporten is voor mij een goede manier om mensen te ontmoeten', en: 'Sports are a good way for me to meet people', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 34, nl: 'Ik doe altijd al aan sport', en: 'I have always played sports', axis: 'x', direction: 'positive', dimension: 1 },
  { id: 35, nl: 'Mijn familieleden vinden het echt belangrijk om gezond te leven', en: 'My family members think it is really important to live healthily', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 36, nl: 'Ik zorg er voor dat ik gezond leef', en: 'I make sure I live healthily', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 37, nl: 'Veel bewegen hoeft voor mij niet zo nodig', en: 'I do not feel the need to exercise much', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 38, nl: 'In de sport leer ik dingen die ook op andere momenten in mijn leven nuttig zijn', en: 'Through sports I learn things that are also useful in other areas of my life', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 39, nl: 'In mijn familie wordt er op gelet dat je gezond eet, niet rookt en niet te veel alcohol drinkt', en: 'In my family, attention is paid to eating healthily, not smoking and not drinking too much alcohol', axis: 'y', direction: 'positive', dimension: 3 },
  { id: 40, nl: 'Ik besteed weinig tijd aan sporten', en: 'I spend little time on sports', axis: 'y', direction: 'negative', dimension: 2 },
  { id: 41, nl: 'Ik vraag me af of sporten en bewegen wel noodzakelijk zijn om gezond te leven', en: 'I wonder whether sports and exercise are really necessary to live healthily', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 42, nl: 'Ik sport graag, want ik heb er veel plezier in', en: 'I enjoy sports because I get a lot of pleasure from it', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 43, nl: 'Het kost me weinig moeite om gezond te leven', en: 'It takes little effort for me to live healthily', axis: 'y', direction: 'positive', dimension: 4 },
  { id: 44, nl: 'Ik heb me voorgenomen om gezonder te gaan leven', en: 'I have decided to start living more healthily', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 45, nl: 'Ik ben niet van plan om te gaan sporten', en: 'I do not plan to start exercising', axis: 'x', direction: 'negative', dimension: 1 },
  { id: 46, nl: 'Als het slecht weer is, ga ik echt niet sporten', en: 'When the weather is bad, I really will not exercise', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 47, nl: 'Ik val steeds terug in ongezonde eetgewoonten', en: 'I keep falling back into unhealthy eating habits', axis: 'x', direction: 'negative', dimension: 5 },
  { id: 48, nl: 'Veel van mijn vrienden reageren negatief als ik zeg dat ik wil gaan sporten', en: 'Many of my friends react negatively when I say I want to exercise', axis: 'y', direction: 'negative', dimension: 3 },
  { id: 49, nl: 'Ik let erop dat ik niet teveel alcohol drink', en: 'I make sure I do not drink too much alcohol', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 50, nl: 'Mijn familie zegt er nooit iets van als ik thuis lui rondhang', en: 'My family never says anything when I lounge around at home lazily', axis: 'y', direction: 'negative', dimension: 3 },
  { id: 51, nl: 'Ik weet eigenlijk niet goed hoe ik gezond zou moeten leven', en: 'I actually do not know well how to live healthily', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 52, nl: 'In mijn vrije tijd sport ik veel', en: 'In my free time, I exercise a lot', axis: 'x', direction: 'positive', dimension: 1 },
  { id: 53, nl: 'Ik doe veel moeite om gezond te leven', en: 'I put a lot of effort into living healthily', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 54, nl: 'Het is mij goed gelukt om gezond te leven', en: 'I have succeeded well in living healthily', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 55, nl: 'Ik doe echt moeite om voldoende te bewegen', en: 'I really make an effort to exercise enough', axis: 'y', direction: 'positive', dimension: 2 },
  { id: 56, nl: 'Ik let er niet zo op of ik gezond leef', en: 'I do not really pay attention to whether I live healthily', axis: 'x', direction: 'negative', dimension: 5 },
  { id: 57, nl: 'Ook als mensen in mijn omgeving niet sporten, blijf ik dat wel doen', en: 'Even if people around me do not exercise, I still keep doing it', axis: 'y', direction: 'positive', dimension: 4 },
  { id: 58, nl: 'Ik wil er echt op letten dat mijn gezondheid niet verslechtert', en: 'I really want to make sure my health does not deteriorate', axis: 'x', direction: 'positive', dimension: 5 },
  { id: 59, nl: 'Het is te duur om echt gezond te leven', en: 'It is too expensive to live really healthily', axis: 'y', direction: 'negative', dimension: 4 },
  { id: 60, nl: 'Mijn beste vrienden sporten niet', en: 'My best friends do not exercise', axis: 'y', direction: 'negative', dimension: 3 },
]

export type AnswerValue = 2 | 1 | 0 | -1 | -2 | -2 // helemaal eens, eens, neutraal, niet eens, helemaal niet eens, geen mening

export function calculateScores(answers: Record<number, number>) {
  let xScore = 0
  let xCount = 0
  let yScore = 0
  let yCount = 0

  for (const question of QUESTIONS) {
    const raw = answers[question.id]
    if (raw === undefined) continue

    // raw: 2=helemaal eens, 1=eens, 0=neutraal, -1=niet eens, -2=helemaal niet eens, -99=geen mening
    if (raw === -99) continue // geen mening telt niet mee

    const value = question.direction === 'positive' ? raw : -raw

    if (question.axis === 'x') {
      xScore += value
      xCount++
    } else {
      yScore += value
      yCount++
    }
  }

  const x = xCount > 0 ? xScore / xCount : 0
  const y = yCount > 0 ? yScore / yCount : 0

  const quadrant =
    x >= 0 && y >= 0 ? 'active_motivated' :
    x >= 0 && y < 0  ? 'active_unmotivated' :
    x < 0  && y >= 0 ? 'inactive_motivated' :
    'inactive_unmotivated'

  return { x, y, quadrant }
}
