const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }

    //Valida tipo
    let tipoValidos = ['productos', 'usuarios'];

    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos on ' + tipoValidos.join(', ')
            }
        })
    }


    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son:' + extensionesPermitidas.join(', '),
                ext: extension
            }
        })
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds}.${extension}`;
    // Ejemplo: 132323323-123.jpg

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //Aqui, imagen cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // })
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }
    });

    if (!usuarioDB) { //Si el usuario no existe
        borraArchivo(nombreArchivo, 'usuarios');
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Usuario no existe'
            }
        })
    }

    // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
    // if (fs.existsSync(pathImagen)) {
    //     fs.unlinkSync(pathImagen);
    // }

    borraArchivo(usuarioDB.img, 'usuarios')

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, UsuarioGuardado) => {
        res.json({
            ok: true,
            usuario: UsuarioGuardado,
            img: nombreArchivo
        })

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            })
        }
    });

    if (!productoDB) { //Si el producto no existe
        borraArchivo(nombreArchivo, 'productos');
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Producto no existe'
            }
        })
    }

    borraArchivo(productoDB.img, 'productos')

    productoDB.img = nombreArchivo;
    productoDB.save((err, ProductoGuardado) => {
        res.json({
            ok: true,
            producto: ProductoGuardado,
            img: nombreArchivo
        })

    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;