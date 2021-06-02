// Including Express, Body Parser, and Mongoose.
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Get access to the promotions.js file under the models folder.
const Promotions = require('../modals/promotions');
const promoRouter = express.Router();

// This allows us to parse the body of the request message in JSON format.
promoRouter.use(bodyParser.json());

// endpoint on /promotions
promoRouter.route('/')
.get((req,res,next) => {
    Promotions.find({}) // Use the find method in Mongoose to find all the promotions.
    .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        // Takes an input as json string and sent it back to the client.
        res.json(promotions);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    Promotions.create(req.body)
    .then((promotion) => {
        console.log('Promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

// endpoint on /promotions/:promotionId
promoRouter.route('/:promotionId')
.get((req,res,next) => {
    Promotions.findById(req.params.promotionId)
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promotionId);
})
.put((req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId, {
        $set: req.body
    }, { new: true })
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});






// // Declaring this here saying that this Express Module is required.
// const express = require('express');
// const bodyParser = require('body-parser');

// const promoRouter = express.Router();

// // This allows us to parse the body of the request message in JSON format.
// promoRouter.use(bodyParser.json());

// // endpoint on /promotions
// promoRouter.route('/')
// .all((req,res,next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
// .get((req,res,next) => {
//     res.end('Will send all the promotions to you!');
// })
// .post((req, res, next) => {
//     res.end('Will add the promotion: ' + req.body.name + ' with details: ' + req.body.description);
// })
// .put((req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /promotions');
// })
// .delete((req, res, next) => {
//     res.end('Deleting all promotions');
// });

// // endpoint on /promotions/:promoId
// promoRouter.route('/:promoId')
// .get((req,res,next) => {
//     res.end('Will send details of the promotions: ' + req.params.promoId +' to you!');
// })
// .post((req, res, next) => {
//     res.statusCode = 403;
//     res.end('POST operation not supported on /promotions/'+ req.params.promoId);
// })
// .put((req, res, next) => {
//     res.write('Updating the promotion: ' + req.params.promoId + '\n');
//     res.end('Will update the promotion: ' + req.body.name + 
//             ' with details: ' + req.body.description);
// })
// .delete((req, res, next) => {
//     res.end('Deleting promotion: ' + req.params.promoId);
// });


module.exports = promoRouter;