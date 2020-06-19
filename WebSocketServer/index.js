//Tiny websocket server using express and ws. Type "node index.js" in the console to start it.


// dependencies
const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;

const server = express().listen(3000);

const data1 = "{\"ID\":\"DATA FROM THE WEBSOCKET 1\",\"Name\":\"V L1-N\",\"Value\":127.466262817383,\"Description\":null,\"ModbusAddress\":81,\"TimeStamp\":\""
const data2 = "\",\"EnergeticReaders_ID_FK\":\"b164daf2-422d-4f4c-ada4-c48c6dd4f31a\",\"UnitsTypes_ID_FK\":null,\"EnergeticReader\":null,\"EnergeticRooms\":[],\"UnitsType\":null,\"FieldToBeUpdates\":[]}"

const wss = new WebSocket.Server({server});

wss.on('connection', (ws) =>{
    console.log("[Server] A client was connected.");

    //Step one, send all the data (9 objects) on shot on connect.
    //ws.send(data1 + Date.now() + data2);

    ws.on('close', () => {console.log('[Server] Client Disconnected.')});

    ws.on('message', (message) =>{
        console.log('[Server] Received message: %s', message);

        ws.send(data1 + Date.now() + data2);

    })

})