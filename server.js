var restify = require('restify')
var restifyValidator = require('restify-validator')

var routes = require('./routes/index')
var server = restify.createServer()

server.use(restify.bodyParser())
server.use(restify.queryParser())
server.use(restifyValidator)

if (process.env.NODE_ENV === 'production') {
  server.use((req, res, next) => {
    if (req.isSecure()) {
      next()
    } else {
      res.send({
        status: false,
        content: [],
        validation: ['Please use https']
      })
    }
  })
}

server.post('/feedback', routes.feedbacks.sendFeedback)

server.get('/config', routes.settings.getAllSettings)

server.get('/login/social', routes.logins.socialLogin)
server.get('/login/register', routes.logins.register)

server.get('/email/verify', routes.emails.verify)
server.get('/email/checkcode', routes.emails.checkCode)

server.get('/users/:id', routes.users.profile)
server.put('/users/:id', routes.users.editProfile)
server.post('/users/:id/car', routes.users.addCar)
server.post('/users/:id/ridealert', routes.users.addRideAlert)
server.del('/users/:id/ridealert', routes.users.removeRideAlert)
server.put('/users/:id/ridealert', routes.users.editRideAlert)
server.get('/users/:id/regularrides', routes.users.getRegularRides)
server.get('/users/:id/rides', routes.users.getRides)

server.get('/carmodels', routes.cars.getCarModels)
server.get('/carmakers', routes.cars.getCarMakes)

server.post('/regularrides', routes.regularRides.addRegularRide)
server.del('/regularrides/:id', routes.regularRides.removeRegularRide)
server.put('/regularrides/:id', routes.regularRides.editRegularRide)

server.post('/rides', routes.rides.createRide)
server.get('/rides/:id', routes.rides.getRide)
server.put('/rides/:rideRiderId', routes.rides.editRide)
server.post('/rides/:rideId/riders', routes.rides.joinRide)
server.put('/rides/:rideId/:agent', routes.rides.editRideStatus)
server.put('/rides/:rideId/rate', routes.rides.rateRide)
server.del('/rides/:rideId', routes.rides.cancelRide)

server.get('/groupstypes', routes.groups.getGroupsTypes)
server.get('/groups/:groupId', routes.groups.getGroupInfo)
server.get('/groups', routes.groups.getGroupList)
server.put('/group/:groupId/leave', routes.groups.leaveGroup)
server.post('/groups', routes.groups.addGroup)
server.get('/group/:groupId/rides', routes.groups.groupRides)




server.listen(3000, function () {
  console.log('REST API Server listening at http://localhost:3000')
})

// for testing
module.exports = server
