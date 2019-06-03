
$.ajaxSetup({
    async: false
});

// creates graph and then multiple play through will be from graph

// graph implementation
class Graph {
    constructor(){
        this.V = 0;
        this.E = new Map();
        this.M = new Map();
    }
    addVertex(v){
        this.V = this.V + 1;
        this.E.set(v, []);
        this.M.set(v, false);
    }
    addEdge(v, w){
        this.E.get(v).push(w);
    }
    mark(v){
        this.M.set(v, true);
    }
    printGraph(){
        var keys = this.E.keys();
        for(var i of keys){
            var val = this.E.get(i);
            var str = "";
            for(var j of val){
                str += j + " ";
            }
            console.log(i + " -> " + str);
        }
    }
}

var url = "http://localhost:3000/links";

var g = new Graph();
g.addVertex("Beginning");

play(" ", "Beginning");

function play(pre, v) {
    $.getJSON(url, function (data) {
        var links = data.links;
        var numLinks = data.links.length;

        //end of game
        if (numLinks === 0) {
            g.mark(v);
        }
        else if(g.M.get(v)){
            //do nothing
        }
        //next stage of game, choose option, move on
        else {
            for(let i = 0; i < numLinks; i++) {
                if(i === numLinks-1){
                    g.mark(v);
                }
                // setTimeout(function(){
                //check if vertex of link exist
                var keys = g.E.keys();
                var newLink = true;
                for (let k of keys) {
                    //add edge
                    if (k === links[i].text) {
                        g.addEdge(v, k);
                        newLink = false;
                        break;
                    }
                }
                if (newLink) {
                    //create vertex and add edge
                    g.addVertex(links[i].text);
                    g.addEdge(v, links[i].text);
                }
                $.get("http://localhost:3000/click/" + i, function () {
                    // console.log(links[i].text);
                    play(links[0].text, links[i].text);
                    $.get("http://localhost:3000/undo");
                    console.log("Play");
                });
                // }, 2000);
            }
        }
    })
}

g.printGraph();

