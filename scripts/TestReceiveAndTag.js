//Class that handles receiving and tagging the data via workers that connect to websocket and do most of the job.

let dataSources;    //For the stored web sockets.
let workers = []    //Array to store the workers.
let selectedActivity = null;    //Current activity.
let currentSubActivity = null; //Current sub activity, for display purpose.
let activities = {};    //Object with all the stored activities and all the sub activities.
let subActivities = []; //Array to store sub activities start and stop timestamps. Stop is not necessary, but it simplifies things.
let subActivityIndex = 0;   //Index of the current sub activity, always starts at 0.
let finishedWorkers = 0;    //Used determine if we're ready to make the file or if we must wait for other messages.

($(function(){
    //Bind functions to buttons.
    $("#Start").click(StartActivity);
    $("#NextSub").click(NextSubActivity);
    $("#Stop").click(StopActivity);
    $("#DebugData").click(DebugGetData);
    $("#PreviousPage").click(function(){
        window.location = "activity.html";
    })

    $("#Activities").change(function(){
        selectedActivity = $("#Activities option:selected").val();  //Get the selected activity
        subActivities = []; //We remove the previous sub activities.
        //Get the selected activity's sub activities.
        for(let sub in activities[selectedActivity]){
            let tmp = {"Name": sub, "Start":0, "Stop":0};   //Make an object with room for timestamps and add it to the sub activities.
            subActivities.push(tmp);
        }
        DisplaySubActivities();
    });

    //Load in all the data sources.
    dataSources = LoadWebSockets();
    //Load in all the activities.
    activities = LoadActivities();
    DisplayActivities();
    //Connect a web socket to every data source.
    ConnectWebSockets();

}));

//Temp function to get new data from the websocket.
function DebugGetData(){
    workers.forEach(function(item){
        item.postMessage(["GetData"]);
    });
}

//Create a worker per web socket. If the connection fails, the worker is terminated and removed. If all workers fail, go back to "index.html".
function ConnectWebSockets(){
    for(let webSocket in dataSources){
        let worker = new Worker("scripts/WorkerJSON.js");
        workers.push(worker);
        //Tell the worker to connect to a data source.
        worker.postMessage(["Connect", webSocket, dataSources[webSocket]]);
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
                    //If we don't have any workers left, everything failed. Go back to index.html.
                    if(workers.length === 0){
                        alert("La connection à échouée pour toutes les sources de données.");
                        window.location = "index.html";
                    }
                    break;
                case "Finished":
                    //data[1] should be the file name.
                    //data[2] should be the tagged and formatted data.
                    AddFile(event.data[2], event.data[1]);
                    finishedWorkers++;
                    //If every worker is done, we can make a file.
                    if(finishedWorkers === workers.length){
                        MakeFile();
                        Reset()
                    }
                    break;
            }
        }
    }
}

//Reset values to be ready for an other activity.
function Reset(){
    //Reset the activities related things. Note that we do not reset the activity, to avoid having no activity displayed on mobile.
    currentSubActivity = null;  //Current sub activity goes back to null.
    subActivityIndex = 0;   //Index goes back to 0 to be ready for the next activity.
    finishedWorkers = 0;
    //Reset the button (disabled/enabled).
    $("#Start").prop("disabled", false);
    $("#NextSub").prop("disabled", true);
    $("#Stop").prop("disabled", true);
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
    //Disable the "start" button.
    $("#Start").prop("disabled", true);
    //Send command "Start" to every workers.
    //Param0: "Start".
    //Param1: timeStamp.
    //Param2: selectedActivity.
    //Param3: JSON.stringyfie(subActivities).
    workers.forEach(function(item){
        item.postMessage(["Start", timeStamp, selectedActivity, JSON.stringify(subActivities)]);
    });

    //Keep track of the current sub activity for display purpose. Test necessary to handle activities with no sub.
    if(subActivities.length !== 0){
        currentSubActivity = subActivities[subActivityIndex];
        console.log("Starting activity: " + selectedActivity);
        console.log("Current sub activity: " + currentSubActivity.Name);
        let options = $("#SubActivities").children();
        //We check all the options and find the current activity to make it "selected".
        for(let option in options){
            if(options.hasOwnProperty(option)){
                if(options[option].value === currentSubActivity.Name){
                    options[option].selected = true;
                }
            }
        }
    }
    //If there are no sub activities, set it to null.
    else{
        currentSubActivity = null;
    }
}

//Go to the next sub activity. If there are no sub activities left or at all, finish the activity.
function NextSubActivity(){
    let timeStamp = Date.now();
    //Send message to each worker.
    workers.forEach(function(item){
        item.postMessage(["Next", timeStamp]);
    });
    //If we were on the last sub activity, the activity is over and we set the currentSubActivity to null.
    if(subActivityIndex >= subActivities.length - 1){
        currentSubActivity = null
        return;
    }
    let options = $("#SubActivities").children();
    //We check all the options and find the current activity to make it "not selected".
    for(let option in options){
        if(options.hasOwnProperty(option)){
            if(options[option].value === currentSubActivity.Name){
                options[option].selected = false;
            }
        }
    }
    //We keep track of the sub activity for display purpose.
    subActivityIndex += 1;
    currentSubActivity = subActivities[subActivityIndex];
    console.log("Next. Current sub activity: " + currentSubActivity.Name);
    //We now check all the options and find the current activity to make it "selected".
    for(let option in options){
        if(options.hasOwnProperty(option)){
            if(options[option].value === currentSubActivity.Name){
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
    for(let subActivity in activities[selectedActivity]){
        let dummyElement = document.createElement("option");
        dummyElement.value = subActivity;  //Value is the activity.
        dummyElement.title = subActivity;  //Title is the activity (Useful to see full name if too long).
        dummyElement.text = subActivity;   //What we display is the activity.
        display.append(dummyElement);
    }
}