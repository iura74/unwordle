const chars = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');

const bestWords = document.getElementById('best-words');
const testWord = document.getElementById('test-word');
const testResult = document.getElementById('test-result');
const testButton = document.getElementById('test');
const wordscount = document.getElementById('words-count');
const worldLenght = +prompt('длина слова?', 7) || 7;

let nouns;
let charsPriority = {};


const loadWorlds = async function(afterLoad) {
    const dict = await (await fetch('russian_nouns_with_definition.json')).json();
    nouns = [...Object.keys(dict)];
    afterLoad();
};


const nounsProc = function() {

    nouns = nouns.filter(x => x.length === worldLenght);

    for (let i = 0; i < nouns.length; i++) {
        nouns[i] = nouns[i].replace(/ё/gi, 'е');
    }

    chars.forEach(x => charsPriority[x] = nouns.filter(noun => noun.indexOf(x) > -1).length);

    nouns = nouns
        .map(x => ({ word: x, weight: [...(new Set(x))].reduce((sum, cur) => sum + charsPriority[cur], 0) }))
        .sort((x, y) => (y.weight - x.weight));

    updateBestWorlds();
};

const updateBestWorlds = function() {
    bestWords.innerHTML = nouns.slice(0, 9).map(x => `<li>${x.word}</li>`).join('');
    wordscount.textContent = `Подходит слов ${nouns.length}`;
    if (nouns.length) {
        testWord.value = nouns[0].word;
    }

}

testButton.addEventListener('click', () => {
    const word = testWord.value;
    let result = testResult.value;
    if ((word.length !== worldLenght) || (result.length !== worldLenght) || /$[+-?]+^/.test(result)) {
        return;
    }

    const resArr = [];
    for (let i = 0; i < worldLenght; i++) {
        resArr.push({ curRes: result[i], curChar: word[i] });
    }


    //если в слове повтор букв с разным результатом
    /*
    минимум - если ('-' && ('+' || '?')) : заменить '-' => '?'
    максимум - посчитать ограничение на количество вхождений:
        если ('-' && ('+' || '?')) : число вхождений === числу '+' и '?'
        если (!'-' && '?') : число вхождений >= числу '+' и '?'
     */
    for (let i = 0; i < resArr.length; i++) {
        if ((resArr[i].curRes === '-') &&
            resArr.filter(x => (x.curChar === resArr[i].curChar) && (x.curRes !== '-')).length) {
            resArr[i].curRes = '?';
        }
    }

    resArr.forEach(({ curRes, curChar }, i) => {
        switch (curRes) {
            case '-':
                nouns = nouns.filter(x => x.word.indexOf(curChar) === -1);
                break;
            case '?':
                nouns = nouns.filter(x => x.word.indexOf(curChar) > -1 && x.word[i] !== curChar);
                break;
            case '+':
                nouns = nouns.filter(x => x.word[i] === curChar);
                break;
            default:
                break;
        }
    });
    updateBestWorlds();
});

bestWords.addEventListener('click', ({ target }) => {
    console.log(target)
    if (target.tagName === 'LI') {
        testWord.value = target.textContent;
    }
});



loadWorlds(nounsProc);