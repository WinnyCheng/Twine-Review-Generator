
var g = getGraph();

var fullStory = new RiString(g.singlePath());
var storyArray = fullStory.words();

console.log(storyArray);

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
console.log("Reading Time: " + readingTime + " minutes");

