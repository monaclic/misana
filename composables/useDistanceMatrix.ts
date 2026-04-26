// Calcul kilometrique entre 2 placeIds.
// Utilise la nouvelle API Routes (RouteMatrix.computeRouteMatrix), avec
// fallback sur l ancienne DistanceMatrixService si la nouvelle n est pas
// disponible (ex : Routes API non activee sur la cle).

import { useGoogleMaps } from './useGoogleMaps';

export function useDistanceMatrix() {
  const { enabled, load } = useGoogleMaps();

  async function distanceKm(fromPlaceId: string, toPlaceId: string): Promise<number | null> {
    if (!enabled || !fromPlaceId || !toPlaceId) return null;
    const g = await load();
    if (!g) return null;

    // 1) Nouvelle API : google.maps.routes.RouteMatrix
    try {
      if (g.maps.routes?.RouteMatrix?.computeRouteMatrix) {
        const matrix = await g.maps.routes.RouteMatrix.computeRouteMatrix({
          origins: [{ waypoint: { placeId: fromPlaceId } }],
          destinations: [{ waypoint: { placeId: toPlaceId } }],
          travelMode: g.maps.TravelMode.DRIVING,
        });
        for await (const el of matrix as AsyncIterable<any>) {
          if (typeof el?.distanceMeters === 'number') {
            return Math.round(el.distanceMeters / 1000);
          }
        }
      }
    } catch (err) {
      console.warn('[useDistanceMatrix] RouteMatrix indisponible, fallback :', err);
    }

    // 2) Ancienne API (legacy mais fonctionnelle, deprec en 2026)
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
