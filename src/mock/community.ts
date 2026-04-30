import type {
  CommentItem,
  CommunityEvent,
  CommunityRankItem,
  FeedChannel,
  Game,
  HeroFeature,
  Post,
  TopbarMessage,
  UserProfile,
} from '../types/community'

export const heroFeature: HeroFeature = {
  id: 1,
  title: '赛季焦点：在最热社区里找到最值得看的游戏内容',
  subtitle: '从版本攻略、赛事热帖到截图创作，小番茄把高讨论度和高质量内容放到同一张首页里。',
  cover: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1600&q=80',
  badge: '社区焦点',
  metrics: [
    { label: '今日热帖', value: '48' },
    { label: '在线讨论', value: '6.2k' },
    { label: '活跃创作者', value: '1.4k' },
  ],
}

export const feedChannels: FeedChannel[] = [
  { id: 1, name: '攻略', icon: '📘', description: '开荒路线与配装思路', accent: 'orange' },
  { id: 2, name: '评测', icon: '🎮', description: '新游体验与长线点评', accent: 'purple' },
  { id: 3, name: '截图', icon: '📷', description: '风景、角色和营地展示', accent: 'blue' },
  { id: 4, name: '联机', icon: '🛰️', description: '组队、工会和开黑招募', accent: 'green' },
  { id: 5, name: '赛事', icon: '🏆', description: '职业联赛和战术分析', accent: 'red' },
  { id: 6, name: '整活', icon: '✨', description: '社区梗图和创意视频', accent: 'pink' },
]

export const rankGroups: Array<{
  id: number
  title: string
  items: CommunityRankItem[]
}> = [
  {
    id: 1,
    title: '热玩榜',
    items: [
      { id: 1, title: '星海远征', subtitle: '开放世界', value: '92 热度', trend: '+12%' },
      { id: 2, title: '战术回响', subtitle: '策略竞技', value: '88 热度', trend: '+9%' },
      { id: 3, title: '夜幕工坊', subtitle: '生存冒险', value: '84 热度', trend: '+6%' },
    ],
  },
  {
    id: 2,
    title: '热帖榜',
    items: [
      { id: 4, title: '星海远征开荒路线', subtitle: '攻略', value: '1.2k 点赞', trend: '+18%' },
      { id: 5, title: '战术回响赛事复盘', subtitle: '赛事分析', value: '960 点赞', trend: '+11%' },
      { id: 6, title: '夜幕工坊营地分享', subtitle: '创作分享', value: '1.5k 点赞', trend: '+24%' },
    ],
  },
  {
    id: 3,
    title: '创作者榜',
    items: [
      { id: 7, title: '番茄舰长', subtitle: '攻略作者', value: '9.6万 获赞', trend: '+15%' },
      { id: 8, title: '小番茄分析台', subtitle: '赛事作者', value: '6.3万 获赞', trend: '+8%' },
      { id: 9, title: '建造小能手', subtitle: '创作作者', value: '5.2万 获赞', trend: '+10%' },
    ],
  },
]

export const communityEvents: CommunityEvent[] = [
  {
    id: 1,
    title: '春季联机节正在进行中',
    subtitle: '参与游戏专区任务，解锁限定头像框与社区勋章。',
    cta: '查看活动',
    status: '进行中',
  },
  {
    id: 2,
    title: '截图创作周精选征集',
    subtitle: '投稿优质截图与故事内容，首页焦点位持续曝光。',
    cta: '立即投稿',
    status: '征集中',
  },
]

export const topbarMessages: TopbarMessage[] = [
  {
    id: 1,
    title: '你的攻略收到新评论',
    content: '摸鱼指挥官在《星海远征》开荒路线下回复了你。',
    publishTime: '10 分钟前',
    type: 'comment',
    isRead: false,
    postId: 101,
  },
  {
    id: 2,
    title: '帖子热度继续上升',
    content: '《夜幕工坊》据点装修分享新增 126 个点赞。',
    publishTime: '35 分钟前',
    type: 'like',
    isRead: false,
    postId: 103,
  },
  {
    id: 3,
    title: '有人收藏了你的内容',
    content: '你发布的赛事复盘被更多玩家加入收藏夹。',
    publishTime: '1 小时前',
    type: 'favorite',
    isRead: true,
    postId: 102,
  },
  {
    id: 4,
    title: '联机节活动仍在进行中',
    content: '完成专区任务可解锁限定头像框与社区勋章。',
    publishTime: '今天',
    type: 'system',
    isRead: false,
    route: {
      name: 'games',
      query: { genre: '开放世界' },
    },
  },
]

export const featuredGames: Game[] = [
  {
    id: 1,
    name: '星海远征',
    genre: '开放世界',
    status: '本周热游',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    followers: '28.4万',
    heat: '92',
    summary: '高自由度星际探索，支持多人协作建造与赛季活动。',
    tags: ['联机', '探索', '建造'],
  },
  {
    id: 2,
    name: '战术回响',
    genre: '策略竞技',
    status: '电竞精选',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    followers: '19.8万',
    heat: '88',
    summary: '强调阵容搭配和地图资源运营的快节奏竞技作品。',
    tags: ['竞技', '策略', '赛季'],
  },
  {
    id: 3,
    name: '夜幕工坊',
    genre: '生存冒险',
    status: '口碑上升',
    cover: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80',
    followers: '12.1万',
    heat: '84',
    summary: '在末世世界中采集、制造、经营据点并挑战巨型首领。',
    tags: ['生存', 'PVE', '经营'],
  },
]

export const posts: Post[] = [
  {
    id: 101,
    title: '《星海远征》新版本 8 小时体验：前期开荒路线怎么走更舒服？',
    summary: '我把主线、资源点和前期舰船升级顺序整理成一套效率更高的路线，适合刚入坑的新手和回流玩家。',
    cover: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=80',
    game: '星海远征',
    topic: '开荒攻略',
    author: {
      id: 1,
      name: '番茄舰长',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Captain',
      level: 'Lv.24',
      isOnline: true,
    },
    publishTime: '2 小时前',
    content: [
      '新版最关键的变化是前 3 小时的资源曲线被明显拉平，所以不用急着冲主线等级。',
      '建议先拿完两个外围资源站，再回主城做建造任务，这样舰船和背包容量都能同步提升。',
      '如果你偏向单人探索，可以优先点出扫描和采集技能；如果是多人开黑，建议队伍里至少留一个人专门负责制造。',
    ],
    media: [],
    likes: 1280,
    comments: 216,
    favorites: 389,
    views: '3.4万',
    readingTime: '6 分钟',
    tags: ['新手', '路线规划', '版本更新'],
    featured: true,
  },
  {
    id: 102,
    title: '战术回响职业联赛观赛笔记：为什么这套双前排阵容突然流行起来？',
    summary: '从地图目标刷新机制、辅助位节奏和团战容错率三个角度，拆一下版本答案背后的逻辑。',
    cover: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80',
    game: '战术回响',
    topic: '赛事分析',
    author: {
      id: 2,
      name: '小番茄分析台',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Analyst',
      level: 'Lv.31',
      isOnline: false,
    },
    publishTime: '5 小时前',
    content: [
      '双前排的核心不是“更肉”，而是把对方的爆发节奏拆开，让后排有更多技能循环机会。',
      '这套阵容在窄口地形和龙区团战里表现尤其强势，因为它能稳定抢到第一轮站位。',
      '缺点也很明显：一旦前期节奏断掉，装备成型会慢，转线速度也不如标准快攻体系。',
    ],
    media: [],
    likes: 960,
    comments: 148,
    favorites: 274,
    views: '2.1万',
    readingTime: '5 分钟',
    tags: ['赛事', '阵容理解', '版本强势'],
  },
  {
    id: 103,
    title: '夜幕工坊据点装修分享：把工业风营地做出电影感只需要这三步',
    summary: '试了很多灯光和材质组合后，我总结出一套很适合夜景截图的据点搭建思路。',
    cover: 'https://images.unsplash.com/photo-1514329926535-7f6db2f6b2b1?auto=format&fit=crop&w=1200&q=80',
    game: '夜幕工坊',
    topic: '创作分享',
    author: {
      id: 3,
      name: '建造小能手',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Builder',
      level: 'Lv.19',
      isOnline: true,
    },
    publishTime: '昨天',
    content: [
      '第一步是先确定主光源方向，不要一开始就堆太多装饰物。',
      '第二步是用少量重复材质统一风格，金属墙、暖色灯和深色木地板的组合非常稳。',
      '最后再用功能性家具补细节，比如工作台、储物箱和地图墙，这样看起来更像有人长期居住。',
    ],
    media: [],
    likes: 1540,
    comments: 301,
    favorites: 622,
    views: '4.9万',
    readingTime: '4 分钟',
    tags: ['营地设计', '截图', '氛围感'],
  },
]

export const comments: CommentItem[] = [
  {
    id: 1,
    postId: 101,
    author: {
      id: 11,
      name: '摸鱼指挥官',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Commander',
      level: 'Lv.12',
      isOnline: true,
    },
    content: '照着你的路线打了两小时，资源确实顺很多，感谢分享。',
    publishTime: '40 分钟前',
    likes: 34,
  },
  {
    id: 2,
    postId: 101,
    author: {
      id: 12,
      name: '晚风开黑组',
      avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Team',
      level: 'Lv.18',
      isOnline: false,
    },
    content: '多人队伍里安排一个制造专精真的很关键，我们昨天就踩坑了。',
    publishTime: '1 小时前',
    likes: 22,
  },
]

export const userProfile: UserProfile = {
  name: '小番茄站长',
  handle: '@tomato_player',
  bio: '热爱独立游戏、联机合作与社区内容策划，喜欢把攻略和体验写成能帮到别人的帖子。',
  avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tomato',
  stats: [
    { label: '关注', value: '312' },
    { label: '粉丝', value: '1.8万' },
    { label: '获赞', value: '9.6万' },
  ],
  badges: ['首席创作者', '攻略合伙人', '截图精选'],
  favoriteGames: ['星海远征', '夜幕工坊', '战术回响'],
  traits: ['内容策划', '独立游戏爱好者', '联机合作党'],
}
