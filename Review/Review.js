
var g = createGraph();
senEncoder(g);

var vertices = g.getNumVer(),
    edges = g.getNumEdge(),
    time = gameplay(g, 100),
    sentiment = getSentiAna(g),
    encoderStr = getEncoder(g);

function checkFlag(){
    encoderStr = getEncoder(g);

    if(encoderStr.length === 0)
        setTimeout(checkFlag, 1000);
    else
        printAll();
}

function printAll(){
    var str = "Printing Data: " +
        "\nNumber of vertices: " + vertices +
        " Number of edges: " + edges +
        "\nEstimated time of gameplay: " + time + " minutes" +
        "\nSentimental Analysis: Negative: " + sentiment['negative']['score'] +
        " Positive: " + sentiment['positive']['score'] +
        " Score: " + sentiment['score'] +
        "\nSimilarity: ";
    for(let val of encoderStr){
        str += "\n" + val;
    }
    document.getElementById("review").innerText = str;
    console.log(str);
}

checkFlag();
g.printGraph();