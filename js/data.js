/**
 * AI求职智能匹配智能体 - 模拟数据
 * 包含：学生画像、岗位列表、匹配结果、诊断详情、优化建议、历史记录
 */

// ==================== 学生求职画像 ====================
const STUDENT_PROFILE = {
  id: 1,
  name: '张明远',
  school: '清华大学',
  major: '计算机科学与技术',
  degree: '硕士',
  graduateYear: '2025届',
  gpa: '3.8/4.0',
  phone: '138****5678',
  email: 'zhangmingyuan@example.com',
  skills: [
    { name: 'Python', level: 95 },
    { name: 'Java', level: 90 },
    { name: 'Go', level: 75 },
    { name: 'MySQL', level: 88 },
    { name: 'Redis', level: 85 },
    { name: 'Docker', level: 80 },
    { name: 'Kubernetes', level: 70 },
    { name: 'Machine Learning', level: 78 },
    { name: 'TensorFlow', level: 72 },
    { name: '系统设计', level: 82 },
    { name: 'Linux', level: 85 },
    { name: 'Git', level: 90 }
  ],
  internship: {
    company: '字节跳动',
    position: '后端开发实习生',
    duration: '2024.06 - 2024.09',
    department: '抖音电商',
    description: '参与抖音电商推荐系统后端开发，负责商品推荐接口优化，使用Go语言开发高并发微服务，QPS提升40%；设计并实现分布式缓存方案，降低数据库查询延迟60%；参与系统架构评审，编写技术文档。'
  },
  projects: [
    {
      name: '分布式爬虫系统',
      role: '核心开发者',
      tech: ['Python', 'Scrapy', 'Redis', 'MongoDB', 'Docker'],
      description: '设计并实现支持亿级URL的分布式爬虫系统，采用Redis实现URL去重和调度，MongoDB存储结构化数据，支持动态IP代理池和反爬策略。'
    },
    {
      name: '微服务电商平台',
      role: '项目负责人',
      tech: ['Java', 'Spring Cloud', 'MySQL', 'Redis', 'RabbitMQ', 'Kubernetes'],
      description: '基于Spring Cloud Alibaba构建微服务电商平台，包含用户、商品、订单、支付等核心模块，实现服务发现、配置中心、网关路由、链路追踪等微服务治理功能。'
    }
  ],
  preference: {
    targetPositions: ['后端开发工程师', '基础架构工程师', '云计算开发工程师'],
    targetCities: ['北京', '上海', '深圳'],
    salaryRange: '20K-35K',
    industries: ['互联网', '人工智能', '云计算']
  }
};

// ==================== 岗位列表 ====================
const JOB_LIST = [
  {
    id: 1,
    company: '字节跳动',
    logo: '🏢',
    position: '后端开发工程师（抖音电商）',
    city: '北京',
    salary: '25K-40K·15薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-28',
    matchScore: 92,
    matchLabel: '极高匹配',
    tag: '强烈推荐',
    jd: {
      专业要求: '计算机科学、软件工程或相关专业硕士及以上学历',
      技能要求: '精通Go/Python/Java至少一种，熟悉MySQL、Redis、消息队列等中间件，了解分布式系统设计，有高并发系统开发经验',
      经验要求: '有互联网公司后端开发实习经验，参与过大规模系统开发或优化项目',
      素质要求: '良好的系统设计能力和问题分析能力，具备团队协作精神，有较强的学习能力和技术热情'
    },
    dimensions: {
      专业匹配度: 95,
      技能适配度: 93,
      经历契合度: 90,
      软实力匹配度: 88
    },
    highlights: [
      '计算机硕士学历高度匹配',
      'Go/Python/Java技能栈完全覆盖',
      '字节跳动实习经历与团队文化契合',
      '分布式系统经验与岗位需求高度一致'
    ]
  },
  {
    id: 2,
    company: '腾讯',
    logo: '🐧',
    position: '后台开发工程师（微信支付）',
    city: '深圳',
    salary: '23K-38K·16薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-27',
    matchScore: 88,
    matchLabel: '高度匹配',
    tag: '推荐',
    jd: {
      专业要求: '计算机相关专业硕士学历',
      技能要求: '精通C++/Go/Java，熟悉Linux系统编程，掌握MySQL优化和Redis集群方案，有分布式系统经验',
      经验要求: '有金融或支付系统相关开发经验优先，有高可用系统设计经验',
      素质要求: '严谨的逻辑思维能力，对代码质量有较高要求，良好的沟通表达能力'
    },
    dimensions: {
      专业匹配度: 92,
      技能适配度: 88,
      经历契合度: 85,
      软实力匹配度: 86
    },
    highlights: [
      '专业技能与岗位要求高度吻合',
      '分布式系统项目经验丰富',
      'MySQL/Redis技能栈匹配',
      '需补充支付/金融领域知识'
    ]
  },
  {
    id: 3,
    company: '阿里巴巴',
    logo: '🐱',
    position: 'Java开发工程师（淘宝技术）',
    city: '杭州',
    salary: '22K-35K·16薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-26',
    matchScore: 85,
    matchLabel: '高度匹配',
    tag: '推荐',
    jd: {
      专业要求: '计算机、软件工程等相关专业硕士及以上',
      技能要求: '精通Java及Spring生态，熟悉MySQL分库分表，掌握Redis、RocketMQ，了解容器化和微服务架构',
      经验要求: '有电商或交易系统开发经验，参与过大型项目架构设计',
      素质要求: '结果导向，具备owner意识，良好的跨团队协作能力'
    },
    dimensions: {
      专业匹配度: 93,
      技能适配度: 90,
      经历契合度: 80,
      软实力匹配度: 75
    },
    highlights: [
      'Java+Spring技术栈完全匹配',
      '微服务项目经验直接契合',
      '电商实习经历相关度高',
      '杭州工作地点需考虑通勤'
    ]
  },
  {
    id: 4,
    company: '美团',
    logo: '🛵',
    position: '后端开发工程师（到店事业群）',
    city: '北京',
    salary: '22K-35K·15薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-25',
    matchScore: 82,
    matchLabel: '高度匹配',
    tag: '推荐',
    jd: {
      专业要求: '计算机科学或相关专业硕士学历',
      技能要求: '熟练掌握Java/Go，熟悉MySQL优化、Redis缓存策略、消息队列，了解领域驱动设计(DDD)',
      经验要求: '有高并发场景开发经验，有O2O或LBS相关项目经验优先',
      素质要求: '数据驱动思维，较强的业务理解能力，能主动发现问题并推动解决'
    },
    dimensions: {
      专业匹配度: 90,
      技能适配度: 85,
      经历契合度: 78,
      软实力匹配度: 72
    },
    highlights: [
      'Java/Go技能匹配度高',
      '高并发项目经验符合要求',
      '北京地理位置完全匹配',
      '需了解O2O业务模式'
    ]
  },
  {
    id: 5,
    company: '华为',
    logo: '🌸',
    position: '软件开发工程师（云计算BU）',
    city: '深圳',
    salary: '20K-32K·14薪',
    industry: 'ICT',
    type: '校招',
    publishDate: '2026-05-24',
    matchScore: 78,
    matchLabel: '较高度匹配',
    tag: '可投递',
    jd: {
      专业要求: '计算机、通信、电子等相关专业硕士及以上',
      技能要求: '熟悉C/C++或Java或Python，了解云计算基础（IaaS/PaaS/SaaS），掌握Linux系统，有容器技术经验',
      经验要求: '有云计算或基础设施相关项目经验，有开源贡献优先',
      素质要求: '具备系统性思维，有较强的抗压能力和自驱力'
    },
    dimensions: {
      专业匹配度: 85,
      技能适配度: 78,
      经历契合度: 72,
      软实力匹配度: 75
    },
    highlights: [
      'Docker/K8s技能符合云方向',
      'Python/Java技能覆盖岗位需求',
      '需补充C++和底层系统知识',
      '云计算领域经验相对薄弱'
    ]
  },
  {
    id: 6,
    company: '百度',
    logo: '🐾',
    position: '后端研发工程师（搜索架构）',
    city: '北京',
    salary: '20K-32K·16薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-23',
    matchScore: 75,
    matchLabel: '较高度匹配',
    tag: '可投递',
    jd: {
      专业要求: '计算机相关专业硕士以上学历',
      技能要求: '精通C++或Java，深入理解数据结构和算法，熟悉分布式存储和计算框架，有大规模数据处理经验',
      经验要求: '有搜索引擎或信息检索相关项目经验，熟悉Lucene/Elasticsearch优先',
      素质要求: '扎实的计算机基础，钻研精神，对技术有极致追求'
    },
    dimensions: {
      专业匹配度: 88,
      技能适配度: 75,
      经历契合度: 68,
      软实力匹配度: 70
    },
    highlights: [
      '计算机基础扎实，学历匹配',
      'Java技能可迁移至C++场景',
      '需补充搜索/检索领域知识',
      '大规模数据处理经验不足'
    ]
  },
  {
    id: 7,
    company: '京东',
    logo: '🐶',
    position: 'Java开发工程师（物流技术）',
    city: '北京',
    salary: '18K-30K·14薪',
    industry: '互联网/物流',
    type: '校招',
    publishDate: '2026-05-22',
    matchScore: 72,
    matchLabel: '中度匹配',
    tag: '可投递',
    jd: {
      专业要求: '计算机、软件工程等相关专业本科及以上',
      技能要求: '熟练掌握Java及Spring Boot、MyBatis，熟悉MySQL和Redis，了解消息队列和微服务，有物流或供应链系统经验优先',
      经验要求: '有企业级应用开发经验，熟悉敏捷开发流程',
      素质要求: '较强的逻辑分析和问题解决能力，良好的团队合作精神'
    },
    dimensions: {
      专业匹配度: 82,
      技能适配度: 80,
      经历契合度: 65,
      软实力匹配度: 62
    },
    highlights: [
      'Java+Spring技术栈完全匹配',
      '技能要求偏低，竞争力强',
      '物流行业领域知识需学习',
      '薪资区间略低于期望'
    ]
  },
  {
    id: 8,
    company: '小红书',
    logo: '📕',
    position: '后端开发工程师（社区技术）',
    city: '上海',
    salary: '22K-35K·15薪',
    industry: '互联网',
    type: '校招',
    publishDate: '2026-05-20',
    matchScore: 70,
    matchLabel: '中度匹配',
    tag: '可投递',
    jd: {
      专业要求: '计算机相关专业硕士学历',
      技能要求: '精通Go或Java，熟悉推荐系统或Feed流架构，有内容平台或社区产品开发经验，了解NLP基础',
      经验要求: '有推荐系统或内容分发系统开发经验',
      素质要求: '对社区产品有热情，用户导向思维，数据敏感度高'
    },
    dimensions: {
      专业匹配度: 80,
      技能适配度: 72,
      经历契合度: 68,
      软实力匹配度: 60
    },
    highlights: [
      'Go/Java技术栈匹配',
      '推荐系统实习经历相关',
      '需补充NLP和内容领域知识',
      '上海工作地点符合期望'
    ]
  },
  {
    id: 9,
    company: '中国银行',
    logo: '🏦',
    position: '软件开发工程师（数字化转型）',
    city: '北京',
    salary: '15K-25K·13薪',
    industry: '金融/国企',
    type: '校招',
    publishDate: '2026-05-18',
    matchScore: 65,
    matchLabel: '中度匹配',
    tag: '可考虑',
    jd: {
      专业要求: '计算机、软件工程等相关专业本科及以上',
      技能要求: '熟悉Java或Python，掌握数据库基础，了解Spring框架，有良好的代码规范意识',
      经验要求: '有金融系统或企业信息系统项目经验优先',
      素质要求: '严谨细致的工作态度，良好的沟通协调能力，对金融科技有兴趣'
    },
    dimensions: {
      专业匹配度: 75,
      技能适配度: 70,
      经历契合度: 55,
      软实力匹配度: 58
    },
    highlights: [
      '技术栈完全覆盖，能力超配',
      '北京工作，稳定性高',
      '薪资偏低，技术成长空间有限',
      '国企文化需适应'
    ]
  },
  {
    id: 10,
    company: '国家电网',
    logo: '⚡',
    position: '信息技术工程师（数字化部）',
    city: '北京',
    salary: '12K-22K·13薪',
    industry: '能源/国企',
    type: '校招',
    publishDate: '2026-05-15',
    matchScore: 60,
    matchLabel: '低度匹配',
    tag: '备选',
    jd: {
      专业要求: '计算机、电子信息等相关专业本科及以上',
      技能要求: '掌握Java或Python开发，了解数据库基础操作，有信息系统或数据管理项目经验',
      经验要求: '有信息化项目经验，了解电力行业优先',
      素质要求: '责任心强，工作稳定，有较好的文字表达能力'
    },
    dimensions: {
      专业匹配度: 70,
      技能适配度: 65,
      经历契合度: 50,
      软实力匹配度: 55
    },
    highlights: [
      '学历和专业远超岗位要求',
      '北京户口优势',
      '技术成长空间非常有限',
      '薪资远低于期望区间'
    ]
  }
];

// ==================== 简历诊断详情（以字节跳动岗位为例） ====================
const DIAGNOSIS_DETAIL = {
  overallScore: 92,
  grade: 'A',
  gradeLabel: '优秀',
  summary: '您的简历与字节跳动后端开发工程师岗位匹配度极高（92分）。您的学历背景、技术栈和实习经历均与该岗位高度契合，尤其在分布式系统和高并发开发方面具有显著优势。建议在面试中重点突出字节跳动实习经历和分布式系统项目经验。',
  dimensions: {
    student: [95, 93, 90, 88],
    requirement: [90, 90, 85, 80]
  },
  strengths: [
    { title: '学历背景突出', detail: '清华大学计算机硕士，满足岗位对学历的高要求' },
    { title: '核心技能全覆盖', detail: 'Go/Python/Java/MySQL/Redis/Docker等岗位核心技术栈全面覆盖' },
    { title: '实习经历高度相关', detail: '字节跳动后端开发实习经历，熟悉公司技术栈和研发流程' },
    { title: '分布式系统经验', detail: '有实际的分布式爬虫和微服务项目开发经验' }
  ],
  weaknesses: [
    { title: '消息队列深度', detail: '对Kafka/RocketMQ等消息队列的高级特性理解不够深入，建议补充消息可靠性和顺序性相关知识', severity: 'medium' },
    { title: '系统设计深度', detail: '大规模分布式系统的容量规划和容灾设计经验较为欠缺，建议学习相关案例', severity: 'low' },
    { title: '监控运维知识', detail: '对Prometheus、Grafana等监控体系和SRE理念了解不足', severity: 'low' }
  ],
  keywordGaps: [
    { keyword: 'Kafka', importance: 'high', suggestion: '在项目描述中补充消息队列的使用场景' },
    { keyword: '微服务治理', importance: 'medium', suggestion: '突出Spring Cloud微服务项目的治理细节' },
    { keyword: '性能优化', importance: 'medium', suggestion: '量化展示实习期间的性能优化成果' }
  ]
};

// ==================== 简历优化建议 ====================
const OPTIMIZATION_SUGGESTIONS = {
  before: `个人经历

字节跳动 | 后端开发实习生 | 2024.06-2024.09
- 参与抖音电商推荐系统后端开发工作
- 使用Go语言开发微服务接口
- 对数据库查询进行了优化
- 参与了一些技术文档的编写工作

项目经历
微服务电商平台 | 项目负责人
- 基于Spring Cloud Alibaba开发电商平台
- 包含用户、商品、订单等模块
- 使用MySQL和Redis存储数据`,
  after: `个人经历

字节跳动 | 后端开发实习生 | 2024.06-2024.09
- 主导抖音电商推荐系统核心接口开发，使用Go语言构建高并发微服务，
  日均处理请求量超过5000万次，接口P99延迟控制在50ms以内
- 设计并落地「热点商品缓存预热」方案，采用Redis Cluster+Caffeine
  两级缓存架构，将数据库查询QPS降低60%，平均响应时间从120ms降至8ms
- 独立编写系统架构设计文档3篇，参与5次跨团队技术评审，
  推动制定API设计规范，被团队采纳为开发标准
- 与产品、算法团队紧密协作，将推荐策略上线周期从2周缩短至3天

项目经历
微服务电商平台 | 项目负责人（4人团队）
- 基于Spring Cloud Alibaba + Kubernetes 构建分布式电商平台，
  实现服务注册发现、配置中心、Gateway网关、Sentinel熔断限流等
  完整微服务治理能力，系统支持1000+ TPS并发访问
- 设计MySQL分库分表+Redis缓存+Canal数据同步的数据架构方案，
  支撑日均10万+订单数据的实时查询与分析
- 搭建ELK日志收集+Prometheus+Grafana监控体系，
  实现全链路追踪和实时告警，系统可用性达到99.9%`,
  suggestions: [
    {
      category: '关键词植入',
      items: [
        { before: '参与...开发工作', after: '主导...核心接口开发', reason: '「主导」比「参与」更能体现owner意识，符合大厂HR筛选关键词' },
        { before: '对数据库查询进行了优化', after: '将数据库查询QPS降低60%', reason: '量化成果是简历中最重要的说服力来源，用数据替代模糊描述' },
        { before: '使用Go语言开发微服务接口', after: '日均处理请求量超过5000万次，P99延迟50ms', reason: '补充业务规模和性能指标，展示高并发系统能力' }
      ]
    },
    {
      category: '经历重构',
      items: [
        { before: '参与了一些技术文档的编写工作', after: '独立编写系统架构设计文档3篇...被团队采纳为开发标准', reason: '将模糊的文档工作转化为具体成果，展示技术影响力和规范意识' },
        { before: '包含用户、商品、订单等模块', after: '实现服务注册发现、配置中心...完整微服务治理能力', reason: '用技术术语替代业务描述，展示架构设计深度' }
      ]
    },
    {
      category: '内容侧重点调整',
      items: [
        { before: '使用MySQL和Redis存储数据', after: '设计MySQL分库分表+Redis缓存+Canal同步的数据架构方案', reason: '从简单使用升级为架构设计，展示方案设计和选型能力' },
        { before: '（缺少监控运维内容）', after: '搭建ELK+Prometheus+Grafana监控体系，系统可用性99.9%', reason: '补充监控运维能力，这是后端开发的核心竞争力之一' }
      ]
    },
    {
      category: '冗余删减',
      items: [
        { before: '基于Spring Cloud Alibaba开发电商平台', after: '基于Spring Cloud Alibaba + Kubernetes构建分布式电商平台', reason: '补充Kubernetes关键词，同时保留了Spring Cloud Alibaba的技术标签' },
        { before: '参与了一些技术文档的编写工作', after: '（改为具体的文档成果描述）', reason: '模糊的「一些」和「编写工作」无法体现任何能力，必须具体化或删除' }
      ]
    }
  ]
};

// ==================== 历史记录数据 ====================
const HISTORY_RECORDS = [
  { date: '2026-06-02', action: '简历优化', detail: '针对字节跳动岗位完成第3次简历优化', result: '匹配分从87提升至92' },
  { date: '2026-06-01', action: '岗位匹配', detail: '新增5个互联网行业岗位匹配结果', result: '发现2个高匹配岗位' },
  { date: '2026-05-30', action: '简历诊断', detail: '对腾讯后台开发岗位进行诊断', result: '综合得分88分，A级' },
  { date: '2026-05-29', action: '画像更新', detail: '更新技能标签，新增Kubernetes和Go', result: '技能维度匹配分提升5%' },
  { date: '2026-05-28', action: '简历优化', detail: '针对阿里巴巴岗位完成第2次简历优化', result: '匹配分从78提升至85' },
  { date: '2026-05-26', action: '岗位匹配', detail: '完成首批10个岗位智能匹配', result: '6个岗位匹配度超过70%' },
  { date: '2026-05-25', action: '简历诊断', detail: '对字节跳动岗位进行首次诊断', result: '综合得分87分，B+级' },
  { date: '2026-05-24', action: '简历优化', detail: '完成首次简历全面优化', result: '整体匹配分平均提升8%' },
  { date: '2026-05-23', action: '画像构建', detail: '上传简历，AI自动构建求职画像', result: '提取12项技能标签' },
  { date: '2026-05-22', action: '注册', detail: '注册AI求职智能匹配账号', result: '-' }
];

// ==================== 统计数据 ====================
const STATISTICS = {
  totalApplications: 28,
  matchRate: 76,
  optimizationCount: 8,
  averageScore: 79,
  scoreTrend: [
    { date: '5月22日', score: 68 },
    { date: '5月24日', score: 72 },
    { date: '5月26日', score: 75 },
    { date: '5月28日', score: 78 },
    { date: '5月30日', score: 82 },
    { date: '6月1日', score: 85 },
    { date: '6月2日', score: 88 }
  ],
  industryDistribution: [
    { name: '互联网', value: 16, color: '#4A90D9' },
    { name: '人工智能', value: 4, color: '#7B68EE' },
    { name: '金融/国企', value: 4, color: '#F5A623' },
    { name: 'ICT', value: 2, color: '#E96D5A' },
    { name: '能源', value: 2, color: '#50C878' }
  ],
  skillImprovement: {
    before: [68, 72, 65, 60, 55, 70, 50, 62, 58, 75, 70, 72],
    after: [85, 88, 78, 82, 78, 80, 72, 72, 65, 82, 78, 82]
  },
  skillLabels: ['Python', 'Java', 'Go', 'MySQL', 'Redis', 'Docker', 'K8s', 'ML', 'TF', '系统设计', 'Linux', 'Git']
};
