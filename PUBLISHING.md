# Publishing @echosdk/react to npm

This guide walks through publishing the SDK to npm.

## Prerequisites

1. **npm Account**
   - Create account at [npmjs.com](https://www.npmjs.com/signup)
   - Verify your email

2. **npm Organization** (Optional but Recommended)
   - Create organization: `@echosdk`
   - URL: `https://www.npmjs.com/org/create`
   - This allows publishing as `@echosdk/react`

3. **npm Access Token**
   - Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
   - Click "Generate New Token"
   - Choose "Automation" type
   - Copy the token (you won't see it again!)

## Setup GitHub Secrets

Add your npm token to GitHub repository secrets:

1. Go to: `https://github.com/echosdk-react/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click "Add secret"

## Publishing Methods

### Method 1: Automated via GitHub Release (Recommended)

1. **Create a Git Tag**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub Release**
   - Go to: `https://github.com/echosdk-react/releases/new`
   - Tag: `v1.0.0`
   - Title: `v1.0.0 - Initial Release`
   - Description: Copy from CHANGELOG.md
   - Click "Publish release"

3. **Automated Publish**
   - GitHub Actions will automatically:
     - Run tests
     - Build the package
     - Publish to npm

4. **Verify**
   - Check: `https://www.npmjs.com/package/@echosdk/react`

### Method 2: Manual Publish

```bash
# 1. Login to npm
npm login

# 2. Build the package
npm run build

# 3. Test the package locally
npm pack
# This creates echosdk-react-1.0.0.tgz

# 4. Publish to npm
npm publish --access public

# 5. Verify
npm view @echosdk/react
```

## Pre-Publish Checklist

- [x] Version in package.json is correct (1.0.0)
- [x] CHANGELOG.md is updated
- [x] README.md is complete
- [x] Build succeeds (`npm run build`)
- [x] Tests pass (`npm test`)
- [x] Examples work
- [ ] NPM_TOKEN added to GitHub Secrets
- [ ] Git tag created
- [ ] GitHub release created

## Post-Publish

1. **Update CHANGELOG.md**
   ```markdown
   ## [1.0.0] - 2026-01-23
   
   Initial release
   ```

2. **Announce**
   - Update main README with npm badge
   - Tweet/share on social media
   - Post on Reddit (r/reactjs)
   - Share on Discord/Slack communities

3. **Monitor**
   - Check npm downloads: `https://npm-stat.com/charts.html?package=@echosdk/react`
   - Watch GitHub issues
   - Respond to community feedback

## Updating the Package

For future updates:

1. Update version in `package.json`:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Update CHANGELOG.md

3. Commit and push:
   ```bash
   git add .
   git commit -m "chore: bump version to 1.0.1"
   git push
   ```

4. Create new tag and release (same as above)

## Troubleshooting

**Error: Package already exists**
- The package name is taken
- Change name in package.json or use scoped package

**Error: 403 Forbidden**
- Check npm token is valid
- Verify you have publish permissions
- For scoped packages, use `--access public`

**Error: Tests failed**
- Fix failing tests before publishing
- Run `npm test` locally

**Build failed**
- Run `npm run build` locally
- Check for TypeScript errors

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
