import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Video,
  Phone,
  MessageCircle,
  Mail,
  Star,
  Users,
  Shield,
  Clock,
  Search,
  Heart,
  ChevronRight,
} from 'lucide-react';

// 占術カテゴリ
const divinationCategories = [
  { name: 'タロット占い', slug: 'tarot', icon: '🎴' },
  { name: '西洋占星術', slug: 'astrology', icon: '⭐' },
  { name: '四柱推命', slug: 'shichusuimei', icon: '📅' },
  { name: '霊視・霊感', slug: 'spiritual', icon: '👁️' },
  { name: '手相占い', slug: 'palmistry', icon: '✋' },
  { name: '数秘術', slug: 'numerology', icon: '🔢' },
];

// 相談ジャンル
const consultationGenres = [
  { name: '恋愛・結婚', slug: 'love', color: 'bg-pink-100 text-pink-800' },
  { name: '仕事・キャリア', slug: 'career', color: 'bg-blue-100 text-blue-800' },
  { name: '金運・財運', slug: 'money', color: 'bg-yellow-100 text-yellow-800' },
  { name: '人間関係', slug: 'relationship', color: 'bg-green-100 text-green-800' },
  { name: '健康', slug: 'health', color: 'bg-red-100 text-red-800' },
  { name: '開運・運勢', slug: 'fortune', color: 'bg-purple-100 text-purple-800' },
];

// 特徴
const features = [
  {
    icon: Video,
    title: 'ビデオ通話鑑定',
    description: '対面と変わらないクオリティでオンライン鑑定',
  },
  {
    icon: Shield,
    title: '安心・安全',
    description: '本人確認済みの占い師のみが登録',
  },
  {
    icon: Clock,
    title: '24時間予約可能',
    description: 'いつでもどこでも空き時間に予約',
  },
  {
    icon: Star,
    title: 'レビューで選べる',
    description: '実際の利用者の評価を参考に',
  },
];

// サンプル占い師データ
const sampleDiviners = [
  {
    id: '1',
    name: '月詠 さくら',
    image: '/images/diviner1.jpg',
    rating: 4.9,
    reviewCount: 256,
    divinationTypes: ['タロット', '西洋占星術'],
    price: 3000,
    isOnline: true,
  },
  {
    id: '2',
    name: '星野 光',
    image: '/images/diviner2.jpg',
    rating: 4.8,
    reviewCount: 189,
    divinationTypes: ['霊視', 'オラクルカード'],
    price: 4000,
    isOnline: true,
  },
  {
    id: '3',
    name: '風水師 蓮',
    image: '/images/diviner3.jpg',
    rating: 4.7,
    reviewCount: 142,
    divinationTypes: ['風水', '四柱推命'],
    price: 5000,
    isOnline: false,
  },
  {
    id: '4',
    name: '紫苑',
    image: '/images/diviner4.jpg',
    rating: 4.9,
    reviewCount: 312,
    divinationTypes: ['手相', '数秘術'],
    price: 3500,
    isOnline: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                占い師特化型プラットフォーム
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                あなたの運命を、
                <br />
                <span className="text-primary-600">もっと身近に</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                タロット、西洋占星術、四柱推命など
                <br className="hidden sm:block" />
                様々な占術の占い師を検索・予約できます
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/diviners">
                  <Button size="xl" className="w-full sm:w-auto">
                    <Search className="h-5 w-5 mr-2" />
                    占い師を探す
                  </Button>
                </Link>
                <Link href="/register?role=diviner">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    占い師として登録
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consultation Types Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                鑑定方法から選ぶ
              </h2>
              <p className="text-gray-600">お好みの方法で鑑定を受けられます</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/diviners?type=video_call"
                className="card hover:shadow-md transition-shadow p-6 text-center group"
              >
                <Video className="h-8 w-8 mx-auto mb-3 text-primary-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">ビデオ通話</h3>
                <p className="text-sm text-gray-500 mt-1">対面のような鑑定</p>
              </Link>
              <Link
                href="/diviners?type=voice_call"
                className="card hover:shadow-md transition-shadow p-6 text-center group"
              >
                <Phone className="h-8 w-8 mx-auto mb-3 text-secondary-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">電話鑑定</h3>
                <p className="text-sm text-gray-500 mt-1">音声のみで相談</p>
              </Link>
              <Link
                href="/diviners?type=chat"
                className="card hover:shadow-md transition-shadow p-6 text-center group"
              >
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-accent-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">チャット鑑定</h3>
                <p className="text-sm text-gray-500 mt-1">テキストで相談</p>
              </Link>
              <Link
                href="/diviners?type=email"
                className="card hover:shadow-md transition-shadow p-6 text-center group"
              >
                <Mail className="h-8 w-8 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-gray-900">メール鑑定</h3>
                <p className="text-sm text-gray-500 mt-1">じっくり相談</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Divination Categories Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                占術から選ぶ
              </h2>
              <p className="text-gray-600">得意な占術で占い師を探せます</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {divinationCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/diviners?divination=${category.slug}`}
                  className="card hover:shadow-md transition-shadow p-4 text-center group"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Consultation Genres Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                お悩みから選ぶ
              </h2>
              <p className="text-gray-600">相談したい内容で占い師を探せます</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {consultationGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/diviners?genre=${genre.slug}`}
                  className={`${genre.color} px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity`}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Diviners Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  人気の占い師
                </h2>
                <p className="text-gray-600">多くの相談者に支持されている占い師</p>
              </div>
              <Link href="/diviners?sort=rating">
                <Button variant="ghost" className="hidden md:flex">
                  もっと見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleDiviners.map((diviner) => (
                <Link
                  key={diviner.id}
                  href={`/diviners/${diviner.id}`}
                  className="card hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
                      <Users className="h-12 w-12" />
                    </div>
                    {diviner.isOnline && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="success" className="text-xs">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                          オンライン
                        </Badge>
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {diviner.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-gray-900">{diviner.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({diviner.reviewCount}件)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {diviner.divinationTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-primary-600 font-semibold">
                      ¥{diviner.price.toLocaleString()}〜
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/diviners?sort=rating">
                <Button variant="outline">
                  もっと見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-primary text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              占い師として活動しませんか？
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              ウラナビなら、簡単に自分の占いサービスを始められます。
              初期費用・月額費用は無料。売上があった時だけ手数料がかかります。
            </p>
            <Link href="/register?role=diviner">
              <Button
                size="xl"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                占い師として登録する
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
