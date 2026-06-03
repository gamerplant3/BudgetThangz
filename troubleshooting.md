## app

### to do
1. install android studio
2. install API 35 SDKs and emulator
3. environment variables for android sdk and java jdk

ANDROID_HOME = C:\Users\[ username ]\AppData\Local\Android\Sdk\
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot\
CMAKE_VERSION = 3.31.1  [might not need this one]

4. npm install 
5. npm run android

#### To start app and emulator, run in PyCharm terminal

```sh
npm run android
```

#### To add CSV files in emulator storage, run in new cmd prompt window

```sh
adb push C:\Users\[ username ]\Documents\Local\csv_files\all_savings.csv /sdcard/Download/
```

#### To download files from android, run in new cmd prompt window

```sh
adb pull /storage/emulated/0/Download/category_mappings_default.json C:\Users\[ username ]\Documents\Local\csv_files\
```

#### To create an apk for phone testing
```sh
cd android
./gradlew assembleRelease
```
You'll find the apk at ```\android\app\build\outputs\apk\release```

#### If you get build errors -.-

1. Delete the build directories
```sh
Remove-Item -Recurse -Force android\.cxx
Remove-Item -Recurse -Force android\app\.cxx
Remove-Item -Recurse -Force android\app\build
Remove-Item -Recurse -Force android\build
```

2. Delete node_modules and reinstall packages
```sh
Remove-Item -Recurse -Force node_modules
```

```sh
npm install
```

3. Clear metro's cache just to be safe (then close after success Ctrl + C)
```sh
npx react-native start --reset-cache
```

4. Clean the android build
```sh
cd android
./gradlew clean
```

5. Then run the app again
```sh
cd ..
npm run android
```

6. react native check
```sh
npx react-native doctor
```

### Install uv (for python backend)
```sh
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
[Environment]::SetEnvironmentVariable("Path", "C:\Users\me\.local\bin;" + [Environment]::GetEnvironmentVariable("Path", "User"), "User")
uv --version
```