
var g = createGraph();
senEncoder(g);

var vertices = g.getNumVer(),
    edges = g.getNumEdge(),
    time = gameplay(g, 100),
    sentiment = getSentiAna(g),
    encoderStr = getEncoder(),
    readinglvl = storyReadability(g),
    gameName = g.getName();

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

    let wordlist = "{ }";

    // just string formatting
    for (let word of readinglvl[2]) {

        if (readinglvl[2].indexOf(word) === readinglvl[2].indexOf(readinglvl[2][readinglvl[2].length - 1])) {
            wordlist = wordlist.insert(wordlist.length - 1, "\"" + word + "\"");
        }
        else {
            wordlist = wordlist.insert(wordlist.length - 2, "\"" + word + "\", ");
        }
    }

    var str = "Printing Data: " +
        "\n" + gameName +
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
    // console.log(str);
}

function generateReview(){
    var rg = new RiGrammar();
    rg.loadFrom('grammar.json', function(){
        rg.addRule("<gameName>", gameName);
        // rg.print();
        console.log(rg.expand());
    });
}

checkFlag();
g.printGraph();

/*
#V and E: #E > #V, max/min/avg of links - number of options need to find range
Time: too long or too short. Need to think of a good range
Sentimental:
Readability: too easy - complain about not being a kid or it's for kids, too hard complain
    about unable to read certain words
Similarity: range 0.4 to 0.8, < 0.4 = off topic, 0.8 too similar in text (repetitive)
 */
