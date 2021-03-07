const Contacts = require('./ContactsDBAPI/contacts')
const pgPromise = require('pg-promise')
const initOptions = {
  extend(obj, dc) {
    obj.contacts = new Contacts(obj, pgp)
  }
}
const pgp = pgPromise(initOptions)
const connectionString = process.env.DB_CONNECTION

const db = pgp(connectionString)

module.exports = db