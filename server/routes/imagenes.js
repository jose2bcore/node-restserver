const express = require('express');

const fs = require('fs');
const path = rrquire('path');
const { verificaToken } = require('../middlewares/autenticacion');
let app = express();


app.get(`/imagen/:tipo/:img`, verificaToken, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = `./uploads/${tipo}/${img}`;
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let noImafePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImafePath);
    }
});


module.exports = app;