import functools
from web import myUtil,db

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('home', __name__)

@bp.route("/")
@bp.route("/home")
def home(): 
    """
    Get request from user and send response to user
    """
    authorList=session.get('authorList')    #Get author list from session,
    if authorList==None:                    #if it's not exist, get it from database and save it to session 
        authorList=db.getAuthorListFromDB()
        session['authorList']=authorList
    authorList=sorted(authorList,key=lambda author: author['givenName'])
    years=session.get('years')      #Get year list from session,
    if years==None:                 #if it's not exist, get it from database and save it to session
        years=db.getYearsFromDB()
        session['years']=years
    years.sort()
    newList=['All']
    newList.extend(years)
    years=newList
    publicationsData=db.getPublicationsFromDB()   #Get publications data from database

    # Return all data to user with the html template
    return render_template("base.html",publicationsData=publicationsData,years=years,authorList=authorList)
