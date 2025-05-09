// import React, { useState, useEffect, useRef } from 'react';
// import './chat.css';


// export function WebSocketChat() {
//   const [name, setName] = useState('');
//   const [message, setMessage] = useState('');
//   const [chatMessages, setChatMessages] = useState([]);
//   const [connected, setConnected] = useState(false);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
//     const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
//     socketRef.current = socket;

//     // Handle WebSocket open event
//     socket.onopen = () => {
//       appendMsg('system', 'websocket', 'connected');
//       setConnected(true);
//     };

//     // Handle WebSocket messages
//     socket.onmessage = async (event) => {
//       const text = await event.data.text();
//       const chat = JSON.parse(text);
//       appendMsg('friend', chat.name, chat.msg);
//     };

//     // Handle WebSocket close event
//     socket.onclose = () => {
//       appendMsg('system', 'websocket', 'disconnected');
//       setConnected(false);
//     };

//     // Cleanup on component unmount
//     return () => {
//       socket.close();
//     };
//   }, []);

//   // Append a message to the chat
//   const appendMsg = (cls, from, msg) => {
//     setChatMessages((prevMessages) => [
//       { cls, from, msg },
//       ...prevMessages,
//     ]);
//   };

//   // Send a message over WebSocket
//   const sendMessage = () => {
//     if (message.trim()) {
//       appendMsg('me', 'me', message);
//       const payload = JSON.stringify({ name, msg: message });
//       socketRef.current?.send(payload);
//       setMessage('');
//     }
//   };

//   // Handle Enter key for sending messages
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       sendMessage();
//     }
//   };

//   return (
//     <div>
//         <legend>Chat with your friends about your tasks!</legend>
//         <div>Feel free to talk about how to complete them, if they are done, or whatever else is needed to keep checking things off your list! </div>
//       <div className="name">
//         <fieldset id="name-controls">
//           <legend>My Name</legend>
//           <input
//             id="my-name"
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//         </fieldset>
//       </div>

//       <fieldset id="chat-controls" disabled={!connected || !name}>
//         <legend>Chat</legend>
//         <input
//           id="new-msg"
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <button onClick={sendMessage} disabled={!message.trim() || !name}>
//           Send
//         </button>
//       </fieldset>

//       <div id="chat-text">
//         {chatMessages.map((chat, index) => (
//           <div key={index}>
//             <span className={chat.cls}>{chat.from}</span>: {chat.msg}
//           </div>
//         ))}
//       </div>

//       {!connected && <p>WebSocket is disconnected</p>}
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import './chat.css';

export function WebSocketChat() {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const joinGroup = () => {
    if (!groupId.trim()) {
      alert("Please enter a Group ID before joining!");
      return;
    }

    if (socketRef.current) {
      socketRef.current.close(); // Close any existing connection
    }

    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: 'join', groupId, name }));
      appendMsg('system', 'websocket', `Joined group ${groupId}`);
      setConnected(true);
    };

    socket.onmessage = async (event) => {
      try {
        const chat = JSON.parse(event.data); // FIX: Removed `.text()`
        appendMsg('friend', chat.name, chat.msg);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.onclose = () => {
      appendMsg('system', 'websocket', 'Disconnected');
      setConnected(false);
    };
  };

  const appendMsg = (cls, from, msg) => {
    setChatMessages((prevMessages) => [{ cls, from, msg }, ...prevMessages]);
  };

  const sendMessage = () => {
    if (!message.trim() || !groupId) return;

    appendMsg('me', 'me', message);
    const payload = JSON.stringify({ name, msg: message }); // FIX: Ensure correct reference
    socketRef.current?.send(payload);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div>
      <legend>Join a Chat Group</legend>
      <div>
        <label htmlFor="group-id">Group ID:</label> {/* FIX: Changed `for` to `htmlFor` */}
        <input
          id="group-id"
          type="text"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button onClick={joinGroup}>Join Group</button>
      </div>

      <div className="name">
        <fieldset id="name-controls">
          <legend>My Name</legend>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </fieldset>
      </div>

      <fieldset id="chat-controls" disabled={!connected || !name}>
        <legend>Chat</legend>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={!message.trim() || !name}>
          Send
        </button>
      </fieldset>

      <div id="chat-text">
        {chatMessages.map((chat, index) => (
          <div key={index}>
            <span className={chat.cls}>{chat.from}</span>: {chat.msg}
          </div>
        ))}
      </div>

      {!connected && <p>WebSocket is disconnected</p>}
    </div>
  );
}
