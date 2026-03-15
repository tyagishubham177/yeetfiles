import { useMemo } from 'react';

export function useScanProgress(scanProgressLoaded: number, scanProgressTotal: number | null) {
  return useMemo(() => {
    const scanProgressRatio =
      !scanProgressTotal || scanProgressTotal <= 0 ? 0.08 : Math.min(Math.max(scanProgressLoaded / scanProgressTotal, 0.08), 1);

    const scanProgressLabel = scanProgressTotal
      ? `${scanProgressLoaded} of ${scanProgressTotal} photos checked`
      : scanProgressLoaded > 0
        ? `${scanProgressLoaded} photos checked so far`
        : 'Preparing your photo scan';

    return {
      scanProgressRatio,
      scanProgressLabel,
    };
  }, [scanProgressLoaded, scanProgressTotal]);
}
