let chartType = 'bar';

function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
}

function toggleChart() {
  chartType = chartType === 'bar' ? 'line' : 'bar';
  calculate();
}

function calculate() {
  const loan = parseFloat(document.getElementById('loanAmount').value);
  const rate = parseFloat(document.getElementById('interestRate').value);
  const years = parseInt(document.getElementById('loanTenure').value);
  const surplus = parseFloat(document.getElementById('surplusAmount').value);
  const sipAmount = parseFloat(document.getElementById('sipAmount').value);
  const sipYears = parseInt(document.getElementById('sipYears').value);
  const sipRate = parseFloat(document.getElementById('sipRate').value);

  const ssaRate = parseFloat(document.getElementById('ssaRate').value);
  const npsRate = parseFloat(document.getElementById('npsRate').value);
  const kvpRate = parseFloat(document.getElementById('kvpRate').value);
  const ssaEnabled = document.getElementById('enableSSA').checked;
  const npsEnabled = document.getElementById('enableNPS').checked;
  const kvpEnabled = document.getElementById('enableKVP').checked;

  const labels = [];
  const emiData = [];
  const sipData = [];
  const ssaData = [];
  const npsData = [];
  const kvpData = [];

  let emi = (loan * (rate / 1200) * Math.pow(1 + rate / 1200, years * 12)) / (Math.pow(1 + rate / 1200, years * 12) - 1);

  let sipFV = 0;
  let ssaFV = surplus;
  let npsFV = surplus;
  let kvpFV = surplus;

  for (let y = 1; y <= Math.max(sipYears, 20); y++) {
    labels.push('Year ' + y);

    // EMI savings (assume constant over 5 years)
    emiData.push(y <= 5 ? emi * 12 * y : emiData[emiData.length - 1]);

    // SIP: compound each year
    if (y <= sipYears) {
      sipFV = sipFV * (1 + sipRate / 100) + (sipAmount * 12);
    }
    sipData.push(sipFV);

    // SSA/NPS/KVP
    ssaData.push(ssaEnabled ? ssaFV * Math.pow(1 + ssaRate / 100, y) : null);
    npsData.push(npsEnabled ? npsFV * Math.pow(1 + npsRate / 100, y) : null);
    kvpData.push(kvpEnabled ? kvpFV * Math.pow(1 + kvpRate / 100, y) : null);
  }

  const datasets = [
    { label: 'EMI Savings', data: emiData, borderColor: '#3f51b5', backgroundColor: '#3f51b5' },
    { label: 'SIP', data: sipData, borderColor: '#4caf50', backgroundColor: '#4caf50' }
  ];

  if (ssaEnabled) datasets.push({ label: 'SSA', data: ssaData, borderColor: '#ff9800', backgroundColor: '#ff9800' });
  if (npsEnabled) datasets.push({ label: 'NPS', data: npsData, borderColor: '#00bcd4', backgroundColor: '#00bcd4' });
  if (kvpEnabled) datasets.push({ label: 'KVP', data: kvpData, borderColor: '#9c27b0', backgroundColor: '#9c27b0' });

  if (window.chart) window.chart.destroy();
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  window.chart = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: { responsive: true, interaction: { mode: 'index', intersect: false } }
  });

  const final = [emiData[4], sipData[sipYears - 1], ssaData[14], npsData[19], kvpData[9]].filter(x => !!x);
  const verdicts = ['EMI', 'SIP', 'SSA', 'NPS', 'KVP'];
  const best = Math.max(...final);
  document.getElementById('verdict').innerText = `✅ Best Option: ${verdicts[final.indexOf(best)]}`;
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('BudgetMan Investment Timeline Report', 10, 10);
  doc.text(document.getElementById('verdict').innerText, 10, 20);
  doc.save('BudgetMan_Timeline_Report.pdf');
}

function exportExcel() {
  const chartData = window.chart?.data;
  const data = [['Year', ...chartData.datasets.map(d => d.label)]];
  chartData.labels.forEach((year, i) => {
    const row = [year, ...chartData.datasets.map(d => d.data[i])];
    data.push(row);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
  XLSX.writeFile(wb, 'BudgetMan_Timeline.xlsx');
}

window.onload = calculate;