// Initialize the map
var map = L.map('map').setView([53, -96], 4);

// Add base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load polygons from ESRI REST service
var esriLayer = L.esri.featureLayer({
    url: 'https://maps-cartes.services.geo.ca/server_serveur/rest/services/ELECTIONS/elections_canada2021_en/MapServer/2',
    where: "SHAPE_Area < 7784228",
    onEachFeature: function(feature, layer) {
        layer.on('click', function() {
            //var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            //this.setStyle({ fillColor: randomColor, color: randomColor });
            var attributes = feature.properties;
            var popupContent = '<strong>Polling Division Number:</strong> ' + attributes['PD_NUM'] + '<br>' +
                               '<strong>Riding ID#:</strong> ' + attributes['FED_NUM'];

            // Display popup
            layer.bindPopup(popupContent).openPopup();

            // Execute background data parsing
            parseBackgroundData(attributes);

            // Execute additional script for riding results
            ridingResults(attributes['FED_NUM']);
        });
    }
}).addTo(map);

// Inside script.js after updating polygon count
document.dispatchEvent(new CustomEvent('polygonCountUpdated', { detail: { count: Object.keys(esriLayer._layers).length } }));


// Function to parse background data tables dynamically
function parseBackgroundData(attributes) {
    // Placeholder for your parsing logic
    console.log('Parsing background data for attributes:', attributes);
    // Implement your data parsing logic here
}

function ridingResults(fedNum) {
    // Fetch the CSV based on FED_NUM from the 'results' subdirectory
    fetch(`results/pollbypoll_bureauparbureau${fedNum}.csv`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`CSV file for Riding ID ${fedNum} not found.`);
            }
            return response.text();
        })
        .then(data => {
            // Parse CSV and update popup content dynamically
            const parsedData = parseCSV(data); // implement parseCSV accordingly
            updatePopup(parsedData); // implement updatePopup to modify the popup
        })
        .catch(error => {
            console.error('Error fetching or parsing CSV:', error);
            updatePopup({ error: error.message }); // Show a friendly message in popup
        });
}

// Example helper functions:
function parseCSV(csvText) {
    // Implement CSV parsing logic (use libraries like PapaParse for simplicity)
    return Papa.parse(csvText, { header: true }).data;
}

function updatePopup(data) {
    let popupContent = '';
    
    if (data.error) {
        popupContent = `<strong>Error:</strong> ${data.error}`;
    } else {
        popupContent = `<strong>Additional Riding Results:</strong><br>`;
        data.forEach(item => {
            popupContent += `${item.attribute}: ${item.value}<br>`;
        });
    }

    // Assuming you have reference to the current popup or layer:
    currentLayer.getPopup().setContent(currentLayer.getPopup().getContent() + '<br>' + popupContent);
}
