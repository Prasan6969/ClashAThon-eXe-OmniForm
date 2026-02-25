import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { LeafletEvent, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mapMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationValue = {
  lat: number;
  lng: number;
  address?: string;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type MapPickerModalProps = {
  title: string;
  initialValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

const parseLocationValue = (value?: string): LocationValue | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        address:
          typeof parsed.address === "string" ? parsed.address : undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
};

const formatLocationValue = (location: LocationValue) =>
  JSON.stringify({
    lat: Number(location.lat.toFixed(6)),
    lng: Number(location.lng.toFixed(6)),
    address: location.address || "",
  });

const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  map.setView([lat, lng], Math.max(map.getZoom(), 14));
  return null;
};

const MapClickListener = ({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
};

export const MapPickerModal = ({
  title,
  initialValue,
  onClose,
  onSelect,
}: MapPickerModalProps) => {
  const parsedInitial = useMemo(() => parseLocationValue(initialValue), [initialValue]);
  const [picked, setPicked] = useState<LocationValue>(
    parsedInitial || {
      lat: 27.7172,
      lng: 85.324,
      address: "",
    }
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
          query
        )}`
      );
      const data = (await response.json()) as SearchResult[];
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-white">
      <div className="flex h-full flex-col">
        <div className="border-b border-sand-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button variant="secondary" onClick={handleSearch}>
              Search
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 text-sand-700 hover:bg-sand-100"
              aria-label="Close map picker"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-sand-500">
            {title} · Tap the map to place marker, then confirm location.
          </p>
          {searching ? <p className="mt-1 text-xs text-sand-500">Searching...</p> : null}
          {results.length ? (
            <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-sand-200 bg-white">
              {results.map((result) => (
                <button
                  key={`${result.lat}-${result.lon}-${result.display_name}`}
                  type="button"
                  className="block w-full border-b border-sand-100 px-3 py-2 text-left text-sm text-sand-800 last:border-b-0 hover:bg-sand-50"
                  onClick={() => {
                    setPicked({
                      lat: Number(result.lat),
                      lng: Number(result.lon),
                      address: result.display_name,
                    });
                    setResults([]);
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative flex-1">
          <MapContainer
            center={[picked.lat, picked.lng]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter lat={picked.lat} lng={picked.lng} />
            <MapClickListener
              onPick={(lat, lng) => {
                setPicked((prev) => ({ ...prev, lat, lng }));
              }}
            />
            <Marker
              position={[picked.lat, picked.lng]}
              icon={mapMarkerIcon}
              draggable
              eventHandlers={{
                dragend(event: LeafletEvent) {
                  const marker = event.target;
                  const position = marker.getLatLng();
                  setPicked((prev) => ({
                    ...prev,
                    lat: position.lat,
                    lng: position.lng,
                  }));
                },
              }}
            />
          </MapContainer>

          <div className="absolute bottom-4 left-1/2 z-[500] w-[min(92%,560px)] -translate-x-1/2 rounded-2xl border border-sand-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <p className="text-xs text-sand-500">
              {picked.address || `${picked.lat.toFixed(6)}, ${picked.lng.toFixed(6)}`}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => onSelect(formatLocationValue(picked))}
              >
                Use this location
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
