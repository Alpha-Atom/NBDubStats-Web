var array = Array.apply(null, {length: 24}).map(Number.call, Number).map(function(n){return n+1});
var labels = Array.apply(null, {length:24}).map(Number.call, Number).map(function(n){return n+":00"});
var prev_t1 = -1;
var prev_t2 = -1;
var mySlider = $("input.slider").slider({
  ticks:array,
  ticks_labels:labels,
  range:true,
  tooltip:'hide'
});
mySlider.slider('setValue', [0,24]);
var e = mySlider.slider().on('slide', update_sval).data('slider');
$("#update").on('click', function(e) {
  populate_table(e);
  update_sval();
});
var update_sval = function () {
  sval = e.getValue();
  time1 = (sval[0]-1)+":00";
  time2 = (sval[1]-1)+":59";
  if (time1 == "0:00") {
    time1 = "the start of the day";
  }
  if (time2 == "23:59") {
    time2 = "the end of the day";
  }
  output = "Currently showing songs played from " + time1 + " until " + time2 + ". (To view all data, set max shown to a number less than 1).";
  $("#sval").html("<small>" + output + "</small>");
  return sval;
};
var populate_table = function(e) {
  e.preventDefault();
  $("#table-body").html("");
  sval = update_sval();
  t1 = sval[0]-1;
  t2 = sval[1];
  count = $("#count").val();
  sort = $("#sortby").val();
  switch (sort) {
      case "Total Score":
          sort = "ud";
          break;
      case "Grabs":
          sort = "gr";
          break;
      case "Plays":
          sort = "pl";
          break;
      case "Percentage Updubbed":
          sort = "pct";
          break;
  }
  c_slug = "";
  if (count != "") {
    if (count > 0) {
      c_slug = "c=" + count;
    }
  } else {
    c_slug = "c=300";
  }
  if (t1 == 0 && t2 == 24) {
    t_slug = "";
  } else {
    t_slug = "t1=" + t1 + "&t2=" + t2
  }
  s_slug = "sort=" + sort;
  total_slug = "http://mattcoles.io:3000/dubstats/?" + s_slug + ((t_slug != "") ? "&" + t_slug : "") + ((c_slug != "") ? "&" + c_slug : "");
  $.getJSON(total_slug, function (data) {
    song_list = data.songs;
    tr_list = [];
    for (var i = 0; i < song_list.length; i++) {
     var new_tr = document.createElement("tr");
     var name_td = document.createElement("td");
     name_td.innerHTML = '<a href="http://mattcoles.io/nbdubstats/song/?s=' + song_list[i].fkidtype + '">' + song_list[i].song_name + '</a>';
     var total_td = document.createElement("td");
     total_td.innerHTML = song_list[i].score;
     var grabs_td = document.createElement("td");
     grabs_td.innerHTML = song_list[i].grabs;
     var plays_td = document.createElement("td");
     plays_td.innerHTML = song_list[i].plays;
     var pct_td = document.createElement("td");
     pct_td.innerHTML = song_list[i].pct_up;
     var users_td = document.createElement("td");
     users_td.innerHTML = song_list[i].users;
     new_tr.appendChild(name_td);
     new_tr.appendChild(total_td);
     new_tr.appendChild(grabs_td);
     new_tr.appendChild(plays_td);
     new_tr.appendChild(pct_td);
     new_tr.appendChild(users_td);
     tr_list.push(new_tr);
    }
    $("#table-body").hide();
    for (var j = 0; j < tr_list.length; j++) {
      $("#table-body").append(tr_list[j]);
    }
    $("#table-body").fadeIn();
    $("#gen").html("Data was generated at: " + (new Date(Number.parseFloat(data.generated))).toString() + " dating back to " + (new Date(1457423565270)).toString() + ".");
  });
  e.target.blur();
}

$("#update").trigger('click');
update_sval();
