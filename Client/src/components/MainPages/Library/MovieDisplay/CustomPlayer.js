import React, { Component } from 'react';

import './customPlayer.css';
import Axios from 'axios';

import Play from './../../../../ressources/icon/customPlayer/Play.png';
import Pause from './../../../../ressources/icon/customPlayer/Pause.png';
import Subtitle from './../../../../ressources/icon/customPlayer/Subtitle.png';
import Volume from './../../../../ressources/icon/customPlayer/Volume.png';
import Mute from './../../../../ressources/icon/customPlayer/Mute.png';
import Expand from './../../../../ressources/icon/customPlayer/Expand.png';
import Reduce from './../../../../ressources/icon/customPlayer/Reduce.png';

class CustomPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSec: 0,
      addedSubtitles: false,
      inDB: false,
      idleTime: 0,
      trackList: {},
      error: false,
      currHash: false,
      currUrl: null,
    };
    this.myVideo = React.createRef();
    this.escFunction = this.escFunction.bind(this);
    this.toggleShowControls = this.toggleShowControls.bind(this);
    this.togglePlayOnSpace = this.togglePlayOnSpace.bind(this);
    this.clearControls = false;
    this.ErrorHandler = this.ErrorHandler.bind(this);
    this.preventSpamToggleTimePlaying = false;
  }

  componentDidMount() {
    this.myVideo.current.controls = false;
    document.addEventListener('fullscreenchange', this.escFunction, false);
    document.addEventListener('mozfullscreenchange', this.escFunction, false);
    document.addEventListener('MSFullscreenChange', this.escFunction, false);
    document.addEventListener('webkitfullscreenchange', this.escFunction, false);
    document.addEventListener('mousedown', this.toggleShowControls, false);
    document.addEventListener('mousemove', this.toggleShowControls, false);
    document.addEventListener('keypress', this.toggleShowControls, false);
    document.addEventListener('scroll', this.toggleShowControls, false);
    document.addEventListener('touchstart', this.toggleShowControls, false);
    document.addEventListener('keypress', function (e) {
      if (document.fullScreen === true || document.webkitIsFullScreen === true
        || document.mozFullScreen === true || document.msFullscreenElement === true) {
        this.togglePlayOnSpace(e);
      }
    }.bind(this), false);
    this.myVideo.current.addEventListener('error', this.ErrorHandler, true);
    let sources = this.myVideo.current.querySelectorAll('source');
    if (sources.length > 0) {
      let lastSource = sources[sources.length - 1];
      lastSource.addEventListener('error', this.ErrorHandler, false);
    }
  }

  componentDidUpdate = () => {
    if (Array.isArray(this.props.trackList) && this.props.trackList.length > 0 && this.state.addedSubtitles === false) {
      this.myVideo.current.crossOrigin = 'anonymous';
      console.log('updated: ' + this.state.addedSubtitles);
      this.props.trackList.forEach(element => this.myVideo.current.appendChild(element));
      for (let i = 0; i < this.myVideo.current.textTracks.length; i++) {
        if (this.myVideo.current.textTracks[i].label && this.props.defaultLanguage
          && this.myVideo.current.textTracks[i].label.toLowerCase() === this.props.defaultLanguage.toLowerCase()) {
          this.myVideo.current.textTracks[i].mode = 'showing';
          console.log('subtitles track detected for ' + this.props.defaultLanguage);
        } else this.myVideo.current.textTracks[i].mode = 'hidden';
      }
      this.toggleShowControls();
      const json = this.myVideo.current.textTracks;
      let arr = [];
      Object.keys(json).forEach(function (key) {
        arr.push(json[key]);
      });
      this.setState({ addedSubtitles: true, trackList: arr }, function () { console.log(this.state.trackList); });
    }
    if (this.props.hash !== '') {
      if (!this.state.currHash) this.setState({ currHash: this.props.hash }/*, function() { console.log(`1st value currHash: ${this.state.currHash}`); }*/);
      else if (this.props.hash !== this.state.currHash) this.setState({ error: false, currHash: this.props.hash }/*, function() { console.log(`new value currHash: ${this.state.currHash}`); }*/);
      // else if (this.state.currHash === this.props.hash) if (this.props.streamStatus === 'load') this.setState({ error: false });
    }
    if (this.props.streamStatus === 'load' && this.state.currentSec !== 0) this.setState({ currentSec: 0 });
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.escFunction, false);
    document.removeEventListener('mozfullscreenchange', this.escFunction, false);
    document.removeEventListener('MSFullscreenChange', this.escFunction, false);
    document.removeEventListener('webkitfullscreenchange', this.escFunction, false);
    document.removeEventListener('mousedown', this.toggleShowControls, false);
    document.removeEventListener('mousemove', this.toggleShowControls, false);
    document.removeEventListener('keypress', this.toggleShowControls, false);
    document.removeEventListener('scroll', this.toggleShowControls, false);
    document.removeEventListener('touchstart', this.toggleShowControls, false);
    document.removeEventListener('keypress', this.togglePlayOnSpace, false);
  }

  ErrorHandler = (e) => {
    console.log('ErrorHandler() triggered');
    e.preventDefault();
    let error = e;
    let errorDisplay;

    // Chrome v60
    if (e.path && e.path[0]) error = e.path[0].error;
    // Firefox v55
    if (e.originalTarget) error = error.originalTarget.error;

    if (error.code === 1) error.additionalMess = 'The fetching of the associated resource was aborted by the user\'s request.';
    else if (error.code === 2) {
      error.additionalMess = 'Some kind of network error occurred which prevented the media from being successfully fetched, despite having previously been available.';
      errorDisplay = 'Some kind of network error occured. Please fix it before trying to reload the media.';
    }
    else if (error.code === 3) {
      error.additionalMess = 'Despite having previously been determined to be usable, an error occurred while trying to decode the media resource, resulting in an error.';
      errorDisplay = 'An error occured while trying to decode the media resource. Please try again by reloading the webpage.';
    }
    else if (error.code === 4) {
      error.additionalMess = 'The associated resource or media provider object (such as a MediaStream) has been found to be unsuitable.';
      errorDisplay = 'This link appears to be dead...';
      /* If function is triggered because subtitles or other src is missing, it's not an error */
      if (this.props.streamStatus !== 'play') return;
    }

    console.log('err code: ' + error.code);
    console.log('Video error: ' + (error.message === '' ? error.additionalMess : error.message));
    if (errorDisplay !== '' && error.message === 'MEDIA_ELEMENT_ERROR: Format error') this.setState({ error: errorDisplay });
  }

  toggleShowControls = () => {
    document.body.style.cursor = 'default';
    if (this.props.streamStatus === 'play') {
      let controls = document.getElementById('controls');
      if (controls.style.display === 'none') {
        controls.style.display = 'flex';
      }
      if (this.clearControls !== false) clearTimeout(this.clearControls);
      this.clearControls = setTimeout(() => {
        console.log('HIDE!');
        controls.style.display = 'none';
        if (document.fullScreen === true
          || document.webkitIsFullScreen === true
          || document.mozFullScreen === true
          || document.msFullscreenElement === true) document.body.style.cursor = 'none';
        let subtitlesButton = document.getElementById('subtitles-background');
        if (subtitlesButton && subtitlesButton.style.display === 'inline') subtitlesButton.style.display = 'none';
        this.clearControls = false;
      }, 5000);
    }
  }

  escFunction = () => {
    if (document.fullScreen === false
      || document.webkitIsFullScreen === false
      || document.mozFullScreen === false
      || document.msFullscreenElement === false) {
      let fullscreen = document.getElementById('fullscreen');
      let controls = document.getElementById('controls');
      fullscreen.classList.remove('fa-compress');
      fullscreen.classList.add('fa-expand');
      controls.style.bottom = '';
      controls.style.width = '500px';
      document.getElementById('buffered').style.width = '500px';
      document.getElementById('progress').style.width = '500px';
      document.getElementById('progressBar').style.width = '500px';
      this.myVideo.current.style.width = '533px';
      this.myVideo.current.style.height = '300px';
      this.myVideo.current.style.transition = '1s opacity';
    }
  }

  togglePlayOnSpace = (e) => {
    if (this.props.streamStatus === 'play') {
      if (e.keyCode === 32 || e.code === 'Space') {
        console.log(e.keyCode + ' = ' + e.code);
        this.togglePlayPause(e);
      }
    }
  }

  togglePlayPause = (e) => {
    e.preventDefault();
    console.log('streamStatus: ' + this.props.streamStatus);
    console.log('currentTime: ' + this.myVideo.current.currentTime);
    if (this.props.streamStatus === 'play' && this.myVideo.current.currentTime !== 0) {
      let playpause = document.getElementById("playpause");
      if (this.myVideo.current.paused || this.myVideo.current.ended) {
        playpause.title = "pause";
        playpause.src= Pause;
        this.myVideo.current.play();
      }
      else {
        playpause.title = "play";
        playpause.src= Play;
        this.myVideo.current.pause();
      }
    }
  }

  setVolume = (e) => {
    e.preventDefault();
    var volume = document.getElementById("volume");
    this.myVideo.current.volume = volume.value;
  }

  toggleMute = (e) => {
    e.preventDefault();
    this.myVideo.current.muted = !this.myVideo.current.muted;
    let muteIcon = document.getElementById('mute-unmute');
    if (this.myVideo.current.muted === true) {
      muteIcon.src = Mute;
    } else if (this.myVideo.current.muted === false) {
      muteIcon.src = Volume;
    }
  }

  toggleFullScreen = (e) => {
    e.preventDefault();
    let fullscreen = document.getElementById('fullscreen');
    let controls = document.getElementById('controls');
    let container = document.getElementById('player-wrapper');

    /* Exit full screen */
    if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
      console.log('EXIT FULL SCREEN');
      fullscreen.src = Expand; 
      controls.style.bottom = '';
      controls.style.width = '500px';
      document.getElementById('buffered').style.width = '500px';
      document.getElementById('progress').style.width = '500px';
      document.getElementById('progressBar').style.width = '500px';
      this.myVideo.current.style.width = '533px';
      this.myVideo.current.style.height = '300px';
      this.myVideo.current.style.transition = '1s opacity';
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (this.myVideo.current.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (this.myVideo.current.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (this.myVideo.current.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      /* Go full screen */
    } else {
      console.log('FULL SCREEN');
      fullscreen.src = Reduce;
      controls.style.bottom = '30px';
      controls.style.width = (window.innerWidth - 100) + 'px';
      document.getElementById('buffered').style.width = (window.innerWidth - 100) + 'px';
      document.getElementById('progress').style.width = (window.innerWidth - 100) + 'px';
      document.getElementById('progressBar').style.width = (window.innerWidth - 100) + 'px';
      this.myVideo.current.style.width = '100%';
      this.myVideo.current.style.height = '100%';
      this.myVideo.current.style.transition = '1s opacity';
      if (this.myVideo.current.requestFullscreen) {
        container.requestFullscreen();
      } else if (this.myVideo.current.mozRequestFullScreen) { /* Firefox */
        container.mozRequestFullScreen();
      } else if (this.myVideo.current.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        container.webkitRequestFullscreen();
      } else if (this.myVideo.current.msRequestFullscreen) { /* IE/Edge */
        container.msRequestFullscreen();
      }
    }
  }

  toReadbleTime = (time) => {
    var sec_num = parseInt(time, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
  }

  showSubtitles = (e) => {
    e.preventDefault();
    let cc = document.getElementById('subtitles-background');
    cc.style.display = cc.style.display === 'inline' ? 'none' : 'inline';
  }

  toggleSubtitles = (e) => {
    e.preventDefault();
    console.log('toggleSubtitles() triggered');
    let id = parseInt(e.target.id, 10);
    for (let i = 0; i < this.myVideo.current.textTracks.length; i++) {
      const elem = this.myVideo.current.textTracks[i];
      if (id === i) {
        if (elem.mode === 'showing') {
          console.log('remove subs');
          elem.mode = 'hidden';
          e.target.classList.remove('selected');
          e.target.classList.add('not-selected');
        } else {
          console.log('add subs');
          elem.mode = 'showing';
          e.target.classList.remove('not-selected');
          e.target.classList.add('selected');
        }
      } else if (id !== i) {
        let otherTrack = document.getElementsByClassName('subtitle')[elem.id];
        if (otherTrack.classList[1] === 'selected') {
          console.log('REMOVING');
          otherTrack.classList.remove('selected');
          otherTrack.classList.add('not-selected');
        }
        elem.mode = 'hidden';
      }
    }
    console.log('TRACK SELECTED:');
    console.log(this.myVideo.current.textTracks[id]);
  }

  toggleTimePlaying = e => {
    e.preventDefault();
    console.log('toggleTimePlaying() tiggered');
    const progressBar = document.getElementById('progressBar');
    if (progressBar.disabled === undefined) progressBar.setAttribute('disabled', false);
    if (this.preventSpamToggleTimePlaying !== false) clearTimeout(this.preventSpamToggleTimePlaying);
    const event = e.nativeEvent;
    const target = this.myVideo.current;
    this.preventSpamToggleTimePlaying = setTimeout(() => {
      progressBar.disabled = false;
      progressBar.style.cursor = 'pointer';
    }, 1000);
    if (progressBar.disabled === false || progressBar.disabled === undefined) {
      let newTime = this.myVideo.current.duration * (event.offsetX / document.getElementById('progressBar').offsetWidth);
      console.log(`new time requested: ${newTime} e.target.curentime = ${target.currentTime}`);
      if (target.currentTime !== this.state.currentSec) {
        console.log('currentsec = ' + this.state.currentSec);
        console.log('currentTime = ' + target.currentTime + '/' + this.myVideo.current.duration);
        const checkReady = `/Video/check/${this.props.hash}?seeking=${newTime}&rate=${newTime / this.myVideo.current.duration}`;
        Axios.get(checkReady)
          .then((result) => {
            if (result.data.ready === false) {
              this.myVideo.current.currentTime = this.state.currentSec;
              this.myVideo.current.pause();
            }
          })
          .catch((e) => console.log(e))
      }
      /* Skip video to new time. */
      if (!isNaN(parseFloat(newTime))) {
        this.myVideo.current.currentTime = parseFloat(newTime);
        let playpause = document.getElementById("playpause");
        if (playpause) playpause.src = Play;
      }
      progressBar.disabled = true;
      progressBar.style.cursor = 'not-allowed';
    }
  }

  render() {
    let id = this.props.url.split('watch?v=');
    const myUrl = 'https://youtube.com/embed/' + id[1] + '?showinfo=0&enablejsapi=1&origin:/';

    return (
      <div className="player-wrapper" id='player-wrapper'>
        {this.props.streamStatus === 'sleep' ?
          <iframe id='player' src={myUrl} height='300px' width='533px' title="trailer"></iframe>
          : null
        }
        {this.props.streamStatus === 'load' ?
          <div className="lds-ring" id='loader'><div></div><div></div><div></div><div></div></div>
          : null
        }
        <video
          ref={this.myVideo}
          id="myVideo"
          src={this.props.url}
          type="video/mp4"
          autoPlay
          controls
          disablePictureInPicture
          height='300px'
          width='533px'
          controlsList='nodownload'
          onPlaying={() => {
            console.log('playing: video\'s ready to be launched after beign paused or interrupted for loading of datas');
          }}
          onPlay={() => {
            this.setState({ currentSec: this.myVideo.current.currentTime });
            console.log('play has been clicked');
            let playpause = document.getElementById("playpause");
            if (playpause) playpause.src = Pause;
          }}
          onSeeking={async (e) => {
            //await setTimeout(() => {}, 10000)
            //this.myRef.current.pause();
            //this.myVideo.current.textTracks[0].mode = 'showing'
            console.log(this.currentSec + ` current time ${e.target.currentTime}`);
          }}
          onSeeked={(sec) => {
            console.log('seeked: user has requested portion ' + sec.target.currentTime + ' of the video which is now ready');
          }}
          onPause={(e) => {
            console.log('paused');
            let playpause = document.getElementById("playpause");
            if (playpause) playpause.src = Play;
          }}
          // onCanPlay={() => {
          //   console.log('can play but everything\'s not loaded yet');
          // }}
          // onCanPlayThrough={() => {
          //   console.log('browser estimates it can play all the way through without stoping for content buffering');
          // }}
          onEmptied={() => {
            this.myVideo.current.currentTime = this.state.currentSec;
            // console.log('emptied: media previously downloaded, now invoking load()');
          }}
          onEnded={() => {
            console.log('end of media reached');
            this.myVideo.current.pause();
          }}
          // onError={(e) => {
          // console.log('ERROR');
          // console.log(e);
          // this.ErrorHandler(e);
          // }}
          onLoadedMetadata={() => console.log('metadata loaded')}
          onProgress={() => {
            this.setState({ currentSec: this.myVideo.current.currentTime });
            console.log('played: ' + this.myVideo.current.currentTime + '/' + this.myVideo.current.duration + ' sec');
            // console.log('seekable end: ');
            // console.log(myVideo.seekable.end(myVideo.seekable.length - 1));
            // console.log('played: ' + this.myVideo.current.currentTime + '/' + this.myVideo.current.duration + ' sec');
            if (this.myVideo.current.buffered.length && !this.state.inDB) {
              // console.log('LOADED:')
              for (let elem = 0; elem < this.myVideo.current.buffered.length; elem++) {
                // console.log('piste n°' + elem + ': ' + this.myVideo.current.buffered.start(elem) + '/' + this.myVideo.current.buffered.end(elem) + ' sec');
                if (this.myVideo.current.buffered.start(this.myVideo.current.buffered.length - 1 - elem) < this.myVideo.current.currentTime && document.getElementById("buffered-amount")) {
                  document.getElementById("buffered-amount").style.width = (this.myVideo.current.buffered.end(this.myVideo.current.buffered.length - 1 - elem) / this.myVideo.current.duration) * 100 + "%";
                  console.log(`currently buffered: ${(this.myVideo.current.buffered.end(this.myVideo.current.buffered.length - 1 - elem) / this.myVideo.current.duration) * 100} %`);
                  break;
                }
              }
            }
          }}
          onStalled={() => console.log('Stalled: trying to fetch media data but is unexpectedly not forthcoming')}
          // onSuspend={() => console.log('the loading of the datas has been suspended')}
          // onWaiting={() => {
          //   console.log('Waiting.... video has interrupted due to a temporary lack of datas');
          // }}
          onTimeUpdate={(e) => {
            // console.log('time update: ' + this.myVideo.current.currentTime);
            let duration = this.myVideo.current.duration;
            if (duration > 0 && this.myVideo.current.currentTime <= duration && document.getElementById('progress-amount')) {
              // console.log(`duration: ${duration}`);
              document.getElementById('progress-amount').style.width = ((this.myVideo.current.currentTime / duration) * 100) + "%";
              document.getElementById('timeplayed').innerHTML = this.toReadbleTime(this.myVideo.current.currentTime);
            }
          }}
        >
        </video>
        {this.state.error !== false ?
          <div className='errorDisplay'>
            <p>{this.state.error}</p>
          </div>
          : null
        }
        {this.props.streamStatus === 'play' ?
          <div id="controls">
            <div className="allControls">
              <div className="left-controls">
                <img className="streamingButton" id="playpause" alt="" src={Pause} onClick={e => this.togglePlayPause(e)}></img>
                <img className="streamingButton" id="mute-unmute" alt="" src={Volume} onClick={e => this.toggleMute(e)}></img>
                <input id="volume" min="0" max="1" step="0.1" type="range" onChange={e => this.setVolume(e)} />
                <p id="timeplayed">00:00:00</p>
              </div>
              <div className="right-controls">
                <img className="streamingButton" id="subs" alt="" src={Subtitle} onClick={e => this.showSubtitles(e)}></img>
                <div className='subtitles-background' id='subtitles-background'>
                  <h5 className='sub-title'>Subtitles</h5>
                  <ul id='subtitles-list'>
                    {this.state.trackList.length > 0 ?
                      this.state.trackList.map((elem, i) => {
                        if (elem.mode === 'hidden' || elem.mode === 'disabled') return <li id={i} className="subtitle not-selected" key={i} onClick={e => this.toggleSubtitles(e)}>{elem.label}</li>;
                        else if (elem.mode === 'showing') return <li id={i} className="subtitle selected" key={i} onClick={e => this.toggleSubtitles(e)}>{elem.label}<i className="fas fa-check" id="checkIcon"></i></li>;
                        else return null;
                      })
                      : <p className="noSub" key={0}>none available</p>
                    }
                  </ul>
                </div>
                <img className="streamingButton" alt="" id="fullscreen" src={Expand} onClick={e => this.toggleFullScreen(e)}></img>
              </div>
            </div>
            <div className="progressBar" id="progressBar" /*onClick={e => this.toggleTimePlaying(e)}*/>
              <div className="buffered" id="buffered" >
                <span id="buffered-amount"></span>
              </div>
              <div className="progress" id="progress" >
                <span id="progress-amount"></span>
              </div>
            </div>
          </div>
          : null
        }
      </div>
    )
  }
}

export default CustomPlayer;
