import requests
from html.parser import HTMLParser
import csv


class MyHTMLParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.in_academic = False
        self.in_td = False
        self.in_a = False
        self.index = 0
        self.profile_link=''
        self.name = []
        self.index_name=-1

    def handle_starttag(self, tag, attrs):
        if tag == 'div':
            for name, value in attrs:
                if name == 'id' and value == 'academic':
                    self.in_academic = True
                    break

        if self.in_academic and tag == 'td':
            self.in_td = True

        if self.in_academic and tag == 'tr':
            self.index = 0
            self.profile_link=''
            self.name = []
        
        if self.in_td and tag== 'a' and self.index==4:
            self.in_a=True
            for name,value in attrs:
                if name=='href':
                    self.profile_link=value

    def handle_endtag(self, tag):
        if tag == 'div':
            self.in_academic = False

        if self.in_academic and tag == 'td':
            self.index += 1

        if self.in_a and tag == 'a':
            self.in_a= False

    def handle_data(self, data):
        if self.in_academic and self.in_td and (self.index == 1 or self.index == 2) and data.strip():
            if self.index == 1:
                self.name.append(data)

            if self.index == 2:
                self.name.append(data)
                names.append(self.name)
                self.index_name+=1
            
        if self.in_academic and self.in_td and self.in_a:
            request=requests.get(self.profile_link)
            parser_profile=OrcidParser(self.index_name)
            parser_profile.feed(request.text) 

        


class OrcidParser(HTMLParser):
    def __init__(self,index):
        HTMLParser.__init__(self)
        self.in_a = False
        self.index=index
    
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for name, value in attrs:
                if name == 'href' and link in value:
                    self.in_a = True
                    break

    def handle_endtag(self, tag):
        if self.in_a and tag == 'a':
            self.in_a=False

    def handle_data(self, data):
        if self.in_a:
            names[self.index].append(data)
            

link="https://orcid.org/"
names = []
parser = MyHTMLParser()
r = requests.get("https://cis.unimelb.edu.au/people/#academic")
parser.feed(r.text)
print(names)

csvData = [['given_name', 'family_name', 'orcid_id']]
for name in names:
    if len(name)==2:
        newRow=[name[0],name[1],0]
        csvData.append(newRow)
    else:
        newRow=[name[0],name[1],name[2]]
        csvData.append(newRow)


with open('cis_academics.csv', 'w') as csvFile:
    writer = csv.writer(csvFile)
    writer.writerows(csvData)
csvFile.close()

