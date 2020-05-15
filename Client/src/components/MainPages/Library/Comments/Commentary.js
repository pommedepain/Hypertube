import React, { useState, useEffect } from "react"
import axios from "axios"

import CommentMessage from "./CommentaryMess"
import Send from "./../../../../ressources/icon/Plane.png"


const Commentary = (props) => {
    const [Comment, setComment] = useState("")          /* New comment text from a textarea */
    const [NewComment, setNewComment] = useState(false) /* Refresh the comments list */
    const [CommentList, setCommentList] = useState([])  /* Array of objects with all comments infos */
    
    // Style for Mobile / desktop 
    let mobileStyle = {
        top:' 180px',
    }
    let desktopStyle = {
        right: props.Expand ? " -300px" : "0",
        opacity: props.Expand ? "1" : "0",
    }
    let classname = !props.isMobile ? "CommentarySection" : "CommentaryMobile"
    let style = !props.isMobile ? desktopStyle : mobileStyle

    
    /* Gets all the comment from server and convert it for display */
    useEffect(() => {
        fetch(`/API/comment/${props.infos.movie.id}`)
            .then(response => response.json())
            .then(data => {
                setCommentList(data.reverse().map(item => <CommentMessage key={item._id} item={item} Refresh={ToggleComment} /> ))
            })
        setComment("")
        setNewComment(false)
    }, [NewComment, props.infos.movie.id])

    /* Post new comments */
    const PostComment = () => {
        const data = {
            filmId: props.infos.movie.id,
            userName: localStorage.username,
            text: Comment,
        }
        axios.post(`/API/comment`, data)
            .then(result => setNewComment(true))
            .catch(err => console.log(err))
    }

    /* Fill Comment with the textarea value */
    const HandleComment = (e) => {  setComment(e.target.value) } 

    /* Refresh the comments list */
    const ToggleComment = () => {setNewComment(prevState => !prevState)}

    return(
       /* Comments List */
       <div>
        <div className={classname} style={style}>
            <div className="CommentaryList">
                {CommentList}
            </div>

        { /* Sending New Message */}
            <div className="SendMessage">
                <div className="SimpleRow">
                    <textarea
                        className= "MessageInput"
                        value={Comment}
                        onChange = {HandleComment}
                        type="text"
                        name="Comments"
                        placeholder= ""/>
                    <img alt="" src={Send} style={{width: "50px", height: "50px", margin: "0 auto", marginTop: "25px"}} onClick={Comment.length ? PostComment : null}></img>
                </div>
            </div>
            </div>
        </div>
    )
}

export default Commentary
