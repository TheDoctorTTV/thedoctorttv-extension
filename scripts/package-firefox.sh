#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -e "console.log(require(process.argv[1]).version)" "${ROOT_DIR}/manifest.json")"
PACKAGE_DIR="${ROOT_DIR}/dist"
UNPACKED_DIR="${PACKAGE_DIR}/firefox-unpacked"
PACKAGE_PATH="${PACKAGE_DIR}/thedoctorttv-extension-firefox-${VERSION}.zip"
FIREFOX_OVERRIDES="${ROOT_DIR}/manifests/firefox-overrides.json"

mkdir -p "${PACKAGE_DIR}"
rm -f "${PACKAGE_PATH}"
rm -rf "${UNPACKED_DIR}"
mkdir -p "${UNPACKED_DIR}"

cp -R \
  "${ROOT_DIR}/README.md" \
  "${ROOT_DIR}/PRIVACY.md" \
  "${ROOT_DIR}/FIREFOX_SUBMISSION.md" \
  "${ROOT_DIR}/icons" \
  "${ROOT_DIR}/background" \
  "${ROOT_DIR}/popup" \
  "${ROOT_DIR}/content" \
  "${UNPACKED_DIR}/"

node - "${ROOT_DIR}/manifest.json" "${FIREFOX_OVERRIDES}" "${UNPACKED_DIR}/manifest.json" <<'NODE'
const fs = require("node:fs");

const [sourcePath, overridesPath, outputPath] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const overrides = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

function mergeObject(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      mergeObject(target[key], value);
      continue;
    }

    target[key] = value;
  }
}

mergeObject(manifest, overrides);
delete manifest.background.service_worker;

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
NODE

cd "${UNPACKED_DIR}"
zip -r "${PACKAGE_PATH}" \
  manifest.json \
  README.md \
  PRIVACY.md \
  FIREFOX_SUBMISSION.md \
  icons \
  background \
  popup \
  content \
  -x "*.DS_Store" "*/.DS_Store"

echo "${PACKAGE_PATH}"
