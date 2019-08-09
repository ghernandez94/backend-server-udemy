const express = require('express');
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

const app = express();

app.get('/:table/:search', (req, res, next) => {
    const table = req.params.table;
    const search = req.params.search;
    const regex = new RegExp(search, 'i');
    let promise;

    switch( table ){
        case 'usuarios':
            promise = buscarUsuarios(regex);
            break;
        case 'hospitales':
            promise = buscarHospitales(regex);
            break;
        case 'medicos':
            promise = buscarMedicos(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son: usuarios, hospitales y medicos'
            });
    }

    promise.then(result => {
        return res.status(200).json({
            ok: true, 
            [table]: result
        });
    });
});

app.get('/all/:search', (req, res, next) => {
    const search = req.params.search;
    const regex = new RegExp(search, 'i');

    Promise.all([ 
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex) ])
        .then(result => {
            return res.status(200).json({
                ok: true, 
                hospitales: result[0],
                medicos: result[1],
                usuarios: result[2]
            });
        });
});

function buscarHospitales(search) {
    return new Promise( (resolve, reject) => {
        Hospital.find({ nombre: search })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if( err ){
                    reject('Error al cargar hospitales', err);
                }else{
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(search) {
    return new Promise( (resolve, reject) => {
        Medico.find({ nombre: search })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if( err ){
                    reject('Error al cargar medicos', err);
                }else{
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(search) {
    return new Promise( (resolve, reject) => {
        Usuario.find({}, 'nombre email img role google')
            .or( { 'nombre': search }, { 'email': search })
            .exec((err, usuarios) => {
                if( err ){
                    reject('Error al cargar usuarios', err);
                }else{
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;
