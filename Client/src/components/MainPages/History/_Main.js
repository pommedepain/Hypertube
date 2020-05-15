import React, { useState, useEffect } from 'react'
import ScrollMenu from 'react-horizontal-scrolling-menu'
import axios from 'axios';

import LArrow from "./../../../ressources/icon/LArrow.png"
import RArrow from "./../../../ressources/icon/RArrow.png"

import './History.css'

import MovieCase from "./../Library/MovieDisplay/MovieCase"
import MovieCard from "./../Library/MovieDisplay/MovieCard"
import TvShowCard from "./../Library/MovieDisplay/TvShowCard"

const list = [
  { name: 'item1' },
  { name: 'item2' },
  { name: 'item3' },
  { name: 'item4' },
  { name: 'item5' },
  { name: 'item6' },
  { name: 'item7' },
  { name: 'item8' },
  { name: 'item9' }
];
 
const MenuItem = () => {
  return <div className="HBlock"></div>
}
 
export const Menu = (list) =>
  list.map(el => {
    const {name} = el
 
    return <MenuItem text={name} key={name} selected={selected} />
  })
 
 
const Arrow = (src) => { return ( <img className="HArrow" alt="" src={src}></img> )}
 
 
const ArrowLeft = Arrow(LArrow)
const ArrowRight = Arrow(RArrow)
 
const selected = 'item1'


const History = (props) => {
    const menu = Menu(list)
    const [data, setData] = useState([])
    const [card, setCard] = useState({
      show: false,
      infos: {},
    })
    const [categorie, setCategorie] = useState(0)
    const active = props.active
    const handleCard = (movieInfos) => {
      if(movieInfos === false) {
        setCard({show: false, infos: {}})
      } else {
        setCard( { show: true, infos: movieInfos } )
      }
    }

    const handleCategorie = (index) => {
      setCategorie(index);
    }

    useEffect(() => {
      let array = []
      let history= {}
      let reqString = categorie === 0 ? 
        `/api/MovieLibrary/history?IDs=`:
        `/api/TVShowLibrary/history?IDs=`
      const username = localStorage.username
      const token = JSON.parse(localStorage.JWT)

      axios.get(`/api/history/${username}`, { headers: { 'x-auth-token': token.token }} )
        .then((res) => history = res.data)
        .then(() => {
          array = categorie === 0 ? history.movies : history.tvShow
        })
        .then(() => {
          if(array && array.length) {
            array = array.sort((a, b) => new Date(b.date) - new Date(a.date))
            array = array.map(i => i.id)
            if( array.length > 10) array.length = 10
            axios.get(reqString + array)
              .then((res) => {
                if (res.data.success === true && res.data.payload.length)
                  setData(res.data.payload)
                else setData([])
              })
        } else setData([]) })
    }, [ categorie, active ])

    const lib = data.map((movie, key) =>
      <MovieCase 
        key={key}
        movie={movie}
        handleSection={props.onClick}
        history={true}
        getCard={handleCard}/>)
    return (
        <div className="Section">
            <div onClick={props.active ? null : () => props.onClick(4)}
                style={{
                    position: props.ScreenWidth > 600 ? "absolute" : "relative",
                    opacity: props.active ? "1" : ".4",
                    transition: "opacity .4s",
                    width: props.ScreenWidth > 600 ? "800px" : props.ScreenWidth,
                    left: props.ScreenWidth > 600 ? 1500 - props.ScreenWidth * 0.52 : null,
                    top: props.ScreenWidth > 600 ?  1250 - props.ScreenHeight * 0.55 : null,
                    marginTop: "-15em"}}>
                {card.show ? card.infos.trailer ? <MovieCard onClick={() => handleCard(false)  } movie={card.infos} path={'/API/MovieLibrary'}/> : <TvShowCard onClick={() => handleCard(false)  } movie={card.infos} path={'/API/MovieLibrary'}/> :  null}
                <div className="SimpleRow">
                  <h1 onClick={!props.Drag ? () => props.onClick(4) : null } style={{fontSize: "5.5em", marginTop: "-20px", marginLeft: "2%", marginBottom: 0}}>HISTORY</h1>
                  {props.active ?
                  <div style={{fontSize: "1.6em", marginLeft: "15px", marginTop: "-.4em"}}>
                    <p onClick={() => handleCategorie(0)}style={{marginBottom:"-.2em", fontWeight: categorie === 0? "bold" : null, color: categorie === 0 ? "white" : "grey"}}>Movies</p>
                    <p onClick={() => handleCategorie(1)} style={{fontWeight: categorie === 1 ? "bold" : null, color: categorie === 1 ? "white" : "grey"}}>Shows</p>
                  </div> : null}
                </div>
                <div style={{marginLeft: "-80px"}}>
                    <ScrollMenu
                        data={props.active ? lib : menu}
                        arrowLeft={ArrowLeft}
                        arrowRight={ArrowRight}
                        dragging={false}
                        selected={0}
                        onSelect={0}
                        scrollToSelected={false}
                        scrollBy={0}
                        translate={-1}
                        clickWhenDrag={false}
                        inertiaScrolling={false}
                        inertiaScrollingSlowdown={false}
                    />
                </div>
            </div>
        </div>
    )
  }

export default History
