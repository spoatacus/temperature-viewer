
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
    $.ajax(config.api_root + '/reading/latest', {
        dataType: 'json'
    }).success(function(data) {
        var chart_data = [],
            graph;

        // or data is newest to oldest, flip it around
        data = data.reverse();

        $.each(data, function(index, item) {
            chart_data.push({x: moment(item[4]).unix(), y: ctof(item[3])});
        });

        // update latest
        updateLatest(data[data.length-1]);

        graph = new Rickshaw.Graph({
            element: document.querySelector('#chart_temperature'),
//            width: 540,
//            height: 300,
            min: 70,
            max: 85,
            renderer: 'line',
            series: [{
                color: 'steelblue',
                data: chart_data,
                name: 'Temperature'
            }]
        });

        var x_axis = new Rickshaw.Graph.Axis.Time({graph: graph});

        var y_axis = new Rickshaw.Graph.Axis.Y({
            graph: graph
        });

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: graph
        });

        graph.render();

        setInterval(function() {
            $.ajax(config.api_root + '/reading/latest', {
                dataType: 'json',
                data: {
                    limit: 1
                }
            }).success(function(data) {
                // we get an array back with only one item
                data = data[0];

                // update the latest info
                updateLatest(data);

                var secs = moment(data[4]).unix(),
                    series = graph.series[0].data;

                // add new reading
                series.push({x: secs, y: ctof(data[3])});

                // remove oldest reading
                // so we don't hang on to a bunch of data points we don't need
                graph.series[0].data = series.slice(1,series.length);

                graph.render();
            });
        }, 60*1000);
    });
});
