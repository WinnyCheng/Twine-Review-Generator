/**
 * Estimates the time duration of the gameplay
 * @param g - graph of twine game built from Graph.js
 * @param trials - number of playthroughs

 * @returns {number} average time of multiple playthroughs
 */
function gameplay(g, trials) {
    var sum = 0;

    for (var i = 0; i < trials; i++) {
        var storyObj = g.singlePath(); //random path from start to end of graph
        var fullStory = new RiString(storyObj['text']);
        var storyArray = fullStory.words(); //split text to array of individual words

        //filter out punctuations and special characters
        let w = 0;
        while (w < storyArray.length) {
            var word = storyArray[w];
            if (RiTa.isPunctuation(word))
                storyArray.splice(w, 1);
            else
                w++;
        }

        //based on how Medium estimate reading time: 265 Words per minute
        var readingTime = Math.round(storyArray.length / 265);

        //source: https://edulastic.com/blog/2016/12/22/the-right-number-of-test-questions/
        //30 seconds per true-false question
        //60 seconds per multiple choice questions
        sum += readingTime + storyObj['multiLinks'] + 0.5 * storyObj['twoLinks'];
    }

    return Math.round(sum / trials); //average estimated time
}

/**
 * Test gameplay function
 */
function test(){
    var g = createGraph();
    document.getElementById("title").innerText = g.getName();
    document.getElementById("time").innerText = "Estimated time of gameplay of: " +
        gameplay(g, 100) + " minutes";
}
