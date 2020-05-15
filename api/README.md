# Hypertube
Hypertube project 42 School

**SINCE OAUTH**
```
From Now On, Client is served by our node server.
Meaning for you : 
  - to launch our App, just run 'npm run dev' in api folder. (we should probably rename this later)
  - if you wannna change stuff in our client, then you'll have to 'npm run build' in the client folder,
      then copy the content of the 'client/build' folder into the api/public folder.
  *** PRO TIP : from api folder : ln -s ../Client/build public.
    after this everytime you run 'npm run build' in the client, the server will restart thanks to nodemon.
  
  There might be a way around this at leat for dev enviroment, but i couldnt crack that yet.
```

**BASIC ROUTES**
```
      ROUTES                    |         CREDENTIALS          |    DESCRIPTION 
                                |                              |
POST  /users                    |                              | Create new user in db
      /movies                   |                              | Create new movie in db

GET   /users                    |                              | GET user list
      /users/:username          |                              | GET target user profile
      /movies                   |                              | GET movie list
      /movie/:title             |                              | GET target movie informations

PUT   /users/:username          |                              | UPDATE target user profile
      /movie/:title             |                              | UPDATE target movie informations

DEL   /users/:username          |         ADMIN                | DELETE target user profile
      /movie/:title             |         ADMIN                | DELETE target movie informations
```
                                                    
**ROUTE CREATION EXAMPLE**
```
-----------userRoute.js-------------------------

const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', [OptionalMiddleWares1, OptionalMiddleWare2], ErrorWrapper(async (req, res) => {
    const result = await userlist();
    return res.status(200).json({
      success: true,
      payload: result,
    });
}));

router.get('/:username', [OptionalMiddleWare1, OptionalMiddleWare2], ErrorWrapper(async (req, res) => {
    const result = await userProfile(req.params.username);
    return res.status(200).json({
      success: true,
      payload: result,
    });
}));

/*
// more routes
*/

module.exports = router;

-------------------------------------------------

-----------index.js------------------------------


const express = require('express');
const app = express();
const userRoute = require('userRoute.js')

app.use('/api/users', userRoute);

-------------------------------------------------

```
