
$(function(){
    let form = $("#form");
    //Override the form's submit to make the post request by code.
    form.on("submit", function(processForm){
        //Prevent the default behavior of the send request.
        processForm.preventDefault();

        let psw = $("#password").val();
        let pswConfirm = $("#confirmPassword").val();
        //Check if the password was confirmed correctly.
        if(psw === pswConfirm){
            let auth = GetState().token;
            $.ajax({
                url: 'http://jason-morin.com:4041/register',
                type: 'post',
                data: form.serialize(),
                headers: {
                    authorization: auth
                },
                dataType: 'json',
            })
                .success(function(){
                    console.log("Registered user");
                    //If synchronisation worked, we can delete the local data.
                    MakeAlert("alert-success", "Utilisateur créé.");
                })
                .fail(function(jqXHR, data){
                    let errorMessage = jqXHR.responseText;
                    MakeAlert("alert-danger", errorMessage.message);
                    console.log(errorMessage.message);
                });
        }else{
            MakeAlert("alert-danger", "La confirmation du mot de passe doit être identique au mot de passe.");
        }

    })
});
