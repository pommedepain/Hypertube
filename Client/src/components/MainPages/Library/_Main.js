import React, { useState, useEffect } from "react"
import axios from 'axios';
import {animateScroll} from 'react-scroll';
import _ from 'lodash';

import './library.css'

import Filter from "./Filter/Filter"
import LGrid from "./MovieDisplay/Grid"
import getTotal from './getTotal';


import SExpand from "./../../../ressources/icon/ScreenExpand.png"
import SCompress from "./../../../ressources/icon/ScreenCompress.png"
import Larrow from "./../../../ressources/icon/LArrow.png"
import Rarrow from "./../../../ressources/icon/RArrow.png"
import EFilter from "./../../../ressources/icon/FilterEmpty.png"
import RFilter from "./../../../ressources/icon/FilterRed.png"
import Loupe from "./../../../ressources/icon/Loupe.png"
import ToggleLoupe from "./../../../ressources/icon/ToggleLoupe.png"

const paths = {
    movie: '/API/MovieLibrary',
    show: '/API/TVShowLibrary',
  }

const basicFilter = {
    selectedOption: null,
    yearInterval: [1903, 2019],
    ratingsInterval: [0, 10],
}

const Library = (props) => {
    const [Expand, setExpand] = useState(false)             /* Control the width of the component */
    const [Page, setPage] = useState(1)                     /* to asyncronly charge the wanted page of the library */ 
    const [type, setType] = useState('movie')               /* Switch to gallery or show library */
    const [filterState, setFilterState] = useState(0)       /* Handle the display of Filter menu */
    const [totals, setTotals] = useState({})                /* Store the total of film and show */
    const path = paths[type]                                /* Select the proper URL to request the db */
    const [ movies, setMovies ] = useState([]);             /* Movie Library Row from server */
    const [ searchFilters, setSearchFilters ] = useState({  /* Store Filter infos */
      query: '',
      selectedOption: null,
      yearInterval: [1903, 2019],
      ratingsInterval: [0, 10],
    });

    let PageList = Array.from(Array(movies.totalPages === 1 ? 2 : movies.totalPages).keys()).map((i) => { /* Create a Page list with the total number of page in the library */
        if(i !== 0 && i < Page + 5 && i > Page - 5) 
            return(
                <p key={i} style={{padding: "0px 5px",fontSize: Page === i ? "2em" : "1.5em", color: Page === i ? "white" : "grey", fontWeight: Page === i ? "bold" : null, marginTop: Page === i ? null  : "7px", transition: ".2s ease-out"}} 
                    onClick={Page !== i ? () => { setPage(i); handlePage() } : null }
                >{i}</p>
            )
        else
            return null
    }) 
    
    /* Handle various state + good UI behaviors */
    const HandleExpand = () => { setExpand(prevState => (!prevState) )} 

    const handlePage = () =>{
        animateScroll.scrollToTop({
            containerId: "FullLib",
            duration: 400
        })
    }
    const handleTitle = () => {
        document.getElementById('Library').style.transition = ".6s ease-out"
        props.onClick(2);
        setExpand(true);
        setTimeout(() => {
            document.getElementById('Library').style.transition = ".4s ease-out"
        }, 900);
    }

    const handleFilterState = (full) => {
        if(full === true)
            setFilterState(prevState => prevState === 2 ? 0 : 2)
        else
            setFilterState(prevState => prevState < 2 ? prevState + 1 : 0)
    }

    const handleType = (e) => { setType(e); setPage(1) } 

    const handleFiltersChange = newFilters => {
        setSearchFilters({...newFilters});
        setPage(1)
    }

    /* Get the totals infos at launch */
    useEffect(() => {
        getTotal().then((totals) => {
            setTotals(totals)
          })
    },[])

    /* Create the good request with filters and search 
        and get the wanted selection from db */
    useEffect(() => {
        const { query, ratingsInterval, selectedOption, yearInterval } = searchFilters;
        const req = [
          { query: query.length >= 3 ? query : null },
          { yMin: yearInterval[0] },
          { yMax: yearInterval[1] },
          { rMin: ratingsInterval[0] },
          { rMax: ratingsInterval[1] },
          { genres: selectedOption ? selectedOption : null },
        ];
        const terms = req.map((queryTerm) => {
          const entry =  Object.entries(queryTerm)
          if (entry[0][1] !== undefined && entry[0][1] !== null  ) return `${entry[0][0]}=${entry[0][1]}`
          return null;
        })
        const tmp = _.without(terms, null)
        let string = `${path}/search/page=${Page}?`;
        tmp.forEach((term, i) => {
         if (term && i === 0) { string = string.concat(`${term}`) }
         else if (term) { string = string.concat(`&${term}`) } 
        })
    
        axios.get(string, null)
          .then((res) => { if (res.data.success === true) { setMovies(res.data.payload) } })
          .catch(err => console.log(err))
      },[searchFilters, Page, path])

    let filterSort = { ...searchFilters};
    delete filterSort.query;

    return (
        <div className="Section">
            <div className="Library"
                id="Library"
                onClick= { !props.active && !props.Drag ? () => props.onClick(2) : null} 
                style={{
                    width: Expand ? "120vw" : props.ScreenWidth > 600 ?  "60vw" : props.ScreenWidth * .95,
                    opacity: props.active ? "1" : ".2",
                    marginTop: props.ScreenWidth > 600 ? null : "200px",
                    left: props.ScreenWidth > 600 ?  1500 - props.ScreenWidth * 0.5 : null,
                    top: props.ScreenWidth > 600 ? 1250 + props.ScreenHeight * 0.2 : null,
                    }}>

                {/* Main Title + SearchBar */}
                <div className="SimpleRow">
                    <h1 className="TitleLibrary" onClick={!props.Drag ? () => {props.onClick(2);} : null } >Library</h1>

                    {/* FullScreen lib  infos */}
                    <div className="HelpfullLogo" style={{  opacity: Expand ? "1" : 0}}> 
                        <img src={searchFilters.query.length > 2 ? ToggleLoupe : Loupe} alt="" style={{width: "1.8em", height: "1.8em", marginBottom: "10px" }} onClick={handlePage}></img>
                        <br/>
                        <img src={JSON.stringify(filterSort) !== JSON.stringify(basicFilter) ? RFilter : EFilter} alt="" style={{width: "1.8em", height: "1.8em"}} onClick={() => { handlePage(); handleFilterState(true) }}></img>
                    </div>
                    {movies && movies.docs ?
                    <div className="AditionnalInfos" style={{opacity: Expand ? "1" : 0, transitionDelay: Expand ? ".6s" : ".1s"}}>
                        <p style={{marginBottom: "-5px"}}> {totals.movieCount} Films</p>
                        <p style={{marginBottom: "-5px"}}> {totals.showCount} Shows</p>
                        <p style={{color: "grey", fontSize: "1em"}}>Showing {movies.totalDocs} with filters </p>
                    </div> : null}
                </div>
                <img src={ Expand ? SCompress : SExpand } alt="" onClick={Expand ? HandleExpand : handleTitle} className="HandleExpand" style={{opacity: props.active && props.ScreenWidth > 600 ? "1" : 0, transition: ".4s ease-out", transitionDelay: ".5s"}}></img>
                <div className="FullLib" id="FullLib" style={{height: `${window.innerHeight * 1}px`}}>
                
                { /* Search && Filter */}
                    <Filter
                        handleCategorie={handleType}
                        onChange={handleFiltersChange}
                        searchFilters={searchFilters}
                        state={filterState}
                        handleState={handleFilterState}
                        handleSection={props.onClick}/>
                
                {/* Grid */ }
                    <LGrid
                        Expand={Expand}
                        pageChange={handlePage}
                        Page={Page} 
                        HandleSection={props.onClick}
                        Library={movies}
                        path={path}
                        active={props.active}
                        type={type}
                        mobile={ props.ScreenWidth > 600 ? false : true }/>
                    
                    {/* Page Selection */}
                    <div className="PageSelector">
                        <div className="SimpleRow" style={{justifyContent: "center", marginTop: "-3px"}}>
                            {PageList}                                   
                        </div>
                    </div>

                    {/* Arrows */}
                    <div className="SimpleRow" style={{position: "sticky", bottom: "40%"}}>
                        <img className="ArrowPage" alt="" src={Larrow} onClick={Page > 1 ? () =>{setPage((prevState => prevState - 1)); handlePage()}: null } style={{opacity: Page > 1 ? "1" : 0}}></img>
                        <div style={{width: "calc(100% - 140px)", height: "3px"}}></div>
                        <img className="ArrowPage"  alt="" src={Rarrow} onClick={Page < movies.totalPages - 1 ? () =>{setPage((prevState => prevState + 1));  handlePage()}: null } style={{opacity: Page < movies.totalPages - 1 ? "1" : 0}}></img>
                    </div>
                </div>
            </div>  
        </div>
    )
} 

export default Library
