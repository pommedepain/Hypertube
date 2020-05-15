import React, { useState, useEffect }  from 'react'
import { Container, Row} from "reactstrap";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios"

import MovieCase from './MovieCase'
import EmptyCase from './EmptyCase'

const LGrid = (props) => {
    const [history, setHistory] = useState([])

     /* GET history of current user */
     useEffect(() => {
      const username = localStorage.username
      const token = JSON.parse(localStorage.JWT)
      
      axios.get(`/api/history/${username}`, { headers: { 'x-auth-token': token.token }} )
        .then((res) => { if(res.data.success === true) setHistory(props.type === 'movie' ? res.data.movies.map(el => el.id) : res.data.tvShow.map(el => el.id))})
      }, [props.type, props.active]);

    return (
        <div>
            <Container className="table" id="table">  
                <Row className="justify-content-md-center" style={{width: "100%", marginLeft: props.mobile ? "15%" : null}}>
                    <React.Fragment>
                        {props.Library && props.Library.docs && props.Library.docs.length ? 
                            props.Library.docs.map(movie => {
                                if(props.active) {
                                    return <MovieCase
                                        key={movie.id}
                                        movie={movie}
                                        path={props.path}
                                        HandleSection={props.HandleSection}
                                        viewed={history.find((el) => el === movie.id) ? true : false}/>
                                }
                                else
                                    return <EmptyCase key={movie.id}/>
                                }) : null }
                    </React.Fragment>
                </Row>
            </Container>
        </div>
    )
}

export default LGrid
