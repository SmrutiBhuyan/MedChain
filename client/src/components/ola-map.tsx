import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface OlaMapProps {
  apiKey: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  pharmacies?: Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    contact: string;
    quantity?: number;
    drugName?: string;
  }>;
  onPharmacyClick?: (pharmacy: any) => void;
}

interface MapInstance {
  map: maplibregl.Map | null;
  markers: maplibregl.Marker[];
}

const OlaMap: React.FC<OlaMapProps> = ({
  apiKey,
  center = [77.5946, 12.9716], // Default to Bangalore
  zoom = 10,
  height = '400px',
  width = '100%',
  pharmacies = [],
  onPharmacyClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapInstance>({ map: null, markers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    let isMounted = true;
    let map: maplibregl.Map | null = null;

    const initializeMap = async () => {
      try {
        // Initialize Ola Maps
        map = new maplibregl.Map({
          container: mapContainer.current!,
          style: `https://api.olamaps.io/tiles/v1/styles/default-light-standard/style.json?api_key=${apiKey}`,
          center: center,
          zoom: zoom,
          attributionControl: false
        });

        // Add attribution
        map.addControl(new maplibregl.AttributionControl({
          customAttribution: '© Ola Maps'
        }), 'bottom-right');

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add fullscreen control
        map.addControl(new maplibregl.FullscreenControl(), 'top-right');

        map.on('load', () => {
          if (isMounted) {
            setIsLoading(false);
            console.log('🗺️ Ola Maps loaded successfully');
          }
        });

        map.on('error', (e) => {
          if (isMounted) {
            console.error('Map error:', e);
            setError('Failed to load map. Please check your API key.');
            setIsLoading(false);
          }
        });

        mapInstance.current.map = map;
      } catch (err) {
        if (isMounted) {
          console.error('Error initializing map:', err);
          setError('Failed to initialize map');
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      try {
        if (map && typeof map.remove === 'function') {
          map.remove();
        }
      } catch (error) {
        console.log('Map cleanup error:', error);
      }
    };
  }, [apiKey, center, zoom]);

  // Add pharmacy markers
  useEffect(() => {
    if (!mapInstance.current.map || !pharmacies.length) return;

    const map = mapInstance.current.map;

    // Clear existing markers
    mapInstance.current.markers.forEach(marker => {
      try {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      } catch (error) {
        console.log('Marker cleanup error:', error);
      }
    });
    mapInstance.current.markers = [];

    // Add new markers
    pharmacies.forEach(pharmacy => {
      if (!pharmacy.lat || !pharmacy.lng) return;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'pharmacy-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        background: #dc2626;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      `;
      markerElement.innerHTML = '💊';

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)';
        markerElement.style.zIndex = '1000';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = '1';
      });

      // Create marker
      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([pharmacy.lng, pharmacy.lat])
        .addTo(map);

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-lg mb-2">${pharmacy.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${pharmacy.address}</p>
          <p class="text-sm text-gray-600 mb-2">📞 ${pharmacy.contact}</p>
          ${pharmacy.quantity ? `<p class="text-sm font-medium text-green-600">Stock: ${pharmacy.quantity} units</p>` : ''}
          ${pharmacy.drugName ? `<p class="text-sm text-blue-600">Drug: ${pharmacy.drugName}</p>` : ''}
        </div>
      `);

      // Add click handler
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.addTo(map);
        if (onPharmacyClick) {
          onPharmacyClick(pharmacy);
        }
      });

      mapInstance.current.markers.push(marker);
    });

    // Fit map to show all markers
    if (pharmacies.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      pharmacies.forEach(pharmacy => {
        if (pharmacy.lat && pharmacy.lng) {
          bounds.extend([pharmacy.lng, pharmacy.lat]);
        }
      });
      
      try {
        map.fitBounds(bounds, { padding: 50 });
      } catch (error) {
        console.log('Error fitting bounds:', error);
      }
    }
  }, [pharmacies, onPharmacyClick]);

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Map Error</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height, width }}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OlaMap;