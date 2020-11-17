from google.cloud import bigquery
import os

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'F:/workspace/vscode/research project/School of CIS Publication-de911bd50860.json'
client = bigquery.Client()

dataset_id = 'cis_publications'
dataset_ref = client.dataset(dataset_id)
table_id = 'pubs_metadata_by_scopus'
table_ref = dataset_ref.table(table_id)
job_config = bigquery.LoadJobConfig()
job_config.source_format = bigquery.SourceFormat.CSV

job_config.schema = [
    bigquery.SchemaField("eid", "STRING"),
    bigquery.SchemaField("date", "STRING"),
    bigquery.SchemaField("title", "STRING"),
    bigquery.SchemaField("citedby_count", "STRING"),
    bigquery.SchemaField("authors", "STRING"),
    bigquery.SchemaField("venue", "STRING"),
    bigquery.SchemaField("area", "STRING"),
    bigquery.SchemaField("abstract", "STRING"),
    bigquery.SchemaField("topic", "STRING")
]

with open('pubs_metadata_by_scopus.csv', "rb") as source_file:
    job = client.load_table_from_file(source_file, table_ref, job_config=job_config)

job.result()  # Waits for table load to complete.

print("Loaded {} rows into {}:{}.".format(job.output_rows, dataset_id, table_id))