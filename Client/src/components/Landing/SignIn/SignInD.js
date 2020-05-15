import React from 'react';

import classes from './SignIn.module.css';
import Input from '../../Global/Utils/Input/Input';
import QD from "../../../ressources/icon/42.png"
import Google from "../../../ressources/icon/Google.png"

const SignInDummy = (props) => {
	return (
		<div>
			<h3 id="SignIn" className={classes.signIn} style={{ display: props.Loading ? "none" : "block"}} onClick={props.signIn}>Sign-in</h3>
			<div className={classes.cont} style={{opacity: props.active ? "1" : "0"}}>
        {props.active ?
          <div className={classes.main} key={0}>
				  	<div className={classes.infosBlock}>
				  	  {props.infos.orderForm.map((elem, i) => {
				  	    return (
				  			<Input
				  				id={elem.id}
				  				key={i}
				  				elementType={elem.config.elementType}
				  				elementConfig={elem.config.elementConfig}
				  				value={elem.config.value || ""}
				  				invalid={!elem.config.valid}
				  				shouldValidate={elem.config.validation}
				  				touched={elem.config.touched}
				  				errorMessage={elem.config.errorMessage}
                  onChange={e => { props.inputChangedHandler(e, elem.id) }}
				  			/>
				  		)
				  	})}
				  	</div>
            {props.resetButton === true ?
              <div className={classes.resetDiv} id="resetDiv" key={1}>
                <div className={classes.infosBlock} >
                  {props.resetForm.orderForm.map((elem, i) => {
                    return (
                      <Input
                        id={elem.id}
                        key={i}
                        elementType={elem.config.elementType}
                        elementConfig={elem.config.elementConfig}
                        value={elem.config.value || ""}
                        invalid={!elem.config.valid}
                        shouldValidate={elem.config.validation}
                        touched={elem.config.touched}
                        errorMessage={elem.config.errorMessage}
                        onChange={e => { props.inputChangedHandler(e, elem.id) }}
                      />
                    )
                  })}
                </div>
              </div>
              : null
            }
				  	<div className={classes.buttonBox} id={"buttonBox"} >
              {props.error === false ?
                <button className={classes.resetButton} href='#' onClick={props.resetPwd} id='resetButton' > RESET PWD</button>
                : props.error === true ?
					<button className={classes.resetButton2} href='#' onClick={props.resetPwd} id='resetButton'><span>{props.resetButton ? "RESET PWD" : "BAD AUTH"} </span></button>
                : props.error === 'ERROR' ?
                <p className={classes.errorReset}>{props.error}</p>
                : props.error === 'MAIL SENT' ?
                <p className={classes.success}>{props.error}</p>
                : null
              }
				  		<button 
							className={classes.submitButton}
							id='submitButton'
				  			onClick={props.resetButton ? props.sendResetMail : props.submit}
				  			disabled={props.resetButton === true ? !props.resetForm.formIsValid : !props.infos.formIsValid}
				  		>
				  			{props.resetButton ? 'SUBMIT' : 'ENTER'}
				  		</button>
						
				  	</div>
				
				<div className={classes.omniAuth}>
					<button 
							className={classes.submitButton}
							id='submitButton2'
							style={{display: props.resetButton ? "none" :"block"}}
							// onClick={props.resetButton ? props.sendResetMail : props.submit}
							// disabled={props.resetButton === true ? !props.resetForm.formIsValid : !props.infos.formIsValid}
						>
							<a href='/api/auth/42'><img style={{height: "40px", marginRight: "30px"}} src={QD} alt=""></img></a>
						</button>
						<button 
								className={classes.submitButton}
								id='submitButton3'
								style={{display: props.resetButton ? "none" :"block"}}
							// onClick={props.resetButton ? props.sendResetMail : props.submit}
							// disabled={props.resetButton === true ? !props.resetForm.formIsValid : !props.infos.formIsValid}
						>
							<a href='/api/auth/google'><img style={{height: "40px",}} src={Google} alt=""></img></a>
						</button>
					</div>
				</div>
          : null
				}
				
			</div>
		</div>
	);
}

export default SignInDummy;
