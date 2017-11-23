var { Rides, RideRiders, Locations, UserLogins, Notifications } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, checkLocations, createUuid, sendNotification } = require('../tools/tools')

// /rides/{:id} route
let getRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rideId = req.params.id
  // TODO: Insert search rides here
  // This Promises chain validates loginToken, then
  // searches and returns the ride informations
  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      Rides.findById(rideId, {
        attributes: { exclude: ['toId', 'fromId'] },
        include: [
          { model: Locations, as: 'from' },
          { model: Locations, as: 'to' }
        ]
      })
        .then((ride) => {
          ride === null
            ? dispatchSuc(res, [])
            : dispatchSuc(res, ride)
        })
        .catch((err) => dispatchErr(res, [err.message]))
    )
    .catch((err) => dispatchErr(res, err))
}

// /rides/{:rideId}/riders route
let joinRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewRider = {}
  rawNewRider.fromId = req.body.from === undefined
    ? dispatchErr(res, 'No from passed')
    : req.body.from
  rawNewRider.toId = req.body.to === undefined
  ? dispatchErr(res, 'No to passed')
  : req.body.to
  rawNewRider.rideId = req.params.rideId

  let checkRideExistence = (newRide) =>
    new Promise(
      (resolve, reject) => {
        Rides.findById(newRide.rideId, {
          attributes: [ 'id' ]
        })
          .then((ride) => {
            ride === null
              ? reject(['Invalid rideId'])
              : resolve(newRide)
          })
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually allows the logged
  // user to join the ride
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      rawNewRider.userId = self
      prepareInput(rawNewRider)
        .then((newRide) => {
          checkLocations(Locations, newRide)
            .then((newRide) =>
              checkRideExistence(newRide)
                .then((newRide) =>
                  RideRiders.create(newRide)
                    .then(() =>
                        newMessage = 'Request Join'
                        Notifications.create({
                          rideId: rawNewRider.rideId,
                          loginToken: loginToken,
                          timestamp: Date.now(),
                          message: newMessage
                        })
                          sendNotification(UserLogins, loginToken, newMessage)
                            .then(() => dispatchSuc(res, []))
                          .catch((err) => dispatchErr(res, [err.message]))
                        )
                    .catch((err) => dispatchErr(res, err))
                  )
                .catch((err) => dispatchErr(res, err))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
}

// /rides/{:rideId}/riders (PUT) && /rides/{:rideId}/driver (PUT) routes
let editRideStatus = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let action = req.body.action === undefined
    ? dispatchErr(res, 'No action passed')
    : req.body.action
  let rideId = req.params.rideId
  let agent = req.params.agent

  // Check that the rideRider exists and depending whether the loggedUser
  // is the driver or the rider allows them to modify the status
  let checkRideRiderExistenceAndUpdate = (loggedUserId, action) =>
    new Promise(
      (resolve, reject) => {
        RideRiders.findById(rideId, {
          attributes: [ 'rideId', 'userId' ],
          include: [
            { model: Rides, as: 'ride' }
          ]
        })
          .then((rideRider) => {
            if (rideRider === null) {
              reject(['Invalid rideId'])
              return
            }
            let newStatus = {}
            if (agent === 'riders') {
              if (rideRider.userId !== loggedUserId) {
                reject(['Permission denied'])
                return
              }
              switch (action) {
                case 'leave':
                  newStatus.status = 'left'
                  break
                case 'start':
                  newStatus.status = 'started'
                  newMessage = 'Ride ' + newStatus.status
                  Notifications.create({
                        rideId: rideID,
                        loginToken: loginToken,
                        timestamp: Date.now(),
                        message: newMessage
                  })
                  sendNotification(UserLogins, loginToken, newMessage)
                  break
                case 'end':
                  newStatus.status = 'finished'
                  newMessage = 'Ride ' + newStatus.status
                  Notifications.create({
                        rideId: rideID,
                        loginToken: loginToken,
                        timestamp: Date.now(),
                        message: newMessage
                  })
                  sendNotification(UserLogins, loginToken, newMessage)
                  break
                default: reject(['Invalid action'])
              }
            } else if (agent === 'driver') {
              if (rideRider.ride.driver !== loggedUserId) {
                reject(['Permission denied'])
                return
              }
              switch (action) {
                case 'accept':
                  newStatus.status = 'accepted'
                  newMessage = 'Ride ' + newStatus.status
                  Notifications.create({
                        rideId: rideID,
                        loginToken: loginToken,
                        timestamp: Date.now(),
                        message: newMessage
                  })
                  sendNotification(UserLogins, loginToken, newMessage)
                  break
                case 'decline':
                  newStatus.status = 'declined'
                  newMessage = 'Ride ' + newStatus.status
                  Notifications.create({
                        rideId: rideID,
                        loginToken: loginToken,
                        timestamp: Date.now(),
                        message: newMessage
                  })
                  sendNotification(UserLogins, loginToken, newMessage)
                  break
                default: reject(['Invalid action'])
              }
            } else {
              reject(['Permission denied'])
              return
            }
            rideRider.update(newStatus)
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          })
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  // This Promises chain validates loginToken, retrieves
  // the rideRider record and then depending on the action
  // passed proceeds to update its status as always only
  // if the logged user is the same that appears on the record
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      checkRideRiderExistenceAndUpdate(self, action)
        .then(() => dispatchSuc(res, []))
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /rides/:rideId/rate (PUT) route
let rateRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rating = req.body.rating === undefined
    ? dispatchErr(res, 'No rating passed')
    : req.body.rating
  let rideId = req.params.rideId

  // Find a RideRider and then, depending on whether the logged
  //  user is the driver or a rider allows him to vote accordingly
  // (if the ride belongs to him)
  let findAndRate = (self) =>
    new Promise(
      (resolve, reject) => {
        RideRiders.findById(rideId, {
          attributes: [ 'rideId', 'userId' ],
          include: [
            { model: Rides, as: 'ride' }
          ]
        })
          .then((rideRider) => {
            let newRating = {}
            if (rideRider === null) {
              reject(['Invalid rideId'])
              return
            }
            if (rideRider.userId === self) {
              newRating.driverRating = rating
            } else if (rideRider.ride.driver === self) {
              newRating.riderRating = rating
            } else {
              reject(['Permission denied'])
              return
            }
            rideRider.update(newRating)
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          })
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  // This Promises chain validates loginToken, retrieves
  // the rideRider record and then decides whether is
  // the driver or the rider the one who's voting based on
  // the loginToken. Then records the rating
  checkLoginToken(UserLogins, loginToken)
    .then((self) =>
      findAndRate(self)
        .then(() => dispatchSuc(res, []))
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /ride/{:rideRiderId} route
let editRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rideRiderId = req.params.rideRiderId
  let rawNewRider = {}
  rawNewRider.fromId = req.body.from === undefined
    ? dispatchErr(res, 'No from passed')
    : req.body.from
  rawNewRider.toId = req.body.to === undefined
  ? dispatchErr(res, 'No to passed')
  : req.body.to

  // This Promises chain validates loginToken, retrieves
  // the rideRider record and then if the logged user is
  // the owner lets her update the record
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      prepareInput(rawNewRider)
        .then((editRide) => {
          checkLocations(Locations, editRide)
            .then((editRide) =>
              RideRiders.findById(rideRiderId, {
                attributes: [ 'rideId', 'userId' ]
              })
                .then((rideRider) => {
                  if (rideRider === null) {
                    dispatchErr(res, ['Invalid rideId'])
                    return
                  }
                  if (rideRider.userId !== self) {
                    dispatchErr(res, ['Permission denied'])
                    return
                  }
                  rideRider.update(editRide)
                      .then(() => dispatchSuc(res, []))
                      .catch((err) => dispatchErr(res, [err.message]))
                })
                .catch((err) => dispatchErr(res, [err.message]))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
}

// /ride/{:rideId} route
let cancelRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rideId = req.params.rideId

  // This Promises chain validates loginToken and then
  // proceeds to validate the ride, its property and
  // then deletes it
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      Rides.findById(rideId, {
        attributes: [ 'rideId' ]
      })
        .then((ride) => {
          if (ride === null) {
            dispatchErr(res, ['Invalid rideId'])
            return
          }
          if (ride.driver !== self) {
            dispatchErr(res, ['Permission denied'])
            return
          }
          ride.destroy()
            .then(() => dispatchSuc(res, []))
            .catch((err) => dispatchErr(res, [err.message]))
        })
        .catch((err) => dispatchErr(res, [err.message]))
    })
    .catch((err) => dispatchErr(res, err))
}

// /ride/ route
let createRide = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewRide = req.body
  rawNewRide.fromId = req.body.from === undefined
    ? dispatchErr(res, 'No from passed')
    : req.body.from
  rawNewRide.toId = req.body.to === undefined
  ? dispatchErr(res, 'No to passed')
  : req.body.to
  console.log(rawNewRide)

  // This Promises chain validates loginToken, then
  // prepares the input, validates the locations and
  // their diversity, then eventually adds the ride
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      rawNewRide.id = createUuid()
      rawNewRide.driver = self
      prepareInput(rawNewRide)
        .then((newRide) => {
          checkLocations(Locations, newRide)
            .then((newRide) =>
              Rides.create(newRide)
                .then(() => dispatchSuc(res, []))
                .catch((err) => dispatchErr(res, [err.message]))
            )
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
}

// /rides/?{q=} route
let searchRides = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let query
  if (req.query.q === undefined || req.query.q === '') {
    dispatchErr(res, ['No query passed'])
  } else {
    query = req.query.q
  }
  // TODO: Search rides belongs to getRides
  dispatchSuc(res, query)
}

module.exports = {getRide, joinRide, editRideStatus, rateRide, editRide, cancelRide, createRide, searchRides}
