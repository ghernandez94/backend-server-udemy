const express = require('express');
const Hospital = require('../models/hospital');
const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

// Get hospital
app.get('/:id', mdAutenticacion.verificaToken, (req, res, next) => {
    const id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec(
            (err, hospital) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            if( !hospital ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'No existe hospital con ese id' }
                });
            }

            res.status(200).json({
                ok: true,
                data: hospital
            });
        });
});


// List hospitals
app.get('/', (req, res, next) => {
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 0;
    limit = Number(limit);

    Hospital.find({})
        .skip(skip)
        .limit(limit)
        .populate('usuario')
        .exec(
            (err, hospitales) => {
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }
            
            Hospital.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    data: hospitales,
                    total: total
                });
            });
        });
});

// Create hospital
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    const body = req.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.calledBy._id
    });

    hospital.save( (err, hospitalGuardado) => {
        if ( err ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            data: hospitalGuardado
        })
    });

});

// Update hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Hospital.findById( id, ( err, hospital ) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if ( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe ',
                errors: { message: 'No existe hospital con ese id' }
            });
        }

        const body = req.body;
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        // hospital.usuario = req.calledBy

        hospital.save( (err, hospitalGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                data: hospitalGuardado
            });
        });
    });
});

// Delete hospital
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital no existe',
                errors: { message: 'No existe hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            data: hospitalBorrado
        });
    })
});

module.exports = app;
