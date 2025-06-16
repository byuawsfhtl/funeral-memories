import React from "react";
import { FuneralMemoryService } from "../service/FuneralMemoryService";
import { Memory } from "../model/Memory";

interface MemoryProps {
	mem: Memory & {
		_id: string;
	};
	setSelectedMemory: (memory: Memory) => void;
	setShowDetail: (show: boolean) => void;
	canDelete?: boolean;
}

export default function Memory(props: MemoryProps) {
	const service = new FuneralMemoryService();

	const handleDelete = async (e: any) => {
		e.stopPropagation(); // Prevent click from opening detail
		if (!window.confirm("Are you sure you want to delete this memory?")) return;

		try {
			await service.deleteMemory(props.mem._id);
			window.location.reload(); // simplest way to refresh (or lift state update up)
		} catch (err) {
			if (err instanceof Error) {
				console.error("Error deleting memory:", err.message);
			} else {
				console.error("Error deleting memory:", err);
			}
			alert("Failed to delete memory.");
		}
	};

	return (
		<li
			className="memory border rounded m-2 d-flex align-items-center justify-content-center text-center position-relative"
			onClick={() => {
				props.setSelectedMemory(props.mem);
				props.setShowDetail(true);
			}}
			style={{
				cursor: "pointer",
				height: "250px",
				width: "300px",
				padding: "1rem",
				backgroundColor: "#f0f0f0",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div style={{ width: "100%", textAlign: "center" }}>
				<h5
					className="fw-bold"
					title={props.mem.title}
					style={{
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
						maxWidth: "100%",
					}}
				>
					{props.mem.title || "Untitled"}
				</h5>

				{props.mem.author && (
					<p className="fst-italic mb-1 text-secondary">
						Shared by: {props.mem.author}
					</p>
				)}
				{props.mem.image && (
					<img
						src={props.mem.image}
						alt="Memory"
						className="img-fluid mb-2"
						style={{
							height: "100px",
							objectFit: "cover",
							borderRadius: "8px",
						}}
					/>
				)}
				{props.mem.memory && (
					<p
						className="memory-preview mb-0"
						style={{
							maxHeight: "3.6em",
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}
					>
						{props.mem.memory}
					</p>
				)}
			</div>
		</li>
	);
}
