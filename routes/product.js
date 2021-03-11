const express = require('express');
const Product= require('./../model/Product');
const router = express.Router();
const multer = require('multer');

//define storage for the images

const storage = multer.diskStorage({
    //destination for files
    destination: function (request, file, callback) {
        callback(null, './public/uploads/images');
    },

    //add back the extension
    filename: function (request, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});
//upload parameters for multer
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3,
    },
});




router.get('/new',(req,res)=>{
    res.render('addProduct');
});

//route that handles new post
router.post('/add', upload.single('image'), (request, response) => {

    let product = new Product({
        productName: request.body.productName,
        price: request.body.price,
        img: request.file.filename,
    });

    try {
         product.save();
         response.redirect('/admin')
        //response.redirect(`new/${product.slug}`);
    } catch (error) {
        console.log(error);
    }
});


//u must be logged in to access admin panel
router.get('/admin', async (request, response) => {
    if (request.isAuthenticated()){
        let products = await Product.find();

        response.render('admin', { products: products });
    }
    else {
        response.redirect("/signin");
    }

});




///route to handle delete
router.delete('/:id', async (request, response) => {
    await Product.findByIdAndDelete(request.params.id);
    response.redirect('/admin');
});
module.exports = router;