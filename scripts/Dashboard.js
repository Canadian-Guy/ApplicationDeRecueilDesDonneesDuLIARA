//Add functions on dashboard buttons to navigate the app easily.

$(function(){
    $("#webSockets").click(function(){
        NavigateTo("webSockets.html")
    })
    $("#activities").click(function(){
        NavigateTo("activity.html")
    })
    $("#activityExecution").click(function(){
        NavigateTo("dataReception.html")
    })
    $("#registerUser").click(function(){
        NavigateTo("register.html")
    })
    $("#userManager").click(function(){
        NavigateTo("manageUsers.html")
    })
});

//Simply change the window.location to the param
function NavigateTo(page){
    window.location = page;
}