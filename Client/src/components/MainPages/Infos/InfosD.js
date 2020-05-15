import React from 'react';
import { Wave } from 'react-animated-text';

import classes from './Infos.module.css';
import Input from '../../Global/Utils/Input/Input';

const InfosDummy = (props) => {
  const cap = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  return (
		<div className="Section">
			<div
				className={classes.card}
				onClick= { !props.Drag ? () => props.onClick(3) : null} 
				style={{
					zoom: 1.1,
					position: props.ScreenWidth > 600 ? "absolute" : "relative",
					opacity: props.active ? "1" : ".5",
					transition: "opacity .8s",
					width: props.ScreenWidth > 600 ? "600px" : props.ScreenWidth * 0.9,
					height: "300px",
					marginTop: props.ScreenWidth > 600 ? null : "100px",
					left: props.ScreenWidth > 600 ? 1500 + props.ScreenWidth * 0.2 : null,
					top:  props.ScreenWidth > 600 ? 1250 - props.ScreenHeight * 0.5 : null,
				}}
			>
				<h1 style={{ fontSize: props.ScreenWidth > 600  ? "5em" : "3.4em", marginLeft: "0", marginTop: "0", marginBottom: "40px" }}>PERSONAL INFOS</h1>
				<div className={classes.infos}>
					<div className={classes.photoBlock}>
							{props.edit ?
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
											<img src={props.file.imagePreviewUrl} className={classes.previewImg} alt="preview new" />
										</div>
										: <div className={classes.previewGlobal}>
                      <img src={props.newInfos.orderForm.photo.config.value} className={classes.previewImg} alt="preview old" />
                    </div>
									}
								</form>
								: <img src={props.file ? props.file.imagePreviewUrl : props.newInfos.orderForm.photo.config.value} alt="profil" className={classes.profilPic} />
						}
					</div>
					<div className={classes.infosBlock}>
						{props.edit ?
						<div>
              <Input
                style={{border: 'none', backgroundColor: 'transparent', animationName: 'classes.expand', animationDuration: '.6s', 
                  animationTimingFunction: 'ease-out', fontSize: '2em', fontWeight: '700', width: '100%', 
                  borderBottom: props.newInfos.orderForm.username.config.errorMessage ? '1px solid red' : '1px solid var(--White)'}}
                validationError={true}
								id={props.newInfos.orderForm.username.id}
								key={props.newInfos.orderForm.username.id}
								elementType={props.newInfos.orderForm.username.config.elementType}
								elementConfig={props.newInfos.orderForm.username.config.elementConfig}
								value={props.newInfos.orderForm.username.config.value || ""}
								invalid={!props.newInfos.orderForm.username.config.valid}
								shouldValidate={props.newInfos.orderForm.username.config.validation}
								touched={props.newInfos.orderForm.username.config.touched}
								errorMessage={props.newInfos.orderForm.username.config.errorMessage}
								onChange={e => { props.inputChangedHandler(e, props.newInfos.orderForm.username.id) }}
							/><div style={{width: "100%", height: "20px"}}></div>
							</div>
							: <h4 className={classes.username}>{props.newInfos.orderForm.username.config.value}</h4>
						}
						<div className={classes.groupedInfos}>
							{props.edit ?
								[<div className={classes.firstLastName} key={0}>
									<Input
                    style={{border: 'none', borderBottom: '1px solid var(--White)', backgroundColor: 'transparent',
                      animationName: 'classes.expand', animationDuration: '.6s', animationTimingFunction: 'ease-out',
                      fontSize: '1em', color: 'rgba(245, 245, 245, 0.719)', fontWeight: '300'}}
										key={props.newInfos.orderForm.firstName.id}
										id={props.newInfos.orderForm.firstName.id}
										elementType={props.newInfos.orderForm.firstName.config.elementType}
										elementConfig={props.newInfos.orderForm.firstName.config.elementConfig}
										value={props.newInfos.orderForm.firstName.config.value || ""}
										invalid={!props.newInfos.orderForm.firstName.config.valid}
										shouldValidate={props.newInfos.orderForm.firstName.config.validation}
										touched={props.newInfos.orderForm.firstName.config.touched}
										errorMessage={props.newInfos.orderForm.firstName.config.errorMessage}
										onChange={e => { props.inputChangedHandler(e, props.newInfos.orderForm.firstName.id)}}
									/>
                  <Input 
                    style={{border: 'none', borderBottom: '1px solid var(--White)', backgroundColor: 'transparent',
                    animationName: 'classes.expand', animationDuration: '.6s', animationTimingFunction: 'ease-out', marginLeft: '5%', 
                    width: '98%', fontSize: '1em', color: 'rgba(245, 245, 245, 0.719)', fontWeight: '300'}}
										key={props.newInfos.orderForm.lastName.id}
										id={props.newInfos.orderForm.lastName.id}
										elementType={props.newInfos.orderForm.lastName.config.elementType}
										elementConfig={props.newInfos.orderForm.lastName.config.elementConfig}
										value={props.newInfos.orderForm.lastName.config.value || ""}
										invalid={!props.newInfos.orderForm.lastName.config.valid}
										shouldValidate={props.newInfos.orderForm.lastName.config.validation}
										touched={props.newInfos.orderForm.lastName.config.touched}
										errorMessage={props.newInfos.orderForm.lastName.config.errorMessage}
										onChange={e => { props.inputChangedHandler(e, props.newInfos.orderForm.lastName.id)} }
									/>
								</div>]
								: <h4 className={classes.firstLastName}>{props.newInfos.orderForm.firstName.config.value} {props.newInfos.orderForm.lastName.config.value}</h4>
							}
							{props.edit ?
								<Input
                  style={{border: 'none', borderBottom: '1px solid var(--White)', backgroundColor: 'transparent',
                  animationName: 'classes.expand', animationDuration: '.6s', animationTimingFunction: 'ease-out', 
                  color: 'rgba(245, 245, 245, 0.719)', fontWeight: '300', width: '100%'}}
									key={props.newInfos.orderForm.email.id}
									id={props.newInfos.orderForm.email.id}
									elementType={props.newInfos.orderForm.email.config.elementType}
									elementConfig={props.newInfos.orderForm.email.config.elementConfig}
									value={props.newInfos.orderForm.email.config.value || ""}
									invalid={!props.newInfos.orderForm.email.config.valid}
									shouldValidate={props.newInfos.orderForm.email.config.validation}
									touched={props.newInfos.orderForm.email.config.touched}
									errorMessage={props.newInfos.orderForm.email.config.errorMessage}
									onChange={e => { props.inputChangedHandler(e, props.newInfos.orderForm.email.id)}}
								/>
								: <h4 className={classes.email}>{props.newInfos.orderForm.email.config.value}</h4>
							}
						</div>
						{props.edit ?
              <Input 
                style={{border: 'none', borderBottom: '1px solid var(--White)', backgroundColor: 'transparent'}}
								key={props.newInfos.orderForm.defaultLanguage.id}
								id={props.newInfos.orderForm.defaultLanguage.id}
								elementType={props.newInfos.orderForm.defaultLanguage.config.elementType}
								elementConfig={props.newInfos.orderForm.defaultLanguage.config.elementConfig}
								value={props.newInfos.orderForm.defaultLanguage.config.value || ""}
								invalid={!props.newInfos.orderForm.defaultLanguage.config.valid}
								shouldValidate={props.newInfos.orderForm.defaultLanguage.config.validation}
								touched={props.newInfos.orderForm.defaultLanguage.config.touched}
								errorMessage={props.newInfos.orderForm.defaultLanguage.config.errorMessage}
								onChange={e => { props.inputChangedHandler(e, props.newInfos.orderForm.defaultLanguage.id)} }
							/>
							: <h4 className={classes.defaultLanguage}>{cap(props.newInfos.orderForm.defaultLanguage.config.value)}</h4>
						}
					</div>
           { props.isEditable ?
					<div className={classes.buttonsBlock}>
						<input 
							type="submit" 
							name='edit'
							style={{opacity: props.active ? "1" : 0, transition: "opacity .4s ease-out", transitionDelay: "opacity .4s" }}
							className={props.edit ? classes.save : classes.edit} 
							value={props.edit ? 'SAVE' : 'EDIT'}
							onClick={e => {props.saveNewInfos(e)}}
							disabled={!props.newInfos.formIsValid}
						/>
						{props.edit ?
							<div>
								<div style={{width: "2px", height: "87px",}}></div>
								<input 
									type="submit" 
									name='reset_password'
									className={classes.reset} 
									style={{opacity: props.active ? "1" : 0, transition: ".4s ease-out", transitionDelay: "opacity .4s" }}
									value='RESET PWD' 
									onClick={e => props.sendResetMail(e)}
								/>
							</div>
							: null
						}
					</div>
          : null }
				</div>
        <div className={classes.uploadPhoto}>
          {props.loading === true ?
            <Wave 
              text="Upload..."
              effect="fadeOut" 
              effectDuration={100}
            />
            : null
          }
        </div>
			</div>
		</div>
	)
}

export default InfosDummy;
