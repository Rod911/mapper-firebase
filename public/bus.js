var query = "";
var busList = [];
var routeList;

async function findBus(database) {
    routeList = database.Routes;
    routeList.forEach(obj => {
        if (obj.Route.includes(query)) {
            busList.push(obj);
        }
    });
}

function list() {
    var divs = document.getElementById("buslist");
    busList.forEach(obj => {
        var div = document.createElement("div");
        var h3 = document.createElement("h3");
        h3.appendChild(document.createTextNode(obj.Route + (" (" + obj.From + " to " + obj.To + ")")));
        div.appendChild(h3);
        var h5 = document.createElement("h5");
        h5.appendChild(document.createTextNode("Stops:"));
        div.appendChild(h5);
        var ol = document.createElement("ul");
        obj.Stops.forEach(stop => {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(stop));
            ol.appendChild(li);
        });
        div.appendChild(ol);
        divs.appendChild(div);
    });
}

async function init() {
    urlParams = new URLSearchParams(window.location.search);
    query = urlParams.get('bus').trim();
    if (!query) {
        query = "";
    }
}
