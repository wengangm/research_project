from google.cloud import bigquery
import os
import re

dataset='cis_publications'
tableAuthor='cis_academics'
tablePublications='pubs_metadata_by_scopus'

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'School of CIS Publication-af32c25f68c7.json'

def get_db():
    return bigquery.client.Client()

def getPublicationsFromDB(title=None,author=None,area=None,year=None):
    whereString=None
    if title!=None:
        whereString="title like '%"+title+"%'"
    if author!=None and len(author)>0:
        string="("
        for i in range(0,len(author)):
            if i==0:
                string+="authors like '%"+author[i]+"%'"
            else:
                string+=" or authors like '%"+author[i]+"%'"
        string+=")"
        if whereString==None:
            whereString=string
        else:
            whereString+=" and "+string
    if area!=None and len(area):
        string="("
        for i in range(0,len(area)):
            if i==0:
                string+="area like '%"+area[i]+"%'"
            else:
                string+=" or area like '%"+area[i]+"%'"
        string+=")"
        if whereString==None:
            whereString=string
        else:
            whereString+=" and "+string
    if year!=None:
        string="(date like '%"+year+"'%)"
        if whereString==None:
            whereString=string
        else:
            whereString+=" and "+string
    results=query("*",dataset+"."+tablePublications,whereString)
    publicationData=[]

    for row in results:
        title=row.title
        date=row.date
        authorString=row.authors
        areaString=row.area
        if areaString=='area':
            continue
        citedByCount=row.citedby_count
        topicString=row.topic
        year='unknown'
        month='unKnown'
        day='unKnown'
        if date!=None:
            strs=date.split('/')
            year=strs[0]
            month=strs[1]
            day=strs[2]

        authors=[]
        if authorString!=None:    
            authorString=authorString.split('Author') 
        
            for a in authorString:
                string=re.search('auid=\'.*given_name=\'.*\',',a)
                givenName=''
                surName=''
                auid=''
                if string!=None:
                    string=string.group()
                    string=string.split(",")
                    for subString in string:
                        if subString.startswith('auid=') or subString.startswith(' auid='):
                            auid=subString.split('\'')[1]
                        if subString.startswith('surname=') or subString.startswith(' surname='):
                            surName=subString.split('\'')[1]
                        if subString.startswith('given_name=') or subString.startswith(' given_name='):
                            givenName=subString.split('\'')[1]
                    newAuthor={'auid':auid,'givenName':givenName,'familyName':surName}
                    authors.append(newAuthor)
        else:
            authors.append('unknown')
        
        areas=[]
        if areaString!=None:
            areaString=areaString.split(";")
            for area in areaString:
                subArea=area.split(",")
                top=None
                sub=None
                if len(subArea)==1:
                    top=subArea
                    sub=[]
                else:
                    top=subArea[0]
                    subArea.remove(top)
                    sub=subArea
                areas.append({'top':top,"subArea":sub})
        else:
            areas.append({'top':'unknown','subArea':[]})
        topics=[]
        if topicString!=None:
            topics.append(topicString)
        newPublication={'title':title,'year':year,'month':month,'day':day,'authors':authors,'areas':areas,'topics':topics,'citation':citedByCount}
        publicationData.append(newPublication)
    return publicationData

def getAuthorListFromDB():
    authors=[]
    results=query("*",dataset+"."+tableAuthor)
    for row in results:
        eid=row.eid
        if(eid=='eid'):
            continue
        auid=eid.split("-")[2]
        coauthorsCount=row.coauthors_count
        citationCount=row.citation_count
        documentCount=row.document_count
        givenName=row.given_name
        familyName=row.family_name
        author={'coauthorsCount':coauthorsCount,'auid':auid,'citationCount':citationCount,'documentCount':documentCount,'givenName':givenName,'familyName':familyName}
        authors.append(author)
    return authors

def getAreasFromDB():
    areas=([],[])
    results=query("area",dataset+"."+tablePublications)
    for row in results:
       areaString=row.area.split(";")
       for area in areaString:
            subArea=area.split(",")
            top=None
            sub=None
            if len(subArea)==1:
                top=subArea
                sub=[]
            else:
                top=subArea[0]
                subArea.remove(top)
                sub=subArea
            if top not in areas[0]:
                areas[0].append(top)
                areas[1].append(sub)
            else:
                index=areas[0].index(top)
                areas[1][index].extend(sub)
                areas[1][index]=list(set(areas[1][index]))
    areas={'top':areas[0],'subArea':areas[1]}
    return areas

def getYearsFromDB():
    years=[]
    results=query("date",dataset+"."+tablePublications)
    for row in results:
        date=row.date
        year='unknown'
        if date!=None:
            year=date.split('/')[0]
        years.append(year)

    years=list(set(years))
    years.remove('date')
    return years

def query(strSelect,strFrom,strWhere=None,strOrder=None):
    db=get_db()
    queryString="select "+strSelect+" from "+strFrom
    if strWhere!=None and strWhere!="":
        queryString+=" where "+strWhere
    if strOrder!=None and strOrder!="":
        queryString+=" order by "+strOrder
    query_job=db.query(queryString,location="US")
    return query_job.result()
