import React from "react"
import Logout from"../../ressources/icon/Logout.png"
import Library from"../../ressources/icon/Library.png"
import HT from "../../ressources/icon/HT.png"
import Infos from "../../ressources/icon/User.png"
import Histo from "./../../ressources/icon/History.png"

const Navbar = (props) => {

    return (
        <div className="test">
            <div className={props.mobile ? "NavbarMobile" : "Menu"}>
                <img className="MenuIcon" onClick={() => props.onClick(1)} style={{marginRight:"28px", marginLeft: "8px"}} src={HT} alt=""></img>
                <img className="MenuIcon" onClick={() => props.onClick(2)} style={{width:"50px", height: "50px", marginTop:"10px", marginBottom: "12px"}} src={Library} alt=""></img>
                <img className="MenuIcon"  onClick={() => props.onClick(4)} style={{width:"53px", height: "53px", marginTop: "10px", marginBottom: "15px"}} src={Histo} alt=""></img>
                <img className="MenuIcon"  onClick={() => props.onClick(3)} style={{width:"50px", height: "50px", marginTop: "5px", marginBottom: "15px", marginRight: "32px"}} src={Infos} alt=""></img>
                <img className="MenuIcon" onClick={props.DeLog} src={Logout} style={{marginRight:"9px", marginTop: "-7px"}} alt=""></img>
                <p style={{position: "fixed", bottom: "0px", right: "10px", fontWeight: "bold"}}>Navbar.</p>
            </div>
        </div>
    )
}

export default Navbar
