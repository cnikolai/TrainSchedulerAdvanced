// Initialize Firebase
// Make sure that your configuration matches your firebase script version
// (Ex. 3.0 != 3.7.1)
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDhFEd12SX7VrvC6USDmVRcfEI8qY4crKE",
    authDomain: "trainscheduler-bd5b7.firebaseapp.com",
    databaseURL: "https://trainscheduler-bd5b7.firebaseio.com",
    projectId: "trainscheduler-bd5b7",
    storageBucket: "trainscheduler-bd5b7.appspot.com",
    messagingSenderId: "1075285241432"
  };
  firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

// Use the below initialValue
var trainName = "";
var destination = "";
var firstTrainTime = "00:00";
var frequency = 0;

// --------------------------------------------------------------

// At the initial load and on subsequent data value changes, get a snapshot of the current data. (I.E FIREBASE HERE)
// This callback keeps the page updated when a value changes in firebase.
 // Capture Button Click
 $("#add-train").on("click", function(event) {
  event.preventDefault();

  // Grabbed values from text boxes
  trainName = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  firstTrainTime = $("#train-time").val().trim();
  frequency = $("#frequency").val().trim();
  //alert(firstTrainTime);

  // Code for handling the push
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency
  });

   // Clears all of the text-boxes
   $("#train-name").val("");
   $("#destination").val("");
   $("#train-time").val("");
   $("#frequency").val("");
});

// Firebase watcher .on("child_added"
database.ref().on("child_added", function(snapshot) {
  // storing the snapshot.val() in a variable for convenience
  var sv = snapshot.val();

  // Console.loging the last user's data
  console.log(sv.trainName);
  console.log(sv.destination);
  console.log(sv.firstTrainTime);
  console.log(sv.frequency);

  updateTable(sv.trainName, sv.destination, sv.firstTrainTime, sv.frequency);

  // Handle the errors
}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});

function updateTable(trainName, destination, firstTrainTime, frequency) {
  //logic: date doesn't matter.  get HH:MM  just divide by 24 hours.  get now.  get diff from now (HH:MM) and first time train arrives(HH:MM) in minutes. divide by frequency.
  //we have now
  //we have time first train arrives
  //we have diff from now in minutes 
  //we have frequency
  //we want: time of next train in HH:MM AM format  

  //eg train arrives at 22:45.  
  //to get next train arrives
  //diff between now and 22:45, if current time < 15:45, then next train = 22:45, otherwise, if current time greater than 15:45 every 30 mintues (diff in minutes -), then want next train arrives at 5 hours and 45 minutes.  17:00 now. diff in minutes between now and 15:45 % frequency. while (diff in minutes between now and nextTrainTime=firstTrainTime > frequency, subtract frequency).  format nextTrainTime to AM,PN, and diff = minutes to next train.
  
  //does the calculations
  var nextArrivalTime = firstTrainTime;
  var minutesAway = 0; 
  var diffinminutes = 0;
  //var currentTime = moment().format("HH:MM");
  var timeFormat = "hh:mm";
  var arrivalTimeFormat = "hh:mm A";
  var convertedDate = moment(firstTrainTime, timeFormat);

  //alert(convertedDate.diff(moment(), "minutes"));
  if (moment().diff(convertedDate, "minutes") < 0) {
    console.log("now less than first train time");
    //next arrival time is firstTrainTime
    nextArrivalTime = moment(firstTrainTime, arrivalTimeFormat).format(arrivalTimeFormat);
    diffinminutes = -1*moment().diff(moment(firstTrainTime, timeFormat), "minutes");
    console.log("diff in mintues: " + diffinminutes);
  }
  else {
    console.log("now is greater than first train time");
    diffinminutes = moment().diff(convertedDate, "minutes");
    while (diffinminutes > frequency) {
      nextArrivalTime = convertedDate.add(frequency, "minutes");
      diffinminutes = moment().diff(moment(nextArrivalTime, timeFormat), "minutes");
      console.log("subtracted " + frequency + " minutes from time");
      console.log("next arrival time: " + nextArrivalTime);
    }
    //add one last number of minutes to time to get ahead of current time.  
    diffinminutes = -1*(diffinminutes - frequency);
    nextArrivalTime = convertedDate.add(frequency, "minutes");
    //alert("minutes to next train: " + diffinminutes)
    nextArrivalTime = moment(nextArrivalTime, arrivalTimeFormat).format(arrivalTimeFormat);
    //alert("next arrival time: " + nextArrivalTime);
  }
  minutesAway = diffinminutes;

  //updates the DOM
  var newrow = $("<tr>");
  var newth = $("<th>");
  newth.attr("scope", "row");
  newth.text(trainName);
  newrow.append(newth);
  var newtd = $("<td>");
  newtd.text(destination);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(frequency);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(nextArrivalTime);
  newrow.append(newtd);
  var newtd = $("<td>");
  newtd.text(minutesAway);
  newrow.append(newtd);
  $("#train-schedule>tbody").append(newrow);
}