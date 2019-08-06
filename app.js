const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Routes
const appRoutes = require('./routes/app');
const loginRoutes = require('./routes/login');
const busquedaRoutes = require('./routes/busqueda');
const usuarioRoutes = require('./routes/usuario');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');

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

// Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Routes
app.use('/', appRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagenes', imagenesRoutes);

const port = 3000;
app.listen(port, () => {
    console.log('Online in port: \x1b[32m%s\x1b[0m', port);
});