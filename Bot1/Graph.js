/* Todo:
- Finish implementing Text array
- Implement function that translates from text into ID
- Adjust the print graph function
- Test with different novels

Bugs:
- It doesn't go into recursion

*/

$.ajaxSetup({
    async: false
});

// creates graph and then multiple play through will be from graph

// graph implementation
class Graph {
    constructor(){
        this.V = 0;
        this.E = new Map(); // Vertex number -> children
        this.Text = [];
        this.M = new Map();
    }

    // Give the text paragraph of a section, and make a vertex in the graph
    // updates Edges and Marked
    addVertex(text){
        this.V = this.V + 1;
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

        $.getJSON("http://localhost:3000/links", function (data) {
            // console.log("My links are: ");
            // console.log(data);
            links = data['links'];
            let numLinks = data['links'].length;
            // console.log(numLinks);

            for(let i = 0; i < numLinks; i++) {
                $.get("http://localhost:3000/click/" + i, function () {
                    $.get("http://localhost:3000/text", function (text) {
                        // console.log("the text is:");
                        // console.log(text['text']);
                        children.push(text['text']);
                    });
                    $.get("http://localhost:3000/undo");
                });
            }
        });
        // console.log("my children are: ")
        // console.log(children);
        return children;
    }

    // todo edit print Graph to accomodate for E being an array now
    // todo print Marked array
    printGraph(){
        console.log("I will start printing the graph")
        var keys = this.E.keys();
        for(var i of keys){
            var val = this.E.get(i);
            var str = "";
            for(var j of val){
                str += j + " ";
            }
            // console.log(i + " -> " + str);
            console.log(i);
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
        let numLinks = data['links'].length;

        for(let i = 0; i < numLinks; i++) {
            // check if children is in hashmap
            if (g.E.has(children[i])){
                // dont do anything
                console.log("The children is here already")
            }
            else{
                // add child to graph
                g.addVertex(children[i]);
                $.get("http://localhost:3000/click/" + i, function () {
                    play(children[i]);
                    $.get("http://localhost:3000/undo");
                });
            }
        }
    });

    // // iterate the children of current vertex/text
    // children.forEach(function (child) {
    //     // check if children is in hashmap
    //     if (g.E.has(child)){
    //         // dont do anything
    //         // continue;
    //         // console.log("yes its inside");
    //         return;
    //     }
    //     else{
    //         // add child to graph
    //         g.addVertex(child);
    //         // todo click and undo; to implement this possibly change the forEach to a normal
    //         // todo loop
    //         play(child);
    //     }
    // });
    g.mark(text);
}


var url = "http://localhost:3000/links";
var g = new Graph();

$.getJSON("http://localhost:3000/reset");

// Add starting vertex to graph
$.getJSON("http://localhost:3000/text", function (data) {
    // do something
    // console.log(data['text']);
    g.addVertex(data['text']);
    play(data['text']);
    g.printGraph();
    // setTimeout(g.printGraph,10000);
});




// function play(pre, v) {
//     $.getJSON("http://localhost:3000/links", function (data) {
//         var links = data.links;
//         var numLinks = data.links.length;
//
//         //end of game
//         if (numLinks === 0) {
//             g.mark(v);
//         }
//         else if(g.M.get(v)){
//             //do nothing
//         }
//         //next stage of game, choose option, move on
//         else {
//             for(let i = 0; i < numLinks; i++) {
//                 if(i === numLinks-1){
//                     g.mark(v);
//                 }
//                 //check if vertex of link exist
//                 var keys = g.E.keys();
//                 var newLink = true;
//                 for (let k of keys) {
//                     //add edge
//                     if (k === links[i].text) {
//                         g.addEdge(v, k);
//                         newLink = false;
//                         break;
//                     }
//                 }
//                 if (newLink) {
//                     //create vertex and add edge
//                     g.addVertex(links[i].text);
//                     g.addEdge(v, links[i].text);
//                 }
//
//                 $.get("http://localhost:3000/click/" + i, function () {
//                     // console.log(links[i].text);
//                     play(links[0].text, links[i].text);
//                     $.get("http://localhost:3000/undo");
//                     console.log("Play");
//                 });
//             }
//         }
//     })
// }

// g.printGraph();