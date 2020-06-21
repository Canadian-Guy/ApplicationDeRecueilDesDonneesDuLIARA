//Class that handles the activities. They can be created/edited/deleted here. Change is saved in local storage.

let activities = {};
let selectedActivity = null;
let selectedSubActivity = null;

($(function(){
    //Bind functions to buttons.
    $("#CreateButton").click(AddNewActivity);
    $("#DeleteButton").click(DeleteActivity);
    $("#CreateSubButton").click(AddSubActivity);
    $("#DeleteSubButton").click(DeleteSubActivity);
    $("#MoveUp").click(MoveUp);
    $("#MoveDown").click(MoveDown)
    $("#PreviousPage").click(function(){
        window.location = "index.html";
    });
    $("#NextPage").click(function(){
        window.location = "dataReception.html";
    });
    let activityDisplay = $("#Activities");
    let subActivityDisplay = $("#SubActivities");

    activities = LoadActivities();
    //If no activities were stored, use the default ones.
    if(JSON.stringify(activities) === "{}"){
        console.log("Using default activities.");
        UseDefaultActivities();
    }
    console.log(activities);
    DisplayActivities();

    activityDisplay.change(function(){
        selectedActivity = $("#Activities option:selected").val();
        selectedSubActivity = null; //When we swap activity, reset de selected sub activity.
        DisplaySubActivities();
    });

    subActivityDisplay.change(function(){
        selectedSubActivity = $("#SubActivities option:selected").val();
    });
}));

function UseDefaultActivities(){
    $.get("DefaultValues.json", function(data){
        //Data["Activities"] should contains activities like this --> {"Activity1": ["sub1",sub2"], ...}
        activities = data["Activities"];
    }, "json")
        //When we're done getting the data, display it.
        .done(function(data){
            DisplayActivities();
            //Store the default sub activities.
            StoreActivities(activities);
        })
}

//Delete all activities.
function DeleteActivity(){
    //If there is no selected activity, we cannot delete it.
    if(selectedActivity === null){
        alert("Veuillez sélectionner une activité.");
        return;
    }
    delete activities[selectedActivity]
    //Save changes.
    StoreActivities(activities);
    //There is no more selected activity.
    selectedActivity = null;
    //If a sub activity was selected, it goes back to null.
    selectedSubActivity = null;
    DisplayActivities();
    DisplaySubActivities();
}

//Move the selected sub activity up in the option list.
function MoveUp(){
    let selectedSubIndex = $("#SubActivities option:selected").index()
    let subActivityDisplay = $("#SubActivities");
    let options = subActivityDisplay.children();    //Get an array with each options.

    //If the sub activity is at the top, we cannot move it up or there is no selected sub activity.
    if(selectedSubIndex === 0 || selectedSubActivity === null)
        return;

    //Swap the selected option with the one above.
    [options[selectedSubIndex], options[selectedSubIndex-1]] = [options[selectedSubIndex-1], options[selectedSubIndex]];

    //tmp array to extract labels from the options.
    let tmpSubs = [];
    for(let index = 0; index < options.length; index++){
        tmpSubs.push(options[index].label);
    }

    //Replace the saved sub activities with the swapped version.
    activities[selectedActivity] = tmpSubs;
    DisplaySubActivities();
    StoreActivities(activities);
}

//Move the selected sub activity down in the option list.
function MoveDown(){
    let selectedSubIndex = $("#SubActivities option:selected").index()
    let subActivityDisplay = $("#SubActivities");
    let options = subActivityDisplay.children();    //Get an array with each options.

    //If the sub activity is at the bottom, we cannot move it dow or there is no selected sub activity.
    if(selectedSubIndex === options.length - 1 || selectedSubActivity === null)
        return;

    //Swap the selected option with the one under.
    [options[selectedSubIndex], options[selectedSubIndex+1]] = [options[selectedSubIndex+1], options[selectedSubIndex]];    //Javascript is beautiful.

    //tmp array to extract labels from the options.
    let tmpSubs = [];
    for(let index = 0; index < options.length; index++){
        tmpSubs.push(options[index].label);
    }

    //Replace the saved sub activities with the swapped version.
    activities[selectedActivity] = tmpSubs;
    DisplaySubActivities();
    StoreActivities(activities);
}

//Delete the selected sub activity.
function DeleteSubActivity(){
    if(selectedSubActivity === null){
        alert("Veuillez sélectionner une sous-activité.");
        return;
    }
    let index = activities[selectedActivity].indexOf(selectedSubActivity);
    //Check if the activity exists, just to be sure.
    if(index !== -1){
        //Remove one element at the index of the sub activity that we want to delete.
        activities[selectedActivity].splice(index,1);
    }
    DisplaySubActivities(); //Update the display.
    StoreActivities(activities);    //We save the changes.
    selectedSubActivity = null; //The selected sub activity is gone, so we set it to null.
}

function LogActivities(){
    console.log(activities);
}

//Add a sub activity to the selected activity
function AddSubActivity(){
    let name;
    //If there is no selected activity, we cannot add a new sub activity.
    if(selectedActivity === null){
        alert("Veuillez sélectionner une activité.");
        return;
    }
    name = prompt("Entrez un nom pour la sous-activité.");
    //If the user pressed cancel, return.
    if (name === null)
        return;
    //If no name, default value.
    if (name === undefined || name === "")
        name = "Default sub activity name";

    //Add the sub activity to the object at activities[selectedActivity].
    activities[selectedActivity].push(name);
    selectedSubActivity = name;
    DisplaySubActivities();
    StoreActivities(activities);
}

//Create an option with each of an activity's sub activity and append it to the display area (select).
function DisplaySubActivities(){
    let display = $("#SubActivities");
    display.empty();
    console.log("Displaying sub activities!")
    //If the activity exists, display its sub activities.
    if(activities[selectedActivity]){
        activities[selectedActivity].forEach(function(subActivity){
            let dummyElement = document.createElement("option");
            dummyElement.value = subActivity;  //Value is the activity.
            dummyElement.title = subActivity;  //Title is the activity (Useful to see full name if too long).
            dummyElement.text = subActivity;   //What we display is the activity.
            //If the sub activity was selected, make sure it stays selected.
            if(selectedSubActivity === subActivity)
                dummyElement.selected = true;
            display.append(dummyElement);
        });
    }
}

function AddNewActivity(){
    let activityName;
    activityName = prompt("Entrez un nom pour l'activité");
    //If the user pressed cancel, we return.
    if(activityName === null)
        return;
    //If nothing was entered, default value.
    if(activityName === undefined || activityName === "")
        activityName = "Default activity name";

    //Add an empty array to activities so we can add sub activities later.
    activities[activityName] = [];
    selectedActivity = activityName;
    DisplayActivities();
    //Empty the sub activity display because brand new activities don't have any sub activities.
    $("#SubActivities").empty();
    StoreActivities(activities);
}

function DisplayActivities(){
    let display = $("#Activities");
    display.empty();
    for(let activity in activities){
        let dummyElement = document.createElement("option");
        dummyElement.value = activity;  //Value is the activity.
        dummyElement.title = activity;  //Title is the activity (Useful to see full name if too long).
        dummyElement.text = activity;   //What we display is the activity.
        //If the activity was selected, make sure it stays selected.
        if(selectedActivity === activity)
            dummyElement.selected = true;
        display.append(dummyElement);
    }
}

