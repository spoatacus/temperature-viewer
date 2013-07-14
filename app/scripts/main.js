
var config = {
    api_root: 'http://api.spoatacus.com/weather'
};

/*
 * reading response
 * 0: id
 * 1: sensor_id
 * 2: humidity
 * 3: temperature
 * 4: timestamp
 */

function updateLatest(data) {
    $('#latest-temp').html(ctof(data[3]).toFixed(2));
    $('#latest-humidity').html(data[2]);
    $('#latest-timestamp').html(data[4]);
}

// convert celsius to fahrenheit
function ctof(temp) {
    return 9.0 / 5 * temp + 32;
}

$(document).ready(function() {
    // get us some data
    var x_axis = null,
        y_axis = null,
        hoverDetail = null,
        graph = null;

    graph = new Rickshaw.Graph.Ajax({
        element: document.querySelector('#chart_temperature'),
        dataURL: config.api_root + '/reading/latest',
        renderer: 'line',
        min: 70,
        max: 80,
        onData: function(d) {
            var data = [{
                'color': 'steelblue',
                'name': 'Temperature',
                'data': []
            }];

            // our data is newest to oldest, flip it around
            d = d.reverse();

            // format data for rickshaw
            $.each(d, function(index, item) {
                data[0].data.push({x: moment(item[4]).unix(), y: ctof(item[3])});
            });

            // update latest
            updateLatest(d[d.length-1]);

            return data;
        },
        onComplete: function(transport) {
            if (!x_axis) {
                x_axis = new Rickshaw.Graph.Axis.Time({
                    graph: transport.graph
                });
            }

            if (!y_axis) {
                y_axis = new Rickshaw.Graph.Axis.Y({
                    graph: transport.graph
                });
            }

            if (!hoverDetail) {
                hoverDetail = new Rickshaw.Graph.HoverDetail({
                    graph: transport.graph
                });
            }

            transport.graph.render();
        },
        series: [{
            name: 'Temperature'
        }]
    });

    // update the graph every 60 seconds
    setInterval(function() {
        graph.request();
    }, 60*1000);
});
