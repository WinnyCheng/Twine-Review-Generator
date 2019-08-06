
/**
 * Sentimental Analysis
 * @param g - graph
 * @returns {{score, negative, comparative, positive}|*}
 */
function getSentiAna(g){
    var sentiment = new Sentimood();
    return sentiment.analyze(g.singlePath()['text']);
}

var simStr = []; //similarity values
/**
 * Similarity between one passage to the next passage of the single game play
 * @param g graph
 * @returns {Promise<void>}
 */
const senEncoder = async (g) => {
    var path =  g.singlePath()['list'];
    const model = await use.load();
    const embeddings = await model.embed(path);

    for (let j = 0; j < path.length-1; j++) {
        const passage1 = embeddings.slice([j, 0], [1]); //current passage text
        const passage2 = embeddings.slice([j+1, 0], [1]); //next passage text
        let score = passage1.matMul(passage2, false, true).dataSync(); //compare texts

        score = Math.round(1000.0 * score[0]) / 1000.0; //round score to nearest thousandths
        simStr.push(score);
    }
};

/**
 * Returns similarity scores
 * @returns {Array} similarity scores
 */
function getEncoder(){
    return simStr;
}