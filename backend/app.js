const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe');

const expressApp = express();

mongoose.connect('mongodb+srv://Budodi:5FxPqvZoigWeAHYx@cluster0-tkjqa.mongodb.net/test?retryWrites=true', { useNewUrlParser: true })
	.then(() => {
		console.log('successfully connected to MongoDB Atlas!');
	})
	.catch((error) => {
		console.log('Unable to connect to MongoDB Atlas!');
		console.error(error);
	});


expressApp.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	next();
});

expressApp.use(bodyParser.json()); // bodyParser passes new request body

expressApp.post('/api/recipes', (req, res, next) => {
	const recipe = new Recipe({
		title: req.body.title,
		ingredients: req.body.ingredients,
		instructions: req.body.instructions,
		difficulty: req.body.difficulty,
		time: req.body.time
	});

	recipe.save().then( //then() sends response back to the client(i.e frontend) to prevent request from timing out
		() => {
			res.status(201).json({
				message: 'Post saved successfully!'
			});
		}
		).catch(
		(error) => {
			res.status(400).json({ // 400 status code is for error
				error: error
			});
		});
});


// :id is an accessible dynamic parameter
expressApp.get('/api/recipes/:id', (req, res, next) => {
	Recipe.findOne({ // finds single recipe with the same id as the request parameter
		_id: req.params.id
	}).then(
	(recipe) => { // that recipe is then returned in a promise and sent back to frontend
		res.status(200).json(recipe);
	}
	).catch(
	(error) => {
		res.status(404).json({ // if no recipe found an error occur, we send 404 error to frontend
			error: error
		});
	});
});

expressApp.put('/api/recipes/:id', (req, res, next) => {
	const recipe = new Recipe({
		_id: req.params.id,
		title: req.body.title,
		ingredients: req.body.ingredients,
		instructions: req.body.instructions,
		difficulty: req.body.difficulty,
		time: req.body.time
	});

	Recipe.updateOne({_id: req.params.id}, recipe).then(
		() => {
			res.status(201).json({
				message: 'Recipe updated successfully!'
			});
		}
		).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		});
});

expressApp.delete('/api/recipes/:id', (req, res, next) => {
	Recipe.deleteOne({_id: req.params.id}).then(
		() => {
			res.status(200).json({
				message: 'Deleted!'
			});

		}).catch(
			(error) => {
				res.status(400).json({
					error: error
				});
		});
});

// find() return an array containing all the recipes in our
//database(recipe object will be turned to recipes array and returned)
expressApp.use('/api/recipes', (req, res, next) => {
	Recipe.find().then( /* find() is used to options object which allow to
			search for a recipe b4 certain day or recipes with certain name
			but since the find() is empty we are finding all the recipe database*/
		(recipes) => { // note recipes array received and returned to the frontend
			res.status(200).json(recipes);
		}
		).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		});
});


module.exports = expressApp;
