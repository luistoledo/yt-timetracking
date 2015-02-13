// A wind direction vector
var wind;
// Circle position
var position;

function getProjects() {
  var projects = request("https://diverza.myjetbrains.com/youtrack/rest/admin/project", "GET");
  projects = JSON.parse(projects);
  // console.log (projects[2]);

  var select = document.getElementById("projects");
  for (var i = projects.length - 1; i >= 0; i--) {
    var option = document.createElement('option');
    option.text = projects[i].id;
    select.add(option, 0);
  }
}

function newXHR(){
  var xmlhttp;
  // if (window.XMLHttpRequest) {
  //   xmlhttp=new XMLHttpRequest();
  // }
  // else {
  //   xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  // }
  xmlhttp=new XMLHttpRequest();

  xmlhttp.withCredentials = true;

  return xmlhttp;
}

var xhr = newXHR();
function request(url, method, data) {
  if (method==null) method = "GET";

  xhr.open(method, url, false);
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.setRequestHeader("Accept","application/json");
  xhr.send(data);
  return xhr.responseText;
}

// var parser=new DOMParser();

function loadTimeTracksFromProject(projPrefix) {
  var projIssues = request("https://diverza.myjetbrains.com/youtrack/rest/issue/byproject/"+projPrefix+"?max=1000", "GET");
  projIssues = JSON.parse(projIssues);

  console.log ("-----------------------------------------------\nTotal issues: "+projIssues.length);

  var timeTracks = "";
  
  for (var i = 0; i < projIssues.length; i++) {
    var issueTTPseudoHeader = projIssues[i].id;

    subsystm =  findNodeByName(projIssues[i].field, "Subsystem").value[0];
    issueTTPseudoHeader += "\t" + subsystm;

    var issueTT = request("https://diverza.myjetbrains.com/youtrack/rest/issue/"+ projIssues[i].id +"/timetracking/workitem/", "GET");
    issueTT = JSON.parse(issueTT);

    console.log (projIssues[i].id + " : " + issueTT.length);

    for(var j = 0; j < issueTT.length ; j++) {
      timeTracks += issueTTPseudoHeader;
      var d = new Date(data[j].date);
      timeTracks += "\t" + issueTT[j].author.login;
      timeTracks += "\t" + (((issueTT[j].date-21600000)/86400000)+25569);
      timeTracks += "\t" + d.toLocaleString("es-mx", { month: "long" }) + "-" + d.getFullYear();
      timeTracks += "\t" + issueTT[j].duration;
      timeTracks += "\t" + issueTT[j].duration/60;
      timeTracks += "\t" + "'" + issueTT[j].description + "'";
      timeTracks += "\n";
      document.getElementById("Data").innerText = timeTracks;
    }
  }
  // document.getElementById("Data").innerText = timeTracks;
}

function findNodeByName(obj, nodeName) {
  for (var i = obj.length - 1; i >= 0; i--) {
    if (obj[i].name == nodeName) {
      return obj[i];
    }
  };
}

function downloadCSVFileWith(data, filenamePrefix) {
  var d = new Date();
  var fileDateName = d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
  var filename = filenamePrefix + "_" + fileDateName + ".csv";

  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  pom.setAttribute('download', filename);
  pom.click();
}
