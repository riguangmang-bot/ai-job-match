/**
 * AI求职智能匹配智能体 Demo - 主逻辑
 */

// ==================== 全局状态 ====================
const APP_STATE = {
  profileParsed: false,
  isRealProfile: false,          // 是否真实上传的简历
  extractedProfile: null,         // 真实提取的数据
  adjustedJobs: null,             // 基于真实数据调整后的岗位
  selectedJobId: null,
  filterIndustry: 'all',
  filterCity: 'all',
  filterType: 'all',
  charts: {}
};

// ==================== DOM Ready ====================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initUploadZone();
  initFilters();
  initJobCards();
  initDetailModal();
  initOptimizationTabs();
  initDashboard();
  initScrollReveal();
});

// ==================== 导航 ====================
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const mobileLinks = document.querySelectorAll('.nav-mobile-overlay a');
  const sections = document.querySelectorAll('section[id]');
  const navToggle = document.getElementById('navToggle');
  const mobileOverlay = document.getElementById('navMobileOverlay');

  // 滚动高亮
  function updateActiveLink() {
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 100;
      if (window.scrollY >= top) current = s.getAttribute('id');
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
    mobileLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActiveLink);

  // 桌面导航平滑滚动
  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // 汉堡菜单开关
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
  });

  // 移动端导航点击后关闭菜单
  mobileLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        navToggle.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 点击菜单外关闭
  mobileOverlay.addEventListener('click', e => {
    if (e.target === mobileOverlay) {
      navToggle.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // CTA按钮
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ==================== 简历上传 ====================
function initUploadZone() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const demoBtn = document.getElementById('useDemoData');

  // 点击上传区域
  uploadZone.addEventListener('click', () => {
    if (!APP_STATE.profileParsed) fileInput.click();
  });

  // 拖拽上传
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary)';
    uploadZone.style.background = 'var(--primary-light)';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && !APP_STATE.profileParsed) processFile(file);
  });

  // 文件选择
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) processFile(file);
  });

  // Demo数据按钮
  demoBtn.addEventListener('click', () => {
    if (APP_STATE.profileParsed) return;
    simulateParsingDemo();
  });
}

function processFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showToast('⚠️ 文件过大，请选择小于10MB的文件');
    return;
  }

  const ext = file.name.split('.').pop().toLowerCase();
  showParsingOverlay(file.name);

  if (ext === 'txt') {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      finishParsingWithText(text, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  } else if (ext === 'docx') {
    const reader = new FileReader();
    reader.onload = e => {
      const arrayBuffer = e.target.result;
      mammoth.extractRawText({ arrayBuffer }).then(result => {
        finishParsingWithText(result.value, file.name);
      }).catch(() => {
        showToast('⚠️ Word文档解析失败，请尝试TXT格式');
        hideParsingOverlay();
      });
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'pdf') {
    // 配置 pdf.js worker（只需配置一次）
    if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
    const reader = new FileReader();
    reader.onload = e => {
      const typedArray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument({ data: typedArray }).promise.then(pdf => {
        let fullText = '';
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pages.push(pdf.getPage(i).then(page => {
            return page.getTextContent().then(content => {
              // 智能拼接: 单汉字不加空格，英文单词保留空格
              const chars = [];
              content.items.forEach(item => {
                const s = item.str;
                if (!s) return;
                const prev = chars[chars.length - 1];
                // 如果前后都是单汉字/中文标点，不加空格
                if (prev && /^[一-鿿　-〿＀-￯]$/.test(prev) && /^[一-鿿　-〿＀-￯]$/.test(s)) {
                  chars.push(s);
                } else if (prev && !prev.endsWith(' ') && !s.startsWith(' ')) {
                  chars.push(' ' + s);
                } else {
                  chars.push(s);
                }
              });
              fullText += chars.join('') + '\n';
            });
          }));
        }
        return Promise.all(pages).then(() => {
          if (fullText.trim().length < 10) {
            showToast('⚠️ PDF内容过短，可能是扫描件或图片型PDF，请尝试DOCX/TXT格式');
            hideParsingOverlay();
          } else {
            finishParsingWithText(fullText, file.name);
          }
        });
      }).catch(err => {
        console.error('PDF parse error:', err);
        showToast('⚠️ PDF解析失败（可能是加密或扫描件），请尝试TXT或DOCX格式');
        hideParsingOverlay();
      });
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'doc') {
    showToast('⚠️ 旧版.doc格式暂不支持，请另存为.docx或TXT后重试');
    hideParsingOverlay();
  } else {
    showToast('⚠️ 不支持的文件格式，请上传 PDF/Word/TXT');
    hideParsingOverlay();
  }
}

function showParsingOverlay(fileName) {
  const overlay = document.getElementById('parsingOverlay');
  const uploadZone = document.getElementById('uploadZone');
  overlay.classList.add('active');
  uploadZone.style.opacity = '0.5';
  uploadZone.style.pointerEvents = 'none';

  // 更新步骤详情
  const steps = overlay.querySelectorAll('.parsing-step');
  steps.forEach(s => { s.classList.remove('active', 'done'); s.querySelector('.step-icon').innerHTML = s.querySelector('.step-icon').dataset.num || '1'; });
  steps[0].querySelector('.step-detail').textContent = `正在读取 ${fileName} ...`;
  steps[0].classList.add('active');
}

function finishParsingWithText(text, fileName) {
  const overlay = document.getElementById('parsingOverlay');
  const steps = overlay.querySelectorAll('.parsing-step');

  // 步骤1完成
  steps[0].classList.remove('active'); steps[0].classList.add('done');
  steps[0].querySelector('.step-icon').innerHTML = '✓';
  steps[0].querySelector('.step-detail').textContent = `已读取 ${fileName}（${text.length}字符）`;

  // 步骤2
  setTimeout(() => {
    steps[1].classList.add('active');
    steps[1].querySelector('.step-detail').textContent = '提取教育背景、技能标签、实习经历...';
  }, 600);
  setTimeout(() => {
    steps[1].classList.remove('active'); steps[1].classList.add('done');
    steps[1].querySelector('.step-icon').innerHTML = '✓';
  }, 1800);

  // 步骤3
  setTimeout(() => {
    steps[2].classList.add('active');
    steps[2].querySelector('.step-detail').textContent = '构建个人专属求职画像...';
  }, 2000);
  setTimeout(() => {
    steps[2].classList.remove('active'); steps[2].classList.add('done');
    steps[2].querySelector('.step-icon').innerHTML = '✓';
  }, 3000);

  // 完成
  setTimeout(() => {
    overlay.classList.remove('active');
    const extracted = renderProfileCardFromText(text);
    applyProfileToMatching(extracted);
    APP_STATE.profileParsed = true;
    renderJobList();  // 用真实数据重新渲染岗位
    updateDiagnosisWithProfile(extracted);
    showToast('✅ 简历解析完成！岗位匹配已同步更新');
  }, 3400);
}

function hideParsingOverlay() {
  const overlay = document.getElementById('parsingOverlay');
  const uploadZone = document.getElementById('uploadZone');
  overlay.classList.remove('active');
  uploadZone.style.opacity = '';
  uploadZone.style.pointerEvents = '';
}

// Demo模拟数据（保留原功能）
function simulateParsingDemo() {
  showParsingOverlay('Demo简历.pdf');
  const overlay = document.getElementById('parsingOverlay');
  const steps = overlay.querySelectorAll('.parsing-step');

  steps[0].querySelector('.step-detail').textContent = '正在识别文档格式与内容结构...';
  steps[1].querySelector('.step-detail').textContent = '提取教育背景、技能标签、实习经历...';
  steps[2].querySelector('.step-detail').textContent = '构建个人专属求职画像...';

  [200, 1500, 2800].forEach((delay, i) => {
    setTimeout(() => { steps[i].classList.add('active'); }, delay);
    setTimeout(() => { steps[i].classList.remove('active'); steps[i].classList.add('done'); steps[i].querySelector('.step-icon').innerHTML = '✓'; }, delay + 1000);
  });

  setTimeout(() => {
    overlay.classList.remove('active');
    renderProfileCard();
    APP_STATE.profileParsed = true;
    APP_STATE.isRealProfile = false;
    APP_STATE.adjustedJobs = null;
    APP_STATE.extractedProfile = null;
    renderJobList();  // 恢复原始Demo数据
    initDiagnosisPage();  // 恢复原始诊断数据
    showToast('✅ Demo数据已加载');
  }, 4000);
}

// 将提取的真实简历数据应用到岗位匹配系统
function applyProfileToMatching(extracted) {
  const profile = extracted;
  const adjusted = JOB_LIST.map(job => {
    // 深拷贝岗位数据
    const adj = JSON.parse(JSON.stringify(job));

    // --- 重新计算四维匹配分 ---
    // 专业匹配度：基于学历
    const degreeMap = { '博士': 100, '硕士': 88, '本科': 75, '专科': 60 };
    const reqDegree = job.jd['专业要求'] || '';
    const userDegree = profile.degree || '本科';
    let degreeScore = degreeMap[userDegree] || 75;
    if (reqDegree.includes('博士') && userDegree !== '博士') degreeScore = Math.min(degreeScore, 70);
    if (reqDegree.includes('硕士') && userDegree === '本科') degreeScore = Math.min(degreeScore, 75);

    // 学校加成
    let schoolBonus = 0;
    const school = profile.school || '';
    if (/清华|北大|浙大|上海交大|中科大|复旦|南大|哈工大|西安交大|华科|武大|同济|北航|北理|中山|东南|天津|南开|厦门|国科大/i.test(school)) {
      schoolBonus = 8;
    } else if (/大学|学院/i.test(school)) {
      schoolBonus = 3;
    }

    // 技能适配度
    const userSkills = (profile.skills || []).map(s => (s.name || s).toLowerCase());
    const jdSkills = job.jd['技能要求'].toLowerCase();
    let skillHits = 0;
    let skillTotal = 0;
    const techKeywords = ['python', 'java', 'go', 'golang', 'c\\+\\+', 'rust', 'javascript', 'typescript',
      'sql', 'mysql', 'postgresql', 'redis', 'mongodb', 'docker', 'kubernetes', 'k8s', 'linux',
      'git', 'spring', 'springboot', 'mybatis', 'react', 'vue', 'node', 'tensorflow', 'pytorch',
      'machine learning', '深度学习', 'nlp', 'spark', 'hadoop', 'kafka', 'rabbitmq', 'nginx',
      '分布式', '微服务', '高并发', '消息队列', 'elasticsearch'];
    techKeywords.forEach(k => {
      if (jdSkills.includes(k)) {
        skillTotal++;
        if (userSkills.some(us => us.includes(k) || k.includes(us))) skillHits++;
      }
    });
    const skillScore = skillTotal > 0 ? Math.round((skillHits / skillTotal) * 100) : 70;
    const adjustedSkillScore = Math.min(100, Math.max(40, skillScore));

    // 经历契合度：基于检测到的公司
    let expBonus = 0;
    if (profile.internshipDetected && profile.internshipDetected.length > 0) {
      expBonus = 8;
      const bigTech = ['字节跳动', '腾讯', '阿里巴巴', '阿里', '百度', '美团', '京东', '华为', '小米', '网易', '快手'];
      const hasBigTech = profile.internshipDetected.some(s => bigTech.some(b => s.includes(b)));
      if (hasBigTech) expBonus = 15;
    }

    // 重新计算各维度
    adj.dimensions = {
      专业匹配度: Math.min(100, degreeScore + schoolBonus),
      技能适配度: adjustedSkillScore,
      经历契合度: Math.min(100, 55 + expBonus),
      软实力匹配度: Math.min(100, 60 + (profile.internshipDetected ? 15 : 5) + (profile.skills && profile.skills.length > 5 ? 10 : 0))
    };

    // 重新计算总分
    const weights = { 专业匹配度: 0.30, 技能适配度: 0.30, 经历契合度: 0.25, 软实力匹配度: 0.15 };
    adj.matchScore = Math.round(
      Object.entries(adj.dimensions).reduce((sum, [k, v]) => sum + v * (weights[k] || 0.25), 0)
    );

    // 更新匹配标签
    if (adj.matchScore >= 85) { adj.matchLabel = '极高匹配'; adj.tag = '强烈推荐'; }
    else if (adj.matchScore >= 75) { adj.matchLabel = '高度匹配'; adj.tag = '推荐'; }
    else if (adj.matchScore >= 65) { adj.matchLabel = '中度匹配'; adj.tag = '可投递'; }
    else { adj.matchLabel = '低度匹配'; adj.tag = '备选'; }

    // --- 重新生成匹配亮点 ---
    const hl = [];
    if (profile.degree) {
      const degOk = (reqDegree.includes('硕士') && profile.degree === '硕士') ||
                    (reqDegree.includes('博士') && profile.degree === '博士');
      if (degOk) hl.push(`${profile.degree}学历与岗位要求高度匹配`);
      else if (reqDegree.includes('硕士') && profile.degree === '本科') {
        hl.push('学历为本科，建议通过实习/项目经验弥补硕士学历差距');
      } else if (reqDegree.includes('硕士及以上') && profile.degree === '硕士') {
        hl.push(`${profile.degree}学历满足岗位基本要求`);
      }
    }
    if (profile.school) hl.push(`${profile.school}计算机专业背景`);
    if (adjustedSkillScore >= 80) {
      const matchedSkills = techKeywords.filter(k => userSkills.some(us => us.includes(k) || k.includes(us))).slice(0, 4);
      if (matchedSkills.length > 0) hl.push(`核心技能覆盖: ${matchedSkills.join('、')}`);
    } else {
      hl.push(`技能匹配度${adjustedSkillScore}%，建议补充岗位要求的关键技术栈`);
    }
    if (profile.internshipDetected && profile.internshipDetected.length > 0) {
      hl.push(`有${profile.internshipDetected.length}段实习/项目经历`);
    } else {
      hl.push('建议增加相关实习或项目经验');
    }
    adj.highlights = hl;

    return adj;
  });

  // 按新分数排序
  adjusted.sort((a, b) => b.matchScore - a.matchScore);
  APP_STATE.adjustedJobs = adjusted;
  APP_STATE.isRealProfile = true;
  APP_STATE.extractedProfile = profile;

  // 同步 Hero 卡片
  updateHeroCards(adjusted);
}

// 更新 Hero 区域的三张匹配度卡片
function updateHeroCards(jobs) {
  if (!jobs || jobs.length < 3) return;
  const top3 = jobs.slice(0, 3);
  for (let i = 0; i < 3; i++) {
    const job = top3[i];
    const scoreEl = document.getElementById('heroScore' + (i + 1));
    const companyEl = document.getElementById('heroCompany' + (i + 1));
    const tagEl = document.getElementById('heroTag' + (i + 1));
    const dimsEl = document.getElementById('heroDims' + (i + 1));
    if (scoreEl) scoreEl.textContent = job.matchScore + '%';
    if (companyEl) companyEl.textContent = job.company + ' · ' + job.position;
    if (tagEl) {
      const tagText = job.matchScore >= 85 ? '✅ 极高匹配' : job.matchScore >= 75 ? '👍 高度匹配' : '📋 中度匹配';
      const tagColor = job.matchScore >= 85 ? 'var(--accent)' : job.matchScore >= 75 ? 'var(--primary)' : 'var(--warning)';
      tagEl.textContent = tagText;
      tagEl.style.color = tagColor;
    }
    if (dimsEl) {
      const dims = job.dimensions;
      dimsEl.innerHTML = `
        <span class="tag tag-primary">专业 ${dims.专业匹配度 || dims['专业匹配度']}</span>
        <span class="tag tag-accent">技能 ${dims.技能适配度 || dims['技能适配度']}</span>
      `;
    }
  }
}

// 基于真实解析文本生成画像
function renderProfileCardFromText(text) {
  const extracted = extractInfoFromText(text);
  renderProfileCardReal(extracted, text);
  return extracted;
}

function extractInfoFromText(text) {
  const result = {};
  const lines = text.split('\n').filter(l => l.trim());
  const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 1);

  // --- 姓名 ---
  // 辅助函数: 从字符串中提取中文名（处理PDF空格问题）
  function tryExtractChineseName(str) {
    const compact = str.replace(/\s+/g, '');
    const clean = compact.replace(/^(姓名|名字|我是|我叫|本人)\s*[：:]*\s*/i, '');
    const m = clean.match(/[一-鿿]{2,4}/);
    if (m) return m[0];
    const m2 = clean.match(/[一-鿿]{1,2}·[一-鿿]{1,3}/);
    if (m2) return m2[0];
    return null;
  }

  // 标签行检测：排除简历模板中的字段名
  function isLabelLine(str) {
    const compact = str.replace(/\s+/g, '');
    const labels = /^(姓名|性别|年龄|民族|籍贯|电话|邮箱|毕业院校|学历|专业|学校|住址|地址|出生日期|政治面貌|身高|体重|QQ|微信|网址|英语等级|外语水平|证书|求职意向|期望薪资|到岗时间)$/i;
    if (labels.test(compact)) return true;
    return false;
  }

  // 策略1: 找到"姓名"标签行，提取同一行或下一行的名字
  for (let i = 0; i < cleanLines.length; i++) {
    const l = cleanLines[i];
    const compact = l.replace(/\s+/g, '');
    if (/姓名/.test(compact)) {
      // 先用正则直接从紧凑文本中提取 "姓名+2~3汉字"（优先2-3字，避免吞入后续标签）
      let nameMatch = compact.match(/姓名([一-鿿]{2,3})(?:民族|性别|电话|邮箱|出生|政治|籍贯|学历|毕业|求职|[A-Za-z\d])/);
      if (!nameMatch) nameMatch = compact.match(/姓名([一-鿿]{2,3})/);
      if (nameMatch && nameMatch[1] && nameMatch[1] !== '姓名' && nameMatch[1] !== '民族' && nameMatch[1] !== '性别') {
        result.name = nameMatch[1]; break;
      }
      // 同行去标签提取
      const remainder = compact.replace(/^.*?姓名[：:]*\s*/, '');
      if (remainder && remainder.length >= 2 && remainder.length <= 6 && remainder !== compact) {
        const nameInLine = tryExtractChineseName(remainder);
        if (nameInLine && nameInLine !== '姓名') { result.name = nameInLine; break; }
      }
      // 下一行
      if (i + 1 < cleanLines.length && !isLabelLine(cleanLines[i + 1])) {
        const nameNext = tryExtractChineseName(cleanLines[i + 1]);
        if (nameNext) { result.name = nameNext; break; }
      }
      if (!result.name && i + 2 < cleanLines.length && !isLabelLine(cleanLines[i + 2])) {
        const nameNext2 = tryExtractChineseName(cleanLines[i + 2]);
        if (nameNext2) { result.name = nameNext2; break; }
      }
    }
  }

  // 策略2: 前几行中查找可能是名字的纯中文片段（排除标签行）
  if (!result.name) {
    for (let i = 0; i < Math.min(10, cleanLines.length); i++) {
      const l = cleanLines[i];
      // PDF经常把整篇内容合并成一行（>200字），此时不应跳过
      const isLongLine = l.length > 200;
      if (!isLongLine && isLabelLine(l)) continue;
      if (!isLongLine && /简历|个人|联系|电话|邮箱|地址|求职|应聘|RESUME|CV|籍贯|民族|出生|教育|经历|项目|技能|实习|工作/i.test(l)) continue;
      if (/^[A-Za-z\s\d]{3,}$/.test(l)) continue;
      const name = tryExtractChineseName(l);
      if (name && name.length >= 2 && name.length <= 4 && name !== '姓名') {
        result.name = name;
        break;
      }
    }
  }

  // 策略3: "我是/我叫 xxx" 模式
  if (!result.name) {
    const selfIntroLine = cleanLines.find(l => /我是|我叫|本人/.test(l));
    if (selfIntroLine) {
      const name = tryExtractChineseName(selfIntroLine);
      if (name && name !== '姓名') result.name = name;
    }
  }

  // 策略5（PDF兜底）: 全文压缩后搜索 "姓名XX"（2-3字优先，后跟标签则截断）
  if (!result.name) {
    const compactFull = text.replace(/\s+/g, '');
    let m = compactFull.match(/姓名([一-鿿]{2,3})(?:民族|性别|电话|邮箱|出生|政治|籍贯|学历|毕业|求职|[A-Za-z\d]|$)/);
    if (!m) m = compactFull.match(/姓名([一-鿿]{2,3})/);
    if (m && m[1] && m[1].length >= 2 && m[1] !== '姓名' && m[1] !== '民族' && m[1] !== '性别') result.name = m[1];
  }

  // 策略6（PDF终极兜底）: 全文搜索"个人简历"后面可能的姓名
  if (!result.name) {
    const compactFull = text.replace(/\s+/g, '');
    let m = compactFull.match(/个人简历([一-鿿]{2,3})(?:民族|性别|电话|邮箱|出生|政治|籍贯|学历|毕业|求职|[A-Za-z\d]|$)/);
    if (!m) m = compactFull.match(/个人简历([一-鿿]{2,3})/);
    if (m && m[1] && m[1].length >= 2) result.name = m[1];
  }

  // --- 学校 ---
  for (const l of cleanLines) {
    const m = l.match(/([一-鿿]{2,6}(大学|学院)[^\s，,]*)/);
    if (m) { result.school = m[1]; break; }
  }

  // --- 专业 ---
  const majorKw = ['计算机科学与技术', '计算机科学', '软件工程', '人工智能', '数据科学', '大数据',
    '电子信息工程', '通信工程', '自动化', '信息安全', '网络工程', '物联网', '数学与应用数学', '统计学'];
  for (const l of cleanLines) {
    for (const k of majorKw) {
      if (l.includes(k)) { result.major = k; break; }
    }
    if (result.major) break;
  }

  // --- 学历 ---
  if (/博士|Ph\.?D/i.test(text)) result.degree = '博士';
  else if (/硕士|研究生|Master/i.test(text)) result.degree = '硕士';
  else if (/本科|学士|Bachelor|B\.S\.|B\.A\./i.test(text)) result.degree = '本科';
  else if (/专科|大专/i.test(text)) result.degree = '专科';

  // --- 毕业年份 ---
  const gradMatch = text.match(/(20\d{2})[\s.]*[届年毕]/);
  if (gradMatch) result.graduateYear = gradMatch[1] + '届';

  // --- 技能 ---
  const skillKw = ['Python', 'Java', 'C++', 'C语言', 'Go', 'Golang', 'Rust', 'JavaScript', 'JS', 'TypeScript', 'TS',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'K8s', 'Linux', 'Unix',
    'Git', 'Spring', 'SpringBoot', 'MyBatis', 'Hibernate', 'React', 'Vue', 'Vue.js', 'Angular',
    'Node', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'TensorFlow', 'PyTorch', 'Keras',
    'Machine Learning', '深度学习', 'NLP', '自然语言处理', '计算机视觉', 'CV', '数据分析', '数据挖掘',
    'Spark', 'Hadoop', 'Kafka', 'RabbitMQ', 'Nginx', 'AWS', 'Azure', 'GCP', '微服务', '分布式',
    'HTML', 'CSS', 'Sass', 'Webpack', 'Vite', '小程序', 'Flutter', 'Swift', 'Kotlin'];
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();
  skillKw.forEach(s => {
    if (lowerText.includes(s.toLowerCase())) foundSkills.add(s);
  });
  if (foundSkills.size > 0) {
    result.skills = [...foundSkills].slice(0, 15).map(s => ({ name: s, level: 80 }));
  }

  // --- 邮箱 ---
  const emailM = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailM) result.email = emailM[1];

  // --- 手机号 ---
  const phoneM = text.match(/(1[3-9]\d)\s*-?\s*(\d{4})\s*-?\s*(\d{4})/);
  if (phoneM) result.phone = phoneM[1] + '****' + phoneM[3];

  // --- 实习经历（尝试提取公司名） ---
  const companyKw = ['字节跳动', '腾讯', '阿里巴巴', '阿里', '百度', '美团', '京东', '华为', '小米',
    '网易', '快手', '拼多多', '滴滴', '哔哩哔哩', 'B站', '小红书', '携程', '商汤', '旷视',
    '微软', 'Google', '谷歌', 'Amazon', '亚马逊', 'Apple', '苹果', 'Meta', 'IBM', 'Intel'];
  for (const kw of companyKw) {
    if (text.includes(kw)) {
      // 尝试提取公司附近的职位描述
      const idx = text.indexOf(kw);
      const snippet = text.slice(idx, idx + 60).replace(/\n/g, ' ');
      result.internshipDetected = (result.internshipDetected || []);
      result.internshipDetected.push(snippet);
    }
  }

  // --- 求职意向 ---
  const citiesFound = [];
  ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '苏州'].forEach(c => {
    if (text.includes(c)) citiesFound.push(c);
  });
  if (citiesFound.length > 0) {
    result.targetCities = citiesFound.slice(0, 3);
  }

  return result;
}

// 原始Demo画像（完整模拟数据，供Demo按钮使用）
function renderProfileCard() {
  const profile = STUDENT_PROFILE;
  const card = document.getElementById('profileCard');
  card.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${profile.name[0]}</div>
      <div class="profile-info">
        <h3>${profile.name} <span class="tag tag-primary">${profile.graduateYear}</span></h3>
        <div class="school">${profile.school} · ${profile.major} · ${profile.degree}</div>
        <div class="basic">
          <span>📧 ${profile.email}</span>
          <span>📱 ${profile.phone}</span>
          <span>📊 GPA ${profile.gpa}</span>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h4>🛠 技能标签</h4>
      <div class="skills-cloud">
        ${profile.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
      </div>
    </div>
    <div class="profile-section">
      <h4>💼 实习经历</h4>
      <div class="experience-card">
        <div class="exp-header">
          <span class="role">${profile.internship.company} · ${profile.internship.position}</span>
          <span class="duration">${profile.internship.duration}</span>
        </div>
        <div class="exp-desc">${profile.internship.description}</div>
      </div>
    </div>
    <div class="profile-section">
      <h4>📂 项目经历</h4>
      ${profile.projects.map(p => `
        <div class="experience-card">
          <div class="exp-header">
            <span class="role">${p.name}</span>
            <span class="duration">${p.role}</span>
          </div>
          <div class="exp-desc">${p.description}</div>
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
            ${p.tech.map(t => `<span class="tag tag-primary" style="font-size:0.7rem;">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="profile-section">
      <h4>🎯 求职意向</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${profile.preference.targetPositions.map(p => `<span class="tag tag-accent">${p}</span>`).join('')}
        <span style="color:var(--text-light);font-size:0.88rem;">
          📍 ${profile.preference.targetCities.join(' / ')} &nbsp;|&nbsp; 💰 ${profile.preference.salaryRange}
        </span>
      </div>
    </div>
  `;
  card.classList.add('active');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 基于真实上传简历生成画像（不混入Demo数据）
function renderProfileCardReal(extracted, rawText) {
  const card = document.getElementById('profileCard');
  const name = extracted.name || '未识别';
  const avatarChar = extracted.name ? extracted.name[0] : '?';

  let html = `
    <div class="profile-header">
      <div class="profile-avatar" style="background:linear-gradient(135deg,var(--accent),#00B894);">${avatarChar}</div>
      <div class="profile-info">
        <h3>${name} ${extracted.graduateYear ? '<span class="tag tag-primary">' + extracted.graduateYear + '</span>' : ''}</h3>
        <div class="school">${extracted.school || '🏫 学校未识别'} · ${extracted.major || '📚 专业未识别'} · ${extracted.degree || '🎓 学历未识别'}</div>
        <div class="basic">
          ${extracted.email ? '<span>📧 ' + extracted.email + '</span>' : ''}
          ${extracted.phone ? '<span>📱 ' + extracted.phone + '</span>' : ''}
        </div>
      </div>
    </div>`;

  // 技能标签
  if (extracted.skills && extracted.skills.length > 0) {
    html += `
    <div class="profile-section">
      <h4>🛠 AI提取技能（${extracted.skills.length}项）</h4>
      <div class="skills-cloud">
        ${extracted.skills.map(s => `<span class="skill-tag">${s.name || s}</span>`).join('')}
      </div>
    </div>`;
  }

  // 检测到的实习公司
  if (extracted.internshipDetected && extracted.internshipDetected.length > 0) {
    html += `
    <div class="profile-section">
      <h4>💼 检测到的经历线索</h4>
      ${extracted.internshipDetected.slice(0, 5).map(s => `
        <div class="experience-card">
          <div class="exp-desc">...${escapeHtml(s)}...</div>
        </div>
      `).join('')}
    </div>`;
  }

  // 简历原文
  html += `
    <div class="profile-section">
      <h4>📋 简历原文</h4>
      <div class="experience-card">
        <div class="exp-desc" style="max-height:250px;overflow-y:auto;white-space:pre-wrap;font-size:0.82rem;line-height:1.7;">${escapeHtml(rawText.slice(0, 2000))}${rawText.length > 2000 ? '\n\n…(已截断，完整内容已读取)' : ''}</div>
      </div>
    </div>`;

  // 求职意向（如果能检测到）
  if (extracted.targetCities && extracted.targetCities.length > 0) {
    html += `
    <div class="profile-section">
      <h4>🎯 检测到的意向城市</h4>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${extracted.targetCities.map(c => `<span class="tag tag-accent">📍 ${c}</span>`).join('')}
      </div>
    </div>`;
  }

  // 如果解析质量很低，给出提示
  if (!extracted.name && !extracted.school && (!extracted.skills || extracted.skills.length < 2)) {
    html += `
    <div class="experience-card" style="background:var(--warning-light);border-left:3px solid var(--warning);margin-top:16px;">
      <div class="exp-desc" style="color:#C17D0A;">
        ⚠️ 自动解析信息较少，建议检查简历格式：<br>
        1. 确保简历中包含明确的"姓名"、"学校"、"专业"等字段<br>
        2. PDF文件可能因格式问题解析不完整，尝试TXT或DOCX格式<br>
        3. 也可使用"Demo模拟数据"体验完整功能
      </div>
    </div>`;
  }

  card.innerHTML = html;
  card.classList.add('active');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== 岗位筛选与渲染 ====================
function initFilters() {
  const selects = document.querySelectorAll('#matching .filter-select');
  selects.forEach(s => {
    s.addEventListener('change', () => {
      APP_STATE.filterIndustry = document.getElementById('filterIndustry').value;
      APP_STATE.filterCity = document.getElementById('filterCity').value;
      APP_STATE.filterType = document.getElementById('filterType').value;
      renderJobList();
    });
  });
}

function initJobCards() {
  renderJobList();
}

function renderJobList() {
  const container = document.getElementById('jobList');
  // 真实简历用调整后的数据，Demo用原始数据
  const source = (APP_STATE.isRealProfile && APP_STATE.adjustedJobs) ? APP_STATE.adjustedJobs : JOB_LIST;
  let jobs = [...source];

  // 筛选
  if (APP_STATE.filterIndustry !== 'all') {
    jobs = jobs.filter(j => j.industry === APP_STATE.filterIndustry);
  }
  if (APP_STATE.filterCity !== 'all') {
    jobs = jobs.filter(j => j.city === APP_STATE.filterCity);
  }

  // 排序：按匹配分降序
  jobs.sort((a, b) => b.matchScore - a.matchScore);

  // 更新统计
  const highMatch = jobs.filter(j => j.matchScore >= 80).length;
  document.getElementById('totalJobs').textContent = jobs.length;
  document.getElementById('highMatchCount').textContent = highMatch;
  document.getElementById('avgMatchScore').textContent =
    jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length) : 0;

  // 渲染
  container.innerHTML = jobs.map(job => renderJobCard(job)).join('');

  // 绑定点击事件
  container.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('click', () => {
      const jobId = parseInt(card.dataset.jobId);
      openDetailModal(jobId);
    });
  });

  // 延迟动画
  container.querySelectorAll('.job-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

function renderJobCard(job) {
  const scoreClass = job.matchScore >= 85 ? 'high' : job.matchScore >= 75 ? 'good' : 'ok';
  const recommendedClass = job.matchScore >= 85 ? 'recommended' : '';

  return `
    <div class="job-card ${recommendedClass}" data-job-id="${job.id}">
      <div class="job-card-header">
        <div class="job-company">
          <span class="logo">${job.logo}</span>
          <div>
            <h4>${job.company}</h4>
            <div class="pos">${job.position}</div>
          </div>
        </div>
        <div class="job-score">
          <div class="score-circle ${scoreClass}">
            <span class="score-num">${job.matchScore}</span>
            <span class="score-unit">分</span>
          </div>
          <div style="font-size:0.7rem;color:var(--text-light);margin-top:2px;">${job.matchLabel}</div>
        </div>
      </div>
      <div class="job-meta">
        <span>📍 ${job.city}</span>
        <span>💰 ${job.salary}</span>
        <span>📌 ${job.industry}</span>
        <span>📋 ${job.type}</span>
      </div>
      <div class="job-dims">
        ${Object.entries(job.dimensions).map(([k, v]) => {
          const barClass = v >= 85 ? 'high' : v >= 75 ? 'good' : v >= 65 ? 'ok' : 'low';
          return `
            <div class="dim-item">
              <span class="dim-label">${k.replace('度','')}</span>
              <div class="dim-bar"><div class="dim-fill ${barClass}" style="width:${v}%"></div></div>
              <span style="font-size:0.72rem;color:var(--text-light);">${v}</span>
            </div>
          `;
        }).join('')}
      </div>
      <ul class="job-highlights">
        ${job.highlights.slice(0, 2).map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
  `;
}

// ==================== 详情弹窗 ====================
function initDetailModal() {
  const modal = document.getElementById('detailModal');
  document.getElementById('modalClose').addEventListener('click', () => {
    modal.classList.remove('active');
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });
  // ESC关闭
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
}

function openDetailModal(jobId) {
  const job = JOB_LIST.find(j => j.id === jobId);
  if (!job) return;

  APP_STATE.selectedJobId = jobId;
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('modalContent');

  const scoreClass = job.matchScore >= 85 ? 'high' : job.matchScore >= 75 ? 'good' : 'ok';

  content.innerHTML = `
    <h3>${job.company} - ${job.position}</h3>
    <p class="modal-subtitle">📍 ${job.city} · 💰 ${job.salary} · 📌 ${job.industry} · 📋 ${job.type}</p>

    <div class="overall-score-display">
      <div class="big-score">${job.matchScore}</div>
      <div class="score-info">
        <h5><span class="tag tag-grade-a">A级</span> ${job.matchLabel}</h5>
        <p>综合加权匹配得分：专业30% | 技能30% | 经历25% | 软实力15%</p>
      </div>
    </div>

    <h4 style="margin-bottom:8px;">📋 岗位JD要求</h4>
    ${Object.entries(job.jd).map(([k, v]) => `
      <div class="jd-section">
        <div class="jd-label">${k}</div>
        <div class="jd-text">${v}</div>
      </div>
    `).join('')}

    <h4 style="margin-bottom:8px;">📊 四维匹配分析</h4>
    ${Object.entries(job.dimensions).map(([k, v]) => {
      const barClass = v >= 85 ? 'high' : v >= 75 ? 'good' : v >= 65 ? 'ok' : 'low';
      return `
        <div style="margin-bottom:10px;display:flex;align-items:center;gap:12px;">
          <span style="width:90px;font-size:0.85rem;font-weight:500;">${k}</span>
          <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div class="dim-fill ${barClass}" style="width:${v}%;height:100%;"></div>
          </div>
          <span style="font-size:0.85rem;font-weight:600;color:${v>=85?'var(--accent)':v>=75?'var(--primary)':v>=65?'var(--warning)':'var(--danger)'};">${v}分</span>
        </div>
      `;
    }).join('')}

    <h4 style="margin-bottom:8px;">✅ 匹配亮点</h4>
    <ul style="list-style:disc;padding-left:20px;">
      ${job.highlights.map(h => `<li style="margin-bottom:4px;font-size:0.9rem;color:var(--text-secondary);">${h}</li>`).join('')}
    </ul>
  `;

  modal.classList.add('active');
}

// ==================== 简历优化对比 ====================
function initOptimizationTabs() {
  // 默认渲染优化内容
  renderOptimizationComparison();
  renderOptimizationSuggestions();
}

function renderOptimizationComparison() {
  const beforePanel = document.getElementById('beforeResume');
  const afterPanel = document.getElementById('afterResume');

  // 简单高亮处理
  const beforeText = OPTIMIZATION_SUGGESTIONS.before;
  const afterText = OPTIMIZATION_SUGGESTIONS.after;

  beforePanel.innerHTML = `<div class="compare-content">${escapeHtml(beforeText)}</div>`;
  afterPanel.innerHTML = `<div class="compare-content">${highlightChanges(beforeText, afterText)}</div>`;
}

function highlightChanges(before, after) {
  // 简化版：展示优化后文本（在Demo中用颜色标注差异）
  const lines = after.split('\n');
  return lines.map(line => {
    // 标记包含量化数据的行
    if (/\d+/.test(line) && (line.includes('QPS') || line.includes('ms') || line.includes('万') || line.includes('%') || line.includes('99.9'))) {
      return `<span class="add">${escapeHtml(line)}</span>`;
    }
    return escapeHtml(line);
  }).join('\n');
}

function renderOptimizationSuggestions() {
  const container = document.getElementById('suggestionsList');
  const suggestions = OPTIMIZATION_SUGGESTIONS.suggestions;

  container.innerHTML = suggestions.map(cat => `
    <div class="suggestion-category">
      <h5>${cat.category}</h5>
      ${cat.items.map(item => `
        <div class="suggestion-item">
          <div class="si-before">${item.before}</div>
          <div class="si-after">${item.after}</div>
          <div class="si-reason">💡 ${item.reason}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ==================== 数据复盘 Dashboard ====================
function initDashboard() {
  // 统计卡片
  document.getElementById('statApplications').textContent = STATISTICS.totalApplications;
  document.getElementById('statMatchRate').textContent = STATISTICS.matchRate + '%';
  document.getElementById('statOptCount').textContent = STATISTICS.optimizationCount;
  document.getElementById('statAvgScore').textContent = STATISTICS.averageScore;

  // 图表
  APP_STATE.charts.scoreTrend = initScoreTrend('chartScoreTrend', STATISTICS.scoreTrend);
  APP_STATE.charts.industryPie = initIndustryPie('chartIndustry', STATISTICS.industryDistribution);
  APP_STATE.charts.skillRadar = initSkillRadar(
    'chartSkillRadar',
    STATISTICS.skillImprovement.before,
    STATISTICS.skillImprovement.after,
    STATISTICS.skillLabels
  );

  // 历史记录表
  renderHistoryTable();

  // 响应式重绘
  window.addEventListener('resize', () => {
    Object.values(APP_STATE.charts).forEach(c => c && c.resize());
  });
}

function renderHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = HISTORY_RECORDS.map(r => `
    <tr>
      <td>${r.date}</td>
      <td><span class="tag tag-primary">${r.action}</span></td>
      <td>${r.detail}</td>
      <td style="color:var(--accent);font-weight:500;">${r.result}</td>
    </tr>
  `).join('');
}

// ==================== 诊断页初始化 ====================
function initDiagnosisPage() {
  // 以字节跳动岗位为默认诊断对象
  const detail = DIAGNOSIS_DETAIL;

  // 雷达图
  const radarDom = document.getElementById('diagnosisRadar');
  if (radarDom) {
    APP_STATE.charts.diagnosisRadar = initDiagnosisRadar(
      'diagnosisRadar',
      detail.dimensions.student,
      detail.dimensions.requirement
    );
  }

  // 分数
  const scoreEl = document.getElementById('diagnosisOverallScore');
  if (scoreEl) scoreEl.textContent = detail.overallScore;

  // 等级
  const gradeEl = document.getElementById('diagnosisGrade');
  if (gradeEl) {
    gradeEl.textContent = detail.gradeLabel;
    gradeEl.className = `tag tag-grade tag-grade-${detail.grade.toLowerCase()}`;
  }

  // 摘要
  const summaryEl = document.getElementById('diagnosisSummary');
  if (summaryEl) summaryEl.textContent = detail.summary;

  // 优势
  const strengthsEl = document.getElementById('diagnosisStrengths');
  if (strengthsEl) {
    strengthsEl.innerHTML = detail.strengths.map(s => `
      <div class="weakness-item" style="border-left-color:var(--accent);">
        <div class="w-title" style="color:var(--accent);">✅ ${s.title}</div>
        <div class="w-detail">${s.detail}</div>
      </div>
    `).join('');
  }

  // 短板
  const weaknessesEl = document.getElementById('diagnosisWeaknesses');
  if (weaknessesEl) {
    weaknessesEl.innerHTML = detail.weaknesses.map(w => `
      <div class="weakness-item severity-${w.severity}">
        <div class="w-title">⚠️ ${w.title}</div>
        <div class="w-detail">${w.detail}</div>
      </div>
    `).join('');
  }

  // 关键词
  const keywordsEl = document.getElementById('diagnosisKeywords');
  if (keywordsEl) {
    keywordsEl.innerHTML = detail.keywordGaps.map(g => `
      <div class="gap-item">
        <span>🔑 <strong>${g.keyword}</strong> <span class="tag tag-warning" style="font-size:0.7rem;">${g.importance === 'high' ? '高优先级' : '中优先级'}</span></span>
        <span class="gap-suggestion">→ ${g.suggestion}</span>
      </div>
    `).join('');
  }

  // 岗位选择按钮
  document.querySelectorAll('.job-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const jobId = parseInt(btn.dataset.jobId);
      const job = JOB_LIST.find(j => j.id === jobId);
      if (job) {
        document.getElementById('selectedJobName').textContent = `${job.company} - ${job.position}`;
        document.getElementById('selectedJobJD').textContent = job.jd.技能要求;
        // 更新诊断数据（Demo中用同一个数据集，实际会根据不同岗位变化）
        updateDiagnosisForJob(job);
      }
    });
  });
}

// 用真实简历数据更新诊断（全局更新）
function updateDiagnosisWithProfile(extracted) {
  // 更新诊断摘要
  const summaryEl = document.getElementById('diagnosisSummary');
  if (summaryEl && extracted) {
    const name = extracted.name || '您';
    const degree = extracted.degree || '未知';
    const school = extracted.school || '未知院校';
    const skillCount = (extracted.skills || []).length;
    summaryEl.textContent = `${name}（${school}，${degree}），AI已基于您的真实简历重新计算所有岗位匹配分数。共提取${skillCount}项技能标签，请查看下方更新后的匹配分析。`;
  }

  // 选择最佳匹配岗位更新雷达图
  if (APP_STATE.adjustedJobs && APP_STATE.adjustedJobs.length > 0) {
    updateDiagnosisForJob(APP_STATE.adjustedJobs[0]);
  }
}

function updateDiagnosisForJob(job) {
  const dims = Object.values(job.dimensions);
  const student = Object.values(job.dimensions);

  const requirement = [Math.min(dims[0] + 8, 100), Math.min(dims[1] + 10, 100), Math.min(dims[2] + 12, 100), Math.min(dims[3] + 10, 100)];

  if (APP_STATE.charts.diagnosisRadar) {
    APP_STATE.charts.diagnosisRadar.setOption({
      series: [
        { data: [{ value: student }] },
        { data: [{ value: requirement }] }
      ]
    });
  }

  document.getElementById('diagnosisOverallScore').textContent = job.matchScore;
  const grade = job.matchScore >= 90 ? 'A' : job.matchScore >= 80 ? 'A' : job.matchScore >= 70 ? 'B' : 'C';
  const gradeLabel = job.matchScore >= 85 ? '优秀' : job.matchScore >= 75 ? '良好' : job.matchScore >= 65 ? '中等' : '待提升';
  const gradeEl = document.getElementById('diagnosisGrade');
  gradeEl.textContent = gradeLabel;
  gradeEl.className = `tag tag-grade tag-grade-${grade.toLowerCase()}`;

  // 更新岗位名称
  const nameEl = document.getElementById('selectedJobName');
  if (nameEl) nameEl.textContent = `${job.company} - ${job.position}`;

  // 更新JD
  const jdEl = document.getElementById('selectedJobJD');
  if (jdEl) jdEl.textContent = job.jd['技能要求'];

  // 更新亮点
  const strengthsEl = document.getElementById('diagnosisStrengths');
  if (strengthsEl && job.highlights) {
    strengthsEl.innerHTML = job.highlights.slice(0, 4).map(h => `
      <div class="weakness-item" style="border-left-color:var(--accent);">
        <div class="w-title" style="color:var(--accent);">✅ ${h}</div>
      </div>
    `).join('');
  }
}

// ==================== 滚动动画 ====================
function initScrollReveal() {
  // 首次加载时初始化诊断页
  setTimeout(initDiagnosisPage, 500);
}

// ==================== Toast ====================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== 工具函数 ====================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
