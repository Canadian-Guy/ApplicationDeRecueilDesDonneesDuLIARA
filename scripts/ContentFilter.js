//Class that removes or change parts of the html depending on the user's status (admin or not), logged in or not.

$(function(){
    //Check if admin
    let admin = GetState().admin;
    //Remove admin content if not admin.
    if(!admin){
        console.log("Not admin, removing admin content.");
        $(".admin").remove();
    }
    CheckIfLogged();
})

//Add a login or a logout button to the page, depending on the stored state.
function CheckIfLogged(){
    //Get the button's div
    let buttonDiv = $("#LoginLogout");
    //Check if there's a token saved. If so, we're logged, else, we're not.
    if(GetState().token) {
        //Create the button
        let buttonDummy = document.createElement("button");
        buttonDummy.textContent = "Se déconnecter";
        //Add the logout function
        buttonDummy.onclick = function(){
            //Remove the state from the session storage.
            DeleteState();
            //Return to the login window.
            window.location = "login.html"
        }
        buttonDiv.append(buttonDummy);
    }else{
        //Create the button
        let buttonDummy = document.createElement("button");
        buttonDummy.textContent = "Se connecter";
        //Add the login function
        buttonDummy.onclick = function(){
            //Just go to the login window.
            window.location = "login.html";
        }
        buttonDiv.append(buttonDummy);
    }
}