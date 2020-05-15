import React from 'react';
import cx from 'classnames';
import { Wave } from 'react-animated-text';

import classes from './Register.module.css';
import Input from '../../Global/Utils/Input/Input';

const RegisterDummy = (props) => {
	return (
		<div>
			<h3 id="Register" className={classes.Register} style={{ display: props.Loading ? "none" : "block" }} onClick={props.register}>Register</h3>
			<div className={classes.cont} style={{opacity: props.active ? "1" : "0"}}>
			{props.active ?
				<div className={classes.main}>
					<div className={classes.infosBlock}>
						<form className={classes.uploadForm}>
							<label htmlFor="file" className={classes.fileLabel}></label>
							<input 
								className={classes.fileInput}
								type="file" 
								onChange={e => { props.handleImageChange(e); }} 
								accept="image/*"
								multiple={true}
							/>
							{props.file ?
								<div className={classes.previewGlobal}>
									<img src={props.file.imagePreviewUrl} className={classes.previewImg} alt="preview" />
								</div>
								: null
							}
						</form>
						<div className={classes.firstInfos}>
							<Input
								style={{width: "90%"}}
								id={props.infos.orderForm.username.id}
								elementType={props.infos.orderForm.username.config.elementType}
								elementConfig={props.infos.orderForm.username.config.elementConfig}
								value={props.infos.orderForm.username.config.value || ""}
								invalid={!props.infos.orderForm.username.config.valid}
								shouldValidate={props.infos.orderForm.username.config.validation}
								touched={props.infos.orderForm.username.config.touched}
								errorMessage={props.infos.orderForm.username.config.errorMessage}
								onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.username.id) }}
							/>
							<div className={classes.sameLine}>
								<Input
									style={{width: "90%"}}
									id={props.infos.orderForm.firstName.id}
									elementType={props.infos.orderForm.firstName.config.elementType}
									elementConfig={props.infos.orderForm.firstName.config.elementConfig}
									value={props.infos.orderForm.firstName.config.value || ""}
									invalid={!props.infos.orderForm.firstName.config.valid}
									shouldValidate={props.infos.orderForm.firstName.config.validation}
									touched={props.infos.orderForm.firstName.config.touched}
									errorMessage={props.infos.orderForm.firstName.config.errorMessage}
									onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.firstName.id) }}
								/>
								<Input
									style={{width: "90%"}}
									id={props.infos.orderForm.lastName.id}
									elementType={props.infos.orderForm.lastName.config.elementType}
									elementConfig={props.infos.orderForm.lastName.config.elementConfig}
									value={props.infos.orderForm.lastName.config.value || ""}
									invalid={!props.infos.orderForm.lastName.config.valid}
									shouldValidate={props.infos.orderForm.lastName.config.validation}
									touched={props.infos.orderForm.lastName.config.touched}
									errorMessage={props.infos.orderForm.lastName.config.errorMessage}
									onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.lastName.id) }}
								/>
							</div>
							<Input
								style={{width: "90%"}}
								id={props.infos.orderForm.email.id}
								elementType={props.infos.orderForm.email.config.elementType}
								elementConfig={props.infos.orderForm.email.config.elementConfig}
								value={props.infos.orderForm.email.config.value || ""}
								invalid={!props.infos.orderForm.email.config.valid}
								shouldValidate={props.infos.orderForm.email.config.validation}
								touched={props.infos.orderForm.email.config.touched}
								errorMessage={props.infos.orderForm.email.config.errorMessage}
								onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.email.id) }}
							/>
						</div>
					</div>
					<div className={cx(classes.sameLine, classes.alone)}>
						<Input
							style={{width: "90%"}}
							id={props.infos.orderForm.password.id}
							elementType={props.infos.orderForm.password.config.elementType}
							elementConfig={props.infos.orderForm.password.config.elementConfig}
							value={props.infos.orderForm.password.config.value || ""}
							invalid={!props.infos.orderForm.password.config.valid}
							shouldValidate={props.infos.orderForm.password.config.validation}
							touched={props.infos.orderForm.password.config.touched}
							errorMessage={props.infos.orderForm.password.config.errorMessage}
							onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.password.id) }}
						/>
						<Input
							style={{width: "90%"}}
							id={props.infos.orderForm.cPasswd.id}
							elementType={props.infos.orderForm.cPasswd.config.elementType}
							elementConfig={props.infos.orderForm.cPasswd.config.elementConfig}
							value={props.infos.orderForm.cPasswd.config.value || ""}
							invalid={!props.infos.orderForm.cPasswd.config.valid}
							shouldValidate={props.infos.orderForm.cPasswd.config.validation}
							touched={props.infos.orderForm.cPasswd.config.touched}
							errorMessage={props.infos.orderForm.cPasswd.config.errorMessage}
							onChange={e => { props.inputChangedHandler(e, props.infos.orderForm.cPasswd.id) }}
						/>
					</div>
					<div className={classes.buttonBox}>
            {props.loading === true ?
              <Wave 
                text="Upload..."
                effect="fadeOut" 
                effectDuration={100}
              />
              : null
            }
            {props.error ?
              <p className={classes.error}>{props.error}</p>
              : null
            }
						<button 
							className={classes.submitButton}
							onClick={props.submit}
							disabled={!props.infos.formIsValid}
						>
							Submit
						</button>
					</div>
				</div>
				: null
			}
			</div>
		</div>
	);
}

export default RegisterDummy;
