const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const rolesValidos = {
   values: ['ADMIN_ROLE', 'USER_ROLE'],
   message: '{VALUE} no es un rol permitido'
};

const usuarioSchema = new Schema({
   nombre: { type: String, required: [true, 'Nombre es obligatorio'] },
   email: { type: String, unique: [true, 'Email es obligatorio'] },
   password: { type: String, required: [true, 'Password es obligatorio'] },
   img: { type: String, required: false},
   role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe ser único' } )
module.exports = mongoose.model('Usuario', usuarioSchema);