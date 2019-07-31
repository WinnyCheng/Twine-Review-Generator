$.ajaxSetup({ async: false });

var g = createGraph();
var text = g.singlePath()['text'];
const sentences = g.getStoryArray();

// Sentimental Analysis
function sentiAnalysis() {
    var sentiment = new Sentimood();
    return sentiment.analyze(text);
}

// Toxicity
function toxicityModel() {
    const threshold = 0.7;
    var values = [];

    // Load the model. Users optionally pass in a threshold and an array of
    // labels to include.
    toxicity.load(threshold).then(model => {
        model.classify(sentences).then(predictions => {
            // `predictions` is an array of objects, one for each prediction head,
            // that contains the raw probabilities for each input along with the
            // final prediction in `match` (either `true` or `false`).
            // If neither prediction exceeds the threshold, `match` is `null`.

            for (let p of predictions) {
                console.log(p['label'] + ": " + p['results'][0]['match']);
                values.push(p['results'][0]['match']);
            }
        });
    });
    return values;
}

// Universal Sentence Encoder
const sentenceEncoder = async () => {
    const sentences = [
        'To Conclusion',
        'All in all',
        'What is this?',
        'Lan Zhan, deng deng wo!',
        'He was all I wanted.'
    ];
    const model = await use.load();
    const embeddings = await model.embed(sentences);
    var simStr = [];

    // commented out code for matrix visual
    // const matrixSize = 500;
    // const cellSize = matrixSize / sentences.length;
    // const canvas = document.querySelector('canvas');
    // canvas.width = matrixSize;
    // canvas.height = matrixSize;
    //
    // const ctx = canvas.getContext('2d');
    //
    // const xLabelsContainer = document.querySelector('.x-axis');
    // const yLabelsContainer = document.querySelector('.y-axis');
    //
    for (let i = 0; i < sentences.length; i++) {
        // commented out code for matrix visual
    //     const labelXDom = document.createElement('div');
    //     const labelYDom = document.createElement('div');
    //
    //     labelXDom.textContent = i + 1;
    //     labelYDom.textContent = i + 1;
    //     labelXDom.style.left = (i * cellSize + cellSize / 2) + 'px';
    //     labelYDom.style.top = (i * cellSize + cellSize / 2) + 'px';
    //
    //     xLabelsContainer.appendChild(labelXDom);
    //     yLabelsContainer.appendChild(labelYDom);

        for (let j = i+1; j < sentences.length; j++) {
            const sentenceI = embeddings.slice([i, 0], [1]);
            const sentenceJ = embeddings.slice([j, 0], [1]);
            let score =
                sentenceI.matMul(sentenceJ, false, true)
                    .dataSync();

            score = Math.round(1000.0*score[0])/10.0;
            var str = (i+1) + " " + (j+1) + " " + score;
            console.log(str);
            simStr.push(str);

            // commented out code for matrix visual
            // ctx.fillStyle = d3.interpolateBlues(score);
            // ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            // ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }
    console.log(simStr);
    return simStr;
};

// console.log(sentenceEncoder());
console.log(toxicityModel());