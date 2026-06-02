/**
 * AI求职智能匹配智能体 Demo - 主逻辑
 */

// ==================== 全局状态 ====================
const APP_STATE = {
  profileParsed: false,
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
  const parsingOverlay = document.getElementById('parsingOverlay');
  const profileCard = document.getElementById('profileCard');

  uploadZone.addEventListener('click', () => {
    if (APP_STATE.profileParsed) return;
    simulateParsing();
  });
}

function simulateParsing() {
  const overlay = document.getElementById('parsingOverlay');
  const steps = overlay.querySelectorAll('.parsing-step');
  const uploadZone = document.getElementById('uploadZone');

  overlay.classList.add('active');
  uploadZone.style.opacity = '0.5';
  uploadZone.style.pointerEvents = 'none';

  // 步骤动画序列
  const stepData = [
    { delay: 200, detail: '正在识别文档格式与内容结构...' },
    { delay: 1500, detail: '提取教育背景、技能标签、实习经历...' },
    { delay: 2800, detail: '构建个人专属求职画像...' }
  ];

  steps.forEach((step, i) => {
    step.classList.remove('active', 'done');
    setTimeout(() => {
      step.classList.add('active');
      step.querySelector('.step-detail').textContent = stepData[i].detail;
    }, stepData[i].delay);
    setTimeout(() => {
      step.classList.remove('active');
      step.classList.add('done');
      step.querySelector('.step-icon').innerHTML = '✓';
    }, stepData[i].delay + 1000);
  });

  // 完成后显示画像
  setTimeout(() => {
    overlay.classList.remove('active');
    renderProfileCard();
    APP_STATE.profileParsed = true;
    showToast('✅ AI解析完成！个人求职画像已构建');
  }, 4000);
}

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
  let jobs = [...JOB_LIST];

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

function updateDiagnosisForJob(job) {
  // 模拟更新：用岗位的实际维度数据
  const dims = Object.values(job.dimensions);
  const student = [95, 93, 90, 88]; // 学生数据不变
  const requirement = [Math.min(dims[0] + 5, 100), Math.min(dims[1] + 7, 100), Math.min(dims[2] + 10, 100), Math.min(dims[3] + 12, 100)];

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
