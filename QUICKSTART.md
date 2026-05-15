# Quick Start: APK Build Automation

**Get started in 5 minutes**

## What You Have Now

✅ GitHub Actions configured  
✅ Local build fallback ready  
✅ Pre-build validation ready  
✅ Everything on GitHub

## Next: 3 Steps to First Build

### Step 1: Create Expo Token (2 minutes)

```
1. Go to https://expo.dev/settings/tokens
2. Click "Create a new token"
3. Name: "GitHub Actions"
4. Copy the token
5. KEEP THIS TAB OPEN
```

### Step 2: Add Token to GitHub (1 minute)

```
1. Go to https://github.com/BallenghienAlexis/BoardGamesCounter
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: EXPO_TOKEN
5. Secret: (paste from Step 1)
6. Add secret
```

### Step 3: Release First Build (2 minutes)

**Option A: Automated (recommended)**

```bash
git tag v1.2.8
git push origin v1.2.8

# Done! Wait 10-15 minutes for build
# Download APK from: https://github.com/BallenghienAlexis/BoardGamesCounter/releases
```

**Option B: Manual (for testing)**

1. Go to GitHub → Actions → build-apk
2. "Run workflow" button
3. Select main branch
4. Run workflow
5. Wait 10-15 minutes

## Result

You now have:

- ✅ Automated APK builds on every tag
- ✅ APK available in GitHub Releases
- ✅ Local fallback with `expo run:android`
- ✅ Pre-build validation (catches errors)
- ✅ Unlimited free builds

## Next Release

```bash
# Update version
# Edit package.json + app.json to 1.2.9

# Update CHANGELOG.md

# Commit
git commit -am "chore: bump version to 1.2.9"

# Release
git tag v1.2.9
git push origin v1.2.9

# Done! APK builds automatically
```

## Docs

Need more details? Check these files:

- **GITHUB_SETUP.md** — Full GitHub setup with screenshots
- **ANDROID_BUILD.md** — Local build guide
- **BUILD_STRATEGY.md** — Complete strategy overview
- **IMPLEMENTATION_SUMMARY.md** — What was implemented

## Troubleshooting

**"Build failed"**
→ Check https://github.com/BallenghienAlexis/BoardGamesCounter/actions

**"EXPO_TOKEN not found"**
→ Add secret to GitHub (Step 2 above)

**"How do I build locally?"**
→ Read ANDROID_BUILD.md

---

**Ready?** Follow the 3 steps above and you're done! 🎉

