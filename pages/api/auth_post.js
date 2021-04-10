const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecret = 'SUPERSECRETE20220'

const saltRounds = 10;
const url = 'mongodb://localhost:27017'
const dbName = 'simple-post-db'

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function postUser(db, title, callback) {
  const collection = db.collection('post');
}

export default (req, res) => 
{
  if (req.method === 'POST') 
  {
    //post
    try {
      assert.notEqual(null, req.body.title, 'Title required');
      assert.notEqual(null, req.body.description, 'Description required');
    } catch (bodyError) {
      res.status(403).send(bodyError.message);
    }

    client.connect(function(err) 
    {
      const db = client.db(dbName);
      const title = req.body.title;
      const description = req.body.description;

      function postUser(db, title, description, callback) {
        const collection = db.collection('post');
          collection.insertOne(
            {
              userId: v4(),
              title,
              description,
            },
            function(err, postCreated) {
              assert.equal(err, null);
              callback(postCreated);
      }
    },
  })
}

  else 
  {
    // Handle any other HTTP method
    res.statusCode = 401;
    res.end();
  }
};
