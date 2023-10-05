"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.strToarrayBuffer = exports.arrayBufferToStr = exports.Authentication = void 0;
var _browserOrNode = require("browser-or-node");
var crypto = _interopRequireWildcard(require("crypto"));
var subtle = _interopRequireWildcard(require("subtle"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/* global Buffer:false, PublicKeyCredential:false */
/*
import { isBrowser, isJsDom } from 'browser-or-node';
import * as mod from 'module';
import * as path from 'path';
let internalRequire = null;
if(typeof require !== 'undefined') internalRequire = require;
const ensureRequire = ()=> (!internalRequire) && (internalRequire = mod.createRequire(import.meta.url));
//*/

const getRandomBytes = (typeof self !== 'undefined' && (self.crypto || self.msCrypto) ? function () {
  // Browsers
  var crypto = self.crypto || self.msCrypto,
    QUOTA = 65536;
  return function (n) {
    var a = new Uint8Array(n);
    for (var i = 0; i < n; i += QUOTA) {
      crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
    }
    return a;
  };
} : function () {
  // Node
  return crypto.randomBytes;
})();
const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};
exports.arrayBufferToStr = arrayBufferToStr;
const strToarrayBuffer = str => {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

/**
 * A JSON object
 * @typedef { object } JSON
 */

/*const meta = {
    name : 'OUTSIDEr.INdustries',
    id: 'authentication.outsider.industries',
}*/
exports.strToarrayBuffer = strToarrayBuffer;
const meta = {
  name: 'OUTSIDEr.INdustries',
  id: 'localhost'
};
class Authentication {
  constructor(options = {}, store) {
    this.options = options;
    this.store = store;
  }
  async getChallenge(criteria) {
    if (this.challengeData) return this.challengeData;
    const response = await fetch(`http://${this.options.host}:${this.options.port}/challenge`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(criteria)
    });
    this.challengeData = await response.json();
    return this.challengeData;
  }
  async register(data, challenge) {
    // eslint-disable-next-line no-async-promise-executor
    return await new Promise(async (resolve, reject) => {
      //const body =
      try {
        if (_browserOrNode.isBrowser || _browserOrNode.isJsDom) {
          if (window.PublicKeyCredential) {
            // we're in a browser with WebAuthN support
            if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
              const challengeResult = await this.getChallenge({
                username: data.username
              });
              const credential = await navigator.credentials.create({
                publicKey: {
                  challenge: Uint8Array.from(challengeResult.challenge, c => c.charCodeAt(0)),
                  rp: {
                    name: meta.name,
                    id: meta.id
                  },
                  user: {
                    id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
                    name: data.username || data.email,
                    displayName: data.name || data.username || data.email
                  },
                  pubKeyCredParams: [{
                    alg: -7,
                    type: 'public-key'
                  }],
                  authenticatorSelection: {
                    authenticatorAttachment: 'cross-platform'
                  },
                  timeout: 60000,
                  attestation: 'direct'
                }
              });
              resolve(credential);
            } else {
              //browser only supports hardware, like YubiKey
              console.log('Hardware only mode currently unsupported.');
            }
          } else {
            // fallback to something else
            console.log('Not supported.');
          }
        } else {
          const response = await fetch(`http://${this.options.host}:${this.options.port}/register`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
              username: data.username,
              password: data.password,
              email: data.email,
              phone: data.phone
            })
          });
          const responseData = await response.json();
          resolve(responseData.user);
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }
  async authenticate(data) {
    // eslint-disable-next-line no-async-promise-executor
    return await new Promise(async (resolve, reject) => {
      //const body = 
      try {
        if (_browserOrNode.isBrowser || _browserOrNode.isJsDom) {
          if (window.PublicKeyCredential) {
            // we're in a browser with WebAuthN support
            if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
              const challengeResult = await this.getChallenge({
                username: data.username
              });
              const credential = await navigator.credentials.get({
                publicKey: {
                  challenge: Uint8Array.from(challengeResult.challenge, c => c.charCodeAt(0)),
                  rp: {
                    name: meta.name,
                    id: meta.id
                  },
                  user: {
                    id: Uint8Array.from('UZSL85T9AFC', c => c.charCodeAt(0)),
                    name: data.username || data.email,
                    displayName: data.name || data.username || data.email
                  },
                  pubKeyCredParams: [{
                    alg: -7,
                    type: 'public-key'
                  }],
                  authenticatorSelection: {
                    authenticatorAttachment: 'cross-platform'
                  },
                  timeout: 60000,
                  attestation: 'direct'
                }
              });
              resolve(credential);
            } else {
              //browser only supports hardware, like YubiKey
              console.log('HARDWARE');
              resolve();
            }
          } else {
            // fallback to something else
            console.log('Not supported.');
            resolve();
          }
        } else {
          //generate a new session id
          const response = await fetch(`http://${this.options.host}:${this.options.port}/challenge`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
              username: data.username
            })
          });
          const challengeData = await response.json();
          //generate a new session id
          const getClientData = () => {
            return strToarrayBuffer(JSON.stringify({
              type: 'webauthn.get',
              challenge: challengeData.challenge,
              origin: 'localhost'
            }));
          };
          const clientData = getClientData();
          const finishResponse = await fetch(`http://${this.options.host}:${this.options.port}/finish`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
              clientDataJSON: clientData,
              username: data.username
            })
          });
          const responseData = await finishResponse.json();
          if (responseData && responseData.status && responseData.status === 'failed') {
            throw new Error(responseData.message);
          }
          resolve();
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }
  async serve(appInstance) {
    const userControl = this.store;
    // userControl.lookup
    // userControl.create 
    // userControl.remove 
    appInstance.post('/challenge', (req, res) => {
      req.session.challenge = null;
      let credentialRequest = {
        status: 'success',
        challenge: getRandomBytes(32),
        rp: {
          name: meta.id
        }
      };
      req.session.challenge = credentialRequest.challenge.toString();
      res.json(credentialRequest);
    });
    appInstance.post('/register', async (req, res) => {
      if (!req.body || !req.body.username) {
        res.json({
          status: 'failed',
          message: 'Malformed Registration Request'
        });
        return;
      }
      let username = req.body.username;
      let user = null;
      if (user = userControl.lookup({
        username
      })) {
        if (user.registered) {
          res.json({
            status: 'failed',
            message: 'Username Already In Use'
          });
          return;
        } else {
          await userControl.remove({
            username
          });
        }
      }
      req.session.challenge = null;
      req.session.user = null;
      user = await userControl.create({
        username
      });
      let credentialRequest = {
        status: 'success',
        challenge: getRandomBytes(32),
        rp: {
          name: meta.id
        },
        user: user
      };
      req.session.challenge = credentialRequest.challenge.toString();
      req.session.user = user;
      res.json(credentialRequest);
    });
    appInstance.post('/finish', async (req, res) => {
      try {
        if (!req.body || !req.body.clientDataJSON) {
          res.json({
            status: 'failed',
            message: 'Malformed Registration/Authentication Finish Request'
          });
          return;
        }
        let request = req.body;
        let user;
        if (request.username) {
          user = await userControl.lookup({
            username: request.username
          });
          if (!user) {
            res.json({
              status: 'failed',
              message: 'No unregistered user found. API error.'
            });
            return;
          }
        } else if (req.session.user) {
          user = req.session.user;
        } else {
          res.json({
            status: 'failed',
            message: 'No user found. API error.'
          });
          return;
        }
        let clientData = JSON.parse(new Buffer.from(request.clientDataJSON, 'base64').toString());
        let oldChallenge = new Buffer.from(clientData.challenge, 'base64');
        if (oldChallenge.toString() !== req.session.challenge) {
          res.json({
            status: 'failed',
            message: 'Returned challenge doesn\'t match issued challenge'
          });
          return;
        }
        if (clientData.origin !== `https://${meta.id}`) {
          res.json({
            status: 'failed',
            message: 'Returned challenge doesn\'t match issued challenge'
          });
          return;
        }
        let verified;
        //let authInfo;
        if (request.attestationObject !== undefined) {
          /*
          authInfo = helpers.getAuthInfo(request);
          verified = true;
          user.authInfo = authInfo;
          user.registered = true;
          db.updateUserById(user.id, user);
          */
        } else if (request.authenticatorData !== undefined) {
          const lookedupUser = userControl.lookup({
            username: user.username
          });
          if (!lookedupUser.registered) {
            res.json({
              status: 'failed',
              message: 'User does not exist'
            });
            return;
          }
          let signature = new Buffer.from(request.signature, 'base64');
          let retreivedPublicKey = new Buffer.from(user.authInfo.publicKey, 'base64');
          let hashedCData = crypto.createHash(request.clientDataJSON);
          let toSign = new Buffer.concat([new Buffer.from(request.authenticatorData, 'base64'), hashedCData]);
          //TODO: replace/refactor subtle
          //      Ideally 
          let pk = await subtle.importKey('raw', retreivedPublicKey, {
            name: 'ECDSA',
            namedCurve: 'P-256'
          }, false, ['verify']);
          verified = subtle.verify({
            name: 'ECDSA',
            hash: 'SHA-256'
          }, pk, signature, toSign);
        } else {
          res.json({
            status: 'failed',
            message: 'Attestation response type is unknown'
          });
          return;
        }
        if (verified) {
          req.session.loggedIn = true;
          req.session.user = user;
          res.json({
            status: 'success'
          });
          return;
        } else {
          res.json({
            status: 'failed',
            message: 'Can\'t authenticate signature'
          });
          return;
        }
      } catch (ex) {
        console.log('^^^^', ex);
      }
    });
  }
}
exports.Authentication = Authentication;