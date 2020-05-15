import React, { useState, useEffect } from 'react';
import axios from 'axios';

import InfosDummy from './InfosD';

const formDatas = require('./Infos.json');

const UpdateUserInfos = (props) => {
  /* Infos taped into register form */
  const [newInfos, setNewInfos] = useState({ orderForm: formDatas, formIsValid: true });
  /* Datas extracted from localStorage about user */
  const [refDatas, setRefDatas] = useState(null);
  /* Determines whether user is editing his/her profil or not */
  const [edit, setEdit] = useState(false);
  /* Get photo selected from computer, parse it and displays it */
  const [file, setFile] = useState(false);
  /* List of all user registered in db */
  const [usernameList, setUsernameList] = useState(null);
  /* Determines whether a new photo is being uploaded to the cloud or not */
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  /* 
    Equivalent of componentDidMount() that initialize the username list and parse the JWT stored 
    in localStorage in a readable way into refDatas for the initialisation of the form.
  */
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('JWT'));
    const tmp = localStorage.getItem('JWT');
    const decoded = parseJwt(tmp);
    if( decoded && (decoded.googleId || decoded.fortyTwoId)) setIsEditable(false) 
    axios.get(`/API/users/all_users/username`, { headers: { "x-auth-token": token.token } })
      .then((res) => {
        if (res.data.success) {
          let usernameList = [];
          for (let user in res.data.payload) {
            usernameList.push(res.data.payload[user].username);
          }
          setUsernameList(usernameList);
          const localData = localStorage.getItem('JWT');
          let token = parseJwt(localData);
          if (token !== null && token.firstName) {
            setRefDatas(token);
            const updatedOrderForm = { ...newInfos.orderForm };
            for (let valueStored in token) {
              for (let identifier in newInfos.orderForm) {
                if (valueStored === identifier) {
                  updatedOrderForm[identifier].config.value = token[identifier];
                  updatedOrderForm[identifier].config.valid = true;
                }
              }
            }
            /* Initialize the edit profil form with the informations on the user that are currently registered in the db */
            setNewInfos((prevState) => { return {formIsValid: prevState.formIsValid, orderForm: updatedOrderForm}; });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      /* Checks whether the username chosen is already taken or not */
			if(!rules.db) {
				resolve(isValid);
			}
			if (rules.db === true) {
				if (usernameList.includes(value) === false) {
					isValid = true && isValid;
					resolve(isValid);
				}
				else if (usernameList.includes(value) === true && refDatas.username !== value) {
					errorMessages.push("Username already taken");
					reject(errorMessages);
        }
        else if (refDatas.username === value) {
          isValid = true && isValid;
          resolve(isValid);
        }
			}
		});
	}

  /*
    Updates live the datas for the form according to what the user is tiping 
    and determines whether to display error messages, loading messages, or 
    the disabling of the submit button.
  */
	const inputChangedHandler = (e, inputIdentifier) => {
		const updatedOrderForm = {
			...newInfos.orderForm
		};
		const intermediate = {
			...updatedOrderForm[inputIdentifier]
		}
		const updatedFormElement = intermediate.config;
		updatedFormElement.value = e.target.value;
		checkValidity(updatedFormElement.value, updatedFormElement.validation, inputIdentifier, newInfos)
			.then((response) => {
				updatedFormElement.valid = response;
        updatedFormElement.touched = true;
        updatedFormElement.errorMessage = "";
				intermediate.config = updatedFormElement;
				updatedOrderForm[inputIdentifier] = intermediate;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
				}
				setNewInfos({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			})
			.catch((e) => {
				updatedFormElement.valid = false;
				updatedFormElement.touched = true;
				updatedFormElement.errorMessage = e;
				intermediate.config = updatedFormElement;
				updatedOrderForm[inputIdentifier] = intermediate;
				let formIsValid = true;
				// eslint-disable-next-line no-unused-vars
				for (let inputIdentifier in updatedOrderForm) {
					formIsValid = updatedOrderForm[inputIdentifier].config.valid && formIsValid;
				}
				setNewInfos({ orderForm: updatedOrderForm, formIsValid: formIsValid });
			});
	}
  
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
    Listener on the file constant to detect any change, meaning that the user chose a new 
    picture. It then send it to the cloud and give us back a link to the photo that we then
    send to db and use to display the photo on the site. 
  */
	useEffect(() => {
    if (file.imagePreviewUrl && file.imagePreviewUrl.includes('data:image/') === true) {
      setLoading(true);
      setNewInfos((prevState) => { return { orderForm: prevState.orderForm, formIsValid: false }});
      const uploadImgToCloud = () => {
        let formData = new FormData();
        formData.append('image', file.file);
        axios.post('/API/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
          .then((res) => {
            let infosChanged = newInfos.orderForm;
            let newPhotoElem = infosChanged.photo;
            newPhotoElem.config.value = res.data.url;
            newPhotoElem.config.touched = true;
            newPhotoElem.config.valid = true;
            infosChanged.photo = newPhotoElem; 
            let formIsValid = true;
            // eslint-disable-next-line no-unused-vars
            for (let inputIdentifier in infosChanged) {
              formIsValid = infosChanged[inputIdentifier].config.valid && formIsValid;
            }
            setNewInfos({ orderForm: infosChanged, formIsValid: formIsValid });
            setLoading(false);
          })
          .catch((err) => console.log(err));
      };
      uploadImgToCloud();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  /* 
    Checks the infos changed by the user and send an update the new infos merged with the old
    ones to the db that return us a new JWT to replace in the localStorage.
  */
	const saveNewInfos = e => {
    e.preventDefault();
		setEdit(prevState => !prevState);

		let profilChanges = {};
		for (let formElementIdentifier in newInfos.orderForm) {
      profilChanges[formElementIdentifier] = newInfos.orderForm[formElementIdentifier].config.value;
    }

    if (newInfos.formIsValid && edit === true) {
      const token = JSON.parse(localStorage.getItem('JWT'));
      axios.put(`/API/users/${refDatas._id}`, profilChanges, { headers: { "x-auth-token": token.token} })
        .then((res) => {
          let token = {"token": res.data.token};
          if (token !== null && res.data.success) {
            localStorage.setItem('JWT', JSON.stringify(token));
            localStorage.setItem('username', res.data.payload.username);
            setRefDatas(res.data.payload);
          }
        })
        .catch((err) => console.log(err))
    }
  }
  
  const sendResetMail = (e) => {
    console.log("coucou")
    e.preventDefault();
    setLoading(true);

    const username = localStorage.username;
    
    axios.get(`/API/users/sendReset/${username}`)
      .then((res) => {
        console.log("request done")
        if (res.data.success === true && res.data.payload.dest.length >= 1){
          console.log("Bravo " + res)
          setLoading(false);
          setEdit(false)
        }
        else {
          setLoading(false);
          console.log("Fail " + res)
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  }

	return (
    <InfosDummy
      isEditable={isEditable}
      saveNewInfos={saveNewInfos}
      handleImageChange={handleImageChange}
      inputChangedHandler={inputChangedHandler}
      edit={edit}
      file={file}
      loading={loading}
      newInfos={newInfos}
      active={props.active}
      sendResetMail={sendResetMail}
      ScreenWidth={props.ScreenWidth}
      ScreenHeight={props.ScreenHeight}
      onClick={props.onClick}
    />
  )
}

export default UpdateUserInfos;
