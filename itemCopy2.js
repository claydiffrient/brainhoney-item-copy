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
  //Store the selected nodes into an array of DynatreeNode objects.
  var leftCourseTreeItems = $("#leftList").dynatree("getSelectedNodes");
  //Create another array to hold just the item IDs.
  var itemIDs = [];
  //Store the item ID into the new array.
  for (var i = 0; i < leftCourseTreeItems.length; i++)
  {
     itemIDs[i] = leftCourseTreeItems[i].data.key;
  }
  //Start the CopyItems request string.
  var copyItemsRequestXML = "<requests>";
  //Start the CopyResources request string.
  var copyResourcesRequestXML = "<requests>";
  //Loop through all the selected ids.
  for (var i = 0; i < itemIDs.length; i++)
  {
     //Create a regular expression to match against for resources.
     var expressionToMatch = new RegExp('Templates\\/Data\\/' + itemIDs[i]);
     //Create a random number to append if necessary.
     var randomNumber = Math.floor(Math.random() * 10000001);
     //Check if the item already exists in the right tree.  If so append a random number.
     if ($("#rightList").dynatree("getTree").getNodeByKey(itemIDs[i]) != null)
     {
        //Build the CopyItems request string.
        copyItemsRequestXML += "<item sourceentityid='" + LEFT_COURSE_ID;
        copyItemsRequestXML += "' sourceitemid='" + itemIDs[i];
        copyItemsRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
        copyItemsRequestXML += "' destinationitemid='" + itemIDs[i] + '_Copy-' + randomNumber + "'/>";
        //Build the CopyResources request string.
        //Find the href tag. Determine if it is a resource.
        $(GLOBAL_LEFT_XML).find("item data href").each(function()
         {
            var foundHREF = expressionToMatch.test($(this).text());
            if (foundHREF)
            {
               copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
               copyResourcesRequestXML += "' sourcepath='" + $(this).text();
               copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
               copyResourcesRequestXML += "' destinationpath='Templates/Data/" + itemIDs[i] + "_Copy-" + randomNumber + "/'/>";
            }
         });
        //Find the rubric tag.  Copy the rubric.
        $(GLOBAL_LEFT_XML).find("item data rubric").each(function()
        {
            var foundRubric = expressionToMatch.test($(this).text());
            if (foundRubric)
            {
               copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
               copyResourcesRequestXML += "' sourcepath='" + $(this).text();
               copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
               copyResourcesRequestXML += "' destinationpath='Templates/Data/" + itemIDs[i] + "_Copy-" + randomNumber + "/'/>";
            }
        });
        //Find the attachments and copy them.
        var thisItem = itemIDs[i];
        $(GLOBAL_LEFT_XML).find("item[id ='" + thisItem + "'] attachments attachment").each(function()
        {
           copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
           copyResourcesRequestXML += "' sourcepath='" + $(this).attr("href");
           copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID + "'/>";
        });
     }
     else
     {
        //Build the CopyItems request string.
        copyItemsRequestXML += "<item sourceentityid='" + LEFT_COURSE_ID;
        copyItemsRequestXML += "' sourceitemid='" + itemIDs[i];
        copyItemsRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
        copyItemsRequestXML += "' destinationitemid='" + itemIDs[i] + "'/>";
        //Build the CopyResources request string.
        //Find the href tag. Determine if it is a resource.
        $(GLOBAL_LEFT_XML).find("item data href").each(function()
         {
            var foundHREF = expressionToMatch.test($(this).text());
            if (foundHREF)
            {
               copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
               copyResourcesRequestXML += "' sourcepath='" + $(this).text();
               copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
               copyResourcesRequestXML += "'/>";
            }
         });
        //Find the rubric tag.  Copy the rubric.
        $(GLOBAL_LEFT_XML).find("item data rubric").each(function()
        {
            var foundRubric = expressionToMatch.test($(this).text());
            if (foundRubric)
            {
               copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
               copyResourcesRequestXML += "' sourcepath='" + $(this).text();
               copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
               copyResourcesRequestXML += "'/>";
            }
        });
        //Find the attachments and copy them.
        var thisItem = itemIDs[i];        
        $(GLOBAL_LEFT_XML).find("item[id ='" + thisItem + "'] attachments attachment").each(function()
        {
           copyResourcesRequestXML += "<resource sourceentityid='" + LEFT_COURSE_ID;
           copyResourcesRequestXML += "' sourcepath='" + $(this).attr("href");
           copyResourcesRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID + "'/>";
        });
     }
     
     
     
     //Check to see if the parent node (module/folder) exists in the destination.  If not, add it.
     //Store the DynaTreeNode object.
     var itemNode = leftCourseTreeItems[i];
     //Store the level (level 1 = Module)
     var level = itemNode.getLevel();
     //Loop if there is more than just a module.
     while (level != 1)
     {
        //Reduce level to one below the item.
        level = level - 1; 
        //Store the key of the parent.
        var parentID = itemNode.getParent().data.key;
        //Set the itemNode to the parent node.
        itemNode = itemNode.getParent(); 
        //Add the parent items (module/folders) to the copy request if they don't exist already.
        if ($("#rightList").dynatree("getTree").getNodeByKey(parentID) == null)
        {
           copyItemsRequestXML += "<item sourceentityid='" + LEFT_COURSE_ID;
           copyItemsRequestXML += "' sourceitemid='" + parentID;
           copyItemsRequestXML += "' destinationentityid='" + RIGHT_COURSE_ID;
           copyItemsRequestXML += "' destinationitemid='" + parentID + "'/>";
        }
     }
  }
  
  //Close the copy items request.
  copyItemsRequestXML += "</requests>";
  //Close the copy resource request.
  copyResourcesRequestXML += "</requests>";
  
  alert("Copy Items\n" + copyItemsRequestXML);
  alert("Copy Resources\n" + copyResourcesRequestXML);
  console.log(copyItemsRequestXML);

  if (copyItemsRequestXML.length > 21)
  {
      //Uses the Frame API to initiate the DLAP to copy the item.
      FRAME_API.executeCommand("copyitems", null,
                        { method: 'POST',
                          xmlData: copyItemsRequestXML,
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
   }
   else
   {
      alert("Nothing selected to copy");
   }
   if (copyResourcesRequestXML.length > 21)
   {
      //Uses the Frame API to initiate the DLAP to copy the resources.
      FRAME_API.executeCommand("copyresources", null,
                        { method: 'POST',
                          xmlData: copyResourcesRequestXML,
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
   }
   else
   {
      alert("No Resources to copy");
   }
}
         