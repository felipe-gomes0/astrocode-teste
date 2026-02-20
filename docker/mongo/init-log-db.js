// MongoDB init script: creates a dedicated user for the logging service
// This runs only on first initialization of the MongoDB container

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'app_logs');

db.createUser({
  user: process.env.LOG_MONGO_USER || 'log_service',
  pwd: process.env.LOG_MONGO_PASSWORD || 'changeme_log',
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE || 'app_logs' }
  ]
});

// Create the logs collection
db.createCollection('logs');

print('MongoDB init: log_service user and logs collection created.');
