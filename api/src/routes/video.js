const debug = require('debug')('routes:Video');
const express = require('express');
const router = express.Router();
const downloadFactory = require('../models/Download');
const readStream = require('../models/ReadStream');
const wrapper = require('../middleware/wrapper');
const fs = require('fs');
const webvtt = require('node-webvtt');
const LanguageDetect = require('languagedetect');
const Movie = require('../models/Movie');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const Factory = new downloadFactory();

router.use('/download/:hash', wrapper(async (req, res) => {
  debug('Request on video download route for ' + req.params.hash);
  Factory.Download(req.params.hash)
    .then((result) => {
      res.status(200).send('downloading');
    });
}));

router.use('/check/:hash', (req, res) => {
  debug(req.query);
  if (req.query.seeking && req.query.rate) {
    const queryRate = parseFloat(req.query.rate) + 0.1;
    const possibleRate = Factory.engines[req.params.hash].lastPiece * Factory.engines[req.params.hash].torrent.pieceLength / Factory.engines[req.params.hash].film.length;
    // if (Factory.engines[req.params.hash].downloaded === true || queryRate < possibleRate) {
    //   console.log('check answered true');
    //   res.status(200).send({ ready: true });
    // } else {
    //   console.log('check answered false');
    //   res.status(200).send({ ready: false });
    // }
    res.status(200).send({ ready: false });
  } else {
    const ready = Factory.isReady(req.params.hash);
    debug('check result : ' + ready);
    if (ready === true) Movie.findOneAndUpdate({ 'hash': req.params.hash }, { 'date': new Date() }, (err, doc) => { if (err) throw err; console.log(doc); });
    res.status(200).send({ ready });
  }
});

router.use('/subtitles/:hash', (req, res) => {
  if (!Factory.engines[req.params.hash]) {
    return res.status(200).send('Can\'t find film');
  }
  console.log('subtitles please');
  const subtitles = [];
  const path = `${process.env.FILMPATH}/${Factory.engines[req.params.hash].torrent.name}`;
  fs.readdir(path, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach((file) => {
      console.log(file.split('.').pop());
      if (file.split('.').pop() === 'vtt') {
        const vttFilePath = path + '/' + file;
        debug('vtt path: ' + vttFilePath);
        const vtt = fs.readFileSync(vttFilePath, 'utf8');
        const parsed = webvtt.parse(vtt, { strict: false });
        try {
          let isAlreadyThere;
          if (parsed.cues.length > 100) {
            const langToTest = (parsed.cues[25]['text'] + ' ' + parsed.cues[150]['text'] + ' ' + parsed.cues[200]['text'] + ' ' + parsed.cues[250]['text'] + ' ' + parsed.cues[500]['text'] + ' ' + parsed.cues[550]['text'] + ' ' + parsed.cues[300]['text'] + ' ' + parsed.cues[400]['text']).replace('<i>', '').replace('</i>', '');
            const langToTest2 = (parsed.cues[20]['text'] + ' ' + parsed.cues[155]['text'] + ' ' + parsed.cues[205]['text'] + ' ' + parsed.cues[255]['text'] + ' ' + parsed.cues[505]['text'] + ' ' + parsed.cues[555]['text'] + ' ' + parsed.cues[305]['text'] + ' ' + parsed.cues[405]['text']).replace('<i>', '').replace('</i>', '');
            const langToTest3 = (parsed.cues[30]['text'] + ' ' + parsed.cues[160]['text'] + ' ' + parsed.cues[210]['text'] + ' ' + parsed.cues[260]['text'] + ' ' + parsed.cues[510]['text'] + ' ' + parsed.cues[560]['text'] + ' ' + parsed.cues[310]['text'] + ' ' + parsed.cues[410]['text']).replace('<i>', '').replace('</i>', '');
            const lngDetector = new LanguageDetect();
            const ret = lngDetector.detect(langToTest, 2);
            const ret2 = lngDetector.detect(langToTest2, 2);
            const ret3 = lngDetector.detect(langToTest3, 2);
            if (ret[0] !== undefined && ret2[0] !== undefined && ret3[0] !== undefined) {
              if (ret[0][0] === ret2[0][0] && ret2[0][0] === ret3[0][0]) {
                debug('DEFINITE LANGUAGE IS ' + ret[0][0]);
                isAlreadyThere = subtitles.some((e) => e.language === ret[0][0]);
                if (!isAlreadyThere) subtitles.push({ path: Factory.engines[req.params.hash].torrent.name + '/' + file, language: ret[0][0] });
              } else if (ret[0][0] === ret2[0][0] || ret[0][0] === ret3[0][0] || ret2[0][0] === ret3[0][0]) {
                if (ret[0][0] === ret2[0][0]) {
                  debug('2/3 TRIES SAID LANGUAGE IS ' + ret[0][0]);
                  isAlreadyThere = subtitles.some((e) => e.language === ret[0][0]);
                  if (!isAlreadyThere) subtitles.push({ path: Factory.engines[req.params.hash].torrent.name + '/' + file, language: ret[0][0] });
                } else if (ret[0][0] === ret3[0][0]) {
                  debug('2/3 TRIES SAID LANGUAGE IS ' + ret[0][0]);
                  isAlreadyThere = subtitles.some((e) => e.language === ret[0][0]);
                  if (!isAlreadyThere) subtitles.push({ path: Factory.engines[req.params.hash].torrent.name + '/' + file, language: ret[0][0] });
                } else if (ret2[0][0] === ret3[0][0]) {
                  debug('2/3 TRIES SAID LANGUAGE IS ' + ret2[0][0]);
                  isAlreadyThere = subtitles.some((e) => e.language === ret2[0][0]);
                  if (!isAlreadyThere) subtitles.push({ path: Factory.engines[req.params.hash].torrent.name + '/' + file, language: ret2[0][0] });
                }
              } else debug('IMPOSSIBLE TO DETECT LANGUAGE');
            } else debug('UNKNOWN LANGUAGE');
          } else debug('FALSE SUBTITLE TRACK DETECTED');
        }
        catch (err) {
          console.log(err);
        }
      }
    });
    console.log(subtitles);
    res.status(200).send(subtitles);
  });
});

router.use('/subtitle/:hash/:track', (req, res) => {
  if (!Factory.engines[req.params.hash]) {
    return res.status(200).send('Can\'t find film');
  }
  console.log('file sendion');
  const path = `${process.env.FILMPATH}/${Factory.engines[req.params.hash].torrent.name}/${eq.params.track}`;
  res.sendFile(path);
});

router.use('/stream/:hash', wrapper(async (req, res) => {
  console.log(req.params.hash);
  console.log(req.headers.range);
  if (!Factory.engines[req.params.hash]) {
    console.log('mdr')
    return res.status(200).send('Can\'t find film');
  } else {
    if (!Factory.engines[req.params.hash].filmPath) {
      console.log('looking for path')
      Factory.engines[req.params.hash].filmPath = await Factory.findFilmPath(Factory.engines[req.params.hash].folder, Factory.engines[req.params.hash].film.name)
    }
    console.log('ReadStream on ' + Factory.engines[req.params.hash].filmPath)
    Factory.readStream(req.params.hash, Factory.engines[req.params.hash].filmPath, req, res);
  }
  console.log('non encoding stream')

}));

module.exports = router;
