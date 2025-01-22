const GO_APP_URL = "http://localhost:42042";

let isAppOnline = false;

async function checkAppStatus() {
    try {
        const response = await fetch(GO_APP_URL + "/health", { method: "GET" });
        isAppOnline = response.ok;
        const iconPath = isAppOnline ? "icons/icon-green.svg" : "icons/icon-red.svg";
        browser.browserAction.setIcon({ path: iconPath });
        return isAppOnline;
    } catch {
        isAppOnline = false;
        browser.browserAction.setIcon({ path: "icons/icon-red.svg" });
        return false;
    }
}

browser.contextMenus.create({
    id: "read-from-here",
    title: "Read from here",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "continue-reading",
    title: "Continue-reading",
    contexts: ["selection"]
});

browser.contextMenus.create({
    id: "stop-reading",
    title: "Stop-reading",
    contexts: ["selection"]
});

var stopReading = false;

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "read-from-here") {
        await checkAppStatus();
        if (isAppOnline) {
            try {
                let i = 0;
                while (!stopReading) {
                    let action = "continueFromCursor";
                    if (i == 0) {
                        action = "getText";
                    }
                    const response = await browser.tabs.sendMessage(tab.id, { action: action });
                    console.log(response)
                    if (response && response.text) {
                        await sendToApp(JSON.stringify(response));
                    }
                    await new Promise(r => setTimeout(r, 2000));
                    i += 1
                }
                stopReading = false;
            } catch (error) {
                console.error("Error getting parent text:", error);
            }
        } else {
            console.error("Go app is offline. Cannot send text.");
        }
    } else if (info.menuItemId === "continue-reading") {
        await checkAppStatus();

        if (isAppOnline) {
            try {
                const response = await browser.tabs.sendMessage(tab.id, { action: "continueFromCursor" });
                console.log(response);
                if (response && response.text) {
                    await sendToApp(JSON.stringify(response));
                }
            } catch (error) {
                console.error("Error getting parent text:", error);
            }
        } else {
            console.error("Go app is offline. Cannot send text.");
        }
    } else if (info.menuItemId === "stop-reading") {
        stopReading = true;
    }
});

async function sendToApp(payload) {
    try {
        const response = await fetch(GO_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload
        });
        if (response.ok) {
            console.log("Text sent successfully to Go app");
        } else {
            console.error("Failed to send text to Go app");
        }
    } catch (error) {
        console.error("Error connecting to Go app:", error);
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkAppStatus") {
        checkAppStatus().then((status) => sendResponse({ online: status }));
        return true;
    }
});
