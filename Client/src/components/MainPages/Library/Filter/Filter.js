import React, { useState } from "react"

import SearchBar from './SearchBar';
import Interval from './Interval';
import MultiSelectList from './MultiSelectList';

import EFilter from "./../../../../ressources/icon/FilterEmpty.png"
import MFilter from "./../../../../ressources/icon/FilterMiddle.png"
import FFilter from "./../../../../ressources/icon/FilterFull.png"
import Search from "./../../../../ressources/icon/Loupe.png"

const genres = [
    'Action',
    'Adventure',
    'Comedy',
    'Family',
    'Fantasy',
    'Romance',
    'Drama',
    'History',
    'Thriller',
    'Western',
    'Sci-Fi',
    'Mystery',
    'Crime',
    'War',
    'Biography',
    'Animation',
    'Sport',
    'Music',
    'Musical',
  ];

const array = genres.map((genre) => ({key: genre, text: genre, value: genre }));

const Filter = (props) => {
    const [Categorie, setCategorie] = useState(1) /* Handle witch Library is displayed */
    const [ options ] = useState(array);
    const [ years ] = useState({
        domain: [1900, 2019],
        defaultValues: [1903, 2019],
        label: 'Production Year',
    });
    const [ ratings ] = useState({
        domain: [0, 10],
        defaultValues: [0, 10],
        label: 'Rating',
    });
    const [ searchFilters ] = useState(props.searchFilters);
    

    let FilterH = 0;    /* Store the correct Height for the UI */
    let FilterIMG = "" /* Store the correct Filter Img for the UI */

    // Adapt with the wanted display of filter menu
    switch(props.state) {
        case 0 :
            FilterIMG = EFilter
            FilterH = 0
            break
        case 1 :
            FilterIMG = MFilter
            FilterH = "60px"
            break
        case 2 : 
            FilterIMG = FFilter
            FilterH = "200px"
            break
        default: 
            FilterIMG = EFilter
            FilterH = 0
    }

    // Filter / Search / Categorie Handling

    const HandleCategorie = e =>  { 
        setCategorie(e);
        props.handleCategorie( e === 1 ? 'movie' : 'show')
    }

    const handleSearchBarChange = (query) => {
        const newFilters  = searchFilters;
        newFilters.query = query;
        props.onChange(newFilters); 
    }

    const handleSelectListChange = (selectedOption) => {
       const newFilters  = searchFilters;

        newFilters.selectedOption = selectedOption;
        props.onChange(newFilters); 
      }
    
    const handleYearsChange = (yearInterval) => {
      const newFilters  = searchFilters;
      newFilters.yearInterval = yearInterval;
      props.onChange(newFilters); 
    }

    const handleRatingsChange = (ratingsInterval) => {
      const newFilters  = searchFilters;
      
      newFilters.ratingsInterval = ratingsInterval;
      props.onChange(newFilters); 
    }

    return (
        <div>
            <div className="SimpleRow" style={{ width: "60%", margin: "0 auto", minWidth: "400px",  alignItems: "center", justifyContent: "center"}}>
            
            {/* Search */}
                <img src={Search} onClick={() => props.handleSection(2)}alt="" className="SearchIcon"></img>
                <SearchBar onChange={handleSearchBarChange} handleSection={props.handleSection}/>
                <img src={FilterIMG} alt="" className="SearchIcon" onClick={() => {props.handleState(false); props.handleSection(2)}}></img>
            </div>

            { /*Filter */ }
            <div style={{ height: FilterH, transition: ".4s ease-out", margin: "0 auto", width: "70%", minWidth: "600px", overflow: "hidden"}}>
            
            { /* Categorie */}   
                <div className="SimpleRow" style={{opacity: props.state > 0 ? "1" : 0,  marginTop: props.state > 0 ? "10px" : "-30px",transition: ".4s ease-out"}}>
                    <div className="SimpleRow" style={{  margin: "0 auto"}}>
                        <h2 className={Categorie === 1 ? "ToggleCat": "EmptyCat"} onClick={() => HandleCategorie(1)}>MOVIES</h2>
                        <div style={{width: "100px", height: "3px"}}></div>
                        <h2 className={Categorie === 2 ? "ToggleCat": "EmptyCat"}  onClick={() => HandleCategorie(2)}>SHOWS</h2>
                    </div>
                </div>

            { /* Other Filter */ }
                <div style={{ opacity: props.state > 1 ? '1' : 0, transition: ".4s ease-out", height: "150px", marginTop: "10px", marginLeft: "10px", }}>
                    <div className="SimpleRow" style={{width:"100%", marginBottom: "20px", alignItems: "center"}}>
                    
                    { /* Year of Production */ }
                    <Interval domain={years.domain}
                                defaultValues={years.defaultValues}
                                label={years.label}
                                onChange={handleYearsChange}
                    />
                    <div style={{width:"10%", height: "3px"}}></div>
                   
                   { /* Rating */ }
                        <MultiSelectList options={options} onChange={handleSelectListChange}/>
                    </div>
                    
                    { /* Genre */ }
                    <Interval domain={ratings.domain}
                                defaultValues={ratings.defaultValues}
                                label={ratings.label}
                                onChange={handleRatingsChange}
                    />
                </div>
            </div>
        </div>
    )
}
export default Filter