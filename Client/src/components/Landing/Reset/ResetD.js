import React from 'react';

import classes from './Reset.module.css';
import Input from '../../Global/Utils/Input/Input';

const ResetSmurt = (props) => {
  // console.log(props.error);

  return (
    <div>
      	{/* <h3 id="Reset" className={classes.Reset} style={{ display: props.Loading ? "none" : "block" }} >Reset PWD</h3> */}
        <div className={classes.cont} /*style={{opacity: props.active ? "1" : "0"}}*/>
          <div className={classes.main}>
            <div className={classes.infosBlock}>
              <Input
								id={props.newPwd.orderForm.password.id}
								elementType={props.newPwd.orderForm.password.config.elementType}
								elementConfig={props.newPwd.orderForm.password.config.elementConfig}
								value={props.newPwd.orderForm.password.config.value || ""}
								invalid={!props.newPwd.orderForm.password.config.valid}
								shouldValidate={props.newPwd.orderForm.password.config.validation}
								touched={props.newPwd.orderForm.password.config.touched}
								errorMessage={props.newPwd.orderForm.password.config.errorMessage}
                onChange={e => { props.inputChangedHandler(e, props.newPwd.orderForm.password.id) }}
                disabled={props.error}
							/>
							<Input
								id={props.newPwd.orderForm.cPasswd.id}
								elementType={props.newPwd.orderForm.cPasswd.config.elementType}
								elementConfig={props.newPwd.orderForm.cPasswd.config.elementConfig}
								value={props.newPwd.orderForm.cPasswd.config.value || ""}
								invalid={!props.newPwd.orderForm.cPasswd.config.valid}
								shouldValidate={props.newPwd.orderForm.cPasswd.config.validation}
								touched={props.newPwd.orderForm.cPasswd.config.touched}
								errorMessage={props.newPwd.orderForm.cPasswd.config.errorMessage}
                onChange={e => { props.inputChangedHandler(e, props.newPwd.orderForm.cPasswd.id) }}
                disabled={props.error}
							/>
            </div>
            <div className={classes.buttonBox}>
              {props.error ?
                <p className={classes.error}>DEAD LINK</p>
                : null
              }
					  	<button 
					  		className={classes.submitButton}
					  		onClick={props.submit}
					  		disabled={!props.newPwd.formIsValid}
					  	>
					  		Submit
					  	</button>
					  </div>
          </div>
        </div>

    </div>
  );
}

export default ResetSmurt;
