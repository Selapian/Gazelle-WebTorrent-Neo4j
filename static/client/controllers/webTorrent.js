// Declare client and torrent but don't initialize them yet
var client;
var torrent = null;
var magnetURI = "magnet:?xt=urn:btih:2f5847f71c1f2baf143830dea0c7316d72dbe8c6&tr=wss%3A%2F%2Ftracker.openwebtorrent.com%2Fannounce&tr=wss%3A%2F%2Ftracker.btorrent.xyz%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tag=ebooks&tag=audibooks"

// --- QUEUE PROCESSOR FUNCTION (Corrected) ---

// Function to initialize the client and torrent only when needed
function initializeTorrent() {

    console.log("WebTorrent Client Initializing...");
    client = new WebTorrent();

    torrent = client.add(magnetURI, function(torrent){
        console.log("Added atlantean-silo (Metadata download starting...)");
        torrent.deselect(0, torrent.pieces.length - 1, false);
        console.log("DESELECTED ALL PIECES!");
    });

    // Attach the ready listener that was previously in the global scope
    torrent.on('ready', function() {
        console.log("METADATA DOWNLOADED");
        
        selectFile();
        document.querySelector("#numPeers").innerHTML = torrent.numPeers + " Peers.";

    });


    // The handler
}
// --- DOWNLOAD COMPLETE HANDLER (for file.on('done')) ---
function onFileDone(file, intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
    }

    const $remaining = document.querySelector("#remaining");
    const $output = document.querySelector("#output");

    $remaining.innerHTML = "Done !!!";
    $output.innerHTML = ''; // Clear previous "Downloading..." state

    // 1. Generate the Blob URL to get the Save Link first
    file.getBlobURL((err, url) => {
        if (err) return console.error(err);

        // 2. Create the Download Button/Link
        const downloadBtn = document.createElement('a');
        downloadBtn.href = url;
        
        // Critical: Set the filename explicitly
        downloadBtn.download = file.name; 
        
        downloadBtn.innerText = "Download Full File: " + file.name;
        downloadBtn.className = "download-button-main";
        
        // Inline styles for visibility
        downloadBtn.style.display = "inline-block";
        downloadBtn.style.padding = "12px 20px";
        downloadBtn.style.marginBottom = "20px";
        downloadBtn.style.background = "#2ea44f";
        downloadBtn.style.color = "white";
        downloadBtn.style.textDecoration = "none";
        downloadBtn.style.borderRadius = "6px";
        downloadBtn.style.fontWeight = "bold";

        // Append the download link BEFORE the preview
        $output.appendChild(downloadBtn);

        // 3. Now append the file preview (iframe/image/video)
        // This will appear below the download button
        file.appendTo("#output", (err, elem) => {
            if (err) console.error("Preview failed:", err);
            // Ensure the preview element has some spacing
            if (elem) elem.style.marginTop = "20px";
        });
    });

    // 4. Update the progress display
    document.querySelector("#uploadSpeed").innerHTML = "0";
    document.querySelector("#downloadSpeed").innerHTML = "0";
    document.querySelector("#downloaded").innerHTML = prettyBytes(file.length);
    document.querySelector("#progressBar").style.width = '100%';
    
    $.post("/snatched/" + TEMPLAR.paramREC().id);
}

// --- CORE PROGRESS LOGIC (Cleaned up, passed in the single file) ---
function setupProgressAndDownload(fileToDownload) {
    var $body = document.body;
    var $progressBar = document.querySelector("#progressBar")
    var $numPeers = document.querySelector("#numPeers");
    var $downloaded = document.querySelector("#downloaded")
    var $total = document.querySelector("#total")
    var $remaining = document.querySelector("#remaining")
    var $uploadSpeed = document.querySelector("#uploadSpeed")
    var $downloadSpeed = document.querySelector("#downloadSpeed")
    
    // Define the progress function
    function onProgress () {
        // ... (Your entire onProgress function logic goes here) ...
        // NOTE: Use 'fileToDownload' inside this function, not a global 'file'
        
        $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' Peer' : ' Peers.')
        
        // Progress display logic (simplified)
        const fileReceivedBytes = fileToDownload.downloaded;
        let currentProgressBytes;
        
        if (fileToDownload.progress > 0) {
            currentProgressBytes = Math.round(fileToDownload.progress * fileToDownload.length);
        } else {
            currentProgressBytes = fileReceivedBytes;
        }

        currentProgressBytes = Math.min(currentProgressBytes, fileToDownload.length); 
        currentProgressBytes = Math.max(0, currentProgressBytes); 

        $progressBar.style.width = Math.round(fileToDownload.progress * 100) + '%';
        $downloaded.innerHTML = prettyBytes(currentProgressBytes); 
        $total.innerHTML = prettyBytes(fileToDownload.length);
        
        // ... (Your remaining ETA logic goes here, using fileToDownload.progress) ...
        
        let remaining;
        // Simplified ETA logic (assuming prettyBytes and moment are available)
        if (fileToDownload.progress === 1) {
            remaining = 'Done.';
        } else if (fileToDownload.progress === 0 && torrent.downloadSpeed > 0) {
            remaining = 'Starting transfer...';
        } else if (fileToDownload.progress > 0) {
            const bytesRemaining = fileToDownload.length - currentProgressBytes;
            const speed = torrent.downloadSpeed;
            if (speed > 0) {
                const secondsLeft = bytesRemaining / speed;
                remaining = moment.duration(secondsLeft, 'seconds').humanize() + ' remaining.';
            } else {
                remaining = 'Stalled';
            }
        } else {
            remaining = 'Stalled';
        }
        
        $remaining.innerHTML = remaining;
        $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s';
        $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s';

    }

    // 4. Set up the Interval and Listener
    const interval = setInterval(onProgress, 500)
    onProgress() // Initial call

    // Attach the 'done' listener. Pass the file and the interval ID
    fileToDownload.on('done', () => onFileDone(fileToDownload, interval, $remaining, $uploadSpeed, $downloadSpeed));
}


// --- MAIN ENTRY POINT ---
function selectFile() {
    const targetLength = parseInt(TEMPLAR.paramREC().id);

    if (TEMPLAR.paramREC() && TEMPLAR.paramREC().media === "Ebook") {
    // 1. Deselect EVERYTHING first (Good practice, ensuring only one file is active)
      
      // 2. Find the file using length
      const file = torrent.files.find(f => f.length === targetLength);

      if (!file) {
          console.error(`Error: Could not find Ebook file with length ${targetLength}.`);
          return;
      }
      
      // 3. Populate the dedicated list and select the file
      //filesToProcess = [file]; // Set the list to only this file
      file.select();
      
      console.log(`Ebook Selected: ${file.name}. Actual Torrent Size: ${prettyBytes(file.length)}`);
      
      // 4. Start download tracking using the correct 'file' object
      setupProgressAndDownload(file);
    
      // NOTE: The previous bad log line is removed: console.log(`First piece index wanted: ${file.pieceIndex}`);

      //TODO: sort files
      } else if (TEMPLAR.paramREC() && TEMPLAR.paramREC().media === "Audiobook") {
        const id = parseInt(TEMPLAR.paramREC().id);
        const arrAudio = [];
        const container = document.querySelector('#output');

        const audioFiles = torrent.files.filter(f => f.name.toLowerCase().endsWith(".mp3"));
        if (audioFiles.length === 0) return console.error("No MP3 files found.");

        audioFiles.forEach(function(file) {
            const prefix = file.name.split(/[_-]/)[0]; 
            let audiobook = arrAudio.find(a => a.prefix === prefix);
            if (!audiobook) {
                audiobook = { prefix: prefix, total_size_bytes: 0, files: [] };
                arrAudio.push(audiobook);
            }
            audiobook.total_size_bytes += file.length;
            audiobook.files.push(file);
        });

        const fileSet = arrAudio.find(a => a.total_size_bytes === id);
        if (!fileSet) {
            console.error(`Validation Failed: No file set matches total size ${id}`);
            return;
        }

        const toSelect = fileSet.files.sort((a, b) => {
            const getNum = (name) => {
                const match = name.match(/(\d+)(?=\.\w+$)/);
                return match ? parseInt(match[0]) : 0;
            };
            return getNum(a.name) - getNum(b.name);
        });

            // --- AUDIOBOOK PROGRESS LOGIC ---
        const $progressBar = document.querySelector("#progressBar");
        const $downloaded = document.querySelector("#downloaded");
        const $total = document.querySelector("#total");
        const $remaining = document.querySelector("#remaining");
        const $downloadSpeed = document.querySelector("#downloadSpeed"); // Added
        const $uploadSpeed = document.querySelector("#uploadSpeed");     // Added

        function updateAudiobookProgress() {
            const totalDownloaded = toSelect.reduce((sum, f) => sum + f.downloaded, 0);
            const progressPercent = (totalDownloaded / id) * 100;

            // 1. Update Progress Bar and Bytes
            $progressBar.style.width = Math.min(progressPercent, 100) + '%';
            $downloaded.innerHTML = prettyBytes(totalDownloaded);
            $total.innerHTML = prettyBytes(id);

            // 2. Update Speeds (This was likely missing)
            $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s';
            $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s';

            // 3. Update ETA
            if (totalDownloaded >= id) {
                $remaining.innerHTML = "Done !!!";
                $downloadSpeed.innerHTML = "0 B/s"; // Reset on completion
                clearInterval(progressInterval);
            } else if (torrent.downloadSpeed > 0) {
                const bytesLeft = id - totalDownloaded;
                const secondsLeft = bytesLeft / torrent.downloadSpeed;
                $remaining.innerHTML = moment.duration(secondsLeft, 'seconds').humanize() + ' remaining.';
            } else {
                $remaining.innerHTML = "Stalled";
            }
        }

        const progressInterval = setInterval(updateAudiobookProgress, 500);
        // --- DOWNLOAD & DOM INJECTION ---
        const downloadPool = new Array(toSelect.length).fill(null);
        let filesCompleted = 0;

        toSelect.forEach((file, index) => {
            const slot = document.createElement('div');
            slot.className = 'audio-part';
            slot.style.margin = "10px 0";
            slot.innerHTML = `<strong>Part ${index + 1}:</strong> Downloading ${file.name}...`;
            container.appendChild(slot);

            file.select();
            file.getBlob((err, blob) => {
                if (err) return console.error(err);

                downloadPool[index] = blob;
                filesCompleted++;

                const url = URL.createObjectURL(blob);
                slot.innerHTML = `<strong>Part ${index + 1}:</strong> ${file.name}<br>
                                  <audio controls src="${url}" style="width:100%"></audio>`;

                if (filesCompleted === toSelect.length) {
                    clearInterval(progressInterval); // Final cleanup
                    updateAudiobookProgress(); // Final UI sync
                    assembleAudiobook(downloadPool, fileSet.prefix);
                }
            });
        });

        // 6. ASSEMBLY FUNCTION (Defined within scope or globally) Shift 55
        function assembleAudiobook(blobs, searchablePrefix) {
            console.log("Assembly initiated: Ordering segments for output...");

            // Combine segments into a single composite Blob
            const finalAudiobook = new Blob(blobs, { type: 'audio/mpeg' });
            const streamUrl = URL.createObjectURL(finalAudiobook);
            const outputElement = document.querySelector('#output');

            if (!outputElement) {
                console.error("Error: #output element not found.");
                return;
            }

            outputElement.innerHTML = '';

            const player = document.createElement('audio');
            player.controls = true;
            player.src = streamUrl;
            player.style.display = 'block';
            player.style.marginBottom = '10px';
            
            const downloadBtn = document.createElement('a');
            downloadBtn.href = streamUrl;
            downloadBtn.download = `${searchablePrefix || 'Audiobook'}_Full.mp3`;
            downloadBtn.innerText = "Download Consolidated " + toTitleCase(searchablePrefix);
            downloadBtn.className = "download-button"; 
            downloadBtn.style.padding = "10px";
            downloadBtn.style.background = "#2ea44f";
            downloadBtn.style.color = "white";
            downloadBtn.style.textDecoration = "none";
            downloadBtn.style.borderRadius = "6px";

            outputElement.appendChild(player);
            outputElement.appendChild(downloadBtn);

            console.log("Stream and Download ready in #output.");

            $.post("/snatched/" + TEMPLAR.paramREC().id);
        }
  }
}