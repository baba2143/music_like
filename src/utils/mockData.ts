import { User, Post, IdolGroup } from '../types/models';

// アイドルグループデータ
export const idolGroups: IdolGroup[] = [
  {
    id: '1',
    name: '乃木坂46',
    category: 'nogizaka',
    members: ['齋藤飛鳥', '山下美月', '梅澤美波', '久保史緒里', '賀喜遥香'],
  },
  {
    id: '2',
    name: '日向坂46',
    category: 'hinata',
    members: ['佐々木久美', '加藤史帆', '齊藤京子', '河田陽菜', '小坂菜緒'],
  },
  {
    id: '3',
    name: '櫻坂46',
    category: 'sakura',
    members: ['森田ひかる', '山崎天', '田村保乃', '藤吉夏鈴', '井上梨名'],
  },
  {
    id: '4',
    name: 'モーニング娘。',
    category: 'hello',
    members: ['譜久村聖', '生田衣梨奈', '石田亜佑美', '佐藤優樹', '小田さくら'],
  },
  {
    id: '5',
    name: 'Snow Man',
    category: 'johnny',
    members: ['岩本照', '深澤辰哉', '佐久間大介', '渡辺翔太', '向井康二'],
  },
];

// ダミーユーザー
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'nogifan_yuki',
    displayName: 'ゆき🎀',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    bio: '乃木坂46大好き！齋藤飛鳥推し💜 ライブは毎回参戦してます',
    oshiGroup: '乃木坂46',
    oshiMember: '齋藤飛鳥',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user2',
    username: 'hinata_lover',
    displayName: 'みおん☀️',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    bio: '日向坂が人生のビタミン🌻 佐々木久美ちゃん推し',
    oshiGroup: '日向坂46',
    oshiMember: '佐々木久美',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'user3',
    username: 'sakura_oshi',
    displayName: 'りな🌸',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    bio: '櫻坂46オタク。森田ひかるちゃん推し。グッズ集めが趣味',
    oshiGroup: '櫻坂46',
    oshiMember: '森田ひかる',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'user4',
    username: 'hello_project_fan',
    displayName: 'あやか💚',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    bio: 'ハロプロ一筋15年！モーニング娘。大好き',
    oshiGroup: 'モーニング娘。',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'user5',
    username: 'johnny_watcher',
    displayName: 'ひろき⛄',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    bio: 'Snow Man全員好き！特に岩本くん推し',
    oshiGroup: 'Snow Man',
    oshiMember: '岩本照',
    createdAt: new Date('2024-02-14'),
  },
  {
    id: 'user6',
    username: 'idol_music_lover',
    displayName: 'さくら🎵',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    bio: 'アイドル音楽全般聴きます！プレイリスト作るのが好き',
    oshiGroup: '乃木坂46',
    createdAt: new Date('2024-03-01'),
  },
];

// ダミー投稿
export const mockPosts: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    author: mockUsers[0],
    contentType: 'playlist',
    caption: '推しの神曲だけ集めたプレイリスト作りました😊 作業用BGMにどうぞ！',
    hashtags: ['#乃木坂46', '#プレイリスト', '#作業用BGM'],
    playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6',
    playlistTitle: '乃木坂46 神曲50選',
    playlistThumbnail: 'https://picsum.photos/300/300?random=1',
    playlistTrackCount: 50,
    playlistService: 'spotify',
    likesCount: 24,
    commentsCount: 5,
    savesCount: 12,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'post2',
    userId: 'user2',
    author: mockUsers[1],
    contentType: 'track',
    caption: '何度聴いても泣ける😭 今日もリピート中',
    hashtags: ['#乃木坂46', '#サヨナラの意味'],
    trackTitle: 'サヨナラの意味',
    trackArtist: '乃木坂46',
    trackAlbum: '真夏の全国ツアー2017',
    trackThumbnail: 'https://picsum.photos/300/300?random=2',
    trackUrl: 'https://open.spotify.com/track/example',
    likesCount: 18,
    commentsCount: 3,
    savesCount: 7,
    isLiked: true,
    isSaved: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5時間前
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'post3',
    userId: 'user3',
    author: mockUsers[2],
    contentType: 'playlist',
    caption: '櫻坂のかっこいい曲だけ集めました🔥 テンション上がる！',
    hashtags: ['#櫻坂46', '#かっこいい曲'],
    playlistUrl: 'https://open.spotify.com/playlist/example2',
    playlistTitle: '櫻坂46 Cool Songs',
    playlistThumbnail: 'https://picsum.photos/300/300?random=3',
    playlistTrackCount: 30,
    playlistService: 'spotify',
    likesCount: 42,
    commentsCount: 8,
    savesCount: 20,
    isLiked: false,
    isSaved: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8時間前
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: 'post4',
    userId: 'user4',
    author: mockUsers[3],
    contentType: 'track',
    caption: 'やっぱりハロプロはこれ！名曲すぎる',
    hashtags: ['#モーニング娘', '#LOVEマシーン'],
    trackTitle: 'LOVEマシーン',
    trackArtist: 'モーニング娘。',
    trackAlbum: '2nd ~LOVEオーディション~',
    trackThumbnail: 'https://picsum.photos/300/300?random=4',
    likesCount: 35,
    commentsCount: 6,
    savesCount: 15,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12時間前
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'post5',
    userId: 'user5',
    author: mockUsers[4],
    contentType: 'playlist',
    caption: 'Snow Manのドライブソング集🚗 デート前のテンション上げにも◎',
    hashtags: ['#SnowMan', '#ドライブソング'],
    playlistUrl: 'https://open.spotify.com/playlist/example3',
    playlistTitle: 'Snow Man Best Drive Mix',
    playlistThumbnail: 'https://picsum.photos/300/300?random=5',
    playlistTrackCount: 25,
    playlistService: 'spotify',
    likesCount: 56,
    commentsCount: 12,
    savesCount: 28,
    isLiked: true,
    isSaved: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1日前
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'post6',
    userId: 'user6',
    author: mockUsers[5],
    contentType: 'track',
    caption: '最近ハマってる曲🎧 夜聴くと良い感じ',
    hashtags: ['#乃木坂46', '#夜曲'],
    trackTitle: 'きっかけ',
    trackArtist: '乃木坂46',
    trackThumbnail: 'https://picsum.photos/300/300?random=6',
    likesCount: 21,
    commentsCount: 4,
    savesCount: 9,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'post7',
    userId: 'user1',
    author: mockUsers[0],
    contentType: 'playlist',
    caption: '雨の日に聴きたい坂道シリーズ☔ しっとりした曲だけ集めました',
    hashtags: ['#坂道シリーズ', '#雨の日', '#しっとり'],
    playlistUrl: 'https://open.spotify.com/playlist/example4',
    playlistTitle: '雨の日の坂道ソング',
    playlistThumbnail: 'https://picsum.photos/300/300?random=7',
    playlistTrackCount: 40,
    playlistService: 'spotify',
    likesCount: 38,
    commentsCount: 7,
    savesCount: 18,
    isLiked: true,
    isSaved: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// ユーザーIDから投稿を取得
export const getPostsByUserId = (userId: string): Post[] => {
  return mockPosts.filter((post) => post.userId === userId);
};

// ランダムな投稿を取得
export const getRandomPosts = (count: number): Post[] => {
  const shuffled = [...mockPosts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// フィード用の投稿を取得（ページネーション対応）
export const getFeedPosts = (limit: number = 10, offset: number = 0): Post[] => {
  return mockPosts.slice(offset, offset + limit);
};

// 相対時間を計算
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay}日前`;
  }
  if (diffHour > 0) {
    return `${diffHour}時間前`;
  }
  if (diffMin > 0) {
    return `${diffMin}分前`;
  }
  return 'たった今';
};
