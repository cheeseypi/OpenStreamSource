const express = require('express');
const ws = require('ws');
//const { ApiClient } = require('twitch');
const { StaticAuthProvider } = require('twitch-auth');
const { ChatClient } = require('twitch-chat-client');

const port = 8080;

const clientId = process.env.CLIENTID;
const accessToken = process.env.ACCESSTOKEN;
const authProvider = new StaticAuthProvider(clientId, accessToken, ['chat:read', 'chat:edit']);
const chatClient = new ChatClient(authProvider, {channels:['cheeseypi']});

const app = express();
const wsServer = new ws.Server({noServer: true});

var clients = [];

wsServer.on('connection', socket => {
    socket.send(JSON.stringify({type: 'system', content:'Acknowledge Connection'}));
    clients.push(socket);
});

//Send a message to all clients
function broadcast(message) {
    let forRemoval = [];
    clients.forEach(client => {
        if(client.readyState === ws.OPEN){
            client.send(JSON.stringify(message))
        }
        else if(client.readyState === ws.CLOSED || client.readyState === ws.CLOSING){
            forRemoval.push(client);
            console.log('Removing a client');
        }
    });
    clients = clients.filter(item => forRemoval.indexOf(item) === -1);
}

//Debug messages
//setInterval(()=> {broadcast({type: 'system', content: '5 seconds have passed'})}, 5000);
//setInterval(()=>{broadcast({type: 'chat', content: 'This is a chat message'})}, 6000);

//Serve clients
app.use('/', express.static('Clients'));

//Handle Twitch Events
chatClient.onMessage(async (channel, user, message, msg) => {
    broadcast({type: 'chat', author:user, content:message});
})

//Start Server
const server = app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
chatClient.connect();