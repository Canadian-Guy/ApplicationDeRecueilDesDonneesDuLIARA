//Class to handle the local storage.

function EmptyWebSocketStorage(){
    localStorage.removeItem("WebSockets");
}

//Returns the stored web sockets in an object or an empty object if there are no web sockets.
function LoadWebSockets(){
    return localStorage.getItem("WebSockets") ? JSON.parse(localStorage.getItem("WebSockets")) : {};
}

//Takes an object, stringyfies it and sends it to local storage under "WebSockets".
function StoreWebSockets(objectToStore){
    localStorage.setItem("WebSockets", JSON.stringify(objectToStore));
    console.log("Stored this stringyfied object: " + JSON.stringify(objectToStore));
}

function LogWebSockets(){
    webSockets = JSON.parse(localStorage.getItem("WebSockets"));
    console.log("The stored web sockets are: ");
    for(let key in webSockets){
        console.log(key + " : " + webSockets[key]);
    }
}

//Takes an object, stringyfies it and sends it to local storage under "Activities".
function StoreActivities(objectToStore){
    localStorage.setItem("Activities", JSON.stringify(objectToStore));
    console.log("Stored this stringyfied object: " + JSON.stringify(objectToStore));
}

//Returns the stored activities in an object or an empty object if there are no activities.
function LoadActivities(){
    return localStorage.getItem("Activities") ? JSON.parse(localStorage.getItem("Activities")) : {};
}

function EmptyActivities(){
    localStorage.removeItem("Activities");
}

//Takes an object, stringyfies it and sends it to local storage under "Commands".
function StoreCommands(objectToStore){
    localStorage.setItem("Commands", JSON.stringify(objectToStore));
    console.log("Stored this stringyfied object: " + JSON.stringify(objectToStore));
}

function LoadCommands(){
    return localStorage.getItem("Commands") ? JSON.parse(localStorage.getItem("Commands")) : {};
}

function EmptyCommands(){
    localStorage.removeItem("Commands");
}