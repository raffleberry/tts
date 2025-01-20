const statusDiv = document.getElementById("status");
const refreshButton = document.getElementById("refresh-button");

function updateStatus() {
    browser.runtime.sendMessage({ action: "checkGoAppStatus" }).then((response) => {
        if (response.online) {
            statusDiv.innerHTML = `<p style="color: green;">Go App is Online</p>`;
        } else {
            statusDiv.innerHTML = `<p style="color: red;">Go App is Offline</p>`;
        }
    });
}

// Add click event listener for the refresh button
refreshButton.addEventListener("click", updateStatus);

// Refresh status when the popup opens
updateStatus();
