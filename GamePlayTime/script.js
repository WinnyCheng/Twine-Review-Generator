
var g = getGraph();

var trials = 100;
var sum = 0;

for(var i = 0; i < trials; i++){
    var storyObj = g.singlePath();
    var fullStory = new RiString(storyObj['text']);
    // console.log(storyObj);
    var storyArray = fullStory.words();
    // console.log(storyArray);

    let w = 0;
    while(w < storyArray.length){
        var word = storyArray[w];
        if(RiTa.isPunctuation(word))
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

    // console.log(i + " Estimated Time of Game Play: " + readingTime + " minutes");
}

var averageTime = Math.round(sum / trials);

console.log("Estimated Time of Game Play: " + averageTime + " minutes");




