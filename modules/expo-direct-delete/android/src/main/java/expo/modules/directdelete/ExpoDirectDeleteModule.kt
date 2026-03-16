package expo.modules.directdelete

import android.content.ContentResolver
import android.content.ContentUris
import android.content.Intent
import android.os.Build
import android.provider.MediaStore
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoDirectDeleteModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDirectDelete")

    AsyncFunction("canManageMediaAsync") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        return@AsyncFunction false
      }

      val context = appContext.reactContext ?: return@AsyncFunction false
      return@AsyncFunction MediaStore.canManageMedia(context)
    }

    AsyncFunction("presentManageMediaPermissionPickerAsync") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        return@AsyncFunction false
      }

      val activity = appContext.currentActivity ?: return@AsyncFunction false
      val intent = Intent(Settings.ACTION_REQUEST_MANAGE_MEDIA)
      activity.startActivity(intent)
      return@AsyncFunction true
    }

    AsyncFunction("deleteAssetsDirectAsync") { assetIds: List<String> ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        return@AsyncFunction false
      }

      val context = appContext.reactContext ?: return@AsyncFunction false
      if (!MediaStore.canManageMedia(context)) {
        return@AsyncFunction false
      }

      return@AsyncFunction assetIds.all { assetId ->
        deleteAssetById(context.contentResolver, assetId) > 0
      }
    }
  }

  private fun deleteAssetById(contentResolver: ContentResolver, rawAssetId: String): Int {
    val assetId = rawAssetId.toLongOrNull() ?: return 0
    val candidates = listOf(
      ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, assetId),
      ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, assetId),
      ContentUris.withAppendedId(MediaStore.Files.getContentUri("external"), assetId)
    )

    for (candidate in candidates) {
      try {
        val deletedRows = contentResolver.delete(candidate, null, null)
        if (deletedRows > 0) {
          return deletedRows
        }
      } catch (_: Throwable) {
      }
    }

    return 0
  }
}
