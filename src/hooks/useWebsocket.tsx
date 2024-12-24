import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

// Generic Event Handlers
type EventHandlers<T> = {
	[K in keyof T]: (...args: never[]) => void
}

function useWebsocket<
	ServerToClient extends EventHandlers<ServerToClient>,
	ClientToServer extends EventHandlers<ClientToServer>,
>() {
	const [socket, setSocket] = useState<Socket<ServerToClient, ClientToServer> | null>(null)

	useEffect(() => {
		const newSocket: Socket<ServerToClient, ClientToServer> = io("http://localhost:3000")
		setSocket(newSocket)

		return () => {
			newSocket.disconnect()
		}
	}, [])

	return socket
}

export default useWebsocket
