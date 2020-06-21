//Create zip object and feed it some files (.txt, .json, .csv, etc.) and at the end, try save it on the devise.

let zip = new JSZip();

function AddFile(dataString, fileName){
    zip.file(fileName + ".json", dataString);
}

function RemoveFiles(){
    zip = new JSZip();
}

function MakeFile(){
    let FolderName = "TaggedData_";
    let date = new Date();

    //Note that getMonth() returns the month but counting from 0 (December is 11)
    FolderName = FolderName + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    console.log("Full folder name is: " + FolderName);

    zip.generateAsync({type: "blob"}).then(function(content){
        saveAs(content, FolderName + ".zip");
    });
}