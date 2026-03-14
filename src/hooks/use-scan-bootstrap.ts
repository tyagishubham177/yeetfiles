import { startTransition, useEffect, useRef } from 'react';

import { getMediaPermissionState } from '../features/permissions/permission-service';
import { scanPhotoLibrary } from '../features/scanner/media-scan-service';
import { useAppStore } from '../store/app-store';

export function useScanBootstrap() {
  const permissionState = useAppStore((state) => state.permissionState);
  const scanNonce = useAppStore((state) => state.scanNonce);
  const beginScan = useAppStore((state) => state.beginScan);
  const receiveScanChunk = useAppStore((state) => state.receiveScanChunk);
  const completeScan = useAppStore((state) => state.completeScan);
  const failScan = useAppStore((state) => state.failScan);
  const setPermissionState = useAppStore((state) => state.setPermissionState);
  const scanInFlightRef = useRef(false);

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

    const state = useAppStore.getState();
    const needsInitialScan = state.queueOrder.length === 0 && !state.lastCompletedScanAt;
    const rescanRequested = state.scanMode === 'rescan' && state.scanState === 'idle';
    const interruptedScan = state.scanState === 'scanning';

    if (!(needsInitialScan || rescanRequested || interruptedScan) || scanInFlightRef.current) {
      return;
    }

    let cancelled = false;
    scanInFlightRef.current = true;

    void (async () => {
      beginScan();

      try {
        await scanPhotoLibrary({
          onChunk: (items, progress) => {
            if (cancelled) {
              return;
            }

            startTransition(() => {
              receiveScanChunk(items, progress);
            });
          },
        });

        if (!cancelled) {
          completeScan();
        }
      } catch (error) {
        if (!cancelled) {
          failScan(error instanceof Error ? error.message : 'The media scan failed.');
        }
      } finally {
        scanInFlightRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [beginScan, completeScan, failScan, permissionState, receiveScanChunk, scanNonce]);
}
