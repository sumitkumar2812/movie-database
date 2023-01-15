const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app = express();

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

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    *
    FROM 
    movie
    ORDER BY
    movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
