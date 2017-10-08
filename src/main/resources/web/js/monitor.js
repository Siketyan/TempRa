getJSON(
  "",
  function (res) {
    setData(res.temp, res.hum, res.pres);

    var port = res.port;
    var protocol, addr;
    if (location.hostname === "monitor.siketyan.me") {
      protocol = "wss://";
      addr ="/socket";
    } else {
      protocol = "ws://";
      addr = ":" + port + "/";
    }

    var con = new WebSocket(protocol + location.hostname + addr);
    con.onmessage = function (e) {
      var data = e.data.split(",");
      setData(data[0], data[1], data[2]);
    };
  }
);

drawGraph("record");
drawGraph("hour");
drawGraph("day");
drawGraph("month");
drawGraph("year");

var template = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
        fill: false,
        yAxisID: "axis-temp"
      },
      {
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        fill: false,
        yAxisID: "axis-hum"
      },
      {
        borderColor: "rgb(255, 205, 86)",
        borderWidth: 1,
        fill: false,
        yAxisID: "axis-pres"
      }
    ]
  },
  options: {
    legend: {
      display: false
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Temperature (°C)"
          },
          type: "linear",
          display: true,
          position: "left",
          id: "axis-temp"
        },
        {
          scaleLabel: {
            display: true,
            labelString: "Humidity (%)"
          },
          type: "linear",
          display: true,
          position: "right",
          id: "axis-hum"
        },
        {
          scaleLabel: {
            display: true,
            labelString: "Pressure (hPa)"
          },
          type: "linear",
          display: true,
          position: "right",
          id: "axis-pres"
        }
      ]
    }
  }
};

function setData(temp, hum, pres) {
  var tempPeriod = temp.indexOf(".");
  $("#tl").text(temp.substring(0, tempPeriod));
  $("#ts").text(temp.substring(tempPeriod, 5) + " °C");
  
  var humPeriod = hum.indexOf(".");
  $("#hl").text(hum.substring(0, humPeriod));
  $("#hs").text(hum.substring(humPeriod, 5) + " %");
  
  var presPeriod = pres.indexOf(".");
  $("#pl").text(pres.substring(0, presPeriod));
  $("#ps").text(pres.substring(presPeriod, 7) + " hPa");
}

function drawGraph(type) {
  getJSON(
    "?type=" + type,
    function (res) {
      var obj = $.extend(true, {}, template);
      var format = res.format;
      obj.data.datasets[0].data = res.data[0];
      obj.data.datasets[1].data = res.data[1];
      obj.data.datasets[2].data = res.data[2];

      for (var i = 0; i < res.label1.length; i++) {
        obj.data.labels.push(
          format.replace("{{STR1}}", res.label1[i])
                .replace("{{STR2}}", res.label2[i])
        );
      }

      new Chart($("#graph-" + type), obj);
    }
  );
}

function getJSON(query, response) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      if (this.response) {
        response(this.response);
      }
    }
  };
  req.open('GET', 'api.json' + query, true);
  req.responseType = 'json';
  req.send(null);
}