# Client

*** BEFORE USAGE ****
```
To properly test this engine, plz follow the following instructions:
- npm i everywhere (obviously)
- go to API the folder
- set environment to production in .env file
- run the command 'npm run update' (this WILL take a while, you know its over when you see   
    index ######  Starting server ##### +0ms
    models:ServerClass *-- Listening on port 4000... --* )
- if something goes wrong here, call me. but it should not.
- ctrl + C
- Set the environement back to development.
- run 'npm run dev' as usual
- here you go.
```

***LIBRARY USAGE***
```
- go to the searchEngine folder
- in App.js set type='movie' or type='show' in the library props.
- npm i should have been done since you read the instructions above
- npm start
- play around in this ugly library.
```

***Suggestions***
```

Right now basic functionalities for a working library are here (even if ugly), except for the component that shows and switch pages.
i trust you already got that covered, and you can see in the library component that a setPage function is declared but never used.
Shouldnt been to difficult to make this work with your components. once the said page variable is set(default 1) the queries and everything follows.

The search bar works, but it would be more opti to add a search button and to search only when either that button or the enter button are pressed.

```

***NOTES***
```

The routes i added in both routes/MovieLibrary and routes/ShowLibrary are NOT protected by the auth middleware.
This is obviously intended, i recommend adding the auth middleware on top of it when everything else works fine.

I know this doesnt seem like much for the front but i ended up working on the back more than the front to make this simple tool work.
Any question ? messenger/ or just call.

```

