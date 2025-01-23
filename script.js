let data = [];
let filteredData = [];
let selectedService = null;

document.getElementById("csvFileInput").addEventListener("change", handleFiles);

function handleFiles(event) {
    const files = event.target.files;
    if (!files.length) return;

    let filesProcessed = 0;
    const combinedData = [];

    for (const file of files) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                combinedData.push(...results.data);
                filesProcessed++;

                if (filesProcessed === files.length) {
                    data = combinedData;
                    filteredData = data;
                    populateServiceList();
                    renderChart();
                    populateDataTable(filteredData);
                }
            }
        });
    }
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
    populateDataTable(filteredData);
}

// Reset the zoom level
function resetZoom() {
    if (window.chart) {
        window.chart.resetZoom();
    }
}

// Download the chart as an image
function downloadChart() {
    if (window.chart) {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = window.chart.toBase64Image();
        link.click();
    }
}

// Render the chart
function renderChart() {
    const chartType = document.getElementById("chartType").value;
    const ctx = document.getElementById("chart").getContext("2d");
    const labels = [...new Set(filteredData.map(item => item.RequestDate))];
    const datasets = generateDatasets(filteredData);

    if (window.chart && typeof window.chart.destroy === "function") {
        window.chart.destroy();
    }

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
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "xy",
                    },
                    pan: { enabled: true, mode: "xy" }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Request Date' } },
                y: { beginAtZero: true, title: { display: true, text: 'Total Calls' } }
            }
        }
    });
}

// Populate the data table with filtered data
function populateDataTable(data) {
    const table = document.getElementById("dataTable");
    table.innerHTML = "";

    if (data.length === 0) return;

    // Add header row
    const headerRow = document.createElement("tr");
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement("th");
        th.textContent = key;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add data rows
    data.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });
        table.appendChild(tr);
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
