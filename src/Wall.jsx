import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Wall() {
	const [memoryList, setMemoryList] = useState([]);
	const [memory, setMemory] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const socketRef = useRef(null);

	// Extract the groupId from the query params
	const queryParams = new URLSearchParams(location.search);
	const groupId = queryParams.get("groupId");

	useEffect(() => {
		if (!groupId) {
			navigate("/");
			return;
		}

		// Setup WebSocket connection
		const protocol = window.location.protocol === "http:" ? "ws" : "wss";
		const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
		socketRef.current = socket;

		socket.onopen = () => {
			console.log(`Connected to WebSocket for group ${groupId}`);
			socket.send(JSON.stringify({ action: "join", groupId }));
		};

		socket.onmessage = (event) => {
			const receivedMemory = JSON.parse(event.data);
			if (receivedMemory.system) {
				console.log(receivedMemory.system);
			} else {
				setMemoryList((prev) => [...prev, receivedMemory]);
			}
		};

		socket.onclose = () => {
			console.log("WebSocket Disconnected");
		};

		return () => {
			socket.close();
		};
	}, [groupId, navigate]);

	const handleSubmit = (event) => {
		event.preventDefault();
		if (!memory.trim()) return;

		const memoryData = { groupId, memory };

		// Send via WebSocket
		socketRef.current.send(JSON.stringify(memoryData));

		// Clear input field
		setMemory("");
	};

	return (
		<div>
			<h2>Memory Wall for Group {groupId}</h2>
			<ul>
				{memoryList.map((mem, index) => (
					<li key={index}>{mem.memory}</li>
				))}
			</ul>
			<form
				onSubmit={handleSubmit}
				className="mb-3 w-100"
				style={{ maxWidth: "500px" }}
			>
				<input
					type="text"
					className="form-control"
					value={memory}
					placeholder="Type memory here"
					onChange={(e) => setMemory(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary mt-2">
					Pin to Memory Wall
				</button>
			</form>
		</div>
	);
}
