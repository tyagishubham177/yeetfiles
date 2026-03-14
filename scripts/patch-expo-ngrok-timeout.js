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

function replaceOnce(source, searchValue, replaceValue) {
  if (source.includes(replaceValue)) {
    return source;
  }

  return source.replace(searchValue, replaceValue);
}

function insertAfterOnce(source, anchor, addition) {
  if (source.includes(addition)) {
    return source;
  }

  return source.replace(anchor, `${anchor}${addition}`);
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
const mediaLibraryModuleTarget = path.join(
  process.cwd(),
  'node_modules',
  'expo-media-library',
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'medialibrary',
  'MediaLibraryModule.kt'
);
const mediaStorePermissionsDelegateTarget = path.join(
  process.cwd(),
  'node_modules',
  'expo-media-library',
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'medialibrary',
  'next',
  'permissions',
  'MediaStorePermissionsDelegate.kt'
);

let changed = false;

changed =
  patchFile(cliAsyncNgrokTarget, (source) =>
    replaceOnce(
      replaceOnce(
        source,
        'const TUNNEL_TIMEOUT = 10 * 1000;',
        'const TUNNEL_TIMEOUT = 45 * 1000;'
      ),
      'if ((0, _NgrokResolver.isNgrokClientError)(error) && error.body.error_code === 103) {',
      'if ((0, _NgrokResolver.isNgrokClientError)(error) && (error == null ? void 0 : error.body) && error.body.error_code === 103) {'
    )
  ) || changed;

changed =
  patchFile(ngrokClientTarget, (source) =>
    replaceOnce(
      replaceOnce(
        replaceOnce(
          replaceOnce(
            source,
            '        const response = JSON.parse(error.response.body);',
            '        const responseBody = error && error.response ? error.response.body : undefined;\n        const response = JSON.parse(responseBody);'
          ),
          '          error.response.body,\n          error.response,\n          error.response.body',
          '          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message'
        ),
        '        const response = JSON.parse(error.response.body);',
        '        const responseBody = error && error.response ? error.response.body : undefined;\n        const response = JSON.parse(responseBody);'
      ),
      '      const response = JSON.parse(error.response.body);',
      '      const responseBody = error && error.response ? error.response.body : undefined;\n      const response = JSON.parse(responseBody);'
    )
      .replace(
        '      } catch (e) {\n        clientError = new NgrokClientError(\n          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message\n        );\n      }',
        '      } catch (e) {\n        clientError = new NgrokClientError(\n          responseBody ?? error.message,\n          error.response,\n          responseBody ?? error.message\n        );\n      }'
      )
  ) || changed;

changed =
  patchFile(ngrokUtilsTarget, (source) =>
    replaceOnce(
      replaceOnce(source, '  const body = err.body;', '  const body = err.body || {};'),
      '  const notReady500 = statusCode === 500 && /panic/.test(body);',
      '  const notReady500 = statusCode === 500 && typeof body === "string" && /panic/.test(body);'
    )
  ) || changed;

changed =
  patchFile(mediaLibraryModuleTarget, (source) => {
    let updated = source;

    updated = replaceOnce(
      updated,
      'import android.provider.MediaStore\n',
      'import android.provider.MediaStore\nimport android.provider.Settings\n'
    );

    updated = insertAfterOnce(
      updated,
      `    AsyncFunction("getPermissionsAsync") { writeOnly: Boolean, permissions: List<GranularPermission>?, promise: Promise ->
      val granularPermissions = permissions ?: allowedPermissionsList
      maybeThrowIfExpoGo(granularPermissions)
      getPermissionsWithPermissionsManager(
        appContext.permissions,
        MediaLibraryPermissionPromiseWrapper(granularPermissions, promise, WeakReference(context)),
        *getManifestPermissions(writeOnly, granularPermissions)
      )
    }
`,
      `
    AsyncFunction("canManageMediaAsync") {
      return@AsyncFunction if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        MediaStore.canManageMedia(context)
      } else {
        false
      }
    }

    AsyncFunction("presentManageMediaPermissionPickerAsync") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        return@AsyncFunction false
      }

      val intent = Intent(Settings.ACTION_REQUEST_MANAGE_MEDIA).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      return@AsyncFunction true
    }

    AsyncFunction("deleteAssetsDirectAsync") Coroutine { assetsId: Array<String> ->
      requireSystemPermissions()
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || !MediaStore.canManageMedia(context)) {
        throw PermissionsException("Direct delete access is not enabled.")
      }
      return@Coroutine deleteAssets(context, assetsId)
    }
`
    );

    updated = replaceOnce(
      updated,
      `    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      return
    }

    val uris = MediaLibraryUtils.getAssetsUris(context, assetIds)
`,
      `    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      return
    }

    if (needsDeletePermission && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && MediaStore.canManageMedia(context)) {
      return
    }

    val uris = MediaLibraryUtils.getAssetsUris(context, assetIds)
`
    );

    return updated;
  }) || changed;

changed =
  patchFile(mediaStorePermissionsDelegateTarget, (source) => {
    let updated = source;

    updated = replaceOnce(
      updated,
      'import android.os.Build\n',
      'import android.os.Build\nimport android.provider.MediaStore\n'
    );

    updated = replaceOnce(
      updated,
      `    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      return
    }
    val urisWithoutPermission = uris.filterNot { uri ->
`,
      `    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
      return
    }
    if (needsDeletePermission && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && MediaStore.canManageMedia(context)) {
      return
    }
    val urisWithoutPermission = uris.filterNot { uri ->
`
    );

    return updated;
  }) || changed;

if (!changed) {
  console.log('Expo ngrok patch already applied.');
  process.exit(0);
}

console.log('Patched Expo/ngrok and media-library guards.');
