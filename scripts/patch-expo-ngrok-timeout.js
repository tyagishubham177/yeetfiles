const fs = require('fs');
const path = require('path');

function patchFile(target, transform) {
  if (!fs.existsSync(target)) {
    console.log(`Patch target not found: ${target}`);
    return false;
  }

  const original = fs.readFileSync(target, 'utf8');
  const updated = transform(original);

  if (updated === original) {
    return false;
  }

  fs.writeFileSync(target, updated);
  return true;
}

const cliAsyncNgrokTarget = path.join(
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

const ngrokClientTarget = path.join(process.cwd(), 'node_modules', '@expo', 'ngrok', 'src', 'client.js');
const ngrokUtilsTarget = path.join(process.cwd(), 'node_modules', '@expo', 'ngrok', 'src', 'utils.js');

let changed = false;

changed =
  patchFile(cliAsyncNgrokTarget, (source) =>
    source
      .replace('const TUNNEL_TIMEOUT = 10 * 1000;', 'const TUNNEL_TIMEOUT = 45 * 1000;')
      .replace(
        'if ((0, _NgrokResolver.isNgrokClientError)(error) && error.body.error_code === 103) {',
        'if ((0, _NgrokResolver.isNgrokClientError)(error) && (error == null ? void 0 : error.body) && error.body.error_code === 103) {'
      )
  ) || changed;

changed =
  patchFile(ngrokClientTarget, (source) =>
    source
      .replace(
        '        const response = JSON.parse(error.response.body);',
        '        const responseBody = error && error.response ? error.response.body : undefined;\n        const response = JSON.parse(responseBody);'
      )
      .replace(
        '          error.response.body,\n          error.response,\n          error.response.body',
        '          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message'
      )
      .replace(
        '      const response = JSON.parse(error.response.body);',
        '      const responseBody = error && error.response ? error.response.body : undefined;\n      const response = JSON.parse(responseBody);'
      )
      .replace(
        '      throw new NgrokClientError(response.msg, error.response, response);',
        '      throw new NgrokClientError(response.msg, error.response, response);'
      )
      .replace(
        '      } catch (e) {\n        clientError = new NgrokClientError(\n          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message\n        );\n      }',
        '      } catch (e) {\n        clientError = new NgrokClientError(\n          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message\n        );\n      }'
      )
  ) || changed;

changed =
  patchFile(ngrokUtilsTarget, (source) =>
    source
      .replace('  const body = err.body;', '  const body = err.body || {};')
      .replace('  const notReady500 = statusCode === 500 && /panic/.test(body);', '  const notReady500 = statusCode === 500 && typeof body === "string" && /panic/.test(body);')
  ) || changed;

if (!changed) {
  console.log('Expo ngrok patch already applied.');
  process.exit(0);
}

console.log('Patched Expo/ngrok tunnel guards.');
