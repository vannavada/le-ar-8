# Contributing to Content Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/content-platform.git
   cd content-platform
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update tests as needed
- Update documentation

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update API documentation"
git commit -m "refactor: improve database query performance"
```

Commit types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template
5. Submit for review

## Pull Request Guidelines

### PR Title
Use conventional commit format:
- `feat: Add dark mode support`
- `fix: Resolve mobile navigation issue`

### PR Description
Include:
- **What** - What changes did you make?
- **Why** - Why are these changes necessary?
- **How** - How did you implement them?
- **Testing** - How did you test the changes?
- **Screenshots** - For UI changes

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

## Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions
- Use async/await instead of promises chains

### React/Next.js
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components under 200 lines
- Use TypeScript interfaces for props
- Follow Next.js file-based routing conventions

### CSS/Tailwind
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Mobile-first responsive design
- Maintain consistent spacing

### Database
- Use Prisma schema for all database changes
- Create migrations for schema changes
- Add indexes for frequently queried fields
- Write efficient queries

## Testing Guidelines

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Aim for >80% code coverage

### Integration Tests
- Test API endpoints
- Test database interactions
- Test authentication flows

### E2E Tests
- Test critical user journeys
- Test across different browsers
- Test mobile and desktop views

## Documentation

Update documentation when you:
- Add new features
- Change APIs
- Update configuration
- Modify deployment processes

Documentation locations:
- `README.md` - Project overview
- `docs/api.md` - API documentation
- `docs/deployment.md` - Deployment guide
- Code comments - Complex logic

## Performance Guidelines

- Optimize images (WebP, AVIF)
- Lazy load components
- Use React.memo for expensive components
- Minimize bundle size
- Profile before optimizing

## Security Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Sanitize data before database queries
- Use parameterized queries
- Keep dependencies updated
- Follow OWASP guidelines

## Database Changes

1. **Create Migration**
   ```bash
   npm run db:migrate:dev
   ```

2. **Update Schema**
   - Edit `packages/database/schema.prisma`
   - Run migration
   - Update types

3. **Seed Data**
   - Update seed script if needed
   - Test with fresh database

## Review Process

1. **Automated Checks**
   - Linting
   - Type checking
   - Unit tests
   - Build verification

2. **Code Review**
   - At least one approval required
   - Address all feedback
   - Update as requested

3. **Testing**
   - Manual testing by reviewer
   - Verify all test cases pass

4. **Merge**
   - Squash commits if multiple
   - Update changelog
   - Deploy to staging

## Release Process

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Deploy to production
5. Monitor for issues

## Getting Help

- **Discord** - Join our community server
- **GitHub Issues** - Report bugs or request features
- **Email** - support@yourplatform.com
- **Documentation** - Check `/docs` directory

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
