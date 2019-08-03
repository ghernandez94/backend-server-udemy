const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Routes
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');

// Init vars
const app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if( err ) throw err
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Routes
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

const port = 3000;
app.listen(port, () => {
    console.log('Online in port: \x1b[32m%s\x1b[0m', port);
});