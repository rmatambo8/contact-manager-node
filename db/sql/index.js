
const pgp = require('pg-promise')()
const {join: joinPath} = require('path')
const {QueryFile} = require('pg-promise')

module.exports = {
  contacts: {
    create: sql('./contacts/create.sql'),
    empty: sql('./contacts/empty.sql'),
    init: sql('./contacts/init.sql'),
    drop: sql('./contacts/drop.sql'),
    add: sql('./contacts/add.sql'),
    update: sql('./contacts/update.sql'),
    all: sql('./contacts/getall.sql')
  }
};

function sql(file) {

    const fullPath = joinPath(__dirname, file); // generating full path;

    const options = {
      minify: true
    };

    const query = new QueryFile(fullPath, options);

  if (query.error) {
      console.log('we reached here')
        // Something is wrong with our query file :(
        // Testing all files through queries can be cumbersome,
        // so we also report it here, while loading the module:
        console.error(query.error);
    }

    return query;

    // See QueryFile API:
    // http://vitaly-t.github.io/pg-promise/QueryFile.html
}