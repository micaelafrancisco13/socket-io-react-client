import "./App.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import CustomWebsocket from "./components/CustomWebsocket.tsx"
import CustomGeolocation from "./components/CustomGeolocation.tsx"
import "leaflet/dist/leaflet.css" // Import Leaflet's CSS globally

function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <CustomWebsocket />,
		},
		{
			path: "/location",
			element: <CustomGeolocation />,
		},
	])
	return (
		<>
			<RouterProvider router={router} />
		</>
	)
}

export default App
