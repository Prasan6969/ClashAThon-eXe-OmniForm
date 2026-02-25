import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type ParsedMapValue = {
  lat: number;
  lng: number;
  address?: string;
};

type MapPreviewProps = {
  value: string;
  className?: string;
  showOpenMapLink?: boolean;
};

const previewMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const parseMapValue = (value: string): ParsedMapValue | null => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        address: typeof parsed.address === "string" ? parsed.address : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const MapPreview = ({
  value,
  className = "h-36",
  showOpenMapLink = true,
}: MapPreviewProps) => {
  const parsed = parseMapValue(value);
  if (!parsed) return null;

  const openMapHref = `https://www.openstreetmap.org/?mlat=${parsed.lat.toFixed(6)}&mlon=${parsed.lng.toFixed(6)}#map=14/${parsed.lat.toFixed(6)}/${parsed.lng.toFixed(6)}`;

  return (
    <div className="mt-3 space-y-2">
      <div className={`relative z-0 w-full overflow-hidden rounded-xl border border-sand-200 ${className}`}>
        <MapContainer
          center={[parsed.lat, parsed.lng]}
          zoom={14}
          className="h-full w-full"
          style={{ zIndex: 0 }}
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[parsed.lat, parsed.lng]} icon={previewMarkerIcon} />
        </MapContainer>
      </div>
      {parsed.address ? <p className="text-xs text-sand-500">{parsed.address}</p> : null}
      {showOpenMapLink ? (
        <a
          href={openMapHref}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-sand-700 underline"
        >
          Open map
        </a>
      ) : null}
    </div>
  );
};
