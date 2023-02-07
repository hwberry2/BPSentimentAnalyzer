// To learn how to use this script, refer to the documentation:
// https://developers.google.com/apps-script/samples/automations/feedback-sentiment-analysis

/*
Copyright 2022 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Sets API key for accessing Cloud Natural Language API.
const myApiKey = 'AIzaSyDjjhXv25AoxupTddxGS_2val7ziLE3IHA';

// Matches column names in Review Data sheet to variables.
let COLUMN_NAME = {
  COMMENTS: 'comments',//change this to 'combined_comments'
  ENTITY: 'entity_sentiment',//change this to 'sentiment_score'
  ID: 'id'//change to 'time_stamp'?
};

/**
 * Creates a New menu in Google Spreadsheets.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('***Bill\'s Sentiment Analyzer***')
    .addItem('Click Here to Perform Sentiment Analysis', 'markEntitySentiment')
    .addToUi();
};

/**
* Analyzes sentiment for each comment in  
* Review Data sheet and copies results into the 
* Entity Sentiment Data sheet.
*/
function markEntitySentiment() {
  // Sets variables from the "Review Data" sheet
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dataSheet = ss.getSheetByName('Review Data');
  let rows = dataSheet.getDataRange();
  let numRows = rows.getNumRows();
  let values = rows.getValues();
  let headerRow = values[0];
  
  // Checks to see if "Entity Sentiment Data" sheet is present, and
  // if not, creates a new sheet and sets the header row.
  //this code is not necessary by default and might need
  //to be removed later.
  let entitySheet = ss.getSheetByName('Entity Sentiment Data');
  if (entitySheet == null) {
   ss.insertSheet('Entity Sentiment Data');
   let entitySheet = ss.getSheetByName('Entity Sentiment Data');
   let esHeaderRange = entitySheet.getRange(1,1,1,6);
   //creates the header
   let esHeader = [['Review ID','Entity','Salience','Sentiment Score',
                    'Sentiment Magnitude','Number of mentions']];
   esHeaderRange.setValues(esHeader);
  };
  
  // Finds the column index for comments, language_detected, 
  // and comments_english columns.
  let textColumnIdx = headerRow.indexOf(COLUMN_NAME.COMMENTS);
  let entityColumnIdx = headerRow.indexOf(COLUMN_NAME.ENTITY);
  let idColumnIdx = headerRow.indexOf(COLUMN_NAME.ID);
  if (entityColumnIdx == -1) {
    Browser.msgBox("Error: Could not find the column named " + COLUMN_NAME.ENTITY + 
                   ". Please create an empty column with header \"entity_sentiment\" on the Review Data tab.");
    return; // bail
  };
  
  ss.toast("Analyzing entities and sentiment...");
  for (let i = 0; i < numRows; ++i) {
    let value = values[i];
    let commentEnCellVal = value[textColumnIdx];
    let entityCellVal = value[entityColumnIdx];
    let reviewId = value[idColumnIdx];
    
    // Calls retrieveEntitySentiment function for each row that has a comment 
    // and also an empty entity_sentiment cell value.
    if(commentEnCellVal && !entityCellVal) {
        let nlData = retrieveEntitySentiment(commentEnCellVal);
        // Pastes each entity and sentiment score into Entity Sentiment Data sheet.
        let newValues = []
        //the for should be deleted
        //for (let entity in nlData.documentSentiment) {
        let entity = nlData.documentSentiment;//[entity];
        let row = [reviewId, "", "", entity.score, 
                     entity.magnitude, ""
                    ];
          newValues.push(row);
        //}
        if(newValues.length) {
          entitySheet.getRange(entitySheet.getLastRow() + 1, 1, newValues.length, newValues[0].length).setValues(newValues);
      }
        // Pastes "complete" into entity_sentiment column to denote completion of NL API call.
        dataSheet.getRange(i+1, entityColumnIdx+1).setValue("complete");
        dataSheet.getRange(i+1, entityColumnIdx+2).setValue(entity.score);
        dataSheet.getRange(i+1, entityColumnIdx+3).setValue(entity.magnitude);//necessary?
     }
   }
};

/**
 * Calls the Cloud Natural Language API with a string of text to analyze
 * entities and sentiment present in the string.
 * @param {String} the string for entity sentiment analysis
 * @return {Object} the entities and related sentiment present in the string
 */
function retrieveEntitySentiment (line) {
  let apiKey = myApiKey;
  let apiEndpoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey;
  // Creates a JSON request, with text string, language, type and encoding
  let nlData = {
    document: {
      language: 'en-us',
      type: 'PLAIN_TEXT',
      content: line
    },
    encodingType: 'UTF8'
  };
  // Packages all of the options and the data together for the API call.
  let nlOptions = {
    method : 'post',
    contentType: 'application/json',  
    payload : JSON.stringify(nlData)
  };
  // Makes the API call.
  let response = UrlFetchApp.fetch(apiEndpoint, nlOptions);
  return JSON.parse(response);
};
