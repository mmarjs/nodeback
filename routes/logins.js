let request = require('request-promise')
let { UserSocialNetworkAccounts, UserLogins, Users } = require('../models/index')
let { dispatchSuc, dispatchErr, checkUserConsistency, createToken, createUuid, checkLoginToken, prepareInput, updateUser, cryptPass } = require('../tools/tools')
let env = process.env.NODE_ENV || 'development'
let { fbAppId, fbAppSecret } = require('../config/config.json')[env]

// /login/social route
let socialLogin = (req, res, next) => {
  let socialUserId = req.query.userid
  let socialauthToken = req.query.authToken

  // Prepares Facebook url
  let prepareFBUrl = (authToken) => {
    const FB_APP_ID = fbAppId
    const FB_APP_SECRET = fbAppSecret
    const FB_URL = 'https://graph.facebook.com/debug_token'
    return `${FB_URL}?input_token=${authToken}&access_token=${FB_APP_ID}|${FB_APP_SECRET}`
  }

  // Checks if sent auth token is valid
  let isValidToken = () =>
    new Promise(
      (resolve, reject) => {
        let url = prepareFBUrl(socialauthToken)
        request(url)
          .then((body) => {
            let data = JSON.parse(body).data
            if (data.error) {
              // Malformed access token
              reject([data.error.message])
            }
            checkUserConsistency(socialUserId, data.user_id)
              ? resolve()
              : reject(['Invalid access token'])
          })
          .catch((err) => reject(err))
      }
    )

  // Checks if user is returning or new
  let isExistingUser = () =>
    new Promise(
      (resolve, reject) => {
        UserSocialNetworkAccounts.findOne({
          attributes: ['userId'],
          where: {
            accountUsername: socialUserId
          }
        })
          .then((userSocialLogin) => {
            let response = userSocialLogin === null
              ? { returning: false }
              : { returning: true, userId: userSocialLogin.userId }
            resolve(response)
          })
          .catch((err) =>
            reject([err.message])
          )
      }
    )

  // Creates or updates UserLogin
  let newUserLogin = (userId, deviceId = null) =>
    new Promise(
      (resolve, reject) => {
        let loginToken = createToken()
        UserLogins.find({
          where: {
            'userId': userId,
            'deviceId': deviceId
          }
        })
          .then((loginRecord) => {
            if (loginRecord !== null) {
              // Update existing record
              loginRecord.updateAttributes({
                loginToken: loginToken
              })
                .then((updatedRecord) => dispatchSuc(res, { loginToken: updatedRecord.loginToken, userId: userId, returning: true })
                )
                .catch((err) => dispatchErr(res, [err]))
            } else {
              // Create new record
              deviceId = createUuid()
              UserLogins.create({
                deviceId: deviceId,
                userId: userId,
                loginToken: loginToken
              })
                .then((user) => dispatchSuc(res, { loginToken: user.loginToken, userId: userId, returning: false }))
                .catch((err) => dispatchErr(res, [err]))
            }
          })
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  // Creates a new SocialNetworkLogin
  let createNewSocialLogin = (userId) =>
    new Promise(
      (resolve, reject) => {
        UserSocialNetworkAccounts.create({
          userId: userId,
          accountKey: 'FB_ACC',
          accountUsername: socialUserId
        })
          .then(newUserLogin(userId))
          .catch((err) => dispatchSuc(res, [err.message]))
      }
    )

  // Creates a new User
  let createNewUser = () =>
    new Promise(
      (resolve, reject) => {
        let newId = createUuid()
        Users.create({
          userId: newId
        })
          .then((newUser) => createNewSocialLogin(newUser.userId))
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  // This Promises chain firstly checks if
  // the supplied authToken is valid,
  // if the User is new or returning
  // then creates it or refreshes its login accordingly
  // If any promise gets rejected the whole chain stops
  // and an error is sent back
  isValidToken()
    .then(() =>
      isExistingUser()
        .then((resp) => {
          if (resp.returning) {
            // Returning user
            newUserLogin(resp.userId, req.query.deviceId)
          } else {
            // New User
            createNewUser()
          }
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /login/register route
let register = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let queries = req.query

  // Encrypt password (if present)
  let preparePass = (results) =>
    new Promise(
      (resolve, reject) => {
        if (results[1].encPassword === undefined) {
          resolve(results)
        } else {
          cryptPass(results[1].encPassword)
            .then((encPass) => {
              results[1].encPassword = encPass
              resolve(results)
            })
            .catch((err) => reject([err]))
        }
      }
    )
  // This Promises chain starts with two Promises
  // the former validates the loginToken,
  // the latter parses the request and returns an User obj
  // then the User is updated
  // If any promise gets rejected the whole chain stops
  // and an error is sent back
  Promise.all([checkLoginToken(UserLogins, loginToken), prepareInput(queries)])
    .then((results) =>
      preparePass(results)
        .then((results) => {
          updateUser(Users, results[0], results[1])
            .then((result) => dispatchSuc(res, result))
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

module.exports = {socialLogin, register}
