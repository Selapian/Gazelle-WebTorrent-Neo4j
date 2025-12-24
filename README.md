Gazelle-Webtorrent is a BitTorrent indexer for WebTorrent based on Project Gazelle. But the writer of this code has no association with any members of Project Gazelle. It is simply an Open Source JQuery/WebTorrent Library generated based on their architecture. My site is propagate.info, meant for public domain PDFs and audiobooks. Starting with an original educational use-case, I have decided to Open-Source this Software.

The server is express/node.js, and the Database is Neo4j. To get started, you will need to host your express app (server.js) and all the files somewhere, and start a Neo4j Aura Database, or host your own (they have a free Community Edition up to 200,000 or so nodes).

PLUG AND PLAY:
-Edit config.js and enter your Neo4j credentials.
-Edit the Torrents model under static/client/models and insert your Source types (such as Documentary, or Renaissance Art), edition_torrent media (such as Ebook or Concert), and edition_torrent format (such as PDF or mp3). We do not currently support codecs or bitrates, so I would recommend editing your formats to be more specific, like mp3 (192kbps), mp3 (V0), x264 (1080p HD), etc.  


