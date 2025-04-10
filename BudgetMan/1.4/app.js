function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
function calculate() {
  const loan = parseFloat(document.getElementById('loanAmount').value);
  const rate = parseFloat(document.getElementById('interestRate').value);
  const years = parseInt(document.getElementById('loanTenure').value);
  const surplus = parseFloat(document.getElementById('surplusAmount').value);
  const sipAmount = parseFloat(document.getElementById('sipAmount').value);
  const sipYears = parseInt(document.getElementById('sipYears').value);
  const sipRate = parseFloat(document.getElementById('sipRate').value);
  const ssaEnabled = document.getElementById('enableSSA').checked;
  const npsEnabled = document.getElementById('enableNPS').checked;
  const kvpEnabled = document.getElementById('enableKVP').checked;
  const ssaRate = parseFloat(document.getElementById('ssaRate').value);
  const npsRate = parseFloat(document.getElementById('npsRate').value);
  const kvpRate = parseFloat(document.getElementById('kvpRate').value);

  const emi = (loan * (rate/1200) * Math.pow(1 + rate/1200, years * 12)) / (Math.pow(1 + rate/1200, years * 12) - 1);
  const savedEMI = surplus > 0 ? emi * 12 * 5 : 0;
  const sipFV = sipAmount * (((Math.pow(1 + sipRate/1200, sipYears * 12)) - 1) / (sipRate/1200));
  const ssaFV = ssaEnabled ? surplus * Math.pow(1 + ssaRate/100, 15) : 0;
  const npsFV = npsEnabled ? surplus * Math.pow(1 + npsRate/100, 20) : 0;
  const kvpFV = kvpEnabled ? surplus * Math.pow(1 + kvpRate/100, 10) : 0;

  const labels = ['EMI Savings', 'SIP'];
  const values = [savedEMI, sipFV];
  if (ssaEnabled) { labels.push('SSA'); values.push(ssaFV); }
  if (npsEnabled) { labels.push('NPS'); values.push(npsFV); }
  if (kvpEnabled) { labels.push('KVP'); values.push(kvpFV); }

  if (window.chart) window.chart.destroy();
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Future Value ₹',
        data: values,
        backgroundColor: ['#3f51b5', '#4caf50', '#ff9800', '#00bcd4', '#9c27b0']
      }]
    },
    options: { responsive: true }
  });

  const max = Math.max(...values);
  const best = labels[values.indexOf(max)];
  document.getElementById('verdict').innerText = `✅ Best Option: ${best} gives the highest return.`;
}
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('BudgetMan Investment Comparison Report', 10, 10);
  doc.text(document.getElementById('verdict').innerText, 10, 20);
  doc.save('BudgetMan_Report.pdf');
}
function exportExcel() {
  const data = [['Metric', 'Value']];
  const chartData = window.chart?.data;
  if (chartData) {
    chartData.labels.forEach((label, i) => {
      data.push([label, chartData.datasets[0].data[i]]);
    });
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, 'BudgetMan_Report.xlsx');
}
window.onload = calculate;
