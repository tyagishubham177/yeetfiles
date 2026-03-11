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

const source = fs.readFileSync(target, 'utf8');
const original = 'const TUNNEL_TIMEOUT = 10 * 1000;';
const replacement = 'const TUNNEL_TIMEOUT = 45 * 1000;';

if (source.includes(replacement)) {
  console.log('Expo ngrok timeout already patched to 45 seconds.');
  process.exit(0);
}

if (!source.includes(original)) {
  console.error('Could not find the expected Expo ngrok timeout line to patch.');
  process.exit(1);
}

fs.writeFileSync(target, source.replace(original, replacement));
console.log('Patched Expo ngrok timeout to 45 seconds.');
