# Skills

A collection of skills for Claude Code to enhance productivity and automate common development tasks.

## Available Skills

### SonarQube

Run SonarQube code quality checks and generate actionable reports.

**Usage:** `/sonarqube`

This skill executes an end-to-end SonarQube workflow for JavaScript/TypeScript or other npm-managed projects:

- Configure and run SonarScanner
- Fetch scan results via SonarQube Web API
- Analyze code quality, defects, and generate prioritized remediation suggestions

**Quick Start:**

```bash
# Set environment variables
export SONAR_HOST_URL="http://localhost:9000"
export SONAR_TOKEN="<token>"
export SONAR_PROJECT_KEY="my_project"

# Run scan
npx @sonar/scan -Dsonar.host.url="$SONAR_HOST_URL" -Dsonar.token="$SONAR_TOKEN" -Dsonar.projectKey="$SONAR_PROJECT_KEY"

# Generate report
node scripts/sonarqube_report.js --host-url "$SONAR_HOST_URL" --token "$SONAR_TOKEN" --project-key "$SONAR_PROJECT_KEY"
```

See [skills/sonarqube/SKILL.md](skills/sonarqube/SKILL.md) for detailed documentation.

## License

MIT
