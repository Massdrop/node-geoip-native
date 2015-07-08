var geoip = require('geoip-native');

function readCountries()
{
    var fs = require("fs");
    var sys = require("sys");
    var buffer = fs.readFileSync('/Users/jxliu/Documents/code/massdrop-api/node_modules/geoip-native/GeoIPCountryWhois.csv', { encoding: "UTF8"} );
    var countries = [];

    buffer = buffer.replace(/"/g, "");

    var entries = buffer.split("\n");

    for(var i = 0; i < entries.length; i++) {
        var entry = entries[i].split(",");
        countries.push({start: entry[0], ipstart: parseInt(entry[2]), code: entry[4], name: entry[5]});
        countries.push({start: entry[1], ipstart: parseInt(entry[3]), code: entry[4], name: entry[5]});
    }

    countries.sort(function(a, b) {
        return a.ipstart - b.ipstart;
    });

    numcountries = countries.length;

    return countries;
}
var test1 = true;

function test() {

    var total = 0;
    var numtests = 20;
    var numiterations = 1000000;

    console.log("starting test: " + (test1 ? "geoip-native" : "geoip-lite"));

    failed = 0;
    correct = 0;
    testname = (test1 ? "native" : "lite");

    var data = [ { start:"1.11.0.0",end:"1.11.255.255",lower:"17498112",upper:"17563647",code:"KR",country:"Korea, Republic of" }]

    countries = readCountries();

    for (i = 0; i < countries.length; i++)
    {
        lookedup = geoip.lookup(countries[i].start);
        if (lookedup)
        {
            lookedup_code = (test1 ? lookedup.code : lookedup.country)
            if (lookedup_code != countries[i].code)
            {
                ++failed;
                console.log("\t" + testname + ": FAIL: " + lookedup_code + " != " + countries[i].code + " - " + countries[i].start + " " + JSON.stringify(lookedup))
            }
            else
            {
                ++correct;
            }
        }
    }

    console.log(testname + ": " + failed + " failed; " + correct + " correct");
}