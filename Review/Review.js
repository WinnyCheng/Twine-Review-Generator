
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
        document.getElementById("review2").innerText = "\nVertices:" + g.printAllVertices();
        // printAll();
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
    var rg = new RiGrammar()
    initialGrammar(rg);
    rg.addRule("<gameName>", gameName);
    rg.addRule("<rating>", calcRating());
    setRules(rg);
    rg.print();
    document.getElementById("review").innerText = rg.expand();
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

function initialGrammar(rg){
    rg.addRule("<start>", [
        "<rateStar> <similarity> <length> <options> <sentiment> <gradeLvl>",
        "<rateStar> <length> <similarity> <options> <sentiment> <gradeLvl>",
        "<rateStar> <options> <length> <similarity> <sentiment> <gradeLvl>",
        "<rateStar> <length> <options> <similarity> <sentiment> <gradeLvl>",
        "<rateStar> <similarity> <options> <length> <sentiment> <gradeLvl>",
        "<rateStar> <options> <similarity> <length> <sentiment> <gradeLvl>",
        "<rateStar> <sentiment> <similarity> <length> <options> <gradeLvl>",
        "<rateStar> <similarity> <sentiment> <length> <options> <gradeLvl>",
        "<rateStar> <similarity> <length> <sentiment> <options> <gradeLvl>",
        "<rateStar> <length> <similarity> <sentiment> <options> <gradeLvl>",
        "<rateStar> <sentiment> <length> <similarity> <options> <gradeLvl>",
        "<rateStar> <length> <sentiment> <similarity> <options> <gradeLvl>",
        "<rateStar> <options> <sentiment> <similarity> <length> <gradeLvl>",
        "<rateStar> <sentiment> <options> <similarity> <length> <gradeLvl>",
        "<rateStar> <sentiment> <similarity> <options> <length> <gradeLvl>",
        "<rateStar> <similarity> <sentiment> <options> <length> <gradeLvl>",
        "<rateStar> <similarity> <options> <sentiment> <length> <gradeLvl>",
        "<rateStar> <options> <similarity> <sentiment> <length> <gradeLvl>",
        "<rateStar> <sentiment> <options> <length> <similarity> <gradeLvl>",
        "<rateStar> <options> <sentiment> <length> <similarity> <gradeLvl>",
        "<rateStar> <length> <sentiment> <options> <similarity> <gradeLvl>",
        "<rateStar> <sentiment> <length> <options> <similarity> <gradeLvl>",
        "<rateStar> <options> <length> <sentiment> <similarity> <gradeLvl>",
        "<rateStar> <length> <options> <sentiment> <similarity> <gradeLvl>",
        "<sentiment> <similarity> <length> <options> <gradeLvl> <rateStar>",
        "<similarity> <sentiment> <length> <options> <gradeLvl> <rateStar>",
        "<length> <sentiment> <similarity> <options> <gradeLvl> <rateStar>",
        "<sentiment> <length> <similarity> <options> <gradeLvl> <rateStar>",
        "<similarity> <length> <sentiment> <options> <gradeLvl> <rateStar>",
        "<length> <similarity> <sentiment> <options> <gradeLvl> <rateStar>",
        "<length> <similarity> <options> <sentiment> <gradeLvl> <rateStar>",
        "<similarity> <length> <options> <sentiment> <gradeLvl> <rateStar>",
        "<options> <length> <similarity> <sentiment> <gradeLvl> <rateStar>",
        "<length> <options> <similarity> <sentiment> <gradeLvl> <rateStar>",
        "<similarity> <options> <length> <sentiment> <gradeLvl> <rateStar>",
        "<options> <similarity> <length> <sentiment> <gradeLvl> <rateStar>",
        "<options> <sentiment> <length> <similarity> <gradeLvl> <rateStar>",
        "<sentiment> <options> <length> <similarity> <gradeLvl> <rateStar>",
        "<length> <options> <sentiment> <similarity> <gradeLvl> <rateStar>",
        "<options> <length> <sentiment> <similarity> <gradeLvl> <rateStar>",
        "<sentiment> <length> <options> <similarity> <gradeLvl> <rateStar>",
        "<length> <sentiment> <options> <similarity> <gradeLvl> <rateStar>",
        "<similarity> <sentiment> <options> <length> <gradeLvl> <rateStar>",
        "<sentiment> <similarity> <options> <length> <gradeLvl> <rateStar>",
        "<options> <similarity> <sentiment> <length> <gradeLvl> <rateStar>",
        "<similarity> <options> <sentiment> <length> <gradeLvl> <rateStar>",
        "<sentiment> <options> <similarity> <length> <gradeLvl> <rateStar>",
        "<options> <sentiment> <similarity> <length> <gradeLvl> <rateStar>",
        "<gradeLvl> <sentiment> <similarity> <length> <options> <rateStar>",
        "<sentiment> <gradeLvl> <similarity> <length> <options> <rateStar>",
        "<similarity> <gradeLvl> <sentiment> <length> <options> <rateStar>",
        "<gradeLvl> <similarity> <sentiment> <length> <options> <rateStar>",
        "<sentiment> <similarity> <gradeLvl> <length> <options> <rateStar>",
        "<similarity> <sentiment> <gradeLvl> <length> <options> <rateStar>",
        "<similarity> <sentiment> <length> <gradeLvl> <options> <rateStar>",
        "<sentiment> <similarity> <length> <gradeLvl> <options> <rateStar>",
        "<length> <similarity> <sentiment> <gradeLvl> <options> <rateStar>",
        "<similarity> <length> <sentiment> <gradeLvl> <options> <rateStar>",
        "<sentiment> <length> <similarity> <gradeLvl> <options> <rateStar>",
        "<length> <sentiment> <similarity> <gradeLvl> <options> <rateStar>",
        "<length> <gradeLvl> <similarity> <sentiment> <options> <rateStar>",
        "<gradeLvl> <length> <similarity> <sentiment> <options> <rateStar>",
        "<similarity> <length> <gradeLvl> <sentiment> <options> <rateStar>",
        "<length> <similarity> <gradeLvl> <sentiment> <options> <rateStar>",
        "<gradeLvl> <similarity> <length> <sentiment> <options> <rateStar>",
        "<similarity> <gradeLvl> <length> <sentiment> <options> <rateStar>",
        "<sentiment> <gradeLvl> <length> <similarity> <options> <rateStar>",
        "<gradeLvl> <sentiment> <length> <similarity> <options> <rateStar>",
        "<length> <sentiment> <gradeLvl> <similarity> <options> <rateStar>",
        "<sentiment> <length> <gradeLvl> <similarity> <options> <rateStar>",
        "<gradeLvl> <length> <sentiment> <similarity> <options> <rateStar>",
        "<length> <gradeLvl> <sentiment> <similarity> <options> <rateStar>",
        "<options> <gradeLvl> <sentiment> <similarity> <length> <rateStar>",
        "<gradeLvl> <options> <sentiment> <similarity> <length> <rateStar>",
        "<sentiment> <options> <gradeLvl> <similarity> <length> <rateStar>",
        "<options> <sentiment> <gradeLvl> <similarity> <length> <rateStar>",
        "<gradeLvl> <sentiment> <options> <similarity> <length> <rateStar>",
        "<sentiment> <gradeLvl> <options> <similarity> <length> <rateStar>",
        "<sentiment> <gradeLvl> <similarity> <options> <length> <rateStar>",
        "<gradeLvl> <sentiment> <similarity> <options> <length> <rateStar>",
        "<similarity> <sentiment> <gradeLvl> <options> <length> <rateStar>",
        "<sentiment> <similarity> <gradeLvl> <options> <length> <rateStar>",
        "<gradeLvl> <similarity> <sentiment> <options> <length> <rateStar>",
        "<similarity> <gradeLvl> <sentiment> <options> <length> <rateStar>",
        "<similarity> <options> <sentiment> <gradeLvl> <length> <rateStar>",
        "<options> <similarity> <sentiment> <gradeLvl> <length> <rateStar>",
        "<sentiment> <similarity> <options> <gradeLvl> <length> <rateStar>",
        "<similarity> <sentiment> <options> <gradeLvl> <length> <rateStar>",
        "<options> <sentiment> <similarity> <gradeLvl> <length> <rateStar>",
        "<sentiment> <options> <similarity> <gradeLvl> <length> <rateStar>",
        "<gradeLvl> <options> <similarity> <sentiment> <length> <rateStar>",
        "<options> <gradeLvl> <similarity> <sentiment> <length> <rateStar>",
        "<similarity> <gradeLvl> <options> <sentiment> <length> <rateStar>",
        "<gradeLvl> <similarity> <options> <sentiment> <length> <rateStar>",
        "<options> <similarity> <gradeLvl> <sentiment> <length> <rateStar>",
        "<similarity> <options> <gradeLvl> <sentiment> <length> <rateStar>",
        "<length> <options> <gradeLvl> <sentiment> <similarity> <rateStar>",
        "<options> <length> <gradeLvl> <sentiment> <similarity> <rateStar>",
        "<gradeLvl> <length> <options> <sentiment> <similarity> <rateStar>",
        "<length> <gradeLvl> <options> <sentiment> <similarity> <rateStar>",
        "<options> <gradeLvl> <length> <sentiment> <similarity> <rateStar>",
        "<gradeLvl> <options> <length> <sentiment> <similarity> <rateStar>",
        "<gradeLvl> <options> <sentiment> <length> <similarity> <rateStar>",
        "<options> <gradeLvl> <sentiment> <length> <similarity> <rateStar>",
        "<sentiment> <gradeLvl> <options> <length> <similarity> <rateStar>",
        "<gradeLvl> <sentiment> <options> <length> <similarity> <rateStar>",
        "<options> <sentiment> <gradeLvl> <length> <similarity> <rateStar>",
        "<sentiment> <options> <gradeLvl> <length> <similarity> <rateStar>",
        "<sentiment> <length> <gradeLvl> <options> <similarity> <rateStar>",
        "<length> <sentiment> <gradeLvl> <options> <similarity> <rateStar>",
        "<gradeLvl> <sentiment> <length> <options> <similarity> <rateStar>",
        "<sentiment> <gradeLvl> <length> <options> <similarity> <rateStar>",
        "<length> <gradeLvl> <sentiment> <options> <similarity> <rateStar>",
        "<gradeLvl> <length> <sentiment> <options> <similarity> <rateStar>",
        "<options> <length> <sentiment> <gradeLvl> <similarity> <rateStar>",
        "<length> <options> <sentiment> <gradeLvl> <similarity> <rateStar>",
        "<sentiment> <options> <length> <gradeLvl> <similarity> <rateStar>",
        "<options> <sentiment> <length> <gradeLvl> <similarity> <rateStar>",
        "<length> <sentiment> <options> <gradeLvl> <similarity> <rateStar>",
        "<sentiment> <length> <options> <gradeLvl> <similarity> <rateStar>",
        "<similarity> <length> <options> <gradeLvl> <sentiment> <rateStar>",
        "<length> <similarity> <options> <gradeLvl> <sentiment> <rateStar>",
        "<options> <similarity> <length> <gradeLvl> <sentiment> <rateStar>",
        "<similarity> <options> <length> <gradeLvl> <sentiment> <rateStar>",
        "<length> <options> <similarity> <gradeLvl> <sentiment> <rateStar>",
        "<options> <length> <similarity> <gradeLvl> <sentiment> <rateStar>",
        "<options> <length> <gradeLvl> <similarity> <sentiment> <rateStar>",
        "<length> <options> <gradeLvl> <similarity> <sentiment> <rateStar>",
        "<gradeLvl> <options> <length> <similarity> <sentiment> <rateStar>",
        "<options> <gradeLvl> <length> <similarity> <sentiment> <rateStar>",
        "<length> <gradeLvl> <options> <similarity> <sentiment> <rateStar>",
        "<gradeLvl> <length> <options> <similarity> <sentiment> <rateStar>",
        "<gradeLvl> <similarity> <options> <length> <sentiment> <rateStar>",
        "<similarity> <gradeLvl> <options> <length> <sentiment> <rateStar>",
        "<options> <gradeLvl> <similarity> <length> <sentiment> <rateStar>",
        "<gradeLvl> <options> <similarity> <length> <sentiment> <rateStar>",
        "<similarity> <options> <gradeLvl> <length> <sentiment> <rateStar>",
        "<options> <similarity> <gradeLvl> <length> <sentiment> <rateStar>",
        "<length> <similarity> <gradeLvl> <options> <sentiment> <rateStar>",
        "<similarity> <length> <gradeLvl> <options> <sentiment> <rateStar>",
        "<gradeLvl> <length> <similarity> <options> <sentiment> <rateStar>",
        "<length> <gradeLvl> <similarity> <options> <sentiment> <rateStar>",
        "<similarity> <gradeLvl> <length> <options> <sentiment> <rateStar>",
        "<gradeLvl> <similarity> <length> <options> <sentiment> <rateStar>",
        "<rateStar> <length> <similarity> <gradeLvl> <sentiment> <options>",
        "<rateStar> <similarity> <length> <gradeLvl> <sentiment> <options>",
        "<rateStar> <gradeLvl> <length> <similarity> <sentiment> <options>",
        "<rateStar> <length> <gradeLvl> <similarity> <sentiment> <options>",
        "<rateStar> <similarity> <gradeLvl> <length> <sentiment> <options>",
        "<rateStar> <gradeLvl> <similarity> <length> <sentiment> <options>",
        "<rateStar> <sentiment> <gradeLvl> <similarity> <length> <options>",
        "<rateStar> <gradeLvl> <sentiment> <similarity> <length> <options>",
        "<rateStar> <similarity> <gradeLvl> <sentiment> <length> <options>",
        "<rateStar> <gradeLvl> <similarity> <sentiment> <length> <options>",
        "<rateStar> <sentiment> <similarity> <gradeLvl> <length> <options>",
        "<rateStar> <similarity> <sentiment> <gradeLvl> <length> <options>",
        "<rateStar> <length> <sentiment> <gradeLvl> <similarity> <options>",
        "<rateStar> <sentiment> <length> <gradeLvl> <similarity> <options>",
        "<rateStar> <sentiment> <gradeLvl> <length> <similarity> <options>",
        "<rateStar> <gradeLvl> <sentiment> <length> <similarity> <options>",
        "<rateStar> <length> <gradeLvl> <sentiment> <similarity> <options>",
        "<rateStar> <gradeLvl> <length> <sentiment> <similarity> <options>",
        "<rateStar> <similarity> <length> <sentiment> <gradeLvl> <options>",
        "<rateStar> <length> <similarity> <sentiment> <gradeLvl> <options>",
        "<rateStar> <length> <sentiment> <similarity> <gradeLvl> <options>",
        "<rateStar> <sentiment> <length> <similarity> <gradeLvl> <options>",
        "<rateStar> <sentiment> <similarity> <length> <gradeLvl> <options>",
        "<rateStar> <similarity> <sentiment> <length> <gradeLvl> <options>",
        "<rateStar> <options> <similarity> <sentiment> <gradeLvl> <length>",
        "<rateStar> <similarity> <options> <sentiment> <gradeLvl> <length>",
        "<rateStar> <sentiment> <options> <similarity> <gradeLvl> <length>",
        "<rateStar> <options> <sentiment> <similarity> <gradeLvl> <length>",
        "<rateStar> <similarity> <sentiment> <options> <gradeLvl> <length>",
        "<rateStar> <sentiment> <similarity> <options> <gradeLvl> <length>",
        "<rateStar> <gradeLvl> <sentiment> <similarity> <options> <length>",
        "<rateStar> <sentiment> <gradeLvl> <similarity> <options> <length>",
        "<rateStar> <similarity> <sentiment> <gradeLvl> <options> <length>",
        "<rateStar> <sentiment> <similarity> <gradeLvl> <options> <length>",
        "<rateStar> <gradeLvl> <similarity> <sentiment> <options> <length>",
        "<rateStar> <similarity> <gradeLvl> <sentiment> <options> <length>",
        "<rateStar> <options> <gradeLvl> <sentiment> <similarity> <length>",
        "<rateStar> <gradeLvl> <options> <sentiment> <similarity> <length>",
        "<rateStar> <gradeLvl> <sentiment> <options> <similarity> <length>",
        "<rateStar> <sentiment> <gradeLvl> <options> <similarity> <length>",
        "<rateStar> <options> <sentiment> <gradeLvl> <similarity> <length>",
        "<rateStar> <sentiment> <options> <gradeLvl> <similarity> <length>",
        "<rateStar> <similarity> <options> <gradeLvl> <sentiment> <length>",
        "<rateStar> <options> <similarity> <gradeLvl> <sentiment> <length>",
        "<rateStar> <options> <gradeLvl> <similarity> <sentiment> <length>",
        "<rateStar> <gradeLvl> <options> <similarity> <sentiment> <length>",
        "<rateStar> <gradeLvl> <similarity> <options> <sentiment> <length>",
        "<rateStar> <similarity> <gradeLvl> <options> <sentiment> <length>",
        "<rateStar> <options> <length> <gradeLvl> <sentiment> <similarity>",
        "<rateStar> <length> <options> <gradeLvl> <sentiment> <similarity>",
        "<rateStar> <gradeLvl> <options> <length> <sentiment> <similarity>",
        "<rateStar> <options> <gradeLvl> <length> <sentiment> <similarity>",
        "<rateStar> <length> <gradeLvl> <options> <sentiment> <similarity>",
        "<rateStar> <gradeLvl> <length> <options> <sentiment> <similarity>",
        "<rateStar> <sentiment> <gradeLvl> <length> <options> <similarity>",
        "<rateStar> <gradeLvl> <sentiment> <length> <options> <similarity>",
        "<rateStar> <length> <gradeLvl> <sentiment> <options> <similarity>",
        "<rateStar> <gradeLvl> <length> <sentiment> <options> <similarity>",
        "<rateStar> <sentiment> <length> <gradeLvl> <options> <similarity>",
        "<rateStar> <length> <sentiment> <gradeLvl> <options> <similarity>",
        "<rateStar> <options> <sentiment> <gradeLvl> <length> <similarity>",
        "<rateStar> <sentiment> <options> <gradeLvl> <length> <similarity>",
        "<rateStar> <sentiment> <gradeLvl> <options> <length> <similarity>",
        "<rateStar> <gradeLvl> <sentiment> <options> <length> <similarity>",
        "<rateStar> <options> <gradeLvl> <sentiment> <length> <similarity>",
        "<rateStar> <gradeLvl> <options> <sentiment> <length> <similarity>",
        "<rateStar> <length> <options> <sentiment> <gradeLvl> <similarity>",
        "<rateStar> <options> <length> <sentiment> <gradeLvl> <similarity>",
        "<rateStar> <options> <sentiment> <length> <gradeLvl> <similarity>",
        "<rateStar> <sentiment> <options> <length> <gradeLvl> <similarity>",
        "<rateStar> <sentiment> <length> <options> <gradeLvl> <similarity>",
        "<rateStar> <length> <sentiment> <options> <gradeLvl> <similarity>",
        "<rateStar> <options> <length> <similarity> <gradeLvl> <sentiment>",
        "<rateStar> <length> <options> <similarity> <gradeLvl> <sentiment>",
        "<rateStar> <similarity> <options> <length> <gradeLvl> <sentiment>",
        "<rateStar> <options> <similarity> <length> <gradeLvl> <sentiment>",
        "<rateStar> <length> <similarity> <options> <gradeLvl> <sentiment>",
        "<rateStar> <similarity> <length> <options> <gradeLvl> <sentiment>",
        "<rateStar> <gradeLvl> <similarity> <length> <options> <sentiment>",
        "<rateStar> <similarity> <gradeLvl> <length> <options> <sentiment>",
        "<rateStar> <length> <similarity> <gradeLvl> <options> <sentiment>",
        "<rateStar> <similarity> <length> <gradeLvl> <options> <sentiment>",
        "<rateStar> <gradeLvl> <length> <similarity> <options> <sentiment>",
        "<rateStar> <length> <gradeLvl> <similarity> <options> <sentiment>",
        "<rateStar> <options> <gradeLvl> <similarity> <length> <sentiment>",
        "<rateStar> <gradeLvl> <options> <similarity> <length> <sentiment>",
        "<rateStar> <gradeLvl> <similarity> <options> <length> <sentiment>",
        "<rateStar> <similarity> <gradeLvl> <options> <length> <sentiment>",
        "<rateStar> <options> <similarity> <gradeLvl> <length> <sentiment>",
        "<rateStar> <similarity> <options> <gradeLvl> <length> <sentiment>",
        "<rateStar> <length> <options> <gradeLvl> <similarity> <sentiment>",
        "<rateStar> <options> <length> <gradeLvl> <similarity> <sentiment>",
        "<rateStar> <options> <gradeLvl> <length> <similarity> <sentiment>",
        "<rateStar> <gradeLvl> <options> <length> <similarity> <sentiment>",
        "<rateStar> <gradeLvl> <length> <options> <similarity> <sentiment>",
        "<rateStar> <length> <gradeLvl> <options> <similarity> <sentiment>"
    ]);
    rg.addRule("<rateStar>", [
        "<toSum>, <rate>. <sentence>",
        "<rate>. <sentence>"
    ]);
    rg.addRule("<rate>", [
        "I'll give <subject> a <rating> star",
        "<subject> gets a <rating> star",
        "<subject> gets a <rating> star from me",
        "<rating> star",
        "Maybe a <rating> star",
        "<rating> star? Not too sure how to rate things",
        "<rating> star...maybe...I don't know. Close enough."
    ]);
    rg.addRule("<subject>", [
        "<gameName>",
        "The game",
        "The story",
        "The playthrough",
        "The Twine game",
        "It",
        "This"
    ] );
    rg.addRule("<length>", [
        "<subject> was <timing>.",
        "<subject> was <timing> for my liking.",
        "It took me <minute> minute to complete <subject>, <timing>."]);
    rg.addRule("<options>", [
        "There was <opDes> options."]);
    rg.addRule("<sentiment>", [
        "I would prefer for <subject> to be a little more <sentDes>. "]);
    rg.addRule("<gradeLvl>", [
        "<subject> was <readability> to read."]);
    rg.addRule("<toSum>", [
        "Overall",
        "In general",
        "I guess",
        "All in all"]);
    rg.addRule("<sentence>", [
        "I liked <subject>.",
        "I disliked <subject>.",
        "<subject> was <fun>.",
        "<subject> was <boring>.",
        "<subject> got an <fun> plot.",
        "<subject> got an <boring> plot."]);
    rg.addRule("<fun>", [
        "fun",
        "interesting",
        "amusing",
        "enjoyable",
        "entertaining",
        "pleasant"]);
    rg.addRule("<boring>", [
        "boring",
        "dull",
        "monotonous",
        "lame",
        "uninteresting"]);
    rg.addRule("<short>", ["short", "brief", "short-lived", "compressed", "condensed"]);
    rg.addRule("<long>", ["lengthy", "prolonged", "stretched", "extensive"]);
}