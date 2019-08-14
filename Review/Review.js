
var g = createGraph();
senEncoder(g);

var vertices = g.getNumVer(),
    edges = g.getNumEdge(),
    time = gameplay(g, 100),
    sentiment = getSentiAna(g),
    encoderStr = getEncoder(),
    readinglvl = storyReadability(g),
    gameName = g.getName(),
    mma = g.getMaxMinAvg();

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
    else {
        generateReview();
        printAll();
        g.printAllVertices();
    }
}

function printAll(){

    let wordlist = "{ }";
    readinglvl[2].splice(5, readinglvl[2].length - 5)

    // just string formatting
    for (let word of readinglvl[2]) {

        if (readinglvl[2].indexOf(word) === readinglvl[2].indexOf(readinglvl[2][readinglvl[2].length - 1])) {
            wordlist = wordlist.insert(wordlist.length - 1, "\"" + word + "\",...");
        }
        else {
            wordlist = wordlist.insert(wordlist.length - 2, "\"" + word + "\", ");
        }
    }

    let sentencelist = "{ }";
    readinglvl[3].splice(3, readinglvl[2].length - 3)

    // just string formatting
    for (let sentence of readinglvl[3]) {

        if (readinglvl[3].indexOf(sentence) === readinglvl[3].indexOf(readinglvl[3][readinglvl[3].length - 1])) {
            sentencelist = sentencelist.insert(sentencelist.length - 1, "\n->\"" + sentence + "\"<-");
        }
        else {
            sentencelist = sentencelist.insert(sentencelist.length - 2, "\n->\"" + sentence + "\"<-, ");
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
        "\nExample sentences: " + sentencelist +
        "\nSimilarity: ";
    for(let val of encoderStr){
        str += "\n" + val;
    }
    document.getElementById("review2").innerText = str;
}

function generateReview(){
    var rg = new RiGrammar();
    rg.loadFrom('grammar.json', function(){
        rg.addRule("<gameName>", gameName);
        rg.addRule("<rating>", calcRating());
        setRules(rg);
        rg.print();
        document.getElementById("review").innerText = rg.expand();
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
Rating based on how many positives. 1 star for each metric
 */

function calcRating(){
    var rating = 0;
    if(edges > vertices && mma[2] > 1 && mma[0] > 2)
        rating++;
    if(time >= 10 && time <=60)
        rating++;
    if(sentiment['score'] > -20 && sentiment['score'] < 20)
        rating++;
    if(readinglvl[0] !== "post college" && readinglvl[0] !== "college")
        rating++;

    var sim = false;
    for(let val of encoderStr){
        if(val > 0.8 || val < 0.4) {
            sim = true;
            break;
        }
    }
    if(!sim)
        rating++;

    return rating.toString();
}

function setRules(rg){
    //time of gameplay
    if(time < 10) {
        rg.addRule("<minute>", "only " + time);
        rg.addRule("<timing>", ["too <short>", "not long enough", "better if it was longer"]);
    }
    else if(time > 60) {
        rg.addRule("<minute>", "almost " + time);
        rg.addRule("<timing>", ["too <long>", "way too <long>", "better if it was shorter"]);
    }
    else{
        rg.addRule("<timing>", ["okay", "a good length"]);
    }

    //sentimental analysis
    var score = sentiment['score'];
    if(score > 0){
        rg.addRule("<sentDes>", "<negative>");
        rg.addRule("<sentiment>", "It's a little too <positive>.")
    }
    else{
        rg.addRule("<sentDes>", ["<positive>"]);
        rg.addRule("<sentiment>", "It's a little too <negative>.")
    }
    rg.addRule("<negative>", getAdj(sentiment['negative']['words']));
    rg.addRule("<positive>", getAdj(sentiment['positive']['words']));

    //graph structure
    if(mma[0] > 10) {
        rg.addRule("<opDes>", ["too many"]);
    }
    if(mma[2] > 1 && mma[0] > 2) {
        rg.addRule("<opDes>", ["fair amount of", "good amount of"]);
    }
    else{
        rg.addRule("<opDes>", ["not enough"]);
    }

    //similarity
    var dif = 0;
    var same = 0;
    for(let val of encoderStr){
        if(val > 0.8)
            same++;
        if(val < 0.4)
            dif++;
    }
    if(dif > 3){
        rg.addRule("<similarity>", [
            "The story didn't flow too well. I changes from on topic to the next to quickly.",
            "There is sometimes a lack of connect form on story point to another.",
            "I kinda got lost at one point in the story.",
            "I think <subject> was off topic at times",
        ]);
    }
    else{
        rg.addRule("<similarity>", [
            "The flow of <subject> was okay.",
            "Good story flow.",
            "The flow of the story was so-so.",
            "Its passable.",
            "I was able to follow through with story."
        ]);
    }
    if(same > 3){
        rg.addRule("<similarity>", [
            "There's too much repetition.",
            "It was kinda repetitive.",
        ]);
    }

    //readability
    var readVal = readinglvl[4];
    if(readVal <= 5.9){
        rg.addRule("<readability>", ["too easy", "too simple"]);
        rg.addRule("<gradeLvl>", "<sentence>");
    }
    else if(readVal > 5.9 && readVal <= 7.9){
        rg.addRule("<gradeLvl>", ["<sentence>"]);
    }
    else{
        rg.addRule("<readability>", "too hard");
        rg.addRule("<gradeLvl>", [
            "\"<difficult>\" What does this even mean?",
            "\"<difficult>\" was an interesting wording.",
            "I had a frustrating time playing <subject>. The wording was complicated.",
            "I had some difficulty understanding some things. Like, \"<difficult>\" or \"<difficult>\""
        ]);
        rg.addRule("<difficult>", ["<difWord>", "<difSent>"])
    }
    rg.addRule("<difWord>", readinglvl[2]);
    rg.addRule("<difSent>", readinglvl[3]);
}

/**
 * Filter out words that are no adjectives
 * @param wordslist list of words
 */
function getAdj(wordslist){
    let w = 0;
    while (w < wordslist.length) {
        var word = wordslist[w];
        if (!RiTa.isAdjective(word))
            wordslist.splice(w, 1);
        else
            w++;
    }
    return wordslist;
}