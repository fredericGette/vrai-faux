'use strict';

import $ from 'jquery'
const ProgressBar = require('progressbar.js');
const Fireworks = require('fireworks-canvas');

/**
 * Display the "question" view.
 * https://3dtransforms.desandro.com/perspective
 */ 
let questionView = () => {
    console.log("question view"+questionIdx);
    questionIdx++
    let main = $("[id='main']");
    main.empty();
    main.addClass('questionMainClass');
    main.removeClass('answerMainClass');
    main.removeClass('finalMainClass');
    main.css('background-image','url("'+questionIdx+'.png")');
    let row = $('<div></div>');
    row.addClass('rowClass');
    main.append(row);
    let questionDiv = $('<div id="question"></div>');
    questionDiv.addClass('questionClass');
    row.append(questionDiv);
    let countdownDiv = $('<div id="countdown"></div>');
    countdownDiv.addClass('countdownClass');
    countdownDiv.click(()=> {
        if (countdown.stopped) {
            countdown.stopped = false;
            let newDuration = TIME*1000*(1-countdown.value());
            countdown.animate(1.0, {duration: newDuration}, timeup);
            $('.progressbar-text').removeClass('countdownPaused');
        } else {
            countdown.stopped = true;
            countdown.stop();
            $('.progressbar-text').addClass('countdownPaused');
        }
    });
    row.append(countdownDiv);  
    let playersDiv = $('<div id="players"></div>');
    playersDiv.addClass('playersClass');

    main.append(playersDiv);
    
    questionDiv.text(questions[questionIdx].label);

    players.forEach((player, name)=> {
        if (!player.div) {
            player.div = $('<div id="'+name+'">'+name+'</div>');
            player.div.addClass('playerClass');    
        } else {
            player.div.removeClass('badAnswerPlayer');
            player.div.removeClass('fastAnswerPlayer');
        }
        playersDiv.append(player.div);
        player.div.removeClass('playerAnswered');
        player.answer=undefined;
        player.time=undefined;
    });

    countdown = createCountdown();
    countdown.animate(1.0, {}, timeup);  // Number from 0.0 to 1.0
    countdown.stopped = false;
}

/**
 * Display the "answer" view.
 */ 
let answerView = () => {
    let main = $("[id='main']");
    main.empty();
    main.addClass('answerMainClass');
    main.removeClass('questionMainClass');
    main.removeClass('finalMainClass');
    let questionDiv = $('<div id="question"></div>');
    questionDiv.addClass('questionClass');
    questionDiv.text(questions[questionIdx].label);
    main.append(questionDiv);

    let nextQuestionDiv = $('<div></div>');
    nextQuestionDiv.addClass('nextQuestionClass');
    main.append(nextQuestionDiv);

    let row = $('<div></div>');
    row.addClass('answerRowClass');
    main.append(row);

    let columnTrue = $('<div></div>');
    columnTrue.addClass('answerColumnClass');
    row.append(columnTrue);

    let headerTrue = $('<div></div>');
    headerTrue.addClass('answerHeader');
    headerTrue.text('VRAI');
    columnTrue.append(headerTrue);

    let trueSpacerDiv = $('<div></div>');
    trueSpacerDiv.addClass('answerPlayersSpacerClass');
    columnTrue.append(trueSpacerDiv);

    let trueDiv = $('<div id="true"></div>');
    trueDiv.addClass('answerPlayersClass');
    trueSpacerDiv.append(trueDiv);

    let columnSpacer = $('<div></div>');
    columnSpacer.addClass('spacerColumnClass');
    row.append(columnSpacer);

    let columnFalse = $('<div></div>');
    columnFalse.addClass('answerColumnClass');
    row.append(columnFalse);

    let headerFalse = $('<div></div>');
    headerFalse.addClass('answerHeader');
    headerFalse.text('FAUX');
    columnFalse.append(headerFalse);

    let falseSpacerDiv = $('<div></div>');
    falseSpacerDiv.addClass('answerPlayersSpacerClass');
    columnFalse.append(falseSpacerDiv);

    let falseDiv = $('<div id="false"></div>');
    falseDiv.addClass('answerPlayersClass');
    falseSpacerDiv.append(falseDiv);

    players.forEach((player, name)=> {
        if (player.answer == true) {
            trueDiv.append(player.div);
        } else if (player.answer == false) {
            falseDiv.append(player.div);
        }
    });

    let clicked1 = false;

    questionDiv.click(()=> {
        if (clicked1) return;
        clicked1 = true;

        displayAnswer(columnTrue,headerTrue,columnFalse,headerFalse,nextQuestionDiv);
    });
}

let displayAnswer = async (columnTrue,headerTrue,columnFalse,headerFalse,nextQuestionDiv) => {
    let sound = undefined;
    if (questions[questionIdx].answer == true) {
        sound = new Audio('true.wav');
    } else {
        sound = new Audio('false.wav');
    }
    await sound.play();

    if (questions[questionIdx].answer == true) {
        columnTrue.addClass('goodAnswerBackground');
        headerFalse.addClass('badAnswerHeader');
    } else {
        columnFalse.addClass('goodAnswerBackground');
        headerTrue.addClass('badAnswerHeader');
    }

    if (questionIdx > 0) {
        players.forEach((player, name)=> {
            if (player.answer != questions[questionIdx].answer) {
                player.div.addClass('badAnswerPlayer');
            } else {
                player.score++;
                if (player.time < 5) {
                    player.div.addClass('fastAnswerPlayer');
                    player.score++;
                }
            }
        });    
    }

    setTimeout(() => {

        if (questionIdx+1>=questions.length) {
            nextQuestionDiv.text('Classement final...');
        } else if (questionIdx == 0) {
            nextQuestionDiv.text('Première question...');
        } else {
            nextQuestionDiv.text('Question suivante: n°'+(questionIdx+1)+'...');
        }
        
        let clicked2 = false;

        nextQuestionDiv.click(()=> {
            if (clicked2) return;
            clicked2 = true;

            if (questionIdx+1>=questions.length) {
                finalView();
            } else {
                questionView();
            }
        });
    },2000);  
};

/**
 * Display the "final" view.
 */ 
let finalView = () => {
    let main = $("[id='main']");
    main.empty();
    main.removeClass('questionMainClass');
    main.removeClass('answerMainClass');
    main.addClass('finalMainClass');
    main.css('background-image','none');

    let subMain = $('<div></div>');
    subMain.addClass('subMainClass');
    main.append(subMain);

    let maxScore = 0;
    players.forEach((player, name)=> {
        maxScore = Math.max(maxScore, player.score);
        player.name = name;
    });

    let rank = 0;
    for (let i = maxScore; i >= 0; i--) {
        let playerFounds = [];
        players.forEach((player, name)=> {
            if (player.score == i) {
                playerFounds.push(player);
            }
        });

        if (playerFounds.length>0) {
            rank++;
            let rankDiv = $('<div></div>');
            rankDiv.addClass('finalRowClass');
            subMain.append(rankDiv);

            let headerRankDiv = $('<div></div>');
            headerRankDiv.addClass('headerRankClass');
            switch(rank) {
                case 1:
                    headerRankDiv.addClass('gold');
                    break;
                case 2:
                    headerRankDiv.addClass('silver');
                    break;
                case 3:
                    headerRankDiv.addClass('bronze');
                    break;
                default:
                    headerRankDiv.addClass('chocolate');
            }
            rankDiv.append(headerRankDiv);

            let rankSpan = $('<div></div>');
            rankSpan.addClass('rankPlayerClass');
            if (rank == 1) {
                rankSpan.text('1\u1d49\u02b3');
            } else {
                rankSpan.text(rank+'\u1d49');
            }
            headerRankDiv.append(rankSpan);

            let scoreSpan = $('<div></div>');
            scoreSpan.addClass('scorePlayerClass');
            scoreSpan.text(playerFounds[0].score);
            headerRankDiv.append(scoreSpan);

            let playersRankDiv = $('<div></div>');
            playersRankDiv.addClass('finalRowPlayersClass');
            rankDiv.append(playersRankDiv);


            for (let player of playerFounds) {
                player.div = $('<div></div>');
                player.div.addClass('finalPlayerClass');
                player.div.text(player.name);
                playersRankDiv.append(player.div);
            }

            if (playerFounds.length < 3) {
                for (let i=0; i<3-playerFounds.length; i++) {
                    let filler = $('<div></div>');
                    filler.addClass('finalPlayerClass');
                    playersRankDiv.append(filler);
                }
            }
        }
    }

    // see https://www.npmjs.com/package/fireworks-canvas
    const container = document.getElementById('main');
    const options = {
        maxRockets: 30,           // max # of rockets to spawn
        rocketSpawnInterval: 150, // millisends to check if new rockets should spawn
        numParticles: 100,        // number of particles to spawn when rocket explodes (+0-10)
        explosionMinHeight: 0.5,  // percentage. min height at which rockets can explode
        explosionMaxHeight: 1,    // percentage. max height before a particle is exploded
        explosionChance: 0.08     // chance in each tick the rocket will explode
    };
    const fireworks = new Fireworks(container, options);
    const stop = fireworks.start();
}

/**
 * Parse the scanned string.
 * @param {string} rawScan 
 */
let parseRawScan = (rawScan) => {
    let scan = {};
    let answer = rawScan.substring(0,1);
    scan.name = rawScan.substring(1);

    if (answer === '0') {
        scan.answer = false;
    } else {
        scan.answer = true;
    }

    return scan;
}

/**
 * Process the scanned response.
 * @param {Scan} scan 
 */
let processScan = (scan) => {
    let player = players.get(scan.name);
    player.div.addClass('playerAnswered');
    player.answer = scan.answer;
    player.time = TIME*countdown.value();
}

let timeup = () => {
    countdown.destroy();
    countdown = undefined;
    answerView();
}

let createCountdown = () => {
    // see https://progressbarjs.readthedocs.io/en/1.0.0/
    let bar = new ProgressBar.Circle('#countdown', {
        color: '#000',
        strokeWidth: 5,
        trailColor: '#fff',
        trailWidth: 4,
        duration: TIME*1000,
        text: {
          autoStyleContainer: false
        },
        from: { color: '#000', width: 5 },
        to: { color: '#000', width: 5 },
        // Set default step function for all animate calls
        step: function(state, circle) {
          var value = Math.floor(circle.value() * TIME);
          circle.setText(TIME-value);  
        },
        text: {
            // Initial value for text.
            value: TIME
        }
    });
    bar.text.style.fontFamily = 'Arial';
    bar.text.style.fontSize = '75px';
    bar.text.style.color = '#fff';
    return bar;      
}

///////////////////////////////////////////////////////////////////////////////////

let TIME=5;
let questions= [
    {label:"(1978 + 8791) / 11 = 979", answer:true},
    {label:"Emmanuel Macron est né en 1978.", answer:false},
    {label:"Il y a eu 3 papes différents en 1978.", answer:true},
    {label:"La CEE (Communauté Economique Européenne) comporte 12 pays membres en 1978.", answer:false},
    {label:"En Allemagne, la dernière Volkswagen Coccinelle est produite en 1978.", answer:true},
    {label:"Charlie Chaplin est décédé en 1978.", answer:false},
    {label:"La France est éliminée lors du 1er tour de la coupe du monde de football de 1978.", answer:true},
    {label:"En France, la dernière exécution à la guillotine a eu lieu en 1978.", answer:false},
    {label:"Pour la première fois en 1978, le tirage du Loto est diffusé en direct à la télé.", answer:true},
    {label:"Margaret Thatcher devient 1er ministre du Royaume-Uni en 1978.", answer:false},
    {label:"La première édition du jeu “Trivial Pursuit” date de 1978.", answer:false}
];
let questionIdx = -1;
let players = new Map([
    ['Alphonsine',{score:0}],
    ['Bernard',{score:0}],
    ['Cécile', {score:0}],
    ['Claire',{score:0}],
    ['Claude',{score:0}],
    ['Elise',{score:0}],
    ['François',{score:0}],
    ['Françoise',{score:0}],
    ['Marc',{score:0}],
    ['Marie-Claude',{score:0}],
    ['Martin',{score:0}],
    ['Milo',{score:0}],
    ['Steeve',{score:0}],
    ['Vanessa',{score:0}],
    ['Zélie',{score:0}]
]);
let countdown = undefined;


// Connect to the websocket of the server.
let socket = new WebSocket("ws://localhost:8080/socketserver");

// Message received from the server.
socket.onmessage = (event) => {
    let rawScan = event.data;
    
    let scan = parseRawScan(rawScan);
    if (countdown && countdown.value()<1.0) {
        processScan(scan);
        console.log('processed: '+rawScan);
    } else {
        console.log('not processed: '+rawScan);
    }
}

questionView();

