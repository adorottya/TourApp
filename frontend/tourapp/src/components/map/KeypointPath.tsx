import { Polyline } from 'react-leaflet';
import type { Keypoint } from '../../types/tour';

interface Props {
  keypoints: Keypoint[];
}

// Draws the tour route as an ordered (by orderIndex) dashed line connecting the keypoints.
export function KeypointPath({ keypoints }: Props) {
  if (keypoints.length < 2) return null;
  const positions = [...keypoints]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(kp => [kp.latitude, kp.longitude] as [number, number]);
  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: '#5C6B3A', weight: 3, opacity: 0.75, dashArray: '6 8' }}
    />
  );
}
