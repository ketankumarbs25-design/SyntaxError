/**
 * FLOWSHIELD INDIA — Simplified India National Boundary GeoJSON & Major River Paths
 *
 * Provides accurate border coordinates for national mapping and major river geometries
 * for animated hydrological flow lines.
 */

export const INDIA_BOUNDARY_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'India' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.83, 35.50],
            [79.35, 34.20],
            [78.90, 32.50],
            [80.30, 30.50],
            [81.00, 30.20],
            [88.20, 27.80],
            [88.90, 27.30],
            [89.80, 26.80],
            [92.10, 27.90],
            [94.20, 28.90],
            [96.80, 28.30],
            [97.40, 27.80],
            [95.50, 26.00],
            [93.30, 24.10],
            [92.60, 22.00],
            [91.50, 22.80],
            [89.00, 21.60],
            [87.00, 21.50],
            [85.00, 19.50],
            [83.00, 17.70],
            [80.30, 15.80],
            [80.25, 13.08],
            [79.80, 10.30],
            [78.50, 9.20],
            [77.55, 8.08],
            [76.50, 9.50],
            [75.00, 12.50],
            [73.80, 15.40],
            [72.80, 18.95],
            [72.70, 21.00],
            [70.50, 21.00],
            [69.00, 22.30],
            [68.50, 23.80],
            [71.00, 24.50],
            [70.50, 27.50],
            [73.50, 29.80],
            [74.50, 32.50],
            [74.30, 35.50],
            [76.80, 36.80],
            [77.83, 35.50],
          ],
        ],
      },
    },
  ],
};

export interface RiverPolyline {
  name: string;
  hindiName: string;
  basin: string;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  color: string;
}

export const MAJOR_RIVERS: RiverPolyline[] = [
  // River Ganga
  {
    name: 'Ganga',
    hindiName: 'गंगा',
    basin: 'Ganga',
    color: '#0284c7',
    coordinates: [
      [30.15, 78.60], // Devprayag
      [29.95, 78.16], // Haridwar
      [28.98, 78.08], // Garhmukteshwar
      [27.90, 79.92], // Farrukhabad
      [26.45, 80.33], // Kanpur
      [25.50, 81.85], // Prayagraj
      [25.32, 83.01], // Varanasi
      [25.63, 85.10], // Patna
      [25.25, 87.00], // Bhagalpur
      [24.80, 87.93], // Farakka
      [23.40, 88.35], // Hooghly / Sagar
      [21.80, 88.10],
    ],
  },
  // River Yamuna
  {
    name: 'Yamuna',
    hindiName: 'यमुना',
    basin: 'Ganga',
    color: '#0ea5e9',
    coordinates: [
      [31.01, 78.46], // Yamunotri
      [30.40, 77.60], // Paonta Sahib
      [28.66, 77.25], // Delhi
      [27.50, 77.68], // Mathura
      [27.18, 78.01], // Agra
      [26.70, 79.03], // Etawah
      [25.50, 81.85], // Prayagraj Confluence
    ],
  },
  // River Brahmaputra
  {
    name: 'Brahmaputra',
    hindiName: 'ब्रह्मपुत्र',
    basin: 'Brahmaputra',
    color: '#2563eb',
    coordinates: [
      [28.20, 95.80], // Sadiya
      [27.47, 94.91], // Dibrugarh
      [26.90, 93.90], // Tezpur reach
      [26.63, 92.79], // Tezpur
      [26.19, 91.75], // Guwahati
      [26.15, 90.60], // Goalpara
      [26.02, 89.97], // Dhubri
      [25.30, 89.70], // Bangladesh reach
    ],
  },
  // River Godavari
  {
    name: 'Godavari',
    hindiName: 'गोदावरी',
    basin: 'Godavari',
    color: '#3b82f6',
    coordinates: [
      [19.93, 73.53], // Trimbakeshwar / Nashik
      [19.88, 74.48], // Kopargaon
      [19.14, 77.32], // Nanded
      [18.97, 78.33], // Nizamabad / SRSP
      [18.75, 79.80], // Mancherial
      [17.67, 80.89], // Bhadrachalam
      [16.94, 81.78], // Dowleswaram / Rajahmundry
      [16.40, 82.20], // Bay of Bengal delta
    ],
  },
  // River Krishna
  {
    name: 'Krishna',
    hindiName: 'कृष्णा',
    basin: 'Krishna',
    color: '#06b6d4',
    coordinates: [
      [17.92, 73.66], // Mahabaleshwar
      [16.85, 74.58], // Sangli
      [16.33, 75.89], // Almatti
      [16.20, 77.35], // Raichur
      [16.09, 78.90], // Srisailam
      [16.58, 79.31], // Nagarjuna Sagar
      [16.51, 80.61], // Vijayawada / Prakasam Barrage
      [15.80, 80.90], // Bay of Bengal delta
    ],
  },
  // River Narmada
  {
    name: 'Narmada',
    hindiName: 'नर्मदा',
    basin: 'Narmada',
    color: '#14b8a6',
    coordinates: [
      [22.67, 81.75], // Amarkantak
      [23.18, 79.98], // Jabalpur
      [22.75, 77.73], // Narmadapuram / Hoshangabad
      [22.25, 76.20], // Omkareshwar
      [21.83, 73.75], // Sardar Sarovar Dam
      [21.88, 73.65], // Garudeshwar
      [21.70, 73.00], // Bharuch
      [21.65, 72.60], // Gulf of Khambhat
    ],
  },
  // River Mahanadi
  {
    name: 'Mahanadi',
    hindiName: 'महानदी',
    basin: 'Mahanadi',
    color: '#0d9488',
    coordinates: [
      [21.15, 81.80], // Dhamtari / Raipur
      [21.53, 83.87], // Hirakud / Sambalpur
      [20.60, 84.82], // Tikarpada
      [20.46, 85.88], // Cuttack
      [20.25, 86.70], // Paradip
    ],
  },
  // River Cauvery
  {
    name: 'Cauvery',
    hindiName: 'कावेरी',
    basin: 'Cauvery',
    color: '#10b981',
    coordinates: [
      [12.38, 75.49], // Talakaveri
      [12.42, 76.57], // KRS Dam
      [12.30, 76.65], // Mysuru
      [11.80, 77.80], // Mettur Dam
      [11.35, 77.73], // Erode
      [10.80, 78.69], // Tiruchirappalli
      [10.82, 79.84], // Poompuhar / Bay of Bengal
    ],
  },
  // River Tapi
  {
    name: 'Tapi',
    hindiName: 'तापी',
    basin: 'Tapi',
    color: '#14b8a6',
    coordinates: [
      [21.78, 78.23], // Multai / Betul
      [21.31, 76.22], // Burhanpur
      [21.05, 75.33], // Bhusawal
      [21.25, 73.59], // Ukai Dam
      [21.17, 72.83], // Surat
      [21.10, 72.70], // Arabian Sea
    ],
  },
];
