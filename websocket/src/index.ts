import WebSocket, {WebSocketServer} from "ws";
import http from "http";

// This is just a simple HTTP server that responds with "Hello world" to any request.
const server = http.createServer(function (request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.end('Hello world');
});

/* Here we create a WebSocket server that shares the same HTTP server
This means that the WebSocket server will listen on the same port as the HTTP server
and will be able to handle WebSocket upgrade requests. */
const wss = new WebSocketServer({server});

// When a new WebSocket connection is established, this callback is called.
// Whenever this connection is called it will run the callback function named 'connection'.
// The 'socket' parameter is the WebSocket connection to the client.
// Functionality: Broadcasts any received message to all connected clients.
// In websockets, 'on' is used to listen for events, similar to event listeners in other programming contexts.  
let count = 0;
wss.on('connection', function connection(socket) {
    socket.on('error', (err) => console.error(err) );  // event listener for errors
    console.log('Client connected', ++count);
    socket.on('message', function message(data, isBinary) { // event listener for incoming messages
        wss.clients.forEach(function each(client) {  // Iterate over all connected clients
            if (client.readyState === WebSocket.OPEN) {
                client.send(data, {binary: isBinary});
            }
        });
    });

    socket.send('Hello! This is a WebSocket server'); // Send a welcome message to the newly connected client
});

server.listen(8000, function () {
    console.log((new Date()) + ' Server is listening on port 8000');
});