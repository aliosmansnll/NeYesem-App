import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapComponent({ 
  onLocationSelect, 
  initialLocation = { latitude: 41.0082, longitude: 28.9784 },
  markerLocation = null,
  style,
  theme = 'voyager' // 'voyager', 'dark', 'standard', 'satellite'
}) {
  const webViewRef = useRef(null);

  useEffect(() => {
    if (markerLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        updateMarker(${markerLocation.latitude}, ${markerLocation.longitude});
        true;
      `);
    }
  }, [markerLocation]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelect') {
        onLocationSelect?.({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('MapComponent message error:', error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        #map {
          height: 100%;
          width: 100%;
        }
        .custom-marker {
          background-color: #FF6B6B;
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        }
        .custom-marker::after {
          content: '';
          width: 10px;
          height: 10px;
          margin: 7px 0 0 7px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const themes = {
          voyager: {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '© OpenStreetMap, © CartoDB'
          },
          dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© OpenStreetMap, © CartoDB'
          },
          standard: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
          },
          satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
          }
        };

        const selectedTheme = themes['${theme}'] || themes.voyager;

        const map = L.map('map', {
          zoomControl: true,
          attributionControl: true
        }).setView([${initialLocation.latitude}, ${initialLocation.longitude}], 13);

        L.tileLayer(selectedTheme.url, {
          attribution: selectedTheme.attribution,
          maxZoom: 19
        }).addTo(map);

        let marker = null;
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });
        
        ${markerLocation ? `
          marker = L.marker([${markerLocation.latitude}, ${markerLocation.longitude}], {
            icon: customIcon
          }).addTo(map);
          map.setView([${markerLocation.latitude}, ${markerLocation.longitude}], 15);
        ` : ''}

        function updateMarker(lat, lng) {
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng], {
              icon: customIcon
            }).addTo(map);
          }
          map.setView([lat, lng], 15);
        }

        map.on('click', function(e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          
          updateMarker(lat, lng);
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelect',
            latitude: lat,
            longitude: lng
          }));
        });

        // Haritayı tam olarak yüklemek için
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
