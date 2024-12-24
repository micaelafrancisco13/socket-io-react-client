import { useEffect, useState } from "react"
import useWebsocket from "../hooks/useWebsocket.tsx"

type ServerToClientEvents = {
	"receive-data": (data: string) => void
}

type ClientToServerEvents = {
	"send-data": (data: string) => void
}

function CustomWebsocket() {
	const [serverMessage, setServerMessage] = useState<string>("")
	const [clientInput, setClientInput] = useState<string>("React WebSocket Client")
	const socket = useWebsocket<ServerToClientEvents, ClientToServerEvents>()

	// ─────────────────────────────────────────────────
	// 1) Connect to Socket.IO on component mount
	// ─────────────────────────────────────────────────
	useEffect(() => {
		// Listen for incoming messages from server
		socket?.on("receive-data", (data) => {
			console.log("Received from server:", data)
			setServerMessage(data)
		})

		// Cleanup on unmounting
		return () => {
			socket?.disconnect()
		}
	}, [socket])

	// ─────────────────────────────────────────────────
	// 2) Emit data to the server
	// ─────────────────────────────────────────────────
	const handleSendData = () => {
		if (!socket) return

		// Emit event named 'send-data' with whatever is in clientInput
		console.log("Sending to server:", clientInput)
		socket.emit("send-data", clientInput)

		setClientInput("React WebSocket Client Again")
	}

	return (
		<div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
			<h1>React + Socket.IO Client</h1>

			<p>
				<strong>Server says:</strong> {serverMessage ? serverMessage : "No message yet..."}
			</p>

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

			<button onClick={handleSendData}>Send</button>
		</div>
	)
}

export default CustomWebsocket
