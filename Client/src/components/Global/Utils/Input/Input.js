import React from 'react';
import cx from 'classnames';

import classes from './Input.module.css'

const input = (props) => {
	let inputElement = null;
	const inputClasses = [classes.inputElement];
	let validationError = [];

	if (props.invalid && props.shouldValidate && props.touched) {
		inputClasses.push(classes.Invalid);
		// console.log(props.errorMessage)
		// console.log(props.errorMessage.length)
		if (Array.isArray(props.errorMessage) === true) {
			for (let i = 0; i < props.errorMessage.length; i++) {
				validationError.push(<p className={classes.ValidationError} key={i}>{props.errorMessage[i]}</p>);
			}
			// console.log(validationError);
		}
		else {
			validationError = <p className={classes.ValidationError}>{props.errorMessage}</p>;
		}
	}

	switch (props.elementType) {
		case ( 'input' ) :
			inputElement = 
        <input
				  id={props.id}
				  name={props.id}
				  style={props.style}
				  className={cx(inputClasses.join(' '), "inputValidation", classes.inputStyle)} 
				  {...props.elementConfig}
				  defaultValue={props.value}
          onChange={props.onChange} 
          disabled={props.disabled ? true : false}
        />;
			break;
		case ( 'file' ) :
			inputElement = <input
				id={props.id}
				name={props.name}
				style={props.style}
				className={inputClasses.join(' ')} 
				{...props.elementConfig}
				onChange={props.onChange} 
			/>;
			break;
		case ( 'radio' ) :
      /* Dans le SmartComponent, le contenu de "state.elementConfig:" 
			devra être remplacé par "options: [ {value: '', displayValue:''}, ... ]" */
			inputElement = 
			<div>
				{props.elementConfig.options.map(option => {
				return (<div key={option.id}>
					<input
						type={props.elementConfig.type}
						className={`${inputClasses.join(' ')} ${classes.radio}`}
						id={option.id}
						value={option.value}
						checked={props.checked === option.value}
						onChange={props.onChange} 
						name="option"
					/>
					<label htmlFor={option.id} className={classes.label}>{option.displayValue}</label>
				</div>)
				})}
			</div>;
			break;
		case ( 'textarea' ):
			inputElement = <textarea 
				className={inputClasses.join(' ')} 
				{...props.elementConfig}
				defaultValue={props.value}
				onChange={props.onChange} />;
			break;
		case ( 'select' ):
			/* Dans le SmartComponent, le contenu de "state.elementConfig:" 
			devra être remplacé par "options: [ {value: '', displayValue:''}, ... ]" */
			inputElement = (
				<select 
					className={`${inputClasses.join(' ')} ${classes.select} ${classes.selectLanguage}`} 
					value={props.value}
					onChange={props.onChange} >
					{props.elementConfig.options.map(option => (
						<option key={option.value} value={option.value} >
							{option.displayValue}
						</option>
					))}
				</select>
			);
			break;
		default:
			inputElement = <input 
				className={inputClasses.join(' ')} 
				{...props.elementConfig}
				defaultValue={props.value}
				onChange={props.onChange} />;
	}

  // const realClassName = props.newSourroundStyle !== null ? props.newSourroundStyle : classes.Input;
	return (
		<div className={classes.Input}>
			{props.label ?
			<label className={classes.label}>{props.label}</label>
			: null 
      }
      {props.validationError ?
        validationError[0] ?
          validationError[0].props.children === "Username already taken" ? validationError : null
          : null
        : null
      }
			{inputElement}
		</div>
	)
};

export default input;
