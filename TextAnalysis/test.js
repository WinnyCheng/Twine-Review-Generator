var g = createGraph();

document.getElementById("name").innerText = g.getName();

senEncoder(g);
function checkFlag(){
    var encoderStr = getEncoder();

    if(encoderStr.length === 0)
        setTimeout(checkFlag, 1000);
    else{
        console.log(encoderStr);
        var str = "Similarity:";
        for(let s of encoderStr){
            str += "\n" + s;
        }
        document.getElementById("sim").innerText = str;
    }
}

var senti = getSentiAna(g);
document.getElementById("senti").innerText = "Sentimental Analysis \nNegative: " +
    senti['negative']['score'] + "\nPositive: " + senti['positive']['score'] + "\nScore: " + senti['score'];

checkFlag();