const fs = require('fs');
const util = require('util');

// All arrays for pushing into sql database
module.exports.getStops = (data) => {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/google_transit/stops.txt', 'utf8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        content = content.split('\n').slice(0, -1);
        const keys = content.shift().split(',') // the first line at the document's head
        const parsed = [];
        for (let i = 0; i < content.length; i++) {
          vals = content[i].split(',');
          // 0: stop_id, 2: stop_name, 4: stop_lat, 5: stop_lon
          let stopId = vals[0];
          let stopName = vals[2];
          let stopLat = vals[4];
          let stopLon = vals[5];
          parsed.push([stopId, stopName, stopLat, stopLon]);
        }
        resolve(parsed);
      }
    })
  })
}

module.exports.getStopTimes = (data) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(__dirname + '/google_transit/stop_times.txt', 'utf8', (err, content) => {
      if (err) {
        reject(err)
      } else {
        content = content.split('\n').slice(0, -1);
        const keys = content.shift().split(',');
        const parsed = [];
        for (let i = 0; i < content.length; i++) {
          let dataObj = [];
          let vals = content[i].split(',');
          if (vals[0].includes('GS')) { continue; }
          // 0 = trip_id, 1 = arrival_time, 4 = stop_id
          let tripArray = vals[0].split('_');
          let routeId = tripArray[2].split('.')[0];
          let routeType = tripArray[0].slice(-3);
          let arrivalTime = vals[1];
          let stopId = vals[3];
          parsed.push([routeId, routeType, arrivalTime, stopId]);
        }
        resolve(parsed);
      }
    })
  })
}

module.exports.getRoutes = (data) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(__dirname + '/google_transit/routes.txt', 'utf8', (err, content) => {
      if (err) {
        reject(err)
      }  else {
        content = content.split('\r\n').slice(0, -1);
        const keys = content.shift().split(',');
        const vals = content.map((a) => a.split(/,(?!\s)/))
        const parsed = [];
        vals.forEach((val) => {
          // 0 = route_id, 4 = route_desc
          let routeId = val[0];
          let routeDesc = val[4].replace(/\"/g, '');
          parsed.push([routeId, routeDesc]);
        });
        resolve(parsed);
      }
    })
  })
}
