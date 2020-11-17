# Oliver Shen
# Student id: 1001920
# UoM Distributed Computing Project

"""
Topic modeling
Rule:
1: Weight ranking: keywords > title > abstract
2:
3:

"""
from collections import OrderedDict

import nltk
from gensim.models import CoherenceModel
import os
from google.cloud.bigquery.client import Client
from gensim.corpora.dictionary import Dictionary
from gensim.models.ldamodel import LdaModel
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import csv

from numpy import sort

import Project_optimize_topic_num




######################## Fetch Data#########################33
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'School of CIS Publication-c642ecab1ca7.json'
bq_client = Client()

query = (
    "select eid, title, abstract, area from cis_publications.pubs_metadata_by_scopus"
)
pubs_table = bq_client.query(
    query,
    # Location must match that of the dataset(s) referenced in the query.
    location="US",
)  # API request - starts the query

################################# Data Input ######################################
# with open("20191021-pubs.json","r",encoding='utf8') as file:
#     pubs_table = json.load(file)
# Get needed data columns from table into dict:
pubs_data = OrderedDict()
pubs_eids = []
for pub in pubs_table:
    if pub['eid'] == 'eid' or pub['title'] == 'title' or pub['abstract'] == 'abstract':
        continue
    pubs_eids.append(pub['eid'])
    pubs_data[pub['eid']] = dict()
    pubs_data[pub['eid']]['title'] = pub['title']
    pubs_data[pub['eid']]['abstract'] = pub['abstract']

############################# Information Retrieval ##################################
"""
Tokenize steps:
    remove ' ";
    remove email and website;
    tokenize to sentence, then words;
    filter words in word list with stopword list [stopword list needs to be opitimized]
"""
stopwords_list = stopwords.words('english')
# load stopword file
with open("Complete stopwords.txt","r",encoding='utf8') as file:
    for line in file.readlines():
        stopwords_list.append(line.strip())
        stopwords_list.append(line.capitalize().strip()) # Capital version of stopwords
# add signal / symbol from common text
for w in [':',';','!',',','.','?','-s','-ly','</s>','<s>','©','&',"^","#",'<','>','“','”','×']:
    stopwords_list.append(w)
# remove repeat words
stopwords_list=list(set(stopwords_list))
# Operate on actual dataset
def filter_stopwords(input_text, stopwords):
    # remove "'" '"' to ensure text works well
    input_text = re.sub("[=+-/*%()\[\]\\\'\"&^#“”‘’∼]", "", input_text)
    #     #get sentences
    #     list_sentences=sent_tokenize(test_text)
    #     print(list_sentences)
    # split sentences to words
    list_words = word_tokenize(input_text)
    # filtering
    input_text = [w for w in list_words if not w in stopwords]

    #     print(input_text)
    #     print(list_words)
    #     print(input_sentences)
    return input_text
def preprocess_data(data, stopwords):
    #data format need to be modified when using json input!!!!!!!!!!!!!!!
    filtered_data = []
    for tokens in data.values():
        filtered_tokens = []
        for element in tokens.values():
            if element != None:
                # filter num
                element = re.sub('\d\S*', '', element)
                # filter email
                element = re.sub('\S*@\S*\s?', '', element)
                # filter website
                element = re.sub('\S*(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)?[A-Za-z0-9]+([\-\.]{1}[A-Za-z0-9]+)*\.[A-Za-z]{2,5}(:[0-9]{1,5})?(\/.*)?\S*( |$)', '', element)
                #filter stopwords
                element = filter_stopwords(element, stopwords)
                for idx, word in enumerate(element): # lower captial char in sentence beginning word
                    if word[1:].islower():
                        word = word.lower()
                        element[idx] = word
                filtered_tokens.append(element)
        filtered_data.append(filtered_tokens)
    return filtered_data
filtered_pubs = preprocess_data(pubs_data, stopwords_list)

# joint pubs title and abstract for tokens
pubs_tokens = []
for article in filtered_pubs:
    word_list = []
    for element in article:
        word_list.extend(element)
    pubs_tokens.append(word_list)

# sum of unique tokens
# sum1 = 0
# for article in pubs_tokens:
#     sum1 += len(article)
# print(len(pubs_tokens))
# print(sum1)

# Convert tokens of publications to dictionary:
pubs_dictionary = Dictionary(pubs_tokens)
# Set up corpus of (word_id, frequency) lists from publications:
id_to_corpus = OrderedDict()
pubs_corpus = [pubs_dictionary.doc2bow(text) for text in pubs_tokens]
for idx, corpus in enumerate(pubs_corpus):
    id_to_corpus[pubs_eids[idx]] = corpus
#########################  Choose optimal value  ############################
#fixme: hardcore value is calculated from another py file: Project_optimize_topic_num.py;
# This num of topics is a cutoff value, values larger than which will lead to
# a less decreasing of perplexity compared to the increasing of topic number.
# Every time data is updated, this topic num needs to be re-calculated with Project_optimize_topic_num.py.
optimal_topic_num = 500

################################  Modeling  ##################################
cwd = os.getcwd()
model_path = os.getcwd()+"\\Model\\project_LDA.model"
if not os.path.exists(model_path):
    # Modeling!!!!!
    print("Modeling in progress...")
    lda = LdaModel(pubs_corpus, num_topics=optimal_topic_num, id2word=pubs_dictionary, passes=10, eval_every=1)
    lda.save(model_path)
else:
    print("Model already exists.")
    lda = LdaModel.load(model_path)


##############################   Result Handling  #################################
def select_highest_prob_topic(topic_probs):
    max_prob = 0
    cur_topic = -1
    for topic, prob in topic_probs:
        if prob > max_prob:
            max_prob = prob
            cur_topic = topic
    return cur_topic

def topic_to_lemmatized_word_list(model):
    # store lemmatized topic_words in a topic dict
    lemmatizer = nltk.stem.wordnet.WordNetLemmatizer()
    res = dict()
    for idx in range(0, model.num_topics):
        word_list = model.show_topic(idx)
        res[idx] = []
        for word, prob in word_list:
            word = lemmatizer.lemmatize(word,'n')
            res[idx].append(word)
        res[idx] = sorted(set(res[idx]), key=res[idx].index)
    return res

def write_to_table_file(filename):
    csvData = []
    eids = set()
    with open(filename,'r', encoding='utf-8') as readFile:
        reader = csv.reader(readFile,delimiter=',')
        for row in reader:
            if row[0]=='eid':
                continue
            if row[0] not in eids:
                eids.add(row[0])
                if len(row) == 8:
                    row.append(",".join(topic_word_list_result[row[0]]))
                else:
                    row[8] = ",".join(topic_word_list_result[row[0]])
                csvData.append(row)
    with open(filename,'w',encoding='utf-8') as writeFile:
        writer = csv.writer(writeFile)
        writer.writerows(csvData)
        print("Write to database successfully")

print("corpus length:",len(pubs_corpus))
print("dict length:",len(pubs_dictionary.keys()))
topic_word_list_result = dict()
topic_dict = topic_to_lemmatized_word_list(lda)

for id in pubs_eids:
    cur_corpus = id_to_corpus.get(id,None)
    if cur_corpus !=None:
        candidate_topics = lda.get_document_topics(cur_corpus) # list all topic index
        best_topic_index = select_highest_prob_topic(candidate_topics) # select the index with highest prob
        if best_topic_index == -1:
            print("no topic document:",id)
            topic_word_list_result[id] = ["unknown"]
        else:
            topic_word_list_result[id] = topic_dict[best_topic_index][:3] # get corresponding topic word list, and store top 3 words
    else:
        topic_word_list_result[id] = ["unknown"]
write_to_table_file('pubs_metadata_by_scopus.csv')

####################### other tried method #######################
# fixme: coherence is useless, cuz coherence always drop
# if __name__ == '__main__':
#     top_topics = lda.top_topics(corpus=pubs_corpus, coherence="u_mass", topn=lda.num_topics)
#     tc = sum([t[1] for t in top_topics])
#     manuCal_coherence = sum([t[1] for t in top_topics]) / lda.num_topics
#     print('[Manual calculated]Average topic coherence:', manuCal_coherence)
# cm = CoherenceModel(model=lda, corpus=pubs_corpus, dictionary=pubs_dictionary, coherence='u_mass', topn=lda.num_topics)
# modelCal_coherence = cm.get_coherence()
# print("[Model calculated]Average topic coherence:",modelCal_coherence)

#############################  print info  #################################
# pubs_table = json.dumps(pubs_table, indent = 2)
# print("pubs_table", pubs_table)
# print("pubs_data", pubs_data)
# stopwordsList.sort()
# print(len(stopwordsList))
# print(stopwordsList)
# print("filtered_pubs", filtered_pubs)
# print("pubs_tokens", pubs_tokens)
# print("pubs_dictionary ")
# for x in pubs_dictionary.items():
#     print(x)
# print(pubs_corpus)
# print("lda model", lda)
# for pub in pubs_dictionary:
#     print(pub)