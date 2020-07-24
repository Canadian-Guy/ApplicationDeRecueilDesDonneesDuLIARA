//Class to handle the local storage.

//Save local only data in local storage.
function StoreDataToBeSynchronised(data){
    //If we already have un-sync'd data
    if(localStorage.getItem("Data")){
        //Get the local data
        let tmp = JSON.parse(localStorage.getItem("Data"));
        //Append the new data to the old. Data should arrive as an array of objects, so tmp is an array and we push all the new objects into it.
        data.forEach(function(item){
            tmp.push(item);
        });
        //Save the change.
        localStorage.setItem("Data", JSON.stringify(tmp));
    }
    else{
        //If there was no local data, save the array under "Data".
        localStorage.setItem("Data", JSON.stringify(data));
    }
}

//Return the un-sync'd data for synchronisation. DeleteSynchronisedData should be called after if sync was a success.
function GetDataToBeSynchronised(){
    //Return the non parsed array (it needs to be a string to be send to the server) or false if no data was saved.
    return localStorage.getItem("Data") ? localStorage.getItem("Data") : false;
}

function DeleteSynchronisedData(){
    localStorage.removeItem("Data");
}

//Saves the state (bool to check if admin + token)
function StoreState(state){
    sessionStorage.setItem("State", state);
}

function DeleteState(){
    sessionStorage.removeItem("State");
}

//Return the state.
function GetState(){
    //Return the state, or false if there is no state saved. (If login is bypassed, no admin and no token.).
    return sessionStorage.getItem("State") ? JSON.parse(sessionStorage.getItem("State")) : {admin: false, token: ""};
}

//Remove "WebSockets" from storage.
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

//Use this to see what is storage under "WebSockets"
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

//Remove "Activities" from storage.
function EmptyActivities(){
    localStorage.removeItem("Activities");
}

//Takes an object, stringyfies it and sends it to local storage under "Commands".
function StoreCommands(objectToStore){
    localStorage.setItem("Commands", JSON.stringify(objectToStore));
    console.log("Stored this stringyfied object: " + JSON.stringify(objectToStore));
}

//Returns the stored commands, or an empty object if there is nothing stores under "Commands".
function LoadCommands(){
    return localStorage.getItem("Commands") ? JSON.parse(localStorage.getItem("Commands")) : {};
}

//Remove "Commands" from storage.
function EmptyCommands(){
    localStorage.removeItem("Commands");
}