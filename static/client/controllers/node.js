function initializeNode() {
    const params = TEMPLAR.paramREC(); 
    const id = params.uuid;
    const label = params.label;
    if (!id) {
        console.error("SMEE: We've got a port name but no ID for " + label + "!");
        return;
    }

    // SMEE: The new map coordinates!
    // Example: /node/author?uuid=abc-123
    const url = "/node/" + label + "?uuid=" + encodeURIComponent(id);
    
    initializeTorrents("node");
}