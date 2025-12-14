import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 占術マスタデータ
const divinationTypes = [
  { name: 'タロット占い', slug: 'tarot', sortOrder: 1 },
  { name: '西洋占星術', slug: 'astrology', sortOrder: 2 },
  { name: '四柱推命', slug: 'shichusuimei', sortOrder: 3 },
  { name: '九星気学', slug: 'kyusei', sortOrder: 4 },
  { name: '手相占い', slug: 'palmistry', sortOrder: 5 },
  { name: '数秘術', slug: 'numerology', sortOrder: 6 },
  { name: '霊視・霊感', slug: 'spiritual', sortOrder: 7 },
  { name: 'オラクルカード', slug: 'oracle', sortOrder: 8 },
  { name: 'ルーン占い', slug: 'rune', sortOrder: 9 },
  { name: '風水', slug: 'fengshui', sortOrder: 10 },
  { name: '姓名判断', slug: 'seimei', sortOrder: 11 },
  { name: '夢占い', slug: 'dream', sortOrder: 12 },
  { name: 'その他', slug: 'other', sortOrder: 99 },
];

// 相談ジャンルマスタデータ
const consultationGenres = [
  { name: '恋愛・結婚', slug: 'love', sortOrder: 1 },
  { name: '復縁・復活愛', slug: 'reunion', sortOrder: 2 },
  { name: '不倫・浮気', slug: 'affair', sortOrder: 3 },
  { name: '仕事・キャリア', slug: 'career', sortOrder: 4 },
  { name: '転職・就職', slug: 'job', sortOrder: 5 },
  { name: '人間関係', slug: 'relationship', sortOrder: 6 },
  { name: '家庭問題', slug: 'family', sortOrder: 7 },
  { name: '健康・病気', slug: 'health', sortOrder: 8 },
  { name: '金運・財運', slug: 'money', sortOrder: 9 },
  { name: '開運・運勢', slug: 'fortune', sortOrder: 10 },
  { name: '前世・過去世', slug: 'pastlife', sortOrder: 11 },
  { name: 'ペット', slug: 'pet', sortOrder: 12 },
  { name: 'その他', slug: 'other', sortOrder: 99 },
];

async function main() {
  console.log('Seeding database...');

  // 占術マスタを作成
  console.log('Creating divination types...');
  for (const type of divinationTypes) {
    await prisma.divinationType.upsert({
      where: { slug: type.slug },
      update: {},
      create: type,
    });
  }

  // 相談ジャンルマスタを作成
  console.log('Creating consultation genres...');
  for (const genre of consultationGenres) {
    await prisma.consultationGenre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  // 管理者ユーザーを作成
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@uranavi.jp' },
    update: {},
    create: {
      email: 'admin@uranavi.jp',
      name: '管理者',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // サンプル占い師を作成
  console.log('Creating sample diviners...');
  const divinerPassword = await bcrypt.hash('diviner123456', 12);

  const sampleDiviners = [
    {
      email: 'sakura@example.com',
      name: '月詠 さくら',
      displayName: '月詠 さくら',
      bio: 'タロットと西洋占星術を得意とする占い師です。15年以上の鑑定経験を持ち、恋愛・仕事・人生の転機など、様々なお悩みに寄り添います。お客様一人ひとりに合わせた丁寧な鑑定を心がけています。',
      yearsOfExperience: 15,
      divinationTypes: ['tarot', 'astrology'],
      consultationGenres: ['love', 'career', 'fortune'],
    },
    {
      email: 'hikari@example.com',
      name: '星野 光',
      displayName: '星野 光',
      bio: '霊感・霊視を中心に、オラクルカードを使った鑑定を行っています。お客様の心に寄り添い、魂のメッセージをお伝えします。',
      yearsOfExperience: 10,
      divinationTypes: ['spiritual', 'oracle'],
      consultationGenres: ['love', 'relationship', 'pastlife'],
    },
    {
      email: 'ren@example.com',
      name: '風水師 蓮',
      displayName: '風水師 蓮',
      bio: '風水と四柱推命の専門家です。住環境の改善から運勢の分析まで、東洋の知恵を活かしたアドバイスを提供します。',
      yearsOfExperience: 20,
      divinationTypes: ['fengshui', 'shichusuimei'],
      consultationGenres: ['money', 'fortune', 'family'],
    },
  ];

  for (const sample of sampleDiviners) {
    const user = await prisma.user.upsert({
      where: { email: sample.email },
      update: {},
      create: {
        email: sample.email,
        name: sample.name,
        passwordHash: divinerPassword,
        role: 'DIVINER',
        emailVerified: new Date(),
      },
    });

    const diviner = await prisma.diviner.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: sample.displayName,
        bio: sample.bio,
        yearsOfExperience: sample.yearsOfExperience,
        status: 'APPROVED',
        verifiedAt: new Date(),
        ratingAvg: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        bookingCount: Math.floor(Math.random() * 500) + 100,
      },
    });

    // 占術を紐付け
    for (const typeSlug of sample.divinationTypes) {
      const type = await prisma.divinationType.findUnique({
        where: { slug: typeSlug },
      });
      if (type) {
        await prisma.divinerDivinationType.upsert({
          where: {
            divinerId_divinationTypeId: {
              divinerId: diviner.id,
              divinationTypeId: type.id,
            },
          },
          update: {},
          create: {
            divinerId: diviner.id,
            divinationTypeId: type.id,
            isPrimary: sample.divinationTypes.indexOf(typeSlug) === 0,
          },
        });
      }
    }

    // ジャンルを紐付け
    for (const genreSlug of sample.consultationGenres) {
      const genre = await prisma.consultationGenre.findUnique({
        where: { slug: genreSlug },
      });
      if (genre) {
        await prisma.divinerConsultationGenre.upsert({
          where: {
            divinerId_consultationGenreId: {
              divinerId: diviner.id,
              consultationGenreId: genre.id,
            },
          },
          update: {},
          create: {
            divinerId: diviner.id,
            consultationGenreId: genre.id,
          },
        });
      }
    }

    // サービスを作成
    const services = [
      {
        title: 'タロット鑑定 20分',
        description: 'タロットカードを使った基本的な鑑定です。お悩みに対するアドバイスをお伝えします。',
        consultationType: 'VIDEO_CALL',
        durationMinutes: 20,
        price: 3000,
        firstTimePrice: 2000,
      },
      {
        title: '総合鑑定 40分',
        description: '複数の占術を組み合わせた総合的な鑑定です。深くお悩みを掘り下げます。',
        consultationType: 'VIDEO_CALL',
        durationMinutes: 40,
        price: 5000,
        firstTimePrice: 4000,
      },
      {
        title: 'チャット鑑定 30分',
        description: 'テキストでの鑑定です。じっくり文章でやり取りしたい方におすすめです。',
        consultationType: 'CHAT',
        durationMinutes: 30,
        price: 3500,
      },
    ];

    for (let i = 0; i < services.length; i++) {
      await prisma.service.upsert({
        where: {
          id: `${diviner.id}-service-${i}`,
        },
        update: {},
        create: {
          id: `${diviner.id}-service-${i}`,
          divinerId: diviner.id,
          ...services[i],
          consultationType: services[i].consultationType as 'VIDEO_CALL' | 'VOICE_CALL' | 'CHAT' | 'EMAIL' | 'IN_PERSON',
          sortOrder: i,
          isActive: true,
        },
      });
    }

    // 予約可能時間を設定
    const availabilities = [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '12:00', endTime: '20:00' },
    ];

    for (const availability of availabilities) {
      await prisma.availability.create({
        data: {
          divinerId: diviner.id,
          ...availability,
          isAvailable: true,
        },
      });
    }
  }

  // サンプル相談者を作成
  console.log('Creating sample clients...');
  const clientPassword = await bcrypt.hash('client123456', 12);

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'テストユーザー',
      passwordHash: clientPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      nickname: 'テストユーザー',
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
