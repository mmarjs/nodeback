let crypto = require('crypto')
let uuid = require('node-uuid')
let bcrypt = require('bcrypt')

// Create response object
let packRes = (status, content = [], validation = []) =>
  ({
    status: status,
    content: content,
    validation: validation
  })

let dispatchSuc = (res, payload) => res.send(packRes(true, payload))

let dispatchErr = (res, err) => res.send(packRes(false, undefined, err))
// Confirms userId identity
let checkUserConsistency = (userId, response) => userId === response

// Creates loginToken
let createToken = () => {
  let sha = crypto.createHash('sha256')
  sha.update(Math.random().toString())
  return sha.digest('hex')
}

// Creates an uuid
let createUuid = () => uuid.v4()

// Checks that logged user is the same who will be affected
// by the action
let checkPermissions = (loggedUser, userId) =>
  new Promise(
    (resolve, reject) => {
      if (userId === undefined) {
        reject(['Missing userId'])
      }
      if (!checkUserConsistency(loggedUser, userId)) {
        reject(['Permission denied'])
      } else {
        resolve(loggedUser)
      }
    }
  )

// Prepares input object filtering unused values
let prepareInput = (input) =>
  new Promise(
    (resolve, reject) => {
      let obj = {}
      let count = 0
      let key
      for (key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== '') {
          obj[key] = input[key]
          count++
        }
      }
      count > 0
        ? resolve(obj)
        : reject(['No data passed'])
    }
  )

  // Updates the User attributes
let updateUser = (Users, userId, data) => {
  return new Promise(
    (resolve, reject) => {
      Users.find({
        attributes: { exclude: ['encPassword'] },
        where: {
          'userId': userId
        }
      })
        .then((user) => {
          if (user !== null) {
            // Update existing user
            user.updateAttributes(data)
              .then((updatedUser) => {
                let newObj = {}
                let key
                updatedUser = updatedUser.get()
                for (key in updatedUser) {
                  if (key !== 'encPassword') {
                    newObj[key] = updatedUser[key]
                  }
                }
                resolve(newObj)
              })
              .catch((err) =>
                reject([err.message])
              )
          } else {
            reject(['Unable to update'])
          }
        })
        .catch((err) => reject([err.message]))
    }
  )
}

// Checks login token against DB and returns userId
let checkLoginToken = (userLogins, loginToken) =>
  new Promise(
    (resolve, reject) => {
      if (loginToken === undefined) {
        reject(['Missing loginToken'])
      }
      userLogins.findOne({
        attributes: ['userId'],
        where: {
          loginToken: loginToken
        }
      })
      .then((userLogin) => {
        if (userLogin !== null) {
          resolve(userLogin.userId)
        } else {
          reject(['Invalid loginToken'])
        }
      })
      .catch((err) =>
        reject([err.message])
      )
    }
  )

// Checks location existence and diversity
let checkLocations = (Locations, newRide) =>
  new Promise(
    (resolve, reject) => {
      if (newRide.fromId === newRide.toId) {
        reject(['Same origin and destination'])
        return
      }
      Promise.all([
        Locations.findOne({ where: { id: newRide.fromId } }),
        Locations.findOne({ where: { id: newRide.toId } })
      ])
        .then((results) => {
          if (results[0] === null) reject(['Invalid from location'])
          if (results[1] === null) reject(['Invalid to location'])
          resolve(newRide)
        })
        .catch((err) => reject([err.message]))
    }
  )

// Encrypt password using bcrypt with salt
let cryptPass = (plainPass) =>
  new Promise(
    (resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err)
          return
        }
        bcrypt.hash(plainPass, salt, (err, hash) => {
          if (err) {
            reject(err)
          } else {
            resolve(hash)
          }
        })
      })
    }
  )

// Compare user encrypted password with user input
let comparePass = (plainPass, userEncPass) =>
  new Promise(
    (resolve, reject) => {
      bcrypt.compare(plainPass, userEncPass, (err, isMatch) => {
        if (err) {
          reject(err)
          return
        }

        if (isMatch) resolve()
          else reject(['Wrong Password'])
      })
    }
  )


module.exports = {dispatchSuc, dispatchErr, checkUserConsistency, createToken, createUuid, checkPermissions, prepareInput, updateUser, checkLoginToken, checkLocations, cryptPass, comparePass}
