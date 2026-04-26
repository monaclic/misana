// Calcul kilometrique entre 2 placeIds via google.maps.DistanceMatrixService.
// API legacy, deprec en fevrier 2026 mais fonctionnelle. La nouvelle API
// Routes (RouteMatrix.computeRouteMatrix) necessite "Routes API" activee
// cote Google Cloud Console -- on garde l ancienne en V1.

import { useGoogleMaps } from './useGoogleMaps';

export function useDistanceMatrix() {
  const { enabled, load } = useGoogleMaps();

  async function distanceKm(fromPlaceId: string, toPlaceId: string): Promise<number | null> {
    if (!enabled || !fromPlaceId || !toPlaceId) return null;
    const g = await load();
    if (!g?.maps?.DistanceMatrixService) return null;

    return new Promise((resolve) => {
      try {
        const svc = new g.maps.DistanceMatrixService();
        svc.getDistanceMatrix(
          {
            origins: [{ placeId: fromPlaceId }],
            destinations: [{ placeId: toPlaceId }],
            travelMode: g.maps.TravelMode.DRIVING,
          },
          (res: any, status: string) => {
            if (status !== 'OK' || !res) {
              resolve(null);
              return;
            }
            const meters = res.rows[0]?.elements[0]?.distance?.value;
            if (typeof meters !== 'number') resolve(null);
            else resolve(Math.round(meters / 1000));
          },
        );
      } catch (err) {
        console.warn('[useDistanceMatrix] DistanceMatrixService failed :', err);
        resolve(null);
      }
    });
  }

  return { enabled, distanceKm };
}
