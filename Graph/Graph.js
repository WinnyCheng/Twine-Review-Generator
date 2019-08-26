
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

/**
 * Graph structure implementation
 */
class Graph {
    /**
     * Build Graph object
     * @param passages - an array of the all the passages in the twine game currently hosted by passage shell
     */
    constructor(passages) {
        this.V = passages.length; //number of vertices
        this.E = this.addVertices(passages); //stores information about edges, pid, and text
        this.visited = new Map();
        this.twineName = this.name(); //name of the Twine game
    }

    /**
     * marks a vertex has been visited
     * @param vertex - key of the vertex
     */
    mark(vertex) {
        this.visited.set(vertex, true);
    }

    /**
     * Adds all passages to graph as vertices
     * @param passages - an array of the all the passages in the twine game currently hosted by passage shell
     * @returns {Map<String, Object>} information about edges, pid, and text of each passage
     */
    addVertices(passages) {
        var map = new Map();
        for (var i = 0; i < passages.length; i++) {
            var passData = {
                PID: passages[i]['pid'],  //unique ID number of passage
                Text: "",
                passageData: passages[i]['text'],
                LinksName: passages[i]['linksName'], //name of link
                LinksPass: passages[i]['linksPass'] //name of passage corresponding to link
            };
            map.set(passages[i]['name'], passData);
        }
        return map;
    }

    /**
     * Prints a visual representation of graph on web page
     */
    printGraph() {
        var keys = this.E.keys(); //get all vertices
        for (var i of keys) {
            if(i.charAt(1) === ".") var parent = "Parent PID " + this.E.get(i)['PID'] + ": " + i.substr(3)
            else var parent = "Parent PID " + this.E.get(i)['PID'] + ": " + i
            var child = ""
            var val = this.E.get(i)['LinksPass']; //get all links for each vertex
            var str = "";
            for (var j of val) {
                if (!str.includes(this.E.get(j)['PID']))
                    str += this.E.get(j)['PID'] + " ";
                if(j.charAt(1) === ".") child += "\nChild PID " + this.E.get(j)['PID'] + ": " + j.substr(3)
                else child += "\nChild PID " + this.E.get(j)['PID'] + ": " + j
            }
            var data = parent + child
            console.log(data)

            var children = str.split(" ");
            children.pop(); //remove empty children

            if (str !== "" && children.length !== 0) {
                for (let k = 0; k < children.length; k++) {
                    graph = graph.insert(graph.length - 2, " " + this.E.get(i)['PID'] + " -> " + children[k]);
                }
            }


        }
        // render the graph on page using viz.js
        var viz = new Viz();
        viz.renderSVGElement(graph)
            .then(function (element) {
                document.body.appendChild(element);
            })
            .catch(error => {
                // Create a new Viz instance (@see Caveats page for more info)
                viz = new Viz();

                // Possibly display the error
                console.error(error);
            });
    }

    /**
     * Grabs text from every single vertex and return it as a String
     * @returns {string} long concatenated string of all the text
     */
    getStory() {
        var story = "";
        for (let k of this.E.keys()) {
            story += this.E.get(k)['Text'] + " ";
        }
        return story.replace(/↶\n|↷\n/g, "");
    }

    printAllVertices() {
        let keys = this.E.keys()
        let vertex = ""
        for (let i of keys) {
            if(i.charAt(1) === ".") vertex += "\n" + this.E.get(i)['PID'] + ": " + i.substr(3)
            else vertex += "\n" + this.E.get(i)['PID'] + ": " + i
        }
        let vertices = "Vertices: " + vertex
        document.getElementById("vertices").innerText = vertices;
    }

    /**
     * Traversing graph from start to end on one random path
     * @returns {{twoLinks: number, multiLinks: number, text: (string|string), list: Array}}
     * twoLinks - number of vertices with 2 links
     * multiLinks - number of vertices with more than 2 links
     * text - long concatenated string of every vertex of one path
     * list - array of every vertex of one path
     */
    singlePath() {
        var seen = new Map(), //keep track of which vertices are visited
            mark = new Map(), //keep track of which vertices not to go back to
            story = "", //text of the twine game as String
            storyArray = [], //text of the twine game as array
            twoLinks = 0, //number of vertices with two links
            mulitpleLinks = 0, //number of vertices with more than 2 links
            start = this.getFirstPID(); //vertex where the game starts

        var vertex = this.E.get(start);
        seen.set(vertex['PID'], true);
        var child = vertex['LinksPass'];

        //save text
        story += vertex['Text'] + " ";
        storyArray.push(vertex['Text']);

        //end of story conditions
        var childrenEmpty = child.length === 0,
            backToBeginning = false;

        //go down random path till "End" of story
        //End condition
        // 1. No more links aka children array is empty
        // 2. It returns to starting vertex aka vertex number ID 1 and is a restart/start over
        while (!childrenEmpty && !backToBeginning) {
            //check number of links of current vertex
            if (child.length === 2) twoLinks++;
            else if (child.length > 2) mulitpleLinks++;

            do { //random edge to next vertex
                var index = Math.floor(Math.random() * child.length);
            } while (mark.has(this.E.get(child[index])['PID'])); //get random index that is unmarked

            //check if all the child are seen, if so mark
            let marked = true;
            for (let c of child)
                marked = marked && mark.has(c);
            mark.set(vertex['PID'], marked);

            //move on to next vertex
            var current = child[index],
                linkName = vertex['LinksName'][index];
            vertex = this.E.get(current);

            //save text if text had not been saved
            if (!seen.has(vertex['PID'])) {
                story += vertex['Text'] + " ";
                storyArray.push(vertex['Text']);
            }

            seen.set(vertex['PID'], true);
            child = vertex['LinksPass'];

            if (child.length === 1)
                mark.set(vertex['PID'], true);

            //check end conditions
            childrenEmpty = child.length === 0;
            backToBeginning = current === start &&
                (linkName.toLowerCase() === "restart" ||
                    linkName.toLowerCase() === "start over")
        }
        return {
            text: story,
            list: storyArray,
            twoLinks: twoLinks,
            multiLinks: mulitpleLinks
        };
    }

    /**
     * Find starting vertex
     * @returns {string} key of starting vertex
     */
    getFirstPID() {
        var start = "";
        for (let key of this.E.keys()) {
            //default start passage = passage with pid 1
            if (this.E.get(key)['PID'] === "1") {
                start = key;
                break;
            }
        }
        return start;
    }

    /**
     * @returns {number} number of vertices
     */
    getNumVer() {
        return this.V;
    }

    /**
     * @returns {number} number of edges
     */
    getNumEdge() {
        var edges = 0;
        for (var k of this.E.keys()) {
            var links = this.E.get(k)['LinksPass'];
            edges += this.rmDuplicates(links).length;
        }
        return edges;
    }

    /**
     * Remove duplicate values in an array
     * @param list - a list of anything
     * @returns {Array} new list with no duplicates
     */
    rmDuplicates(list) {
        var newList = [];
        for (var l of list) {
            if (!newList.includes(l))
                newList.push(l);
        }
        return newList;
    }

    /**
     * Grabs name of twine game through passage shell
     * @returns {string} name of the twine game
     */
    name() {
        var name = "";
        $.getJSON(url, function (data) {
            name += data['name'];
        });
        return name;
    }

    /**
     * Getter function to return name of twine game
     * @returns {string|*} name of the twine game
     */
    getName() {
        return this.twineName;
    }

    getMaxMinAvg() {
        var max = 0, min = Number.MAX_VALUE, sum = 0, total = 0;
        for(let k of this.E.keys()){
            var links = this.E.get(k)['LinksPass'];
            var edges = this.rmDuplicates(links).length;

            total++;
            sum += edges;
            if(edges > max)
                max = edges;
            if(edges < min)
                min = edges;
        }
        var avg = Math.round(sum / total);
        return [max, min, avg];
    }
}


// var counter = 0; //keep track of how many vertices got their text

/**
 * Grab current text from passage shell using /text route
 * @param vertex - key of the vertex
 * @param g - graph object
 */
function getText(vertex, g){
    $.getJSON(url + "text", function(text) {
        var passData = g.E.get(vertex);
        passData['Text'] = text['text'];
        g.E.set(vertex, passData);
    });
}

/**
 * Recursive function to traverse through entire twine game for text
 * @param vertex - key of the vertex
 * @param g - graph object
 */
function setText(vertex, g){
    g.mark(vertex);
    $.getJSON(url + "links", function(data){
        let linkNames = g.E.get(vertex)['LinksName'];
        let linkPass = g.E.get(vertex)['LinksPass'];
        let links = data['links'];

        for(let i = 0; i < links.length; i++){
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

/**
 * Parse html of twine game from /source route of passage shell
 * @returns {Array} array of passages and its pid, text, and links
 */
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
    });
    return passages;
}

/**
 * Parse text of each passage for links, does not support 'goto:' marco
 * @param text -  html text from passage
 * @returns {Array[]} array of links
 */
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

/**
 * Trims extra spacings
 * @param str - a String
 * @returns {*|string} - the given string trimmed
 */
function trim(str){
    var wordsArray = str.split(" ");
    str = "";
    for(var s of wordsArray) {
        if(s.length > 0)
            str += s.trim() + " ";
    }
    return str.trim();
}

/**
 * Create graph object, set all text to each passage grabbed from passage shell
 * @returns {Graph} graph of the twine game
 */
function createGraph(){
    var g = new Graph(parseSource());
    $.getJSON(url + "reset", function(){ //reset game
        //set text from /text route to vertices
        getText(g.getFirstPID(), g);
        setText(g.getFirstPID(), g);
    });
    return g;
}