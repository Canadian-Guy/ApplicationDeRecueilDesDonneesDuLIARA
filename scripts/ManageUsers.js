//Load the users from the data base into a table and allow to edit their status (admin or not) and delete them.




$(function(){
    GetUsers();
})

function GetUsers(){
    //Get request to /Users
    let auth = GetState().token;
    $.ajax({
        url: 'http://jason-morin.com:4041/users',    //TODO: Change url when server is hosted somewhere.
        type: 'GET',
        data: "",
        headers: {
            Authorization: auth
        },
        dataType: 'json',
    })
        .success(function(jqXHR){
            console.log("Success");
            DisplayUsers(jqXHR);
        })
        .fail(function(jqXHR, data){
            console.log("Failed");
            console.log(data);
            console.log(jqXHR.responseText);
        });
}

//Display the users. Data should be an array of user objects {username, status}.
function DisplayUsers(data){
    let tableBody = $("#tableBody");
    tableBody.empty();
    for(let i = 0; i < data.length; i++){
        //Create the tr element that's going to be appended to the body.
        let tr = document.createElement("tr");

        //Create the td for the user's username.
        let col1 = document.createElement("td");
        col1.innerText = data[i].userName;

        //Create the td for the user's status (Admin or Regular).
        let col2 = document.createElement("td");
        col2.innerText = data[i].admin ? "Admin" : "Régulier";

        //Create the td that holds the control buttons.
        let col3 = document.createElement("td");
        $(col3).addClass("text-right");

        //Create the first button and set it's attributes
        let statusButton = document.createElement("button");
        statusButton.innerText = "Changer Status";
        $(statusButton).addClass("btn-primary");
        statusButton.onclick = function(){
            //parent.sibling[1] is the <td> with the status.
            console.log($(statusButton).parent().siblings()[1].innerText);
            EditStatus($(statusButton).parent().siblings()[0].innerText, 
            $(statusButton).parent().siblings()[1].innerText);
        }

        //Create the second button and set it's attributes.
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Supprimer";
        $(deleteButton).addClass("btn-danger");
        deleteButton.onclick = function(){
            //parent.siblings[0] is  the <td> with the userName.
            console.log($(deleteButton).parent().siblings()[0].innerText);
            DeleteUser($(deleteButton).parent().siblings()[0].innerText);
        }

        //Append all elements in the right order, to finally append them to the table body.
        tr.append(col1);
        tr.append(col2);
        col3.append(statusButton);
        col3.append(deleteButton);
        tr.append(col3);
        tableBody.append(tr);
    }
}

function EditStatus(user, currentStatus){
    //if the current status is "Admin", send  "false" in request. Else, send "true".
    let payload = {userName:user, admin:"true"};
    if(currentStatus.toLowerCase() === "admin")
        payload.admin = false;

        let auth = GetState().token;
    $.ajax({
        url: 'http://jason-morin.com:4041/editUserStatus',    //TODO: Change url when server is hosted somewhere.
        type: 'POST',
        data: payload,
        headers: {
            Authorization: auth
        },
        dataType: 'json',
    })
        .success(function(jqXHR){
            console.log("Success");
            console.log(jqXHR);
            //Get updated users.
            GetUsers();
        })
        .fail(function(jqXHR, data){
            console.log("Failed");
            console.log(jqXHR.responseText);
        });
}

function DeleteUser(user){
    let auth = GetState().token;
    $.ajax({
        url: 'http://jason-morin.com:4041/deleteUser',    //TODO: Change url when server is hosted somewhere.
        type: 'POST',
        data: {userName:user},
        headers: {
            Authorization: auth
        },
        dataType: 'json',
    })
        .success(function(jqXHR){
            console.log("Success");
            console.log(jqXHR);
            //Get Updated users.
            GetUsers();
        })
        .fail(function(jqXHR, data){
            console.log("Failed");
            console.log(jqXHR.responseText);
        });
}

/* reference for what a "tr" should look like.
<tr>
    <td>This is a very very very long UserName</td>
    <td>Admin</td>
    <td class="text-right">
        <button class="btn-primary">Changer Status</button>
        <button class="btn-danger">Supprimer</button>
    </td>
</tr>
*
* */