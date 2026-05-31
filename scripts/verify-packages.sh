#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -e "console.log(require(process.argv[1]).version)" "${ROOT_DIR}/manifest.json")"
CHROME_PACKAGE="${ROOT_DIR}/dist/thedoctorttv-extension-${VERSION}.zip"
FIREFOX_PACKAGE="${ROOT_DIR}/dist/thedoctorttv-extension-firefox-${VERSION}.zip"
FIREFOX_UNPACKED="${ROOT_DIR}/dist/firefox-unpacked"

"${ROOT_DIR}/scripts/package-chromium.sh" >/dev/null
"${ROOT_DIR}/scripts/package-firefox.sh" >/dev/null

node - "${CHROME_PACKAGE}" "${FIREFOX_PACKAGE}" <<'NODE'
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");

const [chromePackage, firefoxPackage] = process.argv.slice(2);

function readManifest(packagePath) {
  return JSON.parse(execFileSync("unzip", ["-p", packagePath, "manifest.json"], {
    encoding: "utf8"
  }));
}

const chromeManifest = readManifest(chromePackage);
const firefoxManifest = readManifest(firefoxPackage);

assert.equal(chromeManifest.manifest_version, 3);
assert.equal(chromeManifest.background?.service_worker, "background/background.js");
assert.equal(chromeManifest.background?.scripts, undefined);
assert.equal(chromeManifest.browser_specific_settings, undefined);

assert.equal(firefoxManifest.manifest_version, 3);
assert.deepEqual(firefoxManifest.background?.scripts, ["background/background.js"]);
assert.equal(firefoxManifest.background?.service_worker, undefined);
assert.equal(
  firefoxManifest.browser_specific_settings?.gecko?.id,
  "thedoctorttv-extension@thedoctorttv.com"
);
assert.equal(
  firefoxManifest.browser_specific_settings?.gecko?.data_collection_permissions?.required?.[0],
  "none"
);

for (const manifest of [chromeManifest, firefoxManifest]) {
  const mainWorldScript = manifest.content_scripts.find((script) => {
    return script.js?.includes("content/twitter-fx-share-main.js");
  });

  assert.equal(mainWorldScript?.world, "MAIN");
}
NODE

npx --yes web-ext@latest lint --source-dir "${FIREFOX_UNPACKED}" >/dev/null

echo "Chrome package OK: ${CHROME_PACKAGE}"
echo "Firefox package OK: ${FIREFOX_PACKAGE}"
echo "Firefox unpacked OK: ${FIREFOX_UNPACKED}"
