import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { canManageMediaAsync, hasNativeDirectDeleteSupport, supportsManageMediaAccess } from '../../features/file-ops/manage-media-service';

export type DirectDeleteStatus = 'ready' | 'popup' | 'unavailable';

export function useDirectDeleteStatus() {
  const [directDeleteStatus, setDirectDeleteStatus] = useState<DirectDeleteStatus>(() =>
    supportsManageMediaAccess() ? 'popup' : 'unavailable',
  );

  useEffect(() => {
    if (!supportsManageMediaAccess()) {
      return;
    }

    let active = true;

    const refreshDirectDeleteStatus = async () => {
      const granted = await canManageMediaAsync();
      if (!active) {
        return;
      }

      setDirectDeleteStatus(granted && hasNativeDirectDeleteSupport() ? 'ready' : 'popup');
    };

    void refreshDirectDeleteStatus();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshDirectDeleteStatus();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return directDeleteStatus;
}