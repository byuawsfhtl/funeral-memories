import { useState } from "react";
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
    <div className="tabbed-wall-container">
      {/* Tab Buttons */}
      <div className="memory-tabs">
        <button
          className={`tab-btn ${activeTab === "others" ? "active" : ""}`}
          onClick={() => setActiveTab("others")}
        >
          All Memories
        </button>
        <button
          className={`tab-btn ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          My Memories
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "others" && (
          <ul className="memory-wall">
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
              <p className="no-memories-text">No memories yet. Be the first to share one!</p>
            )}
          </ul>
        )}

        {activeTab === "mine" && (
          <ul className="memory-wall">
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
              <p className="no-memories-text">No memories added yet.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
