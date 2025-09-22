# Contributing to Super Image Cropper

Thank you for your interest in contributing to Super Image Cropper! We welcome contributions from the community and are grateful for your help in making this project better.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- pnpm (recommended package manager)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/super-image-cropper.git
   cd super-image-cropper
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run the example**
   ```bash
   cd example/crop-gif-with-cropper
   pnpm install
   pnpm dev
   ```

## 📁 Project Structure

```
super-image-cropper/
├── packages/
│   ├── super-image-cropper/     # Main library package
│   │   ├── src/
│   │   │   ├── index.ts         # Main entry point
│   │   │   ├── lib/             # Core library files
│   │   │   └── utils/           # Utility functions
│   │   └── package.json
│   └── gif-worker-js/           # GIF processing worker
│       ├── src/
│       └── package.json
├── example/                     # Example applications
├── docs/                        # Documentation
├── scripts/                     # Build and release scripts
└── build/                       # Build configuration
```

## 🛠️ Development Workflow

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Follow the existing code style
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run linting
   pnpm lint
   
   # Fix linting issues
   pnpm lint:fix
   
   # Format code
   pnpm format:fix
   
   # Build the project
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   # Use conventional commits
   pnpm commit
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
feat: add support for WebP format
fix: resolve memory leak in GIF processing
docs: update API documentation
```


## 📝 Documentation

### Updating Documentation

- Update the main README.md for API changes
- Update the Chinese documentation in `docs/README_zh.md`
- Add JSDoc comments for new public APIs
- Update examples if the API changes

### Documentation Standards

- Use clear, concise language
- Provide code examples for new features
- Include both TypeScript and JavaScript examples when relevant
- Keep the Chinese and English documentation in sync

## 🐛 Reporting Issues

### Before Reporting

1. Check if the issue already exists
2. Try to reproduce the issue with the latest version
3. Prepare a minimal reproduction case

### Issue Template

When reporting bugs, please include:

- **Environment**: Browser, Node.js version, package version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Code sample**: Minimal reproduction case
- **Screenshots**: If applicable

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### PR Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what changes were made and why
3. **Breaking Changes**: Clearly mark any breaking changes
4. **Testing**: Describe how the changes were tested
5. **Screenshots**: Include screenshots for UI changes

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer review is required
3. All feedback must be addressed
4. Squash and merge is preferred

## 🏷️ Release Process

Releases are handled by maintainers using automated scripts:

```bash
# Create a new release
pnpm release
```

This will:
- Bump version numbers
- Generate changelog
- Create git tags
- Publish to npm

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

### Getting Help

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Discord/Slack**: (if available) For real-time chat

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **Performance improvements**: Optimize image processing algorithms
- **New formats**: Add support for additional image formats
- **Browser compatibility**: Improve support for older browsers
- **Documentation**: Improve examples and guides
- **Accessibility**: Make the library more accessible

## 📋 Checklist for Contributors

- [ ] I have read and understood the contributing guidelines
- [ ] I have set up the development environment
- [ ] I have created a feature branch for my changes
- [ ] I have updated documentation as needed
- [ ] I have followed the commit message convention
- [ ] I have verified my changes work correctly

## 🙏 Recognition

Contributors will be:
- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to join the maintainers team for sustained contributions

Thank you for contributing to Super Image Cropper! 🎉
