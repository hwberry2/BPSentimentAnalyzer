# BPSentimentAnalyzer

# Google Sheets Sentiment Analyzer (Apps Script + Cloud Natural Language)

This project adds a custom menu to a Google Sheet and runs **sentiment analysis** on text stored in a “Review Data” tab using the **Google Cloud Natural Language API**. The script writes sentiment results back into the sheet and can optionally append results to an output tab.

> Note: The current implementation calls **Document Sentiment** (`documents:analyzeSentiment`). If you intend to analyze **Entity Sentiment**, you must switch the endpoint to `documents:analyzeEntitySentiment` and adjust the output schema accordingly.

---

## Features

- Adds a custom menu item: `***Bill's Sentiment Analyzer***`
- Reads text rows from the `Review Data` sheet
- Calls Google Cloud Natural Language API for sentiment scoring
- Writes:
  - a completion marker (e.g., `complete`)
  - sentiment `score`
  - sentiment `magnitude`
- (Optional) appends results into an `Entity Sentiment Data` sheet

---

## Prerequisites

- A Google Sheet
- An Apps Script project bound to that Sheet
- A Google Cloud project with the **Cloud Natural Language API** enabled
- An API key (or alternative auth strategy)

---

## Sheet Setup

Create a sheet tab named:

- `Review Data`

Add a header row (row 1) that includes at minimum:

- `comments` — the text to analyze
- `entity_sentiment` — a status/marker column used to indicate whether a row has been processed
- `id` — an identifier for the row (optional but recommended)

### Example headers

| id | comments | entity_sentiment | sentiment_score | sentiment_magnitude |
|---|---|---|---|---|

> The script currently assumes the `entity_sentiment` column exists and uses columns to the right of it for score/magnitude. For reliability, consider updating the script to explicitly look up `sentiment_score` and `sentiment_magnitude` by header name.

---

## Installation

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Paste the script into `Code.gs` (or your preferred file).
4. Save the project.

---

## Configure API Key (Recommended: Script Properties)

Do **not** hardcode keys in the source code if committing to GitHub.

1. In Apps Script, go to **Project Settings**.
2. Under **Script Properties**, add:
   - Key: `NL_API_KEY`
   - Value: your Google Cloud Natural Language API key

Update the script to read from Script Properties:

```js
const apiKey = PropertiesService.getScriptProperties().getProperty('NL_API_KEY');
