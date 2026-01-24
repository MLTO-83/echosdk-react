# Contributing to echosdk

Thank you for your interest in contributing to EchoSDK! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/echosdk-react.git
   cd echosdk-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test your changes**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add dark mode support
fix: resolve chat bubble positioning issue
docs: update README with new examples
```

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow existing code style
- Add screenshots for UI changes

## Testing

- Write unit tests for new features
- Maintain 80%+ code coverage
- Test in multiple browsers
- Test SSR compatibility (Next.js)

## Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add comments for complex logic

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── api/           # API client
├── utils/         # Utility functions
├── styles/        # CSS files
└── types/         # TypeScript types
```

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Join our Discord (coming soon)

Thank you for contributing! 🎉
