import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import icons from 'url:../img/icons.svg'; //parcel

import 'core-js/stable'; //polyfilling
import 'regenerator-runtime/runtime'; //polyfilling

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //* 0. update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //* 1. Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //* 2. loading recipe
    await model.loadRecipe(id);

    //* 3. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //* 1. get search query
    const query = searchView.getQuery();
    if (!query) return;

    //* 2. load search results
    await model.loadSearchResults(query);

    //* render search results
    resultsView.render(model.getSearchResultsPage());

    //* render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  //* render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //* render new pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //* 1. update the recipe servings in the state
  model.updateServings(newServings);
  //* 2. update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //* 1. add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //* 2. update recipe view
  recipeView.update(model.state.recipe);

  //* 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//handler function
const controlAddRecipe = async function (newRecipe) {
  try {
    // render spinner
    addRecipeView.renderSpinner();

    // upload recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmarkView
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💣💣💣', err);
    addRecipeView.renderError(err.message);
  }
};

//publisher subscriber pattern. controlRecipes is executed in recipeView which is subscribed to controller
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// clearBookmarks();
