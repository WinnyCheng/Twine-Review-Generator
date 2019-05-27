
var url = "http://localhost:3000/links";

//Recursion - continuously getJSON till it changes
// once change - count turns and click
var turns = 0;
var numPlays = [];
function play(pre) {
    $.getJSON(url, function (data) {
        var links = data.links;
        var numLinks = data.links.length;

        //end of game
        if (numLinks === 0) {
            numPlays.push(turns);
            console.log(numPlays);
            turns = 0;
        }
        //same as previous, skip
        else if(links[0].text === pre){
            play(links[0].text);
        }
        //next stage of game, choose option, move on
        else {
            //generate random number with number of options
            var ranOp = Math.round(Math.random() * (numLinks - 1));
            //click random option
            $.get("http://localhost:3000/click/" + ranOp, function () {
                turns++;
                play(links[0].text);
            })
        }
    })
}

var numGames = 20;
var millsec = 3000;

//multiply play through with delay on a game play
function checkReset(){
    $.getJSON(url, function(data){
        //not finished resetting
        if(data.links.length === 0){
            checkReset();
        }
        //reset finished, play twine
        else{
            play("");
        }
    })
}

//initial play
play("");

//make sure game is rested before playing twine again
for(let i = 1; i < numGames; i++){
    setTimeout(function(){
        //reset twine game
        $.get("http://localhost:3000/reset", function(){
            checkReset();
        });
    }, millsec*i);
}

function checkReset2(){
    $.getJSON(url, function(data){
        //not finished resetting
        if(data.links.length === 0){
            checkReset2();
        }
        //reset finished, print sum average
        else{
            var sum = numPlays.reduce(getSum);
            var average = sum / numPlays.length;
            var max = Math.max(...numPlays);
            var min = Math.min(...numPlays);

            console.log(sum);
            console.log(average);
            console.log(max);
            console.log(min);

            document.getElementById("average").innerText = "Average: " + average;
            document.getElementById("max").innerText = "Max: " + max;
            document.getElementById("min").innerText = "Min: " + min;
        }
    })
}

//last reset
setTimeout(function(){
    $.get("http://localhost:3000/reset", function(){
        checkReset2();
    });
}, millsec*numGames);

function getSum(total, num){
    return total + num;
}