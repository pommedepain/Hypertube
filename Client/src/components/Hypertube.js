import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable';
import {animateScroll} from 'react-scroll';

import "../index.css"

import useWindowSize from '../func/use-window-size';

import Library from "./MainPages/Library/_Main"
import Infos from "./MainPages/Infos/_Main"
import Navbar from "./Global/Navbar";
import Register from "./Landing/Register/_Main";
import SignIn from "./Landing/SignIn/_Main";
import Reset from './Landing/Reset/_Main';
import UserProfil from "./Global/UserProfil"
import ProfilContext from "./Global/ProfilContext";
import History from "./MainPages/History/_Main";

import Geranium from "./../ressources/icon/Geranium.png";

const App = () => {
  if (!localStorage.JWT && document.cookie) {
    const cookie = document.cookie;
    // console.log(cookie);
    const tmp = cookie.split(';');
    let token = tmp[0].split('=')[1];
    token = {"token": token};
    const username = tmp[1].split('=')[1];
    localStorage.setItem('JWT', JSON.stringify(token));
    localStorage.setItem('username', username);
  }
    const Dimension =  useWindowSize()                            /* Get the width and height all the time */
    const [Active, setActive] = useState(                         /* Store if component is active */
      {
        active0: window.localStorage.username ? true : false,
        active1: window.localStorage.username ? true : false,
        active2: window.localStorage.username ? true : false,
        active3: false
      })
    const [DeltaPos, setDeltaPos] = useState(                      /* Store the default position on map */
      {
        x: -1500 + Dimension.width / 2,
        y: window.localStorage.username ? -1250 +  Dimension.height / 2 
          : -1250 +  Dimension.height / 4 
      })
    const [Drag, setDrag] = useState(false)                       /* Are you dragging? This variable knows */
    const [Loading, setLoading] = useState(false)                 /* Site is loading? This variable knows */
    const [formActive, setFormActive] = useState(                 /* Know witch component to activate on landing */
      {
        signIn: false,
        register: false
      });
    const [Profil, setProfil] = useState(false)                   /* To show user profil */
    const [WantedUsername, setWantedUsername] = useState("")      /* Store the username to display in user profil */
    const [urlParams, setUrlParams] = useState(false);

    useEffect(() => {
      const params = getUrlVars();
      if (params._id !== null && params.token !== null) {
        setUrlParams(params);
        localStorage.clear();
        setActive({active0: false});
        HandleSection(0);
      }
    }, []);

    const getUrlVars = () => {
      var url = new URL(decodeURI(window.location.href));
      let params = {};
      params['_id'] = url.searchParams.get("_id");
      params['token'] = url.searchParams.get("token");
      return params;
    }

    /* 
      Function that allows to open the right form when clicking the h4 
      "Sign In" and "Register". Correct the style accordingly.
    */
    const whichForm = e => {
      e.preventDefault();
      switch (e.target.id) {
        case 'Register':
          setFormActive({ signIn: false, register: true });
          document.getElementById("Register").style.color = "white";
          document.getElementById("SignIn").style.color = "grey";
          break;
        case 'SignIn':
          setFormActive({ signIn: true, register: false });
          document.getElementById("Register").style.color = "grey";
          document.getElementById("SignIn").style.color = "white";
          break;
        default:
          setFormActive({ signIn: false, register: false });
          document.getElementById("Register").style.color = "white";
          document.getElementById("SignIn").style.color = "white";
          break;
      }
    }

    /* Handle Drag = give position to state variable, decide witch component need to be activated */
    /* 
      Listener on the array that tells us on which form the user is and here, 
      checks if the reset password button has been previously clicked. If so,
      it transforms the style back to normal.
    */
    useEffect(() => {
      if (formActive.signIn === true) {
        if (document.getElementById('resetDiv')) {
          document.getElementById('resetDiv').style.display = 'none';
          document.getElementById('username').disabled = false;
          document.getElementById('password').disabled = false;
          document.getElementById('submitButton').innerHTML = 'ENTER';
          const buttonBox = document.getElementById('buttonBox');
          buttonBox.style.transition = '.4s';
          buttonBox.style.top = '80%';
          if (document.getElementById('resetButton')) document.getElementById('resetButton').style.opacity = '1';
          const usernameInput = document.getElementById('username');
          const passwordInput = document.getElementById('password');
          usernameInput.style.transition = '.4s';
          passwordInput.style.transition = '.4s';
          usernameInput.style.opacity = '1';
          passwordInput.style.opacity = '1';
        }
      }
    }, [formActive])

    const handleDrag = (e, ui) => {
        const {x, y} = DeltaPos

        setDeltaPos({x: x + ui.deltaX, y: y + ui.deltaY})
        setDrag(true)
        setActive(prevState => ({
            ...prevState,
            active1: DeltaPos.x > (-1500 + Dimension.width * .4) 
                && DeltaPos.y < (-1250 + Dimension.height * .4) ? true : false,
            active2:  DeltaPos.x < (-1500 + Dimension.width * .4)
                && DeltaPos.y > (-1250 + Dimension.height * .6) ? true : false,
            active3: DeltaPos.x > (-1500 + Dimension.width * .3)
              && DeltaPos.y > (-1250 + Dimension.height * .6) ? true : false,
        }))
        setProfil(false)
        document.getElementById('Map').style.transition = "null"
    } 

    /* Login - Delog behaviors */
    const logIn = () => {
        setLoading(true)
        setTimeout(function() {
            setActive(prevState => ({ ...prevState, active0: true, active1: true, active2: true}))
            HandleSection(1)
            setLoading(false)
        }, 800)
       
    }

    /* Cleans out the localStorage of JWT and username variables. */
    const DeLog = () => {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
          let cookie = cookies[i];
          let eqPos = cookie.indexOf("=");
          let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
      localStorage.clear();
      setActive({active0: false})
      HandleSection(0)
    }

    /* Handle Position for the different section */
    const HandleSection = (index) => {
        if(Dimension.width > 600) {
          let NewX = 0;
          let NewY = 0;
          switch(index) {
              case 0 : /* Non Active Position */
                NewX =  -1500 + Dimension.width / 2
                NewY = -1250 +  Dimension.height / 4
                break
              
              case 1 : /* Default Position */
                  NewX= -1500 + Dimension.width / 2
                  NewY = -1250 + Dimension.height / 2
                  setActive(prevState => ({ ...prevState, active1: true, active2: true, active3: false}))
              break

              case 2 : /* Library Position */
                  NewX = -1500 + Dimension.width * .5 + 25
                  NewY =  - 1250 - Dimension.height * 0.2
                  setActive(prevState => ({ ...prevState, active1: true, active2: false, active3: false}))
              break

              case 3 : /* Infos Position */
                  NewX = - 1500 - Dimension.width * 0.15 + 150
                  NewY = - 1250 + Dimension.height * 0.4 + 300
                  setActive(prevState => ({ ...prevState, active1: false, active2: true, active3: false}))
              break

              case 4 : /* History Position */
                  NewX = -1500 + Dimension.width * 0.6 + 70
                  NewY = -1250 + Dimension.height * .8 + 60;
                  setActive(prevState => ({ ...prevState, active1: false, active2: false, active3: true}))
              break

              default : 
        }
        setDeltaPos({x: NewX, y: NewY})
        document.getElementById('Map').style.transition = ".4s ease-out"
        document.getElementById('Map').style.transform = `translate(${NewX}px, ${NewY}px)`
        setDrag(false)
    }
  }

  const Mleft = 1500 - Dimension.width / 2

  if (Dimension.width > 600) {
    return (
      <ProfilContext.Provider
      value={{ setWantedUsername, setProfil, WantedUsername }}>
        <div style={{position: "fixed", width: "5000px", height: "5000px",  backgroundColor: "#1c1c1c",}}>
          {/*--- Draggable div ---*/}
            <Draggable
              enableUserSelectHack={false}
              cancel=".inputValidation"
              handle={Active.active0 ? ".handle" : ".test" }
              defaultPosition= { DeltaPos }
              position={ Drag ? null : DeltaPos }
              grid={[5, 5]}
              scale={.8}
              onStart={() => setTimeout(()=> setDrag(true), 400)}
              onDrag={handleDrag}
              onStop= {() => setTimeout(()=> setDrag(false), 400)}
              bounds={{ top: -2400, left: -2000, right: 600, bottom: 500 }}
              >
              
              {/*--- MAP ---*/}
              <div style={{ position: "fixed", width: "3000px", height: "3000px",  border: "solid 3px white", backgroundColor: "#0f0f0f" }} className="handle" id="Map">
                <div style={{width: Dimension.width, height: Dimension.height, marginLeft: Mleft}}>
                  {/* Main Title */}
                  <h1 
                    onClick={Active.active0 && !Drag ? () => HandleSection(1) : () => HandleSection(0)}
                    className={Active.active0 ? "title_active" : "title_unactive"}
                    style={{left : 1500, top: 1250 ,}}>HYPERTUBE</h1>
                  {/* Content */}
                  {Active.active0 ?
                    <div>
                      <Library 
                        onClick={HandleSection}
                        active={Active.active1}
                        ScreenWidth={Dimension.width}
                        ScreenHeight={Dimension.height}
                        Drag={Drag}/>
                      <Infos onClick={HandleSection} active={Active.active2} ScreenWidth={Dimension.width} ScreenHeight={Dimension.height}/>
                      <History onClick={HandleSection} active={Active.active3} ScreenWidth={Dimension.width} ScreenHeight={Dimension.height}/>
                    </div>
                  : urlParams === false ? 
                    <div>
                      <SignIn Loading={Loading} formActive={formActive} whichForm={whichForm} logIn={logIn} />
                      <Register Loading={Loading} formActive={formActive} whichForm={whichForm} logIn={logIn} />
                    </div>
                  : <Reset Loading={Loading} params={urlParams} setUrlParams={setUrlParams} />
                  }
                </div>
                {/* FOOTER */}
                <div style={{position: "fixed", bottom: "20px",width: "100%", textAlign: "center"}}>
                  <h4 style={{fontWeight: "bold"}}>this is a footer.</h4>
                </div>
                <img className="geranium" src={Geranium} alt="Et juste là, un ptit géranium." title="Et juste là, un ptit géranium !" ></img>
              </div>
            </Draggable>
            {/* To have coordinate in real time */}
            {/* <div style={{ position: "fixed", top: 0, left: 0 }}>
              <h2 style={{color:"white"}}>x: {DeltaPos.x.toFixed(0)}</h2>
              <h2 style={{color:"white"}}>y: {DeltaPos.y.toFixed(0)}</h2>
            </div> */}

          {/*--- HUD ---*/}
          { Active.active0 ? 
            <div>
              <Navbar onClick={HandleSection} DeLog={DeLog}/> 
              <UserProfil 
                username= {WantedUsername}
                JWT= {localStorage.JWT}
                show= {Profil}
                setShow= {setProfil}
              />
            </div>
            : null
          }
        </div>
      </ProfilContext.Provider>
    );    
  } else {
    const handleSectionMobile = (index) => {
      switch(index) {
        case 1: 
          animateScroll.scrollTo(500)
          break
        case 2: 
          animateScroll.scrollTo(1100)
          break
        case 3:
            animateScroll.scrollTo(400)
            break
        case 4:
          animateScroll.scrollTo(50)
          break
        default:
          animateScroll.scrollTo(500)
      }
    }
    return (
     Active.active0 ?
      <div style={{ backgroundColor: "#0f0f0f", paddingTop: "300px", paddingBottom: "500px"}}>
        <History
          onClick={handleSectionMobile}
          active={true}
          ScreenWidth={Dimension.width}
          ScreenHeight={Dimension.height} />
         <Infos
            onClick={handleSectionMobile}
            active={true}
            ScreenWidth={Dimension.width}
            ScreenHeight={Dimension.height} />
        <h1 id="HT" style={{textAlign: "center", fontSize: "5.6em",  marginTop: "200px"}}>HYPERTUBE</h1>
        <Library 
           onClick={handleSectionMobile}
           active={true}
           ScreenWidth={Dimension.width}
           ScreenHeight={Dimension.height}
           Drag={Drag} />
        <Navbar 
          onClick={handleSectionMobile}
          DeLog={DeLog}
          mobile={true}/>
        {/*<UserProfil /> */}
      </div> 
      : urlParams === false ? 
        <div style={{backgroundColor: "#0f0f0f", height: "100%", overflow: "hidden"}}>
          <h1>HYPERTUBE</h1>
          <SignIn Loading={Loading} formActive={formActive} whichForm={whichForm} logIn={logIn} />
          <Register Loading={Loading} formActive={formActive} whichForm={whichForm} logIn={logIn} />
        </div>
      : <Reset Loading={Loading} params={urlParams} setUrlParams={setUrlParams} />
    )
  }
}

export default App
