import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ResetDummy from './ResetD';
import formDatas from './reset.json';

const ResetSmurt = (props) => {
  /* Form with input validation */
  const [newPwd, setNewPwd] = useState({ orderForm: formDatas, formIsValid: false });
  /* If the link has already been used, display an error */
  const [error, setError] = useState(false);
  const [linkReset, setLinkReset] = useState(null);

  /* On component mounted, checks whether the link has already been used or nots */
  useEffect(() => {
    axios.get(`/API/users/infos/${props.params._id}`, { headers: { "x-auth-token": props.params.token } })
      .then((res) => {
        // console.log(res);
        if (res.data.result.linkReset === null) setError(true);
        else setLinkReset(res.data.result.linkReset);
      })
      .catch((err) => console.log(err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*  
    Checks, based on the rules predefined for each input in the json file, 
    if the value entered by the user in the form is valid 
  */
	const checkValidity = (value, rules, inputIdentifier) => {
		return new Promise (function (resolve, reject) {
			let isValid = true;
			let errorMessages = [];

			if (!rules) {
				resolve(true);
			}
			if (rules.required === true) {
				isValid = (value.trim() !== "") && isValid;
				if (inputIdentifier !== undefined && value.trim() === "")
				{	
					errorMessages.push("This field is required");
					reject(errorMessages);
				}
			}
			if (!rules.required) {
				if ((value.trim() === "")) {
					resolve(true);
				}
			}
			if (rules.minLength) {
				isValid = (value.length >= rules.minLength) && isValid;
				if (inputIdentifier !== undefined && (value.length < rules.minLength))
				{	
					errorMessages.push("This field requires at least " + rules.minLength + " characters");
					reject(errorMessages);
				}
			}
			if (rules.maxLength) {
				isValid = (value.length <= rules.maxLength) && isValid;
				if (inputIdentifier !== undefined && (value.length > rules.maxLength))
				{	
					errorMessages.push("This field must not exceed " + rules.maxLength + " characters");
					reject(errorMessages);
				}
			}
			if (rules.regex) {
				isValid = RegExp(unescape(rules.regex), 'g').test(value) && isValid;
				if (inputIdentifier !== undefined && (RegExp(unescape(rules.regex), 'g').test(value) === false))
				{	
					errorMessages.push(rules.rule);
					reject(errorMessages);
				}
			}
			if(!rules.db && !rules.checkEmail) {
				resolve(isValid);
      }
      else resolve(isValid);
		});
	}

  /*
    Updates live the datas for the form according to what the user is tiping 
    and determines whether to display error messages, loading messages, or 
    the disabling of the submit button.
  */
	const inputChangedHandler = (e, inputIdentifier) => {
		const updatedOrderForm = {
			...newPwd.orderForm
    };
    const updatedFormElement = updatedOrderForm[inputIdentifier].config;
		updatedFormElement.value = e.target.value;
		checkValidity(updatedFormElement.value, updatedFormElement.validation, inputIdentifier)
			.then((response) => {
				// console.log(response);
				updatedFormElement.valid = response;
				updatedFormElement.touched = true;
				updatedOrderForm[inputIdentifier].config = updatedFormElement;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
        }
				setNewPwd({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			})
			.catch((e) => {
				// console.log(e);
				updatedFormElement.valid = false;
				updatedFormElement.touched = true;
				updatedFormElement.errorMessage = e;
				updatedOrderForm[inputIdentifier].config = updatedFormElement;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
				}
				setNewPwd({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			});
  }
  
  /* Parse the JWT extracted from localStorage to extract the infos in a readable way */
  const parseJwt = (token) => {
		if (token !== null) {
			let base64Url = token.split('.')[1];
			let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(''));
			return (JSON.parse(jsonPayload));
		}
		else {
			return ({data: {}, exp: 0, iat: 0, token: "" });
		}
	};

  /* 
    Parse the JWT found in the url params to send merged with new values to db.
    If there is no errors (meaning the link isn't dead), it signs in the user immediatly.
  */
  const submit = (e) => {
    e.preventDefault();
    // console.log('submit() triggered');

    let newDatas = {};
    if (newPwd.formIsValid === true) {
      const token = parseJwt(props.params.token);
      // console.log("password: " + newPwd.orderForm.password.config.value);
      // console.log("cPasswd: " + newPwd.orderForm.password.config.value);
      if (newPwd.formIsValid) {
        newDatas = {
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
          email: token.email,
          photo: token.photo,
          defaultLanguage: token.defaultLanguage,
          password: newPwd.orderForm.password.config.value,
          linkReset: linkReset,
        }
      }
    }

    // console.log(newDatas);
    if (newPwd.formIsValid === true && Object.keys(newDatas).length === 8 && error === false) {
      // console.log('sending to db...');
      axios.put(`/API/users/update_password/${props.params._id}`, newDatas, { headers: { "x-auth-token": props.params.token } })
        .then((res) => {
          // console.log(res);
          if (res.data.success) {
            // console.log('success');
            let token = {"token": res.data.payload};
            localStorage.setItem('JWT', JSON.stringify(token));
            localStorage.setItem('username', res.data.username);
            props.setUrlParams(false);
            window.location.href = '/';
          }
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <ResetDummy
      inputChangedHandler={inputChangedHandler}
      submit={submit}
      newPwd={newPwd}
      error={error}
      {...props}
    />
  );
}

export default ResetSmurt;
