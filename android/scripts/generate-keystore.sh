#!/usr/bin/env bash
# PR-30 — generate a release keystore. Run once, then copy properties from
# the printed JSON into keystore.properties.

set -euo pipefail
keytool -genkey -v \
    -keystore release.keystore \
    -alias com.forge.mawaqitmasjid \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=MawaqitMasjid, O=Forge, C=US"
echo "storeFile=release.keystore"
echo "keyAlias=com.forge.mawaqitmasjid"
echo "# Paste the passwords you entered above into keystore.properties."
