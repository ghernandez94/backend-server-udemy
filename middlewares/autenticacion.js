const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

exports.verificaToken = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(401).json({
            ok: false,
            mensaje: 'Unauthorized',
            errors: { message: 'No se proporcionó encabezado de autorización' }
        });
    }

    if(!req.headers.authorization.startsWith("Bearer ")){
        return res.status(401).json({
            ok: false,
            mensaje: 'Unauthorized',
            errors: { message: 'Autorización inválida' }
        });
    }

    const token = req.headers.authorization.substring(7, req.headers.authorization.length);

    jwt.verify( token, SEED, (err, decoded ) => {
        if( err ){
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.calledBy = decoded.usuario._id;
        next();
    });
}
