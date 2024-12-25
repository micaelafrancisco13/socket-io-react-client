import { useEffect, useState } from "react"
import useWebsocket from "../hooks/useWebsocket.tsx"

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
	// State to save the user's location
	const [userLocation, setUserLocation] = useState<Location | null>(null)
	// State to track error messages
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	// State to track permission status
	const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | null>(null)
	// Socket.IO instance
	const socket = useWebsocket<ServerToClientEvents, ClientToServerEvents>()
	// State to track if tracking is active
	const [isTracking, setIsTracking] = useState<boolean>(false)
	// Reference to the Geolocation watcher

	// Function to start periodic location tracking
	const startLocationTracking = () => {
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(
				(position) => {
					const { latitude, longitude } = position.coords
					setUserLocation({ latitude, longitude })
					setErrorMessage(null)

					// Send updated location to the server via Socket.IO
					socket?.emit("send-updated-location", { latitude, longitude })
				},
				(error) => {
					if (error.code === 1) {
						setErrorMessage("Location access is blocked. Please allow location access to use this feature.")
					} else if (error.code === 2) {
						setErrorMessage("Location information is unavailable.")
					} else if (error.code === 3) {
						setErrorMessage("The request to get location timed out.")
					} else {
						setErrorMessage("An unknown error occurred while fetching location.")
					}
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

	// Function to stop location tracking
	const stopLocationTracking = () => {
		setIsTracking(false)
	}

	// Function to check permission status using Permissions API
	const checkPermissionStatus = () => {
		navigator?.permissions
			.query({
				name: "geolocation",
			})
			.then((result) => {
				setPermissionStatus(result.state)

				// Listen for changes to the permission state
				result.onchange = () => {
					setPermissionStatus(result.state)

					// Reload or reattempt location retrieval if permission changes to "granted"
					if (result.state !== permissionStatus) {
						location.reload()
					}
				}
			})
			.catch((exception) => {
				console.error("Error checking permission status:", exception)
			})
	}

	// Effect to check the permission status on component mount
	useEffect(() => {
		checkPermissionStatus()
	}, [])

	// Listen for updates from the server
	useEffect(() => {
		if (socket) {
			socket.on("receive-updated-location", (data) => {
				// console.log("Vehicle location update received:", data)
				// Add logic to update the map or UI with this data
			})
		}
	}, [socket])

	// Return an HTML page for the user to check their location
	return (
		<div>
			<h1>Geolocation App</h1>
			{/* Button to start or stop location tracking */}
			{!isTracking ? (
				<button onClick={startLocationTracking}>Start Location Tracking</button>
			) : (
				<button onClick={stopLocationTracking}>Stop Location Tracking</button>
			)}
			{/* Display user's location if available */}
			{userLocation && (
				<div>
					<h2>Your Location</h2>
					<p>Latitude: {userLocation.latitude}</p>
					<p>Longitude: {userLocation.longitude}</p>
				</div>
			)}
			{/* Display an error message if any */}
			{errorMessage && (
				<div>
					<h2>Error</h2>
					<p>{errorMessage}</p>
				</div>
			)}
			{/* Display current permission status */}
			<div>
				<h2>Permission Status</h2>
				<p>{permissionStatus ? `Permission: ${permissionStatus}` : "Checking permissions..."}</p>
			</div>
		</div>
	)
}

export default Geolocation
