const minTextLength = 50;
const maxTextLength = 100;

/**
 * @type {Node}
 */
var cursor = null;
var textQueue = [];
var currentHighlight = {
    highlight: {
        'background-color': 'black',
        'color': 'white',
    },
    original: [],
    textId: null
}

/**
 * @param {Node} els
 * @returns {Object} styles of `els`
 */
function getStyle(els) {
    let r = {}
    for (let i = 0; i < els.length; i++) {
        for (const prop of Object.keys(currentHighlight.highlight)) {
            r[prop] = els[i].style[prop];
        }
    }
    return r;
}


/**
 * @param {Node} els
 * @param {Object} style
 */
function applyStyle(els, style) {
    for (let i = 0; i < els.length; i++) {
        for (const [prop, val] of Object.entries(style)) {
            els[i].style[prop] = val;
        }
    }
}

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
            el = el.nextSibling;
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
        return { text: res.text, textId: textQueue.length - 1 };
    } catch (error) {
        console.error("Error getting parent text:", error);
        return { err: error };
    }
}

function highlight(textId) {
    if (currentHighlight.textId != null) {
        applyStyle(textQueue[currentHighlight.textId], currentHighlight.original);
    }
    currentHighlight.textId = textId;
    currentHighlight.original = getStyle(textQueue[textId])
    applyStyle(textQueue[textId], currentHighlight.highlight)
}

browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === "getText") {
        return getText();
    } else if (message.action === "continueFromCursor") {
        return getText(cursor);
    } else if (message.action === "eraseCursor") {
        cursor = null;
        return { "ok": "" };
    } else if (message.action === "highlight") {
        const { textId } = message;
        if (textId) {
            highlight(textId)
        } else {
            return { err: "textId required" }
        }
    }
    return { err: "BAD REQUEST" }
});



