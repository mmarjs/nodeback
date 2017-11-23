var { Categories, Groups, GroupDomains, GroupAdmins, Users, UserLogins, GroupUsers } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, createUuid } = require('../tools/tools')

// /groupstypes route
let getGroupsTypes = (req, res, next) => {
  // This Promises chain doesn't require the user to be logged.
  // searches and returns all the group Categories
  Categories.findAll({})
    .then((categories) => {
      categories === null
        ? dispatchSuc(res, [])
        : dispatchSuc(res, categories)
    })
    .catch((err) => dispatchErr(res, [err.message]))
}

// /groups/{:id} route
let getGroupInfo = (req, res, next) => {
  let groupId = req.params.groupId
  let groupObj = {}

  // Get specific group object
  let getSingleGroup = () =>
    new Promise(
      (resolve, reject) => {
        Groups.findById(groupId, {
          attributes: { exclude: ['categoryId'] },
          include: [
            { model: Categories, as: 'category' }
          ]
        })
          .then((group) => {
            if (group === null) {
              reject(['No group found'])
              return
            }
            groupObj = group.get()
            resolve()
          })
          .catch((err) => reject([err.message]))
      }
    )

  // Fill in array of domains associated with group
  let getGroupDomains = () =>
    new Promise(
      (resolve, reject) => {
        GroupDomains.findAll({
          attributes: ['domain'],
          where: { groupId: groupObj.id }
        })
        .then((domains) => {
          if (domains === null) {
            groupObj.domains = []
            return
          }
          groupObj.domains = domains.map((domain) => domain.get('domain'))
          resolve()
        })
        .catch((err) => reject([err.message]))
      }
    )

  // Fill in array of admins associated with group
  let getGroupAdmins = () =>
    new Promise(
      (resolve, reject) => {
        GroupAdmins.findAll({
          attributes: { exclude: ['groupId', 'userId'] },
          where: { groupId: groupObj.id },
          include: [
            { model: Users, as: 'user' }
          ]
        })
          .then((admins) => {
            if (admins === null) {
              groupObj.admins = []
              return
            }
            groupObj.admins = admins.map((admins) => admins.get('user'))
            resolve()
          })
          .catch((err) => reject([err.message]))
      }
    )

  // This Promise chain doesn't require the user to be logged.
  // It searches for a group with the given groupId, then
  // looks for its domains and its admins
  getSingleGroup()
    .then(() =>
      getGroupDomains()
        .then(() =>
          getGroupAdmins()
            .then(() =>
              dispatchSuc(res, groupObj)
            )
            .catch((err) => dispatchErr(res, err))
        )
        .catch((err) => dispatchErr(res, err))
    )
    .catch((err) => dispatchErr(res, err))
}

// /groups route
let getGroupList = (req, res, next) => {
  // TODO: return domains array
  let query = req.query.q === undefined || req.query.q === ''
    ? { where: { status: { $ne: 'pending' } } }
    : { where: { name: { $like: `%${req.query.q}%` }, status: { $ne: 'pending' } } }
  // This Promises chain doesn't require the user to be logged.
  // searches and returns all the Groups
  Groups.findAll(query)
    .then((groups) => {
      groups === null
        ? dispatchSuc(res, [])
        : dispatchSuc(res, groups)
    })
    .catch((err) => dispatchErr(res, [err.message]))
}

// /group/{:groupId}/leave route
let leaveGroup = (req, res, next) => {
  let loginToken = req.headers.logintoken
  let groupId = req.params.groupId

  // This Promises chain validates loginToken and then
  // proceeds to remove the user from the group
  checkLoginToken(UserLogins, loginToken)
    .then((self) => {
      GroupUsers.findOne({
        where: {
          groupId: groupId,
          userId: self
        }
      })
        .then((groupLink) => {
          if (groupLink === null) {
            dispatchErr(res, ['User does not belong to group'])
            return
          }
          groupLink.destroy()
            .then(() => dispatchSuc(res, []))
            .catch((err) => dispatchErr(res, [err.message]))
        })
        .catch((err) => dispatchErr(res, [err.message]))
    })
    .catch((err) => dispatchErr(res, err))
}

// /groups (POST) route
let addGroup = (req, res, next) => {
  let queries = req.body

  // This Promises chain prepares the input passed
  // eliminating the unused fields and then inserts
  // the new group
  prepareInput(queries)
    .then((newGroup) => {
      newGroup.id = createUuid()
      Groups.create(newGroup)
        .then(() => dispatchSuc(res, []))
        .catch((err) => dispatchErr(res, [err.message]))
    })
    .catch((err) => dispatchErr(res, err))
}

// /group/{:groupId}/rides
let groupRides = (req, res, next) => {
  let groupId = req.params.groupId
  // TODO: Complete group-rides endpoint
  dispatchSuc(res, groupId)
}

module.exports = {getGroupsTypes, getGroupInfo, getGroupList, leaveGroup, addGroup, groupRides}
