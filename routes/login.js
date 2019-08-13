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
                    token: token,
                    menu: obtenerMenu(usuarioBD.role)
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
                    token: token,
                    menu: obtenerMenu(usuarioBD.role)
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
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioBD.password )){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        // Crear token
        usuarioBD.password = '';
        const token = jwt.sign( {usuario: usuarioBD}, SEED, { expiresIn: 14400 } );

        res.status(200).json({
            ok: true,
            data: usuarioBD,
            token: token,
            menu: obtenerMenu(usuarioBD.role)
        });
    });

});

function obtenerMenu( role ) {
    let menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RXJS', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos' }
          ]
        }
      ];

      if (role === 'ADMIN_ROLE') {
          menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
      }

      return menu;
}

module.exports = app;