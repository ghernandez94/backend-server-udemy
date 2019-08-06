const express = require('express');
const Medico = require('../models/medico');
const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

// List medicos
app.get('/', (req, res, next) => {
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    Medico.find({})
        .skip(skip)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando medico',
                    errors: err
                });
            }
            
            Medico.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    data: medicos,
                    total: total
                });
            });
        });
});

// Create medico
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    const body = req.body;

    const medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.calledBy,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                message: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            data: medicoGuardado,
            author: req.calledBy
        })
    });

});

// Update medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Medico.findById( id, ( err, medico ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar medico',
                errors: err
            });
        }

        if ( !medico ){
            return res.status(400).json({
                ok: false,
                message: 'El medico con el id ' + id + ' no existe ',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        const body = req.body;
        medico.nombre = body.nombre;
        // medico.img = body.img;
        medico.usuario = req.calledBy;
        // medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                data: medicoGuardado
            });
        });
    });
});

// Delete medico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no existe',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    })
});

module.exports = app;
