# APK Build Strategy - Automated + Fallback

> **TL;DR:** Use GitHub Actions for automated builds (free, unlimited). Use local builds as fallback if Actions is unavailable.

## Overview

This project uses a hybrid CI/CD strategy:

| Method | Cost | Speed | Reliability | Effort |
|--------|------|-------|-------------|--------|
| **GitHub Actions** (Recommended) | FREE (unlimited) | ~10-15 min | ✅ High | 1 git tag |
| **Local Build** (Fallback) | FREE | ~5-10 min | ✅ High | Manual steps |
| ~~EAS Free Tier~~ (Old) | 15 builds/month | ~5-10 min | ⚠️ Limited | Manual |

## Workflow: Automated Build via GitHub Actions

### How It Works

```
1. Create git tag (v1.2.8)
   ↓
2. Push to GitHub
   ↓
3. GitHub Actions triggered automatically
   ↓
4. Run pre-build validation (lint, TypeScript check)
   ↓
5. Build APK with EAS
   ↓
6. Upload to GitHub Releases + Artifacts
   ↓
7. Done! Download APK from Release page
```

### Quick Start: Release New Version

```bash
# 1. Update version in package.json
{
  "version": "1.2.8"
}

# 2. Update version in app.json
{
  "expo": {
    "version": "1.2.8"
  }
}

# 3. Commit
git add package.json app.json
git commit -m "chore: bump version to 1.2.8"

# 4. Create git tag (this triggers GitHub Actions)
git tag v1.2.8
git push origin v1.2.8

# 5. Watch the build at https://github.com/YOUR_USERNAME/BoardGamesCounter/actions

# 6. Download APK from GitHub Releases once build completes
```

### Monitoring Builds

**View all builds:**
https://github.com/YOUR_USERNAME/BoardGamesCounter/actions

**View specific workflow:**
https://github.com/YOUR_USERNAME/BoardGamesCounter/actions/workflows/build-apk.yml

**View release APKs:**
https://github.com/YOUR_USERNAME/BoardGamesCounter/releases

### Troubleshooting GitHub Actions

**Build failed?**

1. Check workflow logs: GitHub Actions → build-apk.yml → Latest run
2. Look for error in "Build APK with EAS" step
3. Common issues:
   - ESLint/TypeScript errors: Fix code, create new tag
   - EXPO_TOKEN missing: Add secret to GitHub Settings → Secrets

**Need to rebuild without new tag?**

Use manual workflow trigger:

```bash
# Go to GitHub UI
# Actions → build-apk.yml → "Run workflow" → Branch: main → Run
```

## Workflow: Fallback Local Build

**When to use:**
- GitHub Actions is down/unavailable
- You want to test build locally first
- You need faster iteration during development

### Setup (One-time)

```bash
# Follow guide in ANDROID_BUILD.md
# Requirements:
# - Android SDK installed
# - JDK 17+ installed
# - ANDROID_HOME environment variable set
```

### Build

```bash
# Navigate to project
cd C:\Users\alexi\Documents\Projet perso\BoardGamesCounter

# Validate
node scripts/validate-build.js

# Build APK
expo run:android

# Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Distribute

```bash
# Upload to Google Drive / OneDrive
# Or manually install on phone:
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Pre-build Validation

All builds (GitHub Actions + local) run validation first to catch errors early:

```bash
node scripts/validate-build.js
```

This checks:
- ✅ TypeScript compiles
- ✅ ESLint passes
- ✅ Dependencies installed
- ✅ Config files present
- ✅ Version consistency

**If validation fails:** Fix errors before building to avoid wasting EAS builds.

## Version Management Strategy

### Versioning Scheme

Use Semantic Versioning: `MAJOR.MINOR.PATCH`

- `1.2.7` → `1.2.8` (patch = bug fix)
- `1.2.7` → `1.3.0` (minor = feature)
- `1.2.7` → `2.0.0` (major = breaking change)

### Where to Update Versions

1. **package.json** (npm version)
```json
{
  "version": "1.2.8"
}
```

2. **app.json** (Expo version)
```json
{
  "expo": {
    "version": "1.2.8"
  }
}
```

3. **CHANGELOG.md** (Release notes)
```markdown
## [1.2.8] - 2026-05-15

### Fixed
- ...

### Features
- ...
```

4. **Git tag** (Triggers build)
```bash
git tag v1.2.8
git push origin v1.2.8
```

### Auto-increment Strategy

The `eas.json` has `"autoIncrement": true` for the production profile:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

This means:
- EAS automatically increments the build number
- Version number stays the same in app.json
- Each build gets a unique internal build number

## Quality Assurance

### Before Each Release

```bash
# 1. Run validation
node scripts/validate-build.js

# 2. Test locally (optional)
expo run:android

# 3. Verify CHANGELOG.md updated
# 4. Commit all changes
git status
git add -A
git commit -m "chore: prepare v1.2.8 release"

# 5. Create tag (triggers Actions)
git tag v1.2.8
git push origin v1.2.8
```

### After Release

```bash
# 1. Download APK from GitHub Releases
# 2. Test on phone
# 3. Share with users
# 4. Monitor for issues
```

## Cost Analysis

### GitHub Actions
- **Cost:** FREE (unlimited builds/month)
- **Includes:** 3,000 compute minutes/month free
- **Status:** Using free tier

### EAS Free Tier
- **Cost:** FREE (15 builds/month)
- **Current usage:** 11/15 used
- **Recommendation:** Reserve for iOS testing only
- **Alternative:** Use GitHub Actions for Android

### Estimated Savings

| Scenario | Old (EAS only) | New (GitHub Actions) | Savings |
|----------|---|---|---|
| 1 build/week | $0 (15 free) | $0 | 15 free EAS builds preserved |
| 4 builds/week | Pay per build | $0 | ~$200/month |
| Unlimited | Pay | $0 | 100% free |

## GitHub Secrets Setup

To use GitHub Actions for building, you need to set `EXPO_TOKEN`:

1. Go to https://expo.dev/settings/tokens
2. Create new token
3. Go to GitHub repo → Settings → Secrets and variables → Actions
4. Add secret:
   - Name: `EXPO_TOKEN`
   - Value: (paste Expo token)

## File Organization

```
.github/
  workflows/
    build-apk.yml          ← GitHub Actions workflow
scripts/
  validate-build.js       ← Pre-build validation
ANDROID_BUILD.md          ← Local build guide (this file)
BUILD_STRATEGY.md         ← Strategy doc (this file)
CHANGELOG.md              ← Version history
package.json              ← npm version
app.json                  ← Expo version
eas.json                  ← EAS config (uses free tier)
```

## Troubleshooting

### "I want to skip validation"

Don't! Validation catches errors early and prevents failed builds.

If validation is too strict, edit `scripts/validate-build.js` to adjust checks.

### "I need to build without tagging"

Use manual workflow trigger in GitHub UI:

```
Actions → build-apk.yml → "Run workflow" → Run workflow
```

### "My EAS free builds are exhausted"

No problem! Use GitHub Actions instead (unlimited + free).

The workflow uses EAS for the actual build, but GitHub Actions provides unlimited runs.

## Resources

- **Local Build Guide:** [ANDROID_BUILD.md](./ANDROID_BUILD.md)
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **EAS Build Docs:** https://docs.expo.dev/build/setup/
- **Expo CLI:** https://docs.expo.dev/more/expo-cli/

## Next Steps

1. ✅ **GitHub setup:** Add `EXPO_TOKEN` secret
2. ✅ **Test workflow:** Create a tag and watch build
3. ✅ **Monitor:** Check GitHub Actions after each release
4. ✅ **Local fallback:** Follow ANDROID_BUILD.md if needed

---

**Questions?** Check the logs:
- GitHub Actions: https://github.com/YOUR_USERNAME/BoardGamesCounter/actions
- Local build: Run `node scripts/validate-build.js` for detailed errors

