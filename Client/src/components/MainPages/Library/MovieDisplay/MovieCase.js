import React, {useState} from 'react'

import MovieCard from './MovieCard'
import TvShowCard from './TvShowCard'

const MovieCase = (props) => {
    const [ShowCard, setShowCard] = useState(false) /* To display card or not */
    const { title, rating, year } = props.movie
    // Get good pic even if one source failed
    let src = '';
    if (props.movie.mediumCover) {
        src = `${props.movie.mediumCover}`;
    } else if (props.movie.images) {
        src = `${props.movie.images.poster}`;
    }

    /* Toggle the display + Handle position for UX */
    const HandleShowCard = () => { 
        setShowCard( prevState => ( !prevState ));
        props.HandleSection(2);
    } 

    

    if (props.history) {
        return (
            <div className="MovieOverview" onClick={()=> {props.getCard(props.movie); props.handleSection(4)} } style={{backgroundImage: `url("${src}")`, backgroundSize: "cover"}}>
                <div className="MovieOinside" >
                    <h2 className="TitleOverview" style={{fontSize: "2.5em", height: "170px", overflow: "hidden", fontWeight: "bold"}}>{title}</h2>
                    <div className="SimpleRow" style={{marginTop: "35px", }}>
                        <h3 style={{width: "50%", fontSize: "2.5em", marginLeft: "5px"}}>{year}</h3>
                        <h3 style={{width: "50%", fontSize: "3em", fontWeight: "bold", textAlign: "right", color: "yellow", marginTop: "-5px" }}>{rating}</h3>
                    </div>
                </div>
            </div>
        )   
    }
    if (ShowCard) { /* Display on */
        return (
            <div className="MovieToggle"> 
            {props.movie.trailer ?
                <MovieCard 
                    onClick={ HandleShowCard }
                    movie={props.movie}
                    path={props.path}
                />
            :
                <TvShowCard 
                        onClick={ HandleShowCard }
                        movie={props.movie}
                        path={props.path}
                /> }
            </div>     
    ) 
    } else            /* Display off */
        return (
            <div className="MovieOverview" onClick={HandleShowCard } style={{backgroundImage: `url("${src}")`, backgroundSize: "cover", filter: props.viewed ? "brightness(.4)" : null, border: props.viewed ? "solid 5px white" : null}}>
                <div className="MovieOinside" >
                    <h2 className="TitleOverview" style={{fontSize: "2.5em", height: "170px", overflow: "hidden", fontWeight: "bold"}}>{title}</h2>
                    <div className="SimpleRow" style={{marginTop: "35px", }}>
                        <h3 style={{width: "50%", fontSize: "2.5em", marginLeft: "5px"}}>{year}</h3>
                        <h3 style={{width: "50%", fontSize: "3em", fontWeight: "bold", textAlign: "right", color: "yellow", marginTop: "-5px" }}>{rating}</h3>
                    </div>
                </div>
            </div>    
        )
}


export default MovieCase
