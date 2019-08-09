
/**
 * Estimates the readability of the text of the game
 * @param g - graph of twine game built from Graph.js

 * @returns {array} grade levels based on readability and a list of "hard" words
 */
function storyReadability(g) {

    //retrieve the story graph from Graph.js and remove all digits in text
    const text = g.getStory().replace(/[0-9]/g, '')
    //calculates the readability score of the game text using the Dale-Chall readability test
    const daleChallScore = readability.daleChallReadabilityScore(text)
    //calculates the readability consensus based on a number of different readability tests and metrics
    const overallReadability = readability.textStandard(text)
    //retrieve the list of difficult words from readability.js
    const difficultWords = diffWords
    let daleChallGrade = ""

    /*
        maps the raw score to a corresponding grade level accordingly
     */
    if (daleChallScore <= 4.9)
        daleChallGrade = "4th grade"
     else if (daleChallScore > 4.9 && daleChallScore <= 5.5)
        daleChallGrade = "5th grade"
     else if (daleChallScore > 5.5 && daleChallScore <= 5.9)
        daleChallGrade = "6th grade"
     else if (daleChallScore > 5.9 && daleChallScore <= 6.5)
        daleChallGrade = "7th grade"
     else if (daleChallScore > 6.5 && daleChallScore <= 6.9)
        daleChallGrade = "8th grade"
     else if (daleChallScore > 6.9 && daleChallScore <= 7.5)
        daleChallGrade = "9th grade"
     else if (daleChallScore > 7.5 && daleChallScore <= 7.9)
        daleChallGrade = "10th grade"
     else if (daleChallScore > 7.9 && daleChallScore <= 8.5)
        daleChallGrade = "11th grade"
     else if (daleChallScore > 8.5 && daleChallScore <= 8.9)
        daleChallGrade = "12th grade"
     else if (daleChallScore > 8.9 && daleChallScore <= 9.9)
        daleChallGrade = "college"
     else daleChallGrade = "post college"

    return [daleChallGrade, overallReadability, difficultWords]

}