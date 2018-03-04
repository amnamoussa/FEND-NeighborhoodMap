/*global variables*/
var map;
var clientID, clientSecret; // for the third-party API foursquare

/*list of eight locations around the centered neighborhoor*/
var locations = [
    {
        title: 'Bafarat Cafe',
        lat: 21.555294,
        lng:  39.143005,
        type: 'cafe'
    },
    {
        title: 'Fakieh aquarium',
        lat: 21.572564,
        lng:  39.109489,
        type: 'aquarium'
    },
    {
        title: 'Gardenia',
        lat:  21.565668,
        lng:  39.142665,
        type: 'florist'
    },
    {
        title: 'Nozomi',
        lat: 21.55054,
        lng:  39.153015,
        type: 'Restaurant'
    },
    {
        title: 'Rawdah Park',
        lat: 21.556008,
        lng:  39.146076,
        type: 'park'
    },
    
    {
        title: 'Shababik',
        lat: 21.551213,
        lng:  39.143601,
        type: 'food'
    },
    {
        title: 'Tahlia center',
        lat: 21.549879,
        lng:  39.148072,
        type: 'shopping_mall'
    },
     {
        title: 'Virgin Megastore',
        lat: 21.547893,
        lng:  39.142742,
        type: 'book_store'
    }
];

/*
* viewmodel function that handles the third-party API,
* initial map function, markers creation and animation,
* info window for each location, and search filtering*/
function ViewModel() {
    var thisLocation = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    this.extraInfo = function(marker, infoWindow) {
            infoWindow.setContent('');
            infoWindow.marker = marker;
            clientID = "EIKT2N3IJHE3ABYPI5ZDZD1HDGF4HHZDUX5CSH2B2FQ30TPY";
            clientSecret = "HZCONC5J23LGXDWDBWG122CQNVLLYW1LBSDHBSVRMU4ZKUFI";
            // API requests with versioning parameters
            var apiFoursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng +
                '&client_id=' + clientID + '&client_secret=' + clientSecret +
                '&query=' + marker.title + '&v=20180304' + '&m=foursquare';
        
            // get the info from the API
            $.getJSON(apiFoursquareURL).done(function(marker) {
                var response = marker.response.venues[0];
                thisLocation.category = response.categories[0].shortName;
                thisLocation.street = response.location.formattedAddress[0];
                thisLocation.city = response.location.formattedAddress[1];
                
                // write the new info in the info window in html and handling the potential error
                thisLocation.htmlInfoFoursquare =
                '<h4>-' + thisLocation.category + '-</h4>' +
                '<div>' + '<p>' + thisLocation.street + '</p>' +
                '<p>' + thisLocation.city + '</p>' +'</div>' + '</div>';
                infoWindow.setContent(thisLocation.htmlTitle + thisLocation.htmlInfoFoursquare);
            }).fail(function() {
                alert("Error!\nFailure in loading Foursquare API, Please refresh your page or connect to internet.");
            });

            this.htmlTitle = '<div>' + '<h3 class="iw_title">' + marker.title +
            '</h3>';
        
            infoWindow.open(map, marker);
    };

    // animate each marker once clicked on it, with time 2000 to limit the bouncing
    this.bounceMarker = function() {
        thisLocation.extraInfo(this, thisLocation.openInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
        this.setAnimation(null);
        }).bind(this), 2000);
    };
    // initMap function is for creating map, markers, and with a touch of being stylish
    this.initMap = function() {
        var styles = [
            {
            featureType: 'water',
                stylers: [
                    {color: '#9dbcc8'}
                ]
            },
            {
            featureType: 'road.highway',
                stylers: [
                    {color: '#008080'}
                ]
            }
        ];
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            //route
            center: new google.maps.LatLng(21.553604, 39.14281),
            zoom: 14,
            styles: styles
        };
        map = new google.maps.Map(mapCanvas, mapOptions);

        this.openInfoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < locations.length; i++) {
            this.markerTitle = locations[i].title;
            this.markerLat = locations[i].lat;
            this.markerLng = locations[i].lng;
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', thisLocation.bounceMarker);
        }
    };

    this.initMap();
    
    // search filtering with knockout, regardless the letter case
    this.filterLocation = ko.computed(function() {
        var results = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption().toLowerCase())) {
                results.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
            this.markers[i].setVisible(false);
            }
        }
        return results;
    }, this);
}

// the main starting point
function main() {
    ko.applyBindings(new ViewModel());
}

error = function error() {
    alert("Error!\nFailure in loading Google Map, Please refresh your page or connect to internet.");
};

// set and resize map's height upon window's height
$(document).ready(function() {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    $('#map').css('min-height', windowHeight);
  }
  setHeight();

  $(window).resize(function() {
    setHeight();
  });
});
