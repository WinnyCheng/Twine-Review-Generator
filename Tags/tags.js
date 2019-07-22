

// Sentimental Analysis
var g = createGraph();
var text = g.singlePath()['text'];

sentiment = new Sentimood();
var analyze = sentiment.analyze(text);
console.log(analyze);
console.log(text);

// var result = sentiment.analyze(fullStory);
// console.log(result);

// var Sentiment = require('sentiment');
// var sentiment = new Sentiment();
// var result = sentiment.analyze(fullStory);
// console.dir(result);    // Score: -2, Comparative: -0.666


// args = {
//   ignoreCase: false,
//   ignoreStopWords: true,
// };
//
// var low = RiTa.concordance(test,args); // List of Words
// var sortable = [];
// for (let word in low){
//     sortable.push([word, low[word]]);
// }
// sortable.sort(function(a, b) {
//     return b[1] - a[1];
// });
//
// console.log(sortable);