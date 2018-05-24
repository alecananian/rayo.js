<p align="center">
  <img src="https://raw.githubusercontent.com/GetRayo/Assets/master/Images/Cover.png" alt="Rayo" />
</p>

[![NSP Status](https://nodesecurity.io/orgs/rayo/projects/b16aa9a6-c080-44e1-9c91-77609aa498be/badge)](https://nodesecurity.io/orgs/rayo/projects/b16aa9a6-c080-44e1-9c91-77609aa498be)
[![Greenkeeper badge](https://badges.greenkeeper.io/GetRayo/rayo.js.svg)](https://greenkeeper.io/)
[![Build status](https://travis-ci.org/GetRayo/rayo.js.svg?branch=master)](https://travis-ci.org/GetRayo/rayo.js)
[![Codacy](https://api.codacy.com/project/badge/Grade/d392c578eaaa4860823b8e4f9dadda63)](https://www.codacy.com/app/aichholzer/rayo.js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=GetRayo/rayo.js&amp;utm_campaign=Badge_Grade)
[![CodeFactor](https://www.codefactor.io/repository/github/aichholzer/modellr/badge)](https://www.codefactor.io/repository/github/aichholzer/modellr)
[![Coverage Status](https://coveralls.io/repos/github/GetRayo/rayo.js/badge.svg?branch=master)](https://coveralls.io/github/GetRayo/rayo.js?branch=master)


```
Everything in the -modern- web is arguable,
however we are convinced that Rayo is the fastest framework.
In the world.
Period.
```

## In a nutshell

- Really fast (yeah, like really fast).
- Less than 150 lines of code, with routing and all.


## Install

```
$> npm i rayo
```


## Use

```js
const rayo = require('rayo');

rayo({ port: 5050 })
  .get('/hello/:user', (req, res) => res.end(`Hello ${req.params.user}`))
  .start();
```

#### With multiple handlers

```js
const rayo = require('rayo');

// "age" handler
const age = (req, res, step) => {
  req.age = 21;
  step();
};

// "name" handler
const name = (req, res, step) => {
  req.name = `Super ${req.params.user}`;
  step();
};

rayo({ port: 5050 })
  .get('/hello/:user', age, name, (req, res) => {
    res.end(
      JSON.stringify({
        age: req.age,
        name: req.name
      })
    );
  })
  .start();
```

#### A note on handlers

`handler` functions accept an [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage) (a.k.a `req`), a [ServerResponse](https://nodejs.org/dist/latest-v9.x/docs/api/http.html#http_class_http_serverresponse) (a.k.a `res`) and a `step through` (a.k.a `step`) function. `step()` is optional and it may be used to move the program's execution logic to the next handler in the stack.

`step()` may also be used to invoke an error at any time. See [error handling](#error-handling).

> **Note:** An error will be thrown if `step()` is called on an empty stack.

Each `handler` exposes Node's core ServerResponse (`res`) object and it's your responsibility to deal with it accordingly.

As a convenience, `Rayo` binds a smart `send()` function to the ServerResponse (`res`) each handler receives, therefore you may `res.send()` responses.

`res.send()` will try to guess the content type and send the appropriate headers, status code and body, it will also end the response.

```js
const rayo = require('rayo');

rayo({ port: 5050 })
  .get('/', (req, res) => {
    res.send({
      message: 'I am .json reply.',
      timestamp: +new Date()
    });
  })
  .start();
```

> **Note:** `res.send()` will incur a performance hit due to the headers being written with every response, regardless of them being intended or not.

#### Handler signature
```js
/**
 * @param {object}   req
 * @param {object}   res
 * @param {function} [step]
 */
const fn = (req, res, step) => {
  // Your custom logic.
}
```

#### Error handling

## API

```
Please keep in mind that:
"Your code, your errors."¹
- It's your responsibility to deal with them accordingly.
```

> ¹ `Rayo` is WIP, so you may encounter actual errors that need to be dealt with. If so, please point them out to us via a `pull request`. 👍

#### rayo(options = {})
```
@param   {object} [options]
@returns {Rayo}
```

* `options.port` _{number}_
	* Listen on this port for incoming connections.
	* If port is omitted or is 0, the operating system will assign an arbitrary, unused, port.

* `options.host` _{string}_
	* Listen on this host for incoming connections.
	* If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available, or the unspecified IPv4 address (0.0.0.0) otherwise.

* `options.server` _{http.Server}_
	* An instance [http.Server](https://nodejs.org/api/http.html#http_class_http_server). `Rayo` will attach to this.
	* `Default:` A new instance of [http.Server](https://nodejs.org/api/http.html#http_class_http_server).

* `options.notFound` _{function}_

  > Invoked when undefined paths are requested.

  ```js
  /**
   * @param {object} req
   * @param {object} res
   */
  const fn = (req, res) => {
    // Your custom logic.
  }
  ```

  `Default:` A "Page not found." message with a `404` status code.<br />

  ```js
  const rayo = require('rayo');

  const options = {
    port: 5050,
    notFound: (req, res) => {
      res.end('The requested page is magically gone.');
    }
  };

  /**
   * Visit `/hello` to trigger the `notFound` method.
   */
  rayo(options)
    .get('/', (req, res) => res.end('Thunderstruck, GET'))
    .start();
  ```

* `options.onError` _{function}_

  > Invoked when step() is called with an argument.

  ```js
  /**
   * @param {*}        error
   * @param {object}   req
   * @param {object}   res
   * @param {function} [step]
   */
  const fn = (error, req, res, step) => {
    // Your custom logic.
  }
  ```

  `Default:` The error message (the argument) with a `400` status code.<br />

  ```js
  const rayo = require('rayo');

  const options = {
    port: 5050,
    onError: (error, req, res) => {
      res.end(`Here's your error: ${error}`);
    }
  };

  /**
   * Visit `/` to trigger the `onError` method.
   */
  rayo(options)
    .get('/', (req, res, step) => step('Thunderstruck, error'))
    .start();
  ```


#### .verb(path, ...handlers)
```
@param   {string}   path
@param   {function} handlers - Any number, comma separated.
@returns {rayo}
```

> `Rayo` exposes all HTTP verbs as instance methods.

> Requests which match the given verb and path will be routed through the specified handlers.

This method is basically an alias of the [`.route`](#routeverb-path-handlers) method, with the difference that the `verb` is defined by the method name itself.

```js
const rayo = require('rayo');

/**
 * Setup a path ('/') on the specified HTTP verbs.
 */
rayo({ port: 5050 })
  .get('/', (req, res) => res.end('Thunderstruck, GET'))
  .head('/', (req, res) => res.end('Thunderstruck, HEAD'))
  .start();
```

#### .all(path, ...handlers)
```
@param   {string}   path
@param   {function} handlers - Any number, comma separated.
@returns {rayo}
```

> Requests which match any verb and the given path will be routed through the specified handlers.

```js
const rayo = require('rayo');

/**
 * Setup a path ('/') on all HTTP verbs.
 */
rayo({ port: 5050 })
  .all('/', (req, res) => res.end('Thunderstruck, all verbs.'))
  .start();
```

#### .through(...handlers)
```
@param   {function} handlers - Any number, comma separated.
@returns {rayo}
```

> All requests, any verb and any path, will be routed through the specified handlers.

```js
const rayo = require('rayo');

// "age" handler
const age = (req, res, step) => {
  req.age = 21;
  step();
};

// "name" handler
const name = (req, res, step) => {
  req.name = 'Rayo';
  step();
};

rayo({ port: 5050 })
  .through(age, name)
  .get('/', (req, res) => res.end(`${req.age} | ${req.name}`))
  .start();

```

#### .route(verb, path, ...handlers)
```
@param   {string}   verb
@param   {string}   path
@param   {function} handlers - Any number, comma separated.
@returns {rayo}
```

> Requests which match the given verb and path will be routed through the specified handlers.

```js
const rayo = require('rayo');

rayo({ port: 5050 })
  .route('GET', '/', (req, res) => res.end('Thunderstruck, GET'))
  .start();
```

#### .bridge(path)
```
@param   {string} path - The URL path to which verbs should be mapped.
@returns {bridge}
```
> Route one path through multiple verbs and handlers.

A `bridge` instance exposes all of Rayo's routing methods ([.through](#throughhandlers), [.route](#routeverb-path-handlers), [.verb](#verbpath-handlers) and [.all](#allpath-handlers)). You may create any number of bridges and Rayo will automagically take care of mapping them.

```js
const rayo = require('rayo');

const server = rayo({ port: 5050 });

/**
 * Bridge the `/home` path to the `GET` and `HEAD` verbs.
 */
server
  .bridge('/home')
  .get((req, res) => res.end('You are home, GET'))
  .head((req, res) => res.end('You are home, HEAD'));

/**
 * Bridge the `/game` path to the `POST` and `PUT` verbs.
 */
server
  .bridge('/game')
  .post((req, res) => res.end('You are at the game, POST'))
  .put((req, res) => res.end('You are at the game, PUT'));

const auth = (req, res, step) => {
  req.isAuthenticated = true;
  step();
};

const session = (req, res, step) => {
  req.hasSession = true;
  step();
};

/**
 * Bridge the `/account` path to the `GET`, `POST` and `PUT` verbs
 * and through two handlers.
 */
server
  .bridge('/account')
  .through(auth, session)
  .get((req, res) => res.end('You are at the account, GET'))
  .post((req, res) => res.end('You are at the account, POST'))
  .put((req, res) => res.end('You are at the account, PUT'));

server.start();
```

#### .start(callback)
```
@param   {function} [callback] - Invoked on the server's `listening` event.
@returns {http.Server}
```
> Starts `Rayo` -Your server is now listening for incoming requests.

> `Rayo` will return the server address with the callback, if one was provided. Useful, for example, to get the server port in case no port was specified in the options.

```js
const rayo = require('rayo');

rayo({ port: 5050 });
  .get((req, res) => res.end('Thunderstruck'))
  .start((address) => {
    console.log(`Rayo is up on port ${address.port}`);
  });
```

## How does it compare?

Here are some of the top contenders. Please note that these results are only meant as raw performance indicators. Your application's logic, which is what makes most applications slow, may not see great performance gains from using one framework over another.

#### Node V.8.11.2
 &nbsp; | Version | Requests/s | Latency | Throughput/Mb
------- | ------: | ---------: | ------: | ------------:
Rayo    | 0.5.10  | 36534.4    | 2.66    | 4.04
Polka   | 0.4.0   | 35988.81   | 2.71    | 4.01
Fastify | 1.5.0   | 31374.4    | 3.11    | 4.69
Express | 4.16.3  | 29793.6    | 3.28    | 3.29
Hapi    | 17.5.0  | 19944      | 4.93    | 2.99


Run on your own hardware; clone this repository, install its dependencies and run `npm run bench`. Optionally, you may also define your test's parameters:
```
$> npm run bench -- -u http://localhost:5050 -c 1000 -p 25 -d 10
```
* `-u` (_url_) -Defaults to `http://localhost:5050`
* `-c` (_connections_) -Defaults to `100`
* `-p` (_pipelines_) -Defaults to `10`
* `-d` (_duration_) -Defaults to `5` (seconds)

> Please note that these results ~~may~~ will vary on different hardware.


## Contribute
```
$> fork https://github.com/GetRayo/rayo.js
$> Do your thing.
$> Submit a PR.
```


## Acknowledgements

:clap: `Thank you` to [everyone](https://github.com/nodejs/node/graphs/contributors) who has made Nodejs possible and to all community members actively contributing to it.


## License

[MIT](https://github.com/GetRayo/rayo.js/blob/master/LICENSE)
