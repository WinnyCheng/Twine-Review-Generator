
function storyReadability() {

    const text = createGraph().getStory().replace(/[0-9]/g, '')
    const daleChallScore = readability.daleChallReadabilityScore(text)
    const overallReadability = readability.textStandard(text)
    let daleChallGrade = ""

    if (daleChallScore <= 4.9)
        daleChallGrade = "4th grade"
     else if (daleChallScore >= 5 && daleChallScore <= 5.5)
        daleChallGrade = "5th grade"
     else if (daleChallScore >= 5.6 && daleChallScore <= 5.9)
        daleChallGrade = "6th grade"
     else if (daleChallScore >= 6 && daleChallScore <= 6.5)
        daleChallGrade = "7th grade"
     else if (daleChallScore >= 6.6 && daleChallScore <= 6.9)
        daleChallGrade = "8th grade"
     else if (daleChallScore >= 7 && daleChallScore <= 7.5)
        daleChallGrade = "9th grade"
     else if (daleChallScore >= 7.6 && daleChallScore <= 7.9)
        daleChallGrade = "10th grade"
     else if (daleChallScore >= 8 && daleChallScore <= 8.5)
        daleChallGrade = "11th grade"
     else if (daleChallScore >= 8.6 && daleChallScore <= 8.9)
        daleChallGrade = "12th grade"
     else if (daleChallScore >= 9 && daleChallScore <= 9.9)
        daleChallGrade = "college"
     else grade = "post college"

    const storyReadability = [daleChallGrade, overallReadability, diffWords]
    console.log('difficult words : ', diffWords)

    return storyReadability

}