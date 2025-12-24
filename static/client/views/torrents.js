function initializeTorrents(table) {

    if (TEMPLAR.paramREC() && TEMPLAR.paramREC().search) {
        $(".search_graph").fadeIn(3000);
    } else {
        $(".search_graph").hide();
    }

    if ($(table) instanceof $.fn.dataTable.Api) {
        $(table).destroy();
    }

    assertTitleLoading();
    assertGraphSearch();
    assertAdvSearchUI();
    assertAdvButton();

    var hashes = []
    var url = ""
    var checkTable = table;
    if (table === "torrents") {
        if (!TEMPLAR.paramREC()) {
            url = "/" + table
        } else {
            url = "/" + table + "/adv_search"
        }
    } else if (TEMPLAR.pageREC() === "top10") {
        url = "/top10/" + table
    } else if (table === "node") {
        url = "/" + table + "/" + TEMPLAR.paramREC().label + "?uuid=" + TEMPLAR.paramREC().uuid
    }

    var stateSave = false;
    if (TEMPLAR.pageREC() === "top10" || TEMPLAR.pageREC() === "node") {
        stateSave = false;
    } else if (!TEMPLAR.paramREC() || !TEMPLAR.paramREC().search) {
        stateSave = true;
    }

    $(document).mouseup(function(e) {
        var container = $(".seeAllField");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
        }
    });

    torrentsTable = $("#" + table).DataTable({
        bDestroy: true,
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.childRowImmediate,
                type: ''
            }
        },
        serverSide: true,
        bSort: true,
        pageLength: TEMPLAR.pageREC() === "top10" ? 10 : 25,
        "aoColumns": [
            { "sWidth": "0%" },
            { "sWidth": "50%" },
            { "sWidth": "12.5%" },
            { "sWidth": "12.5%" },
            { "sWidth": "12.5%" },
            { "sWidth": "12.5%" }
        ],
        processing: true,
        searching: false,
        paging: true,
        info: true,
        columnDefs: [
            { target: 0, visible: false, searchable: false },
            { target: 4, responsivePriority: 1 }
        ],
        rowGroup: {
            dataSrc: 0,
            ordering: true,
            orderable: true,
        },
        ajax: {
            url: url,
            type: "POST",
            data: {
                title: TEMPLAR.paramREC() ? TEMPLAR.paramREC().title : "",
                author: TEMPLAR.paramREC() ? TEMPLAR.paramREC().author : "",
                classes: TEMPLAR.paramREC() ? TEMPLAR.paramREC().classes : "",
                class_all: TEMPLAR.paramREC() ? TEMPLAR.paramREC().class_all : "",
                publisher: TEMPLAR.paramREC() ? TEMPLAR.paramREC().publisher : "",
                type: TEMPLAR.paramREC() ? TEMPLAR.paramREC().type : "",
                media: TEMPLAR.paramREC() ? TEMPLAR.paramREC().media : "",
                format: TEMPLAR.paramREC() ? TEMPLAR.paramREC().format : "",
            },
            dataSrc: function(data) {
                setRecords();
                if (data && data.data[0]) {
                    insertTableData(data)
                }

                var editionsAdded = [];

                tableData.data.forEach(function(record) {
                    var authorField = "";
                    record._fields[1].forEach(function(field, i) {
                        if (i > 0) authorField += ", ";
                        authorField += "<a class='TEMPLAR node author' href='#node?label=author&uuid=" +
                            field.properties.uuid + "'>" + decodeEntities(field.properties.name) + "</a>";
                    });

                    var dateField = "";
                    if (record._fields[0] && record._fields[0].properties.date) {
                        dateField += " <b>[" + decodeEntities(record._fields[0].properties.date) + "]</b> <span id='bye'>by</span> ";
                    }

                    var classesField = " ";
                    record._fields[3].forEach(function(field, i) {
                        if (field.properties.uuid) {
                            classesField += " <a class='TEMPLAR node class' href='#node?label=class&uuid=" +
                                field.properties.uuid + "'>" + decodeEntities(field.properties.name) + "</a>";
                        }
                    });

                    var sourceIMG = assertSourceIMG(record);
                    
                    var numPeers = 0;
                    record._fields[2].forEach(function(edition_torrent) {
                        /* This is where the torrent table (with WebTorrent Download) <th> header is set. */
                        var torrentsTable = "<table class='torrentsTable'><thead><th>Format</th>" +
                            "<th>Download</th><th>Size</th><th>Revs</th></thead><tbody><tr>";

                        if (edition_torrent.torrent) {
                            // Image selection logic based on type
                            
                            if (edition_torrent.edition) {                    

                                torrentsTable += assertTr(record, edition_torrent);

                                if (editionsAdded.indexOf(edition_torrent.edition.properties.uuid) === -1) {
                                    assertFirstEditionRow(records, record, edition_torrent, editionsAdded, assertAPACitation(record, edition_torrent), sourceIMG, dateField, authorField, classesField, torrentsTable);
                                } else {
                                    assertExistingEditionRow(records, record, edition_torrent, editionsAdded, torrentsTable)
                                }
                            }
                        }
                    });
                });
                return records;
            },
        },
        drawCallback: function() {
            assertTitleLoaded();
            if (TEMPLAR.pageREC() === "node") {
                assertButtonTab();
            }
        },
    })
    if (TEMPLAR.pageREC() === "top10") $('th').unbind('click.DT')
}

function assertSourceIMG(record) {
    let sourceIMG;
    const type = record._fields[0].properties.type;

    // Direct mapping to your new minimalist assets
    const mapping = {
        "Nonfiction": "img/nonfiction.png",
        "Fiction": "img/fiction.png",
        "Short Story": "img/short_story.png",
        "Children's Book": "img/children_book.png",
        "Poetry": "img/poetry.png",
        "Play": "img/play.png",
        "Journal Article": "img/journal_article.png",
        "Essay": "img/essay.png",
        "Holy Book": "img/holy_book.png",
        "Tome": "img/tome.png",
        "Encyclopedia": "img/encyclopedia.png",
        "Textbook": "img/textbook.png",
        "Classical Music": "img/classical_music.png",
        "Chant": "img/chant.png"
    };

    sourceIMG = mapping[type] || "img/download.png";
    return sourceIMG;
}

function assertExistingEditionRow(records, record, edition_torrent, editionsAdded, torrentsTable){
  records[editionsAdded.indexOf(edition_torrent.edition.properties.uuid)][5] =
    records[editionsAdded.indexOf(edition_torrent.edition.properties.uuid)][5].slice(0, -16) + torrentsTable + "</table>";
}

function assertFirstEditionRow(records, record, edition_torrent, editionsAdded, citationHtml, sourceIMG, dateField, authorField, classesField, torrentsTable){ //records is DataTable records, not neo4j records.
  editionsAdded.push(edition_torrent.edition.properties.uuid);
      records[editionsAdded.indexOf(edition_torrent.edition.properties.uuid)] = [
          "<img class='tableImg' id='source_" + record._fields[0].properties.uuid + "' src='" + sourceIMG + "'>" +
          "<span class='sourceType'>" + decodeEntities(decodeEntities(decodeEntities(record._fields[0].properties.type))) + "</span>" +
          "<div class='torrentSource'>" +
          "<div class='tableHeading'><a id='sourceTab' class='TEMPLAR node source' href='#node?label=source&uuid=" + record._fields[0].properties.uuid + "'>" +
          (record._fields[0].properties.name.length > 60 ? decodeEntities(record._fields[0].properties.name.substring(0, 60)) + "..." : decodeEntities(record._fields[0].properties.name)) +
          "</a>" + dateField + authorField + "</div><br><div class='torrentClasses normal'>" + classesField + "</div></div>",

          "<span class='apa-trigger'>" + // Removed title='Click to copy citation'
              "<span class='apa-text' id='edition_" + edition_torrent.edition.properties.uuid + "_field'>" +
                citationHtml +
              "</span>" +
              "<span class='copy-status'></span>" +
          "</span>",

          edition_torrent.edition.properties.snatches,
          "<span id='edition_date'>" +
          (edition_torrent.edition.properties.date && edition_torrent.edition.properties.date !== "undefined" && edition_torrent.edition.properties.date !== record._fields[0].properties.date ? record._fields[0].properties.date + "/" + edition_torrent.edition.properties.date : record._fields[0].properties.date) +
          "</span>",
          timeSince(edition_torrent.edition.properties.created_at) + " ago",
          torrentsTable + "</table>"
      ];
}


function assertAPACitation(record, edition_torrent){
  var publisherHtml = "";
  var formerPart = ""; // Authors + Date + Title

  // 1. Build Former Part (Authors)
  record._fields[1].forEach(function(field, i) {
      formerPart += decodeEntities(field.properties.name);
      if (record._fields[1][i + 1]) formerPart += ", ";
      else formerPart += (field.properties.name && !field.properties.name.endsWith(".")) ? ". " : " ";
  });

  // 2. Build Former Part (Date)
  if (!record._fields[0].properties.date && edition_torrent.edition.properties.date) {
      formerPart += "(" + decodeEntities(edition_torrent.edition.properties.date) + "). ";
  } else {
      formerPart += record._fields[0].properties.date ?
          "(" + decodeEntities(record._fields[0].properties.date) +
          (edition_torrent.edition.properties.date && edition_torrent.edition.properties.date !== record._fields[0].properties.date ?
              "/" + decodeEntities(edition_torrent.edition.properties.date) + "). " : "). ") : "";
  }

  // 3. Build Former Part (Source Title)
  formerPart += !["Journal Article", "Essay"].includes(record._fields[0].properties.type) ?
      "<span class='italics'>" + decodeEntities(record._fields[0].properties.name) + "</span>. " :
      decodeEntities(record._fields[0].properties.name) + ". ";

  // 4. Build Publisher HTML
  if (edition_torrent.publisher && edition_torrent.publisher.properties.name) {
      var pubName = toTitleCase(decodeEntities(decodeEntities(edition_torrent.publisher.properties.name)));
      publisherHtml = "<a id='edition_span_publisher' class='TEMPLAR node publisher' href='#node?label=publisher&uuid=" +
          edition_torrent.publisher.properties.uuid + "'> " + pubName + "</a>" +
          (pubName.endsWith(".") ? "" : (record._fields[0].properties.type !== "Journal Article" ? ". " : ", "));
  }

  // 5. Build Remainder (Edition info)
  var remainderPart = "";
  if (edition_torrent.edition.properties.title && edition_torrent.edition.properties.title !== "") {
      remainderPart += decodeEntities(edition_torrent.edition.properties.title);
      if (!edition_torrent.edition.properties.title.endsWith(".")) remainderPart += (record._fields[0].properties.type !== "Journal Article" ? ". " : "");
      else remainderPart += " ";
  }

  if (edition_torrent.edition.properties.no) {
      remainderPart += "(" + decodeEntities(edition_torrent.edition.properties.no) + ")";
      if (edition_torrent.edition.properties.pages) remainderPart += ": ";
  }
  if (edition_torrent.edition.properties.pages) {
      remainderPart += edition_torrent.edition.properties.no ?
          decodeEntities(edition_torrent.edition.properties.pages) + "." :
          ", " + edition_torrent.edition.properties.pages + ".";
  }

  // Construct Final APA Segmented Logic
  var citationHtml = "<span class='apa-former'>" + formerPart + remainderPart + "</span>";
  if (record._fields[0].properties.type === "Journal Article") {
      citationHtml += "<span class='apa-publisher-wrap'>" + publisherHtml + "</span>"
  } else {
      citationHtml += "<span class='apa-publisher-wrap'>" + publisherHtml + "</span>";
  }
  return citationHtml;
}


function assertTitleLoading(){
  $("h2 span").hide();

  $("h2 span").text("Loading...").addClass("loading").fadeIn()
}

function assertTitleLoaded(){

  switch (TEMPLAR.pageREC()) {
    case "titles":
      if(TEMPLAR.paramREC() && TEMPLAR.paramREC().search){
        $("#torrentsTitle span").text("Graph Search").removeClass("loading").fadeIn(3333)

      }
      else{
        $("#torrentsTitle span").text("Titles").removeClass("loading").fadeIn(3333)

      }
      break;
    case "top10":
      $("#top10Title span").text("Top 10").removeClass("loading").show();
      break;
    case "node":
      //TODO: maybe multiple calls here
      //$.get("/source_info/" + TEMPLAR.paramREC().uuid, function (data) {
        assertNodeNameFromData()
        /*$("#addFormat").click(function () {
          TEMPLAR.route("#upload?uuid=" + TEMPLAR.paramREC().uuid);
        });*/
     
        //TEMPLAR.DOM();
      //});
      break;
    default:
      $("#torrentsTitle span").text("Titles").removeClass("loading").fadeIn(3333)

  }
}

function assertGraphSearch(){
  $("#adv_class_all").prop("checked", false);
  $("#adv_class_any").prop("checked", true)
  
  if(TEMPLAR.paramREC() && TEMPLAR.paramREC().class_all === "true"){
    
    $("#adv_class_all").prop("checked", true);
    $("#adv_class_any").prop("checked", false);
  }
  else{
    $("#adv_class_all").prop("checked", false);
    $("#adv_class_any").prop("checked", true);
  }
  $("#adv_title").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().title
      ? decodeURIComponent(TEMPLAR.paramREC().title)
      : ""
  );
  $("#adv_author").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().author
      ? decodeURIComponent(TEMPLAR.paramREC().author)
      : ""
  );
  $("#adv_classes").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().classes
      ? decodeURIComponent(TEMPLAR.paramREC().classes) === "undefined"
        ? ""
        : decodeURIComponent(TEMPLAR.paramREC().classes).replace(/['"]+/g, "")
      : ""
  );

  $("#adv_publisher").val(

    TEMPLAR.paramREC() && TEMPLAR.paramREC().publisher
      ? toTitleCase(decodeURIComponent(TEMPLAR.paramREC().publisher))
      : ""
  );
  $("#adv_type").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().type ? TEMPLAR.paramREC().type : ""
  );
  $("#adv_media").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().media
      ? TEMPLAR.paramREC().media
      : ""
  );
  $("#adv_format").val(
    TEMPLAR.paramREC() && TEMPLAR.paramREC().format
      ? TEMPLAR.paramREC().format
      : ""
  );
}

function assertAdvSearchUI(){
 // $.get("/advanced_search_ui", function (data) {
    $("#adv_type").empty();
    $("#adv_type").append("<option value='all'>All Types</option>");
    $("#adv_media").empty();
    $("#adv_media").append("<option value='all'>All Media</option>");
    $("#adv_format").empty();
    $("#adv_format").append("<option value='all'>All Formats</option>");
    if(TEMPLAR.paramREC() && TEMPLAR.paramREC().class_all === "true"){
      $("#adv_class_all").prop("checked", true);
      $("adv_class_any").prop("checked", false);

    }
    else{
      $("adv_class_any").prop("checked", true);
      $("#adv_class_all").prop("checked", false);
    }
    types.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#adv_type").append(option);
      $("#top10_type").append(option2);
      if (TEMPLAR.paramREC() && TEMPLAR.paramREC().type) {
        $("#adv_type").val(TEMPLAR.paramREC() ? TEMPLAR.paramREC().type : "");
        $("#top10_type").val(TEMPLAR.paramREC() ? TEMPLAR.paramREC().type : "");
      }
    });
    media.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      $("#adv_media").append(option);
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#top10_media").append(option2);
      if (TEMPLAR.paramREC() && TEMPLAR.paramREC().media) {
        $("#adv_media").val(TEMPLAR.paramREC() ? TEMPLAR.paramREC().media : "");

        $("#top10_media").val(
          TEMPLAR.paramREC() ? TEMPLAR.paramREC().media : ""
        );
      }
    });
    formats.forEach(function (val) {
      var option = document.createElement("option");
      $(option).val(val);
      $(option).text(decodeEntities(decodeEntities(val)));
      $("#adv_format").append(option);
      var option2 = document.createElement("option");
      $(option2).val(val);
      $(option2).text(decodeEntities(decodeEntities(val)));
      $("#top10_format").append(option2);
      if (TEMPLAR.paramREC() && TEMPLAR.paramREC().format) {
        $("#adv_format").val(
          TEMPLAR.paramREC() ? TEMPLAR.paramREC().format : ""
        );

        $("#top10_format").val(
          TEMPLAR.paramREC() ? TEMPLAR.paramREC().format : ""
        );
      }
    });
  //});
}

function assertAdvButton(){
  $("#adv_submit").unbind("click");
  $("#adv_submit").click(function () {
    
    TEMPLAR.route(
      "#titles?search=true&title=" +
        encodeURIComponent($("#adv_title").val()) +
        "&author=" +
        encodeURIComponent($("#adv_author").val()) +
        "&classes=" +
        ($("#adv_classes").val()
          ? JSON.stringify(encodeURIComponent($("#adv_classes").val()))
          : "") +
        "&class_all=" +
        $("#adv_class_all").prop("checked") +
        "&publisher=" +
        encodeURIComponent($("#adv_publisher").val()) +
        "&type=" +
        encodeURIComponent($("#adv_type").val()) +
        "&media=" +
        $("#adv_media").val() +
        "&format=" +
        $("#adv_format").val()
    );
    initializeTorrents("torrents");
  });
}

function assertTr(record, edition_torrent){
  if(edition_torrent.torrent){
     var tr = "<tr>";
      tr += "<td>" + edition_torrent.torrent.properties.format + "</td>";          
      
     /*   tr +=
        "<td class='here'>" +
        timeSince(edition_torrent.torrent.properties.created_at) +
        " ago</td>";*/
      tr +=
        "<td><a href='#torrent?id=" + edition_torrent.torrent.properties.size + "&release=" + edition_torrent.torrent.properties.release +  
        "&media=" + edition_torrent.torrent.properties.media + 
         "' class='TEMPLAR torrent stream' href='#torrent?infoHash=" + edition_torrent.torrent.properties.infoHash +
         edition_torrent.torrent.properties.uuid + 
         "'>[WebTorrent]</a></td>"
      tr += "<td>" + prettyBytes(edition_torrent.torrent.properties.size) + "</td><td class='light'><p>" +
        edition_torrent.torrent.properties.snatches +
        "</p></td>"
      tr += "</tr>";
      return tr;
  }
 
}
