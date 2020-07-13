//Class that removes or not parts of the html depending on the user's status (admin or not)

$(function(){
    //Check if admin
    let admin = GetState().admin;
    //Remove admin content if not admin.
    if(!admin){
        console.log("Not admin, removing admin content.");
        $(".admin").remove();
    }
})