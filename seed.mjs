import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: "postgresql://neondb_owner:npg_q25xfeQRNJCi@ep-snowy-rice-alprqvgu.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require",
});
const prisma = new PrismaClient({ adapter });

const products = [
  {
    slug: "oud-rose-de-dubai",
    name: "Oud Rose de Dubai",
    nameBg: "Уд Роза от Дубай",
    description: "A masterpiece of Arabian perfumery — deep Bulgarian rose entwined with rare agarwood oud, warmed by amber and sandalwood. An intoxicating signature scent.",
    descriptionBg: "Шедьовър на арабската парфюмерия — дълбока българска роза, преплетена с редкия уд агарово дърво, затоплена от амбра и сандалово дърво.",
    brand: "Al Haramain",
    volume: "100ml",
    gender: "Unisex",
    price: 189.99,
    originalPrice: null,
    quantity: 12,
    images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80"],
    featured: true,
    inPromotion: false,
    discountPct: null,
    available: true,
  },
  {
    slug: "black-musk-royal",
    name: "Black Musk Royal",
    nameBg: "Черен Мускус Роял",
    description: "An opulent dark musk with notes of black amber, leather, and smoky incense. Bold, mysterious and deeply sensual — crafted for the confident.",
    descriptionBg: "Опулентен тъмен мускус с нотки на черна амбра, кожа и димен тамян. Смел, мистериозен и дълбоко чувствен.",
    brand: "Lattafa",
    volume: "100ml",
    gender: "Men",
    price: 129.99,
    originalPrice: 159.99,
    quantity: 8,
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80"],
    featured: false,
    inPromotion: true,
    discountPct: 19,
    available: true,
  },
  {
    slug: "jasmine-saffron-elixir",
    name: "Jasmine & Saffron Elixir",
    nameBg: "Жасмин и Шафран Еликсир",
    description: "A luminous floral elixir of night-blooming jasmine and golden saffron, softened with white musk and warm vanilla. Feminine, radiant and unforgettable.",
    descriptionBg: "Лъчезарен флорален еликсир от нощен жасмин и златен шафран, омекотен с бял мускус и топла ванилия.",
    brand: "Swiss Arabian",
    volume: "50ml",
    gender: "Women",
    price: 149.99,
    originalPrice: null,
    quantity: 15,
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80"],
    featured: true,
    inPromotion: false,
    discountPct: null,
    available: true,
  },
  {
    slug: "amber-woods-intense",
    name: "Amber Woods Intense",
    nameBg: "Амбър Уудс Интенс",
    description: "Rich golden amber fused with cedarwood, patchouli and a whisper of vanilla. A warm, enveloping fragrance that lingers beautifully on skin.",
    descriptionBg: "Богата златна амбра, слята с кедрово дърво, пачули и шепот ванилия. Топъл, обгръщащ аромат.",
    brand: "Ajmal",
    volume: "75ml",
    gender: "Unisex",
    price: 109.99,
    originalPrice: 139.99,
    quantity: 5,
    images: ["https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80"],
    featured: false,
    inPromotion: true,
    discountPct: 21,
    available: true,
  },
];

for (const p of products) {
  await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
  console.log("Created:", p.name);
}

await prisma.$disconnect();
console.log("Done!");
