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
var pct_ups = {};
var timestamps = [];

var getSongInfo = function() {
  $.getJSON("http://mattcoles.io:3000/song/?s=" + song, function(data) {
    $("div#unloaded").hide();
    Object.keys(data).forEach(function (key,index) {
      var updubs = data[key].score;
      var users = data[key].users;
      songname = data[key].songinfo.name;
      $("#songname").html(songname);
      $("title").html(songname);
      timestamps.push(Number.parseFloat(key));
      hour = (new Date(Number.parseFloat(key))).getHours();
      if (plays[hour] !== undefined) {
        plays[hour] += 1;
      } else {
        plays[hour] = 1;
      }
      if (timesupdubs[hour] !== undefined) {
        timesupdubs[hour] = ((timesupdubs[hour]*(plays[hour]-1)) + updubs) / plays[hour];
      } else {
        timesupdubs[hour] = updubs;
      }
      if (pct_ups[hour] !== undefined) {
        pct_ups[hour] = ((pct_ups[hour]*(plays[hour]-1)) + ((updubs/users)*100)) / plays[hour];
      } else {
        pct_ups[hour] = (updubs/users)*100;
      }
      if (data[key].songinfo.type == "youtube") {
        var source = "https://youtube.com/embed/" + data[key].songinfo.fkid;
        $("#sc").css('display', 'none');
        $("#yt").attr('src', source);
      } else if (data[key].songinfo.type == "soundcloud") {
        var apiurl = "https://api.soundcloud.com/tracks/" + data[key].songinfo.fkid;
        var source = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(apiurl) + "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
        $("#yt").css('display', 'none');
        $("#sc").attr('src', source);
      }
    });
    renderCharts();
  });
}

var renderCharts = function () {
  var dataplays = Array.apply(null, {length:24}).map(Number.call, Number).map(function(){return 0;});
  var datadubs = Array.apply(null, {length:24}).map(Number.call, Number).map(function(){return 0;});
  var datapcts = Array.apply(null, {length:24}).map(Number.call, Number).map(function(){return 0;});
  var ctx = document.getElementById("chart1").getContext("2d");
  var ctx2 = document.getElementById("chart2").getContext("2d");
  var ctx3 = document.getElementById("chart3").getContext("2d");
  Object.keys(plays).forEach(function(key, index) {
    dataplays[key] = plays[key];
  });
  Object.keys(timesupdubs).forEach(function(key, index) {
    datadubs[key] = timesupdubs[key];
  });
  Object.keys(pct_ups).forEach(function(key, index) {
    datapcts[key] = pct_ups[key];
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
  var data3 = {
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
        "data": datapcts
      }
    ]
  };
  var playsChart = new Chart(ctx).Line(data);
  var dubsChart  = new Chart(ctx2).Line(data2);
  var pctChart = new Chart(ctx3).Line(data3);
  timestamps.sort(function(a, b) {
    return b - a;
  });
  timestamps.forEach(function(ts) {
    var new_tr = document.createElement("tr");
    var date_td = document.createElement("td");
    date_td.innerHTML = new Date(ts);
    var timesince = document.createElement("td");
    timesince.innerHTML = timeSince(new Date(ts));
    new_tr.appendChild(date_td);
    new_tr.appendChild(timesince);
    $("#playtimes").append(new_tr);
  });
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

getSongInfo();
