import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import useWebsocket from "../hooks/useWebsocket.tsx"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"

const defaultIcon = new L.Icon({
	iconUrl: markerIconUrl,
	shadowUrl: markerShadowUrl,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

interface Location {
	latitude: number
	longitude: number
}

type ServerToClientEvents = {
	"receive-updated-location": (location: Location) => void
}

type ClientToServerEvents = {
	"send-updated-location": (location: Location) => void
}

function Geolocation() {
	const [userLocation, setUserLocation] = useState<Location | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | null>(null)
	const socket = useWebsocket<ServerToClientEvents, ClientToServerEvents>()
	const [isTracking, setIsTracking] = useState<boolean>(false)
	const mapRef = useRef<L.Map | null>(null) // Reference to the Leaflet map
	const markerRef = useRef<L.Marker | null>(null) // Reference to the Leaflet marker

	const startLocationTracking = () => {
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(
				(position) => {
					// const { latitude, longitude } = position.coords

					// Simulate periodic location updates from the client
					setInterval(() => {
						const simulatedLocation = {
							latitude: 40.7128 + Math.random() * 0.02,
							longitude: -74.006 + Math.random() * 0.02,
						}
						setUserLocation(simulatedLocation)
						setErrorMessage(null)

						// Send updated location to the server via Socket.IO
						socket?.emit("send-updated-location", simulatedLocation)
					}, 3000) // Send update every 3 seconds

					// setUserLocation({ latitude, longitude })
					// setErrorMessage(null)
					//
					// // Send updated location to the server via Socket.IO
					// socket?.emit("send-updated-location", { latitude, longitude })
				},
				(error) => {
					const errorMessages: { [key: number]: string } = {
						1: "Location access is blocked. Please allow location access to use this feature.",
						2: "Location information is unavailable.",
						3: "The request to get location timed out.",
					}
					const errorMessage = errorMessages[error.code as keyof typeof errorMessages]
					setErrorMessage(errorMessage || "An unknown error occurred while fetching location.")
					setUserLocation(null)
				},
				{
					enableHighAccuracy: true,
					maximumAge: 10000,
					timeout: 5000,
				},
			)
			setIsTracking(true)
		} else {
			setErrorMessage("Geolocation is not supported by this browser.")
		}
	}

	const stopLocationTracking = () => {
		setIsTracking(false)
	}

	useEffect(() => {
		const checkPermissionStatus = () => {
			navigator.permissions
				?.query({ name: "geolocation" })
				.then((result) => {
					setPermissionStatus(result.state)
					result.onchange = () => {
						setPermissionStatus(result.state)
						if (result.state !== permissionStatus) {
							location.reload()
						}
					}
				})
				.catch((exception) => {
					console.error("Error checking permission status:", exception)
				})
		}

		checkPermissionStatus()

		if (socket) {
			socket.on("receive-updated-location", (data) => {
				console.log("Vehicle location update received:", data)
				setUserLocation(data)
			})
		}
	}, [permissionStatus, socket])

	useEffect(() => {
		if (!mapRef.current && userLocation) {
			// Initialize the map only once
			mapRef.current = L.map("map").setView([userLocation.latitude, userLocation.longitude], 13)

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
			}).addTo(mapRef.current)

			markerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
				icon: defaultIcon,
			}).addTo(mapRef.current)
		}

		if (mapRef.current && userLocation) {
			// Update marker position
			markerRef.current?.setLatLng([userLocation.latitude, userLocation.longitude])
			// Center the map on the new location
			mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13)
		}
	}, [userLocation])

	useEffect(() => {
		// Cleanup the map on component unmount
		return () => {
			mapRef.current?.remove()
			mapRef.current = null
		}
	}, [])

	return (
		<div>
			<h1>Geolocation App</h1>
			{!isTracking ? (
				<button onClick={startLocationTracking}>Start Location Tracking</button>
			) : (
				<button onClick={stopLocationTracking}>Stop Location Tracking</button>
			)}
			{userLocation && (
				<div>
					<h2>Your Location</h2>
					<p>Latitude: {userLocation.latitude}</p>
					<p>Longitude: {userLocation.longitude}</p>
					<div id="map" style={{ height: "400px", width: "100%" }}></div>
				</div>
			)}
			{errorMessage && (
				<div>
					<h2>Error</h2>
					<p>{errorMessage}</p>
				</div>
			)}
			<div>
				<h2>Permission Status</h2>
				<p>{permissionStatus ? `Permission: ${permissionStatus}` : "Checking permissions..."}</p>
			</div>
		</div>
	)
}

export default Geolocation
