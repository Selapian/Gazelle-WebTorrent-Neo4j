function initializeGraph(){
	if(TEMPLAR.pageREC() === "titles" && TEMPLAR.paramREC() && TEMPLAR.paramREC().search){
		$.post("/graph_search",  {title : TEMPLAR.paramREC() ? TEMPLAR.paramREC().title : "",
		author : TEMPLAR.paramREC() ? TEMPLAR.paramREC().author : "",
		classes : TEMPLAR.paramREC() ? TEMPLAR.paramREC().classes : "",
		class_all : TEMPLAR.paramREC() ? TEMPLAR.paramREC().class_all : "",
		publisher : TEMPLAR.paramREC() ? TEMPLAR.paramREC().publisher : "",
		type : TEMPLAR.paramREC() ? TEMPLAR.paramREC().type : "",
		media : TEMPLAR.paramREC() ? TEMPLAR.paramREC().media : "",
		format : TEMPLAR.paramREC() ? TEMPLAR.paramREC().format : "",
		search : TEMPLAR.paramREC() ? TEMPLAR.paramREC().search : ""}, function(data){
			graph(data)
		})
	}
}

function graph(data){
  nodeUUIDs = [];
  renewObelisk();
	data.data.forEach(function(record){

		record._fields.forEach(function(field, i, arr){
			
			var source = arr[0]
			var author = arr[1]
			var classs = arr[2]			
			
			if(TEMPLAR.paramREC() && TEMPLAR.paramREC().classes && TEMPLAR.paramREC().classes !== "undefined"){
			    var classes2 = JSON.parse(decodeEntities(decodeEntities(TEMPLAR.paramREC().classes))).split(",");
			  
			   	classes2.forEach(function(c, j){
			     classes2[j] = decodeEntities(decodeEntities(classes2[j].trim().toLowerCase())).replace(/\s/g,'')				   		
			   	})  
			  
			  
			}
			
			if(TEMPLAR.paramREC() && TEMPLAR.paramREC().title && TEMPLAR.paramREC().title !== "undefined"){
				var titles = decodeEntities(decodeEntities(TEMPLAR.paramREC().title)).split(" ");
				titles.forEach(function(t, j){
					titles[j] = remove_stopwords(titles[j]);
					titles[j] = decodeEntities(decodeEntities(titles[j].trim().toLowerCase())).replace("/\s/g, ''")
					titles[j] = titles[j].replace(/[!,:]/g, "");
				})
			}

			var publisher = arr[3]



			let checkNodes = Obelisk.nodes.some(n => field && n.id === field.properties.uuid);
			if(checkNodes && field.labels[0] !== "Edition"){
				var foundIndex = Obelisk.nodes.findIndex(x => x.id == field.properties.uuid);
				Obelisk.nodes[foundIndex].count++;
			}
			else if(checkNodes){
				var foundIndex = Obelisk.nodes.findIndex(x => x.id == field.properties[publisher]);
				Obelisk.nodes[foundIndex].count++;
			}				
			else if(!checkNodes && field){
				
				if(field.labels[0] === "Source"){
					nodeUUIDs.push(field.properties.uuid);
					if(TEMPLAR.paramREC() && TEMPLAR.paramREC().title &&   titles.some(element => field.properties.title.toLowerCase().includes(element))){
						Obelisk.nodes.push({id: field.properties.uuid, group: "Find Source", name :decodeEntities(decodeEntities(field.properties.title)), count : 1, color: "darkcyan"});
					}
					else{
						Obelisk.nodes.push({id: field.properties.uuid, group: "Source", name :decodeEntities(decodeEntities(field.properties.title)), count : 1, color:"darkcyan"});

					}

				}
				else if(field.labels[0] === "Author"){
					if(TEMPLAR.paramREC()  && TEMPLAR.paramREC().author && TEMPLAR.paramREC().author.toLowerCase().includes(field.properties.searchable.toLowerCase())){
						Obelisk.nodes.push({id: field.properties.uuid, group: "Find Author", name : decodeEntities(decodeEntities(field.properties.author)), count :1, color:"blue"})
					}
					else{
						Obelisk.nodes.push({id: field.properties.uuid, group: "Author", name : decodeEntities(decodeEntities(field.properties.author)), count :1, color:"blue"})

					}

				}
				else if(field.labels[0] === "Class"){
					if(TEMPLAR.paramREC() && TEMPLAR.paramREC().classes && classes2 && classes2.includes(field.properties.name.toLowerCase())){
						Obelisk.nodes.push({id: field.properties.uuid, group: "Find Class", name :decodeEntities(decodeEntities(field.properties.name)), count :1, color: "darkgoldenrod"});

					}

					else{
						Obelisk.nodes.push({id: field.properties.uuid, group: "Class", name :decodeEntities(decodeEntities(field.properties.name)), count :1, color: "darkgoldenrod"});

					}				
				}
				else if(field.labels[0] === "Publisher"){
					var publisherSearch = decodeEntities(decodeEntities(TEMPLAR.paramREC().publisher))

					if(TEMPLAR.paramREC() && TEMPLAR.paramREC().publisher && field.properties.name && !publisher && publisherSearch.toLowerCase().includes(decodeEntities(decodeEntities(field.properties.name.toLowerCase())))){
						Obelisk.nodes.push({id: field.properties.uuid, group: "Find Publisher", name :toTitleCase(decodeEntities(decodeEntities(field.properties.name))), count: 1, color:"#F8F8F8"})
					}		
					else if(field.properties.name){
						Obelisk.nodes.push({id: field.properties.uuid, group: "Publisher", name :toTitleCase(decodeEntities(decodeEntities(field.properties.name))), count: 1, color:"mediumvioletred"})					}
				}
			}
			
			
			if(i===0){
					//Source to Author
					if(field && author){
						var checkLinks = Obelisk.links.some(l => author && l.source === author.properties.uuid && l.target === field.properties.uuid)
						if(!checkLinks){
							Obelisk.links.push({source: author.properties.uuid, target: field.properties.uuid, value : 1})
						}	
					}
					//source to Class
					if(field && classs){
						var checkLinks = Obelisk.links.some(l => classs && l.source === field.properties.uuid && l.target === classs.properties.uuid)
						if(!checkLinks){
							Obelisk.links.push({source: field.properties.uuid, target: classs.properties.uuid, value : 1})
						}
					}

					//source to PUBLISHER
					if(field && publisher && publisher.properties.name){ //only if publisher has a name
						var checkLinks = Obelisk.links.some(l => publisher && l.source === field.properties.uuid && l.target === publisher.properties.uuid)
						if(!checkLinks){
							Obelisk.links.push({source: field.properties.uuid, target: publisher.properties.uuid, value : 1})
						}
					}
			}			
		})
	})
	
	//only called by Dew if params.search === true
	graphRender(".graph_search")
}

function graphRender(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const width = container.clientWidth || $(container).width();
    const height = 333;

    container.innerHTML = ''; 
    const canvas = d3.select(container).append("canvas")
        .attr("width", width)
        .attr("height", height)
        .node();

    const ctx = canvas.getContext("2d");

    /** * Precise Modification: 
     * Calculate scale for 7 clicks out (1/1.3^7 ≈ 0.159)
     */
    const initialScale = Math.pow(1 / 1.3, 7); 
    
    // Create the identity and center it
    const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2) 
        .scale(initialScale)
        .translate(-width / 2, -height / 2); 

    let transform = initialTransform;
    
    const simulation = d3.forceSimulation(Obelisk.nodes)
    // 1. Increase link distance to push connected nodes further apart
    .force("link", d3.forceLink(Obelisk.links).id(d => d.id).distance(777)) 
    
    // 2. Stronger negative charge (repulsion). -1000 to -1500 is better for high-density text
    .force("charge", d3.forceManyBody().strength(-2000)) 
    
    // 3. Collision force prevents text labels from sitting directly on top of each other
    .force("collide", d3.forceCollide().radius(182)) 
    
    .force("center", d3.forceCenter(width / 2, height / 2));

    setTimeout(() => {
        simulation.stop();
    }, 5000);

    const zoom = d3.zoom()
        .scaleExtent([0.03, 7]) // Lowered minimum extent to accommodate the new zoom out
        .on("zoom", (event) => {
            transform = event.transform;
            render(); 
        });

    const d3Canvas = d3.select(canvas);
    
    // Sync the internal zoom behavior with our starting transform
    d3Canvas.call(zoom);
    d3Canvas.call(zoom.transform, initialTransform);

    function render() {
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);
        
        ctx.strokeStyle = "#999";
        // Ensure lines don't get too thick/thin when zoomed
        ctx.lineWidth = 1 / transform.k; 
        
        Obelisk.links.forEach(d => {
            if (d.source && d.target) {
                ctx.beginPath();
                ctx.moveTo(d.source.x, d.source.y);
                ctx.lineTo(d.target.x, d.target.y);
                ctx.stroke();
            }
        });

        const baseFontSize = 15;
        const currentFontSize = baseFontSize / transform.k;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${currentFontSize}px Bitcount Prop Single`; 
        
        Obelisk.nodes.forEach(d => {
            switch(d.group){
                case "Source": ctx.fillStyle = "#17627C"; break;
                case "Author": ctx.fillStyle = "blue"; break;
                case "Class": ctx.fillStyle = "darkgoldenrod"; break;
                case "Publisher": ctx.fillStyle = "mediumvioletred"; break;
                default: ctx.fillStyle = "#F8F8F8"; break;
            }
            const metrics = ctx.measureText(d.name);
            d.__textWidth = metrics.width;
            d.__fontSize = currentFontSize;
            ctx.fillText(d.name, d.x, d.y);
        });
        ctx.restore();
    }

    simulation.on("tick", render);

    d3Canvas.on("click", (event) => {
        const point = transform.invert([event.offsetX, event.offsetY]);
        const mouseX = point[0];
        const mouseY = point[1];

        const clickedNode = Obelisk.nodes.find(d => {
            const textWidth = d.__textWidth || 0;
            const textHeight = d.__fontSize || 0;
            const padding = 5; 
            const left = d.x - (textWidth / 2) - padding;
            const right = d.x + (textWidth / 2) + padding;
            const top = d.y - (textHeight / 2) - padding;
            const bottom = d.y + (textHeight / 2) + padding;
            return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;
        });

        if (clickedNode) {
            const d = clickedNode;
            const routeMap = { "Source": "source", "Author": "author", "Class": "class", "Publisher": "publisher" };
            const label = routeMap[d.group] || d.group.toLowerCase();
            TEMPLAR.route(`#node?label=${label}&uuid=${d.id}`);
        }
    });

    simulation.alphaTarget(.0087).restart();
}

