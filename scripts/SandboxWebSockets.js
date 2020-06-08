//Dummy class used to test the web socket stuff

let webSockets = {};

($(function(){
    //Bind functions to buttons.
    $("#MakeWebSocket").click(AddNewWS);
    $("#DeleteButton").click(DeleteWebSockets);
    $("#NextPage").click(function(){
        window.location = "activity.html";
    });

    //Add a click handler on the buttons created in the display area. Access the button's parent (<p>) to delete the web socket.
    let displayArea = $("#display");
    displayArea.on("click touchstart", "button", function(event){
        let wsName = $(this).parent().text().split(" : ")[0];    //Get the text, split on " : " to get the name in [0] and the value in [1] and keep only the name.
        delete webSockets[wsName];  //Delete the web socket from the webSockets object.
        StoreWebSockets(webSockets);    //Update the local storage.
        $(this).parent().remove();   //Remove the element from the display area.
    });

    //When we first load the page, we populate the webSockets object with the saved web sockets (if they exist).
    webSockets = LoadWebSockets();
    //We display those web sockets.
    DisplayWebSockets(webSockets);
}));

//Empty the local storage, reset the webSockets object and update the display.
function DeleteWebSockets(){
    EmptyWebSocketStorage();
    webSockets = {}
    DisplayWebSockets(webSockets);
}

//Simple way to display the name and uri of each websocket in a "display" div.
function DisplayWebSockets(dictionary){
    let displayArea = $("#display");
    let elementDummy;
    let buttonDummy;
    //We clear the display area
    displayArea.empty();

    //Iterate on the object's properties and append them to the display area as <p>'s
    for(let key in dictionary){
        console.log("The key is: " + key + " and the value is " + dictionary[key]);
        elementDummy = document.createElement("p");
        elementDummy.textContent = key + " : " + dictionary[key];
        buttonDummy = document.createElement("button");
        buttonDummy.textContent = "Supprimer";
        elementDummy.append(buttonDummy);
        displayArea.append(elementDummy);
    }
}

//Function that lets the user enter a name and a URI for a websocket and puts the result in the cookies.
function AddNewWS(){
    //Regex from v1 to make sure the ip address is ok.
    let myRegex = /^ws:\/\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/; // test URI
    let wsName;
    let wsURI;

    wsName = prompt("Entrez un nom pour la source de données");
    //If the user pressed cancel, we return.
    if(wsName === null)
        return;
    //If no name, default value.
    if(wsName === undefined || wsName === ""){
        wsName = "Default WS name";
        alert("Un nom par défaut a été choisi: Default WS name")
    }
    wsURI = prompt("Entrez un URL pour la source de données (ws://ip:port)", "ws://");
    //If the user pressed cancel, we return.
    if(wsURI === null)
        return;
    //If no URI, default value.
    if(!myRegex.test(wsURI)){
        wsURI = "ws://127.0.0.1:8080";
        alert("Une valeur par défaut a été choisi: ws://127.0.0.1:8080");
    }

    //Add itt tto the webSockets, store it and update the display.
    webSockets[wsName] = wsURI;
    StoreWebSockets(webSockets);
    DisplayWebSockets(webSockets);
}
