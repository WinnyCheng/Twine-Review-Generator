
$.ajaxSetup({ async: false });

var g = createGraph();
var path =  g.singlePath();
console.log(path);

// Sentimental Analysis
var sentiment = new Sentimood();
var analyze = sentiment.analyze(path['text']);

// Universal Sentence Encoder
var simStr = [];
const init = async () => {
    const model = await use.load();
    const embeddings = await model.embed(path['list']);

    for (let j = 0; j < path['list'].length-1; j++) {
        const passage1 = embeddings.slice([j, 0], [1]);
        const passage2 = embeddings.slice([j+1, 0], [1]);
        let score =
            passage1.matMul(passage2, false, true)
                .dataSync();

        score = Math.round(1000.0 * score[0]) / 1000.0;
        simStr.push(score);

    }
};

init();

function getSentiAna(){ return analyze; }
function getEncoder(){ return simStr; }