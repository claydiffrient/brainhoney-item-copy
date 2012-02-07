/*****************************************************************************
* Things to Do/Change/Add:
*    --Check out behavior within the same course.
*      --Duplicate item IDs, etc.
*    --Styling
*
*  Check in receiving course to determine if the parent exists.
*  If not copy the parent item as well.
* 
*  Integrate something to copy the attached resources as well.
*****************************************************************************/
//Global variables declared for the course ID.
var LEFT_COURSE_ID;
var RIGHT_COURSE_ID;

//Global variable declared to hold the XML data initially set to undefined.
var GLOBAL_LEFT_XML;
var GLOBAL_RIGHT_XML;

/*****************************************************************************
* Course is a constructor for a "Course" Object.  It simply contains a course
* title as well as the course id. (It's basically like the old C structs.
*****************************************************************************/
function Course(courseTitle, courseID)
{
   this.courseTitle = courseTitle;
   this.courseID = courseID;
}

/*****************************************************************************
* listCourses will get the current user's enrollment data.  It will then list
* them in a dropdown selection box allowing the user to select which courses
* they wish to use for the copy procedure.
*****************************************************************************/
function listCourses()
{
   //Set the userID variable to the currently authenticated user.
   var userID = FRAME_API.userId;
   //Use the FRAME API to run the GetUserEnrollmentList2 DLAP command.
   FRAME_API.executeCommand('getuserenrollmentlist2',
                            { userid: userID, flags: "536870912" } ,
                            {callback: function(options, success, response)
                            {
                               //Check for success
                               if (success)
                               {
                                  //Array to store all the applicable courses in.
                                  var courses = [];
                                  //Find all the enrollments within the response XML.
                                  $('enrollments enrollment entity', response.responseXML).each(function()
                                  {
                                     //Add the  to the courses array.
                                     var title = $(this).attr("title");
                                     if ($(this).attr("term") != "" )
                                        title += " - " + $(this).attr("term");
                                     var thisCourse = new Course(title, $(this).attr("id"));
                                     courses.push(thisCourse);
                                  }
                                 );
                                 
                                 for (var i = 0; i < courses.length; i++)
                                 {
                                    //Create an option element in the DOM.
                                    var toAdd = document.createElement("option");
                                    //Create another option for the second list.
                                    var toAdd2 = document.createElement("option");
                                    //Set title of the option to the item title and the type in parentheses.      
                                    toAdd.innerHTML = courses[i].courseTitle;
                                    toAdd2.innerHTML = courses[i].courseTitle;
                                    //Set the "id" attribute of the option to the item's id.
                                    toAdd.setAttribute("id", courses[i].courseID);
                                    toAdd2.setAttribute("id", courses[i].courseID);
                                    //Add the course to the proper selection box.
                                    $("#chooseLeft").append(toAdd);
                                    $("#chooseRight").append(toAdd2);
                                  }
                               }
                               else
                               {
                                  alert("Fail");
                               }   
                         }
                         });
                            
}

/*****************************************************************************
* showVariables is used to display the course ID within the HTML with the
* proper course id information from the global variables.
*****************************************************************************/
function showVariables()
{
   listCourses();
   changeCourseID();
}

/*****************************************************************************
* changeCourseID is used to change the global variables for the course IDs
* LEFT_COURSE_ID will update and RIGHT_COURSE_ID will update.
*****************************************************************************/
function changeCourseID(whichSide)
{
   if (whichSide == "left")
   {
      if (document.getElementById("chooseLeft").selectedIndex != 0)
      {
         LEFT_COURSE_ID = document.getElementById("chooseLeft").options[document.getElementById("chooseLeft").selectedIndex].id;
         getCourseItemsLeft();
      }
   }
   if (whichSide == "right")
   {
      if (document.getElementById("chooseRight").selectedIndex != 0)
      {
         RIGHT_COURSE_ID = document.getElementById("chooseRight").options[document.getElementById("chooseRight").selectedIndex].id;
         getCourseItemsRight();
      }
   }
}

/*****************************************************************************
* clearList will remove any items from the course's item list.
*****************************************************************************/
function clearList()
{
   //Determines the length of the options list.
   var leftLength = document.getElementById("leftList").options.length;
   var rightLength = document.getElementById("rightList").options.length;

	//Checks to see if there are any items in the left listing currently.
   if (leftLength != 0)
   {
      //Removes any modules.
      $("#leftList").empty();
     
      //Loop to remove items.
      for(leftLength - 1; leftLength >= 0; leftLength--)
      {
         document.getElementById("leftList").options[leftLength] = null;
      }
   }
   
   //Checks to see if there are any items in the right listing currently.
   if (rightLength != 0)
   {
      //Removes any modules.
      $("#rightList").empty();
      //Loop to remove items.
      for(rightLength - 1; rightLength >= 0; rightLength--)
      {
         document.getElementById("rightList").options[rightLength] = null;
      } 
   }
}

  
/*****************************************************************************
* getCourseItemsLeft will run the GetItemList DLAP command, parse the XML returned
* data, and then list them in the left box.
*****************************************************************************/
function getCourseItemsLeft()
{
   //Clears the list to remove any items in the course listing.
      //Determines the length of the options list.
   var leftLength = document.getElementById("leftList").options.length;

	//Checks to see if there are any items in the left listing currently.
   if (leftLength != 0)
   {
      //Removes any modules.
      $("#leftList").empty();
     
      //Loop to remove items.
      for(leftLength - 1; leftLength >= 0; leftLength--)
      {
         document.getElementById("leftList").options[leftLength] = null;
      }
   }
   
   //Uses the frame API to run a the DLAP command to return the Item List for the Left Course.
	FRAME_API.executeCommand("getitemlist",
	                        { entityid: LEFT_COURSE_ID },
									{ callback: function(options, success, response)
									{
					 					//Checks for success in the DLAP command.
										if (success)
										{
											//Stores the XML to a more accurately named variable.
											var leftCourseXML = response.responseXML;
                                 //Stores the XML for use in the global scope.
                                 GLOBAL_LEFT_XML = leftCourseXML;
											//Uses jQuery to find all the modules
                                 $(leftCourseXML).find("item data parent").each(function()
                                 {
                                    //Check to see if it is a module.  If so add it as a Optgroup.
                                    if ($(this).text() == "DEFAULT")
                                    {
                                       $("#leftList").append('<optgroup id=\"' + $(this).parent().parent().attr("id") + "_left" + '\" label=\"' + $(this).parent().parent().find("title").text() + '\" ></optgroup>');
                                    }
                                 }
                                 );
                                 
                                 $(leftCourseXML).find("item data").each(function()
                                 {
                                    //Check if it is not a module item.
                                    if ($(this).children("parent").text() != "DEFAULT")
                                    {
                                       //Create an option element in the DOM.
                                       var toAdd = document.createElement("option");
                                       //Set title of the option to the item title and the type in parentheses.
                                       toAdd.innerHTML = $(this).find("title").text() + ' (' + $(this).find("type").text() + ') ';
                                       //Set the "id" attribute of the opton to the item's id.
                                       toAdd.setAttribute("id", "" + $(this).parent().attr("id") + "_left");
                                       var toAddToID = "" + $(this).children("parent").text() + "_left";
                                       //Link the option to the proper module optgroup.
                                       $("#" + toAddToID).append(toAdd);
                                    }
                                 }
                                 );     
                              }   
										else
										{
                                 alert("Fail");
										}
									}
					            }
                           );
}

/*****************************************************************************
* getCourseItemsRight will run the GetItemList DLAP command, parse the XML returned
* data, and then list them in the right box.
*****************************************************************************/
function getCourseItemsRight()
{	
   //Determines the length of the options list.
   var rightLength = document.getElementById("rightList").options.length;
   //Checks to see if there are any items in the right listing currently.
   if (rightLength != 0)
   {
      //Removes any modules.
      $("#rightList").empty();
      //Loop to remove items.
      for(rightLength - 1; rightLength >= 0; rightLength--)
      {
         document.getElementById("rightList").options[rightLength] = null;
      } 
   }
 	//Uses the frame API to run a the DLAP command to return the Item List for the Right Course.
	FRAME_API.executeCommand("getitemlist",
	                        { entityid: RIGHT_COURSE_ID },
									{ callback: function(options, success, response)
									{
					 					//Checks for success in the DLAP command.
										if (success)
										{
											//Stores the XML to a more accurately named variable.
											var rightCourseXML = response.responseXML;
                                 //Stores the XML to use in the global scope.
                                 GLOBAL_RIGHT_XML = rightCourseXML;
											//Uses jQuery to find all the modules
                                 $(rightCourseXML).find("item data parent").each(function()
                                 {
                                    //Check to see if it is a module.  If so add it as a Optgroup.
                                    if ($(this).text() == "DEFAULT")
                                    {
                                       $("#rightList").append('<optgroup id=\"' + $(this).parent().parent().attr("id") + "_right" + '\" label=\"' + $(this).parent().parent().find("title").text() + '\" ></optgroup>');
                                    }
                                 }
                                 );
                                 
                                 $(rightCourseXML).find("item data").each(function()
                                 {
                                    //Check if it is not a module item.
                                    if ($(this).children("parent").text() != "DEFAULT")
                                    {
                                       //Create an option element in the DOM.
                                       var toAdd = document.createElement("option");
                                       //Set title of the option to the item title and the type in parentheses.
                                       toAdd.innerHTML = $(this).find("title").text() + ' (' + $(this).find("type").text() + ') ';
                                       //Set the "id" attribute of the opton to the item's id.
                                       toAdd.setAttribute("id", "" + $(this).parent().attr("id") + "_right");
                                       var toAddToID = "" + $(this).children("parent").text() + "_right";
                                       //Link the option to the proper module optgroup.
                                       $("#" + toAddToID).append(toAdd);
                                    }
                                 }
                                 );     
                              }   
										else
										{
                                 alert("Fail");
										}
									}
					            }
                           );
}

/*****************************************************************************
* copyItemToRight will run a DLAP command taking the data from the left course
* listing and will copy the item to the right course.  It will maintain the
* item's name and ID.
*****************************************************************************/
function copyItemToRight()
{
   //Finds index value of the selected item.
   var itemIndexSelected = document.getElementById("leftList").selectedIndex;
   //Finds the ID of the selected item.
   var selectedID = document.getElementById("leftList").options.item(itemIndexSelected).id;
   //Finds the ID of the selected node's parent (the module).
   var parentID = document.getElementById("leftList").options.item(itemIndexSelected).parentNode.id;
   
   //Strip "left" flag from selected ID
   selectedID = selectedID.substring(0,selectedID.length - 5);
   //Strip "left" flag from parent ID
   parentID = parentID.substring(0,parentID.length - 5);
   

   //Variable for the XML string to pass to the CopyItems DLAP command
   var xmlToPass = "";
   //Variable for the XML string to pass to the CopyResources DLAP command
   var resourceXML = "";
   
   //Check the existance of the module in the right course.
   if (!($("#rightList").children("#" + parentID + "_right").length > 0))
   {
      //If the module doesn't exist, add the module to the list of things to copy.
      xmlToPass += '<requests><item sourceentityid="' + LEFT_COURSE_ID;
      xmlToPass += '" sourceitemid="' + parentID;
      xmlToPass += '" destinationentityid="' + RIGHT_COURSE_ID;
      xmlToPass += '" destinationitemid="' + parentID + '_Copy-' + Math.floor(Math.random() * 100001) + '"/>';
      xmlToPass += '<item sourceentityid="' + LEFT_COURSE_ID;
      xmlToPass += '" sourceitemid="' + selectedID;
      xmlToPass += '" destinationentityid="' + RIGHT_COURSE_ID;
      xmlToPass += '" destinationitemid="' + selectedID + '_Copy-' + Math.floor(Math.random() * 100001) + '"/></requests>';
   }
   else
   {
      //If the module does exist, copy just the item.
      xmlToPass += '<requests><item sourceentityid="' + LEFT_COURSE_ID;
      xmlToPass += '" sourceitemid="' + selectedID;
      xmlToPass += '" destinationentityid="' + RIGHT_COURSE_ID;
      xmlToPass += '" destinationitemid="'
      //Check if the Item already exists in the right course
      if (!($("#rightList").children().children("#" + selectedID + "_right").length > 0))
      {
         //Item doesn't exist then perform straight across copy.
         xmlToPass += selectedID + '"/></requests>';
      }
      else
      {
         //Item does exist, append _Copy-RANDOM to the ID.
         xmlToPass += selectedID + '_Copy-' + Math.floor(Math.random() * 100001) + '"/></requests>';
      }
   }
   
   //Create an expression to use for matching the resources
   var expressionToMatch = new RegExp('Templates\\/Data\\/' + selectedID);
   
   //Find the href tag. Determine if it is a resource.
   $(GLOBAL_LEFT_XML).find("item data href").each(function()
   {
      var foundHREF = expressionToMatch.test($(this).text());
      if (foundHREF)
      {
         //BUILD XML for DLAP CopyResources
         resourceXML += "<requests>";
         resourceXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
         resourceXML += "' sourcepath='" + $(this).text();
         resourceXML += "' destinationentityid='" + RIGHT_COURSE_ID + "' />";
      }
   });

   //Find the rubric tag.  Copy the rubric.
   $(GLOBAL_LEFT_XML).find("item data rubric").each(function()
   {
      var foundRubric = expressionToMatch.test($(this).text());
      //BUILD XML for DLAP CopyResources
      if (foundRubric)
      {
         //Check if another resource is already being copied.
         //Add the requests tag if necessary.
         if (resourceXML.length == 0)
            resourceXML += "<requests>";
         
         resourceXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
         resourceXML += "' sourcepath='" + $(this).text();
         resourceXML += "' destinationentityid='" + RIGHT_COURSE_ID + "' />";      
      }
   });

   //Find the attachments tag
   $(GLOBAL_LEFT_XML).find("item id[value='"+ selectedID +"'] data attachments attachment").each(function()
   {
      //BUILD XML for DLAP CopyResources
      alert("Found Attach= " + $(this).text());      
   });
   
   //Close out the resource XML file if necessary
   if (resourceXML.length > 0)
      resourceXML += "</requests>";
   
      //Uses the Frame API to initiate the DLAP to copy the item.
      FRAME_API.executeCommand("copyitems", null,
                        { method: 'POST',
                          xmlData: xmlToPass,
                          callback: function(options, success, response)
                                    {
                                       if (success && response.details[0].code == 'OK' && response.details[1].code == 'OK')
                                       {
                                          alert("Copy Successful");
                                          //Run getCourseItemsRight() to refresh the copied to list.
                                          getCourseItemsRight();
                                       }
                                       else
                                       {
                                          alert("Error " + response.details[0].message);
                                       }
                                    }
                        }
                        );
   
   
      //Uses the Frame API to initiate the DLAP to copy the resources.
      FRAME_API.executeCommand("copyresources", null,
                        { method: 'POST',
                          xmlData: resourceXML,
                          callback: function(options, success, response)
                                    {
                                       if (success && response.details[0].code == 'OK' && response.details[1].code == 'OK')
                                       {
                                          //Things to do if resources were successful.
                                          alert("Copy Resources Successful");
                                       }
                                       else
                                       {
                                          alert("Error " + response.details[0].message);
                                       }
                                    }
                        }
                        );

   //Run getCourseItemsRight() to refresh the copied to list.
   getCourseItemsRight();
}