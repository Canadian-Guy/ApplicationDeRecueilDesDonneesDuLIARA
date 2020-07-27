//Change the color of the page's jumbotrons for a period of time to give visual feedback.
function ChangeJumboColor(color, time){
    let jumbo = $(".jumbotron");
    //Change the color of any jumbotron to "color".
    jumbo.css("backgroundColor", color)
    //After "time" milliseconds, change the color back.
    setTimeout(function(){
        jumbo.css("backgroundColor", "");
    }, time);
}