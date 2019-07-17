
//sets all javascript code to be synchronous
$.ajaxSetup({ async: false });

// graph template for viz.js
let graph = "digraph { }";

// to insert a string inside a string
String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);

    return string + this;
};

// graph implementation
class Graph {
    constructor(passages){
        this.V = passages.length;
        this.E = this.addVertices(passages);
        this.visited = new Map();
    }
    //given vertex has been visited
    mark(vertex){ this.visited.set(vertex, true); }
    //Adds all passages to graph as vertices
    addVertices(passages) {
        var map = new Map();
        for(var i = 0; i < passages.length; i++){
            var passData = {
                PID: passages[i]['pid'],
                Text: "",
                passageData: passages[i]['text'],
                LinksName: passages[i]['linksName'],
                LinksPass: passages[i]['linksPass']
            };
            map.set(passages[i]['name'], passData);
        }
        return map;
    }
    //print all vertices and connected edges
    printGraph(){
        // console.log("The Graph:");
        var keys = this.E.keys();
        for(var i of keys){
            var val = this.E.get(i)['LinksPass'];
            var str = "";
            for(var j of val){
                if(!str.includes(this.E.get(j)['PID']))
                    str += this.E.get(j)['PID'] + " ";
                // str += j + " ";
            }

            var children = str.split(" ");
            children.pop();

            if(str !== "" && children.length !== 0) {
                console.log(this.E.get(i)['PID'] + " -> " + str);
                console.log(this.E.get(i)['PID'] + " -> " + children);
                // console.log(children.length);
                for(let k = 0; k < children.length; k++) {
                    graph = graph.insert(graph.length - 2, " " + this.E.get(i)['PID'] + " -> " + children[k]);
                }
            }
        }
        // console.log("my Vertex are: " + this.V);
        // console.log("length of keys are: " + this.E.size);
    }
    //returns the text of every vertex as a String
    getStory(){
        var story = "";
        for(let k of this.E.keys()){
            story += this.E.get(k)['Text'];
        }
        return story.replace(/↶\n|↷\n/g, "");
    }
    //returns an object of the text of every vertex of one path as a String, number of vertices
    // with 3 or more links, and number of vertices with 2 links
    singlePath(){
        //keep track of which vertices are visited and marked so it doesn't
        // go back to a path it already gone through
        var seen = new Map(); var mark = new Map();
        var story = "";
        var twoLinks = 0; var mulitpleLinks = 0;
        var start = this.getFirstPID();
        var path = [];

        var vertex = this.E.get(start);
        path.push(start);
        seen.set(vertex['PID'], true);
        var child = vertex['LinksPass'];
        story += vertex['Text']; //save text
        var childrenEmpty = child.length === 0;
        var backToBeginning = false;
        //go down random path till "End" of story
        //End condition
        // 1. No more links aka children array is empty
        // 2. It returns to starting vertex aka vertex number ID 1 and is a restart/start over
        while(!childrenEmpty && !backToBeginning){
            //check number of links of current vertex
            if(child.length === 2) twoLinks++;
            else if(child.length > 2) mulitpleLinks++;

            do { //random edge to next vertex
                var index = Math.floor(Math.random() * child.length);
            } while(mark.has(this.E.get(child[index])['PID'])); //random index that is unmarked

            //check if all seen then mark
            let marked = true;
            for(let c of child)
                marked = marked && mark.has(c);
            mark.set(vertex['PID'], marked);

            var current = child[index];
            var linkName = vertex['LinksName'][index];
            vertex = this.E.get(current);
            path.push(current);
            if(!seen.has(vertex['PID']))
                story += vertex['Text']; //save text
            seen.set(vertex['PID'], true);
            child = vertex['LinksPass'];
            if(child.length === 1)
                mark.set(vertex['PID'], true);
            childrenEmpty = child.length === 0;
            backToBeginning = current === start &&
                (linkName.toLowerCase() === "restart" ||
                linkName.toLowerCase() === "start over")
        }
        console.log(path);
        return {
            text: story,
            twoLinks: twoLinks,
            multiLinks: mulitpleLinks
        };
    }
    //returns the key of vertex with pid 1
    getFirstPID(){
        for(let key of this.E.keys()){
            //default start passage = passage with pid 1
            if(this.E.get(key)['PID'] === "1") return key;
        }
    }
}

//counter to keep track of how many vertices got their text
var counter = 0;
//grab current text from passage shell using /text route
function getText(vertex, g){
    counter++;
    $.getJSON(url + "text", function(text) {
        var passData = g.E.get(vertex);
        passData['Text'] = text['text'];
        // console.log(passData['Text']);
        g.E.set(vertex, passData);
    });
}
//recursive function to traverse through entire twine game for text
function setText(vertex, g){
    g.mark(vertex);
    $.getJSON(url + "links", function(data){
        let linkNames = g.E.get(vertex)['LinksName'];
        let linkPass = g.E.get(vertex)['LinksPass'];
        let links = data['links'];

        for(let i = 0; i < links.length/2; i++){ //******divide by 2 cuz repeats********
            var name = links[i]['text'].trim();
            var index = linkNames.indexOf(name);
            vertex = linkPass[index];
            if(linkNames.includes(name) && !g.visited.has(vertex)) {
                $.get(url + "click/" + i, function () {
                    getText(vertex, g);
                    setText(vertex, g);
                    $.get(url + "undo");
                });
            }
        }
    });
}

var url = "http://localhost:3000/";
//parse html of twine game source information
// return an array of passages and its information
function parseSource(){
    var passages = [];
    $.getJSON(url + "source", function(source){
        var html = $.parseHTML(source['source']);
        for(let el of html){
            if(el.nodeName.toLowerCase() === "tw-passagedata") {
                var attr = el.attributes;
                var text = el.innerText;
                var links = getLinks(text);
                var passData = {
                    pid: attr.pid.nodeValue,
                    name: trim(attr.name.nodeValue),
                    text: text,
                    linksName: links[0],
                    linksPass: links[1]
                };
                passages.push(passData);
            }
        }
        // console.log(passages);
    });
    return passages;
}
// parse text of each passage for links
// does not support goto: macro
function getLinks(text){
    var links = [];
    var str = text;

    while(str.length > 0 && str.includes("[[") && str.includes("]]")){
        var alink = str.substring(str.indexOf("[[")+2, str.indexOf("]]"));
        if(!links.includes(alink))
            links.push(alink);
        str = str.substring(str.indexOf("]]")+2);
    }

    var linksName = [];   //name of link
    var linksPass = [];   //name of passage it links to

    //if links and passage name it's linked to is different
    var index = 0;
    for(let l of links){
        if(l.includes("|")){
            index = l.indexOf("|");
            linksName.push(trim(l.substring(0, index)));
            linksPass.push(trim(l.substring(index+1)));
        }
        else if(l.includes("->")){
            index = l.lastIndexOf("->");
            linksName.push(trim(l.substring(0, index)));
            linksPass.push(trim(l.substring(index+2)));
        }
        else if(l.includes("<-")){
            index = l.lastIndexOf("<-");
            linksPass.push(trim(l.substring(0, index)));
            linksName.push(trim(l.substring(index+2)));
        }
        else{
            linksName.push(trim(l));
            linksPass.push(trim(l));
        }
    }

    return [linksName, linksPass];
}
//trims extra spacings
function trim(str){
    var wordsArray = str.split(" ");
    str = "";
    for(var s of wordsArray) {
        if(s.length > 0)
            str += s.trim() + " ";
    }
    return str.trim();
}

//return the created graph of twine game
function createGraph(){
    var g = new Graph(parseSource());
    $.getJSON(url + "reset", function(){ //reset game
        //set text from /text route to vertices
        getText(g.getFirstPID(), g);
        setText(g.getFirstPID(), g);
    });
    return g;
}

var G = createGraph();
// console.log(G.getStory());
G.printGraph();

// draw the graph on page
var viz = new Viz();
viz.renderSVGElement(graph)
    .then(function(element) {
        document.body.appendChild(element);
    })
    .catch(error => {
        // Create a new Viz instance (@see Caveats page for more info)
        viz = new Viz();

        // Possibly display the error
        //console.error(error);
    });


