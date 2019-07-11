document.scripts[0].text;
var FleschKincaid = exports;

var text = g.getStory();
console.log(FleschKincaid.rate(text));
console.log(FleschKincaid.grade(text));