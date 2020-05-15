import React, { useContext, useState } from 'react'
import axios from 'axios'

import ProfilContext from "../../../Global/ProfilContext"

const CommentMessage = (props) => {
    const { setWantedUsername, setProfil, WantedUsername} = useContext(ProfilContext)   /* Needed for showing the user profils */
    const [Modify, setModify] = useState(false)                                         /* Changes Modify state for UI */
    const [NewComment, setNewComment] = useState(props.item.text)                       /*  Modify comment text from a textarea */

    /* Handle comments option (delete and modify) */
    const DeleteComm = () => {
        const id = { id: props.item._id }

        axios.delete('/API/comment', { data: id })
        setTimeout(()=> props.Refresh(), 200 );
    }

    const ModifyComm = () => {
       const Modify = { id: props.item._id, text: NewComment }
       axios.put('/API/comment',  Modify )
       setTimeout(()=> {props.Refresh(); setModify(false)}, 200 );
       
    }

    /* Fill NewComment with the textarea value */
    const HandleComment = (e) => {  setNewComment(e.target.value) } 

    /* Activate and send infos to userProfil component  */
    const ToggleProfil = (username) => {
        setProfil(prevState => WantedUsername === username && prevState === true  ? false : true)
        setWantedUsername(username)
    }


    const CDate = props.item.date.substring(0, 10) /* Better display of the date */ 

    return (
        <div className="CommentaryMessage" >
            <div className="SimpleRow">

                {/* Username */}
                <h4 
                    style={{
                        fontSize: "1.8em",
                        marginLeft: 0,
                        marginTop: "20px",
                        marginBottom: "0px",
                        width: "50%",
                        color: props.item.userName === localStorage.username ? "#97f7c7" : "white"}}
                        onClick={() => ToggleProfil(props.item.userName)}>
                {props.item.userName}</h4>

                {/* Date */}
                <p style={{fontsize: ".5em", width: "50%", color:"grey", textAlign: "right", marginTop: "28px",}}>{CDate}</p>
              

            </div>
            {Modify ?
                /* NewComments textarea */
                <textarea
                 style={{fontSize: "1em", marginTop: "0px",borderRadius: "5px",
                     border: "none",
                     color: "white",
                     backgroundColor: "rgba(255, 255, 255, .2)",
                     width: "100%",
                     marginBottom: "10px"}}
		    	value={NewComment}
		    	onChange = {HandleComment}
		    	type="text"
		    	name="NewComment"
		    	placeholder= ""/>
                :
                /* Commentary text  */
                <p  style={{fontSize: "1em", color: "grey", marginTop: "0px"}}>{props.item.text}</p> 
            }

            { /* Commentary Option */ }
            {props.item.userName === localStorage.username ? 
                <div className="MDRow">
                    <p style={{width:"50%", color:"#03CBE5", opacity: Modify ? ".3" : "1", transition: ".2s ease-out"}}
                        onClick={() => {setModify(prevState => !prevState)}}>MODIFY</p>
                    {Modify ?
                        <p style={{width:"50%", textAlign: "right", color: "#01B50F"}} onClick={ModifyComm}>SEND</p>
                        : <p style={{width:"50%", textAlign: "right", color: "#BE0101"}} onClick={DeleteComm}>DELETE</p> 
                    }
                   
                </div> : null}
        </div>
    )
}

export default CommentMessage
