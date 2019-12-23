const config = {};

config.app = {
  'case sensitive routing': false,
  'strict routing': false,
  'trust proxy': false,
  'x-powered-by': false
};

config.middleware = {
  cors: {
    origin: '*', // process.env.API_HOST || true,
    methods: ['GET', 'HEAD', 'POST']
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    },
    dnsPrefetchControl: {
      allow: true
    },
    frameguard: false,
    hidePoweredBy: true,
    hsts: false
  }
};

config.server = {
  http: {
    host: process.env.HOST || undefined,
    port: process.env.PORT || 3000
  },
  ws: {
    origins: '*:*', // process.env.API_HOST || '*',
    serveClient: false
  }
};

config.database = {
  // see https://rethinkdb.com/api/javascript/connect
  host: process.env.DATABASE_HOST, // default: 'localhost'
  port: process.env.DATABASE_PORT, // default: 28015
  user: process.env.DATABASE_USER, // default: 'admin'
  password: process.env.DATABASE_PASS, // default: ''
  db: process.env.DATABASE_NAME || 'approxi', // default: 'test'
  ssl: null // default: null
};

export default config;
