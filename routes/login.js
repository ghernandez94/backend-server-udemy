const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const app = express();
const SEED = require('../config/config').SEED;

app.post('/', (req, res, next) => {
    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        
        if( !usuarioBD ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioBD.password )){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        // Crear token
        usuarioBD.password = '';
        var token = jwt.sign( {usuario: usuarioBD}, SEED, { expiresIn: 14400 } );

        res.status(200).json({
            ok: true,
            data: usuarioBD,
            token: token
        });
    });

});

module.exports = app;