import { useEffect, useState } from "react"

interface Location {
	latitude: number
	longitude: number
}

function CustomGeolocation() {
	// State to save the user's location
	const [userLocation, setUserLocation] = useState<Location | null>(null)
	// State to track error messages
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	// State to track permission status
	const [permissionStatus, setPermissionStatus] = useState<
		"granted" | "denied" | "prompt" | null
	>(null)

	// Function to get the user's geolocation
	const getUserLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords
					setUserLocation({ latitude, longitude })
					setErrorMessage(null)
				},
				(error) => {
					if (error.code === 1) {
						setErrorMessage(
							"Location access is blocked. Please allow location access to use this feature.",
						)
					} else if (error.code === 2) {
						setErrorMessage("Location information is unavailable.")
					} else if (error.code === 3) {
						setErrorMessage(
							"The request to get location timed out.",
						)
					} else {
						setErrorMessage(
							"An unknown error occurred while fetching location.",
						)
					}
					setUserLocation(null)
				},
			)
		} else {
			setErrorMessage("Geolocation is not supported by this browser.")
		}
	}

	// Function to check permission status using Permissions API
	const checkPermissionStatus = () => {
		if (navigator.permissions) {
			navigator.permissions
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
					console.error(
						"Error checking permission status:",
						exception,
					)
				})
		}
	}

	// Effect to check the permission status on component mount
	useEffect(() => {
		checkPermissionStatus()
	}, [])

	// Return an HTML page for the user to check their location
	return (
		<div>
			<h1>Geolocation App</h1>
			{/* Button to get user location */}
			<button onClick={getUserLocation}>Get User Location</button>
			{/* Display user's location if available */}
			{userLocation && (
				<div>
					<h2>User Location</h2>
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
				<p>
					{permissionStatus
						? `Permission: ${permissionStatus}`
						: "Checking permissions..."}
				</p>
			</div>
		</div>
	)
}

export default CustomGeolocation
