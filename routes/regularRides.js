var { RegularRide, Locations, UserLogins } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, createUuid, checkLocations } = require('../tools/tools')

// /regularrides route
let addRegularRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewRide = req.body
  rawNewRide.fromId = req.body.from === undefined
    ? dispatchErr(res, ['No from passed'])
    : req.body.from
  rawNewRide.toId = req.body.to === undefined
    ? dispatchErr(res, ['No to passed'])
    : req.body.to

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually creates the ride
  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      prepareInput(rawNewRide)
        .then((newRide) => {
          newRide.id = createUuid()
          checkLocations(Locations, newRide)
            .then((newRide) =>
              RegularRide.create(newRide)
                .then(() => dispatchSuc(res, []))
                .catch((err) => dispatchErr(res, [err.message]))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /regularrides/:id (PUT) route
let editRegularRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewRide = req.body
  rawNewRide.fromId = req.body.from === undefined
    ? dispatchErr(res, ['No from passed'])
    : req.body.from
  rawNewRide.toId = req.body.to === undefined
    ? dispatchErr(res, ['No to passed'])
    : req.body.to

  // Prepares the input and checks the locations
  // for existance and diversity
  let prepareAndCheck = (self, rawNewRide) =>
    new Promise(
      (resolve, reject) =>
        Promise.all([prepareInput(rawNewRide), checkLocations(Locations, rawNewRide)])
          .then((newRide) => resolve([self, newRide[0]]))
          .catch((err) => reject(err))
    )

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually edits the ride
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      prepareAndCheck(self, rawNewRide)
        .then((results) => {
          let newRide = results[1]
          newRide.id = req.params.id
          getAndAction(newRide, 'update', results[0])
            .then(() => dispatchSuc(res, []))
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /regularrides/:id (DELETE) route
let removeRegularRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rideId = req.params.id

  // This Promises chain validates loginToken and then
  // proceeds to validate the ride, its property and
  // then deletes it
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      getAndAction({ id: rideId }, 'delete', self)
        .then(() => dispatchSuc(res, []))
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// Shared method that checks ride existance, property and
// eventually updates or deletes it
let getAndAction = (newRide, action, driverId) =>
  new Promise(
    (resolve, reject) => {
      RegularRide.findOne({ id: newRide.id })
        .then((ride) => {
          if (ride === null) {
            reject(['Invalid ride'])
            return
          }
          if (driverId !== ride.driver) {
            reject(['Permission denied'])
            return
          }
          if (action === 'update') {
            ride.update(newRide)
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          } else {
            ride.destroy()
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          }
        })
        .catch((err) => reject(err.message))
    }
  )

module.exports = {addRegularRide, editRegularRide, removeRegularRide}
