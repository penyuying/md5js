# MD5

a JavaScript function for hashing messages with MD5.

## Installation

You can use this package on the server side as well as the client side.

### [Node.js](http://nodejs.org/):

~~~
npm install md5js
~~~


## API

~~~ javascript
md5(message)
~~~



## Usage

~~~ javascript
import { md5 } from 'md5js';

console.log(md5('message'));//16位
console.log(md5('message',32));//32位
~~~

This will print the following

~~~
7d8fd50ed642340b
78e731027d8fd50ed642340b7c9a63b3
~~~