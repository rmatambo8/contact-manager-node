require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const contactManager = require('./lib/contact_manager');
const helpers = require('./lib/helpers');
const app = express();
const db = require('./db');
const { json } = require('body-parser');

app.set('port', (process.env.PORT || 3001));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

GET('/api/contacts', req => {
  return db.contacts.all()
});

  // res.json(contactManager.getAll());
// });

GET('/api/contacts/:id', async (req, res) => {
  const id = req.params.id
  let contact = await db.contacts.findById(id)
  if (contact) {
    contact.info.id = id
    contact = contact.info
    res.json(contact)
  } else {
    res.status(404).end()
  }
})
// app.get('/api/contacts/:id', (req, res) => {
//   let contact = contactManager.get(req.params['id']);
//   if (contact) {
//     res.json(contact);
//   } else {
//     res.status(404).end();
//   }
// });

POST('/api/contacts', (req, res) => {
  let contactAttrs = helpers.extractContactAttrs(req.body);
  return db.contacts.add(contactAttrs)
});

PUT('/api/contacts/:id', (req, res) => {
  const contactAttrs = helpers.extractContactAttrs(req.body);

  return db.contacts.update(Number(req.params.id), contactAttrs)
  // let contact = contactManager.update(req.params['id'], contactAttrs);
  // if (contact) {
  //   res.status(201).json(contact);
  // } else {
  //   res.status(400).end();
  // }
});
DELETE('/api/contacts/:id', (req, res) => {
  return db.contacts.remove(req.params.id)
})
// app.delete('/api/contacts/:id', (req, res) => {
//   if (contactManager.remove(req.params['id'])) {
//     res.status(204).end();
//   } else {
//     res.status(400).end();
//   }
// });

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

function GET(url, handler) {
    app.get(url, async (req, res) => {
        try {
          let data = await handler(req);
          if (Array.isArray(data)) {
            data = data.map(({ id, info }) => ({ id, ...info }))
          }
            res.json(data);
        } catch (error) {
            res.json({
                success: false,
                error: error.message || error
            });
        }
    });
}

function PUT(url, handler) {
    app.put(url, async (req, res) => {
        try {
          let data = await handler(req);
          if (data.info) {
            data.info.id = data.id
            data = data.info
          }
          res.status(201).json(data);
          
        } catch (error) {
          console.log(error)
            res.json({
                success: false,
                error: error.message || error
            });
        }
    });
}
function DELETE(url, handler) {
    app.delete(url, async (req, res) => {
        try {
          let data = await handler(req);

          if (data.info) {
            data.info.id = data.id
            data = data.info
          }
          res.status(204).json(data);
        } catch (error) {
          res.status(400).end();
            // res.json({
            //     success: false,
            //     error: error.message || error
            // });
        }
    });
}
function POST(url, handler) {
    app.post(url, async (req, res) => {
        try {
          let data = await handler(req);

          if (data.info) {
            data.info.id = data.id
            data = data.info
          }
            res.json(data);
        } catch (error) {
            res.json({
                success: false,
                error: error.message || error
            });
        }
    });
}
module.exports = app; // for testing
