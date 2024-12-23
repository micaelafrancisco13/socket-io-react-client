import "./App.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import CustomWebsocket from "./components/CustomWebsocket.tsx"
import CustomGeolocation from "./components/CustomGeolocation.tsx"

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
