//************* BUILDING A MAP OBJECT *************
const myMap = {
  map: {},
  markers: {},
  coordinates: [],
  businesses: [],

  //************* Creating leaflet map *************
  createMap() {
    this.map = L.map("map", {
      center: this.coordinates,
      zoom: 13,
    });
    //************* Adding openstreetmap STANDARD tile *************
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: "8",
    }).addTo(this.map);
    const marker = L.marker(this.coordinates);
    marker
      .addTo(this.map)
      .bindPopup("<p1><b>You're Here!</b></p1>")
      .openPopup();
  },

  //************* This is for adding the markers for businesses *************
  addBusinessMarkers() {
    for (var i = 0; i < this.businesses.length; i++) {
      this.markers = L.marker([this.businesses[i].lat, this.businesses[i].long])
        .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
        .addTo(this.map);
    }
  },
};

//************* Using Geolocation to get users current location in Lat & Longitude *************
async function getCoords() {
  const result = await new Promise(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    },
    //************* handling errors *************
    function reject(result) {
      switch (result.code) {
        case result.PERMISSION_DENIED:
          alert("User denied the request for Geolocation.");
          break;
        case result.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case result.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
        case result.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
      }
    }
  );
  return [result.coords.latitude, result.coords.longitude];
}

//************* Get businesses with Foursquare *************
async function getFoursquare(business) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq3XbqRD/ebP6lzUqx8wzCpBQxVABDq3EtxgS0wdNEWRk0=",
    },
  };
  let limit = 5;
  let lat = myMap.coordinates[0];
  let lon = myMap.coordinates[1];
  let response = await fetch(
    `https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`,
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let businesses = parsedData.results;
  return businesses;
}
//************* Handle Foursquare Array *************
function processBusinesses(data) {
  let businesses = data.map((element) => {
    let location = {
      name: element.name,
      lat: element.geocodes.main.latitude,
      long: element.geocodes.main.longitude,
    };
    return location;
  });
  return businesses;
}

// ************* Loads on window *************
window.onload = async () => {
  const coords = await getCoords();
  myMap.coordinates = coords;
  myMap.createMap();
};

//************* Submit button for business drop down list *************
let submit = document.getElementById("submit");
submit.addEventListener("click", async (event) => {
  event.preventDefault();
  let business = document.getElementById("business").value;
  let data = await getFoursquare(business);
  myMap.businesses = processBusinesses(data);
  myMap.addBusinessMarkers();
});

// Attemp at erasing markers
// let clear = document.getElementById("clear");
// clear.addEventListener("click", (e) => {
//   myMap.businesses = [];
//   myMap.addBusinessMarkers();
// });
