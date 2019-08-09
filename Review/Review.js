
var g = createGraph();
senEncoder(g);

var vertices = g.getNumVer(),
    edges = g.getNumEdge(),
    time = gameplay(g, 100),
    sentiment = getSentiAna(g),
    encoderStr = getEncoder(),
    readinglvl = storyReadability(g);

// to insert a string inside a string
String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    return string + this;
};

function checkFlag(){
    encoderStr = getEncoder();

    if(encoderStr.length === 0)
        setTimeout(checkFlag, 1000);
    else
        printAll();
}

function printAll(){

    let wordlist = "{ }"

    // just string formatting
    for (let word of readinglvl[2]) {

        if (readinglvl[2].indexOf(word) === readinglvl[2].indexOf(readinglvl[2][readinglvl[2].length - 1])) {

            wordlist = wordlist.insert(wordlist.length - 1, "\"" + word + "\"")

        }
        else {

            wordlist = wordlist.insert(wordlist.length - 2, "\"" + word + "\", ")

        }
    }

    var str = "Printing Data: " +
        "\nNumber of vertices: " + vertices +
        " Number of edges: " + edges +
        "\nEstimated time of gameplay: " + time + " minutes" +
        "\nSentimental Analysis: Negative: " + sentiment['negative']['score'] +
        " Positive: " + sentiment['positive']['score'] +
        " Score: " + sentiment['score'] +
        "\nReadability: Grade1: " + readinglvl[0] + " Grade2: " + readinglvl[1] +
        "\nDifficult words: " + wordlist +
        "\nSimilarity: ";
    for(let val of encoderStr){
        str += "\n" + val;
    }
    document.getElementById("review").innerText = str;
    console.log(str);
}

checkFlag();
g.printGraph();


