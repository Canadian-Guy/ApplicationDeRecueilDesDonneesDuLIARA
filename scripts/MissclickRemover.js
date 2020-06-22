//Check for aberrations and remove them safely. "Recycle" its timestamps to remove it from the array like it was never there.
//TODO: ADD A DEFAULT TIME IN THE DEFAULT VALUES, MAKE EXEC SEND IT TO WORKERS ON CONNECT AND WORKERS SEND IT AS howLong.

//Takes an array and a number of millisecond minimum to consider an activity as valid.
function RemoveMissClicks(data, howLong){
    if(!howLong){
        //TMP, default value is 3sec.
        howLong = 3000;
    }
    for(let index = 0; index < data.length; index++){
        //If the activity lasted less than the time limit that was set, remove it.
        if(data[index]["Stop"] - data[index]["Start"] <= howLong){
            //For that that isn't the first or the last.
            if(index !== data.length - 1 || index !== 0){
                //Change the previous Stop to be the same as the current activity.
                data[index-1]["Stop"] = data[index]["Stop"];
                //Change the next Start to match when the current activity stopped.
                data[index+1]["Start"] = data[index]["Stop"];
                //Remove the data considered as a miss click.
                data.splice(index, 1);
            }
            //For the first piece of data.
            if(index === 0){
                //If the first activity was too short, pretend that the second one was the first.
                data[index+1]["Start"] = data[index]["Start"];
                //Remove the data considered as a miss click.
                data.splice(index, 1);
            }
            //For the last piece of data.
            if(index === data.length-1){
                //If the last activity was too short, pretend that the one before was the last one.
                //We don't need to alter time stamps.
                //Remove the data considered as a miss click.
                data.splice(index, 1);
            }
        }
    }
    return data;
}