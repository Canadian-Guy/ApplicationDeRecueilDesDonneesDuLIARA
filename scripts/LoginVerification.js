//Check if user is logged in and return true or false.
async function CheckIfLogged(){
    //Send a request to the server to check if the user is logged in, if it sends back an error, go back to login.html.
    let auth = GetState().token;

    //Post request to the server with the auth token as a header. The request will work if the token is good, else it will send an error and the user will be sent to the login page.
    try{
        let result = false;
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
                result = true;
            })
            .fail(function(jqXHR, data){
                result = false;
            });
        return result;
    }
    catch(error){
        console.log(error);
    }

}