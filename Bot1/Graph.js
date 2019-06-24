
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

var a = [];

// creates graph and then multiple play through will be from graph

// graph implementation
class Graph {
    constructor(){
        this.V = 0;
        this.E = new Map(); // Vertex nameID -> obj [string text, int vertexNum, array of nameID children]
        // children = object{ text , clickIndex, nameID }
        this.M = new Map();
        // this.containsCyclingLink = false;
    }

    // Give the text paragraph of a section, and make a vertex in the graph
    // updates Edges and Marked
    addVertex(nameID) {
        this.V = this.V + 1;
        let children = getChildren();
        let edgeTo = [];
        let type = [];
        for(let c of children){
            edgeTo.push(c['nameID']);
            type.push(c['linkType']);
        }
        let ver = {
            numID: this.V,
            Text: this.getText(),
            Children: edgeTo,
            linkType: type
        };
        // console.log(children);
        this.E.set(nameID, ver);
        this.M.set(nameID, false);
    }

    replaceVertex(oldName, newName){
        this.E.set(newName, this.E.get(oldName));
        this.E.delete(oldName);
        this.V = this.V - 1;
    }

    // addEdge(v, w){
    //     this.E.get(v).push(w);
    // }
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

    // todo this should be a function of the node ***
    // INPUT: passage nameID from a specific passage in the novel
    // RETURN: Array of objects. Each object represents a child of the parent.
    // Each child object contains text, nameID and clickIndex.
    // getChildren(){
    //     let children = [];
    //     let links = [];
    //     // var containsCyclingLink = false;
    //
    //     $.getJSON("http://localhost:3000/links", function (data) {
    //         links = data['links'];
    //         let numLinks = data['links'].length;
    //
    //         // array containing all the cycling links in the html vertix
    //         var cyclingLinks = isCyc();
    //         // array containing all the children IDs from the current passage
    //         var childrenIDs = getChildrenIDs();
    //
    //         for(let i = 0; i < numLinks; i++) {
    //             // check if link is a cycling link, if yes don't click on it
    //             // else continue normal logic and click on it
    //             if (cyclingLinks.includes(links[i]['text'])){
    //                 console.log(links[i]['text']);
    //                 // containsCyclingLink = true;
    //                 // this.setCyclingLink();
    //                 // dont do anything
    //             }else{
    //                 // this is not a cycling link
    //                 $.get("http://localhost:3000/click/" + i, function () {
    //                     $.get("http://localhost:3000/text", function (text) {
    //                         // text is text response
    //                         // console.log("the text is:");
    //                         // console.log(text['text']);
    //                         let child = {
    //                             text : text['text'].replace(/↶\n|↷\n/g, ""),
    //                             clickIndex: i,
    //                             nameID: childrenIDs[i] // todo how to know where to index
    //                         };
    //                         children.push(child);   // debug here
    //
    //                     });
    //                     $.get("http://localhost:3000/undo");
    //                 });
    //             }
    //         }
    //     });
    //     // console.log("my children are: ")
    //     // console.log(children);
    //     // if (containsCyclingLink){
    //     //     this.containsCyclingLink = true;
    //     // }
    //     return children;
    // }

    // todo edit print Graph to accomodate for E being an array now
    // todo print Marked array
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
            // console.log(i);
            a.push({data: { id: i, name: i }});
            a.push({data: { id: str, name: str}});
            a.push({data: { source: i, target: str} });
        }
        console.log("my Vertex are: " + g.V);
        console.log("length of keys are: " + g.E.size);
        // console.log(g.M);
    }
}

//check duplicates with beginning vertex
function matchStart(nameID){
    //if nameID is start return
    if(nameID === "Start")
        return false;

    //grab text and children of start vertex
    let sObj = g.E.get("Start");
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

function isChildrenEqual(childrenA, childrenB){
    for(var i = 0; i < childrenA.length || i < childrenB.length; i++){
        if(childrenA[i] !== childrenB[i])
            return false;
    }
    return true;
}

let hasStart = true;
// INPUT: string nameID which represents the passage-name of each passage.
// RETURNS:
function play(nameID) {
    // console.log('starting to play');
    let children = g.E.get(nameID)['Children'];
    let linkType = g.E.get(nameID)['linkType'];

    // Iterate through each of the links/children of the current vertex/text
    // $.getJSON("http://localhost:3000/links", function (data) {
        // let links = data['links'];

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
                    if(hasStart) {
                        if(matchStart(children[i])) {
                            g.replaceVertex("Start", children[i])
                            hasStart = false;
                        }
                    }
                    play(children[i]);
                    $.get("http://localhost:3000/undo");
                });
            }
        }
    // });
    g.mark(nameID);
}

// todo change the name of the function
//RETURN: an array with the names of the links that are cycling links
// function isCyc(){
//     var hasCyc = [];
//     $.getJSON("http://localhost:3000/html", function(data){
//         var str = data.html;
//         while(str.length > 0 && str.includes("cycling-link")) {
//             str = str.substring(str.indexOf("cycling-link"));
//             var link = str.split(">", 3)[2];
//             link = link.substring(0, link.indexOf("<"));
//
//             hasCyc.push(link);
//             str = str.substring(str.indexOf(link));
//         }
//     });
//     return hasCyc;
// }

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

// Add starting vertex to graph
// $.getJSON("http://localhost:3000/text", function (data) {
//     // do something
//     // console.log(data['text']);
//     g.addVertex(data['text'].replace(/↶\n|↷\n/g, ""));
//     play(data['text'].replace(/↶\n|↷\n/g, ""));
//     // setTimeout(g.printGraph,10000);
// });

g.addVertex("Start");
play("Start");
g.printGraph();
