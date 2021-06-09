const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(body_parser.json());

dishRouter.route('/')
    .get((request, response, next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dishes);
                },
                (error) => {
                    next(error)

                })
            .catch((error) => next(error));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.create(request.body)
            .then((dish) => {
                    console.log('Dish created', dish);
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dish);
                },
                (error) => {
                    next(error)
                })
            .catch((error) => {
                next(error);
            })
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.code = 403;
        response.end("Operation not supported ");
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.remove({})
            .then((resp) => {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.json(resp);
            }, (error) => {
                next(error)
            })
            .catch((error) => {
                next(error);
            })
    });

dishRouter.route('/:dishId')
    .get((request, response, next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dish);
                },
                (error) => {
                    next(error);
                })
            .catch((error) => {
                next(error);
            })
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.code = 403;
        response.end("POST Operation not supported ");
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findByIdAndUpdate(request.params.dishId, {
            $set: request.body
        }, {
            new: true
        })
            .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dish);
                },
                (error) => {
                    next(error);
                })
            .catch((error) => {
                next(error);
            })
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findByIdAndRemove(request.params.dishId)
            .then((resp) => {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.json(resp);
            }, (error) => {
                next(error)
            })
            .catch((error) => {
                next(error);
            })
    });

dishRouter.route('/:dishId/comments')
    .get((request, response, next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                    if (dish != null) {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(dish.comments);
                    } else {
                        error = new Error('Dish ' + request.params.dishId + " not found");
                        error.status = 404;
                        return next(error);
                    }

                },
                (error) => {
                    next(error)
                })
            .catch((error) => next(error));
    })
    .post(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId)
            .then((dish) => {
                    if (dish != null) {
                        request.body.author = request.user._id;
                        dish.comments.push(request.body);
                        dish.save()
                            .then((dish) => {
                                    Dishes.findById(dish._id)
                                        .populate('comments.author')
                                        .then((dish) => {
                                            response.statusCode = 200;
                                            response.setHeader('Content-Type', 'application/json');
                                            response.json(dish);
                                        })

                                },
                                (error) => {
                                    next(error);
                                });
                    } else {
                        error = new Error('Dish ' + request.params.dishId + " not found");
                        error.status = 404;
                        return next(error);
                    }
                },
                (error) => {
                    next(error)
                })
            .catch((error) => {
                next(error);
            })
    })
    .put(authenticate.verifyUser, (request, response, next) => {
        response.code = 403;
        response.end("Operation not supported ");
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findById(request.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (let i = (dish.comments.length - 1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                                response.statusCode = 200;
                                response.setHeader('Content-Type', 'application/json');
                                response.json(dish);
                            },
                            (error) => {
                                next(error);
                            });

                } else {
                    error = new Error('Dish ' + request.params.dishId + " not found");
                    error.status = 404;
                    return next(error);
                }
            })
    });

dishRouter.route('/:dishId/comments/:commentId')
    .get((request, response, next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                    if (dish != null && dish.comments.id(request.params.commentId) != null) {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(dish.comments.id(request.params.commentId));
                    } else if (dish == null) {
                        error = new Error('Dish ' + request.params.dishId + " not found");
                        error.status = 404;
                        return next(error);
                    } else {
                        error = new Error('Comment ' + request.params.commentId + " not found");
                        error.status = 404;
                        return next(error);
                    }
                },
                (error) => {
                    next(error);
                })
            .catch((error) => {
                next(error);
            })
    })
    .post(authenticate.verifyUser, (request, response, next) => {
        response.code = 403;
        response.end("POST Operation not supported ");
    })
    .put(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId)
            .then((dish) => {
                    if (dish != null && dish.comments.id(request.params.commentId) != null) {
                        if (dish.comments.id(request.params.commentId).author.equals(request.user._id)) {
                            if (request.body.rating) {
                                dish.comments.id(request.params.commentId).rating = request.body.rating;
                            }
                            if (request.body.comment) {
                                dish.comments.id(request.params.commentId).comment = request.body.comment;
                            }
                            dish.save()
                                .then((dish) => {
                                        Dishes.findById(dish._id)
                                            .populate('comments.author')
                                            .then((dish) => {
                                                response.statusCode = 200;
                                                response.setHeader('Content-Type', 'application/json');
                                                response.json(dish);
                                            })
                                    },
                                    (error) => {
                                        next(error);
                                    })
                        } else {
                            var err = new Error('You are not allowed to modify this comment!');
                            err.status = 403;
                            return next(err);
                        }
                    } else if (dish == null) {
                        error = new Error('Dish ' + request.params.dishId + " not found");
                        error.status = 404;
                        return next(error);
                    } else {
                        error = new Error('Comment ' + request.params.commentId + " not found");
                        error.status = 404;
                        return next(error);
                    }
                },
                (error) => {
                    next(error);
                })
            .catch((error) => {
                next(error);
            })
    })
    .delete(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comments.id(request.params.commentId) != null) {
                    if (dish.comments.id(request.params.commentId).author.equals(request.user._id)) {
                        dish.comments.id(request.params.commentId).remove();
                        dish.save()
                            .then((dish) => {
                                    Dishes.findById(dish._id)
                                        .populate('comments.author')
                                        .then((dish) => {
                                            response.statusCode = 200;
                                            response.setHeader('Content-Type', 'application/json');
                                            response.json(dish);
                                        })
                                },
                                (error) => {
                                    next(error);
                                })
                    } else {
                        var err = new Error('You are not allowed to delete this comment!');
                        err.status = 403;
                        return next(err);}
                } else if (dish == null) {
                    error = new Error('Dish ' + request.params.dishId + " not found");
                    error.status = 404;
                    return next(error);
                } else {
                    error = new Error('Comment ' + request.params.commentId + " not found");
                    error.status = 404;
                    return next(error);
                }

            })
            .catch((error) => {
                next(error);
            })
    });

module.exports = dishRouter;