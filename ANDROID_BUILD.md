# Local Android Build Guide - Fallback Method

**When to use:** GitHub Actions is unavailable or you want to build locally on your PC.

## Prerequisites

### 1. Android SDK Setup (if not already installed)

#### Option A: Android Studio (recommended for beginners)

1. Download Android Studio from https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio and go to **Settings → Languages & Frameworks → Android SDK**
4. Install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools 34.0.0
   - Android Emulator (optional)

#### Option B: Command-line tools only (advanced)

```bash
# Install JDK 17+ (required)
# On Windows: Download from https://www.oracle.com/java/technologies/downloads/

# Set ANDROID_HOME environment variable
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\sdk"

# Download command-line tools from https://developer.android.com/studio/command-line/sdkmanager
# Extract to %ANDROID_HOME%/cmdline-tools/latest

# Install SDK
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

### 2. Verify Android SDK Setup

```bash
# On Windows PowerShell
echo $env:ANDROID_HOME

# Should output: C:\Users\<YourUsername>\AppData\Local\Android\sdk (or similar)

# Check if adb is available
adb --version
```

### 3. Install Expo CLI

```bash
npm install -g expo-cli
```

## Building APK Locally

### Step 1: Validate Build

Before building, always run validation first to catch errors early:

```bash
cd C:\Users\alexi\Documents\Projet perso\BoardGamesCounter

node scripts/validate-build.js
```

This will check:
- ✓ TypeScript compilation
- ✓ ESLint rules
- ✓ Configuration files
- ✓ Dependencies

**If validation fails, fix the errors before proceeding.**

### Step 2: Install Dependencies

```bash
npm ci
```

### Step 3: Build APK

**Option A: Using Expo CLI (simplest)**

```bash
expo run:android
```

This will:
1. Build the app
2. Compile Android APK
3. Automatically install on connected emulator or device

**Option B: Generate APK without installing**

```bash
cd android
.\gradlew.bat assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

**Option C: Full build with EAS CLI (same as GitHub Actions)**

```bash
# Requires EXPO_TOKEN environment variable
eas build --platform android --local
```

## Troubleshooting

### "ANDROID_HOME not found"

```bash
# Set ANDROID_HOME temporarily (for current session)
$env:ANDROID_HOME = "C:\Users\<YourUsername>\AppData\Local\Android\sdk"

# Or permanently (requires restart)
setx ANDROID_HOME "C:\Users\<YourUsername>\AppData\Local\Android\sdk"
```

### "Android SDK Platform 34 not installed"

```bash
# Using Android Studio:
# Open Android Studio → Settings → Android SDK → Install Platform 34

# Or using sdkmanager:
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-34"
```

### "Gradle build failed"

```bash
# Clean Gradle cache
cd android
.\gradlew.bat clean

# Rebuild
cd ..
expo run:android
```

### "No device connected"

```bash
# List connected devices
adb devices

# Create Android Emulator (if none exist):
# 1. Open Android Studio
# 2. Tools → AVD Manager → Create Virtual Device
# 3. Select device (Pixel 5 recommended)
# 4. Select API Level 34+
# 5. Finish
```

## Output

Success looks like:

```
✓ App successfully built for android
✓ Project created in android/
✓ Launching APK...
✓ Installation successful!
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Performance Tips

### Speed up builds:

1. **Reuse Gradle daemon:**

```bash
# First build: slower (5-10 minutes)
expo run:android

# Subsequent builds: faster (1-2 minutes)
expo run:android
```

2. **Use device instead of emulator:**
   - Connect Android phone via USB
   - Enable USB debugging in phone settings
   - Emulator is slower than real device

3. **Cache dependencies:**

```bash
npm ci  # Use package-lock.json (faster than npm install)
```

## Version Management

Before building a new release:

1. Update `package.json` version:

```json
{
  "version": "1.2.8"
}
```

2. Update `app.json` version:

```json
{
  "expo": {
    "version": "1.2.8"
  }
}
```

3. Commit & tag:

```bash
git add package.json app.json
git commit -m "chore: bump version to 1.2.8"
git tag v1.2.8
git push origin v1.2.8
```

This will trigger GitHub Actions to build automatically!

## File Locations

| File | Location |
|------|----------|
| APK (release) | `android/app/build/outputs/apk/release/app-release.apk` |
| APK (debug) | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Build logs | `android/build/` |
| Gradle cache | `.gradle/` |

## Next Steps

Once APK is built:

1. **Test on device:** Copy APK to phone or use `adb install`
2. **Share:** Upload to GitHub Releases or drive
3. **Document:** Update CHANGELOG.md with new version info

---

**Prefer automated builds?** Use GitHub Actions instead:

```bash
# Simply tag a version
git tag v1.2.8
git push origin v1.2.8

# GitHub Actions will automatically build & release APK!
```

Check build status: https://github.com/YOUR_USERNAME/BoardGamesCounter/actions

