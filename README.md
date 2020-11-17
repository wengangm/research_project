# **CIS Publication Analytics**

- [Data Collecting](#data-collecting)
- [Topic Modeling](#topic-modeling)
- [Web Development](#web-development)

## Data Collecting
Run `pip install HTMLParser` first.

Get Google BigQuery authentication from https://cloud.google.com/docs/authentication/getting-started.

Run `python academics.py` to get all the academics' names in the School of CIS. Data would be stored in `cis_academics.csv`.

Run `pip install pybliometrics` to install `pybliometrics`.

Run `python academics_by_scopus.py` to get academics' data from Scopus, and store data into `cis_academics.csv`.

Run `python upload_academics.py` to upload `cis_academics.csv` to BigQuery.

Run `python pubs_metadata_by_scopus.py` to get all the publications' meetadata from Scopus, and store data into `pubs_metadata_by_scopus.csv`.

Run `python upload_pubs.py` to upload `pubs_metadata_by_scopus.csv` to BigQuery.

## Topic Modeling

### Main Files
- /topic modeling/
    + Complete stopwords.txt  --The file containing all stopwords used in filtering useless tokens
    + Project_optimize_topic_num.py  --The file includes all code used for parameter tuning of the number of topics.
    + Project_topic_modeling.py  --The file includes the main code for preprocessing input data and output topic data to given csv file in the same directory.
    + School of CIS Publication-c642ecab1ca7.json --This file is the private key used for get access to Google BigQuery, which is hard-coded in Project_optimize_topic_num.py and Project_topic_modeling.py.
    + Update_bigquery.py --This file includes the code for automatically uploading generated topic data to BigQuery database table, whereas the update function is not available for free user, this file is contemporarily not used.
    + pubs_metadata_by_scopus.csv -- This file is the csv file storing data from BigQuery database, which can be updated or reconstructed in the future.

### Usage
Input the commands below in the topic modeling directory.
For Windows, Linux and Mac:
    python Project_optimize_topic_num.py
    
The output would be two plots (or four if the annotation are removed). Analysis needs to be done on the results in the plots and manually generate a number for topic number, and then change the corresponding hard-coded number parameter in Project_topic_modeling.py.

Then for the final step:

For Windows, Linux and Mac:
    python Project_topic_modeling.py
    
The command above will automatically upload the csv file contained in the same directory. Then upload the csv file manually through BigQuery in order to update database.

## Web Development

### Main Files
- /project_web/venv/  --The libraries needed
- /project_web/web/
    + __init__.py  --The file include AppFactory
    + db.py  --The file include all functions to connect database
    + home.py  --The file include server entry
    + myUtil.py  --The file include some useful functions
- /project_web/web/static  --Include all static files for HTML
- /project_web/web/templates  --Include all HTML files

### Usage
Input the commands below in the project_web directory.
For Linux and Mac:
    export FLASK_APP=web
    flask run

For Windows:
    set FLASK_APP=web
    flask run
    
The server will start on localhost with the port 5000. Then enter 127.0.0.1:5000 in the web browser to access the website.