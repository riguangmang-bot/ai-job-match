/**
 * AI求职智能匹配智能体 - ECharts 图表配置
 */

// 通用配色
const CHART_COLORS = {
  primary: '#4A6CF7',
  secondary: '#7B68EE',
  accent: '#00C9A7',
  warning: '#F5A623',
  danger: '#E96D5A',
  blue: '#4A90D9',
  green: '#50C878',
  orange: '#F5A623',
  red: '#E96D5A'
};

// ==================== 1. 诊断雷达图 ====================
function initDiagnosisRadar(domId, studentData, requirementData) {
  const chart = echarts.init(document.getElementById(domId));
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
      formatter: function(p) {
        return `<strong>${p.name}</strong><br/>${p.seriesName}: ${p.value}分`;
      }
    },
    legend: {
      bottom: 0,
      data: ['你的得分', '岗位要求'],
      textStyle: { fontSize: 13 },
      itemWidth: 12,
      itemHeight: 12
    },
    radar: {
      center: ['50%', '48%'],
      radius: '65%',
      indicator: [
        { name: '专业匹配度', max: 100 },
        { name: '技能适配度', max: 100 },
        { name: '经历契合度', max: 100 },
        { name: '软实力匹配度', max: 100 }
      ],
      axisName: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: 500
      },
      splitArea: {
        areaStyle: { color: ['#F8FAFC', '#F1F5F9'] }
      }
    },
    series: [{
      type: 'radar',
      name: '你的得分',
      data: [{ value: studentData, name: '你的得分' }],
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: CHART_COLORS.primary, width: 2.5 },
      areaStyle: { color: 'rgba(74,108,247,0.15)' },
      itemStyle: { color: CHART_COLORS.primary, borderColor: '#fff', borderWidth: 2 }
    }, {
      type: 'radar',
      name: '岗位要求',
      data: [{ value: requirementData, name: '岗位要求' }],
      symbol: 'diamond',
      symbolSize: 6,
      lineStyle: { color: CHART_COLORS.warning, width: 2.5, type: 'dashed' },
      areaStyle: { color: 'rgba(245,166,35,0.08)' },
      itemStyle: { color: CHART_COLORS.warning, borderColor: '#fff', borderWidth: 2 }
    }]
  });
  return chart;
}

// ==================== 2. 匹配分数趋势折线图 ====================
function initScoreTrend(domId, data) {
  const chart = echarts.init(document.getElementById(domId));
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
      formatter: function(params) {
        return `<strong>${params[0].axisValue}</strong><br/>匹配分: <b style="color:#4A6CF7">${params[0].value}分</b>`;
      }
    },
    grid: { left: 10, right: 30, top: 15, bottom: 10, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      interval: 10,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      axisLabel: { color: '#94A3B8', fontSize: 12 }
    },
    series: [{
      type: 'line',
      data: data.map(d => d.score),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: CHART_COLORS.primary, width: 3 },
      itemStyle: {
        color: CHART_COLORS.primary,
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(74,108,247,0.25)' },
          { offset: 1, color: 'rgba(74,108,247,0.02)' }
        ])
      },
      markLine: {
        silent: true,
        data: [{ yAxis: 85, name: '优秀线', label: { formatter: '优秀线 85' } }],
        lineStyle: { color: CHART_COLORS.accent, type: 'dashed', width: 1.5 },
        label: { fontSize: 11, color: CHART_COLORS.accent }
      }
    }]
  });
  return chart;
}

// ==================== 3. 行业分布饼图 ====================
function initIndustryPie(domId, data) {
  const chart = echarts.init(document.getElementById(domId));
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' },
      formatter: '{b}: {c}个岗位 ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12, color: '#64748B' },
      itemWidth: 10,
      itemHeight: 10
    },
    series: [{
      type: 'pie',
      radius: ['52%', '78%'],
      center: ['50%', '46%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        fontSize: 11,
        color: '#64748B'
      },
      emphasis: {
        label: { fontSize: 16, fontWeight: 'bold' },
        scaleSize: 10
      },
      data: data.map(d => ({
        value: d.value,
        name: d.name,
        itemStyle: { color: d.color }
      }))
    }]
  });
  return chart;
}

// ==================== 4. 技能提升雷达图 ====================
function initSkillRadar(domId, beforeData, afterData, labels) {
  const chart = echarts.init(document.getElementById(domId));
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E2E8F0',
      textStyle: { color: '#1E293B' }
    },
    legend: {
      bottom: 0,
      data: ['优化前', '优化后'],
      textStyle: { fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12
    },
    radar: {
      center: ['50%', '45%'],
      radius: '60%',
      indicator: labels.slice(0, 8).map(l => ({ name: l, max: 100 })),
      axisName: { color: '#64748B', fontSize: 11, fontWeight: 500 },
      splitArea: { areaStyle: { color: ['#F8FAFC', '#F1F5F9'] } }
    },
    series: [{
      type: 'radar',
      name: '优化前',
      data: [{ value: beforeData.slice(0, 8), name: '优化前' }],
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: CHART_COLORS.danger, width: 2 },
      areaStyle: { color: 'rgba(233,109,90,0.15)' },
      itemStyle: { color: CHART_COLORS.danger, borderColor: '#fff', borderWidth: 2 }
    }, {
      type: 'radar',
      name: '优化后',
      data: [{ value: afterData.slice(0, 8), name: '优化后' }],
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: CHART_COLORS.accent, width: 2 },
      areaStyle: { color: 'rgba(0,201,167,0.2)' },
      itemStyle: { color: CHART_COLORS.accent, borderColor: '#fff', borderWidth: 2 }
    }]
  });
  return chart;
}
