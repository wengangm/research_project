importScripts("https://d3js.org/d3.v5.min.js");
onmessage=(function(e){
    var data=e.data
    var nodes=data.nodes
    var links=data.links
    var minSize=data.minSize
    var maxSize=data.maxSize
    var circleRadiusMin=data.circleRadiusMin
    var circleRadiusMax=data.circleRadiusMax
    var width=data.width
    var height=data.height
    var chargeStrengthScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([100, 200]);
    nodeScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([circleRadiusMin, circleRadiusMax]);

    const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(function (d) {
            if (d.hasOwnProperty("value")) {
                return 300 + 100 / d.value;
            } else {
                return 300;
            }
        }).strength(0))
        .force("charge", d3.forceManyBody().strength(function (d) {
            return -300;
        }))
        .force("collide", d3.forceCollide().radius(function (d) {
            if (d.hasOwnProperty("data")) {
                return nodeScale(d.data.length)+1
                
            } else {
                if (d.name == 'title') {
                    return nodeScale(circleRadiusMin)+1;
                    
                } else {
                    return nodeScale(circleRadiusMax)+1;
                }
            }
        })
        .strength(1)
        .iterations(3))
        .force("radius",d3.forceRadial().radius(function (d){
            if(d.hasOwnProperty("layer")){
                if(d.layer=='topArea'){
                    return 50
                }else if(d.layer=='subArea'){
                    return 400
                }else if(d.layer=='topic'){
                    if(d.name=='unknonw'){
                        return 700
                    }
                    return 600
                }
            }else if(d.hasOwnProperty("center")){
                if(d.center==1){
                    return 0
                }else{
                    return 50
                }            
            }else{
                return 220
            }
        }).x(width/2).y(height/2).strength(0.5))
        .stop();

        for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            num=i*100/n
            
            postMessage({type: "tick", num: num.toFixed(0)+'%'});
            simulation.tick();
          }
        postMessage({type: "end", nodes: nodes, links: links});
        self.close()
})
