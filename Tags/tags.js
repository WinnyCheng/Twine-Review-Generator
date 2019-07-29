

// // Sentimental Analysis
var g = createGraph();
// var text = g.singlePath()['text'];
//
// sentiment = new Sentimood();
// var analyze = sentiment.analyze(text);
// console.log(analyze);
// console.log(text);

// Toxicity
// The minimum prediction confidence.
const threshold = 0.9;

// Load the model. Users optionally pass in a threshold and an array of
// labels to include.
toxicity.load(threshold).then(model => {
    const sentences = ["I will kill you."];

    model.classify(sentences).then(predictions => {
        // `predictions` is an array of objects, one for each prediction head,
        // that contains the raw probabilities for each input along with the
        // final prediction in `match` (either `true` or `false`).
        // If neither prediction exceeds the threshold, `match` is `null`.

        for(let p of predictions){
            console.log(p['label'] + ": " + p['results'][0]['match'])
        }
    });
});

// // Universal Sentence Encoder
// const sentences = [
//     'You are on the desert planet of Nemo. All around you is haphazard rock, the result of millions of years of asteroid impacts and seismic activity. By your aching feet, the remnants of your twelve-man squadron are strewn about in a gory mess. Your assault rifle has exactly five rounds left; there is more ammo in the supply pack strapped to your belt, but by the time you reloaded it you would already be dead.\\nThe insectoid aliens surrounding you creep ever closer. Despite being wary of your weapon, they are desperately hungry. Their mandibles snap at you, testing the waters. You yell at them to back off, waving your gun threateningly. One scythe-like appendage lashes out, an attack that would have taken your arm off had you not dodged it. Back against a sheer rock wall, there is nowhere to run. Your heart feels like it will pound straight out of your chest, and you tremble at the inevitability of becoming bug food.\\nA dark shape flashes past you in a blink-and-you’ll-miss-it moment. It could be another insectoid, as they move quickly, but the possibility of it being a bigger, more dangerous alien is very real. The thought makes you queasy.\\nOne of the monsters shrieks shrieks as it is shot down, a 0.50 caliber round exploding through its torso. This draws the attention of the other aliens, giving you the chance to follow suit and start blasting them down. It doesn’t take long before six bodies join your squadron in the dirt. Dread pools in your gut as you look left, trying to pinpoint the exact spot where the shots came from.\\nThe figure that rises from its hiding spot is wearing armor similar to yours, complete with a specialized breathing mask. Reloading their gun, they make their way over to you. You see no defining insignia on their suit.\\n\\n1. Wait until they get close, then draw your knife and attack.\\n2. “Mary, Mother of Jesus, am I glad to see a friendly face!”',
//     '“Which country sent you? Where is your ship?” the soldier asks. Their voice is distorted because of the mask; it is a little harder for you to understand them. You lean back onto the wall, taking a moment to rest and get your bearings. It is the first time you have been able to do this since the crash. “I’m from the American military. My ship’s a smoldering pile of junk a couple miles behind me.”\\nThey study you for a few moments, perhaps trying to decide if you are lying. With a half-nervous, half-hopeful smile, you brush off your insignia patch and show them. You are still tense as they nod, turning away and gesturing for you to follow.\\n\\n1. Follow them. It looks like your best chance of surviving right now. \\n2. Stay put. It seems way too lucky for you to have been rescued like you were.',
//     'Standing, you heft your gun and follow. They turn back to you and say, "This is the way to the wreckage, yeah? If we\'re lucky, there will be enough salvagable parts to help us limp over to a colonized planet. At that point we can contact our commanding officers for further instructions.\\"\\n\\"I think we\'ll just be lucky if we can get off this rock,\\" you respond.\\nThey shrug. \\"True.\\" Now you two are walking alongside, your unknown savior letting you guide them in the right direction.\\nSilence drags on for some time. A large part of you wants to keep conversation going, if only to keep you from freaking out. \\"So... what country are you from?\\"\\n\\"I\'m from America, same as you,\\" they reply curtly.\\nYou brighten up some. \\"Really? What part?\\"\\n\\"Rhode Island.\\" Their tone is very final. It\'s clear they do not want to be talking.\\nThis doesn\'t deter you much.\\n\\n1. How long have you been out here?\\n2. Besides, something has been nagging at your thoughts since encountering this strange soldier. \\"Uh, if you don\'t mind me asking, are you a guy or a girl?\\n',
//     'You can practically feel the soldier rolling their eyes at you. An exhasperated sigh escapes their lips."We are stranded in the middle of space, on a planet infested with things that would love to eat us, without a functioning ship or any way to contact aid, and this is what concerns you?\\" They shake their head. \\"Moron.\\"\\nThat kind of hurts. Your pride bruised, you retort, \\"Can\'t I be curious?\\"\\n\\"You can, but you should probably learn to prioritize better.\\"\\nThere are boulders blocking your path, from a recent rockfall that crushed one of your squadron. You can still see the blood stains in the dirt. The soldier scales this easily, poking their head over the edge to see if trouble waits on the other side. A few well-placed shots later, and the way is cleared. Together, you clamber down the pile and continue forward.\\nMiles pass by in a cautious haze, making you realize just how far the insectoids had managed to chase you. Finally, you can see the smoldering wreckage of your ship strewn about.\\n\\"Well,\\" the soldier says, \\"Looks like we might just have enough to salvage.\\"\\n\\n1. Rest next to the ship. All that adrenaline from earlier has long since faded, leaving you exhausted.\\n2. Look for a tool kit.\\n',
//     'It takes quite a bit of elbow grease, but between you and the soldier, the door is able to be pried open. Before you is the interior of your cruiser, dark and discombobulated. The actual box that the tools were stored in busted open when a beam collapsed on it. Equipment is scattered all throughout the cabin. After some rooting around, you finally manage to compile the basics: screwdriver, nuts and bolts, hammer, saw, and wrench. Outside, the soldier is assessing the damage to your ship.\\n\\n1. Start repair on the ship immediately. The sooner the better.\\n2. Go to the soldier.',
//     'First, you go for the radio. It got busted when your co-pilot smashed his face into it upon impact. If fortune favors you and a signal goes through, you may not even have to repair your cruiser, just wait for a rescue vessel to come in. Given just how little fortune has favored you so far, you don\'t bank on it.\\nAs a young cadet, one of the first things you learned was ship maintenence. This training enables you to perform a computer triage of sorts. With so little supplies at your disposal, it\'s best to only fix the bare necessities of what will get this ship up and running. Things like autopilot, cruise control, and motion detection can wait.\\nThe radio almost seems a little too easy to patch up. You twist severed wires of the same color back together and put electrical tape over the exposed parts, shocking yourself only once, when you plugged a wire in where it didn\'t belong. Flipping the power switch, you practically jump for joy when it lights up. Several other parts of the dashboard light up, including the diagnostics button. You press it, since it could prove vital in helping you determine how to keep things from exploding. A lot of the glass got smashed, meaning that little shards made their way into the controls. In the tool box, you find a small pair of tweezers. It\'ll have to do.\\nA feed of code is printed out. You have to clue how to read it.\\n\\n1. Tell the soldier the good news.\\n2. Continue working.',
//     '"Excellent!" The soldier accepts the stream of code from you, then adds, "Don\'t worry, I can read this. Let\'s head inside now; I can see insectoids in the distance. "That causes your heart to flutter. "Will they attack?""They can smell us, but I\'ve learned that they\'re fairly stupid things. They\'ll see this ship as us, and since it\'s big, they\'ll be hesitant to attack it,\\" they assure you.\\nYou lead them down to the hold, where most of your cargo has been tossed around. Near the front, you discover that a good chunk of your food rations are still wrapped and edible. Your stomach snarls in anticipation.\\nThis is the first time you are safely able to take off your mask. You chug an entire bottle of water before gnawing on a protein bar and half a bag of jerky. The soldier has removed their mask as well and is currently chowing down on a box of granola. It\'s hard to not stare at them, since it\'s still nigh impossible to determine if they\'re a guy or a girl.\\nShort, dark scraggles cover their head, and their upper lip has a dusting of fuzz that gets thicker near the corners of their mouth. They have a strong, rounded face, and a jawline that you\'ll admit is stunning.\\n\\"I never got to ask you,\\" you say, \\"but what\'s your name?\\"\\n\\"Eron. E-r-o-n.\\"\\nThat is no help at all. \\"I\'m Monty. Uh, M-o-n-t-y.\\"\\nThey extend their hand, and you shake it. \\"Nice to meet you.\\"\\n'
// ];

const sentences = g.getStoryArray();
// console.log(sentences);

const init = async () => {
    const model = await use.load();

    const embeddings = await model.embed(sentences);

    const matrixSize = 250;
    const cellSize = matrixSize / sentences.length;
    const canvas = document.querySelector('canvas');
    canvas.width = matrixSize;
    canvas.height = matrixSize;

    const ctx = canvas.getContext('2d');

    const xLabelsContainer = document.querySelector('.x-axis');
    const yLabelsContainer = document.querySelector('.y-axis');

    for (let i = 0; i < sentences.length; i++) {
        const labelXDom = document.createElement('div');
        const labelYDom = document.createElement('div');

        labelXDom.textContent = i + 1;
        labelYDom.textContent = i + 1;
        labelXDom.style.left = (i * cellSize + cellSize / 2) + 'px';
        labelYDom.style.top = (i * cellSize + cellSize / 2) + 'px';

        xLabelsContainer.appendChild(labelXDom);
        yLabelsContainer.appendChild(labelYDom);

        for (let j = i; j < sentences.length; j++) {
            const sentenceI = embeddings.slice([i, 0], [1]);
            const sentenceJ = embeddings.slice([j, 0], [1]);
            const sentenceITranspose = false;
            const sentenceJTransepose = true;
            const score =
                sentenceI.matMul(sentenceJ, sentenceITranspose, sentenceJTransepose)
                    .dataSync();

            ctx.fillStyle = d3.interpolateBlues(score);
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }
};

init();