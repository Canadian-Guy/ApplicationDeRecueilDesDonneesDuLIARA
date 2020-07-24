
//Take a type (alert-success, alert-warning, etc.) and a message to create a bootstrap alert.
function MakeAlert(type, message){
    //Get the jumbotron to add the alert at the top of it.
    let jumbo = $(".jumbotron");
    let dummyDiv = document.createElement("div");
    dummyDiv.innerText = message;    //message
    $(dummyDiv).addClass("alert alert-dismissible");
    $(dummyDiv).addClass(type);   //alert type.
    let dummyLink = document.createElement("a");
    dummyLink.href = "#";
    dummyLink.innerText = "×";    // "x" symbol
    $(dummyLink).attr("data-dismiss", "alert");
    $(dummyLink).attr("arial-label", "close");
    $(dummyLink).addClass("close");
    dummyDiv.append(dummyLink);
    jumbo.prepend(dummyDiv);

}