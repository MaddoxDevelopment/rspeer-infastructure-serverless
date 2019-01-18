const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
global.fetch = require('node-fetch');
const assert = require('chai').assert;
const axios = require('axios');
const Redis = require("../connections/redis");
const {promisify} = require('util');

const pool = {
    UserPoolId: process.env.cognito_user_pool_id,
    ClientId: process.env.cognito_client_id
};

const getUserById = async (id) => {
    return convertToUserObject(await promisify(getProvider().adminGetUser({
        Username: id,
        UserPoolId: pool.UserPoolId
    })));
};

const searchByUsername = async (username) => {
    const res = await promisify(getProvider().listUsers({
        UserPoolId: pool.UserPoolId,
        Filter: `preferred_username ^= "${username}"`
    }));
    return convertToUserObject(res.Users);
};

const getProvider = () => {
    return new AWS.CognitoIdentityServiceProvider({
        accessKeyId: process.env.cognito_key,
        secretAccessKey: process.env.cognito_private,
        region: process.env.cognito_region
    });
};

const login = async (email, password) => {
    return new Promise((resolve, reject) => {
        assert.exists(email);
        assert.exists(password);
        const details = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password,
        });
        const userPool = new AmazonCognitoIdentity.CognitoUserPool(pool);
        const cognito = new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
        cognito.authenticateUser(details, {
            onSuccess: function (result) {
                const response = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().getToken(),
                    email: result.idToken.payload.email,
                    userId: result.idToken.payload.sub,
                    username: result.idToken.payload.preferred_username,
                    groups: result.getAccessToken().payload["cognito:groups"]
                };
                resolve(response)
            },
            onFailure: function (err) {
                reject(err)
            },
        });
    })
};

const decode = async (token) => {
    const region = 'us-east-1';
    const keys = await Redis.getAndSet(`cognito-jwks-${region}`, async () => {
        const res = await axios(`https://cognito-idp.${region}.amazonaws.com/${pool.UserPoolId}/.well-known/jwks.json`);
        return res.data && res.data.keys ? res.data.keys : null;
    });
    const pems = {};
    for (let i = 0; i < keys.length; i++) {
        const key_id = keys[i].kid;
        const modulus = keys[i].n;
        const exponent = keys[i].e;
        const key_type = keys[i].kty;
        const jwk = {kty: key_type, n: modulus, e: exponent};
        pems[key_id] = jwkToPem(jwk);
    }
    const decodedJwt = jwt.decode(token, {complete: true});
    if (!decodedJwt) {
        throw {error: "Unauthorized."};
    }
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
        throw {error: "Unauthorized."};
    }
    const verify = new Promise((res, rej) => {
        jwt.verify(token, pem, function (err, payload) {
            if (err) {
                rej(err);
            } else {
                res({
                    email: payload.email,
                    userId: payload.sub,
                    username: payload.preferred_username,
                    groups: payload['cognito:groups']
                })
            }
        });
    });
    return await verify;
};

const convertToUserObject = (value) => {
    if (!value) {
        return null;
    }
    const map = (user) => {
        const attributes = user.UserAttributes || user.Attributes;
        return {
            email: (attributes.find(w => w.Name === "email") || {}).Value,
            userId: user.Username,
            username: (attributes.find(w => w.Name === "preferred_username") || {}).Value,
            balance: (attributes.find(w => w.Name === "custom:balance") || {}).Value,
            instances: (attributes.find(w => w.Name === "custom:allowed_instances") || {}).Value
        }
    };
    if (Array.isArray(value)) {
        return value.map(v => map(v))
    }
    return map(value);
};

const CognitoService = {
    login,
    getUserById,
    searchByUsername,
    decode
};

module.exports = CognitoService;

