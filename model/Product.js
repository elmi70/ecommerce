const mongoose=require('mongoose');
const slug = require('mongoose-slug-generator');




//initialize slug
mongoose.plugin(slug);
const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    img:{
        type:String,
        default:"img.png"
    },
    slug: { type: String, slug: 'productName', unique: true, slug_padding_size: 2 },
});


module.exports= mongoose.model('Product',productSchema);