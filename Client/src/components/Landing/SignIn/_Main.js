import React, { useState, useEffect } from 'react';
import axios from 'axios';

import SignInDummy from './SignInD';
const formDatas = require('./signIn.json');
const resetFormDatas = require('./reset.json');

const SignInSmurt = (props) => {
  /* Infos taped into sign up form */
	const [infos, setInfos] = useState(() => {
    /* transforms the datas from the json into an array for mapping */
		let orderForm = [];
		for (let identifier in formDatas) {
			orderForm.push(formDatas[identifier]);
		}
		return ({
			orderForm: orderForm,
			formIsValid: false
		});
  });
  /* Determines whether to display an error depending on if the user changed the concerned input since it first appeared */
  const [error, setError] = useState(false);
  /* Determines whether to show the reset input and change the submit button or not */
  const [resetButton, setResetButton] = useState(false);
  /* The form for the username reset input */
  const [resetForm, setResetForm] = useState(() => {
    /* transforms the datas from the json into an array for mapping */
		let orderForm = [];
		for (let identifier in resetFormDatas) {
			orderForm.push(resetFormDatas[identifier]);
		}
		return ({
			orderForm: orderForm,
			formIsValid: false
		});
  });
  /* Determines whether the buttons should be disabled while waiting for a response from the db or not. */
  const [loading, setLoading] = useState(false);

  /* Hook equivalent of componentDidMount() & componentWillUnmount() combined */
  useEffect(() => {
    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        submit(e);
      }
    }, false);
    /* returned function will be called on component unmount */
    return () => {
      if (document.getElementById('resetDiv')) {
        document.getElementById('resetDiv').style.display = 'none';
        document.getElementById('username').disabled = false;
        document.getElementById('password').disabled = false;
      }
      setError(false);
      setResetButton(false);
      setLoading(false);
      setInfos(() => {
        let orderForm = [];
        for (let identifier in formDatas) {
          orderForm.push(formDatas[identifier]);
        }
        return ({
          orderForm: orderForm,
          formIsValid: false
        });
      });
      setResetForm(() => {
        let orderForm = [];
        for (let identifier in resetFormDatas) {
          orderForm.push(resetFormDatas[identifier]);
        }
        return ({
          orderForm: orderForm,
          formIsValid: false
        });
      });
    }
  }, []);

  /* Little fix to reset the resetButton in case user click it and then go to register and then come back */
  useEffect(() => {
    if (props.formActive.signIn === false) {
      setResetButton(false);
      setError(false);
      setLoading(false);
      setInfos(() => {
        let orderForm = [];
        for (let identifier in formDatas) {
          orderForm.push(formDatas[identifier]);
        }
        return ({
          orderForm: orderForm,
          formIsValid: false
        });
      });
      setResetForm(() => {
        let orderForm = [];
        for (let identifier in resetFormDatas) {
          orderForm.push(resetFormDatas[identifier]);
        }
        return ({
          orderForm: orderForm,
          formIsValid: false
        });
      });
    }
  }, [props.formActive.signIn]);

  /* 
    onClick on reset button that changes the style to make a new input 
    appear with a nice transition.
  */
  const resetPwd = (e) => {
    if (resetButton === false ) {
      const buttonBox = document.getElementById('buttonBox');
      buttonBox.style.transition = '.4s';
      buttonBox.style.top = '130%';
      document.getElementById('resetButton').style.opacity = '.6';
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      usernameInput.style.transition = '.4s';
      passwordInput.style.transition = '.4s';
      usernameInput.style.opacity = '.3';
      passwordInput.style.opacity = '.3';
      setResetButton(true);
    } else {
      const buttonBox = document.getElementById('buttonBox');
      buttonBox.style.transition = '.4s';
      buttonBox.style.top = '80%';
      document.getElementById('resetButton').style.opacity = '1';
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      usernameInput.style.transition = '.4s';
      passwordInput.style.transition = '.4s';
      usernameInput.style.opacity = '1';
      passwordInput.style.opacity = '1';
      setResetButton(false);
    }
  }

  /*
    onClick on the Enter/Submit button that sends the username to 
    the db in order for it to find the right user and send a link 
    for changing password via email.
  */
  const sendResetMail = (e) => {
    e.preventDefault();
    setLoading(true);
    setResetForm((prevState) => {
      let updatedOrderForm = resetForm.orderForm;
      updatedOrderForm[0].config.touched = false;
      return ({ orderForm: updatedOrderForm, formIsValid: prevState.formIsValid });
    });

    const username = resetForm.orderForm[0].config.value;
    
    axios.get(`/API/users/sendReset/${username}`)
      .then((res) => {
        if (res.data.success === true && res.data.payload.dest.length >= 1){
          setError('MAIL SENT');
          setLoading(false);
        }
        else {
          setError('ERROR');
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }

  /* Protection against spamming button sugar-covered with a bit of style */
  useEffect(() => {
    console.log(document.getElementById('submitButton'));
    if (loading === true && document.getElementById('submitButton')) {
      document.body.style.cursor = 'wait';
      document.getElementById('submitButton').disabled = true;
    } else if (document.getElementById('submitButton')) {
      document.body.style.cursor = 'default';
      if (document.getElementById('submitButton')
        && resetForm.formIsValid === true 
        && error === false) {
          document.getElementById('submitButton').disabled = false;
      }
    }
  }, [loading, error, resetForm.formIsValid]);

  /*  
    Checks, based on the rules predefined for each input in the json file, 
    if the value entered by the user in the form is valid 
  */
	const checkValidity = (value, rules, inputIdentifier, state) => {
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
			else {
				resolve(isValid);
			}
		});
	}

  /*
    Updates live the datas for the form according to what the user is tiping 
    and determines whether to display error messages, loading messages, or 
    the disabling of the submit button.
  */
	const inputChangedHandler = (e, inputIdentifier) => {

    let updatedOrderForm = {};
    if (inputIdentifier === "usernameReset") {
      updatedOrderForm = { ...resetForm.orderForm };
    } else updatedOrderForm = { ...infos.orderForm };

		let intermediate = [];
		for (let index in updatedOrderForm){
			if (updatedOrderForm[index].id === inputIdentifier) {
				intermediate = updatedOrderForm[index];
			}
		}
		const updatedFormElement = intermediate.config;
		updatedFormElement.value = e.target.value;
		checkValidity(updatedFormElement.value, updatedFormElement.validation, inputIdentifier, infos)
			.then((response) => {
				updatedFormElement.valid = response;
				updatedFormElement.touched = true;
				intermediate.config = updatedFormElement;
				let newOrderForm = [];
				for (let index in updatedOrderForm) {
					if (updatedOrderForm[index].id === inputIdentifier) {
						newOrderForm.push(intermediate); 
					}
					else {
						newOrderForm.push(updatedOrderForm[index]);
					}
				}
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
        }
        inputIdentifier === "usernameReset" ?
          setResetForm({ orderForm: newOrderForm, formIsValid: formIsValid })
          : setInfos({ orderForm: newOrderForm, formIsValid: formIsValid });
			})
			.catch((e) => {
				updatedFormElement.valid = false;
				updatedFormElement.touched = true;
				updatedFormElement.errorMessage = e;
				intermediate.config = updatedFormElement;
				let newOrderForm = [];
				for (let index in updatedOrderForm) {
					if (updatedOrderForm[index].id === inputIdentifier) {
						newOrderForm.push(intermediate); 
					}
					else {
						newOrderForm.push(updatedOrderForm[index]);
					}
				}
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
				}
        if (inputIdentifier === "usernameReset") {
          setResetForm({ orderForm: newOrderForm, formIsValid: formIsValid });
        } else setInfos({ orderForm: newOrderForm, formIsValid: formIsValid });
			});
  }

  /* 
    Parse the infos gathered in the form to send to the db that return us a JWT to store in the localStorage
    along with the username if there are valid. Once the server has responded, it logs us in immediatly.
  */
	const submit = e => {
    e.preventDefault();
    setLoading(true);

    let user = {};
    for (let formElementIdentifier in infos.orderForm) {
      if (infos.orderForm[formElementIdentifier].config.touched === true && formElementIdentifier === '0') {
        user['username'] = infos.orderForm[formElementIdentifier].config.value;
      }
      if (infos.orderForm[formElementIdentifier].config.touched === true && formElementIdentifier === '1') {
        user['password'] = infos.orderForm[formElementIdentifier].config.value;
      }
    }
    
    if (!localStorage.getItem('JWT') && (infos.formIsValid || (infos.orderForm[0].config.valid && infos.orderForm[1].config.valid))) {
      axios.post(`/API/auth/login`, user)
        .then((res) => {
          let token = { "token": res.data.payload };
          if (token !== null && res.data.success) {
            localStorage.setItem('JWT', JSON.stringify(token));
            localStorage.setItem('username', res.data.username);
            setLoading(false);
            props.logIn();
            setInfos(() => {
              let orderForm = [];
              for (let identifier in formDatas) {
                formDatas[identifier].config.value = '';
                orderForm.push(formDatas[identifier]);
              }
              return ({ orderForm: orderForm, formIsValid: false })
            });
          }
          else if (res.data.success === false) {
            setLoading(false);
            setInfos((prevState) => { return ({ orderForm: prevState.orderForm, formIsValid: false }); })
            setError(true);
          }
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };
  
  /* 
    Listener on the error constant and the username & usernameReset input that checks whether 
    the user changed the value since the error's been first displayed or not.*/
 
  // useEffect(() => {
  //   if (error === true && infos.orderForm[1].config.touched === true) {
  //     setError(false);
  //   }
  //   if (error === 'ERROR' && resetForm.orderForm[1].config.touched === true) {
  //     setError(false);
  //   }
  // }, [resetForm.orderForm, infos.orderForm, error]);
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  <=><=> Seems to provoc some bugs when your sign-in infos are wrong <=><=>     */
	return (
		<SignInDummy
      resetPwd={resetPwd}
      sendResetMail={sendResetMail}
			inputChangedHandler={inputChangedHandler}
			onClick={props.onClick}
      signIn={props.whichForm}
      submit={submit}
      infos={infos}
      error={error}
      active={props.formActive.signIn}
      resetButton={resetButton}
      resetForm={resetForm}
		/>
	)
}

export default SignInSmurt;
