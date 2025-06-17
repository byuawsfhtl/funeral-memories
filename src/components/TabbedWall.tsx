import React, { useState } from "react";
import AMemory from "./AMemory";
import { Memory } from "../model/Memory";

interface TabbedMemoryWallProps {
	myMemories: Memory[];
	otherMemories: Memory[];
	setSelectedMemory: (memory: Memory) => void;
	setShowDetail: (show: boolean) => void;
	isAdmin: boolean;
}

export default function TabbedMemoryWall(props: TabbedMemoryWallProps) {
	const [activeTab, setActiveTab] = useState("others");

	return (
		<div className="container">
			{/* Tab Buttons */}
			<ul className="nav nav-tabs justify-content-center">
				<li className="nav-item">
					<button
						className={`nav-link ${activeTab === "others" ? "active" : ""}`}
						onClick={() => setActiveTab("others")}
					>
						Memory Wall
					</button>
				</li>
				<li className="nav-item">
					<button
						className={`nav-link ${activeTab === "mine" ? "active" : ""}`}
						onClick={() => setActiveTab("mine")}
					>
						My Memories
					</button>
				</li>
			</ul>

			{/* Tab Content */}
			<div className="tab-content pt-3">
				{activeTab === "others" && (
					<ul className="memory-wall d-flex flex-wrap justify-content-center">
						{props.otherMemories.length > 0 ? (
							props.otherMemories.map((mem, index) => (
								<AMemory
									key={`others-${index}`}
									mem={mem}
									setSelectedMemory={props.setSelectedMemory}
									setShowDetail={props.setShowDetail}
									canDelete={props.isAdmin}
								/>
							))
						) : (
							<p className="text-muted text-center">No other memories yet.</p>
						)}
					</ul>
				)}

				{activeTab === "mine" && (
					<ul className="memory-wall d-flex flex-wrap justify-content-center">
						{props.myMemories.length > 0 ? (
							props.myMemories.map((mem, index) => (
								<AMemory
									key={`mine-${index}`}
									mem={mem}
									setSelectedMemory={props.setSelectedMemory}
									setShowDetail={props.setShowDetail}
									canDelete={true}
								/>
							))
						) : (
							<p className="text-muted text-center">No memories added yet.</p>
						)}
					</ul>
				)}
			</div>
		</div>
	);
}
