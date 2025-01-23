let data = [];
let filteredData = [];
let selectedService = null;

document.getElementById("csvFileInput").addEventListener("change", handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            data = results.data;
            filteredData = data;
            populateServiceList();
            renderChart();
        }
    });
}

// Populate the left panel with service endpoints
function populateServiceList() {
    const services = [...new Set(data.map(item => item.Service))];
    const serviceList = document.getElementById("serviceList");
    serviceList.innerHTML = "";

    services.forEach(service => {
        const li = document.createElement("li");
        li.textContent = service;
        li.onclick = () => {
            selectedService = service;
            filterDataByService();
        };
        serviceList.appendChild(li);
    });
}

// Filter data by selected service
function filterDataByService() {
    if (selectedService) {
        filteredData = data.filter(item => item.Service === selectedService);
    } else {
        filteredData = data;
    }
    renderChart();
}

// Reset the zoom level
function resetZoom() {
    if (window.chart) {
        window.chart.resetZoom();
    }
}

// Render the chart
function renderChart() {
    const chartType = document.getElementById("chartType").value;
    const ctx = document.getElementById("chart").getContext("2d");
    const labels = [...new Set(filteredData.map(item => item.RequestDate))];
    const datasets = generateDatasets(filteredData);

    // Check if `window.chart` exists and is a valid Chart.js instance
    if (window.chart && typeof window.chart.destroy === "function") {
        try {
            window.chart.destroy(); // Destroy the existing chart instance
        } catch (error) {
            console.error("Error destroying chart:", error);
        }
    }

    // Create a new Chart.js instance
    window.chart = new Chart(ctx, {
        type: chartType,
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true, // Enable zooming with mouse wheel
                        },
                        pinch: {
                            enabled: true, // Enable zooming with pinch gestures
                        },
                        mode: "xy", // Zoom both horizontally and vertically
                    },
                    pan: {
                        enabled: true, // Enable panning
                        mode: "xy", // Pan both horizontally and vertically
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Request Date' } },
                y: { beginAtZero: true, title: { display: true, text: 'Total Calls' } }
            }
        }
    });
}


// Generate datasets for the chart
function generateDatasets(data) {
    const services = [...new Set(data.map(item => item.Service))];
    return services.map(service => {
        const serviceData = data.filter(item => item.Service === service);
        return {
            label: service,
            data: serviceData.map(item => parseFloat(item.TotalCalls) || 0),
            backgroundColor: getRandomColor(),
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.1
        };
    });
}

// Generate random colors
function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
}
