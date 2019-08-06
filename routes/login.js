const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const app = express();
const SEED = require('../config/config').SEED;

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// Autenticación de Google
app.post('/google', async(req, res) => {
    const token = req.body.token;
    const googleUser = await verify( token )
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        
        if( usuarioBD ){
            if( !usuarioBD.google ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar autenticación normal'
                });
            }else{
                // Crear token
                usuarioBD.password = '';
                const token = jwt.sign( {usuario: usuarioBD}, SEED, { expiresIn: 14400 } );

                res.status(200).json({
                    ok: true,
                    data: usuarioBD,
                    token: token
                });
            }
        }else{
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '.';

            usuario.save( (err, usuarioBD) => {
                if( err ){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }

                // Crear token
                usuarioBD.password = '';
                const token = jwt.sign( {usuario: usuarioBD}, SEED, { expiresIn: 14400 } );

                res.status(200).json({
                    ok: true,
                    data: usuarioBD,
                    token: token
                });
            });
        }
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// Autenticación normal
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
        const token = jwt.sign( {usuario: usuarioBD}, SEED, { expiresIn: 14400 } );

        res.status(200).json({
            ok: true,
            data: usuarioBD,
            token: token
        });
    });

});

module.exports = app;