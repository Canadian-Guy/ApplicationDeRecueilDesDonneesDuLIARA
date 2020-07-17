//Class that handles executing activities, with voice commands included, via Workers.

let dataSources;    //For the stored web sockets.
let workers = []    //Array to store the workers.
let selectedActivity = null;    //Current activity.
let currentSubActivity = "none"; //Current sub activity, for display purpose.
let activities = {};    //Object with all the stored activities and all the sub activities.
let subActivities = []; //Array to store sub activities.
let formattedData = []; //Array to hold all the data once it is formatted before it is sent to the server.
let subActivityIndex = 0;   //Index of the current sub activity, always starts at 0.
let finishedWorkers = 0;    //Used determine if we're ready to make the file or if we must wait for other messages.
let usingDefaultWS = false;
let minTime;

//Arrays that will contain the various commands.
let commandsStart = [];
let commandsNext = [];
let commandsStop = [];
let commandsChangeSub = [];
let deselectWords = [];

//Object used to store and load commands with the storage API.
let commands = {"StartCommands":[], "NextCommands":[], "StopCommands":[], "ChangeSubCommands":[], "DeselectWords":[]};

//Voice recognition variables
let recognition;

($(function(){
    //TMP: Using this here for now because some changes require the storage to be updated. Old storage causes error.
    UseDefaultCommands();
    //Bind functions to buttons.
    $("#Start").click(StartActivity);
    $("#NextSub").click(NextSubActivity);
    $("#Stop").click(StopActivity);
    $("#DebugData").click(DebugGetData);
    $("#StartVoice").click(StartVocalRecognition);
    $("#StopVoice").click(StopVocalRecognition);
    $("#DeselectSub").click(DeselectSubActivity);
    $("#PreviousPage").click(function(){
        window.location = "activity.html";
    });
    //Using small hack to call functions with a param.
    $("#AddStartCommand").click(function(){
        AddCommand("Start");
    });
    $("#DefaultStartCommands").click(function(){
        ResetCommands("Start");
    });
    $("#DeleteStartCommand").click(function(){
        DeleteCommand("Start");
    });
    $("#AddNextCommand").click(function(){
        AddCommand("Next");
    });
    $("#DefaultNextCommands").click(function(){
        ResetCommands("Next");
    });
    $("#DeleteNextCommand").click(function(){
        DeleteCommand("Next");
    });
    $("#AddStopCommand").click(function(){
        AddCommand("Stop");
    });
    $("#DefaultStopCommands").click(function(){
        ResetCommands("Stop");
    });
    $("#DeleteStopCommand").click(function(){
        DeleteCommand("Stop");
    });

    $("#Activities").change(function(){
        selectedActivity = $("#Activities option:selected").val();  //Get the selected activity
        subActivities = activities[selectedActivity]; //We remove the previous sub activities.
        DisplaySubActivities();
    });

    $("#SubActivities").change(function(){
        let selectedSub = $("#SubActivities option:selected"); //Get the selected sub activity.
        currentSubActivity = selectedSub.val(); //Get its value.
        subActivityIndex = selectedSub.index(); //Get its index.
        //Tell the workers to change sub activity is an activity is started.
        if($("#Start").prop("disabled")) {//If the Start button is disabled, we're in an activity.
            ChangeSubActivity(currentSubActivity);
            console.log("Changing activity!");
        }
    });

    //If there are saved commands, use them.
    if(JSON.stringify(LoadCommands()) !== "{}"){
        commands = LoadCommands();
        console.log("Loaded commands: " + JSON.stringify(commands));
        //If there are start commands, use them.
        if(commands["StartCommands"].length !== 0)
            commandsStart = commands["StartCommands"];
        else
            ResetCommands("Start"); //Use default for start commands if none were saved.
        //If there are next commands, use them.
        if(commands["NextCommands"].length !== 0)
            commandsNext = commands["NextCommands"];
        else
            ResetCommands("Next");  //Use default for Next commands if none were saved.
        //If there are stop commands, use them.
        if(commands["StopCommands"].length !== 0)
            commandsStop = commands["StopCommands"];
        else
            ResetCommands("Stop");  //Use default for Stop commands if none were saved.
        //If there are changeSub commands, use them.
        if(commands["ChangeSubCommands"].length !== 0)
            commandsChangeSub = commands["ChangeSubCommands"];
        else
            ResetCommands("ChangeSub");
        if(commands["DeselectWords"].length !== 0)
            deselectWords = commands["DeselectWords"];
        else
            ResetCommands("Deselect");
    }
    else{
        //If no commands were saved, use default. In the future, default might always be used.
        console.log("Using default commands.")
        UseDefaultCommands();
    }
    //Display a list of the available voice commands.
    DisplayCommands();
    //Load in all the data sources.
    dataSources = LoadWebSockets();
    //If we didn't have anything in storage, use default.
    if(JSON.stringify(dataSources) === "{}"){
        usingDefaultWS = true;
        UseDefaultWebSockets();
    }
    //Load in all the activities.
    activities = LoadActivities();
    //If we didn't have anything in storage, use default.
    if(JSON.stringify(activities) === "{}"){
        UseDefaultActivities();
    }
    DisplayActivities();
    //Connect a web socket to every data source if it wasn't done elsewhere.
    if(!usingDefaultWS)
        ConnectWebSockets();
}));

//Temp function to get new data from the websocket.
function DebugGetData(){
    workers.forEach(function(item){
        item.postMessage(["GetData"]);
    });
}

function UseDefaultCommands(){
    //Get the default commands
    $.get("DefaultValues.json", function(data){
        //data["Commands"] should be an object with all the commands in it like so: {"StartCommands": ["command", ...], ...}.
        commands = data["Commands"];
    }, "json")
        //When we're done loading the data, save it.
        .done(function(){
            StoreCommands(commands);
            DisplayCommands();
        });
}

//Will be useful if the two first screens are skipped.
function UseDefaultWebSockets(){
    //Get the default web sockets.
    $.get("DefaultValues.json", function(data){
        //Data object should contains all the default web sockets like this --> {"name":"ws://ip:port",...}
        dataSources = data["WebSockets"];
    }, "json")
        //When we're done, we save the data.
        .done(function(){
            StoreWebSockets(dataSources);
            ConnectWebSockets();
        });
}

//Will be useful if the two first screens are skipped.
function UseDefaultActivities(){
    //Get the default activities
    $.get("DefaultValues.json", function(data){
        //Data["Activities"] should contains activities like this --> {"Activity1": ["sub1",sub2"], ...}
        activities = data["Activities"];
    }, "json")
        //When we're done, we save the data and display the activities.
        .done(function(){
            StoreActivities(activities);
            DisplayActivities();
        });
}

function AddCommand(category){
    let index;
    let command = prompt("Entez la nouvelle commande.");
    //If the user canceled or didn't enter a command, return.
    if(command === "" || command === null)
        return;
    switch(category){
        case "Start":
            //Check if the command already exists
            index = commandsStart.indexOf(command);
            //If the command doesn't exist, add it, save it and update the display.
            if(index === -1){
                commandsStart.push(command);
                commands["StartCommands"] = commandsStart;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
        case "Next":
            index = commandsNext.indexOf(command);
            if(index === -1){
                commandsNext.push(command);
                commands["NextCommands"] = commandsNext;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
        case "Stop":
            index = commandsStop.indexOf(command);
            if(index === -1){
                commandsStop.push(command);
                commands["StopCommands"] = commandsStop;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
    }
}

//Kind of use default, but for only one type of commands.
function ResetCommands(category){
    let tmpCommands;
    //Get the default commands
    $.get("DefaultValues.json", function(data){
        //data["Commands"] should be an object with all the commands in it like so: {"StartCommands": ["command", ...], ...}.
        tmpCommands = data["Commands"];
    }, "json")
        //When we're done loading the data, use the default values needed and save changes.
        .done(function(){
            StoreCommands(commands);
            switch(category){
                case "Start":
                    //Return to default values.
                    commandsStart = tmpCommands["StartCommands"];
                    commands["StartCommands"] = commandsStart;
                    break;
                case "Next":
                    commandsNext = tmpCommands["NextCommands"];
                    commands["NextCommands"] = commandsNext;
                    break;
                case "Stop":
                    commandsStop = tmpCommands["StopCommands"];
                    commands["StopCommands"] = commandsStop;
                    break;
                case "ChangeSub":
                    commandsChangeSub = tmpCommands["ChangeSubCommands"];
                    commands["ChangeSubCommands"] = commandsChangeSub;
                    break;
                case "Deselect":
                    deselectWords = tmpCommands["DeselectWords"];
                    commands["DeselectWords"] = deselectWords;
                    break;
            }
            //Save changes and display.
            StoreCommands(commands);
            DisplayCommands();
        });
}

//Check if command exists in the category, if it does, delete it and update the display.
function DeleteCommand(category){
    let index;
    let command = prompt("Entrez la commande à supprimer.");
    //Switch to work on the right set of commands.
    switch(category){
        case "Start":
            //Get the index of the command
            index = commandsStart.indexOf(command);
            //If the command was found, remove it, save the change and display the new set of commands.
            if(index !== -1){
                commandsStart.splice(index, 1);
                commands["StartCommands"] = commandsStart;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
        case "Next":
            index = commandsNext.indexOf(command);
            if(index !== -1){
                commandsNext.splice(index, 1);
                commands["NextCommands"] = commandsNext;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
        case "Stop":
            index = commandsStop.indexOf(command);
            if(index !== -1){
                commandsStop.splice(index, 1);
                commands["StopCommands"] = commandsStop;
                StoreCommands(commands);
                DisplayCommands();
            }
            break;
    }
}

function StartVocalRecognition(){
    //Enable the stop button and disable the start button.
    $("#StartVoice").prop("disabled", true);
    $("#StopVoice").prop("disabled", false);
    //Disable the action buttons (Add/delete commands) while we use the vocal recognition.
    $(".action-btn").prop("disabled", true);

    //Voice recognition stuff. From color changer example in the speech api documentation.
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    window.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    recognition = new SpeechRecognition();
    //Settings taken from example in the documentation.
    recognition.continuous = false;
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;    //default

    //Bind functions to speech recognition events.
    recognition.onresult = function(event){
        //Make a string with what was recognised.
        const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')

        //Check if the transcript contains a Start command.
        for(let index = 0; index < commandsStart.length; index++){
            //We execute the function only if the button is not disabled.
            if(!$("#Start").prop("disabled") && transcript.includes(commandsStart[index])){
                StartActivity();
                break;  //Break out of the loop to avoid calling the function more than once.
            }
        }

        //Check if the transcript contains a Next command.
        for(let index = 0; index < commandsNext.length; index++){
            //We only do something is the button is enabled.
            if(!$("#NextSub").prop("disabled") && transcript.includes(commandsNext[index])){
                NextSubActivity();
                break;  //Break out of the loop to avoid calling the function more than once.
            }
        }

        //Check if the transcript contains a Stop command
        for(let index = 0; index < commandsStop.length; index++){
            //We only do something if the button is enabled
            if(!$("#Stop").prop("disabled") && transcript.includes(commandsStop[index])){
                StopActivity();
                break;  //Break out of the loop to avoid calling the function more than once.
            }
        }

        //Check if the transcript contains a ChangeSub commands.
        for(let index = 0; index < commandsChangeSub.length; index++){
            //We only do something if the button is enabled
            if(!$("#Stop").prop("disabled") && transcript.includes(commandsChangeSub[index])){
                //Before checking for a sub activity, check for a deselect word.
                for(let deselectIndex = 0; deselectIndex < deselectWords.length; deselectIndex ++){
                    if(transcript.includes(deselectWords[deselectIndex])){
                        DeselectSubActivity();
                    }
                }
                //If we did get the change sub command, check if the command contains the name of a sub activity.
                for(let subIndex = 0; subIndex < subActivities.length; subIndex ++){
                    if(transcript.includes(subActivities[subIndex])){
                        //Set the current sub activity.
                        currentSubActivity = subActivities[subIndex];
                        //Deselect the old sub activity.
                        $("#SubActivities option:selected").prop("selected", false);
                        //Get all the options to make the new sub activity "selected".
                        let options = $("#SubActivities").children();
                        //Check all the options and find the current activity to make it "selected".
                        for(let option in options){
                            if(options.hasOwnProperty(option)){
                                if(options[option].value === currentSubActivity){
                                    options[option].selected = true;
                                }
                            }
                        }
                        //Tell the workers to change the sub activity.
                        ChangeSubActivity(subActivities[subIndex]);
                        //Break, we only change sub activity once per command.
                        break;
                    }
                }
            }
        }
    }
    //When the recognition stops, start it again to get continuous recognition. Causes weird behavior on mobile, because
    //a sound is played whenever the recognition starts and ends, making it look like the app is broken.
    recognition.onend = function(){
        recognition.start();
    }

    recognition.onerror = function(event) {
        console.log('Error occurred in recognition: ' + event.error);
    }

    //Start "recognising"
    recognition.start();
}

function StopVocalRecognition(){
    //Enable the start button and disable the stop button.
    $("#StartVoice").prop("disabled", false);
    $("#StopVoice").prop("disabled", true);
    //Re enable the command buttons when we are not using the vocal recognition.
    $(".action-btn").prop("disabled", false);

    //remove the onend function so we can stop the vocal recognition.
    recognition.onend = null;
    recognition.stop();
}

//Display the grammar associated with each command.
function DisplayCommands(){
    let startCommandsDisplay = $("#StartCommands");
    let nextCommandsDisplay = $("#NextCommands");
    let stopCommandsDisplay = $("#StopCommands");
    let commandsString;
    //Display the start commands.
    commandsString = commandsStart.join(" - ");
    startCommandsDisplay.text(commandsString);
    //Display the next commands.
    commandsString = commandsNext.join(" - ");
    nextCommandsDisplay.text(commandsString);
    //Display the stop commands.
    commandsString = commandsStop.join(" - ");
    stopCommandsDisplay.text(commandsString);
}

//Create a worker per web socket. If the connection fails, the worker is terminated and removed. If all workers fail, go back to "index.html".
function ConnectWebSockets(){
    //Get the minimum time of an activity for error mitigation.
    $.get("DefaultValues.json", function(data){
        //Data["MinimumTime"] should contain a time in milliseconds (int).
        minTime = data["MinimumTime"];
    }, "json")
        //When we're done, we can actually connect the web sockets.
        .done(function(){
            for(let webSocket in dataSources){
                let worker = new Worker("scripts/WorkerJSON.js");
                workers.push(worker);
                //Tell the worker to connect to a data source.
                worker.postMessage(["Connect", webSocket, dataSources[webSocket], minTime]);
                worker.onmessage = function(event){
                    //Switch on data[0] because the command should be there.
                    switch (event.data[0]) {
                        case "Error":
                            //We output all the data.
                            console.log("Error from worker: " + event.data);
                            //If the websocket didn't connect, we need to kill the worker.
                            let index = workers.indexOf(worker);    //Get the worker's index.
                            if(index > -1){     //If we did find the worker, remove it.
                                workers.splice(index, 1);   //Remove one item at the worker's index.
                            }
                            worker.terminate();
                            console.log("Worker was terminated.");
                            /*
                            //If we don't have any workers left, everything failed. Go back to index.html. **** Probably tmp ****
                            if(workers.length === 0){
                                alert("La connection à échouée pour toutes les sources de données.");
                                window.location = "index.html";
                            }
                            */
                            break;
                        case "Finished":
                            //TODO: HANDLE FAILURE + SYNC
                            //data[1] should be the file name.
                            //data[2] should be the tagged and formatted data.
                            //Push the received data into an array. forEach to avoid having an array of arrays.
                            let tmpArray = JSON.parse(event.data[2]);
                            tmpArray.forEach(function(item){
                                formattedData.push(item);
                            })
                            //Make a file with the file name and the data. (For local storage).
                            AddFile(event.data[2], event.data[1]);
                            finishedWorkers++;
                            //If every worker is done, we can make a file.
                            if(finishedWorkers === workers.length){
                                //Send the data to the server
                                let auth = GetState().token;
                                $.ajax({
                                    url: 'http://localhost:4041/save',    //TODO: Change url when server is hosted somewhere.
                                    type: 'post',
                                    data: {data: JSON.stringify(formattedData)},
                                    headers: {
                                        Authorization: auth
                                    },
                                    dataType: 'json',
                                })
                                    .success(function(){
                                        console.log("Success");
                                    })
                                    .fail(function(jqXHR, data){
                                        console.log("Failed to send data to server");
                                        //TODO: Store in local storage to sync later.
                                    });

                                MakeFile();
                                Reset()
                            }
                            break;
                    }
                }
            }
        });
}

//Reset values to be ready for an other activity.
function Reset(){
    //Reset the activities related things. Note that we do not reset the activity, to avoid having no activity displayed on mobile.
    currentSubActivity = "none";  //Current sub activity goes back to null.
    subActivityIndex = 0;   //Index goes back to 0 to be ready for the next activity.
    finishedWorkers = 0;
    formattedData = [];
    //Reset the button (disabled/enabled).
    $("#Start").prop("disabled", false);
    $("#NextSub").prop("disabled", true);
    $("#Stop").prop("disabled", true);
    $("#Activities").prop("disabled", false);
    //Display the sub activities, to make sure they are displayed correctly with none selected.
    DisplaySubActivities();
    RemoveFiles();
}

function StartActivity(){
    let timeStamp = Date.now();
    //If no activity is selected, return.
    if(selectedActivity === null){
        alert("Please select an activity");
        return;
    }
    //Enable the "next" and "stop" buttons.
    $("#NextSub").prop("disabled", false);
    $("#Stop").prop("disabled", false);
    //Disable the "start" button and the activity display.
    $("#Start").prop("disabled", true);
    $("#Activities").prop("disabled", true);
    //Send command "Start" to every workers.
    //Param0: "Start".
    //Param1: timeStamp.
    //Param2: selectedActivity.
    //Param3: sub activity.
    workers.forEach(function(item){
        item.postMessage(["Start", timeStamp, selectedActivity, currentSubActivity]);
    });

    //Keep track of the current sub activity and display it.
    if(subActivities.length !== 0){
        console.log("Starting activity: " + selectedActivity);
        console.log("Current sub activity: " + currentSubActivity);
        let options = $("#SubActivities").children();
        //We check all the options and find the current sub activity to make it "selected".
        for(let option in options){
            if(options.hasOwnProperty(option)){
                if(options[option].value === currentSubActivity){
                    options[option].selected = true;
                }
            }
        }
    }
    //If there are no sub activities, set it to "none".
    else{
        currentSubActivity = "none";
    }
}

function DeselectSubActivity(){
    //Set the current sub activity to "none" and display the sub activities to make sure the display is ok.
    currentSubActivity = "none";
    DisplaySubActivities();
    //Tell the workers to change sub activity is an activity is started.
    if($("#Start").prop("disabled")) //If the Start button is disabled, we're in an activity.
        ChangeSubActivity("none");
}

//Select a new sub activity.
function ChangeSubActivity(newSub){
    let timeStamp = Date.now();
    //Send Change sub to every workers.
    //Param0: "ChangeSub".
    //Param1: timeStamp.
    //Param2: newSub.
    workers.forEach(function(item){
        item.postMessage(["ChangeSub", timeStamp, newSub]);
    })
}

//Go to the next sub activity. If there are no sub activities left or at all, finish the activity.
function NextSubActivity(){
    let timeStamp = Date.now();
    //If we don't have a selected sub activity, we cannot really "next".
    if(currentSubActivity === "none"){
        return;
    }

    //If we were on the last sub activity, the activity is over so we notify the workers and set the current sub to null.
    if(subActivityIndex >= subActivities.length - 1){
        StopActivity();
        currentSubActivity = "none"
        return; //Return, because the activity is over and the StopActivity handled the rest (Reset() included).
    }
    let options = $("#SubActivities").children();
    //We check all the options and find the current activity to make it "not selected".
    for(let option in options){
        if(options.hasOwnProperty(option)){
            if(options[option].value === currentSubActivity){
                options[option].selected = false;
            }
        }
    }
    //We keep track of the sub activity.
    subActivityIndex += 1;
    currentSubActivity = subActivities[subActivityIndex];
    //We send the new sub activity to the workers.
    //Param0: "Next".
    //Param1: timeStamp.
    //Param2: currentSubActivity.
    workers.forEach(function(item){
        item.postMessage(["Next", timeStamp, currentSubActivity]);
    });
    console.log("Next. Current sub activity: " + currentSubActivity);
    //We now check all the options and find the current activity to make it "selected".
    for(let option in options){
        if(options.hasOwnProperty(option)){
            if(options[option].value === currentSubActivity){
                options[option].selected = true;
            }
        }
    }
}

//Add a timestamp if necessary
function StopActivity(){
    let timeStamp = Date.now();
    //Send message to each worker.
    workers.forEach(function(item){
        item.postMessage(["Stop", timeStamp]);
    });
    console.log("Stop activity");
    Reset();
}

//Display each activity in a select.
function DisplayActivities(){
    let display = $("#Activities");
    display.empty();
    for(let activity in activities){
        let dummyElement = document.createElement("option");
        dummyElement.value = activity;  //Value is the activity.
        dummyElement.title = activity;  //Title is the activity (Useful to see full name if too long).
        dummyElement.text = activity;   //What we display is the activity.
        //If we display with a selected activity, make sure it is selected.
        if(activity === selectedActivity)
            dummyElement.selected = true;
        display.append(dummyElement);
    }
}

//Create an option with each of an activity's sub activity and append it to the display area (select).
function DisplaySubActivities(){
    let display = $("#SubActivities");
    //Small hack to make display more consistent on mobile. (To prevent "ghost" sub activities)
    let mobileHackElement = document.createElement("option");
    mobileHackElement.text="";
    mobileHackElement.selected = true;
    display.append(mobileHackElement);
    //End of small hack.
    display.empty();
    activities[selectedActivity].forEach(function(subActivity){
        let dummyElement = document.createElement("option");
        dummyElement.value = subActivity;  //Value is the activity.
        dummyElement.title = subActivity;  //Title is the activity (Useful to see full name if too long).
        dummyElement.text = subActivity;   //What we display is the activity.
        display.append(dummyElement);
    });
}