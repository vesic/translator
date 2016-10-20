const fs = require('fs');
const axios = require('axios');
const async = require('async');
const chalk = require('chalk');
const program = require('commander');
const _ = require('lodash');

let inputFile = 'en-10.txt',
    outputFile = 'translate.txt';

program
  .option('-i, --input-file <input>', 'Input file')
  .option('-o, --output-file <output>', 'Output file')
  .parse(process.argv);

if (program.inputFile) { 
  inputFile = program.inputFile.toString();
}

if (program.outputFile) { 
  outputFile = program.outputFile.toString();
}

// const en = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const en = fs.readFileSync(inputFile, 'utf-8').split('\n');

let fromLang = 'en',
  toLang = 'fin',
  key = 'trnsl.1.1.20161019T122138Z.d4647318a3c3e16b.83ecebb28cc8c700faa31b58f632b63304e2bf08';

function translateWord(word) {
  return axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate?' +
    `key=${key}` +
    `&text=${word}` +
    `&lang=${fromLang}-${toLang}`)
}

// if output exists do not overwrite
if (fs.existsSync(outputFile)) {
  console.log(`${chalk.bold.yellow.bgRed('Translations exists try -i <file name> flag')}`)
  return;
}

let translations = [];

/* v-01
// slow down api calls
for (let i = 0, len = en.length; i < len; i++) {
  let word = en[i];
  setTimeout(function() {
    translateWord(word)
      .then(res => {
        fs.appendFileSync(outputFile, `${word} => ${res.data.text[0]},\n`);
        console.log(`${chalk.black.bgWhite(i)} ${chalk.blue.bgGreen(word)} => ${chalk.bgBlue(res.data.text[0])}`)
      })
      .catch(err => console.log(err))
  }, 100 * i);
}
*/


// v-01: async
let trFunctions = [];

for (let word of en) {
  trFunctions.push((cb) => {
    translateWord(word)
      .then(res => { 
        cb(null, res.data.text[0]);
        console.log(`${chalk.blue.bgGreen(word)} => ${chalk.bgBlue(res.data.text[0])}`)
      })
      .catch(err => console.log('err', err))
  })
}

async.series(trFunctions, function(err, res) {
  // filter dups out
  res = _.uniq(res);
  let file = fs.createWriteStream(outputFile);
  file.on('error', function(err) { console.log(err); });
  res.forEach(function(word) { file.write(word + '\n'); });
  file.end();
  console.log(`${chalk.green('Success')}`);
})

/*
// filter content by char
// filterByChar(fileContent, 'a')
function filterByChar(content, char) {
    let filtered = content.filter(word => word[0] === char);
    let result = {};
    result[char] = filtered;
    return JSON.stringify(result);
}
*/