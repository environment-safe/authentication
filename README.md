authentication
============================

Authentication for the client or server (or both)

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

(()=>{
    const authenticator = new Authentication({
        passkey : {
            host : 'my.passkey.host',
            port : '13009',
        }
    });
    //do something with the authenticator
})();
```

In the server:

```javascript
try{
    await authenticator.serve();
}catch(ex){
    // server crash
}
```

In the client:

```javascript
try{
    const user = await authenticator.authenticate();
}catch(ex){
    // login failures happen here
}
```

This pattern should work across all environments, more granular control will require environment specific hooks.

Testing
-------

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

