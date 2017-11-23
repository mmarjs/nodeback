let { GroupDomains, UserVerificationCo, Users, GroupUsers } = require('../models/index')
let { dispatchSuc, dispatchErr } = require('../tools/tools')
let sendmail = require('sendmail')({ silent: true })
let Random = require('random-js')

// /email/verify route
let verify = (req, res, next) => {
  if (req.query.email === '' || req.query.email === undefined) {
    dispatchErr(res, ['No email address'])
  } else {
    var email = req.query.email
  }
  if (req.query.userId === '' || req.query.userId === undefined) {
    dispatchErr(res, ['No userId provided'])
  } else {
    var userId = req.query.userId
  }
  let groupId = req.query.groupId

  // Extract domain name
  let domainName = (email) => email.replace(/.*@/, '')

  // Determine wheter to search groups for groupId or domain
  let where = groupId !== undefined && groupId !== ''
    ? { groupId: groupId }
    : { domain: domainName(email) }

  // Find domain
  let findDomain = () =>
    new Promise(
      (resolve, reject) => {
        GroupDomains.findOne({
          attributes: ['domain', 'groupId'],
          where: where
        })
          .then((domain) => {
            if (domain !== null) {
              groupId = domain.groupId
              resolve()
            } else {
              reject(['No domain found'])
            }
          })
          .catch((err) => reject([err.message]))
      }
    )

  // Create random code between 0000 and 9999
  let createCode = () =>
    new Promise(
      (resolve, reject) => {
        let random = new Random(Random.engines.browserCrypto)
        let code = String(random.integer(0, 9999))
        while (code.length < 4) {
          code = `0${code}`
        }
        resolve({ code: code })
      }
    )

  // Send code to provided email
  let sendCode = (receiver, data) =>
    new Promise(
      (resolve, reject) => {
        if (data.code === undefined || data.code === '') reject(['Invalid code'])
        sendmail({
          from: 'no-reply@foorera.com',
          to: receiver,
          subject: 'Foorera Verification Code',
          html: `<p>Your verification code is: <strong>${data.code}</strong></p>`
        }, (err, reply) => {
          if (err) reject([err.stack])
          resolve(data)
        })
      }
    )

  // Add record to UserVerificationCo or update existing one
  let saveCode = (data) =>
    new Promise(
      (resolve, reject) => {
        UserVerificationCo.find({
          where: {
            userId: userId
          }
        })
          .then((record) => {
            let newData = {
              code: data.code,
              sentTo: email,
              sentAt: Math.floor(Date.now() / 1000)
            }
            if (record !== null) {
              // If record exists update it
              let where = { where: { userId: userId } }
              UserVerificationCo.update(newData, where)
                .then(() => resolve())
                .catch((err) => reject([err.message]))
            } else {
              // Create a new record
              newData.userId = userId
              UserVerificationCo
                .create(newData)
                .then(() => resolve())
                .catch((err) => reject([err.message]))
            }
          })
          .catch((err) => reject([err.message]))
      }
    )

  let createGroupUsersLink = () =>
    new Promise(
      (resolve, reject) => {
        let newData = {
          groupId: groupId,
          userId: userId
        }
        GroupUsers
          .create(newData)
          .then(() => resolve())
          .catch((err) => reject([err.message]))
      }
    )

  // This Promises chain no longer requires a loginToken but
  // needs an userId in the request. Then generates a 4-digit code,
  // sends it, stores it and finally updates user's status to
  // 'pending code verifiation' and creates a record in GroupUsers
  // with status 'pending'
  findDomain()
    .then(() =>
      createCode()
        .then((data) =>
          sendCode(email, data)
            .then((data) =>
              saveCode(data)
                .then(() => {
                  let newData = {
                    status: 'pending code verification'
                  }
                  updateUserStatus(userId, newData)
                    .then(() =>
                      createGroupUsersLink()
                        .then(() => dispatchSuc(res, []))
                        .catch((err) => dispatchErr(res, [err.message]))
                    )
                    .catch((err) => dispatchErr(res, [err.message]))
                })
                .catch((err) => dispatchErr(res, err))
            )
            .catch((err) => dispatchErr(res, err))
        )
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /email/checkcode route
let checkCode = (req, res, next) => {
  if (req.query.groupId === '' || req.query.groupId === undefined) {
    dispatchErr(res, ['No groupId provided'])
  } else {
    var groupId = req.query.groupId
  }
  let code = req.query.code

  // Searches the record for the given code & userId
  // if found deletes it
  let findCode = () =>
    new Promise(
      (resolve, reject) => {
        if (code === '' || code === undefined) {
          reject(['No code provided'])
        }
          UserVerificationCo.find({
            where: {
              userId: userId,
              code: code
            }
          })
          .then((record) => {
            if (record === null) {
              reject(['Invalid code'])
              return
            }
            record.destroy()
              .then(() => resolve())
              .catch((err) => reject([err.message]))
          })
          .catch((err) => dispatchErr(res, [err.message]))
      }
    )

  let updateGroupUsersLink = () =>
    new Promise(
      (resolve, reject) => {
        GroupUsers
          .update({
            status: 'verified'
          }, {
            where: {
              userId: userId,
              groupId: groupId
            }
          })
          .then(() => resolve())
          .catch((err) => reject([err.message]))
      }
    )
  // This Promises chain no longer requires a loginToken but
  // instead an userId. Then searches in the UserVerificationCo
  // table for a record that corresponds with the code && userId,
  // if so deletes the record and updates user's status to 'verified'
  // and GroupUsers to 'verified'
  findCode()
    .then(() => {
      let newData = {
        status: 'verified'
      }
      updateUserStatus(userId, newData)
        .then(() => {
          updateGroupUsersLink()
            .then(() => dispatchSuc(res, []))
            .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
}

// Shared method to update User's status
let updateUserStatus = (self, newData) =>
  new Promise(
    (resolve, reject) => {
      let where = { where: { userId: self } }
      Users.update(newData, where)
        .then(() => resolve())
        .catch((err) => reject([err.message]))
    }
  )

module.exports = {verify, checkCode}
