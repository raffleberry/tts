const minTextLength = 50;
const maxTextLength = 100;

/**
 * @type {Node}
 */
var cursor = null;

/**
 * Traverses the DOM tree to find the first parent node with a text content of at least minTextLength
 * @param {Node} el
 * 
 * @typedef {Object} TraverseResult
 * @property {Array<Node>} nodes
 * @property {string} text
 * @property {Node} continueCursor
 * 
 * @returns {TraverseResult} 
 */
function traverse(el) {
    let resNodes = [];
    let resText = "";
    while (el.parentElement != null && resText < minTextLength) {

        // weird, sometimes this is undefined(need to traverse into the tree)
        if (el.innerText) {
            if (el.innerText.trim() !== "") {
                resText += el.innerText + " ";
            }
        } else {
            if (el.textContent.trim() !== "") {
                resText += el.textContent + " ";
            }
        }
        resNodes.push(el);

        if (el.nextSibling == null) {
            while (el != null && el.nextSibling == null) {
                el = el.parentElement;
            }
            if (el == null) break;
            el.nextSibling;
            el.firstChild;
        } else if (el.nextSibling != null) {
            el = el.nextSibling;
        }
    }
    console.log(resText, resNodes, el);
    return { nodes: resNodes, text: resText, continueCursor: el };
}

/**
 * 
 * @param {Node} continueCursor 
 * @returns 
 */
function getText(continueCursor = null) {
    try {
        const selection = window.getSelection();
        console.log(continueCursor);
        /**
         * @type {Node}
         */
        let el = null;
        if (continueCursor) {
            el = continueCursor
        } else {
            el = selection.getRangeAt(0).commonAncestorContainer;
        }
        const res = traverse(el, minTextLength);
        cursor = res.continueCursor;
        console.log(res)
        return { text: res.text, nodes: res.nodes };
    } catch (error) {
        console.error("Error getting parent text:", error);
        throw error;
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if (message.action === "getText") {
        let res = getText();
        return sendResponse(res);
    } else if (message.action === "continueFromCursor") {
        let res = getText(cursor);
        return sendResponse(res);
    } else if (message.action === "eraseCursor") {
        cursor = null;
        return sendResponse("OK")
    }
    sendResponse("BAD REQUEST")
});



