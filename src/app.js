const fs = require('fs')
const express = require('express')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')

const homeRoutes = require('./routes/home')
const dashboardRoutes = require('./routes/dashboard')
const apiRoutes = require('./routes/api')


const port = process.env.PORT || 3000
const app = express()


// Config
const publicDir = 'src/public' // The public directory
let sessionConfig = {
  store: new FileStore(),
  secret: 'changeme', // Set the secret
  resave: false, // Do not force a resave on each request
  saveUninitialized: false, // Do not save an empty session
  cookie: { 
    secure: false // Allow cookie to be sent over HTTP in dev (default)
  }
}

// Production config
if (app.get('env') === 'production') {
  // Make sure the environment is set up correctly
  const requiredEnv = ['SESSION_SECRET']
  requriedEnv.forEach(env => {
    if (!process.env[env]) {
      console.error('Required environemnt variable not set: ' + env)
      process.exit(1)
    }
  })

  app.set('trust proxy', 1) // Trust first proxy
  sessionConfig.secure = process.env.SESSION_SECRET // Set the session secret
  sessionConfig.cookie.secure = true // Only send session cookie over HTTPS
}

app.disable('x-powered-by'); // Disable HTTP header X-Powered-By
app.use(session(sessionConfig)) // Use sessions
app.use(bodyParser.json()) // Parse JSON bodies
app.use(bodyParser.urlencoded({extended:true})) // Parse urlencoded form bodies
app.use(function(req, res, next) { // Allow html files to be accessed without extension
  if (req.path.indexOf('.') === -1) {
    var file = publicDir + req.path + '.html'
    fs.access(file, fs.constants.F_OK, function(err) {
      if (!err) {
        req.url += '.html'
      }
      next()
    })
  }
  else
    next()
});
app.use(express.static(publicDir)) // Serve static content from 'public' directory
app.set('view engine', 'pug') // Set the view/template engine
app.set('views', 'src/views') // Set the views directory

// Routes
app.use('/', homeRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/api', apiRoutes)

// Start server
app.listen(port, () => {
  console.log('Started server on port ' + port)
})
