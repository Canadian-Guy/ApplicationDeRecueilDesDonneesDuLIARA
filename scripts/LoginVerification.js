//Send a request to the server to check if the user is logged in, if it sends back an error, go back to login.html.
let auth = GetState().token;

//Post request to the server with the auth token as a header. The request will work if the token is good, else it will send an error and the user will be sent to the login page.
$.ajax({
    url: 'http://localhost:4041/getProfile',    //TODO: Change url when server is hosted somewhere.
    type: 'post',
    data: "",
    headers: {
        Authorization: auth
    },
    dataType: 'json',
})
    .success(function(){
        console.log("Success");
    })
    .fail(function(jqXHR, data){
        alert("Une erreur est survenue, veuillez vous reconnecter.");
        window.location = "login.html";
    });