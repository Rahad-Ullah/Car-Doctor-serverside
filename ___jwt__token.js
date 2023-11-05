/**
 * -----------------------------------------
 *?          MAKE API SECURE
 * -----------------------------------------
 * 
 * The person who should have access
 * Concept: 
 * 1. assign two tokens for each person (access token & refresh token)
 * 2. acess token contains: user idetification (email, role etc.) valid for a shorter time.
 * 3. refresh token is used: to recreate an access token that was expired.
 * 4. if refresh is invalid then logout the user.
 */

/**
 * ----------------------------------
 *?            MAKE TOKEN
 * ----------------------------------
 * 
 * -----------SERVER SIDE------------
 * 1. jwt => json web token
 * 2. install --> npm install jsonwebtoken
 * 3. generate a token by using jwt.sign
 * 4. create api set to cookie. (httpOnly, secure, sameSite)
 * 5. cors setup origin and credentials true
 * 
 * -----------CLIENT SIDE------------
 * 1. axios request withCredentials true
 * 2. 
 */

/**
 * -----------------------------------
 *?          SECURE API CALLS
 * -----------------------------------
 * -----------SERVER SIDE-----------
 * 1. install cookie parser and use it as a middleware
 * 2. get cookies by using req.cookies
 * 
 * -----------CLIENT SIDE-----------
 * 1. make api call using axios withCredentails: true or credentials include while using fetch.
 */