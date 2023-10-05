// a minimal server that using sqlite for credential storage
import { Fixture } from '@open-automaton/moka';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Authentication } from '../../src/index.mjs';
import sqlite3 from 'sqlite3';
const sqlite = sqlite3.default;



export class TestFixture extends Fixture{
    async createFixture(){
        const app = express();
        app.use(express.static("public"));
        this.options.port = Fixture.makePort(this.options.port);
        const sessionOptions = {
            secret: ( this.options.cookieSecret || 'DEFAULT_COOKIE_SECRET' ),
            cookie: { maxAge: 269999999999 },
            saveUninitialized: true,
            resave: true
        };
        if(app.get('env') === 'production'){
            app.set('trust proxy', 1);
            sessionOptions.cookie.secure = true;
        }else{
            sessionOptions.cookie.secure = false;
        }
        app.use(cors());
        app.use(session(sessionOptions));
        app.use(bodyParser.json());
        const db = new sqlite3.Database(':memory:');
        let initPromise = null;
        const store = {
            create : async (user)=>{
                return await new Promise((resolve, reject)=>{
                    try{
                        //db.serialize(() => {
                            try{
                                const stmt = db.prepare(
                                    'INSERT INTO user VALUES (?, ?, ?)', 
                                    async (err)=>{
                                        try{
                                            if(err && err.message.indexOf(`no such table: user`) !== -1){
                                                console.log('INNIT', (new Error()).stack)
                                                await store.init();
                                                const newUser = await store.create(user);
                                                resolve(newUser);
                                            }else{
                                                if(err) return reject(err);
                                                resolve(user);
                                            }
                                        }catch(ex){
                                            reject(ex);
                                        }
                                    }
                                );
                                stmt.run(Object.keys(user).map((key) => user[key] ));
                                stmt.finalize();
                            }catch(ex){
                                reject(ex);
                            }
                        //});
                    }catch(ex){
                        reject(err);
                    }
                });
            },
            lookup : async (user)=>{
                return await new Promise((resolve, reject)=>{
                    db.serialize(async () => {
                        try{
                            const suffix = Object.keys(user).map((key) => `${key} = ${
                                (typeof user[key] === 'string')? `"${user[key]}"` : user[key]
                            }` ).join(' AND ') || '1';
                            const selector = `SELECT * from user WHERE ${suffix}`;
                            console.log('selector', selector);
                            db.all(selector, async (err, users)=>{
                                if(err && err.message.indexOf(`no such table: user`) !== -1){
                                    await store.init();
                                    resolve(await store.lookup(user));
                                }else{
                                    if(err) return reject(err);
                                    resolve(users[0]);
                                }
                            });
                        }catch(ex){
                            if(ex.message.indexOf(`no such table: user`) !== -1){
                                await store.init();
                                resolve(await store.lookup(user));
                            }else{
                                reject(ex);
                            }
                        }
                    });
                });
            },
            remove : async (user)=>{
                db.serialize(() => {
                    const suffix = Object.keys(user).map((key) => `${key} = ${
                        typeof user[key] === 'string'?`"${user[key]}"`:user[key]
                    }` ).join(' AND ') || '1';
                    db.run(`DELETE from user WHERE ${suffix}`);
                });
            },
            init : async ()=>{
                if(!initPromise){
                    initPromise = new Promise((resolve, reject)=>{
                            db.run(`CREATE TABLE user (
                                username TEXT, 
                                password TEXT,
                                email TEXT
                            )`, (err)=>{
                                console.log('INITIALIZED', err, (new Error()).stack )
                                if(err) reject(err);
                                resolve();
                            });
                    });
                }
                return await initPromise;
            },
        };
        const authenticator = new Authentication(this.options, store);
        authenticator.serve(app);
        return await new Promise((resolve, reject)=>{
            try{
                const server = app.listen(this.options.port, (err) => {
                    if(err) return reject(err);
                    resolve(server);
                });
            }catch(ex){
                reject(ex);
            }
        });
    }
}