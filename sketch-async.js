var URL = 'https://diverza.myjetbrains.com/youtrack';

function getProjects() {
  var projects = request(URL + "/rest/admin/project", 
    "GET",
    onProjectsResponse);
}

function onProjectsResponse(response) {
  if (response.currentTarget.status != 200)
    document.getElementById("Data").innerText = response.currentTarget.responseText;
  
  if ( !(response.currentTarget.readyState == 4 && response.currentTarget.status == 200) ) return;

  projects = JSON.parse(response.currentTarget.responseText);
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
  if (window.XMLHttpRequest) {
    xmlhttp=new XMLHttpRequest();
  } else {
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.withCredentials = true;

  return xmlhttp;
}

function request(url, method, callback, data) {
  var xhr = newXHR();

  if (method==null) method = "GET";

  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.setRequestHeader("Accept","application/json");
  xhr.onreadystatechange = callback;
  xhr.send(data);
  // return xhr.responseText;
}

// var parser=new DOMParser();

function loadTimeTracksFromProject(projPrefix) {
  var projIssues = request(URL + "/rest/issue/byproject/"+projPrefix+"?max=1000&filter=order+by%3A+updated+desc", 
    "GET",
    onIssuesResponse);
}

function onIssuesResponse(response) {
  if ( !(response.currentTarget.readyState == 4 && response.currentTarget.status == 200) ) return;

  projIssues = JSON.parse(response.currentTarget.responseText);

  console.log ("-----------------------------------------------\nTotal items: "+projIssues.length);
  setProgressLenght(projIssues.length);

  var timeTracks = "";
  for (var i = 0; i < projIssues.length; i++) {
    var issueTT = request(URL + "/rest/issue/"+ projIssues[i].id +"/timetracking/workitem/", 
      "GET", 
      onIssueTTResponse );
  }
}

function onIssueTTResponse(response) {
  if ( !(response.currentTarget.readyState == 4 && response.currentTarget.status == 200) ) return;
  incrementProgress();

  issueTT = JSON.parse(response.currentTarget.responseText);
  
  if (issueTT.length != 0) {
    var issue = findNodeByName(projIssues, issueTT[0].url.match("[A-Z]+-[0-9]+"));
    console.log(issue.id + "Reported " + issueTT.length + " time-tracking entries");
    var issuePseudoHeader = issue.id + "\t" + findNodeByName(issue.field, "Subsystem").value[0];

    appendTTRowOn(issuePseudoHeader, issueTT, document.getElementById("Data"));
  }
}

var currentProgress = 0;
var progressLenght = 0;
function setProgressLenght(lenght) {
  progressLenght = lenght;
  currentProgress = 0;
}
function incrementProgress() {
  currentProgress++;
  document.getElementById("progress").innerText = currentProgress + "/" + progressLenght;
}

function appendTTRowOn(issuePseudoHeader, data, element) {
  var timeTracks = "";

  for(var j = 0; j < data.length ; j++) {
    timeTracks += issuePseudoHeader;
    var d = new Date(data[j].date);
    timeTracks += "\t" + data[j].author.login;
    timeTracks += "\t" + data[j].date;
    timeTracks += "\t" + d.toLocaleString("es-mx", { month: "long" }) + "-" + d.getFullYear();
    timeTracks += "\t" + data[j].duration;
    timeTracks += "\t" + data[j].duration/60;
    timeTracks += "\t" + "'" + data[j].description + "'";
    timeTracks += "\n";
  }

  document.getElementById("Data").innerText += timeTracks;
}

function findNodeByName(obj, nodeName) {
  for (var i = obj.length - 1; i >= 0; i--) {
    if (obj[i].name == nodeName || obj[i].id == nodeName) {
      return obj[i];
    }
  };
}

function downloadTXTFileWith(data, filename) {
  downloadFileWith(data, filename + ".txt");
}

function downloadCSVFileWith(data, filename) {
  data = data.replace(/\t/g, ",");
  downloadFileWith(data, filename + ".csv");
}

function downloadFileWith(data, filename) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  pom.setAttribute('download', filename);
  pom.click();
}

function getDateString() {
  var d = new Date();
  return d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
}