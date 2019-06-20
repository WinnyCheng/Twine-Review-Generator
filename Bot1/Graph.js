
/* Todo:
- Finish implementing Text array
- Implement function that translates from text into ID
- Adjust the print graph function
- Test with different novels
Bugs:
- It doesn't go into recursion
- Debug why D is not being added into the shit
*/

$.ajaxSetup({
    async: false
});

let a = [];
let b = "digraph { }";

// custom function for string manipulation
String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);

    return string + this;
};


// creates graph and then multiple play through will be from graph

// graph implementation
class Graph {
    constructor(){
        this.V = 0;
       // this.s = [];
        this.E = new Map(); // Vertex number -> children
        // children = object{ text , index }
        this.Text = [];
        this.M = new Map();
        this.containsCyclingLink = false;
    }

    // Give the text paragraph of a section, and make a vertex in the graph
    // updates Edges and Marked
    addVertex(text){
        this.V = this.V + 1;
       // this.s.push(this.V + 1);
        let children = this.getChildren(text);
        // console.log(children);
        this.E.set(text, children);
        this.M.set(text, false);
    }

    addEdge(v, w){
        this.E.get(v).push(w);
    }
    mark(v){
        this.M.set(v, true);
    }

    addText(text){
        this.Text.push(text);
    }

    // iterate through the Text array and return the index where that matches the input text
    // if not found returns -1
    getIndex(text){
        return this.Text.indexOf(text);
    }

    // todo this should be a function of the node ***
    // INPUT: text from Twine novel node
    // RETURN: Array with the children text of the current node
    // it also clicks and returns in order to stay in the same node
    getChildren(text){
        let children = [];
        let links = [];
        var containsCyclingLink = false

        $.getJSON("http://localhost:3000/links", function (data) {
            // console.log("My links are: ");
            // console.log(data);
            links = data['links'];
            let numLinks = data['links'].length;
            // console.log(numLinks);

            // todo im assuming there wont be an error with the index and the link,
            // they are corresponding of each other.

            // todo array containing all the cycling links in the html vertix
            var cyclingLinks = isCyc();

            for(let i = 0; i < numLinks; i++) {

                // check if link is a cycling link, if yes don't click on it
                // else continue normal logic and click on it
                if (cyclingLinks.includes(links[i]['text'])){
                // if (true){
                    // todo check that is giving the right string
                    console.log(links[i]['text']);
                    containsCyclingLink = true;
                    // this.setCyclingLink();
                    // dont do anything
                }else{
                    // this is not a cycling link
                    $.get("http://localhost:3000/click/" + i, function () {
                        $.get("http://localhost:3000/text", function (text) {
                            // console.log("the text is:");
                            // console.log(text['text']);
                            let child = {
                                text : text['text'].replace(/↶\n|↷\n/g, ""),
                                index: i
                            };
                            children.push(child);

                        });
                        $.get("http://localhost:3000/undo");
                    });
                }
            }
        });
        // console.log("my children are: ")
        // console.log(children);
        if (containsCyclingLink){
            this.containsCyclingLink = true;
        }
        return children;
    }

    saveGraph(){
        var otherKeys = this.E.keys();
        for(var d of otherKeys){
            var value = this.E.get(d);
            var dTrimmed = d.split(' ').slice(0,3).join(' ') + '...';
            var Str = "";
            for(var e of value){
                Str += e + " ";
            }
            var StrTrimmed = Str.split(' ').slice(0,3).join(' ') + '...';
            a.push({data: {id: dTrimmed, name: dTrimmed}});
            a.push({data: {id: StrTrimmed, name: StrTrimmed}});
            a.push({data: {source: dTrimmed, target: StrTrimmed}});
        }
    }

    // todo edit print Graph to accomodate for E being an array now
    // todo print Marked array
    printGraph() {
        console.log("I will start printing the graph")
        var keys = this.E.keys();
        for(var i of keys){
            var val = this.E.get(i);
            // var iTrimmed = i.split(' ').slice(0,3).join(' ');
            // var newI = iTrimmed.replace(/ /g, "_");
            // var sI = newI.replace(/,/g, "");
            // var aI = sI.replace(/"/g, "");
            // var bI = aI.replace(/“/g, "");
            // var fI = bI.replace(/'/g, "");
            var str = "";
            for(var j of val){
                str += j['text'] + " ";
            }
            // var strTrimmed = str.split(' ').slice(0,3).join(' ');
            // var newStr = strTrimmed.replace(/ /g, "_");
            // var sStr = newStr.replace(/,/g, "");
            // var aStr = sStr.replace(/“/g, "");
            // var bStr = aStr.replace(/"/g, "");
            // var fStr = bStr.replace(/'/g, "");
            console.log(i + " -> " + str);
            b = b.insert(b.length - 2, " " + fI + " -> " + fStr);
            // console.log(i);
        }
        console.log("my Vertex are: " + g.V);
        console.log("length of keys are: " + g.E.size);
        console.log(g.M);
    }
}

// INPUT:
// RETURNS:
function play(text) {
    console.log('starting to play');
    let children = g.E.get(text);

    // Iterate through each of the links/children of the current vertex/text
    $.getJSON("http://localhost:3000/links", function (data) {
        // let numLinks = data['links'].length;

        for(let i = 0; i < children.length; i++) {
            // check if children is in hashmap
            if (g.E.has(children[i]['text'])){   // maybe add replace if doesnt work
                // dont do anything
                console.log("The children is here already");
            }
            else{
                // add child to graph
                $.get("http://localhost:3000/click/" + children[i]['index'], function () {
                    g.addVertex(children[i]['text']);
                    play(children[i]['text']);
                    $.get("http://localhost:3000/undo");
                });
            }
        }
    });
    g.mark(text);
}

function isCyc(){
    var hasCyc = [];
    $.getJSON("http://localhost:3000/html", function(data){
        var str = data.html;
        while(str.length > 0 && str.includes("cycling-link")) {
            str = str.substring(str.indexOf("cycling-link"));
            var link = str.split(">", 3)[2];
            link = link.substring(0, link.indexOf("<"));

            // console.log(link);
            hasCyc.push(link);
            str = str.substring(str.indexOf(link));
            // console.log(str);
        }
    });
    return hasCyc;
}


var url = "http://localhost:3000/links";
var g = new Graph();

$.getJSON("http://localhost:3000/reset");

// Add starting vertex to graph
$.getJSON("http://localhost:3000/text", function (data) {
    // do something
    // console.log(data['text']);
    g.addVertex(data['text'].replace(/↶\n|↷\n/g, ""));
    play(data['text'].replace(/↶\n|↷\n/g, ""));
    // setTimeout(g.printGraph,10000);
});

// g.saveGraph();
//
// var cy = window.cy = cytoscape({
//     container: document.getElementById('cy'),
//     layout: {
//         name: 'grid',
//         rows: 2,
//         cols: 2
//     },
//     style: [
//         {
//             selector: 'node[name]',
//             style: {
//                 'content': 'data(name)'
//             }
//         },
//         {
//             selector: 'edge',
//             style: {
//                 'curve-style': 'bezier',
//                 'target-arrow-shape': 'triangle'
//             }
//         }
//     ],
//     elements: a
// });

g.printGraph();

console.log(b);
var viz = new Viz();

viz.renderSVGElement(b)
    .then(function(element) {
        document.body.appendChild(element);
    })
    .catch(error => {
        // Create a new Viz instance (@see Caveats page for more info)
        viz = new Viz();

        // Possibly display the error
        //console.error(error);
    });

// Testing strings
// "↶\n\nB\n\n1. C \n2. E \n"
// "↷\n\nA\n\n1. B \n2. F \n3. G \n"
// "↶\n↷\n\nB\n\n1. C \n2. E \n"
// .replace(/↶\n|↷\n/g, "");
