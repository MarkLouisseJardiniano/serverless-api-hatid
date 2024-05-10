const express = require('express');
const RecipesModel = require('../models/recipe');

const router = express.Router();
// GET all recipe
router.get('/', async (req, res) => {
    try {
        const recipes = await RecipesModel.find();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})
// GET all recipes or search by ingredients
// GET all recipes or search by ingredients and/or cuisine
router.get('/', async (req, res) => {
    try {
        let query = {};

        // Check if ingredients query parameter exists
        if (req.query.ingredients) {
            query.ingredients = { $regex: req.query.ingredients, $options: 'i' };
        }

        // Check if cuisine query parameter exists
        if (req.query.cuisine) {
            query.cuisine = req.query.cuisine.toLowerCase();
        }

        // Use the query object to filter recipes
        const recipes = await RecipesModel.find(query);
        
        // Send the matched recipes as the response
        res.json(recipes);
    } catch (err) {
        // Handle any errors
        res.status(500).json({ message: err.message });
    }
});

// GET a single recipe by ID
router.get('/:id', getRecipe, (req, res) => { 
    // Send the retrieved recipe as the response
    res.json(res.recipes);
});

// Create a new author
router.post('/', async (req, res) => {
    try {
        const {name, ingredients, cuisine} = req.body;
        if (!name || !ingredients || !cuisine) {
            return res.status(400).json({ message: 'Name, ingredients, and cuisine are required' });
        }
        
        const existingRecipe = await RecipesModel.findOne({ name: req.body.name });
        if (existingRecipe) {
            return res.status(400).json({ message: 'Recipe already exists' });
        }
        
        const newRecipe = new RecipesModel(req.body);
        const savedRecipe = await newRecipe.save();
        res.status(201).json({ message: 'Recipe created successfully', recipe: savedRecipe });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing author partially
router.patch('/:id', getRecipe, async (req, res) => {
    try {
        if (req.body.name !== undefined) {
            res.recipe.name = req.body.name;
        }
        const updatedRecipe = await res.recipe.save();
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an existing author completely
router.put('/:id', getRecipe, async (req, res) => {
    try {
        const updatedRecipe = await RecipesModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an author
router.delete('/:id', getRecipe, async (req, res) => {
    try {
        await res.recipe.deleteOne(); // Use the retrieved recipe object to delete it
        res.json({ message: 'Recipe deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Middleware function to get a single author by ID
async function getRecipe(req, res, next) {
    try {
        const recipe = await RecipesModel.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' }); 
        }
        res.recipe = recipe;
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = router;
