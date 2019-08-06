
function vocabBot() {
    var text = g.getStory();
    text = text.replace(/[0-9]/g, '');
    var daleChall = readability.daleChallReadabilityScore(text);
    var grade = "";
    let levels = [];

    if (daleChall <= 4.9) {
        grade = "4th";
    } else if (daleChall >= 5 && daleChall <= 5.5) {
        grade = "5th";
    } else if (daleChall >= 5.6 && daleChall <= 5.9) {
        grade = "6th";
    } else if (daleChall >= 6 && daleChall <= 6.5) {
        grade = "7th";
    } else if (daleChall >= 6.6 && daleChall <= 6.9) {
        grade = "8th";
    } else if (daleChall >= 7 && daleChall <= 7.5) {
        grade = "9th";
    } else if (daleChall >= 7.6 && daleChall <= 7.9) {
        grade = "10th";
    } else if (daleChall >= 8 && daleChall <= 8.5) {
        grade = "11th";
    } else if (daleChall >= 8.6 && daleChall <= 8.9) {
        grade = "12th";
    } else if (daleChall >= 9 && daleChall <= 9.9) {
        grade = "college";
    } else grade = "post college";

    var variant = "grader.";
    if(grade === "college") {
        variant = "student.";
    }

    var output = "";
    if(grade !== "post college") {
        output = "This story contains vocabulary that can be understood by an average " + grade + " " + variant;
    } else {
        output = "This story contains complex vocabulary that even some college students might find challenging."
    }

    var std = readability.textStandard(text);
    console.log(std);
    console.log(output);
    console.log(daleChall);
    levels.push(grade);
    levels.push(std);

    //return output;
    return levels
}

vocabBot();

// var arr = [];
//
// let temp = RiTa.tokenize(text);
//
// for(let i = 0; i < temp.length; i++) {
//     if(arr.indexOf(temp[i]) === -1 && dict.indexOf(temp[i]) === -1) {
//         arr.push(temp[i]);
//     }
// }
//
// arr.splice(arr.indexOf('"'), 1);
// arr.splice(arr.indexOf('\''), 1);
// arr.splice(arr.indexOf('?'), 1);
// arr.splice(arr.indexOf(','), 1);
// arr.splice(arr.indexOf('.'), 1);
// arr.splice(arr.indexOf('!'), 1);
// arr.splice(arr.indexOf(':'), 1);
// arr.splice(arr.indexOf(';'), 1);
// arr.splice(arr.indexOf('-'), 1);
// arr.splice(arr.indexOf('_'), 1);
// arr.splice(arr.indexOf('__'), 1);
// arr.splice(arr.indexOf('--'), 1);
// arr.splice(arr.indexOf('“'), 1);
// arr.splice(arr.indexOf('”'), 1);
// arr.splice(arr.indexOf('@'), 1);
// arr.splice(arr.indexOf('#'), 1);
// arr.splice(arr.indexOf('$'), 1);
// arr.splice(arr.indexOf('%'), 1);
// arr.splice(arr.indexOf('^'), 1);
// arr.splice(arr.indexOf('&'), 1);
// arr.splice(arr.indexOf('*'), 1);
// arr.splice(arr.indexOf('('), 1);
// arr.splice(arr.indexOf(')'), 1);
// arr.splice(arr.indexOf('+'), 1);
// arr.splice(arr.indexOf('\\'), 1);
// arr.splice(arr.indexOf('/'), 1);
// arr.splice(arr.indexOf('='), 1);
// arr.splice(arr.indexOf('<'), 1);
// arr.splice(arr.indexOf('>'), 1);
// arr.splice(arr.indexOf('`'), 1);
// arr.splice(arr.indexOf('~'), 1);
// arr.splice(arr.indexOf('['), 1);
// arr.splice(arr.indexOf(']'), 1);
// arr.splice(arr.indexOf('{'), 1);
// arr.splice(arr.indexOf('}'), 1);
// arr.splice(arr.indexOf('|'), 1);
//
//
// for(let i = 0; i < arr.length; i++) {
//     var para = document.createElement("p");
//     if (i === arr.length - 1){
//         var node = document.createTextNode("\""+ arr[i] + "\" ");
//     } else {
//         var node = document.createTextNode("\""+ arr[i] + "\", ");
//     }
//     para.appendChild(node);
//     var element = document.getElementById("div1");
//     element.appendChild(para);
// }
