var getUrlParameter = function(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
        }
      }
};

var timelabels = Array.apply(null, {length:24}).map(Number.call, Number).map(function(n){return n+":00"});
var song = getUrlParameter("s");
var songname;
var plays = {};
var timesupdubs = {};

var getSongInfo = function() {
  $.getJSON("http://mattcoles.io:3000/song/?s=" + song, function(data) {
    $("div#unloaded").hide();
    Object.keys(data).forEach(function (key,index) {
      var updubs = data[key].score;
      songname = data[key].songinfo.name;
      $("#songname").html(songname);
      hour = (new Date(Number.parseFloat(key))).getHours();
      if (plays[hour] !== undefined) {
        plays[hour] += 1;
      } else {
        plays[hour] = 1;
      }
      if (timesupdubs[hour] !== undefined) {
        timesupdubs[hour] = ((timesupdubs[hour]*plays[hour]-1) + updubs) / plays[hour];
      } else {
        timesupdubs[hour] = updubs;
      }
    });
    renderCharts();
  });
}

var renderCharts = function () {
  var dataplays = Array.apply(null, {length:24}).map(Number.call, Number).map(function(){return 0;});
  var datadubs = Array.apply(null, {length:24}).map(Number.call, Number).map(function(){return 0;});
  var ctx = document.getElementById("chart1").getContext("2d");
  var ctx2 = document.getElementById("chart2").getContext("2d");
  Object.keys(plays).forEach(function(key, index) {
    dataplays[key] = plays[key];
  });
  Object.keys(timesupdubs).forEach(function(key, index) {
    datadubs[key] = timesupdubs[key];
  });
  var data = {
    labels: timelabels,
    datasets: [
      {
        label: "Most Popular Hours by Plays",
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        "data": dataplays
      }
    ]
  };
  var data2 = {
    labels: timelabels,
    datasets: [
      {
        label: "Most Popular Hours by Plays",
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        "data": datadubs
      }
    ]
  };
  var playsChart = new Chart(ctx).Line(data);
  var dubsChart  = new Chart(ctx2).Line(data2);
}

getSongInfo();
