# Contributing to MedChain

We welcome contributions to the MedChain Healthcare Supply Chain Management System! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/medchain.git
   cd medchain
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up the database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming
- `feature/feature-name` - for new features
- `bugfix/bug-description` - for bug fixes
- `docs/documentation-update` - for documentation changes
- `refactor/component-name` - for code refactoring

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes**:
   ```bash
   npm run test
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional programming patterns

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Use React Query for data fetching

### Database
- Use Drizzle ORM for all database operations
- Follow the existing schema patterns
- Add proper foreign key relationships
- Use transactions for multi-table operations
- Add appropriate indexes for performance

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation with Zod
- Use role-based access control

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Code Review Process

1. **All contributions** must be submitted via Pull Request
2. **At least one review** is required before merging
3. **All tests** must pass
4. **Code coverage** should not decrease
5. **Documentation** must be updated if needed

## Areas for Contribution

### High Priority
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications system
- [ ] API rate limiting and caching
- [ ] Comprehensive test coverage

### Medium Priority
- [ ] Multi-language support (i18n)
- [ ] Advanced search and filtering
- [ ] Export functionality (PDF, CSV)
- [ ] Audit logging system
- [ ] Performance optimizations

### Low Priority
- [ ] Dark mode improvements
- [ ] Accessibility enhancements
- [ ] Code documentation
- [ ] Developer tooling
- [ ] CI/CD pipeline improvements

## Reporting Issues

### Bug Reports
When reporting bugs, please include:
- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node.js version)

### Feature Requests
When requesting features, please include:
- **Use case** description
- **Proposed solution**
- **Alternative solutions** considered
- **Additional context**

## Security

### Reporting Security Issues
Please **DO NOT** report security vulnerabilities through public GitHub issues. Instead:
1. Email security concerns to: security@medchain.com
2. Include detailed description of the vulnerability
3. Provide steps to reproduce if possible
4. We'll respond within 48 hours

### Security Best Practices
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all user inputs
- Use HTTPS in production

## Documentation

### Code Documentation
- Add JSDoc comments for all public functions
- Update README.md for new features
- Add inline comments for complex logic
- Document API endpoints in OpenAPI format

### User Documentation
- Update setup guides for new requirements
- Add examples for new features
- Create troubleshooting guides
- Keep changelogs up to date

## License

By contributing to MedChain, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
1. Check existing GitHub issues
2. Review the documentation
3. Join our community discussions
4. Contact the maintainers

Thank you for contributing to MedChain! 🏥💊