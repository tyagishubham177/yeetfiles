import { Directory, File } from 'expo-file-system';

import { nowIso } from '../../lib/time';
import type { FileItem } from '../../types/file-item';

export type MoveTarget = {
  uri: string;
  label: string;
};

export type MoveFileResult =
  | {
      ok: true;
      action: 'move';
      fileId: string;
      timestamp: string;
      target: MoveTarget;
      nextUri: string;
      finalName: string;
    }
  | {
      ok: false;
      action: 'move';
      fileId: string;
      errorCode: string;
      message: string;
      target: MoveTarget;
    };

function splitFilename(name: string): { baseName: string; extension: string } {
  const extensionIndex = name.lastIndexOf('.');

  if (extensionIndex <= 0) {
    return {
      baseName: name,
      extension: '',
    };
  }

  return {
    baseName: name.slice(0, extensionIndex),
    extension: name.slice(extensionIndex),
  };
}

function resolveAvailableDestinationFile(directory: Directory, originalName: string): File {
  const { baseName, extension } = splitFilename(originalName);

  for (let index = 0; index < 100; index += 1) {
    const candidateName = index === 0 ? originalName : `${baseName} (${index})${extension}`;
    const candidate = new File(directory, candidateName);

    if (!candidate.exists) {
      return candidate;
    }
  }

  return new File(directory, `${baseName}-${Date.now()}${extension}`);
}

function normalizeDirectoryLabel(uri: string): string {
  const withoutQuery = uri.split('?')[0] ?? uri;
  const normalized = withoutQuery.replace(/^file:\/\//, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'Selected folder';
  }

  return segments.slice(-3).join(' / ');
}

export async function pickMoveTarget(): Promise<MoveTarget | null> {
  try {
    const directory = await Directory.pickDirectoryAsync();

    return {
      uri: directory.uri,
      label: normalizeDirectoryLabel(directory.uri),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (message.includes('cancel')) {
      return null;
    }

    throw error;
  }
}

export async function moveFileItem(file: FileItem, target: MoveTarget): Promise<MoveFileResult> {
  if (!file.uri) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'missing_uri',
      message: 'This photo no longer has a valid file location.',
      target,
    };
  }

  try {
    const source = new File(file.uri);

    if (!source.exists) {
      return {
        ok: false,
        action: 'move',
        fileId: file.id,
        errorCode: 'source_missing',
        message: 'The source photo is no longer available at its original location.',
        target,
      };
    }

    const destinationDirectory = new Directory(target.uri);

    if (!destinationDirectory.exists) {
      return {
        ok: false,
        action: 'move',
        fileId: file.id,
        errorCode: 'destination_missing',
        message: 'The selected destination folder is no longer available.',
        target,
      };
    }

    const destinationFile = resolveAvailableDestinationFile(destinationDirectory, file.name);
    source.move(destinationFile);

    return {
      ok: true,
      action: 'move',
      fileId: file.id,
      timestamp: nowIso(),
      target: {
        uri: target.uri,
        label: target.label || normalizeDirectoryLabel(target.uri),
      },
      nextUri: destinationFile.uri,
      finalName: destinationFile.name,
    };
  } catch (error) {
    return {
      ok: false,
      action: 'move',
      fileId: file.id,
      errorCode: 'move_failed',
      message: error instanceof Error ? error.message : 'The move request failed.',
      target,
    };
  }
}
