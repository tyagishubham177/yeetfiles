import { Directory, File, Paths } from 'expo-file-system';

import type { PersistedAppState } from '../../types/app-state';

type DebugExportPayload = {
  exportedAt: string;
  queueSummary: {
    totalFiles: number;
    pendingFiles: number;
    keptFiles: number;
    deletedFiles: number;
    skippedFiles: number;
  };
  state: PersistedAppState;
};

function buildDebugExportPayload(state: PersistedAppState): DebugExportPayload {
  const files = Object.values(state.filesById);

  return {
    exportedAt: new Date().toISOString(),
    queueSummary: {
      totalFiles: files.length,
      pendingFiles: files.filter((file) => file.status === 'pending').length,
      keptFiles: files.filter((file) => file.status === 'kept').length,
      deletedFiles: files.filter((file) => file.status === 'deleted').length,
      skippedFiles: files.filter((file) => file.status === 'skipped').length,
    },
    state,
  };
}

function createExportFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `yeetfiles-debug-${timestamp}.json`;
}

export function exportDebugSnapshot(state: PersistedAppState): File {
  const exportDirectory = new Directory(Paths.cache, 'exports');
  exportDirectory.create({ idempotent: true, intermediates: true });

  const exportFile = new File(exportDirectory, createExportFilename());
  exportFile.create({ intermediates: true, overwrite: true });
  exportFile.write(JSON.stringify(buildDebugExportPayload(state), null, 2));

  return exportFile;
}
