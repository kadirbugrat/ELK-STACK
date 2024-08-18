const winston = require('winston');
const net = require('net');
require("dotenv").config()


const logstashTransport = new winston.transports.Stream({
  stream: net.connect({ host: process.env.LOGSTASH_HOST || 'logstash', port: process.env.LOGSTASH_PORT || 5044 }),
  format: winston.format.json(),
});

console.log("1",process.env.LOGSTASH_PORT);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format((info) => {
      return info;
    })(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    logstashTransport
  ]
});

module.exports = logger;
