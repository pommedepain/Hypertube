const torrentStream = require('torrent-stream');
const Movie = require('../models/Movie');
const srt2vtt = require('srt-to-vtt');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg')
const recursiveReaddir = require("recursive-readdir");
const debug = require('debug')('factory')
const throttle = require('throttle');

module.exports = class DownloadFactory {
  constructor() {
    this.engines = {}; /* hash : engine */
  }

  Download(hash) {
    return new Promise(async (resolve, reject) => {
      // If an engine is already downloading this torrent, we consider the engine as ready and resolve immediately
      if (this.engines[hash]) {
        resolve();
      } else {
        /*
        **  We need to look in the database to find out if something as already been downloaded for this hash.
        **  If something is already downloaded but not fully, we need to purge the files from the server
        */
        const currentFile = await this.findHashInDb(hash);
        if (currentFile && currentFile.downloaded === false) await this.purgeFiles(currentFile.folder);
        /*
        **  Here there is nothing left in the server for the given hash
        **  We build the magnet from the hash, and the engine from the magnet
        */
        const magnet = await this.createMagnet(hash);
        let film;
        const engine = torrentStream(magnet, { path: `${process.env.FILMPATH}/${hash}` });

        /*
        ** Once the engine is ready, we save the path and time in the databaseName
        ** Then we check the different files present in the torrent :
        ** For Srt files we immediately save it and convert it in vtt
        ** then we try to select the biggest file in the torrent which is the actual film and launch the download
        */
        engine.on('ready', async () => {
          engine.torrent.name = hash;
          engine.folder = `${process.env.FILMPATH}/${engine.torrent.name}`;
          await this.saveHash(hash, engine);
          console.log(engine.torrent.name)
          engine.files.forEach((file) => {
            const extension = file.name.split('.').pop();
            if (extension === 'srt') {
              console.log('Subtitles found: ' + file.name);
              file.createReadStream()
                .pipe(srt2vtt())
                .pipe(fs.createWriteStream(`${process.env.FILMPATH}/${engine.torrent.name}/${file.name.replace('.srt', '.vtt')}`));
            } else if (extension !== 'mp4' && extension !== 'mkv') {
              // Ignore non-movie files
            } else if (film && current.length < film.length) {
              // Already a bigger movie film
            } else {
              film = file;
            }
          });
          if (!film) {
            console.log('no valid movie file found for' + hash);
            engine.removeAllListeners();
            engine.destroy();
            reject(new Error('no valid movie file found.'));
          }
          /*
          **  The film file has been found so we setup some variable directly in the engine object
          **  We then register the engine in this.engines[hash] and launch the download, and configure its behaviors
          */
          engine.nbPiece = Math.floor((film.length / engine.torrent.pieceLength));
          engine.downloadedPieces = [];
          engine.film = film;
          this.engines[hash] = engine;
          film.select();
          this.setUpEngine(hash);
          resolve(film);
        });
      }
    });
  }

  setUpEngine(hash) {
    const engine = this.engines[hash];
    engine.on('download', async (pieceIndex) => {
      engine.downloadedPieces[pieceIndex] = true;
      this.updateLastPiece(hash, pieceIndex);
      const completion = Math.round((100 * engine.swarm.downloaded) / engine.film.length);
      if (pieceIndex % 10 === 0) {
        //console.log('torrentStream Notice: Engine');
        console.log('Condition ', engine.lastPiece * 25, ' > ', engine.nbPiece);
        console.log('Max rate is ' + ((engine.lastPiece * engine.torrent.pieceLength / engine.film.length) * 100 - 10 + '%'))
        console.log('Completion ', completion, ' %');
      }
      engine.ready = engine.lastPiece * 25 > engine.nbPiece ? true : false;
    });
    engine.on('idle', () => {
      engine.downloaded = true;
      console.log('torrentStream Notice: torrent', engine.folder, 'downloaded');
      console.log(hash)
      Movie.findOneAndUpdate({ hash }, { downloaded: true }, (err, doc) => {
        console.log(err, doc);
      });
    });
  }

  updateLastPiece(hash, pieceIndex) {
    if (!this.engines[hash]) {
      return null;
    } else {
      this.engines[hash].lastPiece = this.engines[hash].downloadedPieces.findIndex((element) => !element);
      this.engines[hash].lastPiece = this.engines[hash].lastPiece === -1 ? pieceIndex : this.engines[hash].lastPiece;
    }
  }

  findHashInDb(hash) {
    return new Promise((resolve, reject) => {
      Movie.findOne({ hash })
        .then((result) => {
          if (!result) resolve(false);
          else {
            fs.exists(result.folder, (exists) => {
              if (exists) resolve(result);
              else {
                console.log('path does not exists for hash' + hash + 'deleting from database');
                Movie.deleteOne({ hash }, (err) => {
                  if (err) reject(e);
                  else resolve(false);
                })
              }
            })

          }
        })
        .catch((e) => reject(e));
    });
  }

  findFilmPath(folder, filename) {
    return new Promise((resolve, reject) => {
      recursiveReaddir(folder, (err, files) => {
        if (err) reject(err);
        else {
          let result = false;
          files.forEach(filePath => {
            if (filename === filePath.split('/').pop()) {
              result = filePath;
            }
          });
          resolve(result);
        }
      })
    })
  }

  purgeFiles(path) {
    return new Promise((resolve, reject) => {
      recursiveReaddir(path, (err, files) => {
        if (err) reject(err);
        else {
          files.forEach(filePath => {
            fs.unlink(filePath, (err) => {
              if (err) reject(err);
            })
          });
          resolve()
        }
      })
    });
  }

  createMagnet(hash) {
    return new Promise((resolve, reject) => {
      const trackers = [
        'udp://open.demonii.com:1337',
        'udp://tracker.istole.it:80',
        'http://tracker.yify-torrents.com/announce',
        'udp://tracker.publicbt.com:80',
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.coppersurfer.tk:6969',
        'udp://exodus.desync.com:6969',
        'http://exodus.desync.com:6969/announce',
        'udp://tracker.openbittorrent.com:80/announce',
      ];
      resolve((`magnet:?xt=urn:btih:${hash}&tr=` + trackers.join('&tr=')));
    });
  }

  getEngine(hash) {
    if (!this.engines[hash]) return null;
    return this.engines[hash].engine;
  }


  saveHash(hash, engine) {
    return new Promise((resolve, reject) => {
      Movie.findOne({ hash })
        .then((result) => {
          if (!result) {
            const newMovie = new Movie({
              hash: hash,
              downloaded: false,
              folder: engine.folder,
            });
            newMovie.save()
              .then(() => {
                resolve();
              })
              .catch((e) => {
                reject(new Error(e.message));
              });
          } else {
            resolve();
          }
        });
    });
  }

  isReady(hash) {
    if (!this.engines[hash] || (!this.engines[hash].ready && !this.engines[hash].downloaded)) return false;
    else return this.engines[hash].ready === true || this.engines[hash].downloaded === true ? true : false;
  }

  readStream = (hash, path, req, res) => {
    console.log(path)
    if (fs.existsSync(path)) {
      debug('File Found');
      const stat = fs.statSync(decodeURIComponent(path));
      const fileSize = stat.size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        if (path.split('.').pop() === 'mkv') {
          const file = fs.createReadStream(path);
          console.log('mkv file for streaming')
          ffmpeg()
            .input(file)
            .outputOptions('-movflags frag_keyframe+empty_moov')
            .outputFormat('mp4')
            .on('start', () => {
              console.log('start')
            })
            .on('progress', (progress) => {
              console.log(`progress: ${progress.timemark}`)
            })
            .on('end', () => {
              console.log('Finished processing')
            })
            .on('error', (err) => {
              console.log(`ERROR: ${err}`)
            })
            .audioCodec('aac')
            .videoCodec('libx264')
            //.output(`${this.engines[hash].folder}/${this.engines[hash].film.name.replace('.mkv', '.mp4')}`)
            .pipe(res)
          res.on('close', () => {
            file.destroy()
          })
        } else {
          const file = fs.createReadStream(path, { start, end });
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(206, head);
          file.pipe(res);
        }

      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
      }
    } else {
      res.status(204).send();
    }
  };
}

