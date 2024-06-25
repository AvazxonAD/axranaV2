const express = require('express');
const path = require('path')
const cors = require('cors');
const app = express();
require('dotenv').config();
require('colors');

const PORT = process.env.PORT || 3000;

require('./config/db')();
require('./utils/create.Admin')();

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, './public')))
app.use(cors())

app.use('/auth', require('./router/auth.router'));
app.use('/rank', require('./router/rank.router'));
app.use('/location', require('./router/location.router'));
app.use('/otryad', require('./router/otryad.router'));
app.use('/worker', require('./router/pasport.router'));
app.use('/contract', require('./router/contract.router'))
app.use("/result", require("./router/result.router"))

app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`.blue);
});
