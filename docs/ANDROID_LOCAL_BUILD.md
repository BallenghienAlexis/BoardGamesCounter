# Build Android en local (Windows)

À utiliser quand le quota EAS est épuisé ou pour tester un build natif sans attendre la CI. Pour une release normale, voir [DEPLOYMENT.md](./DEPLOYMENT.md).

## Pré-requis

- Node.js 22 LTS ou plus récent (Expo SDK 54 exige au moins 20.19, et Node 20 n'est plus maintenu).
- JDK 17 ou 21 (le JBR fourni avec Android Studio), pointé par `JAVA_HOME`. Gradle 8 ne démarre pas avec un JDK 25.
- Android Studio, avec un SDK Android récent et les Build-Tools.
- Variable d'environnement `ANDROID_HOME` (PowerShell) :

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
# rouvrir le terminal, puis :
adb --version
```

Aucun outil global n'est nécessaire : `expo-cli` est obsolète, on passe par `npx expo`.

## Construire

```powershell
cd "C:\Users\alexi\Documents\Projet Perso\BoardGamesCounter"
npm ci
npm run validate                          # typecheck, lint, tests, versions
npx expo run:android --variant release    # génère android/ puis compile et installe
```

Sans `--variant release`, la commande produit un build **debug** (qui nécessite Metro).

APK générés :

| Variante | Chemin |
|---|---|
| release | `android\app\build\outputs\apk\release\app-release.apk` |
| debug | `android\app\build\outputs\apk\debug\app-debug.apk` |

Le dossier `android/` est généré (prebuild) et ignoré par git. L'APK release local est signé avec la clé de debug générée par le prebuild : il s'installe sur votre téléphone mais n'est pas destiné à un store.

Installer sur un téléphone branché en USB (débogage USB activé) :

```powershell
adb devices
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

## Dépannage

| Problème | Solution |
|---|---|
| `ANDROID_HOME` introuvable | Redéfinir la variable puis rouvrir le terminal |
| Échec Gradle | `cd android; .\gradlew.bat clean; cd ..` puis relancer |
| Natif désynchronisé après un changement d'`app.json` ou de plugin | Supprimer `android/` puis relancer (`npx expo prebuild --clean`) |
| Aucun appareil | `adb devices`, ou créer un émulateur dans Android Studio (Device Manager) |

`eas build --local` n'est pas supporté sous Windows ; utiliser WSL ou la commande ci-dessus.
