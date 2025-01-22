const minTextLength = 50;
const maxTextLength = 100;

/**
 * @type {Node}
 */
var cursor = null;
var textQueue = [];

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
        textQueue.push(res.nodes);
        return { text: res.text, textQueueId: textQueue.length - 1 };
    } catch (error) {
        console.error("Error getting parent text:", error);
        return { error: error };
    }
}

browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === "getText") {
        return getText();
    } else if (message.action === "continueFromCursor") {
        return getText(cursor);
    } else if (message.action === "eraseCursor") {
        cursor = null;
        return "OK";
    }
    return "BAD REQUEST"
});



