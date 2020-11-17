import csv

from pybliometrics.scopus import AuthorRetrieval

csvData = [['given_name', 'family_name', 'eid', 'orcid', 'citation_count', 'document_count', 'name_variants', 'docs', 'coauthors_count']]
first_line_flag = True
from pybliometrics.scopus import AuthorSearch
# authorSearch = AuthorSearch('AUTHLAST(Ewin) and AUTHFIRST(C.) and AFFIL(University of Melbourne)')
# authors=authorSearch.authors
# print(authors)
# author=authors[0]
# print(author[0])

with open('cis_academics.csv', 'r') as readFile:
    reader = csv.reader(readFile, delimiter=',')
    for row in reader:
        if first_line_flag:
            first_line_flag = False
            continue

        given_name=row[0]
        family_name=row[1]
        orcid_id=row[2]
        print(family_name+" "+given_name)

        if len(orcid_id)>1:
            print("orcid:"+orcid_id)
            authorSearch = AuthorSearch('ORCID('+orcid_id+')')
            authors=authorSearch.authors
        
        if authors==None:
            print("no result with orcid!")
            authorSearch = AuthorSearch('AUTHLAST('+family_name+') and AUTHFIRST('+given_name+') and AFFIL(University)')
            authors=authorSearch.authors
        
        if authors==None:
            print("no result with first")
            authorSearch = AuthorSearch('AUTHLAST('+given_name+') and AUTHFIRST('+family_name+') and AFFIL(University)')
            authors=authorSearch.authors
        if authors==None:
            print("no result with second")
            full_name=given_name+' '+family_name
            print("full name: "+full_name)
            names=full_name.split(' ')
            given_name=''
            family_name=''
            for i in range(0,len(names)):
                if i==len(names)-1:
                    family_name=names[i]
                else:
                    given_name+=names[i]
                if i<len(names)-2:
                    given_name+=' '
            print("given: "+given_name)
            print("family: "+family_name)
            authorSearch = AuthorSearch('AUTHLAST('+family_name+') and AUTHFIRST('+given_name+') and AFFIL(University)')
            authors=authorSearch.authors
        if authors==None:
            print("no result with third")
            fisrtLetter=given_name[0]
            given_name=fisrtLetter
            authorSearch = AuthorSearch('AUTHLAST('+family_name+') and AUTHFIRST('+given_name+') and AFFIL(University)')
            authors=authorSearch.authors
        if authors==None: 
            print("no result")
            continue
        author=authors[0]
        print(author[0])
        
        authorRetrieval = AuthorRetrieval(author[0])
        eid = authorRetrieval.eid
        first_name = authorRetrieval.given_name
        last_name = authorRetrieval.surname
        docs = ','.join(authorRetrieval.get_document_eids())
        citation_count = authorRetrieval.citation_count
        document_count = authorRetrieval.document_count
        orcid = authorRetrieval.orcid
        name_variants = authorRetrieval.name_variants
        coauthors = authorRetrieval.get_coauthors
        coauthors_count = authorRetrieval.coauthor_count
        new_row = [first_name, last_name, eid, orcid, citation_count, document_count, name_variants, docs, coauthors_count]
        csvData.append(new_row)


with open('cis_academics.csv', 'w',encoding='utf-8') as csvFile:
    writer = csv.writer(csvFile)
    writer.writerows(csvData)
readFile.close()
csvFile.close()