// Mobile Menu Toggle
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

// Smooth Scroll
const pageLinks = document.querySelectorAll('a[href^="#"]');
pageLinks.forEach(anchor => {
    anchor.addEventListener('click', function (event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.getElementById('nav-menu').classList.remove('active');
    });
});

// Score calculator helpers
function updateTeamNames() {
    const teamAName = document.getElementById('teamAName').value.trim() || 'Team A';
    const teamBName = document.getElementById('teamBName').value.trim() || 'Team B';

    document.getElementById('scoreTeamAHeader').textContent = teamAName;
    document.getElementById('scoreTeamBHeader').textContent = teamBName;
    document.getElementById('summaryTeamA').textContent = teamAName;
    document.getElementById('summaryTeamB').textContent = teamBName;
    recalculateScores();
}

function createRoundRow(index) {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
        <span>${index}</span>
        <input type="number" id="teamA-${index}" min="0" placeholder="0">
        <input type="number" id="teamB-${index}" min="0" placeholder="0">
    `;

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', recalculateScores);
    });

    return row;
}

function initScoreCalculator(initialRounds = 8) {
    const scoreRowsContainer = document.getElementById('scoreRowsContainer');
    scoreRowsContainer.innerHTML = '';

    for (let i = 1; i <= initialRounds; i += 1) {
        scoreRowsContainer.appendChild(createRoundRow(i));
    }

    document.getElementById('teamAName').addEventListener('input', updateTeamNames);
    document.getElementById('teamBName').addEventListener('input', updateTeamNames);
    updateTeamNames();
}

function recalculateScores() {
    const teamAName = document.getElementById('teamAName').value.trim() || 'Team A';
    const teamBName = document.getElementById('teamBName').value.trim() || 'Team B';
    const scoreRowsContainer = document.getElementById('scoreRowsContainer');
    const roundRows = Array.from(scoreRowsContainer.children);

    let totalA = 0;
    let totalB = 0;

    roundRows.forEach((row, index) => {
        const roundIndex = index + 1;
        const aInput = document.getElementById(`teamA-${roundIndex}`);
        const bInput = document.getElementById(`teamB-${roundIndex}`);
        const aValue = Number(aInput?.value) || 0;
        const bValue = Number(bInput?.value) || 0;

        totalA += aValue;
        totalB += bValue;
    });

    const combined = totalA + totalB;
    document.getElementById('totalA').textContent = totalA;
    document.getElementById('totalB').textContent = totalB;
    document.getElementById('totalCombined').textContent = combined;

    const leaderText = document.getElementById('leaderText');
    if (combined === 0) {
        leaderText.textContent = 'No points entered yet.';
    } else if (totalA > totalB) {
        leaderText.textContent = `${teamAName} is leading with ${totalA} points.`;
    } else if (totalB > totalA) {
        leaderText.textContent = `${teamBName} is leading with ${totalB} points.`;
    } else {
        leaderText.textContent = `${teamAName} and ${teamBName} are tied.`;
    }

    const lastRow = roundRows[roundRows.length - 1];
    if (lastRow) {
        const lastA = lastRow.querySelector(`#teamA-${roundRows.length}`)?.value.trim();
        const lastB = lastRow.querySelector(`#teamB-${roundRows.length}`)?.value.trim();
        const shouldAddRow = lastRow && (lastA !== '' || lastB !== '');

        if (roundRows.length >= 8 && shouldAddRow) {
            addRound();
        }
    }
}

function addRound() {
    const scoreRowsContainer = document.getElementById('scoreRowsContainer');
    const nextIndex = scoreRowsContainer.children.length + 1;
    scoreRowsContainer.appendChild(createRoundRow(nextIndex));
    document.getElementById(`teamA-${nextIndex}`).focus();
}

function resetScore() {
    initScoreCalculator(8);
    document.getElementById('summaryText').textContent = 'Fill in the scores for each round. Totals update automatically.';
    document.getElementById('leaderText').textContent = 'No rounds entered yet.';
}

function calculate() {
    const team1 = Number(document.getElementById('team1').value) || 0;
    const team2 = Number(document.getElementById('team2').value) || 0;
    const total = team1 + team2;
    document.getElementById('result').textContent = 'کۆی گشتی: ' + total;
}

function getRoundAiMessage(roundNumber, team1Name, team2Name, score1, score2) {
    const messages = [
        (winner, loser, difference) => `${loser}، ئەمە یارییە یان کۆرسی فێربوونی دۆڕان؟ ${winner} بە ${difference} خاڵ پێشە، تۆش وەک وایفای لاوازیت.`,
        (winner, loser, difference) => `${loser}، خاڵەکانت چوونە بازاڕ و نەگەڕانەوە! ${winner} بە ${difference} خاڵ پێشە، بچۆ بە قەرز خاڵ بکڕە.`,
        (winner, loser, difference) => `${loser}، ئەم یارییەت وەک چای بێ شەکرە؛ هەیە بەڵام خۆش نییە. ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${loser}، GPS بۆ خاڵەکانت دابنێ، چونکە هیچ شوێنێکیان دیار نییە. ${winner} بە ${difference} خاڵ پێشەوەیە.`,
        (winner, loser, difference) => `${loser}، تۆ یاری دەکەیت یان تەنها کورسییەکەت گەرم دەکەیت؟ ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${loser}، خاڵەکانت وا کەمن بە زوومیش نابینرێن. ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${loser}، ئەگەر هەروا بەردەوام بیت، ${winner} بە چاوی داخراویش دەتباتەوە. جیاوازی ${difference} خاڵە.`,
        (winner, loser, difference) => `${loser}، خشتەکە شەرمەزارە لە جیات! ${winner} بە ${difference} خاڵ پێشە، تکایە خشتەکە ڕزگار بکە.`,
        (winner, loser, difference) => `${loser}، ئەم ئەدایەت وەک قاوەی ساردە؛ کەس داوای ناکات. ${winner} بە ${difference} خاڵ پێشەوەیە.`,
        (winner, loser, difference) => `${loser}، بەو شێوەیە تەنانەت خۆڕایی خاڵیش ڕەنگە کەمت بێت. ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${loser}، ئەمە کۆنکانە نەک خەوی نیوەڕۆ! چاوت بکەرەوە، ${winner} بە ${difference} خاڵ دوور دەکەوێتەوە.`,
        (winner, loser, difference) => `${loser}، AI دەڵێت: ئەم تیمە پێویستی بە چارژەر و پلانی فریاکەوتن هەیە. ${winner} بە ${difference} خاڵ پێشەوەیە.`,
        (winner, loser, difference) => `${loser}، خشتەکە هاوار دەکات: "کەسێک ئەم تیمە ڕزگار بکات!" ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${loser}، ئەگەر ئەمە ستراتیژییە، ستراتیژییەکە بۆ دۆڕان زۆر جوانە. ${winner} بە ${difference} خاڵ پێشەوەیە.`,
        (winner, loser, difference) => `${winner} وانە دەڵێتەوە، ${loser}یش هێشتا ناوی بابەتەکەی نەزانیوە. جیاوازی ${difference} خاڵە.`,
        (winner, loser, difference) => `${loser}، هێشتا کات هەیە، بەڵام پێویستت بە موعجیزەیەکی بچووک هەیە. ${winner} بە ${difference} خاڵ پێشە.`,
        (winner, loser, difference) => `${winner} ئارامە، ${loser} شڵەژاوە، AIیش لە کەنارەوە پێدەکەنێت. جیاوازی ${difference} خاڵە.`,
        (winner, loser, difference) => `${loser}، ئەم جیاوازییە وەک قەرزی دوکانە، هەموو خولەکێک زیاد دەبێت. ${winner} بە ${difference} خاڵ پێشەوەیە.`,
        (winner, loser, difference) => `${winner} کۆنتڕۆڵی گرتووە، ${loser}یش هێشتا دوگمەی دەستپێکردنی نەدۆزیوەتەوە. جیاوازی ${difference} خاڵە.`
    ];

    if (score1 === 0 && score2 === 0) {
        return `لە تەرەقەی ${roundNumber} هێشتا هیچ خاڵێک نییە.`;
    }

    if (score1 === score2) {
        return `لە تەرەقەی ${roundNumber} هەردوو تیمەکە یەکسانن. AI ناتوانێت گاڵتە بە دۆڕاو بکات، چونکە دۆڕاو نییە!`;
    }

    const winner = score1 > score2 ? team1Name : team2Name;
    const loser = score1 > score2 ? team2Name : team1Name;
    const difference = Math.abs(score1 - score2);

    return getFreshMessage('round', messages, winner, loser, difference);
}

function getStrongAiRoast(winner, loser, difference) {
    const roasts = [
        `${loser}، AI بە توندی پێت دەڵێت: ئەم ئاستە قبوڵ نییە، تەنانەت بۆ یارییەکی خۆشی! تۆ بە ${difference} خاڵ دواوەیت.`,
        `${loser}، ئەم دۆڕانە پێویستی بە کۆبوونەوەی خێزانی هەیە. تۆ بە ${difference} خاڵ دواوەیت، یاری بکە نەک سەیرکردن.`,
        `${loser}، ئەگەر ئەمە پلانتە، پلانت وەک ئینتەرنێتی دوای بارانە. جیاوازی دژی تۆ ${difference} خاڵە.`,
        `${loser}، خشتەکە خەریکە داوای گواستنەوە بکات لە شەرمدا. تۆ بە ${difference} خاڵ دواوەیت.`,
        `${loser}، AI داوای وەستانی خەو دەکات؛ تۆ لە یارییەکەیت یان لە حەوتەم خەون؟ ${difference} خاڵ دواوەیت.`,
        `${loser}، ئەمە وانەیەکی زیندوویە: "چۆن بە کەمترین خاڵ زۆرترین شەرم دروست بکەین". جیاوازی دژی تۆ ${difference} خاڵە.`,
        `${loser}، کەمێک هێور بیت؟ نە، کەمێک خاڵ بهێنە باشترە. تۆ بە ${difference} خاڵ دواوەیت.`,
        `${loser}، یارییەکە هەمووی ڕوونە، بەڵام تۆ هێشتا وێنەی پەڕەی یەکەم دەبینیت. ${difference} خاڵ دواوەیت.`,
        `${loser}، ئەگەر بەم شێوەیە بەردەوام بیت، AI دەبێت پێت بڵێت "هەوڵت دا، بەس نەبوو". جیاوازی ${difference} خاڵە.`,
        `${loser}، تۆ خەریکی دروستکردنی میمیت. جیاوازی دژی تۆ ${difference} خاڵە.`,
        `${loser}، ئەمە کاتی قسە نییە، کاتی ڕزگارکردنی ناوبانگە. تۆ بە ${difference} خاڵ دواوەیت.`,
        `${loser}، دۆخی تیمەکەت زۆر گەرمە، بەڵام وەک مۆبایلی هەڵسووتاو. جیاوازی دژی تۆ ${difference} خاڵە.`
    ];

    return getFreshMessage('roast', roasts);
}

function getGameEndedMessage(team1Name, team2Name, total1, total2) {
    const difference = Math.abs(total1 - total2);

    if (total1 > total2) {
        return getFreshMessage('final', [
            () => `یارییەکە لە تەرەقەی ٨ کۆتایی هات. ${team2Name} بە ${difference} خاڵ دۆڕا؛ AI دەڵێت ئەم دۆڕانە پێویستی بە ڕاهێنانی جدی هەیە.`,
            () => `کۆتایی! ${team2Name} بە ${difference} خاڵ دواوە مایەوە. ئەم جارە خشتەکە زۆر بەزەیی پێتدا هات.`,
            () => `AI بڕیاری دا: ${team2Name} لەم یارییەدا زۆر کەم هێنایەوە. جیاوازی دژی تۆ ${difference} خاڵە.`,
            () => `${team2Name} تا دوا تەرەقە هەوڵی دا، بەڵام جیاوازی ${difference} خاڵەکە زۆر قورس بوو.`
        ]);
    }

    if (total2 > total1) {
        return getFreshMessage('final', [
            () => `یارییەکە لە تەرەقەی ٨ کۆتایی هات. ${team1Name} بە ${difference} خاڵ دۆڕا؛ AI دەڵێت ئەم دۆڕانە پێویستی بە ڕاهێنانی جدی هەیە.`,
            () => `کۆتایی! ${team1Name} بە ${difference} خاڵ دواوە مایەوە. ئەم جارە خشتەکە زۆر بەزەیی پێتدا هات.`,
            () => `AI بڕیاری دا: ${team1Name} لەم یارییەدا زۆر کەم هێنایەوە. جیاوازی دژی تۆ ${difference} خاڵە.`,
            () => `${team1Name} تا دوا تەرەقە هەوڵی دا، بەڵام جیاوازی ${difference} خاڵەکە زۆر قورس بوو.`
        ]);
    }

    return getFreshMessage('final', [
        () => `یارییەکە لە تەرەقەی ٨ کۆتایی هات. هەردوو تیمەکە یەکسانن 🤝`,
        () => `کۆتایی بە برابری! هیچ تیمێک نەیتوانی دوور بکەوێتەوە.`,
        () => `AI دەڵێت ئەمە یارییەکی هاوسەنگ بوو. کۆتایی: برابری.`,
        () => `دوای ٨ تەرەقە، هەردوو تیمەکە بە یەک ئاست کۆتاییان پێهێنا.`
    ]);
}

function getFreshMessage(key, templates, ...args) {
    const previousIndex = Number(sessionStorage.getItem(`lastAiMessage-${key}`));
    let nextIndex = Math.floor(Math.random() * templates.length);

    if (templates.length > 1) {
        while (nextIndex === previousIndex) {
            nextIndex = Math.floor(Math.random() * templates.length);
        }
    }

    sessionStorage.setItem(`lastAiMessage-${key}`, String(nextIndex));

    const template = templates[nextIndex];
    return typeof template === 'function' ? template(...args) : template;
}

function calculateScores() {
    const team1Inputs = document.querySelectorAll('.t1');
    const team2Inputs = document.querySelectorAll('.t2');
    let total1 = 0;
    let total2 = 0;
    let latestRound = 0;
    let latestRoundScore1 = 0;
    let latestRoundScore2 = 0;
    const team1Name = document.getElementById('team1Name').value.trim() || 'تیمی یەکەم';
    const team2Name = document.getElementById('team2Name').value.trim() || 'تیمی دووەم';

    team1Inputs.forEach((input, index) => {
        const value = Number(input.value) || 0;
        total1 += Math.max(0, value); // Prevent negative totals
        if (input.value.trim() !== '' || team2Inputs[index]?.value.trim() !== '') {
            latestRound = index + 1;
            latestRoundScore1 = Math.max(0, value);
            latestRoundScore2 = Math.max(0, Number(team2Inputs[index]?.value) || 0);
        }
    });
    team2Inputs.forEach((input, index) => {
        const value = Number(input.value) || 0;
        total2 += Math.max(0, value); // Prevent negative totals
        if (input.value.trim() !== '' || team1Inputs[index]?.value.trim() !== '') {
            latestRound = index + 1;
            latestRoundScore1 = Math.max(0, Number(team1Inputs[index]?.value) || 0);
            latestRoundScore2 = Math.max(0, value);
        }
    });

    // Update display with animation
    const name1 = document.getElementById('name1');
    const name2 = document.getElementById('name2');
    const total1Elem = document.getElementById('total1');
    const total2Elem = document.getElementById('total2');

    if (name1) name1.innerText = team1Name;
    if (name2) name2.innerText = team2Name;
    if (total1Elem) {
        total1Elem.innerText = `کۆی ${team1Name}: ${total1}`;
        total1Elem.style.animation = 'none';
        setTimeout(() => {
            total1Elem.style.animation = 'pulse 0.3s ease';
        }, 10);
    }
    if (total2Elem) {
        total2Elem.innerText = `کۆی ${team2Name}: ${total2}`;
        total2Elem.style.animation = 'none';
        setTimeout(() => {
            total2Elem.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    // Calculate and display difference
    const difference = Math.abs(total1 - total2);
    const differenceElem = document.getElementById('difference');
    const aiOpinionElem = document.getElementById('aiOpinion');
    if (differenceElem) {
        if (total1 === total2) {
            differenceElem.innerText = `جیاوازی: 0 - ${team1Name} و ${team2Name} یەکسانن`;
        } else {
            const aheadTeam = total1 > total2 ? team1Name : team2Name;
            const behindTeam = total1 > total2 ? team2Name : team1Name;
            differenceElem.innerText = `${aheadTeam} بە ${difference} خاڵ پێشەوەیە، ${behindTeam} بە ${difference} خاڵ دواوەیە`;
        }
        differenceElem.style.animation = 'none';
        setTimeout(() => {
            differenceElem.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    if (aiOpinionElem) {
        if (total1 === 0 && total2 === 0) {
            aiOpinionElem.innerText = 'تێبینی زیرەک: خاڵەکان بنووسە بۆ ئەوەی AI بە توندی و گاڵتەی قورس لەگەڵ تیمی دۆڕاو قسە بکات.';
        } else if (latestRound >= 8) {
            aiOpinionElem.innerText = `بۆچوونی AI: ${getGameEndedMessage(team1Name, team2Name, total1, total2)}`;
        } else if (total1 < total2) {
            aiOpinionElem.innerText = `بۆچوونی AI: ${getStrongAiRoast(team2Name, team1Name, difference)}`;
        } else if (total2 < total1) {
            aiOpinionElem.innerText = `بۆچوونی AI: ${getStrongAiRoast(team1Name, team2Name, difference)}`;
        } else {
            aiOpinionElem.innerText = 'بۆچوونی AI: هەردوو تیمەکە یەکسانن، بۆیە هیچ تیمێکی دۆڕاو نییە بۆ تێبینی.';
        }

        aiOpinionElem.style.animation = 'none';
        setTimeout(() => {
            aiOpinionElem.style.animation = 'pulse 0.3s ease';
        }, 10);
    }

    // Determine leader
    const leaderMessage = document.getElementById('leaderMessage');
    if (leaderMessage) {
        if (total1 > total2) {
            leaderMessage.innerText = `${team1Name} رەهیبەر دەکەن 🏆`;
        } else if (total2 > total1) {
            leaderMessage.innerText = `${team2Name} رەهیبەر دەکەن 🏆`;
        } else if (total1 === total2 && total1 > 0) {
            leaderMessage.innerText = `برابریە! 🤝`;
        }
    }
}

function markOtherTeamWrong(input) {
    const row = input.closest('tr');
    input.classList.toggle('score-filled', input.value.trim() !== '');
    if (!row || input.value.trim() === '') {
        input.classList.remove('wrong-score');
        input.classList.remove('score-filled');
        input.readOnly = false;
        return;
    }

    const otherInput = input.classList.contains('t1') ? row.querySelector('.t2') : row.querySelector('.t1');
    input.classList.remove('wrong-score');
    input.readOnly = false;
    if (otherInput && otherInput.value.trim() === '') {
        otherInput.value = '0';
        otherInput.classList.add('wrong-score');
        otherInput.classList.remove('score-filled');
        otherInput.readOnly = true;
    }
}

// Add pulse animation
if (!document.querySelector('style[data-pulse]')) {
    const style = document.createElement('style');
    style.setAttribute('data-pulse', 'true');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
}

window.addEventListener('DOMContentLoaded', function () {
    initScoreCalculator();

    const matchInputs = document.querySelectorAll('.t1, .t2');
    matchInputs.forEach(input => {
        input.addEventListener('input', function () {
            markOtherTeamWrong(this);
            calculateScores();
        });
    });

    document.getElementById('team1Name').addEventListener('input', calculateScores);
    document.getElementById('team2Name').addEventListener('input', calculateScores);

    document.querySelectorAll('[data-default-name]').forEach(input => {
        input.addEventListener('focus', function () {
            if (this.value === this.dataset.defaultName) {
                this.value = '';
            }
        });

        input.addEventListener('blur', function () {
            if (this.value.trim() === '') {
                this.value = this.dataset.defaultName;
                calculateScores();
            }
        });
    });
});

// Header Scroll Effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 80) {
        header.style.background = 'rgba(44, 24, 16, 0.95)';
        header.style.backdropFilter = 'saturate(180%) blur(16px)';
    } else {
        header.style.background = 'rgba(44, 24, 16, 0.95)';
        header.style.backdropFilter = 'none';
    }
});
