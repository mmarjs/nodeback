var { AppFeedback, UserLogins } = require('../models/index')
var { dispatchSuc, dispatchErr, checkPermissions, checkLoginToken, prepareInput, createUuid } = require('../tools/tools')

// /feedback route
let sendFeedback = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let rawNewFeedback = req.body

  // Add Feedback
  let addFeedback = (newFeedback) => {
    newFeedback.id = createUuid()
    AppFeedback
      .create(newFeedback)
      .then(() => {
        dispatchSuc(res, [])
      }).catch((err) =>
        dispatchErr(res, [err.message])
      )
  }

  // The Promises chain firstly validates the loginToken then
  // if the userId is passed in the `body` corresponds to the
  // one associated with the loginToken the Feedback is created
  checkLoginToken(UserLogins, loginToken)
    .then((loggedUserId) =>
      checkPermissions(loggedUserId, rawNewFeedback.userId)
        .then(() =>
          prepareInput(rawNewFeedback)
            .then((newFeedback) =>
              addFeedback(newFeedback)
            )
            .catch((err) => dispatchErr(res, err))
        )
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

module.exports = {sendFeedback}
