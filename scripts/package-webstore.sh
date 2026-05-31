#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -e "console.log(require(process.argv[1]).version)" "${ROOT_DIR}/manifest.json")"
PACKAGE_DIR="${ROOT_DIR}/dist"
PACKAGE_PATH="${PACKAGE_DIR}/thedoctorttv-extension-${VERSION}.zip"

mkdir -p "${PACKAGE_DIR}"
rm -f "${PACKAGE_PATH}"

cd "${ROOT_DIR}"
zip -r "${PACKAGE_PATH}" \
  manifest.json \
  README.md \
  PRIVACY.md \
  WEBSTORE_SUBMISSION.md \
  icons \
  background \
  popup \
  content \
  -x "*.DS_Store" "*/.DS_Store"

echo "${PACKAGE_PATH}"
