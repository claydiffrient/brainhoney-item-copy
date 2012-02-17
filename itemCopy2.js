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
* Function to initialize the list
*****************************************************************************/
$(function()
  {
     $("#leftList").dynatree(
                    {
                       generateIds: true,
                       idPrefix: "left_",
                       onDblClick: openPreviewLinkLeft,
                       onClick: function(node, event)
                                {
                                   if(! node.data.isFolder)
                                      node.toggleSelect();
                                },
                       selectMode: 2
                     });
     $("#rightList").dynatree(
               {
                  generateIds: true,
                  idPrefix: "right_",
                  onDblClick: openPreviewLinkRight,                  
                  selectMode: 2
                });
   });
   
/*****************************************************************************
* openPreviewLinkLeft will open a preview link when an item is double clicked
*****************************************************************************/
function openPreviewLinkLeft(node, event)
{
   //Generate information for the preview link
   //Create the link variable and start with the link information.
   var previewLink = document.createElement("a");
   previewLink.setAttribute("class", "popUpPreview fancybox.iframe");
   
   //Find the count for the number of enrollments the user has.
   var loopCount = FRAME_API.enrollments.length;
   
   //Loop through to find the enrollment ID of the current course.
   var courseEnrollment;
   for (i = 0; i < loopCount; i++)
   {
      if (LEFT_COURSE_ID == FRAME_API.enrollments[i].courseId)
         courseEnrollment = FRAME_API.enrollments[i].id;
   }
   //Start building the actual preview link
   var builtLink = "http://byui.brainhoney.com/Component/ActivityPlayer?enrollmentid="
   //Append the enrollmentid to the preview link.
   builtLink += courseEnrollment;
   builtLink += "&itemid=";
   builtLink += node.data.key;
   builtLink += "&showheader=false";
   console.log(builtLink);
   $.fancybox.open({href: builtLink, title:'Item Preview'}, {type: "iframe"});
}

/*****************************************************************************
* openPreviewLinkRight will open a preview link when an item is double clicked
*****************************************************************************/
function openPreviewLinkRight(node, event)
{
   //Generate information for the preview link
   //Create the link variable and start with the link information.
   var previewLink = document.createElement("a");
   previewLink.setAttribute("class", "popUpPreview fancybox.iframe");
   
   //Find the count for the number of enrollments the user has.
   var loopCount = FRAME_API.enrollments.length;
   
   //Loop through to find the enrollment ID of the current course.
   var courseEnrollment;
   for (i = 0; i < loopCount; i++)
   {
      if (RIGHT_COURSE_ID == FRAME_API.enrollments[i].courseId)
         courseEnrollment = FRAME_API.enrollments[i].id;
   }
   //Start building the actual preview link
   var builtLink = "http://byui.brainhoney.com/Component/ActivityPlayer?enrollmentid="
   //Append the enrollmentid to the preview link.
   builtLink += courseEnrollment;
   builtLink += "&itemid=";
   builtLink += node.data.key;
   builtLink += "&showheader=false";
   $.fancybox.open({href: builtLink, title:'Item Preview'}, {type: "iframe"});
}

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
                                    //Set the "id" attribute of the option to the item's id.
                                    toAdd.setAttribute("id", courses[i].courseID);
                                    toAdd2.setAttribute("id", courses[i].courseID);
                                    //Set title of the option to the item title and the type in parentheses.      
                                    toAdd.innerHTML = courses[i].courseTitle;
                                    toAdd2.innerHTML = courses[i].courseTitle;
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
   //Get the root node for the tree.
   var leftRootNode = $("#leftList").dynatree("getRoot");
   //Clears the list to remove any items in the course listing.
   leftRootNode.removeChildren();
   
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
                                    
                                    //Check to see if it is a module.  If so add it as a ul with no parent.
                                    if ($(this).text() == "DEFAULT")
                                    {
                                       leftRootNode.addChild(
                                       {
                                          title: $(this).parent().parent().find("title").text() ,
                                          tooltip: $(this).parent().parent().find("title").text() + " - " + $(this).parent().parent().attr("id"),
                                          isFolder: true,
                                          key: $(this).parent().parent().attr("id")
                                       });
                                    }
                                 }
                                 );
                                 
                           //START FOLDER LOOP                    
                           //Loop through 5 times to pick up any folders up to 5 levels in.
                           for (counter = 0; counter < 5; counter++)
                           {
                              $(leftCourseXML).find("item data").each(function()
                              {
                                 //Check for Folders.  If so then add to the tree.
                                 if (($(this).children("type").length <= 0) && ($(this).children("parent").text() != "DEFAULT"))
                                 {
                                    var nodeToAddTo = $("#leftList").dynatree("getTree").getNodeByKey($(this).children("parent").text());
                                    var nullCheck = $(nodeToAddTo).length;
                                    if (nullCheck > 0)
                                    {
                                       //Check if the folder already exists
                                       var folderThereCheck = $("#leftList").dynatree("getTree").getNodeByKey($(this).parent().attr("id"));
                                       folderThereCheck = $(folderThereCheck).length;
                                       if (folderThereCheck <= 0)
                                       {
                                          nodeToAddTo.addChild(
                                          {
                                             title: $(this).find("title").text(),
                                             key: $(this).parent().attr("id"),
                                             isFolder: true,
                                             tooltip: $(this).find("title").text() + " - " + $(this).parent().attr("id")
                                          });
                                       }
                                    }
                                 }
                              });
                              
                           }
                           //END FOLDER LOOP

                                 $(leftCourseXML).find("item data").each(function()
                                 {
                                    //Check if it is not a module item or a folder.
                                    if (($(this).children("type").length > 0) && ($(this).children("parent").text() != "DEFAULT"))
                                    {
                                       //Get the Parent Node
                                       toAddTo = $("#leftList").dynatree("getTree").getNodeByKey($(this).children("parent").text());
                                       //Check to make sure the parent node is not null.
                                       var nullCheck = $(toAddTo).length;
                                       if (nullCheck > 0)
                                       {
                                         //set the icon file name to a null value.
                                         var iconFileName = "";
                                         //Switch on the type from the XML storing it to iconFileName
                                         switch ($(this).find("type").text())
                                         {
                                             case "Assessment":
                                                iconFileName = "assessment.gif";
                                                break;
                                             case "Assignment":
                                                iconFileName = "assignment.gif";
                                                break;                                                
                                             case "Discussion":
                                                iconFileName = "discussion.gif";
                                                break;
                                             case "Journal":
                                                iconFileName = "journal.gif";
                                                break;
                                             case "Wiki":
                                                iconFileName = "wiki.gif";
                                                break;
                                             case "Blog":
                                                iconFileName = "blog.gif";
                                                break;
                                             case "Resource":
                                                iconFileName = "editable_content.gif";
                                                break;
                                             case "CustomActivity":
                                                iconFileName = "custom_activity.gif";
                                                break;
                                             case "AssetLink":
                                                iconFileName = "link.gif";
                                                break;
                                             default:
                                                break;
                                          }
                                          //Add the item to the proper parent.
                                          toAddTo.addChild(
                                          {
                                             title: $(this).find("title").text() ,
                                             tooltip: $(this).find("title").text() + " - " + $(this).parent().attr("id"),
                                             isFolder: false,
                                             key: $(this).parent().attr("id"),
                                             icon: iconFileName
                                          });
                                       }
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
   //Get the root node for the tree.
   var rightRootNode = $("#rightList").dynatree("getRoot");
   //Clears the list to remove any items in the course listing.
   rightRootNode.removeChildren();
   
   //Uses the frame API to run a the DLAP command to return the Item List for the Left Course.
	FRAME_API.executeCommand("getitemlist",
	                        { entityid: RIGHT_COURSE_ID },
									{ callback: function(options, success, response)
									{
					 					//Checks for success in the DLAP command.
										if (success)
										{
											//Stores the XML to a more accurately named variable.
											var rightCourseXML = response.responseXML;
                                 //Stores the XML for use in the global scope.
                                 GLOBAL_RIGHT_XML = rightCourseXML;
											//Uses jQuery to find all the modules
                                 $(rightCourseXML).find("item data parent").each(function()
                                 {
                                    
                                    //Check to see if it is a module.  If so add it as a ul with no parent.
                                    if ($(this).text() == "DEFAULT")
                                    {
                                       rightRootNode.addChild(
                                       {
                                          title: $(this).parent().parent().find("title").text() ,
                                          tooltip: $(this).parent().parent().find("title").text() + " - " + $(this).parent().parent().attr("id"),
                                          isFolder: true,
                                          key: $(this).parent().parent().attr("id")
                                       });
                                    }
                                 }
                                 );
                                 
                           //START FOLDER LOOP                    
                           //Loop through 5 times to pick up any folders up to 5 levels in.
                           for (counter = 0; counter < 5; counter++)
                           {
                              $(rightCourseXML).find("item data").each(function()
                              {
                                 //Check for Folders.  If so then add to the tree.
                                 if (($(this).children("type").length <= 0) && ($(this).children("parent").text() != "DEFAULT"))
                                 {
                                    var nodeToAddTo = $("#rightList").dynatree("getTree").getNodeByKey($(this).children("parent").text());
                                    var nullCheck = $(nodeToAddTo).length;
                                    if (nullCheck > 0)
                                    {
                                       //Check if the folder already exists
                                       var folderThereCheck = $("#rightList").dynatree("getTree").getNodeByKey($(this).parent().attr("id"));
                                       folderThereCheck = $(folderThereCheck).length;
                                       if (folderThereCheck <= 0)
                                       {
                                          nodeToAddTo.addChild(
                                          {
                                             title: $(this).find("title").text(),
                                             key: $(this).parent().attr("id"),
                                             isFolder: true,
                                             tooltip: $(this).find("title").text() + " - " + $(this).parent().attr("id")
                                          });
                                       }
                                    }
                                 }
                              });
                              
                           }
                           //END FOLDER LOOP

                                 $(rightCourseXML).find("item data").each(function()
                                 {
                                    //Check if it is not a module item or a folder.
                                    if (($(this).children("type").length > 0) && ($(this).children("parent").text() != "DEFAULT"))
                                    {
                                       //Get the Parent Node
                                       toAddTo = $("#rightList").dynatree("getTree").getNodeByKey($(this).children("parent").text());
                                       //Check to make sure the parent node is not null.
                                       var nullCheck = $(toAddTo).length;
                                       if (nullCheck > 0)
                                       {
                                         //set the icon file name to a null value.
                                         var iconFileName = "";
                                         //Switch on the type from the XML storing it to iconFileName
                                         switch ($(this).find("type").text())
                                         {
                                             case "Assessment":
                                                iconFileName = "assessment.gif";
                                                break;
                                             case "Assignment":
                                                iconFileName = "assignment.gif";
                                                break;                                                
                                             case "Discussion":
                                                iconFileName = "discussion.gif";
                                                break;
                                             case "Journal":
                                                iconFileName = "journal.gif";
                                                break;
                                             case "Wiki":
                                                iconFileName = "wiki.gif";
                                                break;
                                             case "Blog":
                                                iconFileName = "blog.gif";
                                                break;
                                             case "Resource":
                                                iconFileName = "editable_content.gif";
                                                break;
                                             case "CustomActivity":
                                                iconFileName = "custom_activity.gif";
                                                break;
                                             case "AssetLink":
                                                iconFileName = "link.gif";
                                                break;
                                             default:
                                                break;
                                          }                                         
                                          //Add the item to the proper parent.
                                          toAddTo.addChild(
                                          {
                                             title: $(this).find("title").text(),
                                             tooltip: $(this).find("title").text() + " - " + $(this).parent().attr("id"),
                                             isFolder: false,
                                             key: $(this).parent().attr("id"),
                                             icon: iconFileName
                                          });
                                       }
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
  var leftCourseTreeItems = $("#leftList").dynatree("getSelectedNodes");
  var itemIDs = [];
  for (var i = 0; i < leftCourseTreeItems.length; i++)
  {
     itemIDs[i] = leftCourseTreeItems[i].data.key;
  }
  for (var i = 0; i < itemIDs.length; i++)
  {
     //If statement to check if the item exists on the right side.
     //If it exists add to the request string.
     //Else Append Copy-######
  }
  console.log(itemIDs);
  alert(leftCourseTreeItems);
  
 // $("
  //Start the process of creating the CopyItems DLAP call.
  
  /*
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
   */
}
         