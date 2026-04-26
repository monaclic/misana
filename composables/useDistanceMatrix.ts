// Calcul kilometrique entre 2 placeIds via Google Distance Matrix.
// Renvoie distance en km (number) ou null si echec / pas de cle.

import { useGoogleMaps } from './useGoogleMaps';

export function useDistanceMatrix() {
  const { enabled, load } = useGoogleMaps();

  async function distanceKm(fromPlaceId: string, toPlaceId: string): Promise<number | null> {
    if (!enabled || !fromPlaceId || !toPlaceId) return null;
    const g = await load();
    if (!g) return null;
    const svc = new g.maps.DistanceMatrixService();
    return new Promise((resolve) => {
      svc.getDistanceMatrix(
        {
          origins: [{ placeId: fromPlaceId }],
          destinations: [{ placeId: toPlaceId }],
          travelMode: g.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (status !== g.maps.DistanceMatrixStatus.OK || !res) {
            resolve(null);
            return;
          }
          const meters = res.rows[0]?.elements[0]?.distance?.value;
          if (typeof meters !== 'number') resolve(null);
          else resolve(Math.round(meters / 1000));
        },
      );
    });
  }

  return { enabled, distanceKm };
}
