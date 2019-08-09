const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

// List users
app.get('/', (req, res, next) => {
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    Usuario.find({}, 'nombre email img role google')
        .skip(skip)
        .limit(limit)
        .exec(
            (err, usuarios) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando usuario',
                    errors: err
                });
            }

            Usuario.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    data: usuarios,
                    total: total
                });
            })
            
        });
});

// Create user
app.post('/', (req, res, next) => {
    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            data: usuarioGuardado,
            author: req.calledBy
        })
    });

});

// Update usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Usuario.findById( id, ( err, usuario ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if ( !usuario ){
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe ',
                errors: { message: 'No existe usuario con ese id' }
            });
        }

        const body = req.body;
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        // usuario.password = bcrypt.hashSync( body.password, 10 );
        // usuario.img = body.img;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                data: usuarioGuardado
            });
        });
    });
});

// Delete user
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no existe',
                errors: { message: 'No existe usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            data: usuarioBorrado
        });
    })
});

module.exports = app;
