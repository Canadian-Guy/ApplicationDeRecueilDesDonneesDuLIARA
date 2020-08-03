let state = {admin: false, token: ""};

$(function(){
    let form = $("#form");
    //Override the form's submit to make the post request by code.
    form.on("submit", function(processForm){
        //Prevent the default behavior of the send request.
        processForm.preventDefault();
        //$.post("http://jason-morin.com:4041/login", form.serialize(), function(data){ //TODO: Change url when server is hosted somewhere.
        $.post("http://localhost:4041/login", form.serialize(), function(data){ //TODO: Change url when server is hosted somewhere.
            //Put the received data into the state object (We should receive a bool and a string).
            state.admin = data.admin;
            state.token = "Bearer " + data.token;
            //Save the state in session storage (Not permanent).
            StoreState(JSON.stringify(state));
            //If the logged user is an admin, send him to the dashboard. Else, go to the activity screen.
            if (state.admin){
                window.location = "dashboard.html";
            }else{
                window.location = "dataReception.html";
            }
        })
            .fail(function(data){
                console.log(data.responseText);
            })
    });
});
