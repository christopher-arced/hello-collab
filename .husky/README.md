# Git Hooks Documentation

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to enforce code quality before commits.

## 🎣 Active Hooks

### 1. **pre-commit**

Runs **before** each commit on staged files only.

**What it does:**

- ✅ Runs ESLint and auto-fixes issues
- ✅ Formats code with Prettier
- ✅ Runs TypeScript type checking
- ✅ Ensures code quality standards

**Triggers on:**

- `.ts`, `.tsx`, `.js`, `.jsx` files
- `.json`, `.md`, `.yml`, `.yaml` files
- `.prisma` files
- `.css`, `.scss` files

### 2. **commit-msg**

Runs **before** the commit is finalized to validate the commit message.

**What it does:**

- ✅ Enforces [Conventional Commits](https://www.conventionalcommits.org/) format
- ✅ Ensures commit messages follow the standard

**Valid commit formats:**

```
feat: add user authentication
fix: resolve login bug
docs: update README
style: format code with prettier
refactor: restructure auth service
perf: optimize database queries
test: add unit tests for auth
build: update dependencies
ci: configure GitHub Actions
chore: update .gitignore
revert: revert previous commit
```

## 📋 What Gets Checked

### Staged Files Only

Pre-commit hooks **only run on files you've staged** (via `git add`), not the entire codebase. This makes commits fast!

### Type Checking

TypeScript type checking runs across all workspaces to catch type errors before commit.

## 🚫 Hook Failures

If a hook fails, your commit will be **blocked**. Fix the issues and try again!

### Common Failures:

**ESLint errors:**

```bash
# Auto-fix most issues
pnpm lint

# Or fix manually in your editor
```

**TypeScript errors:**

```bash
# Check what's failing
pnpm type-check

# Fix the type errors
```

**Commit message format:**

```bash
# ❌ Bad
git commit -m "fixed bug"

# ✅ Good
git commit -m "fix: resolve authentication bug"
```

## ⏭️ Bypassing Hooks (Not Recommended)

**Only use in emergencies!**

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip both hooks
git commit -n -m "emergency fix"
```

## 🔧 Configuration Files

- **`.lintstagedrc.js`** - Configures what runs on staged files
- **`.commitlintrc.js`** - Configures commit message rules
- **`.husky/pre-commit`** - Pre-commit hook script
- **`.husky/commit-msg`** - Commit message hook script

## 🛠️ Modifying Hooks

To change what runs on commit:

1. Edit `.lintstagedrc.js` for file-specific checks
2. Edit `.commitlintrc.js` for commit message rules
3. Edit `.husky/pre-commit` for the pre-commit script

## 💡 Tips

1. **Stage incrementally** - Only stage files you want to commit
2. **Run checks manually** - Use `pnpm lint`, `pnpm format`, `pnpm type-check`
3. **Fix before committing** - Let your editor auto-fix ESLint/Prettier issues
4. **Use conventional commits** - Makes changelog generation automatic

## 🆘 Troubleshooting

### Hook not running?

```bash
# Reinstall hooks
pnpm install
```

### Permission denied?

```bash
# Make hooks executable (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Type check too slow?

Type checking runs on the entire workspace. For faster commits, ensure you're only working in one package at a time.

---

**Questions?** Check the [Husky docs](https://typicode.github.io/husky/) or [lint-staged docs](https://github.com/okonet/lint-staged).
