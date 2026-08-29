/* =====================================================
   MOVIEVERSE
   JAVASCRIPT FINAL PROJECT

   Features:
   1. API Fetching
   2. Search
   3. Dynamic Results
   4. Loading State
   5. Genre Filtering
   6. Sorting
   7. Error Handling
===================================================== */


/* =====================================================
   1. OMDb API
===================================================== */

/*
    Get your API key from:
    https://www.omdbapi.com/

    Replace YOUR_API_KEY with your actual API key.
*/

const API_KEY = "b409e96b";

const API_URL = "http://www.omdbapi.com";


/* =====================================================
   2. GET HTML ELEMENTS
===================================================== */

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

const movieGrid =
    document.getElementById("movieGrid");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const noResults =
    document.getElementById("noResults");

const genreFilter =
    document.getElementById("genreFilter");

const sortFilter =
    document.getElementById("sortFilter");

const resultsMessage =
    document.getElementById("resultsMessage");

const exploreButton =
    document.getElementById("exploreButton");


/* =====================================================
   3. STORE MOVIES
===================================================== */

/*
    This array stores the movies returned
    by the API.
*/

let movies = [];


/* =====================================================
   4. SEARCH MOVIES
===================================================== */

async function searchMovies(searchTerm) {

    /*
        Show loading message before
        making the API request.
    */

    showLoading();


    /*
        Remove previous messages.
    */

    hideMessages();


    try {

        /*
            Create the API URL.

            encodeURIComponent() makes the search
            safe to use inside a URL.
        */

        const url =
            `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie`;


        /*
            Fetch data from the OMDb API.
        */

        const response =
            await fetch(url);


        /*
            Convert the response into JSON.
        */

        const data =
            await response.json();


        /*
            Check if OMDb returned an error.
        */

        if (data.Response === "False") {

            throw new Error(
                data.Error || "No movies found."
            );

        }


        /*
            Get detailed information for
            the movies returned by the search.
        */

        movies =
            await getMovieDetails(data.Search);


        /*
            Remove movies that failed to load.
        */

        movies =
            movies.filter(movie => movie !== null);


        /*
            If no movies remain, show
            the no-results message.
        */

        if (movies.length === 0) {

            showNoResults();

            return;

        }


        /*
            Create the genre filter
            using the returned movies.
        */

        createGenreFilter();


        /*
            Display the movies.
        */

        applyFilters();


    } catch (error) {

        /*
            If something goes wrong,
            show an error message.
        */

        console.error(error);

        showError(error.message);

    } finally {

        /*
            Always hide the loading spinner
            after the API request finishes.
        */

        hideLoading();

    }

}


/* =====================================================
   5. GET MOVIE DETAILS
===================================================== */

async function getMovieDetails(movieList) {

    /*
        The OMDb search API gives us basic
        movie information.

        We make another request for each movie
        to get details such as:

        - Genre
        - IMDb rating
        - Director
        - Plot
    */


    const movieRequests =
        movieList.slice(0, 10).map(async movie => {

            try {

                const url =
                    `${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`;


                const response =
                    await fetch(url);


                const data =
                    await response.json();


                if (data.Response === "True") {

                    return data;

                }


                return null;

            } catch (error) {

                console.error(
                    "Could not get movie details:",
                    error
                );

                return null;

            }

        });


    /*
        Promise.all waits for all API requests
        to finish.
    */

    return await Promise.all(movieRequests);

}


/* =====================================================
   6. DISPLAY MOVIES
===================================================== */

function displayMovies(movieList) {

    /*
        Clear the current movie cards.
    */

    movieGrid.innerHTML = "";


    /*
        Check if there are no movies
        after filtering.
    */

    if (movieList.length === 0) {

        showNoResults();

        return;

    }


    /*
        Create a movie card for every movie.
    */

    movieList.forEach(movie => {

        const movieCard =
            createMovieCard(movie);

        movieGrid.appendChild(movieCard);

    });


    /*
        Update the message above the results.
    */

    resultsMessage.textContent =
        `Showing ${movieList.length} movie(s).`;

}


/* =====================================================
   7. CREATE MOVIE CARD
===================================================== */

function createMovieCard(movie) {

    /*
        Create an article element.
    */

    const card =
        document.createElement("article");


    card.className = "movie-card";


    /*
        OMDb sometimes does not have
        a movie poster.

        We use a placeholder in that case.
    */

    const poster =
        movie.Poster !== "N/A"
            ? movie.Poster
            : "https://via.placeholder.com/400x600/10161e/ffffff?text=No+Poster";


    /*
        Get IMDb rating.

        If no rating exists, use N/A.
    */

    const rating =
        movie.imdbRating !== "N/A"
            ? movie.imdbRating
            : "N/A";


    /*
        Add the movie information
        to the card.
    */

    card.innerHTML = `

        <div class="movie-poster-container">

            <img
                class="movie-poster"
                src="${poster}"
                alt="${escapeHTML(movie.Title)} poster"
                loading="lazy"
            >

            <span class="movie-year">
                ${movie.Year || "N/A"}
            </span>

        </div>


        <div class="movie-info">

            <h3 class="movie-title">
                ${escapeHTML(movie.Title)}
            </h3>

            <p class="movie-genre">
                ${movie.Genre || "Genre unavailable"}
            </p>

            <div class="movie-rating">
                ⭐
                <span>${rating}</span>
            </div>

        </div>

    `;


    /*
        Add a click event.

        When the user clicks a movie,
        we show a simple alert with
        additional movie information.

        This demonstrates DOM events.
    */

    card.addEventListener("click", () => {

        showMovieDetails(movie);

    });


    return card;

}


/* =====================================================
   8. SHOW MOVIE DETAILS
===================================================== */

function showMovieDetails(movie) {

    /*
        For this final-project version,
        we keep the details feature simple.

        A modal could be added later,
        but this keeps the project easy
        to explain.
    */

    const message = `

${movie.Title}

Year: ${movie.Year || "N/A"}

Genre: ${movie.Genre || "N/A"}

Director: ${movie.Director || "N/A"}

IMDb Rating: ${movie.imdbRating || "N/A"}

Plot:
${movie.Plot || "No plot available."}

    `;


    alert(message);

}


/* =====================================================
   9. CREATE GENRE FILTER
===================================================== */

function createGenreFilter() {

    /*
        Clear the current options.
    */

    genreFilter.innerHTML = `

        <option value="all">
            All Genres
        </option>

    `;


    /*
        Create a Set.

        A Set automatically prevents
        duplicate genres.
    */

    const genres = new Set();


    /*
        Go through every movie.
    */

    movies.forEach(movie => {

        if (!movie.Genre ||
            movie.Genre === "N/A") {

            return;

        }


        /*
            A movie can have multiple genres.

            Example:

            "Action, Adventure, Sci-Fi"
        */

        const movieGenres =
            movie.Genre.split(",");


        movieGenres.forEach(genre => {

            genres.add(genre.trim());

        });

    });


    /*
        Sort the genres alphabetically.
    */

    const sortedGenres =
        [...genres].sort();


    /*
        Add each genre to the dropdown.
    */

    sortedGenres.forEach(genre => {

        const option =
            document.createElement("option");


        option.value = genre;

        option.textContent = genre;


        genreFilter.appendChild(option);

    });

}


/* =====================================================
   10. FILTER + SORT
===================================================== */

function applyFilters() {

    /*
        Make a copy of the movie array.

        This prevents us from changing
        the original API data.
    */

    let filteredMovies =
        [...movies];


    /* =========================
       GENRE FILTER
    ========================== */

    const selectedGenre =
        genreFilter.value;


    if (selectedGenre !== "all") {

        filteredMovies =
            filteredMovies.filter(movie => {

                if (!movie.Genre) {

                    return false;

                }


                const movieGenres =
                    movie.Genre
                        .split(",")
                        .map(genre => genre.trim());


                return movieGenres.includes(
                    selectedGenre
                );

            });

    }


    /* =========================
       SORTING
    ========================== */

    const selectedSort =
        sortFilter.value;


    switch (selectedSort) {


        /*
            Alphabetical A-Z
        */

        case "az":

            filteredMovies.sort((a, b) =>

                a.Title.localeCompare(
                    b.Title
                )

            );

            break;


        /*
            Alphabetical Z-A
        */

        case "za":

            filteredMovies.sort((a, b) =>

                b.Title.localeCompare(
                    a.Title
                )

            );

            break;


        /*
            Newest first
        */

        case "newest":

            filteredMovies.sort((a, b) =>

                getYear(b.Year) -
                getYear(a.Year)

            );

            break;


        /*
            Oldest first
        */

        case "oldest":

            filteredMovies.sort((a, b) =>

                getYear(a.Year) -
                getYear(b.Year)

            );

            break;

    }


    /*
        Finally display the filtered
        and sorted movies.
    */

    displayMovies(filteredMovies);

}


/* =====================================================
   11. GET YEAR
===================================================== */

function getYear(year) {

    /*
        OMDb can sometimes return:

        "2024"
        "2024–2025"

        This function extracts the
        first four-digit year.
    */

    if (!year || year === "N/A") {

        return 0;

    }


    const match =
        year.match(/\d{4}/);


    return match
        ? Number(match[0])
        : 0;

}


/* =====================================================
   12. SEARCH FORM EVENT
===================================================== */

searchForm.addEventListener(
    "submit",
    function(event) {

        /*
            Prevent the page from
            refreshing when the form
            is submitted.
        */

        event.preventDefault();


        /*
            Get the text entered
            by the user.
        */

        const searchTerm =
            searchInput.value.trim();


        /*
            Make sure the user entered
            something before searching.
        */

        if (!searchTerm) {

            return;

        }


        /*
            Call our search function.
        */

        searchMovies(searchTerm);

    }
);


/* =====================================================
   13. GENRE FILTER EVENT
===================================================== */

genreFilter.addEventListener(
    "change",
    function() {

        /*
            Re-apply the filter
            whenever the dropdown changes.
        */

        applyFilters();

    }
);


/* =====================================================
   14. SORT FILTER EVENT
===================================================== */

sortFilter.addEventListener(
    "change",
    function() {

        /*
            Re-sort the movies whenever
            the user changes the option.
        */

        applyFilters();

    }
);


/* =====================================================
   15. EXPLORE BUTTON
===================================================== */

exploreButton.addEventListener(
    "click",
    function() {

        /*
            Scroll to the movie section.
        */

        document
            .getElementById("movies")
            .scrollIntoView({
                behavior: "smooth"
            });


        /*
            Automatically place the cursor
            inside the search box.
        */

        searchInput.focus();

    }
);


/* =====================================================
   16. LOADING FUNCTIONS
===================================================== */

function showLoading() {

    loading.classList.remove("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


/* =====================================================
   17. HIDE MESSAGES
===================================================== */

function hideMessages() {

    errorMessage.classList.add("hidden");

    noResults.classList.add("hidden");

}


/* =====================================================
   18. ERROR MESSAGE
===================================================== */

function showError(message) {

    movieGrid.innerHTML = "";

    errorMessage.classList.remove("hidden");

    noResults.classList.add("hidden");

    errorText.textContent =
        message;

    resultsMessage.textContent =
        "Unable to load movies.";

}


/* =====================================================
   19. NO RESULTS
===================================================== */

function showNoResults() {

    movieGrid.innerHTML = "";

    errorMessage.classList.add("hidden");

    noResults.classList.remove("hidden");

    resultsMessage.textContent =
        "No movies matched your search.";

}


/* =====================================================
   20. BASIC HTML SECURITY
===================================================== */

function escapeHTML(text) {

    /*
        This prevents text from the API
        from being interpreted as HTML.
    */

    const element =
        document.createElement("div");


    element.textContent =
        text || "";


    return element.innerHTML;

}