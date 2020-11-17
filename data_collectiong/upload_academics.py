from google.cloud import bigquery
import os

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'F:/workspace/vscode/research project/School of CIS Publication-de911bd50860.json'
client = bigquery.Client()

dataset_id = 'cis_publications'
dataset_ref = client.dataset(dataset_id)
table_id = 'cis_academics'
table_ref = dataset_ref.table(table_id)
job_config = bigquery.LoadJobConfig()
job_config.source_format = bigquery.SourceFormat.CSV

job_config.schema = [
    bigquery.SchemaField("given_name", "STRING"),
    bigquery.SchemaField("family_name", "STRING"),
    bigquery.SchemaField("eid", "STRING"),
    bigquery.SchemaField("orcid", "STRING"),
    bigquery.SchemaField("citation_count", "STRING"),
    bigquery.SchemaField("document_count", "STRING"),
    bigquery.SchemaField("name_variants", "STRING"),
    bigquery.SchemaField("docs", "STRING"),
    bigquery.SchemaField("coauthors_count", "STRING")
]

with open('cis_academics.csv', "rb") as source_file:
    job = client.load_table_from_file(source_file, table_ref, job_config=job_config)

job.result()  # Waits for table load to complete.

print("Loaded {} rows into {}:{}.".format(job.output_rows, dataset_id, table_id))