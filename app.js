const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `

    SELECT 
    movie_name
    FROM 
     movie
    ORDER BY
      movie_id;`;

  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachPlayer) =>
      convertDbObjectToResponseObject1(eachPlayer)
    )
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addmovieQuary = `

    INSERT INTO

    movie ( director_id , movie_name, lead_actor)

    VALUES 
    (
        ${directorId},
        '${movieName}',
         '${leadActor}'
    );`;
  const dbResponse = await db.run(addmovieQuary);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      movie_id AS movieId,
      director_id AS directorId,
      movie_name AS movieName,
      lead_actor AS leadActor
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  const movieArray = await db.get(getMovieQuery);
  response.send(movieArray);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT 
    *
    FROM 
     director
    ORDER BY
      director_id;`;

  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachPlayer) =>
      convertDbObjectToResponseObject2(eachPlayer)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorBooksQuery = `
    SELECT
     movie_name AS movieName
    FROM
     movie
    WHERE
      director_id = ${directorId};`;

  const directorArray = await db.all(getDirectorBooksQuery);
  response.send(directorArray);
});

module.exports = app;
