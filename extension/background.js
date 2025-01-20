const GO_APP_URL = "http://localhost:42042";

let isGoAppOnline = false;

async function checkGoAppStatus() {
    try {
        const response = await fetch(GO_APP_URL + "/health", { method: "GET" });
        isGoAppOnline = response.ok;
        const iconPath = isGoAppOnline ? "icons/icon-green.svg" : "icons/icon-red.svg";
        browser.browserAction.setIcon({ path: iconPath });
        return isGoAppOnline;
    } catch {
        isGoAppOnline = false;
        browser.browserAction.setIcon({ path: "icons/icon-red.svg" });
        return false;
    }
}

browser.contextMenus.create({
    id: "send-text-to-go",
    title: "Read from here",
    contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "send-text-to-go") {
        await checkGoAppStatus();

        if (isGoAppOnline) {
            try {
                const response = await browser.tabs.sendMessage(tab.id, { action: "getParentText" });
                console.log(response);
                if (response && response.text) {
                    await sendToGoApp(JSON.stringify(response));
                }
            } catch (error) {
                console.error("Error getting parent text:", error);
            }
        } else {
            console.error("Go app is offline. Cannot send text.");
        }
    }
});

async function sendToGoApp(payload) {
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
    if (message.action === "checkGoAppStatus") {
        checkGoAppStatus().then((status) => sendResponse({ online: status }));
        return true;
    }
});
