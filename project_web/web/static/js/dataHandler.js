onmessage=(function(e){
    var data=e.data
    var type=data.type
    if(type=="translate_bar"){
        postMessage({type:"notification",where:"bar"})
        var selectedPublications=data.selectedPublications
        var result=translatePublicationDataToBarData(selectedPublications)

        postMessage({type:"translate_bar",result:result})
    }
    else if(type=="translate_area"){
        postMessage({type:"notification",where:"area"})
        var selectedPublications=data.selectedPublications
        var areaChecked=data.areaChecked
        var topicChecked=data.topicChecked
        var result=translatePublicationDataToGraphAreaData(selectedPublications,areaChecked,topicChecked)

        postMessage({type:"translate_area",result:result})
    }else if(type=="translate_author"){
        postMessage({type:"notification",where:"author"})
        var selectedPublications=data.selectedPublications
        var authorIdList=data.authorIdList
        var authorChecked=data.authorChecked
        var result=translatePublicationDataToGraphAuthorData(selectedPublications,authorIdList,authorChecked) 

        postMessage({type:"translate_author",result:result,selectedPublications:selectedPublications})
    }else if(type=='author_detail'){
        var selectedAuthor=data.selectedAuthor
        var publications=data.publications
        var authorList=data.authorList
        var result=translatePublicationDataToAuthorDetail(selectedAuthor,publications,authorList)

        postMessage({type:"author_detail",result:result})
    }

    self.close()
})

function translatePublicationDataToAuthorDetail(selectedAuthor,publicationData,authorList){
    results=new Array()
    nodes=new Array()
    links=new Array()

    selectedNode=new Array()
    selectedNode['name']=selectedAuthor
    selectedNode['data']=new Array()
    selectedNode['isUni']=1
    selectedNode['center']=1
    nodes.push(selectedNode)
    authorStrs=selectedAuthor.split('-')
    auid=authorStrs[0]

    
    var nodeIds=new Array()

    for(var publicationIndex in publicationData){
        publication=publicationData[publicationIndex]
        authors=publication['authors']
        publicationInclude=false
        for(var authorIndex in authors){
            author=authors[authorIndex]
            if(author.auid==auid){
                selectedNode['data'].push(publication)
                publicationInclude=true
            }
        }
        if(publicationInclude){
            for(var authorIndex in authors){
                author=authors[authorIndex]
                if(author.auid==auid){
                    continue
                }
                nodeIndex=nodeIds.indexOf(author.auid)
                if(nodeIndex<=-1){
                    nodeIds.push(author.auid)
                    newNode=new Array()
                    newName=author.auid+"-"+author.givenName+" "+author.familyName
                    newNode['name']=newName
                    newNode['data']=new Array()
                    newNode['data'].push(publication)
                    if(authorList.indexOf(author.auid)>-1){
                        newNode['isUni']=1
                    }else{
                        newNode['isUni']=-1
                    }
                    
                    newNode['center']=0
                    nodes.push(newNode)
    
                    //create link
                    newLink=new Array()
                    newLink['source']=0
                    newLink['target']=nodes.length-1
                    links.push(newLink)
                }
            }
        }
    }
    results['node']=nodes
    results['link']=links
    return results
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
        //create node for topics
        topics=publication['topics']
        topic=topics[0]
        if(targetTopics.indexOf(topic)>-1){
            nodeIndex=nodeNames.indexOf(topic)
        if(nodeIndex>-1){
            node=nodes[nodeIndexs[nodeIndex]]
            node['data'].push(publication)
        }else{
            nodeNames.push(topic)
            nodeIndexs.push(nodes.length)
            newNode=new Array()
            newNode['name']=topic
            newNode['data']=new Array()
            newNode['data'].push(publication)
            newNode['colorId']='topic';
            newNode['layer']='topic'
            nodes.push(newNode)
        }
        //create link for topics
         source=nodeIndexs[nodeNames.indexOf(topic)]
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
         for(var subIndex in subAreas){
            var sub=subAreas[subIndex]           
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
        }


        
    }
    results['node']=nodes
    results['link']=links
    return results
}

function translatePublicationDataToGraphAuthorData(publicationData,authorList,targetAuthors){
    /** 
    {node:[{name:'',data:[]},{}...],link:[{source:index,target:index,value:size},{}...]}
    */

    results=new Array()
    nodes=new Array()
    links=new Array()

    var nodeNames=new Array()
    var nodeIds=new Array()
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
                nodeIndex=nodeIds.indexOf(author.auid)
                //create node
                var nodeAdded=false
                if(nodeIndex>-1){
                    node=nodes[nodeIndexs[nodeIndex]]
                    node['data'].push(publication)
                    nodeAdded=true
                }else{
                    nodeNames.push(newName)
                    nodeIds.push(author.auid)
                    nodeIndexs.push(nodes.length)

                    newNode=new Array()
                    newNode['name']=newName
                    newNode['data']=new Array()
                    newNode['data'].push(publication)
                    newNode['isUni']=1
                    nodes.push(newNode)
                }
                
                //create link
                source=nodeIndexs[nodeIds.indexOf(author.auid)]
                for(var i in authors_addedList){
                    author_added=authors_addedList[i]
                    target=nodeIndexs[nodeIds.indexOf(author_added)]

                    linkAdded=false
                    if(nodeAdded){
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
                    }else{
                        newLink=new Array()
                        newLink['source']=source
                        newLink['target']=target
                        newLink['value']=1
                        links.push(newLink)
                    }
                    
                }
                authors_addedList.push(author.auid)
            }
        }
    }
    results['node']=nodes
    results['link']=links

    return results
}