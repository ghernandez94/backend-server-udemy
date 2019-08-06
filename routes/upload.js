const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');
const app = express();

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    const tipo = req.params.tipo;
    const id = req.params.id;
    const validTypes = ['usuarios', 'hospitales', 'medicos'];

    if (validTypes.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no válido',
            errors: { mensaje: 'Los tipos permitidos son: ' + validTypes.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se encontraron imágenes',
            errors: { mensaje: 'No se encontraron imágenes' }
        });
    }

    const file = req.files.imagen;
    const fileName = file.name.split('.');
    const extension = fileName[fileName.length - 1].toLowerCase();
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if (validExtensions.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            errors: { mensaje: 'Las extensiones válidas son: ' + validExtensions.join(', ') }
        });
    }

    const newFileName = `${id}-${new Date().getMilliseconds()}.${extension}`;
    const path = `./uploads/${tipo}/${newFileName}`;

    getObject(id, tipo).then(object => {
        if (!object) {
            return res.status(400).json({
                ok: false,
                mensaje: `No se encontraron registros en ${tipo} con el id: ${id}`
            });
        }

        // Establece antigua ruta del archivo
        const oldPath = `./uploads/${tipo}/${object.img}`;

        file.mv(path, err => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
            }

            // Actualiza nombre de imagen
            object.img = newFileName;

            object.save((err, objectUpdated) => {
                if (err) {
                    // Si ocurre algún error al actualizar registro, elimina el nuevo archivo.
                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrió un error al actualizar registro',
                        errors: { mensaje: err }
                    });
                }

                // Si existe, elimina el archivo
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido correctamente',
                    data: objectUpdated
                });
                
            })
        });
    }).catch(err => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Ocurrió un error al subir el archivo',
            errors: { mensaje: err }
        });
    })
});

function getObject(id, tipo) {
    let model;

    switch (tipo) {
        case 'usuarios':
            model = Usuario;
            break;
        case 'hospitales':
            model = Hospital;
            break;
        case 'medicos':
            model = Medico;
            break;
    }

    return new Promise((resolve, reject) => {
        model.findById(id, (err, object) => {
            if ( err ) {
                reject( 'Error al realizar búsqueda en BD', err );
            } else {
                resolve(object);
            }
        });
    });
}

module.exports = app;
