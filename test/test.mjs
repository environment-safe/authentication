/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it, fixture } from '@open-automaton/moka';
import { Authentication } from '../src/index.mjs';
const should = chai.should();



describe('@environment-safe/authentication', ()=>{
    fixture('auth-server', {
        host : 'localhost',
        port : '13009+',
    }, (server, config)=>{
        it('can generate a login', async function(){
            this.timeout(40000);
            const authenticator = new Authentication(config);
            try{
                const response = await authenticator.register({
                    phone: '15558675309',
                    username: 'foo',
                    password: 'bar'
                });
                console.log('@@@@@', response);
                const user = await authenticator.authenticate({
                    phone: '15558675309',
                    username: 'foo',
                    password: 'bar'
                });
                console.log('@@@@@2', user);
                should.exist(user);
            }catch(ex){
                console.log(ex);
                should.not.exist(ex);
            }
        });
    });
    // TODO: formal iphone test with simulator (local login)
});

