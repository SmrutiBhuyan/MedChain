import React, { useEffect, useRef, useState } from 'react';
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

    try {
      // Initialize Ola Maps
      const map = new maplibregl.Map({
        container: mapContainer.current,
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
        setIsLoading(false);
        console.log('🗺️ Ola Maps loaded successfully');
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please check your API key.');
        setIsLoading(false);
      });

      mapInstance.current.map = map;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  }, [apiKey, center, zoom]);

  // Add pharmacy markers
  useEffect(() => {
    if (!mapInstance.current.map || !pharmacies.length) return;

    const map = mapInstance.current.map;

    // Clear existing markers
    mapInstance.current.markers.forEach(marker => marker.remove());
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
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      markerElement.innerHTML = '🏥';

      // Create popup content
      const popupContent = `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #dc2626;">
            ${pharmacy.name}
          </h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            📍 ${pharmacy.address}
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            📞 ${pharmacy.contact}
          </p>
          ${pharmacy.drugName && pharmacy.quantity ? `
            <p style="margin: 4px 0; font-size: 12px; color: #059669; font-weight: bold;">
              💊 ${pharmacy.drugName}: ${pharmacy.quantity} units available
            </p>
          ` : ''}
          <button 
            onclick="window.selectPharmacy && window.selectPharmacy(${pharmacy.id})"
            style="
              margin-top: 8px;
              padding: 4px 8px;
              background: #dc2626;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 11px;
            "
          >
            Select This Pharmacy
          </button>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([pharmacy.lng, pharmacy.lat])
        .setPopup(popup)
        .addTo(map);

      mapInstance.current.markers.push(marker);
    });

    // Set up global callback for pharmacy selection
    (window as any).selectPharmacy = (pharmacyId: number) => {
      const pharmacy = pharmacies.find(p => p.id === pharmacyId);
      if (pharmacy && onPharmacyClick) {
        onPharmacyClick(pharmacy);
      }
    };

    // Fit map to show all markers
    if (pharmacies.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      pharmacies.forEach(pharmacy => {
        if (pharmacy.lat && pharmacy.lng) {
          bounds.extend([pharmacy.lng, pharmacy.lat]);
        }
      });
      
      map.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 15
      });
    }

  }, [pharmacies, onPharmacyClick]);

  if (error) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f3f4f6', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#dc2626'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            🗺️ Map Loading Error
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #dc2626',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px'
            }} />
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Loading Ola Maps...
            </p>
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