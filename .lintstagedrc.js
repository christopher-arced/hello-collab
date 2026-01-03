module.exports = {
  // TypeScript/JavaScript files (only in apps/ and packages/ directories)
  '{apps,packages}/**/*.{ts,tsx,js,jsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
  ],

  // JSON, Markdown, YAML files
  '**/*.{json,md,yml,yaml}': [
    'prettier --write',
  ],

  // Prisma schema files
  '**/*.prisma': [
    'prettier --write',
  ],

  // CSS/SCSS files
  '**/*.{css,scss}': [
    'prettier --write',
  ],

  // TypeScript files - run type check (only in changed workspaces)
  '**/*.{ts,tsx}': () => 'pnpm type-check',
}
