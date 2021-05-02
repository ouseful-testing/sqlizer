# sqlizer

Can we grab data into a repo and view it using a browser based SQL browser?

*Yes we can.*

This repo provides a proof of concept recipe for:

- loading data into a SQLite database stored within the repository;
- exploring the database via an interactive SQL query tool published using Github Pages.


[See also: https://phiresky.github.io/blog/2021/hosting-sqlite-databases-on-github-pages/ for efficient ways to query Gihtaub Pages hosted SQLite.]

## Set-up

To set up your own repository:

- make a copy of this repo by clicking the green "use this template" button.

- in your own copy of the repo, go to the [*Settings*](./settings) page, scroll down to the __GitHub Pages__ area and select *master branch* as the Github Pages source. This will publish a Github Pages site for your repo (it may take a few minutes for the site to be built the first time). Reload the settings page and in the *Github Pages* area you should see a green backgrounded are providing you with the link to your repo. For a repo named `https://github.com/USERNAME/REPONAME`, the Github Pages site will be at `https://USERNAME.github.io/REPONAME`. The database viewer will be found at `https://USERNAME.github.io/REPONAME/site/gui.html`


## Querying the Database

On the database viewer page, run your SQL query.

To list the tables in the database, use the query:

`SELECT name FROM sqlite_master WHERE type='table';`


## Loading Data into the Database

At the moment, you can only load CSV data into the database, but the plan is to support more datatype imports too (for example, JSON data).

To load data into the database:

- go to your repo's [*Issues*](./issues) page
- create a [*New issue*](https://github.com/innovationOUtside/open-ouxml-tools/issues/new)
- as the title of issue, enter: `fetchcsv TABLENAME`, where `TABLENAME` is the name of the table you want the data to be stored in in the database;
- on the *first line* of the issue body, paste a URL to the CSV datafile you want to import into the table;
- submit the issue. (You may want to add a meaningful commit message.)

When you submit the issue, if your [`commentauthorassociation`](https://developer.github.com/v4/enum/commentauthorassociation/) status is the `OWNER` of the repository, a `CONTRIBUTOR` to or `COLLABORATOR` on it, or a `MEMBER` of the organisation associated with it, then the following will happen:

- a Github Action will download the CSV file and use [`sqlite-utils`](https://github.com/simonw/sqlite-utils) to add it to the database in the specified table;
- the Github Action will then push the newly updated database to the repo's `master` branch;
- Github Pages will update your site (this may take a few minutes).

You should now be able to query your data from the database browser / query UI.

## Running Scripts Submitted Via an Issue

As well as running "canned" commands, we can also submit aritrary scripts via an issue. For example, if post an issue with title `jupytext_run_md ` and a Python script in the issue body, another action will:

- save the script to a file;
- execute the file as a Python script;
- commit any updated files.

For example, try using the following in an issue body:


    # Header
    
    Some text.
    
    ```python
    # some code
    print('hello world')
    ```
    
    Some more text.
    
Using the power of Jupytext, the markdown is converted to an `.ipynb` Jupyter notebook and the code in it executed. The run notebook is then converted to html using `nbconvert`. The markdown, ipynb and html files can be found in the [*md*](./md), [*ipynb*](./ipynb) and [*html*](./html) directories respectively.
