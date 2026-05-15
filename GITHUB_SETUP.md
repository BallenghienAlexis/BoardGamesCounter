# GitHub Configuration Guide

> Setup GitHub to automatically build your APK

## Step 1: Create Expo Token

1. Go to https://expo.dev/settings/tokens
2. Click **"Create a new token"**
3. Name: `GitHub Actions`
4. Click **"Create"**
5. Copy the token (looks like: `ey1234...xyz`)
6. **Keep this tab open** (you'll need it in next step)

## Step 2: Add Secret to GitHub Repository

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/BoardGamesCounter
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables → Actions**
4. Click **"New repository secret"**
5. Fill in:
   - **Name:** `EXPO_TOKEN`
   - **Secret:** (paste the token from Step 1)
6. Click **"Add secret"**

✅ Done! GitHub Actions can now build your APK.

## Step 3: Test the Workflow

### Method A: Using Git Tag (Recommended)

```bash
# Update version
# Edit package.json:
{
  "version": "1.2.8"
}

# Edit app.json:
{
  "expo": {
    "version": "1.2.8"
  }
}

# Commit
git add package.json app.json
git commit -m "chore: bump version to 1.2.8"

# Create tag (this triggers the build!)
git tag v1.2.8
git push origin v1.2.8

# Watch the build at:
# https://github.com/YOUR_USERNAME/BoardGamesCounter/actions
```

Wait 10-15 minutes for build to complete.

### Method B: Manual Trigger (Fastest for testing)

1. Go to https://github.com/YOUR_USERNAME/BoardGamesCounter/actions
2. Click **"build-apk"** workflow on the left
3. Click **"Run workflow"** button
4. Select branch: **main** (or current branch)
5. Click **"Run workflow"**
6. Wait 10-15 minutes

### View Build Status

- **All builds:** https://github.com/YOUR_USERNAME/BoardGamesCounter/actions
- **Specific workflow:** https://github.com/YOUR_USERNAME/BoardGamesCounter/actions/workflows/build-apk.yml
- **Release artifacts:** https://github.com/YOUR_USERNAME/BoardGamesCounter/releases

### Common Build Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| 🟡 In progress | Building... | Wait 10-15 min |
| 🟢 Success ✓ | Build complete | Download from Releases |
| 🔴 Failed ✗ | Build error | Check logs for error |

## Download APK

Once build succeeds:

1. Go to **Releases:** https://github.com/YOUR_USERNAME/BoardGamesCounter/releases
2. Find your version tag (e.g., `v1.2.8`)
3. Download **app-release.apk**
4. Install on Android phone or emulator

## Troubleshooting

### "Build failed"

1. Go to **Actions** → latest build
2. Click the failed job
3. Scroll to **"Build APK with EAS"** step
4. Read the error message
5. Fix the issue in your code
6. Run validation: `node scripts/validate-build.js`
7. Commit and create new tag

### "EXPO_TOKEN not found"

1. Go to **Settings → Secrets and variables → Actions**
2. Verify `EXPO_TOKEN` secret exists
3. If not, add it following Step 2 above

### "Build stuck/hanging"

1. Go to the build on GitHub Actions
2. Click **"Cancel workflow run"** button
3. Try again with a new tag

### "APK won't install on phone"

1. Check if it's the correct version
2. Try: `adb install app-release.apk`
3. If already installed, uninstall first: `adb uninstall com.boardgamescounter`

## Automating Releases

### Option A: Manual (Current)

```bash
git tag v1.2.8
git push origin v1.2.8
# Build automatically triggered
```

### Option B: GitHub CLI (Advanced)

```bash
# Install GitHub CLI if not installed
# https://cli.github.com

# Create release in one command
gh release create v1.2.8 --title "v1.2.8" --body "Release notes"

# Upload APK to release
gh release upload v1.2.8 app-release.apk
```

## Monitoring & Maintenance

### Weekly Checks

- [ ] Check **Actions** page for any failed builds
- [ ] Verify latest APK works on test device
- [ ] Update **CHANGELOG.md** with release notes

### Monthly Maintenance

- [ ] Review **EAS free tier** usage (saves for iOS if needed)
- [ ] Check **GitHub Actions** free tier usage
- [ ] Verify **EXPO_TOKEN** is still valid

## Next Steps

1. ✅ Create Expo token (Step 1)
2. ✅ Add EXPO_TOKEN to GitHub secrets (Step 2)
3. ✅ Test with git tag (Step 3)
4. ✅ Download APK from Releases
5. ✅ Share with testers!

---

**Need help?** Check these docs:
- [BUILD_STRATEGY.md](./BUILD_STRATEGY.md) - Overall strategy
- [ANDROID_BUILD.md](./ANDROID_BUILD.md) - Local builds
- [GitHub Actions Docs](https://docs.github.com/en/actions)

