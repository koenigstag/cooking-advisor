import type { IconLib } from './loaders.ts';

export type IconRef = {
  lib: IconLib;
  name: string;
  match?: RegExp;
};

// Curated subset of icons offered when picking a product icon.
// Add more entries here as needed — `lib` can point at any module
// registered in loaders.ts, so icons don't have to come from react-icons.
// `match` is tested against a typed product name (ru/en) to auto-suggest
// an icon; keep it undefined for icons with no obvious name keyword.
export const ICON_MAP = {
  carrot: {
    lib: 'react-icons/fa6',
    name: 'FaCarrot',
    match: /морков|carrot/i,
  },
  potato: {
    lib: 'react-icons/gi',
    name: 'GiPotato',
    match: /картофел|картош|potato/i,
  },
  tomato: {
    lib: 'react-icons/gi',
    name: 'GiTomato',
    match: /помидор|томат|tomato/i,
  },
  apple: {
    lib: 'react-icons/fa6',
    name: 'FaAppleWhole',
    match: /яблок|apple/i,
  },
  bread: {
    lib: 'react-icons/fa6',
    name: 'FaBreadSlice',
    match: /хлеб|батон|bread/i,
  },
  cheese: { lib: 'react-icons/fa6', name: 'FaCheese', match: /сыр|cheese/i },
  milk: {
    lib: 'react-icons/gi',
    name: 'GiMilkCarton',
    match: /молок|milk/i,
  },
  butter: {
    lib: 'react-icons/gi',
    name: 'GiButter',
    match: /сливочн|\bbutter\b/i,
  },
  fish: {
    lib: 'react-icons/fa6',
    name: 'FaFish',
    match: /рыба|лосос|тунец|треск|fish/i,
  },
  pepper: {
    lib: 'react-icons/fa6',
    name: 'FaPepperHot',
    match: /перец|чили|pepper|chili/i,
  },
  egg: { lib: 'react-icons/fa6', name: 'FaEgg', match: /яйц|egg/i },
  lemon: { lib: 'react-icons/fa6', name: 'FaLemon', match: /лимо|lemon/i },
  banana: { lib: 'react-icons/lu', name: 'LuBanana', match: /бана|banana/i },
  coconut: {
    lib: 'react-icons/fa',
    name: 'FaBowlingBall',
    match: /кокос|coconut/i,
  },
  meat: {
    lib: 'react-icons/fa6',
    name: 'FaDrumstickBite',
    match: /мясо|филе|курин|говядин|свинин|chicken|beef|pork|meat/i,
  },
  bacon: {
    lib: 'react-icons/gi',
    name: 'GiBacon',
    match: /бекон|bacon/i,
  },
  hotdog: {
    lib: 'react-icons/fa6',
    name: 'FaHotdog',
    match: /хот-?дог|сосиск|hotdog|sausage/i,
  },
  pizza: { lib: 'react-icons/fa6', name: 'FaPizzaSlice', match: /пицц|pizza/i },
  iceCream: {
    lib: 'react-icons/fa6',
    name: 'FaIceCream',
    match: /мороженое|ice ?cream/i,
  },
  hotDrink: {
    lib: 'react-icons/fa6',
    name: 'FaMugHot',
    match: /чай|кофе(?!.{0,3}зерн)|tea|coffee(?! ?bean)/i,
  },
  wine: { lib: 'react-icons/fa6', name: 'FaWineGlass', match: /вино|wine/i },
  beer: {
    lib: 'react-icons/fa6',
    name: 'FaBeerMugEmpty',
    match: /пиво|beer/i,
  },
  cookie: {
    lib: 'react-icons/fa6',
    name: 'FaCookie',
    match: /печенье|cookie/i,
  },
  candy: {
    lib: 'react-icons/fa6',
    name: 'FaCandyCane',
    match: /конфет|сладост|candy/i,
  },
  bowlFood: {
    lib: 'react-icons/fa6',
    name: 'FaBowlFood',
    match: /суп|каша|soup/i,
  },
  pasta: {
    lib: 'react-icons/gi',
    name: 'GiNoodles',
    match: /макарон|спагетти|паста\b|pasta|noodle|spaghetti/i,
  },
  rice: { lib: 'react-icons/fa6', name: 'FaBowlRice', match: /рис|rice/i },
  shrimp: {
    lib: 'react-icons/fa6',
    name: 'FaShrimp',
    match: /кревет|shrimp/i,
  },
  seedling: {
    lib: 'react-icons/fa6',
    name: 'FaSeedling',
    match: /росток|sprout/i,
  },
  leaf: {
    lib: 'react-icons/fa6',
    name: 'FaLeaf',
    match: /зелен|салат|leaf|lettuce/i,
  },
  olive: {
    lib: 'react-icons/gi',
    name: 'GiOlive',
    match: /оливк|olive/i,
  },
  pickle: {
    lib: 'react-icons/gi',
    name: 'GiPickle',
    match: /огур|pickle|cucumber/i,
  },
  bean: { lib: 'react-icons/lu', name: 'LuBean', match: /фасол|бобы|bean/i },
  coffeebean: {
    lib: 'react-icons/pi',
    name: 'PiCoffeeBean',
    match: /кофе.{0,3}зерн|coffee ?bean/i,
  },
  wheat: {
    lib: 'react-icons/fa6',
    name: 'FaWheatAwn',
    match: /пшениц|мука|wheat|flour/i,
  },
  utensils: { lib: 'react-icons/fa6', name: 'FaUtensils' },
  blender: {
    lib: 'react-icons/fa6',
    name: 'FaBlender',
    match: /смузи|коктейль|blender|smoothie/i,
  },
  kitchen: { lib: 'react-icons/fa6', name: 'FaKitchenSet' },
} satisfies Record<string, IconRef>;

export type IconId = keyof typeof ICON_MAP;

// Picks the icon whose `match` captured the longest (most specific)
// substring of the product name, e.g. "кофейные зёрна" -> coffeebean,
// not the more generic hotDrink "кофе" match.
export function guessIconId(productName: string): IconId | undefined {
  let best: { id: IconId; length: number } | undefined;
  for (const [id, ref] of Object.entries(ICON_MAP) as [IconId, IconRef][]) {
    const m = ref.match?.exec(productName);
    if (m && (!best || m[0].length > best.length)) {
      best = { id, length: m[0].length };
    }
  }
  return best?.id;
}
