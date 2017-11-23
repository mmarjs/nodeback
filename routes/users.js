var { Users, UserLogins, UserCars, CarModels, Locations, RideAlerts, RegularRide, RideRiders } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, checkPermissions, prepareInput, updateUser, createUuid, checkLocations, cryptPass } = require('../tools/tools')

// /users/:id route
var profile = (req, res, next) => {
  let loginToken = req.headers.logintoken

  // Gets User object
  let getUser = (userId) =>
    new Promise(
      (resolve, reject) =>
      Users
        .findById(userId, {
          attributes: { exclude: ['encPassword'] }
        })
        .then((user) => {
          user !== null
            ? dispatchSuc(res, user)
            : dispatchErr(res, ['User not found'])
        }).catch((err) => dispatchErr(res, [err.message]))
    )

  // The Promises chain firstly validates the loginToken then
  // if an userId is passed in the `params` this user is
  // searched and returned (if present), otherwise
  // the User object of the user that made the request is returned
  // userId in the `params` always comes first than the one
  // of whom made the request
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      let uuid = req.params.id !== ''
        ? req.params.id
        : self
      getUser(uuid)
    })
    .catch((err) => dispatchErr(res, err))
}

// /users/:id (PUT) route
var editProfile = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let queries = req.query
  let userId = req.params.id

  // Encrypt password (if present)
  let preparePass = (newInfo) =>
    new Promise(
      (resolve, reject) => {
        if (newInfo.encPassword === undefined) {
          resolve(newInfo)
        } else {
          cryptPass(newInfo.encPassword)
            .then((encPass) => {
              newInfo.encPassword = encPass
              resolve(newInfo)
            })
            .catch((err) => reject([err]))
        }
      }
    )
  // The Promises chain firstly validates the loginToken then
  // checks that the logged user is actually trying to edit itself
  // and not others. If all of the Promises above get resolved
  // the query parameters are parsed and the User is updated
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      checkPermissions(self, userId)
        .then(() =>
          prepareInput(queries)
            .then((newInfo) => {
              preparePass(newInfo)
                .then((newInfo) => {
                  updateUser(Users, userId, newInfo)
                    .then((result) => dispatchSuc(res, result))
                    .catch((err) => dispatchErr(res, err))
                })
                .catch((err) => dispatchErr(res, err))
            })
            .catch((err) => dispatchErr(res, err))
        )
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /users/{:id}/car route
let addCar = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewCar = req.body
  rawNewCar.userId = req.params.id

  // Check modelId validity
  let checkModel = (newCar) =>
    new Promise(
      (resolve, reject) => {
        CarModels.findOne({
          attributes: ['name'],
          where: {
            id: newCar.modelId
          }
        })
          .then((model) => {
            model === null
              ? reject(['Invalid modelId'])
              : resolve(newCar)
          })
          .catch((err) => reject([err.message]))
      }
    )

  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      checkPermissions(loggedUserId, rawNewCar.userId)
        .then(() =>
          prepareInput(rawNewCar)
            .then((newCar) =>
              checkModel(newCar)
                .then((newCar) =>
                  UserCars.create(newCar)
                    .then(() => dispatchSuc(res, []))
                    .catch((err) => dispatchErr(res, [err.message]))
                )
                .catch((err) => dispatchErr(res, err))
            )
            .catch((err) => dispatchErr(res, err))
        )
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /users/{:id}/ridealerts (POST) route
let addRideAlert = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewAlert = req.body
  rawNewAlert.userId = req.params.id
  rawNewAlert.fromId = req.body.from === undefined
    ? dispatchErr(res, 'No from passed')
    : req.body.from
  rawNewAlert.toId = req.body.to === undefined
  ? dispatchErr(res, 'No to passed')
  : req.body.to

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually creates the ride alert
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      prepareInput(rawNewAlert)
        .then((newAlert) => {
          newAlert.id = createUuid()
          checkLocations(Locations, newAlert)
            .then((newAlert) =>
              RideAlerts.create(newAlert)
                .then(() => dispatchSuc(res, []))
                .catch((err) => dispatchErr(res, [err.message]))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
}

// /users/{:id}/ridealert (DELETE) route
let removeRideAlert = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let userId = req.params.id

  // This Promises chain validates loginToken and then
  // proceeds to check if the user has a ride alert,
  // if so it deletes it
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      getAndAction({ userId: userId }, 'delete', self)
        .then(() => dispatchSuc(res, []))
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /users/{:id}/ridealert (PUT) route
let editRideAlert = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewAlert = req.body
  rawNewAlert.fromId = req.body.from === undefined
    ? dispatchErr(res, 'No from passed')
    : req.body.from
  rawNewAlert.toId = req.body.to === undefined
  ? dispatchErr(res, 'No to passed')
  : req.body.to

  // Prepares the input and checks the locations
  // for existance and diversity
  let prepareAndCheck = (self, rawNewAlert) =>
    new Promise(
      (resolve, reject) =>
        Promise.all([prepareInput(rawNewAlert), checkLocations(Locations, rawNewAlert)])
          .then((rawNewAlert) => resolve([self, rawNewAlert[0]]))
          .catch((err) => reject(err))
    )

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually edits the ride alert
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      prepareAndCheck(self, rawNewAlert)
        .then((results) => {
          let rawNewAlert = results[1]
          rawNewAlert.userId = req.params.id
          getAndAction(rawNewAlert, 'update', results[0])
            .then(() => dispatchSuc(res, []))
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /users/{:id}/regularrides route
let getRegularRides = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let userId = req.params.id

  let getRegularRidesAndDets = () =>
    new Promise(
      (resolve, reject) => {
        RegularRide.findAll({
          attributes: { exclude: ['toId', 'fromId'] },
          where: { driver: userId },
          include: [
            { model: Locations, as: 'from' },
            { model: Locations, as: 'to' }
          ]
        })
          .then((regularRides) => {
            let result = regularRides === null
              ? { regularRides: [] }
              : { regularRides: regularRides }
            resolve(result)
          })
          .catch((err) => reject(err))
      }
    )

  let getRideAlertAndDets = (result) =>
    new Promise(
      (resolve, reject) => {
        RideAlerts.findOne({
          attributes: { exclude: ['toId', 'fromId'] },
          where: { userId: userId },
          include: [
            { model: Locations, as: 'from' },
            { model: Locations, as: 'to' }
          ]
        })
          .then((rideAlert) => {
            rideAlert === null
              ? result.rideAlert = []
              : result.rideAlert = rideAlert
            resolve(result)
          })
          .catch((err) => reject([err.message]))
      }
    )

  // This Promises chain validates loginToken, then
  // gets all the regular rides where the user is the driver
  // but also its ride alert
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      checkPermissions(self, userId)
        .then((self) => {
          getRegularRidesAndDets()
            .then((results) =>
              getRideAlertAndDets(results)
                .then((results) => dispatchSuc(res, results))
                .catch((err) => dispatchErr(res, err))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /users/{:userId}/rides?status=finished
let getRides = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let userId = req.params.id
  let status = req.query.status

  // Get rides where status and userId are equals
  // to the ones passed in the request
  let searchPastRidesWhere = () =>
    new Promise(
      (resolve, reject) => {
        RideRiders.findAll({
          attributes: { exclude: ['userId', 'toId', 'fromId'] },
          where: {
            userId: userId,
            status: status
          },
          include: [
            { model: Locations, as: 'from' },
            { model: Locations, as: 'to' }
          ]
        })
          .then((rides) => {
            if (rides === null) {
              resolve([])
            } else {
              resolve(rides)
            }
          })
          .catch((err) => reject([err.message]))
      }
    )
  // This Promises chain validates loginToken, then
  // gets all the rides where the status is equal to the
  // one passed in the queries. An user can search only for
  // its rides.
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      checkPermissions(self, userId)
        .then((self) => {
          if (req.query.status === undefined || req.query.status === '') {
            // TODO: finish get user rides
            dispatchSuc(res, ['Planned rides'])
          } else {
            searchPastRidesWhere()
              .then((results) => dispatchSuc(res, results))
              .catch((err) => dispatchErr(res, err))
          }
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// Shared method that checks ride existance, property and
// eventually updates or deletes it
let getAndAction = (newRideAlert, action, userId) =>
  new Promise(
    (resolve, reject) => {
      RideAlerts.findOne({ where: { userId: newRideAlert.userId } })
        .then((rideAlert) => {
          if (rideAlert === null) {
            reject(['User does not have any ride alert'])
            return
          }
          if (userId !== rideAlert.userId) {
            reject(['Permission denied'])
            return
          }
          if (action === 'update') {
            rideAlert.update(newRideAlert)
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          } else {
            rideAlert.destroy()
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          }
        })
        .catch((err) => reject(err.message))
    }
  )

module.exports = {profile, editProfile, addCar, addRideAlert, removeRideAlert, editRideAlert, getRegularRides, getRides}
