import { startTransition, useEffect } from 'react';

import { getMediaPermissionState } from '../features/permissions/permission-service';
import { scanPhotoLibrary } from '../features/scanner/media-scan-service';
import { useAppStore } from '../store/app-store';

export function useScanBootstrap() {
  const permissionState = useAppStore((state) => state.permissionState);
  const queueLength = useAppStore((state) => state.queueOrder.length);
  const scanState = useAppStore((state) => state.scanState);
  const scanNonce = useAppStore((state) => state.scanNonce);
  const beginScan = useAppStore((state) => state.beginScan);
  const receiveScanChunk = useAppStore((state) => state.receiveScanChunk);
  const completeScan = useAppStore((state) => state.completeScan);
  const failScan = useAppStore((state) => state.failScan);
  const setPermissionState = useAppStore((state) => state.setPermissionState);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const nextPermissionState = await getMediaPermissionState();

        if (active) {
          setPermissionState(nextPermissionState);
        }
      } catch {
        if (active) {
          setPermissionState('blocked');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [setPermissionState]);

  useEffect(() => {
    if (!(permissionState === 'granted' || permissionState === 'limited')) {
      return;
    }

    if (queueLength > 0 || scanState === 'scanning') {
      return;
    }

    let active = true;

    void (async () => {
      beginScan();

      try {
        await scanPhotoLibrary({
          onChunk: (items, progress) => {
            if (!active) {
              return;
            }

            startTransition(() => {
              receiveScanChunk(items, progress);
            });
          },
        });

        if (active) {
          completeScan();
        }
      } catch (error) {
        if (active) {
          failScan(error instanceof Error ? error.message : 'The media scan failed.');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [beginScan, completeScan, failScan, permissionState, queueLength, receiveScanChunk, scanNonce, scanState]);
}
