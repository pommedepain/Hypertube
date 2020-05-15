import React, { useState, useEffect } from 'react'
import Hls from 'hls.js'

const Player = (props) => {
  const hash = props.hash;
  const [downloaded, setDownloaded] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [url, setUrl] = useState(props.trailer);
  const [error, setError] = useState(false);

  var video = document.getElementById("video");
  var videoSrcHls =`/output.m3u8`;

    if(Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrcHls);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
    } else {
      setError = true;
    }
}

export default Player
