# 🤝 Contributing to Unbiased AI

Thank you for your interest in contributing! Please follow these guidelines.

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `dev` | Active development |
| `feature/xxx` | New features |
| `fix/xxx` | Bug fixes |

## Workflow

1. Fork the repo and create your branch from `dev`
2. For a new feature: `git checkout -b feature/your-feature-name`
3. Make your changes and write clear commit messages
4. Open a Pull Request against `dev`

## Commit Message Format

```
type(scope): short description

Examples:
feat(bias-engine): add Equal Opportunity Difference metric
fix(gemini): handle empty API response gracefully
docs(readme): update deployment steps
```

## Code Style

- **Python**: Follow PEP8. Use `black` for formatting.
- **TypeScript/Next.js**: Follow ESLint + Prettier config.

## Environment Variables

Never commit `.env`, `serviceAccountKey.json`, or any secrets. Use `.env.example` as a template.
