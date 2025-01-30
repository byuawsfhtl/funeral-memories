const express = require('express');
const uuid = require('uuid');
const app = express();
const http = require('http');
const cors = require('cors');
const db = require('./database');
const { WebSocketServer } = require('ws');
app.use(express.static('public'));

// Use the CORS middleware with the updated options
app.use(cors());

let users = {};
let scores = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());

// app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

app.get('*', (_req, res) => {
  res.send({ msg: 'Simon service' });
});

apiRouter.get('/group', async (req, res) => {
  res.send({ test: 'test' });
});

apiRouter.post('/memory', async (req, res) => {
  const memory = req.body;
  try{
    const result = await db.addMemory(memory);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

apiRouter.get('/memories', async (req, res) => {
  try{
    const result = await db.getMemories();
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


//WEBSOCKET
const server = http.createServer(app);  // Create the HTTP server

const wss = new WebSocketServer({ noServer: true });

// Handle the protocol upgrade from HTTP to WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
});

// Keep track of all the connections so we can forward messages
let connections = [];
let id = 0;

wss.on('connection', (ws) => {
  const connection = { id: ++id, alive: true, ws: ws };
  connections.push(connection);

  // Forward messages to everyone except the sender
  ws.on('message', function message(data) {
    connections.forEach((c) => {
      if (c.id !== connection.id) {
        c.ws.send(data);
      }
    });
  });

  // Remove the closed connection so we don't try to forward anymore
  ws.on('close', () => {
    const pos = connections.findIndex((o, i) => o.id === connection.id);

    if (pos >= 0) {
      connections.splice(pos, 1);
    }
  });

  // Respond to pong messages by marking the connection alive
  ws.on('pong', () => {
    connection.alive = true;
  });
});

// Keep active connections alive
setInterval(() => {
  connections.forEach((c) => {
    // Kill any connection that didn't respond to the ping last time
    if (!c.alive) {
      c.ws.terminate();
    } else {
      c.alive = false;
      c.ws.ping();
    }
  });
}, 10000);

// Start the server
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});