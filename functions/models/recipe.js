const mongoose = require('mongoose');
const recipeSchema = require('../schema/recipe');

const RecipeModel = mongoose.model('Recipe', recipeSchema);

module.exports = RecipeModel;   