var countries = [],
	midpoints = [],
	numcountries = 0;

var geoip = module.exports = {

    ready: false,

    lookup: function(ip) {

        if(!geoip.ready) {
            return { error: "GeoIP not ready" };
        }

        var ipl = iplong(ip);

        if(ipl == 0) {
            return { error: "Invalid ip address " + ip + " -> " + ipl + " as integer" };
        }

        return find(ipl);
    }
};

function iplong(ip) {

    if(!ip) {
        return 0;
    }

    ip = ip.toString();

    if(isNaN(ip) && ip.indexOf(".") == -1) {
        return 0;
    }

    if(ip.indexOf(".") == -1) {

        try {
            ip = parseFloat(ip);
            return ip < 0 || ip > 4294967296 ? 0 : ip;
        }
        catch(s) {
        }
    }

    var parts = ip.split(".");

    if(parts.length != 4) {
        return 0;
    }

    var ipl = 0;

    for(var i=0; i<4; i++) {
        parts[i] = parseInt(parts[i], 10);

        if(parts[i] < 0 || parts[i] > 255) {
            return 0;
        }

        ipl += parts[3-i] * (Math.pow(256, i));
    }

    return ipl > 4294967296 ? 0 : ipl;
}

/**
 * A qcuick little binary search
 * @param ip the ip we're looking for
 * @return {*}
 */
function find(ipl) {

    var mpi = 0,
        n = midpoints[0],
        step,
        current,
        next,
        prev,
        nn,
        pn;
    
    while(true) {

        mpi++;
        step = midpoints[mpi];
        current = countries[n];
        nn = n + 1;
        pn = n - 1;

        next = nn < numcountries ? countries[nn] : null;
        prev = pn > -1 ? countries[pn] : null;
        
		// take another step?
        if (step) {
            if (next && next.ipstart <= ipl) {
                n = Math.min(n + step, numcountries - 1);
                continue;
            } else if (prev && current.ipstart > ipl) {
                n = Math.max(n - step, 0);
                continue;
            }
        }

        if (current.ipstart > ipl) {
            return prev;
        } else if (next && next.ipstart <= ipl) {
            return next;
        }

        return current;
    }
}

/**
* Prepare the data.  This uses the standard free GeoIP CSV database 
* from MaxMind, you should be able to update it at any time by just
* overwriting GeoIPCountryWhois.csv with a new version.
*/
(function() {

    var fs = require("fs"),
        sys = require("sys"),
        stream = fs.createReadStream(__dirname + "/GeoIPCountryWhois.csv"),
        buffer = "";

    stream.addListener("data", function(data) {
        buffer += data;
    });

    stream.addListener("end", function() {

        var entries = buffer.split("\n");

        for(var i=0; i<entries.length; i++) {
            var entry = entries[i].replace(/^"(.*)"$/, "$1").split('","');

            if (entry.length === 6) {
                countries.push({ipstart: parseInt(entry[2], 10), code: entry[4], name: entry[5]});
            }
        }

        countries.sort(function(a, b) {
            return a.ipstart - b.ipstart;
        });

        var n = countries.length;
        while(n > 1) {
            n = Math.ceil(n / 2);
            midpoints.push(n);
        }
        numcountries = countries.length;
		geoip.ready = true;
    });

}());