'use strict';

const express = require('express');
const cors = require('cors');
// const data = require('./Movie_Data/data.json');
const server = express();
require('dotenv').config();

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.json());// Middleware function If I want to read data from post request method, because the passed data should be wrriten in json format

const apiKey = process.env.api_key;
const PORT = process.env.PORT || 3001;
server.use(cors());   // Middleware function 
const axios = require('axios');



//Lab13 routes:
//localhost:3000/
// server.get('/', (req, res) => {
//     let movie=new Movie(data.title,data.poster_path,data.overview);
//      res.status(200).send(movie);
//  })

//localhost:3000/favorite
server.get('/favorite', (req, res) => {
    res.status(200).send("Welcome to Favorite Page");
})



//Lab14 routes:
// server.get('/trending', trendingMoviesHandler)
server.get('/search', searchMoviesHandler)
server.get('/topRated', topRatedhMoviesHandler)
server.get('/upcoming', upcominghMoviesHandler)
server.get('/tvShowsPopular', tvShowsPopularHandler)
server.get('/popularPeople', popularPeopleHandler)


//Lab15 routes:
server.get('/getMovies', getMoviesHandler)
server.post('/getMovies', addMovieHandler)


//Lab16 routes:
server.put('/getMovies/:id', updateMoviesHandler)
server.delete('/getMovies/:id', deleteMoviesHandler)
server.get('/getMoviesById', geteMoviesByIdHandler)

//Lab18 routes:
server.get('/trending', trendingMoviesHandler)
server.post('/addToFav', addToFavMoviesHandler)
server.get('/getFavMovies', getFavMoviesHandler)


server.get('*', defaultHandler)

//Lab15 functions:
function addMovieHandler(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO movie (title, release_date, poster_path, overview)
    VALUES ($1, $2, $3, $4);`
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview];
    client.query(sql, values)
        .then(data => {
            res.send("The movie has been added successfully");
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}
function getMoviesHandler(req, res) {
    // Retrive all movies from my database which is lab15
    const sql = `SELECT * FROM movie`;
    client.query(sql)
        .then(data => {
            res.send(data.rows);//.rows in order to git just the records
        })

        .catch((error) => {
            errorHandler(error, req, res)
        })
}



//Lab16 functions:
function updateMoviesHandler(req, res) {
    const { id } = req.params;
    console.log(req.body);
    const sql = `UPDATE movie
    SET title = $1, release_date = $2, poster_path = $3, overview = $4
    WHERE id = ${id};`
    const { title, release_date, poster_path, overview } = req.body;
    const values = [title, release_date, poster_path, overview];
    client.query(sql, values).then((data) => {
        res.send(data)
    })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}

function deleteMoviesHandler(req, res) {
    const id = req.params.id;
    console.log(req.params);
    const sql = `DELETE FROM movie WHERE id=${id};`
    client.query(sql)
        .then((data) => {
            res.status(202).send(data)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}

function geteMoviesByIdHandler(req, res) {
    let id = req.query.id;
    console.log(req.query);
    const sql = `SELECT * FROM movie WHERE id = ${id};`
    client.query(sql)
        .then((data) => {
            res.send(data.rows)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}


//lab17/////////////////////////
function addToFavMoviesHandler(req, res) {
    // to push a movies to the favmovie table in database which is lab18
    console.log("we got fav movie from the FE");
    const favmovie = req.body;
    console.log(favmovie);
    const sql = `INSERT INTO favmovies (title, release_date, poster_path, overview, comment)
    VALUES ($1, $2, $3, $4, $5);`
    const values = [favmovie.title, favmovie.release_date, favmovie.poster_path, favmovie.overview, favmovie.comment];
    client.query(sql, values)
        .then(data => {
            res.send("The movie has been added successfully to the FavList");
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}


function getFavMoviesHandler(req, res) {
    // Retrive all fav movies from my database which is lab18
    const sql = `SELECT * FROM favmovies`;
    client.query(sql)
        .then(data => {
            res.send(data.rows);//.rows in order to git just the records
            console.log("Fav movies in DB",data.rows);
        })

        .catch((error) => {
            errorHandler(error, req, res)
        })
}
///////////////////////////////////////////////////////////////////////////////



//Get the all (Include all movies, TV shows and people in the results as a global trending list) weekly(View the trending list for the week) trending items
function trendingMoviesHandler(req, res) {

    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`
    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);
                console.log("we have a req from FE");
                console.log(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Search for a movie with query "the" on TMDB
function searchMoviesHandler(req, res) {

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${"Love"}&page=2`
    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Get the top rated movies on TMDB
function topRatedhMoviesHandler(req, res) {

    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new TopRatedMovie(item.id, item.title, item.vote_average, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Get a list of upcoming movies in theatres. This is a release type query that looks for all movies that have a release type of 2 or 3 within the specified date range
function upcominghMoviesHandler(req, res) {

    const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=2`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Get a list of the current popular TV shows on TMDB
function tvShowsPopularHandler(req, res) {

    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleMovie = new Item(item.id, item.title, item.release_date, item.poster_path, item.overview);
                    return singleMovie;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Get the list of popular people on TMDB 
function popularPeopleHandler(req, res) {

    const url = `https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&language=en-US&page=1`

    try {
        axios.get(url)
            .then(result => {
                let mapResult = result.data.results.map(item => {
                    let singleperson = new Person(item.name, item.gender, item.known_for_department, item.known_for)
                    return singleperson;
                })
                res.send(mapResult);

            })
            .catch((error) => {
                console.log('sorry you have something error', error);
                res.status(500).send(error);
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//Create a function to handle "server error" status(500)
function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

//Create a function to handle "page not found error" (status 404)
function defaultHandler(req, res) {
    res.status(404).send('page not found !')
}



//constructors:
function Movie(title,poster_path,overview){
    this.title=title;
    this.poster_path=poster_path;
    this.overview=overview;
}

function Item(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function TopRatedMovie(id, title, vote_average, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.vote_average = vote_average;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function Person(name, gender, known_for_department, known_for) {
    this.name = name;
    this.gender = gender;
    this.known_for_department = known_for_department;
    this.known_for = known_for.map(item => {
        let title = item.title;
        return title;
    })
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Listening on ${PORT}: I'm ready`)
        })
    })

