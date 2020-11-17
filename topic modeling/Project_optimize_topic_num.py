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
import math
from collections import OrderedDict

import matplotlib.pyplot as plot
import gensim
from multiprocessing import freeze_support

from gensim.models import CoherenceModel, HdpModel
from gensim.sklearn_api import hdp
from gensim.test.utils import datapath
import os
from google.cloud.bigquery.client import Client
from gensim.corpora.dictionary import Dictionary
from gensim.models.ldamodel import LdaModel
import re
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize,word_tokenize
from gensim.models.wrappers import LdaMallet
import json




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
        pass
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
    input_text = re.sub("[=+-/*%()\[\]\\\'\"&^#“”]", "", input_text)
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

# fixme: sum of unique tokens
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
###########################  Optimize topic number  #############################
def compute_coherence_values(dictionary, corpus, texts, start, step, limit):
    coherence_values = []
    model_list = []
    names = locals()
    # os.environ['MALLET_HOME'] = os.getcwd()+"\\mallet-2.0.8"
    # mallet_path = os.getcwd()+"\\mallet-2.0.8\\bin\\mallet"
    for num_topics in range(start, limit, step):
        model_path = os.getcwd() + "\\Model\\CoherenceModel_" + str(num_topics) + ".model"
        print("current num:", num_topics)
        names['CoherenceModel'+str(num_topics)] = LdaModel(pubs_corpus, num_topics=num_topics, id2word=pubs_dictionary, passes=10, eval_every=1)
        names['CoherenceModel'+str(num_topics)].save(model_path)
        model_list.append(names['CoherenceModel'+str(num_topics)])
        # model = LdaMallet(mallet_path, corpus=corpus, num_topics=num_topics, id2word=dictionary)
        # todo : try both c_uci and c_npmi: c_uci should be a little higher than c_npmi, but basically the same level
        coherence_model = CoherenceModel(model=names['CoherenceModel'+str(num_topics)], topn = names['CoherenceModel'+str(num_topics)].num_topics, texts=texts, dictionary=dictionary, coherence='u_mass')
        coherence_value = coherence_model.get_coherence()
        coherence_values.append(coherence_value)
    return model_list, coherence_values
    # return model_list

# coherence values always decline along with num of topics increases
def display_coherence_based_on_topic_num(start, step, limit):
    # model_list  = compute_coherence_values(pubs_dictionary, pubs_corpus, pubs_tokens, start = 100, step = 20, limit = 520)
    model_list, cv_list  = compute_coherence_values(pubs_dictionary, pubs_corpus, pubs_tokens, start = start, step = step, limit = limit)
    # print(model_list)
    # print(cv_list)
    num_list = range(start, limit, step)
    for num, cv in zip(num_list, cv_list):
        print("Num Topics =", num, " has Coherence Value of", round(cv, 4))


def perplexity(ldamodel, corpus, dictionary, size_dictionary, num_topics):
    """calculate the perplexity of a lda-model"""
    # dictionary : {7822:'deferment', 1841:'circuitry',19202:'fabianism'...]
    print ('the info of this ldamodel: ')
    print ('num of corpus: %s; size_dictionary: %s; num of topics: %s'%(len(corpus), size_dictionary, num_topics))
    prob_doc_sum = 0.0
    topic_word_list = [] # store the probablity of topic-word:[(u'business', 0.010020942661849608),(u'family', 0.0088027946271537413)...]
    for topic_id in range(num_topics):
        topic_word = ldamodel.show_topic(topic_id, size_dictionary)
        dic = {}
        for word, probability in topic_word:
            dic[word] = probability
        topic_word_list.append(dic)
    doc_topics_ist = [] #store the doc-topic tuples:[(0, 0.0006211180124223594),(1, 0.0006211180124223594),...]
    for doc in corpus:
        doc_topics_ist.append(ldamodel.get_document_topics(doc, minimum_probability=0))
    corpus_word_num = 0
    for i in range(len(corpus)):
        prob_doc = 0.0 # the probablity of the doc
        doc = corpus[i]
        doc_word_num = 0 # the num of words in the doc
        for word_id, num in doc:
            prob_word = 0.0 # the probablity of the word
            doc_word_num += num
            word = dictionary[word_id]
            for topic_id in range(num_topics):
                # cal p(w) : p(w) = sumz(p(z)*p(w|z))
                prob_topic = doc_topics_ist[i][topic_id][1]
                prob_topic_word = topic_word_list[topic_id][word]
                prob_word += prob_topic*prob_topic_word
            prob_doc += math.log(prob_word) # p(d) = sum(log(p(w)))
        prob_doc_sum += prob_doc
        corpus_word_num += doc_word_num
    prep = math.exp(-prob_doc_sum/corpus_word_num) # perplexity = exp(-sum(p(d)/sum(Nd))
    return prep

def display_perplexity_on_topic_num(start, step, limit):
    model_list = []
    pplxty_list = []
    names = locals()
    for num_topics in range(start, limit, step):
        print("############### current num:", num_topics, "###############")
        model_path = os.getcwd()+"\\Model\\topic_num_"+str(num_topics)+".model"
        if not os.path.exists(model_path):
            # Modeling!!!!!
            print("Modeling in progress...")
            names['model' + str(num_topics)] = LdaModel(pubs_corpus, num_topics=num_topics, id2word=pubs_dictionary,
                                                        passes=10, eval_every=1)
            names['model' + str(num_topics)].save(model_path)
        else:
            print("Model already exists.")
            names['model' + str(num_topics)] = LdaModel.load(model_path)
        model_list.append(names['model' + str(num_topics)])
        pplxty_value = perplexity(names['model' + str(num_topics)], pubs_corpus, pubs_dictionary, len(pubs_dictionary.keys()), num_topics)
        pplxty_list.append(pplxty_value)
    return model_list, pplxty_list


if __name__ == '__main__':
    # model_list, cv_list = compute_coherence_values(pubs_dictionary, pubs_corpus, pubs_tokens, 100, 20, 510)
    model_list, pplxty_list = display_perplexity_on_topic_num(100, 20, 510)  # start, step, limit
    num_list = range(100, 510, 20)
    # for num, cv in zip(num_list, cv_list):
    #     print("Num Topics =", num, " has Coherence Value of", round(cv, 4))
    num_to_ppl = dict(zip(num_list, pplxty_list))
    for num, ppl in num_to_ppl.items():
        print("Num Topics =", num, " has Perplexity of", round(ppl, 4))

    # choose which num to take
    first_derivative = []
    for idx, topic_num in enumerate(num_list):
        # first_derivative.append((cv_list[idx] - cv_list[idx - 1]) / 20)
        first_derivative.append((pplxty_list[idx] - pplxty_list[idx - 1]) / 20)
    first_derivative[0] = first_derivative[1] # index = 0 has no value,default to the same as index = 1
    plot.plot(num_list, first_derivative)
    plot.xlabel("Num Topics")
    # plot.ylabel("Coherence value growth rate")
    plot.ylabel("Perplexity growth rate")
    plot.show()