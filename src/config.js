const config = {
  nodeEnv: 'development',
  domain: 'localhost:3000',
  session: {
    secret: 'developmentSecret',
  },
  password: {
    zxcvbnMinScore: 2,
    resetTokenMaxAge: 3600000, // 1 h 
    saltRounds: 10
  },
  db: {
    connectionString: 'mongodb://db:27017',
    databaseName: 'inka',
    connectionOptions: {
      useUnifiedTopology: true
    }
  },
  mailer: {
    senderName: 'INKA Företagssida',
    host: 'localhost',
    port: '-1',
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  },
  businesses: {
    registrationAddons: [
      { name: '5 kontaktsamtal', price: 3000 },
      { name: 'Extra marknadsföring', price: 3000 }
    ],
    enabledOffers: [
      'Examensarbete',
      'Extrajobb/timanställning',
      'Internship',
      'Praktik',
      'Sommarjobb',
      'Tillsvidareanställning',
      'Traineeprogram',
      'Utlandsmöjligheter'
    ]
  },
  media: {
    uploadsDir: '/userfiles/',
    allowedFileUploads: [
      { name: 'pitch', mimes: 'video/*' },
      { name: 'logo', mimes: 'image/svg+xml,application/postscript,image/png' },
      { name: 'poster', mimes: 'application/pdf,image/svg+xml,application/postscript' }
    ]
  }
}

// Production config
if (process.env.NODE_ENV === 'production') {
  // Make sure the environment is set up correctly
  const requiredEnv = ['SESSION_SECRET', 'DOMAIN', 'MAILER_USERNAME', 'MAILER_PASSWORD', 'MAILER_SMTP_HOST', 'MAILER_SMTP_PORT']
  requiredEnv.forEach(env => {
    if (!process.env[env]) {
      console.error('Required environemnt variable not set: ' + env)
      process.exit(1)
    }
  })

  // TODO Only do this once on the first load
  // Transfer env configs to config object
  config.nodeEnv = process.env.NODE_ENV
  config.domain = process.env.DOMAIN
  config.mailer.host = process.env.MAILER_SMTP_HOST
  config.mailer.port = process.env.MAILER_SMTP_PORT
  config.mailer.auth.user = process.env.MAILER_USERNAME
  config.mailer.auth.pass = process.env.MAILER_PASSWORD
}

module.exports = config
