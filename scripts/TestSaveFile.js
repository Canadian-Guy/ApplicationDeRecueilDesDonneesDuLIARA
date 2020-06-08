//Create zip object and feed it some files (.txt, .json, .csv, etc.) and at the end, create a .zip
//that contains all those files and download it.

let zip = new JSZip();

function AddFile(dataString, fileName){
    zip.file(fileName + ".json", dataString);
}

function RemoveFiles(){
    zip = new JSZip();
}

//TODO: Make generate files containing useful stuff (See v1, generate multiple files with workers)
//      Get folder name in cookies (Or somewhere else, but don't hardcode it I guess)
function MakeFile(){
    let FolderName = "Default name";
    let date = new Date();

    //Note that getMonth() returns the month but counting from 0 (December is 11)
    FolderName = FolderName + " " + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    console.log("Full folder name is: " + FolderName);

    zip.generateAsync({type: "blob"}).then(function(content){
        saveAs(content, FolderName + ".zip");
    });
}