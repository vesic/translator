const fs = require('fs');
const axios = require('axios');
// const async = require('async');
const chalk = require('chalk');

const fileName = 'en-10.json';
const en = JSON.parse(fs.readFileSync(fileName, 'utf8'));

let translatedWords = [],
  fromLang = 'en',
  toLang = 'de',
  key = 'trnsl.1.1.20161019T122138Z.d4647318a3c3e16b.83ecebb28cc8c700faa31b58f632b63304e2bf08';

function translateWord(word) {
  return axios.get('https://translate.yandex.net/api/v1.5/tr.json/translate?' +
    `key=${key}` +
    `&text=${word}` +
    `&lang=${fromLang}-${toLang}`)
}

// if output exists do not overwrite
if (fs.existsSync('translate.json')) {
  throw new Error(`${chalk.red.bgYellow('Translations exists')}`)
}

// dirty
for (let word of en) {
  translateWord(word)
    .then(res => {
      fs.appendFileSync('translate.json', `${word} => ${res.data.text[0]},\n`);
    })
}

// clean
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


