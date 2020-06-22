//Worker that handles receiving data from a data source and tagging it.

/*  * When access to the lab is granted, this class will have to be adapted depending on how the
    * lab's sockets work. (The way to get the data and the format of the data might be different.)
    * Getting the data will require sending messages to the web sockets to receive different info
    * on the sensors.
*/

importScripts("MissclickRemover.js")

let receivedData = [];  //Array for the data received from the webSocket.
let selectedActivity;   //Current activity.
let subActivities = [];  //Array for the subActivity objects (Name, Start and Stop in each object).
let subActivityIndex = 0;   //Index of the current subActivity. Should start at 0 all the time.
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
            //data[3] should be a sub activity name (might be "none", but that's ok.).
            selectedActivity = event.data[2];
            //Push the first sub activity in the array with its time stamp.
            subActivities.push({"Name": event.data[3], "Start": event.data[1], "Stop": 0});
            break;
        case "GetData":
            //Ask the web socket to send us a piece of data with a good time stamp.
            webSocket.send("Give me data please.");
            break;
        case "ChangeSub":   //*** Will probably end up replacing "next" ***
            //data[1] should be a time stamp.
            //data[2] should be a sub activity name. Can be "none", and it's ok.
            //Set the stop timestamp of the current activity.
            subActivities[subActivityIndex].Stop = event.data[1];
            subActivityIndex++;
            //Push the new sub activity with its start timestamp.
            subActivities.push({"Name": event.data[2], "Start": event.data[1], "Stop": 0});
            break;
        case "Next":
            //data[1] should be a time stamp.
            //data[2] should be the name of the sub activity (can be "none", but it's ok).
            //Set the timestamp of the currentSubActivity.Stop, push the new sub activity and add its "Start" timestamp.
            subActivities[subActivityIndex].Stop = event.data[1];
            subActivityIndex++;
            subActivities.push({"Name": event.data[2], "Start": event.data[1], "Stop": 0});
            break;
        case "Stop":
            //data[1] should be a time stamp.
            //Set the current sub activity's stop timestamp and move on to finish.
            subActivities[subActivityIndex].Stop = event.data[1];
            FinishActivity();
            break;
    }
}

//TODO: Send a minimum time in milliseconds to RemoveMissClicks as a second param.
//      Handle data that doesn't match any time stamp. (Careful for data received before/after activity, might have to disconnect WS).
function FinishActivity(){
    console.log("Finishing activity...");
    //Removing sub activities that have a very short time. (TMP --> For now, default value is 3sec.
    subActivities = RemoveMissClicks(subActivities);
    console.log(subActivities);

    //We go over all the received data and give it an appropriate tag depending on it's timestamp.
    receivedData.forEach(function(item){
        let dataTime = Date.parse(item["TimeStamp"]);   //Try to parse the date.
        //Useful for local testing, could be deleted later.
        if(isNaN(dataTime)){    //If it failed, it must be a timestamp in the form of milliseconds so we just parse it as an int.
            dataTime = parseInt(item["TimeStamp"]);
        }
        //We check every sub activity to find one that matches the time stamp.
        subActivities.forEach(function(sub){    //For each sub activity (sub) in subActivities.
            if(dataTime > sub.Start && dataTime <= sub.Stop){
                console.log("Gave a sub activity to a tag.");
                if(sub.Name === "none"){    //"none" is the sub activity when no sub activity is selected.
                    item["Tag"] = selectedActivity + " - no sub activity";
                }
                else{
                    item["Tag"] = selectedActivity + " - " + sub.Name;
                }
            }
        });
    });
    //After tagging, we format the data. **** More formatting might be necessary later.
    FormatData();
}

//Stringify the whole thing. If we still receive arrays of data with real data, do a formatting step. Else, it should be good.
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
}