authentication
============================

Authentication for the client or server (or both) via WebAuthN.

Usage
-----

Use the local OS authentication

```javascript
import { Authentication } from '@environment-safe/authentication';

(()=>{
    const authenticator = new Authentication({
        passkey : 'native' // use native password store
    });
    try{
        const user = await authenticator.authenticate();
    }catch(ex){
        // login failures happen here
    }
})();
```

Provide your own authentication

```javascript
import { Authentication } from '@environment-safe/authentication';
```

In the server:

```javascript
try{
    const authenticator = new Authentication({
        host : 'my.passkey.host',
        port : '13009',
    }, {
        create : async (user)=>{
            // create a record
        },
        lookup : async (user)=>{
            // lookup a single record
        },
        remove : async (user)=>{
            // remove a single record
        },
        init : async ()=>{
            // initialize the DB
        },
    });
    await authenticator.serve((err, credentials)=>{
        // return false, an error or metadata associated with success
    });
}catch(ex){
    // server crash
}
```

In the client:

```javascript
try{
    const authenticator = new Authentication({
        host : 'my.passkey.host',
        port : '13009',
    });
    const user = await authenticator.authenticate();
}catch(ex){
    // login failures happen here
}
```

For now the use cases are simple, but eventually it may be possible to run servers *from* clients.

Server side authentication is a work in progress and needs a little work. 

This pattern should work across all environments, more granular control will require environment specific hooks.

Testing
-------
Unfortunately this can't be fully automated to test on all browsers [due to a missing feature](https://github.com/microsoft/playwright/issues/7276) in playwright, once this is done, we'll add support for webkit and firefox.

Run the es module tests to test the root modules
```bash
npm run import-test
```
to run the same test inside the browser:

```bash
npm run browser-test
```
to run the same test headless in chrome:
```bash
npm run headless-browser-test
```

to run the same test inside docker:
```bash
npm run container-test
```

Run the commonjs tests against the `/dist` commonjs source (generated with the `build-commonjs` target).
```bash
npm run require-test
```

Development
-----------
All work is done in the .mjs files and will be transpiled on commit to commonjs and tested.

If the above tests pass, then attempt a commit which will generate .d.ts files alongside the `src` files and commonjs classes in `dist`

