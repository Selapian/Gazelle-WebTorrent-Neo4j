var upload;
var initialized;

function torrentDelete(torrent, li){
	$(li).append("<span>"+torrent.properties.infoHash +"</span>")
	var dl = document.createElement("a");

	$(li).append(dl)
	$(dl).text(" [delete]")
	$(dl).attr("href", "#")
	$(dl).click(function(e){
		e.preventDefault();
		if(confirm("Are you sure you want to delete " + torrent.properties.infoHash + "?")){
			$.post("/delete_torrent/"+torrent.properties.infoHash, function(){
				$(li).empty();
				torrentRestore(torrent, li);
			});	
		}
		
	})
}

function torrentRestore(torrent, li){
	var rs = document.createElement("a");
	$(li).append("<span>" + torrent.properties.infoHash.slice(0,4) + "*" + "</span>")
	$(li).append(rs);
	$(rs).text(" [restore]");
	$(rs).attr("href", "#")
	$(rs).click(function(e){
		e.preventDefault();
		if(confirm("Are you sure you want to restore this torrent, and this torrent has resolved all its DMCA complaints?")){
			$.post("/restore_torrent/" + torrent.properties.infoHash, function(){
				$(li).empty();
				torrentDelete(torrent, li);
			})
		}
	})
}
var caller;
var calls = 0;
function initializeUpload(cb){

	calls++;
	resetUpload();
	$("#errorsDiv").empty();
	var uuid;
	$(".paid").hide();
	var params = TEMPLAR.paramREC();

	$("#uuid").hide();

	//editing edition
	if(!$.isEmptyObject(params)){
		if(params.uuid){

			uploadModel.uuid = params.uuid;
			$("#uploadHeading a").text("Editing");
			$("#uploadHeading a").attr("href", "#upload?uuid=" + uploadModel.uuid);
			$("#uuid").show()
			$("#uuid").val(uploadModel.uuid)
			$("#uuid").prop("disabled", true)
			
			$(".DMCA").show();
			$(".merge_source").show();

			$(".newUpload").hide();
			//get the data for this uuid, it's a new format being added
			
			caller = setTimeout(function(){
				$.get("/upload/" + uploadModel.uuid, function(data){
					$("#submit").prop("disabled", false)
					uploadModel.atlsd = data.atlsd;
					$("#link_address").val(data.atlsd ? data.atlsd : "")
					uploadModel.torrent.LINK_address = uploadModel.atlsd;
					if(!data.record){
						resetUpload();
						cb();
						return;
					}
					

					//dmca complaint area
					/*data.record._fields[5].forEach(function(torrent){
						var li = document.createElement("li")
						$("#DMCA").append(li)
						if(torrent.properties.deleted){
							$(li).empty();
							torrentRestore(torrent, li);
						}
						else{
							$(li).empty();
							torrentDelete(torrent, li);
						}
						
					})*/

					$("#newUploadHeader a").text(" " + toTitleCase(decodeEntities(decodeEntities(data.record._fields[0]))))
          $("#newUploadHeader a").attr("href", "#source?uuid=" + uploadModel.uuid);
          $("#newUploadHeader a").addClass("ANCHOR")
          $("#newUploadHeader a").addClass("source")
					$("#newUploadHeader a").click(function(e){
						e.preventDefault();
						ANCHOR.route("#source?uuid=" + uploadModel.uuid)
					})
					$("#title").val(decodeEntities(decodeEntities(data.record._fields[0]))).trigger("change")
					$("#date").val(decodeEntities(decodeEntities(data.record._fields[3]))).trigger("change");
					data.record._fields[1].forEach(function(author){
						addAuthor(author);
					})
					
					if(data.record._fields[2] && data.record._fields[2].length > 0){
						$("#classes_input").val(data.record._fields[2].join(", ")).trigger("change");
					}

					$("#edition_select").empty();
					uploadModel.editions = [];
					$("#edition_select").append("<option value='new'>New Edition</option>")
					$("#edition_select").val("new").trigger("change");
					$(".existing_edition").show();
					$("#edition_select").show();
					$("#edition_select").change(function(){
						if($("#edition_select").val() !== 'new'){
							$("#newEdition").hide();
						}
						else{
							$("#newEdition").show();
						}
					})
					data.record._fields[4].forEach(function(edition, j){
						var option = document.createElement("option");
						var publisherHtml = "";
						var editionField = "";
			      	data.record._fields[1].forEach(function(field, i){
				      	editionField += field.author ? decodeEntities(decodeEntities(field.author)) : ""
				      	if(data.record._fields[1][i+1]){
				      		editionField += ", "
				      	}
								else if(field.author && !field.author.endsWith(".")){
									editionField += ". "
								}
								else{
									editionField += " "
								}
				      })
				      editionField += data.record._fields[3] ? "(" + decodeEntities(decodeEntities(data.record._fields[3])) + (edition.date ? "-" + 
				      	decodeEntities(decodeEntities(edition.date)) + "). " : "). ") : ""
				      editionField += decodeEntities(decodeEntities(data.record._fields[0])) + ". "


				      if(edition.publisher){
				        publisherHtml += edition.publisher ? decodeEntities(decodeEntities(edition.publisher)) + ". " : " "
				      }
				     
				      if(edition.title){
				      	if(!edition.title.endsWith(".")){
				      		editionField += decodeEntities(decodeEntities(edition.title)) + ". "
				      	}
				      	else{
				      		editionField += decodeEntities(decodeEntities(edition.title)) + " ";
				      	}
				      }
				      editionField += publisherHtml;
				      if(edition.no){
				      	editionField += "(" + decodeEntities(decodeEntities(edition.no)) + ")"
				      	if(edition.pages){
				      		editionField += ", "
				      	}
				      }
				      if(edition.pages){
				      	editionField += decodeEntities(decodeEntities(edition.pages)) + "."
				      }
						
						$(option).val(editionField);
						$(option).text(editionField);
						$("#edition_select").append(option);
						uploadModel.editions.push(edition);
					})
				
					$("#edition_title").val("");
					$("#edition_title").trigger("change");

					$("#edition_date").trigger("change");

					$("#edition_date").val("").trigger("change");

			
					//$("#edition_title").val($("#edition_select").val());

					//$("#edition_select").off();


					$("#edition_select option").each(function(){
					})

					$("#edition_select").change(function(){
						if($("#edition_select").val() !== "new"){
							var pos = $("#edition_select").prop('selectedIndex') - 1;

							//edition array holds old selection
							uploadModel.editions[pos].uuid = data.record._fields[4][pos].uuid;
							uploadModel.edition.edition_uuid = data.record._fields[4][pos].uuid;

							$("#edition_title").val(uploadModel.editions[pos].title).trigger("change");
							$("#edition_no").val(uploadModel.editions[pos].no).trigger("change");
							$("#edition_date").val(uploadModel.editions[pos].date).trigger("change");
							$("#edition_publisher").val(uploadModel.editions[pos].publisher).trigger("change");
							$("#edition_pages").val(uploadModel.editions[pos].pages).trigger("change");
							uploadModel.editions[pos].title = data.record._fields[4][pos].title;
							uploadModel.editions[pos].no = data.record._fields[4][pos].no
							uploadModel.editions[pos].date = data.record._fields[4][pos].date 
							uploadModel.editions[pos].publisher = data.record._fields[4][pos].publisher
							uploadModel.editions[pos].pages = data.record._fields[4][pos].pages

						}
						else{
							uploadModel.edition.edition_uuid = null;
							
						}

					})


					$("#edition_publisher").change(function(){
						uploadModel.edition.edition_publisher = $("#edition_publisher").val();
					})

					$("#edition_pages").change(function(){
						uploadModel.edition.edition_pages = $("#edition_pages").val();
					})

					$("#edition_img").change(function(){
						uploadModel.edition.edition_img = $("#edition_img").val();
					})

					$("#edition_date").change(function(){
						uploadModel.edition.edition_date = $("#edition_date").val();
					})

					$("#edition_title").change(function(){ //this is the edition or volume, not the publisher
						uploadModel.edition.edition_title = $("#edition_title").val();
					})


					data.record._fields[7].properties.types.forEach(function(val){
						var option = document.createElement("option");
						$(option).val(val);
						$(option).text(decodeEntities(decodeEntities(decodeEntities(val))));
						$("#type").append(option);
						$("#type").val(data.record._fields[6]);
						uploadModel.type = $("#type").val();
					})

					data.record._fields[7].properties.media.forEach(function(val){
							var option = document.createElement("option");
							$(option).val(val);
							$(option).text(decodeEntities(decodeEntities(val)));
							$("#media").append(option);
							uploadModel.torrent.media = $("#media").val();
						})

					data.record._fields[7].properties.formats.forEach(function(val){
							var option = document.createElement("option");
							$(option).val(val);
							$(option).text(decodeEntities(decodeEntities(val)));
							$("#format").append(option);
							uploadModel.torrent.format = $("#format").val();
					})
					cb();
				})
			},100)			
			
		}
	}
	if($.isEmptyObject(params)){
		caller = setTimeout(function(){$.get("/upload_structure", function(data){
			$("#submit").prop("disabled", false)
			uploadModel.atlsd = data.atlsd;
			$("#link_address").val(data.atlsd ? data.atlsd : "")
      uploadModel.torrent.LINK_address = data.atlsd;
			data.buoy.types.forEach(function(val){
				var option = document.createElement("option");
				$(option).val(val);
				$(option).text(decodeEntities(decodeEntities(val)));
				$("#type").append(option);
				uploadModel.type = $("#type").val();
			})

			data.buoy.media.forEach(function(val){
				var option = document.createElement("option");
				$(option).val(val);
				$(option).text(decodeEntities(decodeEntities(val)));
				$("#media").append(option);
				uploadModel.torrent.media = $("#media").val();

			})

			data.buoy.formats.forEach(function(val){
				var option = document.createElement("option");
				$(option).val(val);
				$(option).text(decodeEntities(decodeEntities(val)));
				$("#format").append(option);
				uploadModel.torrent.format = $("#format").val();

			})
			cb();
		})
		},100)	
	}

	$("#format").change(function(){
		uploadModel.torrent.format = $(this).val();
	})

	$("#media").change(function(){
		uploadModel.torrent.media = $(this).val();
	})
		

}

function addAuthor(data){
	if(!data || !data.author){
		return false;
	}
	uploadModel.authors.push({
		uuid : data.uuid,
		author : data.author
	});

	addAuthorArea(uploadModel.authors[uploadModel.authors.length - 1].uuid, uploadModel.authors[uploadModel.authors.length - 1].author, function(err, div, select, input, remove, id){

		uploadModel.authors[uploadModel.authors.length - 1].importance = "Author"
		uploadModel.authors[uploadModel.authors.length - 1].role = "";
		$(select).change(function(){
			uploadModel.authors[uploadModel.authors.length - 1].importance = "Author"
		})
		$(input).change(function(){
			uploadModel.authors[uploadModel.authors.length - 1].role = "";
		})

		$(remove).click(function(){
			removeAuthorArea(div, id);
			uploadModel.authors = uploadModel.authors.filter(function( obj ) {
			    return obj.uuid !== data.uuid;
			});
		})
	});

	return false;

}

function htmlUpload(){
	resetUpload();
	ANCHOR.buffer();
	 //updateUpload();

	$("#newEdition").hide();
	$("#edition_select").hide();

	$("#edition").hide();
	$("#edition_check").click(function(){
		if($(this).is(":checked")){
			$("#edition").show();
			$("#newEdition").show();
		}
		else{
			$("#newEdition").hide();
			$("#edition").hide()
		}
	})


	$("#link_price").change(function(){
		uploadModel.torrent.LINK_price = parseFloat($("#link_price").val());
	})


	$("#link_address").change(function(){
		uploadModel.torrent.LINK_address = $("#link_address").val();
	})

	$("#author_importance").hide();
	$("#author_role").hide();
  var apa;
	$("#APA").click(function(e){
		e.preventDefault();
    apa = APA();
		copyToClipboard(apa + " [propagate.info]")
		function copyToClipboard(name) {
		    var $temp = $("<input>");
		    $("body").append($temp);
		    $temp.val(name).select();
		    document.execCommand("copy");
		    $temp.remove();
		}
		function APA(){
		


		  	var publisherHtml = "";
		  	var editionField = "";
		   uploadModel.authors.forEach(function(field, i){
		      	editionField += decodeEntities(decodeEntities(field.author))
		      	if(uploadModel.authors[i+1]){
		      		editionField += ", "
		      	}
					else if(field.author && !field.author.endsWith(".")){
						editionField += ". "
					}
					else{
						editionField += " "
					}
		      })
		      if(!uploadModel.date && $("#edition_date").val()){
		      	editionField += "(" + $("#edition_date").val() + "). ";
		      }
		      else{
		     	 editionField += uploadModel.date ? "(" + 
		     	 uploadModel.date + ($("#edition_date").val() && $("#edition_date").val() !== 
		     	 	uploadModel.date ? "-" + 
		     	 	$("#edition_date").val() + "). " : "). ") : ""

		      }
		      editionField += uploadModel.title + '. '
		      editionField = editionField.replace(':', " - ");
          editionField = editionField.substring(0,150)
		   		if(editionField.length === 150){
		   			editionField = editionField + "..."
		   		}

		      if(uploadModel.edition.edition_publisher){
		      	if(uploadModel.edition.edition_publisher && uploadModel.edition.edition_publisher.endsWith(".")){
		        	publisherHtml += uploadModel.edition.edition_publisher ? uploadModel.edition.edition_publisher + " " : " "
		      	}
		      	else{
		        	publisherHtml += (uploadModel.edition.edition_publisher ? uploadModel.edition.edition_publisher : " ") + 
		        	(uploadModel.type !== "Journal" ? ". " : (uploadModel.edition.edition_title ? ", " : "."))
		      	}
		      }
		     if(uploadModel.type === "Journal"){
		     	  editionField += publisherHtml;
		     }
		      if(uploadModel.edition.edition_title && uploadModel.edition.edition_title !== ""){
		      	if(!uploadModel.edition.edition_title.endsWith(".")){
		      		editionField += uploadModel.edition.edition_title + (uploadModel.type !== "Journal" ? ". " : "")
		      	}
		      	else{
		      		editionField += uploadModel.edition.edition_title + " ";
		      	}
		      }
		      if(uploadModel.type !== "Journal"){
		      	editionField += publisherHtml;
		      }
		      if(uploadModel.edition.edition_no){
		      	editionField += "(" + uploadModel.edition.edition_no + ")"
		      	if(uploadModel.edition.edition_pages){
		      		editionField += ": "
		      	}
		      }
		      if(uploadModel.edition.edition_pages){
		      	editionField += uploadModel.edition.edition_pages + "."
		      }
		  
		   		
		   		
		   		
		      return editionField.trim()
		}

	})

	$("input:file").change(function(){
		function renameFile(originalFile, newName) {
		    return new File([originalFile], newName, {
		        type: originalFile.type,
		        lastModified: originalFile.lastModified,
		    });
		}



		
		var files = this.files; 
		
			seed(files, function(err, torrent){

				//alert("Please download the torrent file and seed in BiglyBT with the WebTorrent plugin. Other torrent clients do not support WebTorrent seeding to the Browser. ****WEBTORRENT DESKTOP IS CURRENTLY BROKEN, SO DO NOT USE IT****")
				$(".torrentArea").empty();
				uploadModel.torrent.length = torrent.length;
				uploadModel.torrent.infoHash = torrent.infoHash;
				uploadModel.torrent.torrentFileBlobURL = torrent.torrentFileBlobURL;
				uploadModel.torrent.media = $("#media").val();
				uploadModel.torrent.format = $("#format").val();
				$(".torrentArea").append('<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Torrent]</a>')
            $(".torrentArea").append('&nbsp;<a href="magnet:?xt=urn:btih:' + torrent.infoHash + "&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337");     		
		
	})

	$("#infoHash").change(function(){
		uploadModel.torrent.infoHash = $(this).val();
		uploadModel.torrent.media = $("#media").val();
		uploadModel.torrent.format = $("#format").val();
	})

	$("#title").change(function(){
		uploadModel.title = $("#title").val();
	})


	$("#date").change(function(){
		uploadModel.date = $("#date").val();
	})


	$("#type").change(function(){
		uploadModel.type = $("#type").val();
	})

	$("#edition_publisher").change(function(){
		uploadModel.edition.edition_publisher = $("#edition_publisher").val();
	})

	$("#edition_title").change(function(){
		uploadModel.edition.edition_title = $("#edition_title").val();
	})

	$("#edition_date").change(function(){
		uploadModel.edition.edition_date = $("#edition_date").val();
	})

	$("#edition_pages").change(function(){
		uploadModel.edition.edition_pages = $("#edition_pages").val();
	})

	$("#edition_img").change(function(){
		uploadModel.edition.edition_img = $("#edition_img").val();
	})

	$("#edition_no").change(function(){
		uploadModel.edition.edition_no = $("#edition_no").val()
	})

	

	$("#add_author").click(function(e){
		e.preventDefault();

      $("body").css("cursor", "progress");
		$.post("/add_author", {author : $("#author_input").val()}, function(data){
        $("body").css("cursor", "default");
			addAuthor(data);
		})
	})

	$("#copyrighted").change(function(){
		if($(this).prop("checked")){
			var cnfrm = confirm('By checking this box, you are certifying that you own the rights to this torrent. You may set the price yourself, and propagate.info will not take any royalty, as this is a free and open source project. Be sure to include a $LINK address!');
			if(cnfrm !== true)
			{
			 $(this).prop("checked", false)
			 $('.paid').fadeOut();
			}
			else{
				$(".copyrighted").fadeIn(777);
				$(".copy:not(.paid)").fadeIn(777);
				$(this).prop('checked', true)
				$(".paid").fadeIn();
			}
		}
		else{
			$(".copyrighted").fadeOut(777);
			$(".copy").fadeOut(777)
			$(".paid").fadeOut();
		}
	})

	$("#public_domain").change(function(){
		if($(this).prop("checked")){
			var cnfrm = confirm('By checking this box, you are certifying that this torrent is in the public domain!');
      if(cnfrm !== true){
        $(".paid").fadeOut();
        $("#link_price").val("")
        $(this).prop('checked', false)
      }
      else{
        $(".paid").fadeOut();
			  $("#link_price").val("") 
      }
			/*var cnfrm = confirm("By checking this box, you are certifying that the torrent you are uploading is in the public domain.")
			if(cnfrm != true){
				$(this).prop("checked", false)
			}
			else{
				$("#payment").prop('checked', false)
				$(".copy").fadeOut(666)		
			}*/
		}

	})



	$("#payment").change(function(){
		if($(this).prop("checked")){
			$(".paid").fadeIn(777);
			$("#public_domain").prop('checked', false)
		}
		else{
			$(".paid").fadeOut();
		} 
	})

	
	$("#create_author").click(function(e){
		e.preventDefault();
       $("body").css("cursor", "progress");
		var retVal = confirm("Are you sure this author does not exist? Please create Author using APA format: Last name, Initials");
           if( retVal === false ) {
              return false;
          }
		$.post("/create_author", {author : $("#author_input").val()}, function(data){
         $("body").css("cursor", "default");
			addAuthor(data);
		})
	})

	$("#classes_input").change(function(){
		uploadModel.classes = $("#classes_input").val().split(",");		
	})

	$("#submit").click(function(e){
		e.preventDefault();
    /*if($("#link_address").val() === ""){
      alert("You must enter a valid LINK address, even if your torrent is in the Public Domain.")
      return;
    }*/
    if($("#copyrighted").prop('checked') === true && $("#link_address").val()=== ""){
      alert("You must enter a valid $ATLANTIS-compatible ETH address in order to self-publish a Copyrighted Torrent!")
      return;
    
    }
		if($("#copyrighted").prop("checked") === false && $("#public_domain").prop("checked") === false){
			addError("You must certify either that your torrent is in the public domain or you have the necessary copyrights to upload!")
      alert("You must certify either that your torrent is in the public domain or you have the necessary copyrights to upload!")
			return;
		}
		$("#submit").prop("disabled", true)
		$("body").css("cursor", "progress");
		$.post("/upload/" + uploadModel.uuid, {APA : apa, public_domain: $("#public_domain").val(), payWhatYouWant : $("#payWhatYouWant").prop("checked"), 
			payment : $("#payment").prop("checked"), copyrighted : $("#copyrighted").prop("checked"), type: uploadModel.type, edition_img : uploadModel.edition.edition_img, 
			edition_pages : uploadModel.edition.edition_pages, edition_publisher : uploadModel.edition.edition_publisher,
		 date: uploadModel.date, title : uploadModel.title, authors : JSON.stringify(uploadModel.authors), ETH_address: uploadModel.torrent.LINK_address, 
		 USD_price
: uploadModel.torrent.LINK_price, 
		 torrent : JSON.stringify(uploadModel.torrent), 
			edition_date : $("#edition_date").val(), edition_uuid : uploadModel.edition.edition_uuid, 
			edition_title : uploadModel.edition.edition_title, edition_no : uploadModel.edition.edition_no, classes : JSON.stringify(uploadModel.classes)},
			 function(data){
			 	$("body").css("cursor", "default");
			if(data.errors && data.errors.length > 0){
				addError(data.errors[0].msg);
        alert(data.errors[0].msg)
				$("#submit").prop("disabled", false)
        return;
			}
			else{				
				resetUpload();
			}
			if(data.uuid)
				//postHealth();
				ANCHOR.route("#source?uuid=" + data.uuid);
			return false; 
		})
	})


	initialized = true;

}

function resetUpload(){
		
		if(uploadModel.atsd){
			$("#links_address").val(uploadModel.atlsd)
		}

    
		$(".newUpload").show();
		$("#newUploadHeader a").text("")
		$("#public_domain").prop("checked", true);
		authorCount = 0;
		calls = 0;

		clearTimeout(caller);
		$("#link_price").val("");
		$("#link_address").val("");
		$("#edition_select").empty();
		$("#edition_select").off("change");
		$(".torrentArea").empty();
		uploadModel.torrent = {infoHash : "", media : "", format : ""};
		uploadModel.uuid = undefined;
		uploadModel.edition = {
		edition_date : "",
		edition_title : "",
		edition_img : "",
		edition_publisher : "",
		edition_no : "",
		edition_pages : "",
		edition_uuid : "null"
		};
		uploadModel.torrent.LINK_address = "";
		uploadModel.torrent.LINK_price = "";
		uploadModel.editions = [];
		uploadModel.date = "";
		uploadModel.authors = [];
		uploadModel.classes = []
		uploadModel.title = "";
	
		$(".DMCA").hide();
		$(".merge_source").hide();
		$("#merge_source_input").val("");
		$("#uploadHeading a").text("Upload")

		$(".paid").hide();
		$(".copyrighted").hide();
		$("#copyrighted").prop("checked", false);
		$('input[name="payment"]').prop('checked', false);
		$(".torrent_a").remove();
		$("#infoHash").val("");

		$("#title").val("");
		$("#date").val("");

		$("#author_input").val("");
		$(".removeAuthor").click();
		$(".author_break").remove();

		$("#upload_files").val(null);
		$("#classes_input").val("");
	

		$("#edition_publisher").val("");
		$("#edition_pages").val("");
		$("#edition_title").val("");
		$("#edition_date").val("");
		$("#edition_img").val("");
		$("#edition_no").val("");

		$("#edition_title").prop("disabled",false)
		$("#edition_date").prop("disabled",false)
		$("#edition_no").prop("disabled",false)
		$("#edition_publisher").prop("disabled",false)
		$("#edition_pages").prop("disabled",false)

		//$("#tags_select").val("----")

		$("#edition_check").prop("checked", false)
		$("#edition").hide();

		//$("#edition_select").append("<option selected value='Standard Edition'>Standard Edition</option>")
		$("#edition_select").hide();
		$(".existing_edition").hide();
		//$("#media").val("ebook");
		//$("#format").val("PDF")

		$(".break").remove();

		$("#type").empty();
		$("#media").empty();
		$("#format").empty();
		$("#submit").prop("disabled", true)

		$("#DMCA").empty();
		//$("#errorsDiv").empty();
}
	
