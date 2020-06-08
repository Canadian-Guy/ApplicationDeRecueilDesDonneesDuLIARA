//Class to handle making/logging/deleting cookies.

//Create a cookie. Note that they do not expire.
function CreateCookie(cName, cData){
    //Default values
    if (cName === undefined || cName === "")
        cName = "Nameless cookie";
    if (cData === undefined)
        cData = "Meaningless data";

    document.cookie = cName + "=" + cData;
    console.log("Created cookie: " + cName + "=" + cData);
}

//Show the cookie string in the console.
function LogCookies(){
    console.log("Cookies are: " + document.cookie);
}

//Quick way to delete cookies. Will only work with cookies with the default path. Not best practice.
function DeleteCookies(){
    console.log("Deleting the cookies...");
    let cookies = document.cookie.split(";");   //Cookies are separated by a semi-colon.

    for (let i = 0; i< cookies.length; i++){    //For each cookie, we find the position of "=" to find the name,
        let cookie = cookies[i];                //and we override it with an expired empty cookie.
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0,eqPos) : cookie;    //Get the name of the cookie
        document.cookie = name + "=;expires=thu, 01 Jan 1970 00:00:00 GMT"; //Override the cookie.
    }
    console.log("Cookies after deleting: " + document.cookie);
}