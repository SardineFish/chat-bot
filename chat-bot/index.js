// const WebSocketClient = require('websocket').client;
// const fetch = require("node-fetch");

import WebSocket from "websocket";
import fetch from "node-fetch";
import fs from "fs";

const WebSocketClient = WebSocket.client;

const config = JSON.parse(fs.readFileSync("./config.json").toString());

const ID = config.id;
const CHAT_API = config.chat;
const MIRAI_API = config.mirai;
const VERIFY_KEY = config.verifyKey;

const ws = new WebSocketClient();
let sessionId = -1;

ws.on('connectFailed', function (error)
{
    console.log('Connect Error: ' + error.toString());
});

ws.on('connect', function (connection)
{
    console.log('WebSocket Client Connected');
    connection.on('error', function (error)
    {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function ()
    {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message', async (message) =>
    {
        const data = JSON.parse(message.utf8Data);

        if (data.syncId == "")
        {
            console.log(data);
            sessionId = data.data.session;   
        }
        else if (data.syncId == "-1")
        {
            // console.log(data);
            switch (data.data.type)
            {
                case "FriendMessage":
                case "GroupMessage":
                    await handleGroupMsg(data.data, connection);
                    break;
            }
        }
        

        // console.log(data);
    });
    
});

/**
 * 
 * @param {any} msg 
 * @param {WebSocket.connection} connection 
 * @returns 
 */
async function handleGroupMsg(msg, connection)
{
    // console.log(msg);
    const msgChain = msg.messageChain;
    const source = msg.messageChain[0];
    // console.log(source);
    const quoteId = source.id;
    const sender = msg.sender.id;
    const group = msg.sender.group?.id;

    if (group)
    {
        const at = msg.messageChain[1];

        const text = msg.messageChain
            .filter(m => m.type === "Plain")
            .map(m => m.text)
            .join(" ");
        
        if (!text)
            return;

        if (at && at.type === "At" && at.target === ID)
        {
            console.log(`${group}.${sender} ask: ${text}`);

            const answer = await fetch(`${CHAT_API}/${group}`, {
                method: "POST",
                body: text,
            }).then(r => r.text());
            console.log(`Got answer: ${answer}`);

            connection.send(JSON.stringify({
                "syncId": 0,
                "command": "sendGroupMessage",
                "subcommand": null,
                "content": {
                    "sessionKey": sessionId,
                    "target": group,
                    "quote": quoteId,
                    "messageChain": [
                        { "type": "Plain", "text": answer },
                    ]
                }
            }));
        }
    }
    else
    {
        let text = "";
        for (let i = 1; i < msgChain.length; i++)
        {
            if (msgChain[i].type === "Plain")
            {
                text += msgChain[i].text + "\n";
            }
        }

        console.log(`${sender} ask: ${text}`);

        const answer = await fetch(`${CHAT_API}/${sender}`, {
            method: "POST",
            body: text,
        }).then(r => r.text());

        console.log(`Got answer: ${answer}`);
        
        connection.send(JSON.stringify({
            "syncId": 0,
            "command": "sendFriendMessage",
            "subcommand": null,
            "content": {
                "sessionKey": sessionId,
                "target": sender,
                "messageChain": [
                    { "type": "Plain", "text": answer },
                ]
            }
        }));
    }
}

ws.connect(`${MIRAI_API}/message?verifyKey=${VERIFY_KEY}&qq=${ID}`);

