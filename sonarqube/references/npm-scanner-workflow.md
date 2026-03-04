# SonarQube NPM Scanner Workflow (from official docs)

## 1. Installation baseline

- Use package `@sonar/scan` as the SonarScanner for NPM entrypoint.
- Require Node.js version `18.20.0+`.
- Recommended invocation patterns:
  - One-off: `npx @sonar/scan`
  - Local dependency: `npm i -D @sonar/scan` then `npx sonar`

## 2. Required analysis parameters

- `sonar.host.url`: SonarQube server URL.
- `sonar.token`: User token for authentication.
- `sonar.projectKey`: Project key in SonarQube.

Pass them by:

- CLI: `-Dsonar.host.url=...`
- Env vars: `SONAR_HOST_URL`, `SONAR_TOKEN`
- Config file (for example in `package.json` under `sonar` object)

## 3. Supported configuration locations

Practical order to resolve conflicts (highest to lowest):

1. CLI `-D...`
2. Scanner config in current run
3. Environment variables
4. Persisted project config (`package.json` sonar block or `sonar-project.properties`)
5. Server-side defaults

## 4. Example commands

- Minimal run:
  - `npx @sonar/scan -Dsonar.host.url=http://localhost:9000 -Dsonar.token=$SONAR_TOKEN -Dsonar.projectKey=my_project`
- With project sources and exclusions:
  - `npx @sonar/scan -Dsonar.projectKey=my_project -Dsonar.sources=src -Dsonar.exclusions=**/*.spec.ts`

## 5. Result retrieval after scan

After successful scan, inspect `.scannerwork/report-task.txt` and use SonarQube Web API to collect final results:

- Compute Engine task: `/api/ce/task?id=<ceTaskId>`
- Quality Gate: `/api/qualitygates/project_status?analysisId=<analysisId>`
- Issues: `/api/issues/search?componentKeys=<projectKey>&resolved=false`
- Metrics: `/api/measures/component?component=<projectKey>&metricKeys=...`

Use these endpoints to produce a final quality summary and prioritized remediation list.
