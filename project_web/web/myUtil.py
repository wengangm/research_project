import csv

def getYears(publicationData):
    years=[]
    for publication in publicationData:
        years.append(publication['year'])
    years=list(set(years))
    years.remove('date')
    years.sort()
    return years

def translatePublicationDataToBarData(publicationData):
    """
    Translate the data of publications to the data for bar chart.
    The structure of data for bar chart should be:
    {'x':[],
     'labelX':'',
     'y':[[],[]...],
     'labelY':''
    }
    """
    sortedData=sorted(publicationData,key=lambda publication: publication['year'])
    x=[]
    y=[]
    yearIndex=-1
    for publication in sortedData:
        if publication['year'] not in x:
            x.append(publication['year'])
            yearIndex+=1
            y.append([])
        y[yearIndex].append(publication)
    barData={}      
    barData['x']=x
    barData['labelX']='Year'
    barData['y']=y
    barData['labelY']='Number of Publications'
    return barData


def translatePublicationDataToGraphAuthorData(publicationData,AuthorList):
    """
    {node:[{name:'',data:[]},{}...],link:[{source:index,target:index,value:size},{}...]}
    """
    node=[]
    for publication in publicationData:
        for author in publication['authors']:
            if author in AuthorList:
                createNode(node,author,publication)

    link=createLink(node.copy(),len(node)-1)
    return {'node':node,'link':link}

def translatePublicationDataToGraphAreaData(publicationData):
    """
    {node:[{name:'',data:[]},{}...],link:[{source:index,target:index,value:size},{}...]}
    """
    node=[]
    for publication in publicationData:
        for area in publication['areas']:
            name=area['top']
            createNode(node,name,publication)

            if area['subArea']!=None:
                for subArea in area['subArea']:
                    createNode(node,subArea,publication)
    link=createLink(node.copy(),len(node)-1)
    return {'node':node,'link':link}

def translateOnePublicationDataToGraphData(publicationData):
    """
    {node:[{name:'title',text:''},{name:'area',text:''},{name:'author',text:''}],link:[]}
    """
    node=[{'name':'title','text':publicationData['title']}]
    for area in publicationData['areas']:
        node.append({'name':'area','text':area})
    for author in publicationData['authors']:
        node.append({'name':'author','text':author})
    link=[]
    for i in range(1,len(node)):
        link.append({'source':0,'target':i})
    return {'node':node,'link':link}

def createNode(node,newName,publication):
    added=False
    for n in node:
        if n['name']==newName:
            n['data'].append(publication)
            added=True
            break
    if added==False:
        node.append({'name':newName,'data':[publication]})

def createLink(nodes,source):
    links=[]
    if len(nodes)<=1:
        return links
    node1=nodes.pop()
    target=0 
    for node in nodes:
        set1=set(map(lambda publication: publication['title'],node1['data']))
        set2=set(map(lambda publication: publication['title'],node['data']))
        intersection=set1.intersection(set2)
        if intersection:
            links.append({'source':source,'target':target,'value':len(intersection)})
        target+=1
    links.extend(createLink(nodes,source-1))
    return links


def getAuthorData(publicationData):
    """[{name:'',publications:[],cooperators:[],citationNum:n,},{}]"""
    authorData=[]
    for publication in publicationData:
        for author in publication['authors']:
            added=False
            for data in authorData:
                if data['name']==author:
                    data['publications'].append(publication)
                    data['citationNum']+=publication['citation']
                    set1=set(data['cooperators'])
                    set2=set(publication['authors'])
                    difference=set2.difference(set1)
                    difference.remove(data['name'])
                    newCooperators=list(difference)
                    data['cooperators'].extend(newCooperators)
                    added=True
                    break
            if not added:
                cooperators=publication['authors'].copy()
                cooperators.remove(author)
                authorData.append({'name':author,'publications':[publication],'cooperators':cooperators,'citationNum':publication['citation']})
    return authorData

def getAreaData(publicationData,areaData):
    """
    [{'name':'','topics':[{'name':'','data':[]},{}...]},{}...]
    """
    areas=map(lambda area: {'name':area['name'],'topics':map(lambda topic: {'name':topic,'data':[]},area['topics'])},areaData)
    for publication in publicationData:
        for area in areas:
            for topic in area['topics']:
                if topic['name'] in publication['topics']:
                    topic['data'].append(publication)

    return areas
            
def testSearch(option,content):
    option=option.lower()
    publications=None
    if option=="auther":
        pass
    elif option=="publication":
        pass


def readDataFromCsv(fileName):
    publications=[]
    with open(fileName, 'r',encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            title=row[2]
            areas=row[6]
            areas=areas.split(";")
            subAreas=[]
            for area in areas:
                subArea=area.split(",")
                top=None
                sub=None
                if len(subArea)==1:
                    top=subArea
                else:
                    top=subArea[0]
                    subArea.remove(top)
                    sub=subArea
                subAreas.append({'top':top,"subArea":sub})
            authors=row[4]
            date=row[1]
            date=date.split("-")
            citation=row[3]
            publications.append({'title':title,'year':date[0],'authors':authors})

def getAreas(publications):
    results={}
    results['top']=[]
    results['subArea']=[]
    for publication in publications:
        areas=publication['areas']
        for area in areas:
            top=area['top']
            sub=area['subArea']
            if top not in results['top']:
                results['top'].append(top)
                results['subArea'].append(sub)
            else:
                indexTop=results['top'].index(top)
                results['subArea'][indexTop].extend(sub)
                set1=set(results['subArea'][indexTop])
                results['subArea'][indexTop]=list(set1)
                
    return results

def sortAreas(areas):
    results={'top':[],'subArea':[]}
    array=[]
    for i in range(0,len(areas['top'])):
        array.append({'top':areas['top'][i],'subArea':areas['subArea'][i]})
    array=sorted(array,key=keyFunction)
    for area in array:
        area['subArea'].sort()
        results['top'].append(area['top'])
        results['subArea'].append(area['subArea'])
    return results

def keyFunction(content):
    return content['top']

def getAuthorList(publications,targetList):
    results=[]
    for publication in publications:
       authors=publication['authors']
       for author in authors:
           if author in targetList and author not in results:
               results.append(author)
    return results

def selectData(allData,year,authorsSelected,areasSelected):
    publicationsData=[]
    for data in allData:
        foundAuthor=False
        foundArea=False
        if len(authorsSelected)>0:
            for author in authorsSelected:
                print("author:{}".format(author))
                if author in data['authors']:
                    foundAuthor=True
                    break
            if not foundAuthor:
                    continue
        if len(areasSelected)>0:
            for area in areasSelected:
                dataAreas=data['areas']
                for dataArea in dataAreas:
                    top=dataArea['top']
                    sub=dataArea['subArea']
                    if area==top or area in sub:
                        foundArea=True
                        break
                if foundArea:
                    break
            if not foundArea:
                continue
        if year!='All':
            if year!=data['year']:
                continue
        publicationsData.append(data)
    return publicationsData