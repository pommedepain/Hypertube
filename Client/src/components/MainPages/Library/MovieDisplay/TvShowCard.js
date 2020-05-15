import React, { useState, useEffect } from 'react'
import axios from 'axios'

import Commentary from "../Comments/Commentary"
import TorrentButton from './torrentButton'
import Comments from "./../../../../ressources/icon/Comments.png"
import CommentsFull from "./../../../../ressources/icon/CommentsFull.png"
import CustomPlayer from './CustomPlayer.js';

import useWindowSize from "./../../../../func/use-window-size";
import Axios from '../../../../../../api/node_modules/axios';

const TvShowCard = (props) => {

  /* Display states */
  const [Expand, setExpand] = useState(false);                     /* Handle the commentary display */
  const [mobileExpand, setMobileExpand] = useState(false);         /* Handle the commentary for mobile */
  const dimension = useWindowSize();                               /* Gets window dimensions */
  const [showPlayer, setShowPlayer] = useState(false);             /* handle the player display */
  const [addInfos, setAddInfos] = useState({});                    /* Gets additionnal infos */
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState({
    sIndex: 100,
    eIndex: 100,
    data: []
  });
  const [defaultLanguage, setDefaultLanguage] = useState(null);
  const [prevHash, setprevHash] = useState(null);

  /* Stream states */
  const [hash, setHash] = useState("")  /* <= Will not work for tvShow */
  const [streamStatus, setStreamStatus] = useState('sleep');      /* sleep or load or play */
  const [url, setUrl] = useState("");            /* <= Will not work for tvShow */
  const [subtitles, setSubtitles] = useState([]);
  const [checkStreamReady, setCheckStreamReady] = useState(false);

  useEffect(() => {
    axios.get(`${props.path}/infos/${props.movie.id}`)
      .then((res) => { if (res.data.success === true) { setAddInfos(res.data.payload); setSeasons(res.data.seasons) } })
      .catch(err => console.log(err))
  }, [props.movie.id, props.path])

  /* Good size for movie title */
  let size = "5.5em"
  if (props.movie.title.length > 14)
    size = "3.5em"
  else if (props.movie.title.length > 20)
    size = "2.5em"
  else if (props.movie.title.length > 25)
    size = "1em"

  const HandleExpand = () => { setExpand(prevState => (!prevState)) }             // Commentary for desktop
  const HandleMobileExpand = () => { setMobileExpand(prevState => (!prevState)) } // Commentary for Mobile

  const updateUserHistory = () => {
    const type = props.path.includes('Movie') ? 'Movie' : 'TVShow';
    const body = {
      username: localStorage.username,
      movieHistory: type === 'Movie' ? props.movie.id : "",
      tvShowHistory: type === 'TVShow' ? props.movie.id : "",
    }
    const token = JSON.parse(localStorage.JWT);

    axios.put(`/API/history/add/${type}`, body, { headers: { 'x-auth-token': token.token } })
      .then((res) => {
        if (res.data.success) console.log('SUCCESS');
        else console.log('ERROR');
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (checkStreamReady !== false) {
      console.log('checkStreamReady cleared change hash')
      clearInterval(checkStreamReady);
    }
  }, [hash])

  useEffect(() => {
    /* on ComponentDidMount(), get defaultLanguage of user for display of subtitles */
    const user = localStorage.getItem('username');
    const token = JSON.parse(localStorage.getItem('JWT'));
    Axios.get(`/API/users/one_user/${user}`, { headers: { "x-auth-token": token.token } })
      .then((res) => {
        console.log('default Language: ' + res.data.result.defaultLanguage);
        // defaultLanguage = res.data.result.defaultLanguage;
        res.data.succes ? setDefaultLanguage(res.data.result.defaultLanguage) : setDefaultLanguage('english');
      })
      .catch((err) => console.log(err));
    return (() => {
      if (checkStreamReady !== false) {
        console.log('checkStreamReady cleared close card')
        clearInterval(checkStreamReady);
        setCheckStreamReady(false);
      }
    })
  }, [])

  const addSubtitles = (hash) => {
    return new Promise((resolve, reject) => {
      const trackList = [];
      Axios.get(`/Video/subtitles/${hash}`)
        .then((result) => { console.log(result); return result.data })
        .then((subtitles) => {
          if (Array.isArray(subtitles)) {
            console.log('Adding subtitles');
            subtitles.forEach((element, i) => {
              const path = new URL(`http://localhost:3000/${element.path}`);
              const track = document.createElement("track");
              track.kind = "captions";
              track.label = capitalizeFirstLetter(element.language);
              track.language = element.language;
              track.src = path;
              track.id = i;
              track.mode = 'hidden';
              trackList.push(track);
            });
          } else console.log('No subtitles track');
        })
        .then(() => {
          resolve(trackList);
        })
        .catch((err) => { throw err });
    })
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const toggleShowPlayer = (e) => {
    e.preventDefault();
    if (showPlayer && streamStatus === 'play') document.getElementById('myVideo').pause();
    else if (showPlayer && streamStatus === 'load') document.getElementById('loader').style.display = 'none';
    else if (!showPlayer && streamStatus === 'load') document.getElementById('loader').style.display = 'inline-block';
    if (showPlayer === null) setShowPlayer(true);
    else setShowPlayer(prevState => !prevState);
  }

  useEffect(() => {
    console.log('useEffect');
    console.log(streamStatus);
    if (checkStreamReady !== null) {
      console.log('checkStreamReady cleared')
      clearInterval(checkStreamReady);
    }
    if (streamStatus === 'load') {
      console.log('load');
      Axios.get(`/Video/download/${hash}`)
        .then(() => {
          console.log('DOWNLOAD LAUNCHED');
          const checkReady = `/Video/check/${hash}`;
          const check = setInterval(() => {
            console.log(document.getElementById('isMounted'))
            if (document.getElementById('isMounted')) {
              Axios.get(checkReady)
                .then((response) => {
                  console.log('READY');
                  if (response.data.ready === true) {
                    addSubtitles(hash)
                      .then((result) => {
                        console.log(result);
                        setSubtitles(result)
                        updateUserHistory()
                        setStreamStatus('play');
                        setUrl(`/Video/stream/${hash}`);
                        clearInterval(check);
                        setCheckStreamReady(false)
                      })
                  } else {
                    console.log('stream is not ready');
                  }
                });
            } else if (streamStatus !== 'play') {
              console.log('NULL');
              clearInterval(check);
            }
          }, 10000);
          setCheckStreamReady(check);
        })
    }
  }, [streamStatus, hash]);

  useEffect(() => {
    console.log('url: ' + url);
  }, [url]);

  const handlePlayButton = () => {
    setStreamStatus('load');
    setShowPlayer(true);
    setprevHash(hash);
    console.log("coucou")
  }

  let actors = addInfos && addInfos.Actors ? addInfos.Actors.split(',').map((item, i) => {
    return <p style={{ fontSize: "1.5em", marginLeft: "10px", color: "white", fontWeight: "400", width: "70%", marginBottom: "0" }} key={i}>{item}</p>;
  }) : null;
  if (dimension.width <= 1000) // Mobile version
    return (
      <div>
        <div className="clickable_area" /* Handle display off */
          onClick={props.onClick}
          style={{ width: `${window.innerWidth + 1000}px`, height: `${window.innerHeight + 1000}px`, }}></div>
        {/*---- Card ----*/}
        <div className="Movie_card_mobile" style={{ marginLeft: Expand ? "-10%" : "10%", backgroundImage: `url(${props.movie.mediumCover})` }}>
          <div className="Movie_card_inside">
            <div className="SimpleRow" style={{ justifyContent: "space-between" }}>

              {/* Title */}
              <h3 style={{ width: "80%", overflow: "hidden", fontSize: "4em", fontWeight: "700", marginBottom: 0 }}>{props.movie.title}</h3>

              {/*Comments */}
              <img className="TopLogo" alt="" src={Expand ? CommentsFull : Comments} onClick={HandleMobileExpand}></img>
            </div>

            {/* Director */}
            <h4 style={{ marginTop: "-10px", fontSize: "2em", marginBottom: "30px", textShadow: "0px 0px 10px rgba(255, 255, 255, .2)" }}></h4>

            {/* Player */}
            <div style={{ width: "480px", height: "250px", backgroundColor: "black", marginLeft: "5px" }}>
              {/* <ReactPlayer
                onError={(e) => {
                  console.log('error' + e)
                  console.log(e);
                }}
                onProgress={(progress) => console.log(progress)}
                url={url}
                className='react-player'
                playing={true}
                width='533px'
                height='300px'
                controls={true}
                light={true}
              /> */}
            </div>

            {/* Description */}
            <p style={{ width: "90%", marginTop: "30px", marginLeft: "20px", textAlign: "justify", color: "lightgrey", textShadow: "0px 1px 10px black" }}>{addInfos.Plot}</p>

            {/* Year of Production */}
            <h4 style={{ fontSize: "3em", marginLeft: "20px", }}>{props.movie.year}</h4>

            {/* Duration */}
            <h4 style={{ fontSize: "2em", marginLeft: "20px", fontWeight: "500", marginTop: "-15px", marginBottom: "20px" }}><strong style={{ fontSize: "1.3em", fontWeight: "bold" }}>{props.movie.runtime}</strong> min</h4>

            {/* Rating */}
            <button onClick={() => console.log('mdr')}>react can play url</button>
            <h4 style={{ position: "fixed", right: "20px", bottom: "-10px", fontSize: "5em", marginTop: "-50px", color: "yellow" }}>{props.movie.rating}</h4>
            {mobileExpand ?
              <Commentary Expand={Expand} infos={props} isMobile={mobileExpand} /> : null
            }

          </div>
        </div>
      </div>
    )
  else
    return ( // Desktop Version 
      <div>
        <div className="clickable_area" /* Handle display off */
          onClick={props.onClick}></div>
        {/*---- Card ----*/}
        <div className="Movie_card" style={{ marginLeft: Expand ? "-10%" : "10%" }} id="isMounted" >
          <div className="Movie_card_inside">


            {/*--- Top elements ---*/}
            <div className="SimpleRow" style={{ justifyContent: "space-between" }}>

              {/* Title */}
              <h3 className="cardTitle" style={{ fontSize: size, height: "95px" }}>{props.movie.title}</h3>
              <img className="TopLogo" alt="" src={Expand ? CommentsFull : Comments} onClick={HandleExpand}></img>
            </div>


            {/* --- Player --- */}
            <div className="playerWrapper" style={{ height: showPlayer ? "300px" : "0px", }}>
              <div className="streamPlayer">
                <CustomPlayer
                  url={url}
                  streamStatus={streamStatus}
                  hash={hash}
                  trackList={subtitles}
                  defaultLanguage={defaultLanguage}
                />
              </div>
            </div>

            {/*--- Infos elements ---*/}
            <div className="SimpleRow" style={{ marginLeft: showPlayer ? "-80px" : "20px", transform: showPlayer ? "scale(.75)" : "scale(1)", transition: "all .4s ease-out" }}>

              {/* Miniature */}
              <div className="cardMiniat" style={{ backgroundImage: `url(${props.movie.images.poster})`, zIndex: "20" }} ></div>

              <div>
                {/* Director Name */}
                <h4 className="cardDirector" style={{ opacity: showPlayer ? "0" : "1", transition: ".2s ease-out" }}>{addInfos && addInfos.Director ? addInfos.Director : null}</h4>

                {/* Main Actors */}
                <div style={{ opacity: showPlayer ? "0" : "1", transition: ".2s ease-out" }}>{actors}</div>
              </div>
            </div>

            {/*--- Left Elements ---*/}
            <div className="cardLeft" style={{ top: showPlayer ? "calc(4em + 400px)" : "calc(4em + 55px)", }}>

              {/* Year of Production */}
              <h4 className="cardYear" style={{ opacity: showPlayer ? "0" : "1" }}>{props.movie.year}</h4>

              {/* Duration */}
              <h4 className="cardDuration" style={{ opacity: showPlayer ? "0" : "1" }}>
                <strong style={{ fontSize: "1.3em", fontWeight: "bold" }}>{props.movie.runtime}</strong> min
                </h4>

              {/* Streaming Button */}
              {showPlayer === true ?
                <div
                  className="reduceButton"
                  style={{ backgroundColor: "grey", opacity: ".8" }}
                  onClick={(e) => toggleShowPlayer(e)}>
                  <p className="streamButtonTitle" style={{ color: "white" }}>REDUCE</p>
                </div>
                : showPlayer === false && streamStatus !== 'sleep' ?
                  <div
                    className="reduceButton"
                    style={{ backgroundColor: "grey", opacity: ".8", bottom: '0' }}
                    onClick={(e) => toggleShowPlayer(e)}>
                    <p className="streamButtonTitle" style={{ color: "white" }}>EXPAND</p>
                  </div>
                  : null
              }
              <div className="streamButton" style={{ position: 'relative', bottom: showPlayer === false ? '-60px' : '0' }}>

                <div
                  className="LaunchButton"
                  style={{ backgroundColor: hash.length && prevHash !== hash ? "red" : "grey", transition: ".4s ease-out", cursor: hash.length && prevHash === hash ? "not-allowed" : "pointer" }}
                  onClick={prevHash !== hash && hash.length ? (e) => handlePlayButton(e) : null}>
                  <p className="streamButtonTitle" style={{ color: "white" }}>PLAY</p>
                </div>
                <div className="torrentWrapper">
                  {hash && episodes.data[episodes.eIndex] ?
                    <TorrentButton hash={hash} setHash={setHash} torrents={episodes.data[episodes.eIndex].episode.torrents} /> :
                    null
                  }

                </div>
              </div>

            </div>

            <div className="episodeChoice"
              style={{ transform: showPlayer ? "scale(.75)" : "scale(1)", top: showPlayer ? "410px" : "380px", left: showPlayer ? "160px" : "20px" }}>
              <div className="SimpleRow">
                <h3>Seasons</h3>
                <h3>Episodes</h3>
              </div>
              <hr />
              <div className="SimpleRow choiceData">
                <div style={{ width: "30%", height: "200px", overflowY: "scroll", fontSize: "1.6em" }}>
                  {seasons && seasons.length ?
                    seasons.map((el, index) => {
                      return (
                        <p
                          style={{
                            fontWeight: episodes.sIndex === index ? "bold" : "",
                            color: episodes.sIndex === index ? "white" : "rgba(255,255,255, .7)"
                          }}
                          key={index}
                          onClick={() => setEpisodes({ eIndex: 100, sIndex: index, data: el.episodes })}>
                          Season {index + 1}</p>
                      )
                    }) : null}
                </div>
                {/* <div style={{width: "70%", height: "200px", overflowY: "scroll", marginLeft: "8px", fontSize: "1.2em"}}>
                    {episodes.data.length && episodes.data[0] ?
                    episodes.data.map((el, index) => {
                      return (
                        <p 
                        style={{
                        fontWeight: index === episodes.eIndex ? "bold" : "",
                        color: episodes.eIndex === index ? "white" : "rgba(255,255,255, .7)"}}
                        key={index}
                        onClick={() => {setEpisodes({ ...episodes, eIndex:index }); setHash(el.episode.torrents[Object.keys(el.episode.torrents[0].url.match(/magnet:\?xt=urn:btih:([a-zA-Z0-9]*)/)[1])}}>
                        Episode {el.episodeNumber}: {el.episode.title}
                        </p>
                      )
                    }) : null}
                </div> */}
                <div style={{ width: "70%", height: "200px", overflowY: "scroll", marginLeft: "8px", fontSize: "1.2em" }}>
                  {episodes.data.length ?
                    episodes.data.map((el, index) => {
                      if (el !== null)
                        return (
                          <p
                            style={{
                              fontWeight: index === episodes.eIndex ? "bold" : "",
                              color: episodes.eIndex === index ? "white" : "rgba(255,255,255, .7)"
                            }}
                            key={index}
                            onClick={() => {
                              setEpisodes({ ...episodes, eIndex: index });
                              setHash(el.episode.torrents[0].url.match(/magnet:\?xt=urn:btih:([a-zA-Z0-9]*)/)[1]);
                            }}>
                            Episode {el.episodeNumber ? el.episodeNumber : null}: {el.episode.title}
                          </p>
                        )
                      else
                        return (null)
                    }) : episodes.sIndex === 100 ? <p>Choose a season</p> : <p>No episodes.</p>}
                </div>
              </div>

            </div>
            {/* Rating */}
            <h4 className="cardRating" style={{ opacity: showPlayer ? "0" : "1" }}>{props.movie.rating}</h4>
          </div>

          {/*--- Comments ---*/}
          <Commentary Expand={Expand} infos={props} isMobile={mobileExpand} />
        </div>
      </div>
    )
}

export default TvShowCard
