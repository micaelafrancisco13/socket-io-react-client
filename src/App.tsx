import "./App.css"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

type ServerToClientEvents = {
	"receive-data": (data: string) => void
}

type ClientToServerEvents = {
	"send-data": (data: string) => void
}

function App() {
	// Define the state and types
	const [socket, setSocket] = useState<Socket<
		ServerToClientEvents,
		ClientToServerEvents
	> | null>(null)
	const [serverMessage, setServerMessage] = useState<string>("")
	const [clientInput, setClientInput] = useState<string>(
		"React WebSocket Client",
	)

	// ─────────────────────────────────────────────────
	// 1) Connect to Socket.IO on component mount
	// ─────────────────────────────────────────────────
	useEffect(() => {
		// Connect to the server with proper typing
		const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> =
			io("http://localhost:3000")

		setSocket(newSocket)

		// Listen for incoming messages from server
		newSocket.on("receive-data", (data) => {
			console.log("Received from server:", data)
			setServerMessage(data)
		})

		// Cleanup on unmounting
		return () => {
			newSocket.disconnect()
		}
	}, [])

	// ─────────────────────────────────────────────────
	// 2) Emit data to the server
	// ─────────────────────────────────────────────────
	const handleSendData = () => {
		if (!socket) return

		// Emit event named 'receive-data' with whatever is in clientInput
		console.log("Sending to server:", clientInput)
		socket.emit("send-data", clientInput)

		// Clear the input
		setClientInput("React WebSocket Client Again")
	}

	return (
		<div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
			<h1>React + Socket.IO Client</h1>

			{/* Display the latest message from the server */}
			<p>
				<strong>Server says:</strong>{" "}
				{serverMessage ? serverMessage : "No message yet..."}
			</p>

			{/* Input to type data we want to send */}
			<div style={{ marginBottom: "1rem" }}>
				<label>
					<strong>Send to server:</strong>
					<input
						style={{ marginLeft: "0.5rem" }}
						type="text"
						value={clientInput}
						onChange={(e) => setClientInput(e.target.value)}
					/>
				</label>
			</div>

			{/* Button to emit the event */}
			<button onClick={handleSendData}>Send</button>
		</div>
	)
}

export default App
