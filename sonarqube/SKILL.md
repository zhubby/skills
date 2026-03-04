---
name: sonarqube
description: Run SonarQube code quality checks and generate actionable reports. Use when users ask to install/configure/use SonarScanner for NPM (`@sonar/scan`), run project scans, fetch scan results via SonarQube Web API, and analyze code quality, defects, and prioritized remediation suggestions.
---

# SonarQube

Use this skill to execute an end-to-end SonarQube workflow for JavaScript/TypeScript or other npm-managed projects.

## Quick workflow

1. Confirm prerequisites.
2. Configure scanner parameters.
3. Run scan.
4. Pull results by API.
5. Output quality assessment and fix plan.

## 1) Confirm prerequisites

- Require Node.js `>=18.20.0`.
- Ensure SonarQube server URL and token are available.
- Keep these values ready:
  - `SONAR_HOST_URL`
  - `SONAR_TOKEN`
  - `SONAR_PROJECT_KEY`

For doc-backed scanner behavior and parameter patterns, read:
- [references/npm-scanner-workflow.md](references/npm-scanner-workflow.md)

## 2) Configure scanner parameters

Prefer environment variables plus explicit CLI overrides:

```bash
export SONAR_HOST_URL="http://localhost:9000"
export SONAR_TOKEN="<token>"
export SONAR_PROJECT_KEY="my_project"
```

Run scanner with required keys:

```bash
npx @sonar/scan \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.token="$SONAR_TOKEN" \
  -Dsonar.projectKey="$SONAR_PROJECT_KEY"
```

If needed, add project-scoped parameters such as:
- `-Dsonar.sources=src`
- `-Dsonar.exclusions=**/*.spec.ts`
- `-Dsonar.tests=src`

## 3) Run scan

Choose one:

- One-off run: `npx @sonar/scan`
- Installed dependency:

```bash
npm i -D @sonar/scan
npx sonar -Dsonar.projectKey="$SONAR_PROJECT_KEY"
```

After scan, keep `.scannerwork/report-task.txt` (default path). The reporting script reads it to resolve the final analysis task.

## 4) Pull scan results and produce report

Use bundled script:

```bash
node scripts/sonarqube_report.js \
  --host-url "$SONAR_HOST_URL" \
  --token "$SONAR_TOKEN" \
  --project-key "$SONAR_PROJECT_KEY" \
  --report-task .scannerwork/report-task.txt \
  --out sonarqube-report.md \
  --json-out sonarqube-report.json
```

Optional:
- `--branch <branch-name>`
- `--pull-request <pr-id>`
- `--max-issues 1000`
- `--page-size 500`
- `--timeout 180`

## 5) Analyze and deliver findings

When returning results to user, always include:

1. Quality Gate status and failed conditions.
2. Issue breakdown by severity and type.
3. Hotspot files and dominant rules.
4. Prioritized fix recommendations (security/reliability/maintainability).
5. Top issues to fix first (highest severity first).

Use this output structure:

```text
- Overall quality verdict (PASS/FAIL + reason)
- Defect summary (BUG/VULNERABILITY/CODE_SMELL + severities)
- Main risk hotspots (file/rule)
- Remediation plan (prioritized, concrete)
- Suggested verification after fixes (re-scan + gate check)
```

## Troubleshooting

- If scanner fails with auth errors, verify `SONAR_TOKEN` permissions.
- If API fetch fails, verify `SONAR_HOST_URL` and token validity.
- If no `report-task.txt` exists, still query by `projectKey` (and branch/PR if provided).
- If issue volume is large, limit via `--max-issues` and focus on BLOCKER/CRITICAL first.
