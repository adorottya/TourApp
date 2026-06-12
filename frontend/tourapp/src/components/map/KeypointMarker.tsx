import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Keypoint } from '../../types/tour';

const visitedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const pendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface Props {
  keypoint: Keypoint;
  visited?: boolean;
}

export function KeypointMarker({ keypoint, visited = false }: Props) {
  return (
    <Marker
      position={[keypoint.latitude, keypoint.longitude]}
      icon={visited ? visitedIcon : pendingIcon}
    >
      <Popup>
        <strong>{keypoint.name}</strong>
        {keypoint.description && <p style={{ margin: '4px 0 0' }}>{keypoint.description}</p>}
        {keypoint.image && <img src={keypoint.image} alt={keypoint.name} style={{ marginTop: 6, maxWidth: 160 }} />}
      </Popup>
    </Marker>
  );
}
