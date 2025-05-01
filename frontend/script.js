const API_URL = "http://127.0.0.1:5000";
let selectedFile = "";
let charts = {
  fraudChart: null,
  amountDistribution: null,
  timePattern: null
};

function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  if (username === "teocheekeat" && password === "10102020abc") {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("userDisplay").textContent = `Welcome, ${username}`;
    
    getFiles();
  } else {
    alert("Invalid username or password!");
  }
}

function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  
  document.getElementById("loginPage").style.display = "flex";
  document.getElementById("mainContent").style.display = "none";
  
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  
  selectedFile = "";
  resetViews();
}

window.addEventListener("load", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const username = localStorage.getItem("username");
  
  if (isLoggedIn === "true" && username) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("userDisplay").textContent = `Welcome, ${username}`;
    getFiles();
  }
});

function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      getFiles();
      fileInput.value = "";
    })
    .catch(error => alert("Error uploading file: " + error));
}

function getFiles() {
  fetch(`${API_URL}/files`)
    .then(response => response.json())
    .then(data => {
      const fileList = document.getElementById("fileList");
      fileList.innerHTML = "";
      
      data.files.forEach(file => {
        const li = document.createElement("li");
        li.className = 'file-item';
        
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = file;
        fileNameSpan.onclick = () => selectFile(file);
        if (file === selectedFile) {
          li.classList.add('active');
        }
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          deleteFile(file);
        };
        
        li.appendChild(fileNameSpan);
        li.appendChild(deleteBtn);
        fileList.appendChild(li);
      });
    })
    .catch(error => alert("Error fetching files: " + error));
}

function resetViews() {
  Object.keys(charts).forEach(chartId => {
    if (charts[chartId]) {
      charts[chartId].destroy();
      charts[chartId] = null;
    }
  });

  const analysisResult = document.getElementById("analysisResult");
  analysisResult.innerHTML = "";
  
  const predictionResults = document.getElementById("predictionResults");
  predictionResults.innerHTML = "";
  
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  tableHeader.innerHTML = "";
  tableBody.innerHTML = "";
  
  document.getElementById("currentPage").textContent = "";
  currentPage = 1;
}

function selectFile(file) {
  if (selectedFile === file) {
    return;
  }
  
  selectedFile = file;
  
  resetViews();
  
  document.getElementById("viewData").style.display = "block";
  
  const fileItems = document.querySelectorAll('.file-list li');
  fileItems.forEach(item => {
    if (item.textContent === file) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  viewFileData();
}

function createFraudChart(data) {
  const ctx = document.getElementById('fraudChart').getContext('2d');
  if (charts.fraudChart) {
    charts.fraudChart.destroy();
  }
  charts.fraudChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Legitimate', 'Fraudulent'],
      datasets: [{
        data: [data.non_fraudulent_transactions, data.fraudulent_transactions],
        backgroundColor: ['#00B894', '#FF7675'],
        borderColor: '#2A2B2E',
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Transaction Distribution',
          color: '#FFFFFF',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          position: 'bottom',
          labels: {
            color: '#FFFFFF',
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(42, 43, 46, 0.9)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          padding: 12,
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

function createAmountDistribution(data) {
  const amounts = data.data.map(row => parseFloat(row.Amount));
  const ctx = document.getElementById('amountDistribution').getContext('2d');
  if (charts.amountDistribution) {
    charts.amountDistribution.destroy();
  }
  charts.amountDistribution = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['$0-100', '$101-500', '$501-1000', '$1001-5000', '$5000+'],
      datasets: [{
        label: 'Transaction Amounts',
        data: [
          amounts.filter(a => a <= 100).length,
          amounts.filter(a => a > 100 && a <= 500).length,
          amounts.filter(a => a > 500 && a <= 1000).length,
          amounts.filter(a => a > 1000 && a <= 5000).length,
          amounts.filter(a => a > 5000).length
        ],
        backgroundColor: 'rgba(108, 92, 231, 0.8)',
        borderColor: '#A8A4E6',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(108, 92, 231, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(58, 59, 62, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#FFFFFF',
            font: {
              size: 12
            },
            padding: 10
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#FFFFFF',
            font: {
              size: 12
            },
            padding: 10
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Amount Distribution',
          color: '#FFFFFF',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(42, 43, 46, 0.9)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          padding: 12
        }
      }
    }
  });
}

function createTimePattern(data) {
  const times = data.data.map(row => parseInt(row.Time / 3600));
  const fraudTimes = times.filter((time, index) => data.predictions[index] === 1);
  
  const hourlyDistribution = Array(24).fill(0);
  fraudTimes.forEach(hour => {
    hourlyDistribution[hour % 24]++;
  });

  const ctx = document.getElementById('timePattern').getContext('2d');
  if (charts.timePattern) {
    charts.timePattern.destroy();
  }
  charts.timePattern = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      datasets: [{
        label: 'Fraud Transactions',
        data: hourlyDistribution,
        borderColor: '#6C5CE7',
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#6C5CE7',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(58, 59, 62, 0.5)',
            drawBorder: false
          },
          ticks: {
            color: '#FFFFFF',
            font: {
              size: 12
            },
            padding: 10,
            stepSize: 1
          }
        },
        x: {
          grid: {
            color: 'rgba(58, 59, 62, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#FFFFFF',
            font: {
              size: 12
            },
            maxRotation: 45,
            minRotation: 45,
            padding: 10
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Fraud Pattern by Hour',
          color: '#FFFFFF',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          labels: {
            color: '#FFFFFF',
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(42, 43, 46, 0.9)',
          titleFont: {
            size: 14
          },
          bodyFont: {
            size: 13
          },
          padding: 12
        }
      }
    }
  });
}

function analyzeFile() {
  if (!selectedFile) {
    alert("Please select a file first.");
    return;
  }

  Promise.all([
    fetch(`${API_URL}/analyze/${selectedFile}`).then(res => res.json()),
    fetch(`${API_URL}/view_data/${selectedFile}?page=1&per_page=1000000`).then(res => res.json()),
    fetch(`${API_URL}/predict/${selectedFile}`, { method: "POST" }).then(res => res.json())
  ])
    .then(([analysisData, viewData, predictionData]) => {
      const analysisResult = document.getElementById("analysisResult");
      analysisResult.innerHTML = `
        <h3>Analysis Results:</h3>
        <p><strong>Total Transactions:</strong> ${analysisData.total_transactions}</p>
        <p><strong>Fraudulent Transactions:</strong> ${analysisData.fraudulent_transactions}</p>
        <p><strong>Non-Fraudulent Transactions:</strong> ${analysisData.non_fraudulent_transactions}</p>
      `;

      createFraudChart(analysisData);
      createAmountDistribution(viewData);
      createTimePattern({ data: viewData.data, predictions: predictionData.predictions });
    })
    .catch(error => alert("Error analyzing file: " + error));
}

let currentPage = 1;
const perPage = 10; 

function viewFileData() {
  if (!selectedFile) {
    alert("Please select a file first.");
    return;
  }

  fetch(`${API_URL}/view_data/${selectedFile}?page=${currentPage}&per_page=${perPage}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }

      const tableHeader = document.getElementById("tableHeader");
      const tableBody = document.getElementById("tableBody");
      tableHeader.innerHTML = "";
      tableBody.innerHTML = "";

      const columnsToShow = ['Time', 'V1', 'V2', 'V3', 'V4', 'Amount'];

      let srNoHeader = document.createElement("th");
      srNoHeader.textContent = "Sr. No.";
      tableHeader.appendChild(srNoHeader);

      columnsToShow.forEach(col => {
        let th = document.createElement("th");
        th.textContent = col;
        tableHeader.appendChild(th);
      });

      data.data.forEach((row, index) => {
        let tr = document.createElement("tr");
        
        let srNo = document.createElement("td");
        srNo.textContent = (currentPage - 1) * perPage + index + 1;
        tr.appendChild(srNo);

        columnsToShow.forEach(col => {
          let td = document.createElement("td");
          td.textContent = row[col];
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });

      document.getElementById("currentPage").textContent = `Page ${data.current_page} of ${Math.ceil(data.total_rows / perPage)}`;
      document.getElementById("prevPage").disabled = data.current_page === 1;
      document.getElementById("nextPage").disabled = data.current_page * perPage >= data.total_rows;
    })
    .catch(error => alert("Error fetching file data: " + error));
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    viewFileData();
  }
}

function nextPage() {
  currentPage++;
  viewFileData();
}

function predictFraud() {
  if (!selectedFile) {
    alert("Please select a file first.");
    return;
  }

  fetch(`${API_URL}/predict/${selectedFile}`, { method: "POST" })
    .then(response => response.json())
    .then(data => {
      const predictionResults = document.getElementById("predictionResults");
      predictionResults.innerHTML = "<h3>Prediction Results:</h3>";
      
      let fraudFound = false;
      data.predictions.forEach(pred => {
        if (pred === 1) {
          fraudFound = true;
        }
      });
      
      if (!fraudFound) {
        predictionResults.innerHTML += "<p class='prediction-item negative'>No fraudulent transactions detected in this file.</p>";
        return;
      }
      
      const fraudList = document.createElement("div");
      data.predictions.forEach((pred, index) => {
        if (pred === 1) {
          const item = document.createElement("div");
          item.className = "prediction-item positive";
          item.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Transaction ${index + 1} is potentially fraudulent`;
          fraudList.appendChild(item);
        }
      });
      
      predictionResults.appendChild(fraudList);
    })
    .catch(error => alert("Error predicting fraud: " + error));
}

function deleteFile(filename) {
  if (confirm(`Are you sure you want to delete ${filename}?`)) {
    console.log(`Attempting to delete file: ${filename}`);
    
    fetch(`${API_URL}/delete/${filename}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json().then(data => ({
        ok: response.ok,
        status: response.status,
        data: data
      }));
    })
    .then(({ ok, status, data }) => {
      console.log('Response data:', data);
      
      if (!ok) {
        throw new Error(data.error || `HTTP error! status: ${status}`);
      }
      
      alert(data.message || 'File deleted successfully');
      if (selectedFile === filename) {
        selectedFile = "";
        resetViews();
      }
      getFiles();
    })
    .catch(error => {
      console.error('Delete error:', error);
      alert(`Error deleting file: ${error.message}`);
    });
  }
}

getFiles();
