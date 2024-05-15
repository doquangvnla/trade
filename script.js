var autoRefreshInterval;
var autoFetchInterval;

fetchData();
updateValues();

function refreshData() {
    fetchData();
    updateValues();
}

function toggleAutoRefresh() {
    var autoRefreshCheckbox = document.getElementById("autoRefreshCheckbox");
    if (autoRefreshCheckbox.checked) {
        autoFetchInterval = setInterval(fetchData, 5000);
        autoRefreshInterval = setInterval(updateValues, 30000);
    } else {
        clearInterval(autoFetchInterval);
        clearInterval(autoRefreshInterval);
    }
}

function fetchData() {
    var currentTime = new Date();
    var timestamp = currentTime.getTime();
	const server = 'https://trade-proxy1.vercel.app/proxy/'  + timestamp;
	//const server = 'http://localhost:3000/proxy/'  + timestamp;
	
    const url = server;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                displayData(data);
            } else {
                console.error('Error fetching data:', xhr.statusText);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
}

function displayData(data) {
    const listings = data.listings;
    const ownerUsernames = data.ownerUsernames;
    
    const table = document.createElement('table');
    const headers = ['ownerUsernames', 'price', 'quantity', 'createdAt'];

    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    listings.forEach(listing => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            if (header === 'createdAt') {
                const date = new Date(listing[header]);
                const formattedDate = `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
                cell.textContent = formattedDate + calculateRemainingTime(date);
            } else if (header === 'ownerUsernames') {
                const ownerId = listing['ownerId'];
                cell.textContent = ownerUsernames[ownerId];
            } else if (header === 'quantity') {
                cell.textContent = parseInt(listing[header]- listing['claimedQuantity']).toLocaleString('en-US');
            } else if (header === 'price') {
                cell.textContent = listing[header];
                cell.classList.add(getPriceClass(listing[header]));
            } else {
                cell.textContent = listing[header];
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '';
    dataContainer.appendChild(table);
}

function padZero(num) {
    return num < 10 ? `0${num}` : num;
}

function calculateRemainingTime(targetDate) {
    var now = new Date();  
    var timeDiff = targetDate.getTime() - now.getTime();  
    var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) * -1;
    var hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) * -1;
    var minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)) * -1;
    var seconds = Math.floor((timeDiff % (1000 * 60)) / 1000) * -1;
    var time_less = ` (${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây)`;
    if (days === 1) time_less = ` (${hours} giờ ${minutes} phút ${seconds} giây)`;
    if (hours === 1) time_less = ` (${minutes} phút ${seconds} giây)`;
    if (minutes === 1) time_less = ` (${seconds} giây)`;
    return time_less;
}

function getPriceClass(price) {
    const uniquePrices = ['unique-price-1', 'unique-price-2', 'unique-price-3','unique-price-4','unique-price-5'];
    return uniquePrices[price % uniquePrices.length];
}

function updateValues() {
    var currentTime = new Date();
    var timestamp = currentTime.getTime();
	const server = 'https://trade-proxy1.vercel.app/proxy2/'  + timestamp;
	//const server = 'http://localhost:3000/proxy2/'  + timestamp;
	
    var url = server;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        var itmScarrotPieValue = data["counts"]["itm_wood"];
        var formattedValue = itmScarrotPieValue.toLocaleString('en-US');
        var lastUpdatedTimestamp = data["lastUpdated"];
        var lastUpdatedDate = new Date(lastUpdatedTimestamp);
        var formattedLastUpdated = lastUpdatedDate.toLocaleString('en-GB');
        var tbody = document.getElementById("data_table_body");
        
        var previousValue = tbody.rows.length > 0 ? parseInt(tbody.rows[0].cells[0].textContent.replace(/,/g, '')) : null;
        var newRow = document.createElement('tr');
        var valueCell = document.createElement('td');
        var timeCell = document.createElement('td');
        
        var num;
        var check = "";
        if (previousValue !== null) {
            if (itmScarrotPieValue > previousValue) {
                valueCell.classList.add('green');
                num = itmScarrotPieValue - previousValue;
                check = " ( + " + num.toLocaleString('en-US') + ")";
            } else if (itmScarrotPieValue < previousValue) {
                valueCell.classList.add('red');
                num = previousValue - itmScarrotPieValue;
                check = " ( - " + num.toLocaleString('en-US') + ")";
            }
        }
        valueCell.textContent = formattedValue + check;
        
        timeCell.textContent = formattedLastUpdated;
        newRow.appendChild(valueCell);
        newRow.appendChild(timeCell);

        tbody.insertAdjacentElement('afterbegin', newRow);

        if (tbody.rows.length > 10) {
            tbody.removeChild(tbody.lastChild);
        }
    })
    .catch(error => console.error('Error fetching data:', error));
}
