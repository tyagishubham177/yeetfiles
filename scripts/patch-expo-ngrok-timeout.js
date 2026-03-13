const fs = require('fs');
const path = require('path');

const target = path.join(
  process.cwd(),
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'AsyncNgrok.js'
);

if (!fs.existsSync(target)) {
  console.log(`Expo CLI ngrok file not found at ${target}`);
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
let changed = false;

const timeoutOriginal = 'const TUNNEL_TIMEOUT = 10 * 1000;';
const timeoutReplacement = 'const TUNNEL_TIMEOUT = 45 * 1000;';
if (source.includes(timeoutOriginal)) {
  source = source.replace(timeoutOriginal, timeoutReplacement);
  changed = true;
}

const guardOriginal = "            if ((0, _NgrokResolver.isNgrokClientError)(error) && error.body.error_code === 103) {";
const guardReplacement = "            if ((0, _NgrokResolver.isNgrokClientError)(error) && (error == null ? void 0 : error.body) && error.body.error_code === 103) {";
if (source.includes(guardOriginal)) {
  source = source.replace(guardOriginal, guardReplacement);
  changed = true;
}

if (!changed) {
  console.log('Expo ngrok patch already applied.');
  process.exit(0);
}

fs.writeFileSync(target, source);
console.log('Patched Expo ngrok timeout and error guard.');
