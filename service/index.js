const express = require('express');
const uuid = require('uuid');
const app = express();

let users = {};
let scores = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());

//app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

app.get('*', (_req, res) => {
  res.send({ msg: 'Simon service' });
});

apiRouter.get('/group', async (req,res) =>{
    res.send({test: 'test'});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});