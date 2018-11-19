var routeList = [],
  newList = [],
  source, destination, tbody, tableContainer;

function init() {
  urlParams = new URLSearchParams(window.location.search);
  source = urlParams.get('source').trim();
  destination = urlParams.get('destination').trim();
  if (!source && !destination) {
    window.location = "/index.html";
  }
  tableContainer = document.getElementById("table-container");
}

function showTable(data) {
  routeList = JSON.parse(data).Routes;
  document.write("<table border='1' cellpadding='3' cellspacing='0'>");
  // console.log(routeList);
  routeList.forEach(_route => {
    document.write("<tr><td><b>" + _route.Route + "</b></td>");
    _route.Stops.forEach(_stop => {
      document.write("<td>" + _stop + "</td>");
      _stop = _stop.trim().charAt(0).toUpperCase() + _stop.slice(1);
      if (!newList.includes(_stop) && (_stop != ""))
        newList.push(_stop.trim());
    });
    document.write("</tr>");
  });
  document.write("</table>");
  window.stop();
}

function showStops(data) {
  routeList = JSON.parse(data).Routes;
  routeList.forEach(_route => {
    _route.Stops.forEach(_stop => {
      if (!newList.includes(_stop) && (_stop != ""))
        newList.push(_stop.trim());
    });
  });

  newList = newList.sort();
  document.write("<ol>");
  newList.forEach(item => {
    document.write(
      "<li>" +
      // "\""+
      item +
      // "\","
      "</li>"
    );
  })
  document.write("</ol>");
  console.log(newList.length);
  window.stop();
}

function toText(arr) {
  var string = "";
  for (let i = 0; i < arr.length; i++) {
    string += arr[i] + ((i < arr.length - 1) ? ", " : ".");
  }
  return string;
}

function getBetween(_value) {
  // list of stops between source and destination of route : _value.
  var ret = [],
    val = "";
  var s1 = _value.indexOf(source);
  var s2 = _value.indexOf(destination);
  if (s1 < s2) {
    ret = _value.slice(s1, s2 + 1);
  } else {
    ret = _value.slice(s2, s1 + 1).reverse();
  }
  for (let i = 0; i < ret.length; i++) {
    val += ret[i] + ((i < ret.length - 1) ? ", " : ".");
  }
  return val;
}

function bussesBetween(pointA, pointB) {
  busses = [];
  routeList.forEach(route => {
    if (route.Stops.includes(pointA) && route.Stops.includes(pointB)) {
      busses.push(route);
    }
  });
  return busses;
}

function findStops() {
  stopList = database.allStops;
}

function findRoute(database) {
  routeList = database.Routes;
  let busList = [];
  routeList.forEach(route => {
    if (route.Stops.includes(source) && route.Stops.includes(destination)) {
      busList.push(route);
    }
  });
  if(source!=destination){
    
    tableContainer.innerHTML = ('<table class="table striped-table table-hover table-condensed"><thead><tr><th>Route/Bus number</th><th>Stops</th></tr></thead><tbody id="tbody"></tbody></table>');
    tbody = document.getElementById("tbody");

    busList.forEach(bus => {
      var tr = document.createElement("tr");
      for (prop in bus) {
        if (prop === "From" || prop === "To" || prop==="Google/Bing Route Map")
          continue;
        // console.log(prop);
        var value = bus[prop];
        var td = document.createElement("td");
        var cell;
        if (Array.isArray(value)) {
          var arr = "";
          arr = getBetween(value);
          cell = document.createTextNode(arr);
        } else
          cell = document.createTextNode(value);
        td.appendChild(cell);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }
  if(source==destination){
    document.getElementById("content").innerHTML="<h3 class='container'>Source and Destinations are identical</h3>";
  }
  else{
    
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    var cell1 = document.createTextNode("Indirect Busses");
    td1.setAttribute("title","Use one of these busses to reach a connecting stop");
    td1.appendChild(cell1);
    tr.appendChild(td1);

    var td2 = document.createElement("td");
    var cell2 = document.createTextNode("Connecting from");
    td2.setAttribute("title","Use busses from one of these connecting stops to reach your destination");
    td2.appendChild(cell2);
    tr.appendChild(td2);
    tr.setAttribute("style", "text-decoration-line: underline");
    tbody.appendChild(tr);
    var sourceBus = [], //Busses from point A
      destBus = []; //Busses to point B
    routeList.forEach(route => {
      if (route.Stops.includes(source))
        sourceBus.push(route);
      if (route.Stops.includes(destination)) {
        destBus.push(route);
      }
    });
    var intersectStops = [];
    sourceBus.forEach(routeA => {
      var stops = [];
      destBus.forEach(routeB => {
        routeA.Stops.forEach(stopA => {
          routeB.Stops.forEach(stopB => {
            if (stopA === stopB && !stops.includes(stopA)) {
              stops.push(stopA);
              if (!intersectStops.includes(stopA))
                intersectStops.push(stopA);
            }
          });
        });
      });
      var tr = document.createElement("tr");
      var td1 = document.createElement("td");
      var cell1 = document.createTextNode(routeA.Route);
      td1.appendChild(cell1);
      tr.appendChild(td1);

      var td2 = document.createElement("td");
      var cell2 = document.createTextNode(stops.length == 0 ? "Not Available" : toText(stops));
      td2.appendChild(cell2);
      tr.appendChild(td2);

      tbody.appendChild(tr);
    });
    var connectList=document.getElementById("connect-bus");
    intersectStops.forEach(stop=>{
      var li=document.createElement("li");
      var text=document.createTextNode(stop);
      var link=document.createElement("a");
      link.setAttribute("href","map.html?source="+stop+"&destination="+destination);
      link.appendChild(text);
      li.appendChild(link);
      connectList.appendChild(li);
    });
  }
}
