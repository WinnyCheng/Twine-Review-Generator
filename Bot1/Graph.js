//sets all javascript code to be synchronous
$.ajaxSetup({
    async: false
});

var a = [];

// graph implementation
class Graph {
    constructor(){
        this.V = 0;
        this.E = new Map(); // Vertex nameID -> obj [string text, int vertexNum, array of nameID children, array of link type]
        this.M = new Map(); // Vertex nameID -> boolean
    }
    //Adds a new vertex to the graph with given ID name
    addVertex(nameID) {
        this.V = this.V + 1; //counter for total number of vertices in the graph
        let children = getChildren(); //get all the links and link types, returns an array of objects
        let edgeTo = []; let type = [];
        for(let c of children){
            edgeTo.push(c['nameID']); //list of children name IDs
            type.push(c['linkType']); //list of link types matching children's name IDs
        }
        let ver = {
            numID: this.V,
            Text: this.getText(),
            Children: edgeTo,
            linkType: type
        };
        this.E.set(nameID, ver);
        this.M.set(nameID, false); //vertex is not marked
    }
    //replaces the name ID of a vertex
    replaceVertex(oldName, newName){
        this.E.set(newName, this.E.get(oldName));
        this.E.delete(oldName);
        this.V = this.V - 1;
    }
    mark(v) {
        this.M.set(v, true);
    }
    // grabs passage text from current passage
    getText(){
        let passageText = "";
        $.getJSON("http://localhost:3000/text", function(text){
            passageText += text['text'];
        });
        return passageText.replace(/↶\n|↷\n/g, "");
    }
    // todo merge printGraph implementation from Vizjs branch
    //print all vertices and connected edges
    printGraph(){
        console.log("I will start printing the graph");
        var keys = this.E.keys();
        for(var i of keys){
            var val = this.E.get(i)['Children'];
            var str = "";
            for(var j of val){
                str += this.E.get(j)['numID'] + " ";
                // str += j + " ";
            }
            console.log(this.E.get(i)['numID'] + " -> " + str);
            // console.log(i + " -> " + str);
            a.push({data: { id: i, name: i }});
            a.push({data: { id: str, name: str}});
            a.push({data: { source: i, target: str} });
        }
        console.log("my Vertex are: " + g.V);
        console.log("length of keys are: " + g.E.size);
    }
    //returns the text of every vertex as a String
    getStory(){
        var story = "";
        for(let k of this.E.keys()){
            story += this.E.get(k)['Text'];
        }
        return story;
    }
    //returns an object of the text of every vertex of one path as a String, number of vertices
    // with 3 or more links, and number of vertices with 2 links
    singlePath(){
        var story = "";
        var twoLinks = 0;
        var mulitpleLinks = 0;
        var start = "";
        //grab first vertex, vertex with ID number 1
        for(let k of this.E.keys()){
            if(this.E.get(k)['numID'] === 1){
                start = k;
                break;
            }
        }

        // console.log("start: " + start);

        var vertex = this.E.get(start);
        var child = vertex['Children'];

        //save text
        story += vertex['Text'];

        var childrenEmpty = child.length === 0;
        var returnedToStart = false;

        //go down random path till "End" of story
        //End condition
        // 1. No more links aka children array is empty
        // 2. It returns to starting vertex aka vertex number ID 1
        while(!childrenEmpty && !returnedToStart){
            //check number of links of current vertex
            if(child.length === 2)
                twoLinks++;
            else if(child.length > 2)
                mulitpleLinks++;
            //random edge to next vertex
            var index = Math.floor(Math.random() * child.length);
            // console.log("sChild Length: " + child.length);
            // console.log("index: " + index);
            var current = child[index];
            // console.log("Current: " + current);
            vertex = this.E.get(current);
            child = vertex['Children'];

            //save text
            story += vertex['Text'];
            childrenEmpty = child.length === 0;
            returnedToStart = current === start;
        }

        return {
            text: story,
            twoLinks: twoLinks,
            multiLinks: mulitpleLinks
        };
    }
}

//check duplicates with beginning vertex
function matchStart(nameID){
    //if nameID is default return or default is no longer in graph
    if(nameID === defaultVer || !g.E.has(defaultVer))
        return false;

    //grab text and children of beginning vertex
    let sObj = g.E.get(defaultVer);
    let sText = sObj['Text'];
    let sChildren = sObj['Children'];
    //grab text and children of given vertex
    let obj = g.E.get(nameID);
    let text = obj['Text'];
    let children = obj['Children'];
    //compare texts and children
    let tMatch = sText === text;
    let cMatch = isChildrenEqual(sChildren, children);

    return tMatch && cMatch;
}
//checks if the given array of children are the same
function isChildrenEqual(childrenA, childrenB){
    for(var i = 0; i < childrenA.length || i < childrenB.length; i++){
        if(childrenA[i] !== childrenB[i])
            return false;
    }
    return true;
}

// INPUT: string nameID which represents the passage-name of each passage.
// Traverses through the whole twine game and creates a graph representation
function play(nameID) {
    // console.log('starting to play');
    let children = g.E.get(nameID)['Children'];
    let linkType = g.E.get(nameID)['linkType'];

        for(let i = 0; i < children.length; i++) {
            // check if children is in hashmap
            // if (g.E.has(children[i])){
            //     // dont do anything
            //     console.log("The children is here already");
            // }
            if(!g.E.has(children[i]) && linkType[i] === "link-goto"){
                // add child to graph
                $.get("http://localhost:3000/click/" + i, function () {
                    g.addVertex(children[i]);
                    //replace beginning default if matches
                    if(matchStart(children[i]))
                        g.replaceVertex(defaultVer, children[i]);
                    play(children[i]);
                    $.get("http://localhost:3000/undo");
                });
            }
        }

    g.mark(nameID);
}

// RETURN: an array of objects containing the children IDs of the current passage
// each object is in the format [nameID: string, linkType: string]
// This array contains all the links of the current passage. The field "linkType" describes if the link is a link-goto, cycling-Link or goto-link
function getChildren(){
    var links = [];
    $.getJSON("http://localhost:3000/html", function(data){
        var str = data.html;
        let ID = "???";
        while(str.length > 0 && str.includes("<tw-expression")) {
            str = str.substring(str.indexOf("<tw-expression"));
            let twExpression = str.substring(str.indexOf("<tw-expression") , str.indexOf(">"));
            let expressionName = twExpression.substring(str.indexOf("name"));
            let expressionType = expressionName.split("\"", 2)[1];

            // console.log("Expression type is " + expressionType);

            if (expressionType === "cycling-link"){
                str = str.substring(str.indexOf("tw-link"));
                ID = str.substring(str.indexOf(">")+1, str.indexOf("<"));
            }else if (expressionType === "link"){
                str = str.substring(str.indexOf("tw-link"));
                ID = str.substring(str.indexOf(">")+1, str.indexOf("<"));
            }else if (expressionType === "link-goto"){
                str = str.substring(str.indexOf("link-goto"));
                str = str.substring(str.indexOf("tw-link"));
                let twLinkInfo = str.substring(str.indexOf("tw-link") , str.indexOf("</tw-link>"));
                // Check if link contains a passage-name for ID, otherwise use text as ID
                if (twLinkInfo.includes("passage-name")){
                    str = str.substring(str.indexOf("passage-name"));
                    ID = str.split("\"", 2)[1];
                }else{
                    ID = str.substring(str.indexOf(">")+1, str.indexOf("<"));
                }
            }else{
                ID = "???";
                console.log("Unsupported expression type: " + expressionType);
                str = str.substring(str.indexOf("name"));
            }
            // push link into array
            let link = {
                nameID : ID,
                linkType: expressionType
            };
            if(ID !== "???") {
                links.push(link);
            }
        }
    });
    // console.log(links);
    return links;
}

var url = "http://localhost:3000/links";
var g = new Graph();
$.getJSON("http://localhost:3000/reset");

// Add beginning vertex to graph
let defaultVer = "Begin";
g.addVertex(defaultVer); //add initial vertex to graph
play(defaultVer);
// g.printGraph();

function getGraph(){
    return g;
}