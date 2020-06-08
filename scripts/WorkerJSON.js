//Worker that handles receiving data from a data source and tagging it.

let receivedData = [];  //Array for the data received from the webSocket.
let selectedActivity;   //Current activity.
let subActivities = [];  //Array for the subActivity objects (Name, Start and Stop in each object).
let subActivityIndex = 0;   //Index of the current subActivity. Should start at 0 all the time.
let activityTimeStamps = {"Start":0, "Stop":0}; //Timestamps to use in case of no sub activities.
let webSocketInfo = {"Name":"", "URL":""};  //This worker's web socket info (name and url).
let webSocket;  //This worker's web socket.

onmessage = function(event){
    //Switch on data[0], because data[0] is always the "command".
    switch (event.data[0]) {
        case "Connect":
            webSocketInfo.Name = event.data[1];   //data[1] should be the web socket's name
            webSocketInfo.URL = event.data[2];    //data[2] should be the web socket's URL
            webSocket = new WebSocket(webSocketInfo.URL);
            //If the connection fails, send an error message.
            webSocket.onerror = function(event){
                postMessage(["Error", "Connection to web socket " + webSocketInfo.Name + " failed."]);
            }
            //If the connection is a success, send a success message.
            webSocket.onopen = function(event){
                postMessage(["Success", "Connected to web socket " + webSocketInfo.Name]);
            }

            webSocket.onmessage = function(event){
                //Push the parsed data in the data array (Reminder, parsed: string --> object).
                receivedData.push(JSON.parse(event.data));
                console.log(webSocketInfo.Name + " received data.");
            }
            break;
        case "Start":
            //data[1] should be a time stamp.
            //data[2] should be the activity (string).
            //data[3] should be the subActivities objects (stringyfied)
            selectedActivity = event.data[2];
            //If the stringyfied subActivities we received is an empty array ("[]"), we have an activity with no sub activities.
            if(event.data[3] === "[]"){
                activityTimeStamps.Start = event.data[1];
            }
            else{
                //If we received a array with stuff in it, parse it, put it in subActivities and set the first timeStamp.
                subActivities = JSON.parse(event.data[3]);
                subActivities[subActivityIndex].Start = event.data[1];
            }
            break;
        case "GetData":
            //Ask the web socket to send us a piece of data with a good time stamp.
            webSocket.send("Give me data please.");
            break;
        case "Next":
            //data[1] should be a time stamp
            //If we don't have sub activities, set activityTimeStamps.Stop.
            if(subActivities.length === 0){
                activityTimeStamps.Stop = event.data[1];
                FinishActivity();
                break;
            }
            //Set the timestamp of the currentSubActivity.Stop, go to the next activity and set the currentActivity.Start.
            subActivities[subActivityIndex].Stop = event.data[1];
            if(subActivityIndex >= subActivities.length - 1){
                FinishActivity();
            }
            else{
                subActivityIndex++;
                subActivities[subActivityIndex].Start = event.data[1];
            }
            break;
        case "Stop":
            //data[1] should be a time stamp.
            //If we don't have sub activities, set activityTimeStamp.
            if(subActivities.length === 0){
                activityTimeStamps.Stop = event.data[1];
                FinishActivity();
                break;
            }
            //Set the current sub activity's stop timestamp and move on to finish.
            subActivities[subActivityIndex].Stop = event.data[1];
            FinishActivity();
            break;
    }
}

function FinishActivity(){
    console.log("Finishing activity...");
    let foundTag = false;
    console.log("Sub activities info:");

    //We go over all the received data and give it an appropriate tag depending on it's timestamp.
    receivedData.forEach(function(item){
        let dataTime = Date.parse(item["TimeStamp"]);   //Try to parse the date.
        //Useful for local testing, could be deleted later.
        if(isNaN(dataTime)){    //If it failed, it must be a timestamp in the form of milliseconds so we just parse it as an int.
            dataTime = parseInt(item["TimeStamp"]);
        }
        //We check every sub activity to find one that matches the time stamp, if we have sub activities.
        if(subActivities.length !== 0){
            subActivities.forEach(function(sub){    //For each sub activity (sub) in subActivities.
                if(dataTime > sub.Start && dataTime <= sub.Stop){
                    console.log("Gave a sub activity to a tag!!!");
                    item["Tag"] = selectedActivity + " - " + sub.Name; //Remainder, for now, "item" is JSON an array of objects.
                    foundTag = true;
                }
            });
        }
        else{   //If we don't have sub activities..
            if(dataTime > activityTimeStamps.Start && dataTime <= activityTimeStamps.Stop){
                item["Tag"] = selectedActivity + " - no sub activity";
                foundTag = true;
            }
        }
        //TMP BECAUSE WE DON'T HAVE GOOD TIME STAMPS ON DATA --- If no sub activity tag matches, give a default.
        if(!foundTag)
            item["Tag"] = selectedActivity + " - " + "no sub activity";
        else
            foundTag = false;   //Set the flag back to false for the next iteration.
    })
    //After tagging, we format the data. **** More formatting might be necessary later.
    FormatData();
}

//Stringyfie the whole thing. If we still receive arrays of data with real data, do a formatting step. Else, it should be good.
function FormatData(){
    let fileName = webSocketInfo.Name + " - " + selectedActivity;
    let formattedData = JSON.stringify(receivedData)
    postMessage(["Finished", fileName, formattedData]);
    Reset();
}

//Reset some of the values to be ready for the next activity.
function Reset(){
    receivedData = [];
    subActivities = [];
    subActivityIndex = 0;
    activityTimeStamps = {"Start":0, "Stop":0};
    //For now, we send a message to the web socket so that it sends us "new" data.
    webSocket.send("Hello send me data pls.");
}