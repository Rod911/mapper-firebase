let routeList = [],
  newList = [],
  fuzzyList, source, destination, tbody, tableContainer;

function init() {
  urlParams = new URLSearchParams(window.location.search);
  source = urlParams.get('source');
  destination = urlParams.get('destination');
  if (!source || !destination) {
    window.location = "index.html";
  }
  source = source.trim();
  destination = destination.trim();
  if (source == destination) {
    document.getElementById("content").innerHTML = "<h3 class='container'>Source and Destinations are identical</h3>";
    return false;
  }
  tableContainer = document.getElementById("table-container");
  return true;
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

function findRoute(database) {
  routeList = database.Routes;
  let list = [];
  database.allStops.forEach(stop => {
    list.push(stop);
  })
  fuzzyList = FuzzySet(list);
  let fuzzySource = fuzzyList.get(source);
  if (fuzzySource[0][0] <= 0.7) {
    let erString = `<h3>Could not find "${source}"</h3><h4>Try one of these</h4>`;
    erString += `<ul>`;
    for (const iterator of fuzzySource) {
      erString += `<li><a href='map.html?source=${iterator[1]}&destination=${destination}'>${iterator[1]}</a></li>`;
    }
    erString += `</ul>`
    document.getElementById("content").innerHTML = erString;
    console.log("Similarity Score for " + source + ": " + fuzzySource);
    return;
  } else {
    source = fuzzySource[0][1];
    let fuzzyDestination = fuzzyList.get(destination);
    if (fuzzyDestination[0][0] <= 0.7) {
      let erString = `<h3>Could not find "${destination}"</h3><h4>Try one of these</h4>`;
      erString += `<ul>`;
      for (const iterator of fuzzyDestination) {
        erString += `<li><a href='map.html?source=${source}&destination=${iterator[1]}'>${iterator[1]}</a></li>`;
      }
      erString += `</ul>`
      document.getElementById("content").innerHTML = erString;
      console.log("Similarity Score for " + destination + ": " + fuzzyDestination);
      return;
    } else {
      destination = fuzzyDestination[0][1];
    }
  }
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
        if (prop === "From" || prop === "To")
          continue;
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
            if (stopA === stopB && !stops.includes(stopA) && stopA !== source && stopB !== source && stopA !== source && stopB !== source) {
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
      if (stops.length > 0) {
        var cell2 = document.createTextNode(stops.join(", "));
        td2.appendChild(cell2);
        tr.appendChild(td2);
        
        tbody.appendChild(tr);
      }
    });
    let connectList = document.getElementById("indirect-bus");
    let h4 = document.createElement("h2");
    h4.textContent = "Switch busses at:";
    connectList.appendChild(h4);
    let ul = document.createElement("ul");
    intersectStops.forEach(stop=>{
      var li=document.createElement("li");
      var text=document.createTextNode(stop);
      var link=document.createElement("a");
      link.setAttribute("href","map.html?source="+stop+"&destination="+destination);
      link.appendChild(text);
      li.appendChild(link);
      ul.appendChild(li);
    });
    connectList.appendChild(ul);
  }
}
