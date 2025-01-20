const averageWordsPerSentence = 50;

/** @type {Node} */
var cursor = null;

async function getParentText() {
    try {
        const selection = window.getSelection();
        let res = "";
        let extraPrefix = "";
        if (selection.rangeCount > 0) {
            let el = selection.getRangeAt(0).commonAncestorContainer;
            let selectedText = selection.getRangeAt(0).toString();
            extraPrefix = selectedText;
            while (el.parentElement != null && el.textContent.length < averageWordsPerSentence) {
                let curText = el.textContent;
                extraPrefix = curText.slice(0, curText.search(extraPrefix)) + extraPrefix;
                el = el.parentElement;
            }
            let curText = el.textContent;
            extraPrefix = curText.slice(0, curText.search(extraPrefix)) + extraPrefix;

            extraPrefix = extraPrefix.slice(0, extraPrefix.length - selectedText.length);

            cursor = el;
            res = el.textContent;
        }
        return { extraPrefix: extraPrefix, text: res };
    } catch (error) {
        console.error("Error getting parent text:", error);
        throw error;
    }
}

async function continueFromCursor() {
    if (cursor) {
        const text = cursor.textContent;
        const range = document.createRange();
        range.setStart(cursor, text.length);
        range.setEnd(cursor, text.length);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    return "";
}

browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === "getParentText") {
        return getParentText();
    } else if (message.action === "continueFromCursor") {
        return continueFromCursor();
    } else if (message.action === "eraseCursor") {
        cursor = null;
        return "";
    }
});



