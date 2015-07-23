`pre` -> `$body` *(preloaded in head)* Global variables and UI-affecting JS: starting DOM manipulation, ...  
###### order:
  * settings.js
  * head.js
  * *I.js
  * tail.js

`post` -> `$body` Main file, business logic for commonly accessed pages.  

`ext` -> `$body` Included only in rarely accessed pages: everything that requires above normal privileges, banned page,  ...  
