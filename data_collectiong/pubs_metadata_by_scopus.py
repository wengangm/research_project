from pybliometrics.scopus import AbstractRetrieval
import csv
import requests
from html.parser import HTMLParser


class SjrVenueLinkParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.venue_link = ""
        self.in_results = False
        self.count = 0

    def handle_starttag(self, tag, attrs):
        if self.count == 0:
            if tag == "div":
                for name, value in attrs:
                    if name == "class" and value == "search_results":
                        self.in_results = True

            if tag == "a" and self.in_results:
                for name, value in attrs:
                    if name == "href":
                        self.venue_link = value
                        self.count += 1


from html.parser import HTMLParser

class SjrSubjectAreaParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.subject_area = ""
        self.in_area = False
        self.in_subarea = False
        self.area_count = 0

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            for name, value in attrs:
                if name == "style" and "margin-left" in value:
                    self.in_area = False
                    self.in_subarea = True
                    return
                if name == "title" and "view journal rank from" in value:
                    self.in_area = True
                    self.in_subarea = False
                    return

    def handle_endtag(self, tag):
        if tag == "a":
            self.in_area = False
            self.in_subarea = False

    def handle_data(self, data):
        if self.in_area:
            if self.area_count == 0:
                self.subject_area += data
            else:
                self.subject_area += ";" + data
            self.area_count += 1
            self.subarea_count = 0

        if self.in_subarea:
            self.subject_area += "," + data

        # computer science(computer graphics, good);sdgs(sdfsdfsd,sdfds,sdfa)


def getSjrVenueLink(venue_name):
    sjrVenueLinkParser = SjrVenueLinkParser()

    venue_query = ""
    venue_words = venue_name.split(" ")
    for word in venue_words:
        venue_query += word + "+"
    venue_query = venue_query.strip()

    url = "https://www.scimagojr.com/journalsearch.php?q={}".format(venue_query)
    r = requests.get(url)
    sjrVenueLinkParser.feed(r.text)
    return sjrVenueLinkParser.venue_link


def getSjrSubjectArea(link):
    sjrSubjectAreaParser = SjrSubjectAreaParser()
    url = "https://www.scimagojr.com/{}".format(link)
    r = requests.get(url)
    sjrSubjectAreaParser.feed(r.text)
    return sjrSubjectAreaParser.subject_area

doc_eids = []
first_line_flag = True
with open('cis_academics.csv', 'r') as readFile:
    reader = csv.reader(readFile, delimiter=',')
    count = 0
    for row in reader:
        if first_line_flag:
            first_line_flag = False
            continue

        eids = row[-2].split(',')
        for eid in eids:
            doc_eids.append(eid)
            count += 1
readFile.close()
print('document count: ' + str(count))

count = 0
with open('pubs_metadata_by_scopus.csv', 'a',encoding='utf-8') as writeFile:
    writer = csv.writer(writeFile)
    writer.writerow(['eid', 'date', 'title', 'citedby_count', 'authors', 'venue', 'area', 'abstract'])
    for eid in doc_eids:
        print()
        print('count: ' + str(count))
        count += 1
        abstractRetrieval = AbstractRetrieval(eid)
        print('eid: ' + eid)

        # venue
        publicationName = abstractRetrieval.publicationName
        if not publicationName: continue
        print('venue: ' + publicationName)

        # sjr venue link
        venue_link = getSjrVenueLink(publicationName)
        if not venue_link: continue
        print('venue link: ' + venue_link)

        # subject area
        subject_area = getSjrSubjectArea(venue_link)
        if not subject_area: continue
        print('subject area: ' + subject_area)

        # title
        title = abstractRetrieval.title
        if not title: continue
        print('title: ' + title)

        # date
        date = abstractRetrieval.coverDate
        if not date: continue
        print('date: ' + date)

        # authors
        authors = abstractRetrieval.authors
        if not authors: continue
        print(authors)

        # abstract
        abstract = abstractRetrieval.description
        if not abstract: abstract = abstractRetrieval.abstract
        if not abstract: abstract = ''
        print('abstract: ' + abstract)

        # citedby_count
        citedby_count = abstractRetrieval.citedby_count
        if not citedby_count: citedby_count = 0
        print('citedby count: ' + str(citedby_count))

        # append to file
        row = [eid, date, title, citedby_count, authors, publicationName, subject_area, abstract]
        writer.writerow(row)
writeFile.close()
