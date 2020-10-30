const maxPerPage = 8;
const SORT_AUTHOR_NAME=0
const SORT_AUTHOR_DOCUMENT=1
const SORT_AUTHOR_CITATION=2
const SORT_AUTHOR_COAUTHORS=3

function changeNavActive(activeId){
    if(activeId!='navNone'){
        d3.select("#"+activeId).style("background","white").style("color","#343a40");
    }
}

function changeListNav(listNavId,layers){
    for(i=0;i<layers.length;i++){
        if(i==layers.length-1){
            d3.select("#"+listNavId)
            .append("span")
            .attr("class","breadcrumb-item")
            .html(layers[i].text);
        }else{
            d3.select("#"+listNavId)
            .append("a")
            .attr("class","breadcrumb-item")
            .attr("href",layers[i].url)
            .html(layers[i].text);
        }
    }
}

function checkPage(currentPage,totalPage,btnPrevious,btnNext){
    if(currentPage==1){
        btnPrevious.disabled=true;
    }else{
        btnPrevious.disabled=false;
    }
    
    if(currentPage==totalPage){
        btnNext.disabled=true;
    }else{
        btnNext.disabled=false;
    }
}

function showDataOnList(divId, pageLabelId, pageNumLabelId, page, data) {
    console.log("page:",page);
    page -= 1;
    if (d3.select("#"+divId + " a")) {
        d3.selectAll("#"+divId + " a").remove();
    }
    var listDiv = d3.select("#"+divId);
    var pageLabel = document.getElementById(pageLabelId);
    var pageNumLabel = document.getElementById(pageNumLabelId);
    var listData = [];
    var pageNum = Math.ceil(data.length / maxPerPage);
    for (i = 0, k = 0; k < pageNum; k++) {
        var newData = new Array();
        for (j = 0; j < maxPerPage && i < data.length; j++ , i++) {
            newData[j] = {"index":i,"text":data[i]};
        }
        listData[k] = newData;
    }
    rows = listDiv.selectAll("a")
        .data(listData[page])
        .enter()
        .append("a")
        .html(d => d.text)
    pageLabel.value=page+1;
    pageLabel.innerHTML=page+1;
    pageNumLabel.value=pageNum;
    pageNumLabel.innerHTML=pageNum;

    return rows;
}

function showTopicList(currentTopicList,listId,isCheckAll){
    d3.selectAll("#"+listId+" >*").remove()
    if(currentTopicList.length>0){
        var listTopic=d3.select("#"+listId)
        row = listTopic.append("li")
            .attr("class","list-group-item")
            .append("div")
            .attr("class","input-group")
        row.append("div")
        .attr("class","input-group-prepend")
        .append("div")
        .attr("class","input-group-text")
        .append("input")
        .attr("id","checkbox_topic_all")
        .attr("type","checkbox")
        .attr("onclick","onclickTopicAll()")
        
        if(isCheckAll){
            document.getElementById("checkbox_topic_all").checked=true
        }else{
            document.getElementById("checkbox_topic_all").checked=false
        }

        row.append("label")
        .attr("class","checkbox_text form-control")
        .html("All (Topic Count: "+currentTopicList.length+")")

        var rows = listTopic.selectAll(".listRow")
            .data(currentTopicList)
            .enter()
            .append("li")
            .attr("class","listRow list-group-item")
            .attr("title",function(d){
                return d.name
            })
        group=rows.append("div")
            .attr("class","input-group")
    
        group.attr("class","input-group-prepend")
        .append("div")
        .attr("class","input-group-text")
        .append("input")
        .attr("type","checkbox")
        .attr("class","checkbox_topic")
        .attr("onclick",function(d){
            return "onclickTopic('"+d.name+"')"
        })
        .attr("name",d=>d.name)
        for(var i in currentTopicList){
            if(currentTopicList[i].isChecked){
                document.getElementsByName(currentTopicList[i].name)[0].checked=true
            }
        }
    
        group.append("label")
        .attr("class","checkbox_text form-control")
        .html(function(d){
            return d.name
        })
    }
}
function showAuthorList(currentAuthorList,listId,isCheckAll,sortBy){
    d3.selectAll("#"+listId+" >*").remove()
    if(currentAuthorList.length>0){
        listAuthor=d3.select("#"+listId)
        row = listAuthor.append("li")
            .attr("class","list-group-item")
            .append("div")
            .attr("class","input-group")
        row.append("div")
        .attr("class","input-group-prepend")
        .append("div")
        .attr("class","input-group-text")
        .append("input")
        .attr("id","checkbox_author_all")
        .attr("type","checkbox")
        .attr("onclick","onclickAuthorAll()")
        
        if(isCheckAll){
            document.getElementById("checkbox_author_all").checked=true
        }else{
            document.getElementById("checkbox_author_all").checked=false
        }

        row.append("label")
        .attr("class","checkbox_text form-control")
        .html("All (Author Count: "+currentAuthorList.length+")")

        var rows = listAuthor.selectAll(".listRow")
            .data(currentAuthorList)
            .enter()
            .append("li")
            .attr("class","listRow list-group-item")
            .attr("title",d=>d.givenName+" "+d.familyName)
        group=rows.append("div")
            .attr("class","input-group")
    
        group.attr("class","input-group-prepend")
        .append("div")
        .attr("class","input-group-text")
        .append("input")
        .attr("type","checkbox")
        .attr("class","checkbox_author")
        .attr("onclick",function(d){
            return "onclickAuthor('"+d.auid+"')"
        })
        .attr("name",d=>d.auid)
        for(var i in currentAuthorList){
            if(currentAuthorList[i].isChecked){
                var auid=currentAuthorList[i].auid
                document.getElementsByName(auid)[0].checked=true
            }
        }
    
        group.append("label")
        .attr("class","checkbox_text form-control")
        .html(function(d){
            if(sortBy!=SORT_AUTHOR_NAME){
                var num;
                if(sortBy==SORT_AUTHOR_DOCUMENT){
                    num=d.documentCount
                }else if(sortBy==SORT_AUTHOR_COAUTHORS){
                    num=d.coauthorsCount
                }else if(sortBy==SORT_AUTHOR_CITATION){
                    num=d.citationCount
                }
                return d.givenName+" "+d.familyName+"("+num+")"
            }else{
                return d.givenName+" "+d.familyName
            }
        })
    }
}

function showAreaList(currentAreaList,listId,isCheckAll){
    d3.selectAll("#"+listId+" >*").remove()
    if(currentAreaList.top.length<=0){
        return
    }
    var areaCount=currentAreaList.top.length
    for(var i in currentAreaList.subArea){
        areaCount+=currentAreaList.subArea[i].length
    }
    listArea=d3.select("#listContent_Area")
    var row = listArea.append("li")
        .attr("class","list-group-item")
        .append("div")
        .attr("class","input-group")
    row.append("div")
    .attr("class","input-group-prepend")
    .append("div")
    .attr("class","input-group-text")
    .append("input")
    .attr("id","checkbox_area_all")
    .attr("type","checkbox")
    .attr("onclick","onclickAreaAll()")

    row.append("label")
    .attr("class","checkbox_text form-control")
    .html("All (Area Count: "+areaCount+")")

    var topArea=currentAreaList.top
    var subArea=currentAreaList.subArea
    for(var i=0;i<topArea.length;i++){
        if(subArea[i].length==0){
            row=listArea.append("li")
            .attr("class","list-group-item")
            .attr("title",topArea[i])
    
            group=row.append("div")
            .attr("class","input-group")
            
            group.append("div")
            .attr("class","input-group-prepend")
            .append("div")
            .attr("class","input-group-text")
            .append("input")
            .attr("type","checkbox")
            .attr("name",topArea[i])
            .attr("id",removeBlank(topArea[i]))
            .attr("class","checkbox_area")
            .attr("checked",function(){
                if(isCheckAll==true){
                    return 'true'
                }else{
                    return 'false'
                }
            })
            .attr("onclick","onclickArea('None')")
    
            group.append("label")
            .attr("class","checkbox_text form-control")
            .html(topArea[i])
        }else{
            row=listArea.append("li")
            .attr("class","list-group-item")
            .attr("title",topArea[i])
    
            group=row.append("div")
            .attr("class","input-group")
            group.append("div")
            .attr("class","input-group-prepend")
            .append("div")
            .attr("class","input-group-text")
            .append("input")
            .attr("type","checkbox")
            .attr("name",topArea[i])
            .attr("id",removeBlank(topArea[i]))
            .attr("class","checkbox_area")
            .attr("checked",function(){
                if(isCheckAll==true){
                    return 'true'
                }else{
                    return 'false'
                }
            })
            .attr("onclick","onclickTopArea('"+removeBlank(topArea[i])+"')")
            group.append("button")
            .attr("type","button")
            .attr("class","btn bg-light dropdown-toggle form-control")
            .attr("data-toggle","collapse")
            .attr("data-target","#"+removeBlank(topArea[i])+"-sub")
            .html(topArea[i])

            subList=group.append("ul")
            .attr("id",removeBlank(topArea[i])+"-sub")
            .attr("class","collapse")

            subListGroup=subList.append("li")
            .attr("class","list-group-item")
            .append("div")
            .attr("class","input-group")
            
            subListGroup.append("div")
            .attr("class","input-group-prepend")
            .append("div")
            .attr("class","input-group-text")
            .append("input")
            .attr("type","checkbox")
            .attr("class","subBoxAll")
            .attr("onclick","onclickSubAreaAll('"+removeBlank(topArea[i])+"')")

            subListGroup.append("label")
            .attr("class","checkbox_text form-control")
            .html('All (Sub-Area Count: '+subArea[i].length+")")
    
            subRows=subList.selectAll(".subRow")
                .data(subArea[i])
                .enter()
                .append("li")
                .attr("class","subRow list-group-item")
                .attr("title",d=>d)
                
            subGroup=subRows.append("div")
            .attr("class","input-group")
            
            subGroup.append("div")
            .attr("class","input-group-prepend")
            .append("div")
            .attr("class","input-group-text")
            .append("input")
            .attr("type","checkbox")
            .attr("class","checkbox_area")
            .attr("onclick","onclickArea('"+removeBlank(topArea[i])+"')")
            .attr("name",d=>d)
            
            subGroup.append("label")
            .attr("class","checkbox_text form-control")
            .html(d=>d)
        }
    }
}

function sortByYear(publicationA,publicationB){
    yearA=parseInt(publicationA.year)
    yearB=parseInt(publicationB.year)
    return yearA-yearB
}
function translatePublicationDataToGraphAreaData(publicationData,targetAreas,targetTopics){
    /** 
    {node:[{name:'',data:[]},{}...],link:[{source:index,target:index,value:size},{}...]}
    */
    results=new Array()
    nodes=new Array()
    links=new Array()

    nodeNames=new Array()
    nodeIndexs=new Array()

    for(var index in publicationData){
        publication=publicationData[index]
        areas=publication['areas']
        topAreas=new Array()
        subAreas=new Array()
        for(var areaIndex in areas){
            area=areas[areaIndex]
            areaTop=area['top']
            
            if(targetAreas.indexOf(areaTop)>-1){
                //create node for top
                nodeIndex=nodeNames.indexOf(areaTop)
                    if(nodeIndex>-1){
                        node=nodes[nodeIndexs[nodeIndex]]
                        node['data'].push(publication)
                    }else{
                        nodeNames.push(areaTop)
                        nodeIndexs.push(nodes.length)
                        newNode=new Array()
                        newNode['name']=areaTop
                        newNode['data']=new Array()
                        newNode['data'].push(publication)
                        newNode['colorId']=nodes.length;
                        newNode['layer']='topArea'
                        nodes.push(newNode)
                    }
                //create link for top
                source=nodeIndexs[nodeNames.indexOf(areaTop)]
                for(var topIndex in topAreas){
                    var top=topAreas[topIndex]           
                    target=nodeIndexs[nodeNames.indexOf(top)]
                    linkAdded=false
                    for(var linkIndex in links){
                        link=links[linkIndex]
                        if(link['source']==source && link['target']==target ||
                        link['source'==target && link['target']==source]){
                            link['value']+=1
                            linkAdded=true
                            break
                        }
                    }
                    if(!linkAdded){
                        newLink=new Array()
                        newLink['source']=source
                        newLink['target']=target
                        newLink['value']=1
                        links.push(newLink)
                    }
                }
                topAreas.push(areaTop)
            }
            //create node for sub
            topIndex=nodeNames.indexOf(areaTop)
            if(area['subArea'].length>0){
                top_subAreas=area['subArea']
                for(var subAreaIndex in top_subAreas){
                    subArea=top_subAreas[subAreaIndex]
                    if(targetAreas.indexOf(subArea)>-1){
                        nodeIndex=nodeNames.indexOf(subArea)
                        if(nodeIndex>-1){
                            node=nodes[nodeIndexs[nodeIndex]]
                            node['data'].push(publication)
                        }else{
                            nodeNames.push(subArea)
                            nodeIndexs.push(nodes.length)
                            newNode=new Array()
                            newNode['name']=subArea
                            newNode['data']=new Array()
                            newNode['data'].push(publication)
                            if(topIndex>-1){
                                newNode['colorId']=nodeIndexs[topIndex]
                            }else{
                                newNode['colorId']=nodes.length;
                            }
                            newNode['layer']='subArea'
                            nodes.push(newNode)
                        }
                        //create link for sub
                        source=nodeIndexs[nodeNames.indexOf(subArea)]
                        if(topIndex>-1){
                            target=nodeIndexs[topIndex]
                            linkAdded=false
                            for(var linkIndex in links){
                                link=links[linkIndex]
                                if(link['source']==source && link['target']==target){
                                    linkAdded=true
                                    break
                                }
                            }
                            if(!linkAdded){
                                newLink=new Array()
                                newLink['source']=source
                                newLink['target']=target
                                newLink['value']=1
                                links.push(newLink)
                            }
                        }
                        for(var subIndex in subAreas){
                            sub=subAreas[subIndex]           
                            target=nodeIndexs[nodeNames.indexOf(sub)]
                            linkAdded=false
                            for(var linkIndex in links){
                                link=links[linkIndex]
                                if(link['source']==source && link['target']==target ||
                                   link['source'==target && link['target']==source]){
                                       link['value']+=1
                                       linkAdded=true
                                       break
                                }
                            }
                            if(!linkAdded){
                                newLink=new Array()
                                newLink['source']=source
                                newLink['target']=target
                                newLink['value']=1
                                links.push(newLink)
                            }
                        }
                        subAreas.push(subArea)
                    }
                }
            }
        }
    }
    results['node']=nodes
    results['link']=links
    return results
    //--------------------------
    // results=new Array()
    // node=new Array()
    // colorId=-1
    // var topAreas=new Array()
    // for(var index in publicationData){
    //     publication=publicationData[index]
    //     areas=publication['areas']
    //     for(var areaIndex in areas){
    //         area=areas[areaIndex]
    //         name=area['top']
    //         colorId=topAreas.indexOf(name)
    //         if(colorId==-1){
    //             colorId=topAreas.length
    //             topAreas.push(name)
    //         }
    //         if(targetAreas.indexOf(name)>-1){
    //             node=createNodeForArea(node,name,publication,colorId,'topArea')
    //         }

    //         if(area['subArea'].length>0){
    //             subAreas=area['subArea']
    //             for(var subAreaIndex in subAreas){
    //                 subArea=subAreas[subAreaIndex]
    //                 if(targetAreas.indexOf(subArea)>-1){
    //                     node=createNodeForArea(node,subArea,publication,colorId,'subArea')
    //                 }
    //             }
    //         }
    //     }
    //     var topics=publication['topics']
    //     for(var topicIndex in topics){
    //         var name=topics[topicIndex]
    //         if(targetTopics.indexOf(name)>-1){
    //             node=createNodeForArea(node,name,publication,'topic','topic')
    //         }
    //     }
    // }
    // var newArray=new Array()
    // for(var index in node){
    //     name=node[index]['name']
    //     data=node[index]['data']
    //     newNode=new Array()
    //     newNode['name']=name
    //     newNode['data']=data
    //     newArray.push(newNode)
    // }
    // results['node']=node
    // link=createLink(newArray,newArray.length-1)
    // results['link']=link
    // return results
}


function translatePublicationDataToGraphAuthorData(publicationData,authorList,targetAuthors){
    /** 
    {node:[{name:'',data:[]},{}...],link:[{source:index,target:index,value:size},{}...]}
    */

    results=new Array()
    nodes=new Array()
    links=new Array()

    var nodeNames=new Array()
    var nodeIndexs=new Array()

    for(var index in publicationData){
        publication=publicationData[index]
        authors=publication['authors']
        publicationInclude=false
        otherAuthors=new Array()
        authors_addedList=new Array()
        for(var authorIndex in authors){
            author=authors[authorIndex]
            var newName=author.auid+"-"+author.givenName+" "+author.familyName
            if(targetAuthors.indexOf(author.auid)>-1){
                publicationInclude=true
                nodeIndex=nodeNames.indexOf(newName)
                //create node
                if(nodeIndex>-1){
                    node=nodes[nodeIndexs[nodeIndex]]
                    node['data'].push(publication)
                }else{
                    nodeNames.push(newName)
                    nodeIndexs.push(nodes.length)

                    newNode=new Array()
                    newNode['name']=newName
                    newNode['data']=new Array()
                    newNode['data'].push(publication)
                    newNode['isUni']=1
                    nodes.push(newNode)
                }
                
                //create link
                source=nodeIndexs[nodeNames.indexOf(newName)]
                for(var i in authors_addedList){
                    author_added=authors_addedList[i]
                    target=nodeIndexs[nodeNames.indexOf(author_added)]

                    linkAdded=false
                    for(var linkIndex in links){
                        link=links[linkIndex]
                        if(link['source']==source && link['target']==target ||
                        link['source'==target && link['target']==source]){
                            link['value']+=1
                            linkAdded=true
                            break
                        }
                    }
                    if(!linkAdded){
                        newLink=new Array()
                        newLink['source']=source
                        newLink['target']=target
                        newLink['value']=1
                        links.push(newLink)
                    }
                }
                authors_addedList.push(newName)
            }else if(authorList.indexOf(author.auid)<=-1){
                otherAuthors.push(author)
            }
        }
        if(publicationInclude){
            for(var authorIndex in otherAuthors){
                otherAuthor=otherAuthors[authorIndex]
                var newName=otherAuthor.auid+"-"+otherAuthor.givenName+" "+otherAuthor.familyName
                //create node for authoer not in Uni
                nodeIndex=nodeNames.indexOf(newName)
                if(nodeIndex>-1){
                    node=nodes[nodeIndexs[nodeIndex]]
                    node['data'].push(publication)
                }else{
                    nodeNames.push(newName)
                    nodeIndexs.push(nodes.length)

                    newNode=new Array()
                    newNode['name']=newName
                    newNode['data']=new Array()
                    newNode['data'].push(publication)
                    newNode['isUni']=-1
                    nodes.push(newNode)
                }
                
                //create link
                source=nodeIndexs[nodeNames.indexOf(newName)]
                for(var i in authors_addedList){
                    author_added=authors_addedList[i]
                    target=nodeIndexs[nodeNames.indexOf(author_added)]

                    linkAdded=false
                    for(var linkIndex in links){
                        link=links[linkIndex]
                        if(link['source']==source && link['target']==target ||
                        link['source'==target && link['target']==source]){
                            link['value']+=1
                            linkAdded=true
                            break
                        }
                    }
                    if(!linkAdded){
                        newLink=new Array()
                        newLink['source']=source
                        newLink['target']=target
                        newLink['value']=1
                        links.push(newLink)
                    }
                }
                authors_addedList.push(newName)
            }
        }
    }
    results['node']=nodes
    results['link']=links

    return results
}

function createNodeForAuthor(nodes,newName,publication,isUni){
    added=false
    for(var index in nodes){
        var node=nodes[index]
        var nodeAuid=node['name'].split("-")[0]
        var newNameAuid=newName.split("-")[0]
        if(nodeAuid==newNameAuid){
            node['data'].push(publication)
            added=true
            break
        }
    }
    if(!added){
        newNode=new Array()
        newNode['name']=newName
        newNode['data']=new Array()
        newNode['data'].push(publication)
        newNode['isUni']=isUni
        nodes.push(newNode)
    }
    return nodes
}

function createNodeForArea(nodes,links,nodeNames,positions,newName,publication,colorId,layer){
    results=new Array()
    pos=-1
    added=false
    index=nodeNames.indexOf(newName)
    if(index>-1){
        pos=positions[index]
    }
    if(pos!=-1){
        node=nodes[pos]
        node['data'].push(publication)
    }else{
        newNode=new Array()
        newNode['name']=newName
        newNode['data']=new Array()
        newNode['data'].push(publication)
        newNode['colorId']=colorId
        newNode['layer']=layer
        nodes.push(newNode)

        nodeNames.push(newName)
        positions.push(nodes.length-1)
    }

    areas=publication['areas']
    source=pos
    if(layer=='topArea'){
        for (area in areas){
            if(area['top']!=newName){
                topIndex=nodeNames.indexOf(area['top'])
                if(topIndex>-1){
                    target=positions[topIndex]
                    linkAdded=false
                    for(link in links){
                        if(link['source']==source && link['target']==target ||
                        link['source']==target && link['target']==source){
                            linkAdded=true
                            link['value']+=1
                        }
                    }
                }
            }
        }
    }
    
    for(var index in nodes){
        node=nodes[index]
        if(node['name']==newName){
            node['data'].push(publication)
            added=true
            break
        }
    }
    if(!added){
        newNode=new Array()
        newNode['name']=newName
        newNode['data']=new Array()
        newNode['data'].push(publication)
        newNode['colorId']=colorId
        newNode['layer']=layer
        nodes.push(newNode)
    }
    return nodes
}



function createLink(originalNodes,source){
    links=[]
    if(originalNodes.length<=1){
        return links
    }
    node1=originalNodes.pop()
    target=0 
    for(var index in originalNodes){
        node=originalNodes[index]
        array1=new Array()
        for(var index in node1.data){
            publication=node1.data[index]
            array1.push(publication.title)
        }
        array2=new Array()
        for(var index in node.data){
            publication=node.data[index]
            array2.push(publication.title)
        }
        set1=new Set(array1)
        set2=new Set(array2)
        intersection=getIntersect(set1,set2)
        if(intersection.length>0){
            var newLink=new Array()
            newLink['source']=source
            newLink['target']=target
            newLink['value']=intersection.length
            links.push(newLink)
        }
        target+=1
    }
    links=links.concat(createLink(originalNodes,source-1))
    return links
}

function getIntersect(setA,setB){
    return Array.from(new Set([...setA].filter( x => setB.has(x))));
}

function translatePublicationDataToBarData(publicationData){
    /** 
    Translate the data of publications to the data for bar chart.
    The structure of data for bar chart should be:
    {'x':[],
     'labelX':'',
     'y':[[],[]...],
     'labelY':''
    }
    */
    publicationData.sort(sortByYear);
    x=new Array();
    y=new Array();
    yearIndex=-1;
    for(index in publicationData){
        publication=publicationData[index]
        if(x.indexOf(publication.year)==-1){
            x.push(publication.year)
            yearIndex+=1
            y.push(new Array())
        }
        y[yearIndex].push(publication)
    }
    barData={}      
    barData['x']=x
    barData['labelX']='Year'
    barData['y']=y
    barData['labelY']='Publication Count'
    return barData
}

function selectData(allData,year,authorsSelected,areasSelected){
    var publicationsData=new Array()
    for(var dataIndex in allData){
        var foundAuthor=false
        var foundArea=false
        var data=allData[dataIndex]
        if(authorsSelected.length>0){
            for(var authorIndex in authorsSelected){
                var authorAuid=authorsSelected[authorIndex]
                var isFound=false
                for(var i in data['authors']){
                    var oneAuthor=data['authors'][i]
                    if(authorAuid==oneAuthor.auid){
                        isFound=true
                        break
                    }
                }
                if(isFound){
                    foundAuthor=true
                    break
                }
            }
            if(!foundAuthor){
                continue
            }
        }else{
            continue
        }
        if(areasSelected.length>0){
            for(var areaIndex in areasSelected){
                var area=areasSelected[areaIndex]
                var dataAreas=data['areas']
                for(var dataAreaIndex in dataAreas){
                    var dataArea=dataAreas[dataAreaIndex]
                    var top=dataArea['top']
                    var sub=dataArea['subArea']
                    if(area==top || sub.indexOf(area)>-1){
                        foundArea=true
                        break
                    }
                }
                if(foundArea){
                    break
                }
            }
            if(!foundArea){
                continue
            }
        }else{
            continue
        }
        if(year!='All'){
            if(year!=data['year']){
                continue
            }
        }
        publicationsData.push(data)
    }
    return publicationsData
}
function selectDataByYear(publicationsData,currentYear){
    var results=new Array()
    for(var index in publicationsData){
        data=publicationsData[index]
        if(data['year']==currentYear){
            results.push(data)
        }
    }
    return results
}

function getAreas(publications){
    var results=new Array()
    results['top']=new Array()
    results['subArea']=new Array()
    for(var index in publications){
        var publication=publications[index]
        var areas=publication.areas
        for(var areaIndex in areas){
            var top=areas[areaIndex].top
            var sub=areas[areaIndex].subArea
            if(results.top.indexOf(top)==-1){
                results.top.push(top)
                results.subArea.push(sub)
            }else{
                var indexTop=results.top.indexOf(top)
                var set1=new Set(results.subArea[indexTop].concat(sub))
                results.subArea[indexTop]=Array.from(set1)
            }
        }
    }
    return results
}

function getTopics(publications){
    var results=new Array()
    for(var index in publications){
        var publication=publications[index]
        var topics=publication.topics
        for(var topicIndex in topics){
            name=topics[topicIndex]
            var found=false
            for(var i in results){
                result=results[i]
                if(result['name']==name){
                    found=true
                    break
                }
            }
            if(!found){
                var topic=new Array()
                topic['name']=name
                results.push(topic)
            }
        }
    }
    return results
}
function getAuthorList(publications,targetList){
    var results=new Array()
    for(var index in publications){
       var publication=publications[index]
       authors=publication.authors
       for(var authorIndex in targetList){
           author=targetList[authorIndex]
           var isFound=false
           for(var i in authors){
               var oneAuthor=authors[i]
               if(oneAuthor.auid==author.auid){
                   isFound=true
                   break
               }
           }
           if(isFound){
               var isHave=false
               for(var r in results){
                   var oneResult=results[r]
                   if(oneResult.auid==author.auid){
                       isHave=true
                       break
                   }
               }
               if(!isHave){
                   results.push(author)
               }
           }
       }
    }
    return results
}

function getSortFunction(sortBy){
    return function(authorA,authorB){
        var valueA,valueB;
        if(sortBy==SORT_AUTHOR_NAME){
            valueA=authorA.givenName
            valueB=authorB.givenName
        }else if(sortBy==SORT_AUTHOR_DOCUMENT){
            valueA=parseInt(authorB.documentCount)
            valueB=parseInt(authorA.documentCount)
        }else if(sortBy==SORT_AUTHOR_COAUTHORS){
            valueA=parseInt(authorB.coauthorsCount)
            valueB=parseInt(authorA.coauthorsCount)
        }else if(sortBy==SORT_AUTHOR_CITATION){
            valueA=parseInt(authorB.citationCount)
            valueB=parseInt(authorA.citationCount)
        }
        if(valueA<valueB){
            return -1
        }else{
            return 1
        }
    }
}
function removeBlank(text){
    newString=text.replace(/\s*/g,"");
    return newString
}

/**
 ========================================================
 chart
 ========================================================
 */
function drawBarChart(svgBarId, svgLegendId, divTitle, data, title, divTip) {
    //get data
    var x = data.x;
    var labelX = data.labelX;
    var y = data.y;
    var labelY = data.labelY;
    var legendNum = Object.keys(y).length - 1


    const svgBar = d3.select("#" + svgBarId);
    const svgLegend = d3.select("#" + svgLegendId);
    const tooltip = d3.select("#" + divTip)//tip while mouse on rectangle
        .attr("opacity", 0.0);
    d3.select("#" + divTitle).html(title);

    const chartMainView = svgBar.append("g")
        .attr("class", "svgMainView");
    const legendMainView = svgLegend.append("g")
        .attr("class", "svgMainView");

    var mainViewStyle = window.getComputedStyle(document.getElementsByClassName("svgMainView")[0]);
    var chartStyle = window.getComputedStyle(document.getElementById(svgBarId));
    var legendStyle = window.getComputedStyle(document.getElementById(svgLegendId));

    var chartWidth = parseInt(chartStyle["width"]);
    var chartHeight = parseInt(chartStyle["height"]);
    var legendWidth = parseInt(legendStyle["width"]);
    var legendHeight = parseInt(legendStyle["height"]);

    svgBar.attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 " + chartWidth + " " + chartHeight);
    svgLegend.attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 " + legendWidth + " " + legendHeight);



    var margin = { //margin of chart
        top: parseInt(mainViewStyle["margin-top"]),
        bottom: parseInt(mainViewStyle["margin-bottom"]),
        left: parseInt(mainViewStyle["margin-left"]),
        right: parseInt(mainViewStyle["margin-right"])
    };
    var rectPadding = parseInt(chartStyle.getPropertyValue("--rectPadding"));//the padding between rectangel
    var legendHeight = parseInt(legendStyle.getPropertyValue("--legendHeight"));//the height of legend
    var legendRectWidth = parseInt(legendStyle.getPropertyValue("--legendRectWidth"));//the width of rectangel in legend
    var legendRectHeight = parseInt(legendStyle.getPropertyValue("--legendRectHeight"));//the height of rectangel in legend
    var legendRectTextPadding = parseInt(legendStyle.getPropertyValue("--legendRectTextPadding"));//the padding between rectangel and text in legend
    var legendTextWidth = parseInt(legendStyle.getPropertyValue("--legendTextWidth"));//the max width of text in legend
    var legendWidthOne = legendRectWidth + legendRectTextPadding + legendTextWidth;//the total width of one legend
    var legendPadding = parseInt(legendStyle.getPropertyValue("--legendPadding"));//the padding between two legend
    var colorTheme = chartStyle.getPropertyValue("--colorTheme");//the color theme of rectangel

    //define the scale of x axis and y axis
    var xScale = d3.scaleBand()
        .domain(x)
        .range([margin.left, chartWidth - margin.right]);
    var yMin = 0;
    var yMax = d3.max(y.total.map(d => d.length));
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([chartHeight - margin.bottom, margin.top])


    //define the scale of color
    var colorScale = d3.scaleLinear()
        .domain([0, legendNum])
        .range([0, 1]);


    //start draw
    var lastLegendX = margin.left;//last x of legend
    var lastLegendY = margin.top;//last y of lengend

    var index = -1;
    var bars = chartMainView.append("g")
        .attr("class", "bar");
    for (var key in y) {
        index += 1;
        //draw the bars
        bars.append("g")
            .attr("class", "bar-" + key)
            .attr("visibility", () => {
                if (key == 'total') {
                    return "visible";
                } else {
                    return "hidden";
                }
            })
            .selectAll("rect")
            .data(y[key])
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return xScale(x[i]) + rectPadding / 2;
            })
            .attr("y", function (d, i) {
                return yScale(d.length);
            })
            .attr("width", xScale.step() - rectPadding)
            .attr("height", function (d, i) {
                return chartHeight - margin.bottom - yScale(d.length);
            })
            .attr("fill", () => {
                var scaleValue = colorScale(index);
                var getColor = new Function("k", "return " + colorTheme + "(k)")
                return getColor(scaleValue);
            })
            .attr("fill-opacity", "1")
            .on("mouseover", function (d, i) {
                //show tip
                tooltip.html(labelX + ":" + x[i] + "<br/>" + labelY + ":" + d.length)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity", 1.0);
            })
            .on("mouseout", function () {
                //hidden tip
                tooltip.style("opacity", 0.0);
            });

        //draw the legend
        var legend = legendMainView.append("g")
            .attr("id", "legend-" + key)
            .on("click", function () {
                var legendId = d3.select(this).attr("id");
                var key = legendId.split('-')[1];
                var barClass = ".bar-" + key;
                svgBar.selectAll(".bar g").attr("visibility", "hidden");
                svgBar.selectAll(".bar " + barClass).attr("visibility", "visible");
            });
        legend.append("rect")
            .attr("id", "legendRect-" + key)
            .attr("x", () => {
                if (key == 'total') {
                    lastLegendX = margin.left - legendWidthOne - legendPadding;
                }
                if (lastLegendX > legendWidth - margin.right - legendWidthOne) {
                    lastLegendX = margin.left
                    lastLegendY += lastLegendY + legendPadding;
                } else {
                    lastLegendX += legendWidthOne + legendPadding;
                }
                return lastLegendX;
            })
            .attr("y", () => {
                if (key == 'total') {
                    lastLegendY = margin.top;
                }
                return lastLegendY;
            })
            .attr("width", legendRectWidth)
            .attr("height", legendRectHeight)
            .attr("fill", () => {
                var scaleValue = colorScale(index);
                var getColor = new Function("k", "return " + colorTheme + "(k)")
                return getColor(scaleValue);
            });
        legend.append("text")
            .attr("x", lastLegendX + legendRectWidth + legendRectTextPadding)
            .attr("y", lastLegendY + legendRectHeight)
            .text(key);
    }
    //define the axis
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(x.length)
        .tickSizeOuter(0);
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(yMax)
        .tickSizeOuter(0);

    //draw the axis
    chartMainView.append("g")
        .attr("class", "axis-x")
        .call(xAxis)
        .attr("transform", "translate(0," + (chartHeight - margin.bottom) + ")");
    chartMainView.append("text")
        .attr("class", "axis-label")
        .text("year")
        .attr("transform", "translate(" + (chartWidth - margin.right + 10) + "," + (chartHeight - margin.bottom + 10) + ")");

    chartMainView.append("g")
        .attr("class", "axis-y")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);
    chartMainView.append("text")
        .attr("class", "axis-label")
        .text("publications")
        .attr("transform", "translate(" + margin.left + "," + (margin.top - 10) + ")");

    //allow the main view be zoomed
    var isZoom = chartStyle.getPropertyValue("--isZoom");
    if (isZoom == "true") {
        var zoom1 = d3.zoom().on("zoom", () => {
            chartMainView.attr("transform", d3.event.transform);
        });
        var zoom2 = d3.zoom().on("zoom", () => {
            legendMainView.attr("transform", d3.event.transform);
        });
        svgBar.call(zoom1);
        svgLegend.call(zoom2);
    }
}

function drawBarChart2(svgBarId, divTitle, data, title, divTip,areasSize) {
    //get data
    var x = data.x;
    var labelX = data.labelX;
    var y = data.y;
    var labelY = data.labelY;

    const svgBar = d3.select("#" + svgBarId);
    const tooltip = d3.select("#" + divTip)//tip while mouse on rectangle
        .attr("opacity", 0.0);
    d3.select("#" + divTitle).html(title);

    const chartMainView = svgBar.append("g")
        .attr("class", "svgMainView");

    var mainViewStyle = window.getComputedStyle(document.getElementsByClassName("svgMainView")[0]);
    var chartStyle = window.getComputedStyle(document.getElementById(svgBarId));

    var chartWidth = parseInt(chartStyle["width"]);
    var chartHeight = parseInt(chartStyle["height"]);

    svgBar.attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 " + chartWidth + " " + chartHeight);

    var margin = { //margin of chart
        top: parseInt(mainViewStyle["margin-top"]),
        bottom: parseInt(mainViewStyle["margin-bottom"]),
        left: parseInt(mainViewStyle["margin-left"]),
        right: parseInt(mainViewStyle["margin-right"])
    };
    var rectPadding = parseInt(chartStyle.getPropertyValue("--rectPadding"));//the padding between rectangel

    var colorTheme = chartStyle.getPropertyValue("--colorTheme");//the color theme of rectangel

    //define the scale of x axis and y axis
    var xScale = d3.scaleBand()
        .domain(x)
        .range([margin.left, chartWidth - margin.right]);
    var yMin = 0;
    var yMax = d3.max(y.map(d => d.length));
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([chartHeight - margin.bottom, margin.top])


    //start draw
    //draw the bars
    var isClicked=false
    chartMainView.append("g")
        .attr("class", "bar")
        .selectAll("rect")
        .data(y)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(x[i])+xScale.step()/4;
        })
        .attr("y", function (d, i) {
            return yScale(d.length);
        })
        .attr("width", xScale.step()/2)
        .attr("height", function (d, i) {
            return chartHeight - margin.bottom - yScale(d.length);
        })
        .attr("fill", function(){
            var getColor = new Function("k", "return " + colorTheme + "(k)")
            return getColor(0);
        })
        .attr("fill-opacity", "1")
        .on("mouseover", function (d, i) {
            //show tip
            var authorString=''
            var titleString=''
            if(areasSize==1){
                titleString="<br/><br/>First Publication:<br/>'"+title+"'"
                authorString+="<br/><br/>First Authors:<br/>"
                var firstYear=0;
            var firstMonth;
            var firstDay;
            var firstPublication;
            for(var i in d){
                var publication=d[i]
                if(firstYear==0){
                    firstYear=publication.year
                    firstMonth=publication.month
                    firstDay=publication.day
                    firstPublication=d[i]
                    continue
                }
                if(publication.year<firstYear || publication.year==firstYear && publication.month<firstMonth ||
                    publication.year==firstYear && publication.month==firstMonth && publication.day<firstDay){
                    firstYear=publication.year
                    firstMonth=publication.month
                    firstDay=publication.day
                    firstPublication=d[i]
                }
            }
            authors=firstPublication.authors
            title=firstPublication.title
            for(var i in authors){
                author=authors[i]
                authorString+=author['givenName']+' '+author['familyName']+';<br/>'
            }
            }
            
            
            tooltip.html(labelX + ":" + x[i] + "<br/>" + labelY + ":" + d.length +titleString+authorString)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity", 1.0)
                .style("display","inline");
        })
        .on("mouseout", function () {
            //hidden tip
            if(!isClicked){
                tooltip.style("opacity", 0.0)
            .style("display","none");
            }
        }).on("click",function(){
            isClicked=!isClicked
        });

    //define the axis
    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(x.length)
        .tickSizeOuter(0);
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10)
        .tickSizeOuter(0);

    //draw the axis
    chartMainView.append("g")
        .attr("class", "axis-x")
        .call(xAxis)
        .attr("transform", "translate(0," + (chartHeight - margin.bottom) + ")");
    chartMainView.append("text")
        .attr("class", "axis-label")
        .text(labelX)
        .attr("transform", "translate(" + (chartWidth - margin.right + 10) + "," + (chartHeight - margin.bottom + 10) + ")");

    chartMainView.append("g")
        .attr("class", "axis-y")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);
    chartMainView.append("text")
        .attr("class", "axis-label")
        .text(labelY)
        .attr("transform", "translate(" + margin.left + "," + (margin.top - 10) + ")");

    //allow the main view be zoomed
    var isZoom = chartStyle.getPropertyValue("--isZoom");
    if (isZoom == "true") {
        var zoom1 = d3.zoom().on("zoom", () => {
            chartMainView.attr("transform", d3.event.transform);
        });
        svgBar.call(zoom1);
    }
}

function drawDetails(svgID,divTip,selectedAuthor,publications,authorList){
    var authorWorker=new Worker('/static/js/dataHandler.js')
    authorWorker.postMessage({
        type:'author_detail',
        selectedAuthor:selectedAuthor,
        publications:publications,
        authorList:authorList
    })
    authorWorker.onmessage=function(event){
        var result=event.data.result

        var svg=document.getElementById(svgID)
        var matrix = svg.getScreenCTM()
                .translate(+ svg.getAttribute("cx"), + svg.getAttribute("cy"));
        d3.select('#authorDetail').style("display",'inline')
        .style("left", (window.pageXOffset + matrix.e + 15) + "px")
        .style("top", (window.pageYOffset + matrix.f - 30) + "px")
        .attr("onselectstart","return false");

        d3.selectAll("#authorDetailSvg >*").remove()
        
        str=selectedAuthor.split('-')
        name=str[1]
        drawGraph('authorDetailSvg', 'authorDetailTitle', result, name, divTip,null,null)
        authorWorker.terminate()
    }
    
}

function drawGraph(svgId, divTitle, data, title, divTip,publicationData,authorList) {
    var nodes = data['node'];
    var links = data['link'];

    var svgStyle = window.getComputedStyle(document.getElementById(svgId));
    var svgX= document.getElementById(svgId).getBoundingClientRect().left
    var svgY =document.getElementById(svgId).getBoundingClientRect().top
    var width = parseInt(svgStyle.getPropertyValue("width"));
    var height = parseInt(svgStyle.getPropertyValue("height"));
    var svg = d3.select("#" + svgId)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 " + width + " " + height);
    const mainView = svg.append("g")
        .attr("class", "svgMainView");
    const tooltip = d3.select("#" + divTip)
        .style("opacity", 0);

    //define the parameters in svg
    const colorTheme = svgStyle.getPropertyValue("--colorTheme");//the color theme
    const circleRadiusMin = parseInt(svgStyle.getPropertyValue("--circleRadiusMin"));
    const circleRadiusMax = parseInt(svgStyle.getPropertyValue("--circleRadiusMax"));
    const linkWidthMin = parseInt(svgStyle.getPropertyValue("--linkWidthMin"));
    const linkWidthMax = parseInt(svgStyle.getPropertyValue("--linkWidthMax"));
    const publicationCircleColor = svgStyle.getPropertyValue("--publicationCircle");
    const areaCircleColor = svgStyle.getPropertyValue("--areaCircle");
    const authorCircleColor = svgStyle.getPropertyValue("--authorCircle");

    //define the parameters in svg
    var colorScale;
    if(nodes[0].hasOwnProperty("colorId")){
        var max=d3.max(nodes.map(node=>{return parseInt(node.colorId)}))
        colorScale= d3.scaleLinear()//the scale of color
        .domain([0, max])
        .range([0, 1]);
    }else{
        colorScale= d3.scaleLinear()//the scale of color
        .domain([0, nodes.length])
        .range([0, 1]);
    } 

    //the scale of node size
    var minSize, maxSize;
    if (nodes[0].hasOwnProperty("data")) {
        minSize = d3.min(nodes.map(node => { return node.data.length }));
        maxSize = d3.max(nodes.map(node => { return node.data.length }));
    } else {
        minSize = circleRadiusMin;
        maxSize = circleRadiusMax;
    }
    var nodeScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([circleRadiusMin, circleRadiusMax]);

    //the scale of link width
    var minValue, maxValue;
    if (nodes[0].hasOwnProperty("data")) {
        minValue = d3.min(links.map(link => { return link.value }));
        maxValue = d3.max(links.map(link => { return link.value }));
    } else {
        minValue = linkWidthMin;
        maxValue = linkWidthMax;
    }
    var linkWidthScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([linkWidthMin, linkWidthMax]);

    var linkStrengthScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([0, 1]);

    var chargeStrengthScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([100, 200]);

    var positionStrengthScale = d3.scaleLinear()
        .domain([minSize, maxSize])
        .range([0.01, 0.3]);

    //start simulation
    var myWorker=new Worker("/static/js/drawGraph.js")
    myWorker.postMessage({
        nodes: nodes,
        links: links,
        minSize:minSize,
        maxSize:maxSize,
        width:width,
        height:height,
        circleRadiusMin:circleRadiusMin,
        circleRadiusMax:circleRadiusMax
      })
    
      myWorker.onmessage = function(event) {
          if(event.data.type=='tick' && divTitle!=null){
            d3.select("#" + divTitle).html(title+" (loading : "+event.data.num+")");
          }else if(event.data.type=='end'){
              if(divTitle!=null){
                d3.select("#" + divTitle).html(title)
              }
            nodes=event.data.nodes;
            links=event.data.links;
              //start draw the graph
    const link = mainView.append("g") //draw the link
    .attr("class", "link")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .style("display","inline")
    .attr("id", function (d) {
        return "link-" + d.source.index + "-" + d.target.index;
    })
    .attr("stroke-width", function (d) {
        if (d.hasOwnProperty("value")) {
            return linkWidthScale(d.value);
        } else {
            return linkWidthScale(linkWidthMin);
        }
    }).attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

var isClicked=false;

const node = mainView.append("g").attr("class", "node");
const node_all = node.selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("id", function (d) { return "node-" + d.index; })
    .attr("class",function(d){
        if(d.hasOwnProperty("isUni")){
            if(d.isUni==1){
                return "isUni";
            }else{
                return "notUni";
            }
        }else{
            return "";
        }
    });
    isDragged=false;
const nodeCircle = node_all    //draw the circle 
    .append("circle")
    .attr("r", function (d) {
        if (d.hasOwnProperty("data")) {
            return nodeScale(d.data.length);
        } else {
            if (d.name == 'title') {
                return nodeScale(circleRadiusMin);
            } else {
                return nodeScale(circleRadiusMax);
            }
        }

    })
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", function (d, i) {
        if (d.hasOwnProperty("colorId")) {
            if(d.colorId=='topic'){
                if(d.name=='unknown'){
                    return 'red'
                }else{
                    return 'blue'
                }
            }
            var scaleValue = colorScale(parseInt(d.colorId));
            var getColor = new Function("k", "return " + colorTheme + "(k)")
            return getColor(scaleValue);
        }
    })
    .on("mouseover", function (d) {
        console.log("mousmove");
        if (!isDragged) {
            var matrix = this.getScreenCTM()
                .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
            var text;
            if (d.hasOwnProperty("data")) {
                var array=d.name.split("-")
                if(array.length==1){
                    text = d.name + "<br/>Publication Count: " + d.data.length
                    if(d.hasOwnProperty("center")){
                        text=d.name
                    }
                }else{
                    text = array[1]+ "<br/>Publication Count: " + d.data.length
                    if(d.hasOwnProperty("center")){
                        text=array[1]
                    }
                }
            } else {
                text = d.text;
            }

            if(!isClicked && !d.hasOwnProperty("center")){
                highlightCircle(d.index);
            }
            tooltip.html(text)
                .style("left", (window.pageXOffset + matrix.e + 15) + "px")
                .style("top", (window.pageYOffset + matrix.f - 30) + "px")
                .style("opacity", 1)
                .style("display", "inline")
                .attr("onselectstart","return false");

        }
    })
    .on("mouseout", function (d) {
        tooltip.style("opacity", 0)
        .style("display", "none");
        if (!isDragged) {
            if(!isClicked){
                mainView.selectAll(".node g").style("display", "inline");
                mainView.selectAll(".link line").style("display", "inline");
            }
        }
    })
    .on("click",function(d){
        isClicked=!isClicked;
        if(isClicked && publicationData!=null){
            d3.select("#authorDetail").style("display",'inline')
            drawDetails(svgId,divTip,d.name,publicationData,authorList)
        }
        if(!isClicked && publicationData!=null){
            d3.selectAll("#authorDetailSvg >*").remove()
            d3.select("#authorDetail").style("display",'none')
        }
    });
          }
      }
    
    //allow the main view be zoomed
    var isZoom = svgStyle.getPropertyValue("--isZoom");
    if (isZoom == "true") {
        var zoom = d3.zoom().on("zoom", () => {
            mainView.attr("transform", d3.event.transform);
        });
        svg.call(zoom).on("dblclick.zoom",null);
    }


    function highlightCircle(index) {
        mainView.selectAll(".node g").style("display", "none");
        mainView.select(".node #node-" + index)
        .style("display", "inline");
        mainView.selectAll(".link line").style("display", function () {
            const link = d3.select(this);
            var sourceIndex = link.attr("id").split("-")[1];
            var targetIndex = link.attr("id").split("-")[2];
            if (sourceIndex == index || targetIndex == index) {
                mainView.select(".node #node-" + sourceIndex).style("display", "inline");
                mainView.select(".node #node-" + targetIndex).style("display", "inline");
                return "inline";
            } else {
                return "none";
            }
        });
    }
}