
var g = createGraph();
senEncoder(g);

var vertices = g.getNumVer(),
    edges = g.getNumEdge(),
    time = gameplay(g, 100),
    sentiment = getSentiAna(g),
    encoderStr = getEncoder(),
    readinglvl = storyReadability(g);

function checkFlag(){
    encoderStr = getEncoder();

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
        "\nReadability: Grade1: " + readinglvl[0] + " Grade2: " + readinglvl[1] +
        "\nSimilarity: ";
    for(let val of encoderStr){
        str += "\n" + val;
    }
    document.getElementById("review").innerText = str;
    console.log(str);
}

checkFlag();
g.printGraph();


