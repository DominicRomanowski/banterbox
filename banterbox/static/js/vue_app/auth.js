import Vue from 'vue'
import {router} from './app'
import {store} from './store'


const TOKEN_NAME = 'token_id'

export default {


    authenticate(username, password, remember_me = false) {
        return Vue.http.post('/api/auth/', {username, password})

        // On success
            .then(response => {
                    let token = response.data.token;
                    console.log(token, response)

                    this.storeToken(token, remember_me)
                    return Promise.resolve(response)
                },
                // On error
                err => {
                    this.removeToken()
                    return Promise.reject(err)
                })
    },

    logout(){
        store.reset()
        this.removeToken()
        return Promise.resolve()
    },

    retrieveProfile(){
        return Vue.http.get('/api/user').then(response => {
            store.user.profile_loaded = true
            Object.assign(store.user, response.data)
        }, error => {
            return Promise.reject(error)
        })
    },

    removeToken(){
        sessionStorage.removeItem(TOKEN_NAME)
        localStorage.removeItem(TOKEN_NAME)
        store.user.authenticated = false;
        this.removeTokenHeader()
        console.log('removing token')
    },

    storeToken(token, remember = false){
        if (remember) {
            localStorage.setItem(TOKEN_NAME, token)
        } else {
            sessionStorage.setItem(TOKEN_NAME, token)
        }
        store.user.authenticated = true;

        this.setTokenHeader(token)
        console.log('storing token')
    },


    getToken() {
        let token = localStorage.getItem(TOKEN_NAME)
        if (!token) {
            token = sessionStorage.getItem(TOKEN_NAME)
        }

        // Todo : ping server to check if token is valid, if not then invalidate everything
        if (token) {
            this.setTokenHeader(token)
            store.user.authenticated = true
        }


        return token;
    },

    setTokenHeader(token){
        Vue.http.headers.common['Authorization'] = `Token ${token}`;
    },

    removeTokenHeader(){
        delete Vue.http.headers.common['Authorization'];
    }
}