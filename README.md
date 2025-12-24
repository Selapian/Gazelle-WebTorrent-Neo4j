**WELCOME**

Gazelle-Webtorrent is a BitTorrent indexer for WebTorrent based on Project Gazelle. But the writer of this code has no association with any members of Project Gazelle. It is simply an Open Source JQuery/WebTorrent Library generated based on their architecture.

My site is propagate.info, meant for public domain PDFs and audiobooks. Starting with an original educational use-case, I have decided to Open-Source this Software, because the way that Gazelle structures Libraries could be very innovative for research, ethics, and scholarship.

**GETTING STARTED**

The server is express/node.js, and the Database is Neo4j; downloads work using WebTorrent in the Browser (different from web-seeds). 

To get started, you will need to:

*Host server.js, config.js, static/, and js/ on a node.js platform*

*Start a Neo4j Aura Database, or host your own* (they have a free Community Edition up to 200,000 or so nodes)!

*Edit config.js and enter your Neo4j credentials.*

*Edit the Torrents model under static/client/models* Insert Source types (such as Documentary, or Renaissance Art), edition_torrent media (such as Ebook or Concert), and edition_torrent format (such as PDF or mp3). We do not currently support codecs or bitrates, so I would recommend editing your formats to be more specific, like mp3 (192kbps), mp3 (V0), x264 (1080p HD), etc.  

*I am not currently providing the code to produce uploads*. I may create a Neo4j uploader based on file names in the future.

**ABOUT THE ARCHITECTURE**

This BitTorrent Indexer uses the very innovative and profound Gazelle Methodology for Organization, with (Source)-[]->(Edition)->(Torrent). Two editions, with different translators, are listed under the same Datatable dtrg-group, called a Source (as in, "Primary Source"). If there exists both an audiobook (mp3) and an Ebook (PDF) for a particular translator (Edition), the two torrents are listed under that edition in a <torrentsTable>.  

I have also added Graph Visualization based on Gazelle's "Similar Artists" web. 

Finally, downloads work as follows. While qBitTorrent is the only client capable of handling thousands of individual torrents, and libtorrent has added support for WebTorrent in v2.0, qBitTorrent's implementation of the WebTorrent architecture has been delayed for several years. After struggling for literally years with getting thousands of Torrents to seed on WebTorrent Desktop and BiglyBT (which has a WebTorrent plugin), I realized I could seed one Torrent with thousands of files. Now WebTorrent.js begins with all pieces of the torrent deselected, then matches the "length" (size) of the file in bytes from the DB to the metadata of torrent.files[], and runs file.select on the file.length that matches the "id" (Torrent).size stored from Neo4j. 


