const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/:tipo/:img', (req, res, next) => {
    const tipo = req.params.tipo;
    const img = req.params.img;
    const pathImage = path.resolve( __dirname, `../uploads/${tipo}/${img}`);

    if( fs.existsSync(pathImage) ){
        res.sendFile( pathImage );
    }else{
        res.sendFile( path.resolve( __dirname, '../assets/no-img.jpg') );
    }
});

module.exports = app;
