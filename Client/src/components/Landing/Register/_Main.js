import React, { useState, useEffect } from 'react';
import axios from 'axios';

import RegisterDummy from './RegisterD';
const formDatas = require('./register.json');

const RegisterSmurt = (props) => {
  /* Get photo selected from computer, parse it and displays it */
  const [file, setFile] = useState(false);
  /* Infos taped into register form */
	const [infos, setInfos] = useState({
		orderForm: formDatas,
		formIsValid: false,
  });
   /* Determines whether a new photo is being uploaded to the cloud or not */
  const [loading, setLoading] = useState(false);
  /* Determines whether to display an error depending on if the user changed the concerned input since it first appeared */
  const [error, setError] = useState(false);

  /*
    Get the file/img selected by the user on his computer and parse it in
    order to display it and send it to the cloud.
  */
	const handleImageChange = e => {
		e.preventDefault();
	
		if (e.target.files && e.target.files[0]) {
			let reader = new FileReader();
			setFile({ file: e.target.files[0], imagePreviewUrl: null });
			
			reader.onloadend = (e) => {
				setFile(prevState => {
					return ({
						file: prevState.file,
						imagePreviewUrl: e.target.result
					});
				});
			}
      reader.readAsDataURL(e.target.files[0]);
		}
	}

  /* 
    Listener on the file constant to detect if the user chose a picture. It then sends 
    it to the cloud and give us back a link to the photo that we then send to db and 
    use to display the photo on the site. 
  */
	useEffect(() => {
    if (file.imagePreviewUrl && file.imagePreviewUrl.includes('data:image/') === true) {
      setLoading(true);
      const uploadImgToCloud = () => {
        let formData = new FormData();
        formData.append('image', file.file);
        axios.post('/API/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
          .then((res) => {
            let newInfos = infos.orderForm;
            let newPhotoElem = newInfos.photo;
            newPhotoElem.config.value = res.data.url;
            newPhotoElem.config.touched = true;
            newPhotoElem.config.valid = true;
            newInfos.photo = newPhotoElem; 
            let formIsValid = true;
            // eslint-disable-next-line no-unused-vars
            for (let inputIdentifier in newInfos) {
              formIsValid = newInfos[inputIdentifier].config.valid && formIsValid;
            }
            setInfos({ orderForm: newInfos, formIsValid: formIsValid });
            setLoading(false);
          });
      };
      uploadImgToCloud();
    }
  }, [file]);

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
			...infos.orderForm
    };
    const updatedFormElement = updatedOrderForm[inputIdentifier].config;
		updatedFormElement.value = e.target.value;
		checkValidity(updatedFormElement.value, updatedFormElement.validation, inputIdentifier, infos)
			.then((response) => {
				updatedFormElement.valid = response;
				updatedFormElement.touched = true;
				updatedOrderForm[inputIdentifier].config = updatedFormElement;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
        }
				setInfos({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			})
			.catch((e) => {
				updatedFormElement.valid = false;
				updatedFormElement.touched = true;
				updatedFormElement.errorMessage = e;
				updatedOrderForm[inputIdentifier].config = updatedFormElement;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
				}
				setInfos({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			});
	}

  /* 
    Parse the infos gathered in the form to send to the db that return us a JWT to store in the localStorage
    along with the new user username. Once it's done, it signs us up immediatly.
  */
	const submit = e => {
		e.preventDefault();

    let newProfil = {};
		for (let identifier in infos.orderForm) {
      if (infos.orderForm[identifier].config.touched === true) {
        if (identifier === 'cPasswd' && infos.orderForm.password.config.value === infos.orderForm.cPasswd.config.value) {
          break ;
        }
        newProfil[identifier] = infos.orderForm[identifier].config.value;
      }
    }
		if (infos.orderForm.photo.config.value === '') {
			setInfos(prevState => {
				return { orderForm: prevState.orderForm, formIsValid: false };
			})
    }
    
    if (infos.formIsValid && infos.orderForm.photo.config.value !== '') {
      axios.post(`/API/users/`, newProfil)
        .then((res) => {
          let token = {"token": res.data.token};
          if (token !== null && res.data.success && res.data.username) {
            localStorage.setItem('JWT', JSON.stringify(token));
            localStorage.setItem('username', res.data.username);
            setInfos((prevState) => {
              let newOrderForm = prevState.orderForm;
              for (let identifier in formDatas) {
                newOrderForm[identifier].config.value = '';
              }
              return ({ orderForm: newOrderForm, formIsValid: false })
            });
            props.logIn();
          }
          else if (res.data.success === false) {
            setInfos((prevState) => {
              let newOrderForm = prevState.orderForm;
              newOrderForm.username.config.touched = false;
              return ({ orderForm: prevState.orderForm, formIsValid: false });
            })
            setError(res.data.payload);
          }
        })
    }
  }
  
  /* 
    Listener on the error constant and the username input that checks whether 
    the user changed the value since the error's been first displayed or not.
  */
  useEffect(() => {
    if (error && infos.orderForm.username.config.touched === true) {
      setError(false);
    }
  }, [infos.orderForm.username.config.touched, error]);

	return (
		<RegisterDummy
			handleImageChange={handleImageChange}
			inputChangedHandler={inputChangedHandler}
			submit={submit}
			register={props.whichForm}
			infos={infos}
			active={props.formActive.register}
      file={file}
      loading={loading}
      error={error}
		/>
	)
}

export default RegisterSmurt;
