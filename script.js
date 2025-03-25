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
            ridingResults(attributes['FED_NUM'], attributes['PD_NUM']);
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

function ridingResults(fedNum, pdNum) {
    fetch(`results/pollbypoll_bureauparbureau${fedNum}.csv`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`CSV file for Riding ID ${fedNum} not found.`);
            }
            return response.text();
        })
        .then(data => {
            const parsedData = parseCSV(data);
            
            // Filter for specific polling division (pdNum)
            const filteredResults = parsedData.filter(row => row['Polling Division Number'] === pdNum);

            if (filteredResults.length === 0) {
                throw new Error(`No data found for Polling Division ${pdNum}.`);
            }

            updatePopup(filteredResults);
        })
        .catch(error => {
            console.error('Error:', error);
            updatePopup({ error: error.message });
        });
}

// Simple CSV parser (implement as needed or use a library like PapaParse)
function parseCSV(data) {
    const rows = data.trim().split('\n');
    const headers = rows[0].split(',');

    return rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((acc, header, i) => {
            acc[header.trim()] = values[i].trim();
            return acc;
        }, {});
    });
}

// Sample updatePopup function
function updatePopup(data) {
    if (data.error) {
        document.getElementById('popup-content').innerHTML = `<div class="error">${data.error}</div>`;
    } else {
        let html = '<table><tr>';
        Object.keys(data[0]).forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr>';

        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });

        html += '</table>';

        document.getElementById('popup-content').innerHTML = html;
    }
}