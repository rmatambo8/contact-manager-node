const { contacts: sql } = require('../sql')

const cs = {}

class Contacts {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;

        // set-up all ColumnSet objects, if needed:
        createColumnsets(pgp);
    }

    async create() {
        return this.db.none(sql.create);
    }
  
    async update(id, data) {
        const params = [JSON.stringify(data), id]
        let {rows} = await this.db.result(sql.update, params)
        rows = rows[0]
        const {info} = rows
        return {id, ...info }
    }

    // Initializes the table with some user records, and return their id-s;
    async init() {
        return this.db.map(sql.init, [], row => row.id);
    }

    // Drops the table;
    async drop() {
        return this.db.none(sql.drop);
    }

    // Removes all records from the table;
    async empty() {
        return this.db.none(sql.empty);
    }

    // Adds a new contact, and returns the new object;
  async add(info) {
      // console.log("we have info", info)
        return this.db.one(sql.add, JSON.stringify(info));
    }

    // Tries to delete a user by id, and returns the number of records deleted;
    async remove(id) {
        return this.db.result('DELETE FROM contacts WHERE id = $1', +id, r => r.rowCount);
    }

    // Tries to find a contact from id;
    async findById(id) {
        return this.db.oneOrNone('SELECT id, info FROM contacts WHERE id = $1', +id);
    }

    // Tries to find a user from name;
    // async findByName(name) {
    //     return this.db.oneOrNone('SELECT * FROM contacts WHERE info = LIKE%$1', name);
    // }

    // Returns all user records;
    async all() {
        return this.db.any('SELECT * FROM contacts');
    }

    // Returns the total number of contacts;
    async total() {
        return this.db.one('SELECT count(*) FROM contacts', [], a => +a.count);
    }
}


function createColumnsets(pgp) {
  if (!cs.insert) {
    const table = new pgp.helpers.TableName({ table: 'contacts', schema: 'public' });
    cs.insert = new pgp.helpers.ColumnSet(['info'], { table });
    cs.update = cs.insert.extend(['?id']);
  }

  return cs
}

module.exports = Contacts