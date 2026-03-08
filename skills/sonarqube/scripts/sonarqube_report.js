#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const eqIdx = token.indexOf('=');
    if (eqIdx !== -1) {
      const key = token.slice(2, eqIdx);
      const value = token.slice(eqIdx + 1);
      args[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function readReportTask(reportTaskPath) {
  if (!reportTaskPath || !fs.existsSync(reportTaskPath)) return {};
  const text = fs.readFileSync(reportTaskPath, 'utf8');
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet({ hostUrl, token, pathName, query = {} }) {
  const url = new URL(pathName, hostUrl.endsWith('/') ? hostUrl : `${hostUrl}/`);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length > 0) url.searchParams.set(k, `${v}`);
  });

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const body = await res.text();
  let json;
  try {
    json = body ? JSON.parse(body) : {};
  } catch {
    throw new Error(`Invalid JSON from ${url.toString()}\n${body.slice(0, 400)}`);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url.toString()}\n${JSON.stringify(json).slice(0, 800)}`);
  }
  return json;
}

function pickNumericMeasure(measures, key) {
  const metric = measures.find((m) => m.metric === key);
  if (!metric || metric.value === undefined) return null;
  const value = Number(metric.value);
  return Number.isNaN(value) ? metric.value : value;
}

function severityRank(sev) {
  const order = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
  const idx = order.indexOf(sev || 'INFO');
  return idx === -1 ? order.length : idx;
}

function issueTypeRank(type) {
  const order = ['VULNERABILITY', 'BUG', 'CODE_SMELL'];
  const idx = order.indexOf(type || 'CODE_SMELL');
  return idx === -1 ? order.length : idx;
}

function summarizeIssues(issues) {
  const bySeverity = {};
  const byType = {};
  const byRule = {};
  const byFile = {};

  for (const issue of issues) {
    const sev = issue.severity || 'UNKNOWN';
    const type = issue.type || 'UNKNOWN';
    bySeverity[sev] = (bySeverity[sev] || 0) + 1;
    byType[type] = (byType[type] || 0) + 1;

    if (issue.rule) byRule[issue.rule] = (byRule[issue.rule] || 0) + 1;
    if (issue.component) byFile[issue.component] = (byFile[issue.component] || 0) + 1;
  }

  return {
    bySeverity,
    byType,
    topRules: Object.entries(byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    topFiles: Object.entries(byFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
  };
}

function buildRecommendations({ qualityGate, issues, issueSummary, measures }) {
  const recs = [];
  const status = qualityGate?.projectStatus?.status;

  if (status === 'ERROR') {
    recs.push('质量门禁未通过。优先修复门禁失败条件（通常是新增代码的可靠性/安全性/覆盖率）。');
  }

  const blocker = issueSummary.bySeverity.BLOCKER || 0;
  const critical = issueSummary.bySeverity.CRITICAL || 0;
  if (blocker + critical > 0) {
    recs.push('存在 BLOCKER/CRITICAL 级问题。将其作为发布阻断项，先修复再合并。');
  }

  const vulnCount = issueSummary.byType.VULNERABILITY || 0;
  if (vulnCount > 0) {
    recs.push('存在安全漏洞。优先处理输入校验、认证鉴权、敏感数据处理和注入风险。');
  }

  const bugCount = issueSummary.byType.BUG || 0;
  if (bugCount > 0) {
    recs.push('存在可靠性缺陷。对高频问题文件补充单元测试/回归测试并修复潜在空值、边界与异常处理问题。');
  }

  const smellCount = issueSummary.byType.CODE_SMELL || 0;
  if (smellCount > 0) {
    recs.push('存在可维护性问题。优先重构高复杂度函数，减少重复代码，统一命名和分层边界。');
  }

  const coverage = pickNumericMeasure(measures, 'coverage');
  if (typeof coverage === 'number' && coverage < 80) {
    recs.push(`测试覆盖率为 ${coverage.toFixed(2)}%，建议优先为核心路径补齐测试，目标 >= 80%。`);
  }

  const dup = pickNumericMeasure(measures, 'duplicated_lines_density');
  if (typeof dup === 'number' && dup > 5) {
    recs.push(`重复代码率为 ${dup.toFixed(2)}%，建议抽取公共函数或模块，减少复制粘贴实现。`);
  }

  const sorted = [...issues].sort((a, b) => {
    const s = severityRank(a.severity) - severityRank(b.severity);
    if (s !== 0) return s;
    const t = issueTypeRank(a.type) - issueTypeRank(b.type);
    if (t !== 0) return t;
    return 0;
  });

  const topIssues = sorted.slice(0, 5).map((issue) => {
    const line = issue.line ? `:${issue.line}` : '';
    return `- [${issue.severity || 'UNKNOWN'}][${issue.type || 'UNKNOWN'}] ${issue.component || 'unknown'}${line} - ${issue.message || 'no message'}`;
  });

  return { recs, topIssues };
}

function toMarkdown({
  projectKey,
  branch,
  pullRequest,
  ceTask,
  qualityGate,
  measures,
  issues,
  issueSummary,
  recommendations,
}) {
  const now = new Date().toISOString();
  const qg = qualityGate?.projectStatus || {};
  const conditions = Array.isArray(qg.conditions) ? qg.conditions : [];

  const lines = [];
  lines.push(`# SonarQube Quality Report`);
  lines.push('');
  lines.push(`- Generated at: ${now}`);
  lines.push(`- Project: ${projectKey}`);
  if (branch) lines.push(`- Branch: ${branch}`);
  if (pullRequest) lines.push(`- Pull Request: ${pullRequest}`);
  if (ceTask?.id) lines.push(`- CE Task: ${ceTask.id} (${ceTask.status || 'UNKNOWN'})`);
  lines.push('');

  lines.push('## Overall Quality');
  lines.push(`- Quality Gate: **${qg.status || 'UNKNOWN'}**`);
  if (qg.caycStatus) lines.push(`- CAYC Status: ${qg.caycStatus}`);
  lines.push(`- Open Issues: ${issues.length}`);
  lines.push('');

  if (conditions.length > 0) {
    lines.push('## Quality Gate Conditions');
    for (const c of conditions) {
      const actual = c.actualValue ?? 'N/A';
      const error = c.errorThreshold ?? 'N/A';
      lines.push(`- ${c.metricKey}: ${c.status} (actual: ${actual}, threshold: ${error})`);
    }
    lines.push('');
  }

  lines.push('## Measures');
  const preferredMetrics = [
    'alert_status',
    'bugs',
    'vulnerabilities',
    'code_smells',
    'coverage',
    'duplicated_lines_density',
    'ncloc',
    'reliability_rating',
    'security_rating',
    'sqale_rating',
    'maintainability_rating',
  ];

  for (const metric of preferredMetrics) {
    const m = measures.find((x) => x.metric === metric);
    if (m && m.value !== undefined) {
      lines.push(`- ${metric}: ${m.value}`);
    }
  }
  lines.push('');

  lines.push('## Issue Breakdown');
  lines.push(`- By Type: ${JSON.stringify(issueSummary.byType)}`);
  lines.push(`- By Severity: ${JSON.stringify(issueSummary.bySeverity)}`);
  lines.push('');

  if (issueSummary.topRules.length > 0) {
    lines.push('## Top Rules');
    for (const [rule, count] of issueSummary.topRules) {
      lines.push(`- ${rule}: ${count}`);
    }
    lines.push('');
  }

  if (issueSummary.topFiles.length > 0) {
    lines.push('## Hotspot Files');
    for (const [file, count] of issueSummary.topFiles) {
      lines.push(`- ${file}: ${count}`);
    }
    lines.push('');
  }

  lines.push('## Prioritized Fix Suggestions');
  if (recommendations.recs.length === 0) {
    lines.push('- 未发现明显质量风险，保持当前质量门禁与规则集。');
  } else {
    for (const rec of recommendations.recs) {
      lines.push(`- ${rec}`);
    }
  }
  lines.push('');

  if (recommendations.topIssues.length > 0) {
    lines.push('## Top Issues To Fix First');
    lines.push(...recommendations.topIssues);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv);

  const hostUrl = args['host-url'] || process.env.SONAR_HOST_URL;
  const token = args.token || process.env.SONAR_TOKEN;
  const projectKey = args['project-key'] || process.env.SONAR_PROJECT_KEY;
  const branch = args.branch || process.env.SONAR_BRANCH;
  const pullRequest = args['pull-request'] || process.env.SONAR_PULL_REQUEST;
  const reportTaskPath = args['report-task'] || path.join(process.cwd(), '.scannerwork', 'report-task.txt');
  const out = args.out || '';
  const jsonOut = args['json-out'] || '';
  const maxIssues = Number(args['max-issues'] || 1000);
  const pageSize = Math.min(Number(args['page-size'] || 500), 500);
  const timeoutSec = Number(args.timeout || 180);

  if (!hostUrl || !token || !projectKey) {
    throw new Error('Missing required args. Provide --host-url, --token, --project-key (or env SONAR_HOST_URL, SONAR_TOKEN, SONAR_PROJECT_KEY).');
  }

  const reportTask = readReportTask(reportTaskPath);
  const ceTaskIdFromFile = reportTask.ceTaskId || '';

  let ceTask = null;
  let analysisId = '';

  if (ceTaskIdFromFile) {
    const start = Date.now();
    while (true) {
      const ce = await apiGet({
        hostUrl,
        token,
        pathName: '/api/ce/task',
        query: { id: ceTaskIdFromFile },
      });

      ceTask = ce.task || null;
      const status = ceTask?.status;
      if (status === 'SUCCESS') {
        analysisId = ceTask.analysisId || '';
        break;
      }
      if (status === 'FAILED' || status === 'CANCELED') {
        throw new Error(`Compute Engine task ended with status ${status}. Task: ${JSON.stringify(ceTask)}`);
      }

      if (Date.now() - start > timeoutSec * 1000) {
        throw new Error(`Timeout waiting for CE task ${ceTaskIdFromFile} after ${timeoutSec}s.`);
      }
      await sleep(2000);
    }
  }

  const qgQuery = analysisId ? { analysisId } : { projectKey, branch, pullRequest };
  const qualityGate = await apiGet({
    hostUrl,
    token,
    pathName: '/api/qualitygates/project_status',
    query: qgQuery,
  });

  const metricKeys = [
    'alert_status',
    'bugs',
    'vulnerabilities',
    'code_smells',
    'coverage',
    'duplicated_lines_density',
    'ncloc',
    'reliability_rating',
    'security_rating',
    'sqale_rating',
    'maintainability_rating',
    'reliability_issues',
    'security_issues',
    'maintainability_issues',
  ].join(',');

  const measuresRes = await apiGet({
    hostUrl,
    token,
    pathName: '/api/measures/component',
    query: {
      component: projectKey,
      metricKeys,
      branch,
      pullRequest,
    },
  });
  const measures = measuresRes.component?.measures || [];

  const issues = [];
  let page = 1;
  while (issues.length < maxIssues) {
    const res = await apiGet({
      hostUrl,
      token,
      pathName: '/api/issues/search',
      query: {
        componentKeys: projectKey,
        branch,
        pullRequest,
        resolved: 'false',
        p: page,
        ps: pageSize,
        additionalFields: '_all',
      },
    });

    const batch = res.issues || [];
    issues.push(...batch);

    const paging = res.paging || {};
    const total = Number(paging.total || issues.length);
    if (issues.length >= total || batch.length === 0) break;
    page += 1;
  }

  const boundedIssues = issues.slice(0, maxIssues);
  const issueSummary = summarizeIssues(boundedIssues);
  const recommendations = buildRecommendations({
    qualityGate,
    issues: boundedIssues,
    issueSummary,
    measures,
  });

  const reportMarkdown = toMarkdown({
    projectKey,
    branch,
    pullRequest,
    ceTask,
    qualityGate,
    measures,
    issues: boundedIssues,
    issueSummary,
    recommendations,
  });

  if (out) {
    fs.writeFileSync(out, reportMarkdown, 'utf8');
  }

  if (jsonOut) {
    const payload = {
      projectKey,
      branch,
      pullRequest,
      ceTask,
      qualityGate,
      measures,
      issueCount: boundedIssues.length,
      issueSummary,
      recommendations,
      topIssues: boundedIssues.slice(0, 20),
      generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(jsonOut, JSON.stringify(payload, null, 2), 'utf8');
  }

  process.stdout.write(reportMarkdown);
}

main().catch((err) => {
  process.stderr.write(`[sonarqube_report] ${err.message}\n`);
  process.exit(1);
});
