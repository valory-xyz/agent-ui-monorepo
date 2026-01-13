# Contributing to Agent UI Monorepo

Thank you for your interest in contributing! This document provides guidelines for contributing code to this repository.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Getting Help](#getting-help)

## Getting Started

Before contributing, please:

1. Review the [README](README.md) for setup instructions and development commands
2. Check the Issues page for open tasks
3. Look for issues labeled `good first issue` or `help wanted` if you're new to the project

## Development Workflow

### 1. Choose an Issue

- Find an issue you'd like to work on
- Comment on the issue to indicate you're working on it to avoid duplicate efforts
- If you're proposing a new feature, open an issue first to discuss it

### 2. Create a Branch

Follow the naming convention with kebab-case:

```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For chores/maintenance
git checkout -b chore/description
```

### 3. Make Changes

- Write clear, focused commits
- Follow the code quality guidelines below
- Test your changes thoroughly
- Update documentation if your changes affect user-facing features or developer workflows

### 4. Test Your Changes

- Run the affected app locally: `yarn nx serve [app-name]`
- Run tests: `yarn nx test [app-name]`
- Run linting: `yarn nx lint [app-name]`
- Ensure all checks pass before submitting

### 5. Submit a Pull Request

- Push your branch to GitHub
- Create a pull request with a clear description
- Reference any related issues
- Ensure all CI checks pass

## Code Quality

### TypeScript/JavaScript Standards

- **ESLint**: Follow the configured ESLint rules
- **TypeScript**: Use TypeScript for all new code with strict type checking
- **Styling**: Use styled-components for component styling

### Code Style Guidelines

- Use descriptive variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use TypeScript interfaces/types for data structures
- Follow existing patterns in the codebase
- Avoid code duplication - extract shared logic to libraries

### File Organization

- Place shared components in appropriate `libs/` directories
- Keep app-specific code within the respective app's directory
- Follow the Nx conventions for project structure
- Co-locate tests with source files (`*.spec.ts`, `*.spec.tsx`)

### Import Paths

Use scoped package imports for shared libraries:

```typescript
import { Component } from '@agent-ui-monorepo/ui-chat';
import { constants } from '@agent-ui-monorepo/util-constants-and-types';
```

## Testing

- Write tests for new features and bug fixes
- Use Jest for unit and integration tests
- Follow existing test patterns in the codebase
- Aim for meaningful test coverage, not just high percentages

## Pull Request Process

### Commit Messages

Follow conventional commit format:

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples:**
```
feat: add wallet connection feature
fix: resolve navigation issue
docs: update CONTRIBUTING.md with testing guidelines
```

### PR Title

When creating a pull request, use the following format for the title:

```
(agentsfun-ui) feat: add wallet connection feature
(babydegen-ui) fix: resolve navigation issue
docs: update CONTRIBUTING.md with testing guidelines
```

### Before Submitting

1. **Run code quality checks**
   ```bash
   yarn nx run-many --target=lint --all
   yarn nx affected --target=test
   yarn nx affected --target=build
   ```

2. **Ensure your branch is up to date** with the base branch

3. **Write a clear PR description** explaining what changes you made and why

### PR Review Process

1. **Automated checks** run via GitHub Actions
2. **Code review** by maintainers - address all feedback
3. **Approval and merge** by maintainers

## Getting Help

- **Setup & Usage**: Check the [README](README.md)
- **Issues**: Search existing issues or create new ones
- **Security**: See [SECURITY.md](SECURITY.md) for security-related issues

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🚀
