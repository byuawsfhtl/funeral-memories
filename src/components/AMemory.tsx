import { Memory } from "../model/Memory";

interface MemoryProps {
  mem: Memory;
  setSelectedMemory: (memory: Memory) => void;
  setShowDetail: (show: boolean) => void;
  canDelete?: boolean;
}

export default function AMemory(props: MemoryProps) {
  return (
    <li
      className="memory"
      onClick={() => {
        props.setSelectedMemory(props.mem);
        props.setShowDetail(true);
      }}
    >
      {props.mem.image && (
        <img
          src={props.mem.image}
          alt="Memory"
          className="memory-card-image"
        />
      )}
      <div className="memory-card-body">
        <h5 className="memory-card-title" title={props.mem.title}>
          {props.mem.title || "Untitled"}
        </h5>
        {props.mem.author && (
          <p className="memory-card-author">
            — {props.mem.author.length > 24
              ? props.mem.author.slice(0, 24) + "..."
              : props.mem.author}
          </p>
        )}
        {props.mem.memory && (
          <p className="memory-card-preview">
            {props.mem.memory}
          </p>
        )}
      </div>
    </li>
  );
}
