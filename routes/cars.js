var { CarModels, CarMakes, UserLogins } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken } = require('../tools/tools')

// /carmodels route
let getCarModels = (req, res, next) => {
  let loginToken = req.headers.logintoken

  // This Promises chain validates loginToken, then
  // searches and returns all the group Car Models
  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      CarModels.findAll({})
        .then((carModels) => {
          carModels === null
            ? dispatchSuc(res, [])
            : dispatchSuc(res, carModels)
        })
        .catch((err) => dispatchErr(res, [err.message]))
    )
    .catch((err) => dispatchErr(res, err))
}

// /carmakers route
let getCarMakes = (req, res, next) => {
  let loginToken = req.headers.logintoken

  // This Promises chain validates loginToken, then
  // searches and returns all the group Car makes
  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      CarMakes.findAll({})
        .then((carMakes) => {
          carMakes === null
            ? dispatchSuc(res, [])
            : dispatchSuc(res, carMakes)
        })
        .catch((err) => dispatchErr(res, [err.message]))
    )
    .catch((err) => dispatchErr(res, err))
}

module.exports = {getCarMakes, getCarModels}
