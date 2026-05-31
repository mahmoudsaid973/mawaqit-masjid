# App Icons

Drop a 1024×1024 PNG at `icon-1024.png` in this folder, then run:

    bundle exec fastlane icon_resizer

Or use `appicon` (<https://github.com/fastlane-community/fastlane-plugin-appicon>) to generate every scaled variant automatically.

Until you add a real icon, the Info.plist still references the asset catalog — Xcode will build but Apple validation will reject the upload.
