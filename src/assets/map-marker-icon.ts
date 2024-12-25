import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

const customIcon = L.icon({
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
	iconSize: [25, 41], // Default icon size
	iconAnchor: [12, 41], // Anchor point
})
