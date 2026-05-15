#!/usr/bin/env node

/**
 * Pre-build Validation Script
 *
 * This script validates the app before building to catch errors early
 * and prevent wasted EAS builds.
 *
 * Usage: node scripts/validate-build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - NOT FOUND: ${filePath}`, 'red');
    return false;
  }
}

async function runValidation() {
  let hasErrors = false;
  const checks = [];

  logSection('1. Checking required files');

  const requiredFiles = [
    ['package.json', 'package.json'],
    ['app.json', 'app.json (Expo config)'],
    ['eas.json', 'eas.json (EAS config)'],
    ['tsconfig.json', 'tsconfig.json (TypeScript config)'],
    ['.gitignore', '.gitignore'],
  ];

  requiredFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      hasErrors = true;
    }
  });

  logSection('2. Checking Node.js dependencies');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    const requiredDeps = [
      'expo',
      'expo-router',
      'react',
      'react-native',
    ];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`✓ ${dep} is installed`, 'green');
      } else {
        log(`✗ ${dep} is NOT installed`, 'red');
        hasErrors = true;
      }
    });

    if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
      log('⚠ node_modules not found - run `npm ci` first', 'yellow');
    } else {
      log('✓ node_modules exists', 'green');
    }
  } catch (e) {
    log(`✗ Error reading package.json: ${e.message}`, 'red');
    hasErrors = true;
  }

  logSection('3. Running TypeScript check');

  try {
    log('Running: npx tsc --noEmit', 'blue');
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log('✓ TypeScript check passed', 'green');
  } catch (e) {
    log('✗ TypeScript check failed', 'red');
    hasErrors = true;
  }

  logSection('4. Running ESLint');

  try {
    log('Running: npm run lint', 'blue');
    execSync('npm run lint', { stdio: 'inherit' });
    log('✓ ESLint passed', 'green');
  } catch (e) {
    log('✗ ESLint found issues', 'red');
    // Note: ESLint may fail but it's not a blocker
  }

  logSection('5. Checking app version consistency');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    const appJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf8')
    );

    const pkgVersion = packageJson.version;
    const appVersion = appJson.expo.version;

    if (pkgVersion === appVersion) {
      log(`✓ Version consistent: ${pkgVersion}`, 'green');
    } else {
      log(
        `⚠ Version mismatch - package.json: ${pkgVersion}, app.json: ${appVersion}`,
        'yellow'
      );
      log('  Update app.json to match package.json version', 'yellow');
    }
  } catch (e) {
    log(`✗ Error checking versions: ${e.message}`, 'red');
    hasErrors = true;
  }

  logSection('6. Checking EAS configuration');

  try {
    const easJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'eas.json'), 'utf8')
    );

    if (easJson.build && easJson.build.production) {
      log('✓ EAS production build profile exists', 'green');

      const androidConfig = easJson.build.production.android;
      if (androidConfig && androidConfig.buildType === 'apk') {
        log('✓ Android APK buildType configured', 'green');
      } else {
        log('⚠ Android buildType not set to APK', 'yellow');
      }
    } else {
      log('✗ EAS production build profile not found', 'red');
      hasErrors = true;
    }
  } catch (e) {
    log(`✗ Error reading eas.json: ${e.message}`, 'red');
    hasErrors = true;
  }

  logSection('7. Build readiness summary');

  if (hasErrors) {
    log('❌ BUILD VALIDATION FAILED', 'red');
    log('Fix the errors above before building', 'red');
    process.exit(1);
  } else {
    log('✅ ALL CHECKS PASSED - Ready to build!', 'green');
    process.exit(0);
  }
}

runValidation().catch(error => {
  log(`Validation error: ${error.message}`, 'red');
  process.exit(1);
});

