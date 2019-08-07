
function storyReadability(g) {

    const text = g.getStory().replace(/[0-9]/g, '');
    const daleChallScore = readability.daleChallReadabilityScore(text);
    const overallReadability = readability.textStandard(text);
    let daleChallGrade = "";

    if (daleChallScore <= 4.9)
        grade = "4th grade";
     else if (daleChallScore >= 5 && daleChallScore <= 5.5)
        grade = "5th grade";
     else if (daleChallScore >= 5.6 && daleChallScore <= 5.9)
        grade = "6th grade";
     else if (daleChallScore >= 6 && daleChallScore <= 6.5)
        grade = "7th grade";
     else if (daleChallScore >= 6.6 && daleChallScore <= 6.9)
        grade = "8th grade";
     else if (daleChallScore >= 7 && daleChallScore <= 7.5)
        grade = "9th grade";
     else if (daleChallScore >= 7.6 && daleChallScore <= 7.9)
        grade = "10th grade";
     else if (daleChallScore >= 8 && daleChallScore <= 8.5)
        grade = "11th grade";
     else if (daleChallScore >= 8.6 && daleChallScore <= 8.9)
        grade = "12th grade";
     else if (daleChallScore >= 9 && daleChallScore <= 9.9)
        grade = "college";
     else grade = "post college";

    return [daleChallGrade, overallReadability];
}