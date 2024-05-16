document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('selected-item');
    const dropdownContent = document.getElementById('dropdown-content');
    const items = dropdownContent.querySelectorAll('div');

    dropdownBtn.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });

    items.forEach(item => {
        item.addEventListener('click', function() {
            const selectedHTML = item.innerHTML;
            const selectedValue = item.getAttribute('data-value');
            dropdownBtn.innerHTML = selectedHTML + '<span>&#9660;</span>';
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            dropdownContent.classList.remove('show');
            
            // Reload the page with the selected value
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('item', selectedValue);
            window.location.search = urlParams.toString();
        });
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });

    // Get the item value from the URL and set it as the current item
    const urlParams = new URLSearchParams(window.location.search);
    const selectedItem = urlParams.get('item');
    if (selectedItem) {
        items.forEach(item => {
            if (item.getAttribute('data-value') === selectedItem) {
                const selectedHTML = item.innerHTML;
                dropdownBtn.innerHTML = selectedHTML + '<span>&#9660;</span>';
                item.classList.add('selected');
            }
        });
    }
});

var autoRefreshInterval;
var autoFetchInterval;

const server = 'https://trade-proxy1.vercel.app/';
//const server = 'http://localhost:3000/';

const item = new URLSearchParams(window.location.search).get('item') || 'itm_wood';

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
	
    const url = server + 'pixels-server.pixels.xyz/v1/marketplace/item/'+ item +'?pid=6625e78954c3ca9674476554&v=' + timestamp;
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
	
    var url = server + 'pixels-server.pixels.xyz/cache/marketplace/listings/count?v=' + timestamp;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        var itmScarrotPieValue = data["counts"][item];
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
            if (itmScarrotPieValue > previousValue){
                check = "+"
            }else if(itmScarrotPieValue < previousValue){
                check = "-"
            }
        }else{
            num = 0;
        }

        valueCell.textContent = formattedValue + " " + check;
        timeCell.textContent = formattedLastUpdated;
        
        newRow.appendChild(valueCell);
        newRow.appendChild(timeCell);
        
        tbody.insertBefore(newRow, tbody.firstChild);
        
        var rows = tbody.getElementsByTagName("tr");
        if (rows.length > 10) {
            tbody.removeChild(rows[rows.length - 1]);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}
