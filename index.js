const fs = require('fs');
const axios = require('axios');
// const async = require('async');
const chalk = require('chalk');
const program = require('commander');

let inputFile = 'en-10.json',
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

const en = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

let fromLang = 'en',
  toLang = 'de',
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

// read the whole translations file in
// let trFunctions = [];

// for (let word of en) {
//   trFunctions.push((cb) => {
//     translateWord(word)
//       .then(res => cb(null, res.data.text[0]))
//       .catch(err => console.log('err', err))
//   })
// }

// async.series(trFunctions, function(err, res) {
//   fs.writeFileSync('translate.json', JSON.stringify(res));
//   console.log('res', res);
// })


