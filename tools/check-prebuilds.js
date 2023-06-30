const fs = require('fs');
const path = require('path');

const files = [
  'prebuilds/android-arm/index.node',
  'prebuilds/android-arm64/index.node',
  'prebuilds/android-x64/index.node',
  'prebuilds/ios-arm64/index.node/index',
  'prebuilds/ios-x64/index.node/index',
];

for (const file of files) {
  const parts = file.split('/');
  for (let i = 1; i < parts.length; i++) {
    const partialFilename = path.resolve(
      __dirname,
      '..',
      parts.slice(0, i).join('/'),
    );
    if (!fs.existsSync(partialFilename)) {
      console.error('Cannot npm publish with missing ' + file);
      break;
    }
  }
  if (!fs.existsSync(file)) {
    console.error('Cannot npm publish with missing ' + file);
  }
}
