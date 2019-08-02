const express = require('express');
const mongoose = require('mongoose');

const app = express();
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if( err ) throw err
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

})

app.get('/', (req, res, next) => {
    res.status(201).json({
        ok: true,
        message: 'Petición realizada exitosamente'
    });
});

const port = 3000;
app.listen(port, () => {
    console.log('Online in port: \x1b[32m%s\x1b[0m', port);
});