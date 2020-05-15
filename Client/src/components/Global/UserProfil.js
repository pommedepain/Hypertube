
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import "./global.css"

import ArrowB from "./../../ressources/icon/Arrowb.png"

const UserProfil = (props) => {
    const [Profil, setProfil] = useState({})

   useEffect(() => {
       if(props.username && props.username != null) {
           const token = JSON.parse(localStorage.getItem('JWT'));

            axios.get(`/API/users/one_user/${props.username}`, { headers: { "x-auth-token": token.token } })
            .then(response => setProfil(response.data.result))
            .catch(err => console.log(err))
       }
   }, [props.username])

    return (
        <div className="test">
            <div className="UserProfil" style={{marginLeft: props.show ? null : "-440px"}}>
                <img alt="" src={ArrowB} style={{position: "absolute", width: "45px", height: "45px", top: "10px", right: "10px"}} onClick={() => props.setShow(false)}></img>
                <div className="SimpleRow">
                {/* Profil Picture */}
                    <img style={{width: "130px",
                         height: "130px",
                         marginTop: "50px",
                         marginLeft: "30px",
                         marginRight: "20px",
                         boxShadow: "0px 0px 15px rgba(0,0,0, .5)",
                         }}
                         src={Profil.photo}
                         alt=""></img>

                     {/* Pseudo */}
                     <div style={{marginTop: "50px", marginLeft: "0"}}>
                        <h1 className="ProfilName" >{Profil.username}</h1>

                        {/* FirstName - LastName */}
                        <div className="SimpleRow" style={{justifyContent: "center", marginTop: "-10px", color: "grey"}}>
                            <h3 style={{
                                fontSize: "1.5em",
                                color: "#403f3f",
                                marginRight: "10px",
                                fontWeight: "500"}}>{Profil.firstName}</h3>
                            <h3 style={{fontWeight: "500",    color: "#403f3f", fontSize: "1.5em",}}>{Profil.lastName}</h3>
                        </div>

                        {/* Language */}
                        <h2 style={{position: "absolute", bottom: "45px",  color: "black"}}>{Profil.defaultLanguage}</h2>
                     </div>
                </div>
                <p style={{position: "fixed", bottom: "0px", right: "10px", fontWeight: "bold"}}>User Profil.</p>
            </div>
        </div>
    )
}

export default UserProfil
