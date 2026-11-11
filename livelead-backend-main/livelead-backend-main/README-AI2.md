# LiveLeaf AI -- System Prompts Documentation

## Overview

LiveLeaf AI uses two specialized system prompts to provide plant
identification, plant-health analysis, environmental monitoring, and
conversational plant-care assistance.

The prompts have separate responsibilities:

-   **Prompt 1 -- Plant Identification and Health Analysis:** An
    analysis engine that evaluates an uploaded plant image and available
    sensor readings. It researches plant requirements and returns a
    structured JSON response.
-   **Prompt 2 -- Conversational Plant-Care Assistant:** A chat
    assistant that communicates with users, uses plant records supplied
    by the application backend, interprets sensor readings, and provides
    understandable recommendations.

Keeping these responsibilities separate makes the system easier to
maintain. The analysis prompt focuses on structured assessment, while
the conversational prompt focuses on explaining information and helping
users.

------------------------------------------------------------------------

## 1. System Architecture

The prompts are intended to operate as part of the LiveLeaf application
architecture. They do not independently connect to the application's
database, hardware, or external services. The backend is responsible for
providing the required information and tools.

A typical architecture looks like this:

``` text
                    LIVELEAF APPLICATION
                            |
              +-------------+-------------+
              |                           |
        Plant image                 Chat message
              |                           |
              v                           v
       BACKEND / API                 BACKEND / API
              |                           |
     Image + sensor data          User message + context
              |                           |
              v                           v
       PROMPT 1                      PROMPT 2
    Plant Analysis Engine       Conversational Assistant
              |                           |
       Structured JSON           Natural-language answer
              |                           |
              v                           v
       Backend processes          Application displays
       and stores results         the assistant response
              |                           ^
              +------ LiveLeaf DB --------+
```

The backend acts as the connection between the AI models, the database,
the application, and any connected monitoring hardware.

## 2. Prompt 1 -- Plant Identification and Health Analysis

### Purpose

Prompt 1 is responsible for analyzing a plant using an uploaded image
and any available environmental sensor readings.

It should be used when the user uploads a plant image for identification
or health assessment, or when the application needs an updated plant
analysis.

### Main responsibilities

**Plant identification**

-   Identifies the common name, scientific name, species, and plant
    type.
-   Estimates identification confidence.
-   Uses visible characteristics and reliable reference information.
-   Communicates uncertainty rather than inventing an identification.

**Environmental requirements**

Researches the plant's recommended environmental conditions, including:

-   Soil moisture.
-   Relative air humidity.
-   Temperature in Celsius.

It must distinguish horticultural recommendations from sensor-specific
measurements. In particular, soil-moisture percentages depend on the
sensor, soil, and calibration.

**Plant health analysis**

Evaluates visible symptoms such as yellow leaves, wilting, brown edges,
spots, damaged leaves, and possible fungal growth.

It may identify possible diseases, but it must not present an
image-based suspicion as a confirmed diagnosis.

**Sensor analysis**

When the backend supplies sensor readings, the prompt compares them with
the identified plant's recommended requirements. It classifies each
measurement as too low, within range, too high, or unavailable.

**Automated monitoring recommendations**

Recommends practical reading intervals for soil moisture, air humidity,
temperature, and the complete monitoring cycle.

It can recommend more frequent monitoring when conditions become
abnormal or the plant is experiencing health problems. These
recommendations are suggestions for the device controller; the backend
or device firmware must implement them.

**Plant-care recommendations**

Provides practical guidance based on the plant identification, visible
condition, environmental requirements, and supplied sensor readings.

### Input expected by Prompt 1

The backend should provide the model with:

-   The uploaded plant image.
-   Current soil-moisture reading, if available.
-   Current air-humidity reading, if available.
-   Current temperature reading, if available.
-   Any relevant device or plant context.

The image must be sent in a format supported by the selected AI model.
Sensor values should be clearly labeled with their units and should
indicate when a value is unavailable.

Example input concept:

``` json
{
  "plant_image": "<uploaded image>",
  "sensor_readings": {
    "soil_moisture_percent": 42,
    "air_humidity_percent": 55,
    "temperature_celsius": 24
  }
}
```

This is an illustrative input format, not a mandatory schema defined by
Prompt 1. The backend should adapt it to the selected model's API.

### Output expected from Prompt 1

Prompt 1 must return valid JSON using the exact structure defined in its
system prompt.

The response contains:

-   `plant_identification`: plant names, type, and confidence.
-   `reference_images`: verified reference image URLs and their source
    pages.
-   `health_analysis`: visible condition, symptoms, and possible
    disease.
-   `environment_requirements`: recommended plant-specific ranges.
-   `environment_analysis`: comparison with current sensor readings.
-   `monitoring_schedule`: normal and abnormal monitoring intervals and
    alert conditions.
-   `recommendations`: practical care instructions.
-   `summary`: a concise overview of the analysis.

The backend should parse and validate the returned JSON before using it.
It should handle invalid JSON, missing fields, unavailable values, and
model/API errors.

### Important implementation note

A system prompt cannot perform web searches or retrieve images by
itself. If web research and reference-image verification are required,
the backend must provide the model with suitable search or browsing
capabilities, or retrieve the information separately and pass the
results into the model.

Likewise, the model cannot read physical sensors directly. The backend
must obtain sensor readings from the device and include them in the
request.

------------------------------------------------------------------------

## 3. Prompt 2 -- Conversational Plant-Care Assistant

### Purpose

Prompt 2 manages the user's ongoing conversation with LiveLeaf AI.

It is designed to answer questions naturally, explain information stored
in the LiveLeaf database, interpret supplied sensor readings, and help
users understand how to care for their plants.

Unlike Prompt 1, it does not return a fixed JSON analysis object. Its
primary output is a natural-language response.

### Main responsibilities

**Natural conversation**

-   Communicates in Arabic or English.
-   Automatically follows the user's language.
-   Uses simple and understandable terminology.
-   Maintains the context of the current conversation.
-   Understands follow-up questions about the plant being discussed.

**Database-based plant information**

Prompt 2 prioritizes plant records supplied by the backend from the
`PLANTS` database table.

The available fields include:

  Database field                Purpose
  ----------------------------- ------------------------------
  `SCIENTIFIC_NAME`             Scientific plant name
  `COMMON_NAME`                 Common plant name
  `MAX_HEIGHT`                  Maximum plant height
  `LIGHT_REQUIREMENTS`          Required lighting conditions
  `SOIL_PH_MAX`                 Maximum recommended soil pH
  `SOIL_PH_MIN`                 Minimum recommended soil pH
  `WATER_NEEDED`                Plant water requirements
  `OPTIMUM_SOIL_MOISTURE_PCT`   Optimum soil-moisture target
  `CRITICAL_DROUGHT_PCT`        Critical drought threshold

The backend is responsible for querying the database and providing
relevant records to the AI model.

Prompt 2 interprets the supplied records and explains them in a
user-friendly way. It must never pretend to have queried the database
when no records were provided.

**Sensor interpretation**

When sensor readings are included in the request, Prompt 2 compares the
current soil-moisture reading with the plant's database values.

For example:

-   At or below `CRITICAL_DROUGHT_PCT`: Warn that the plant may be
    experiencing critical dryness.
-   Above the critical threshold but below the optimum target: Explain
    that soil moisture is lower than the target.
-   Around the optimum target: Explain that the moisture level is within
    the target range.

The assistant should avoid making unsupported watering recommendations
based on one reading alone.

**Plant-care assistance**

Prompt 2 can help users with:

-   Watering and soil moisture.
-   Sunlight and lighting.
-   Soil pH.
-   Drought warnings.
-   General plant maintenance.
-   Indoor plant recommendations.
-   Plant comparisons.
-   Understanding plant conditions.

### Input expected by Prompt 2

The backend should send the user's message together with relevant
context, such as:

-   The user's latest message.
-   Recent conversation history.
-   The identified plant, when known.
-   Relevant plant records retrieved from the database.
-   Current sensor readings, when available.
-   Any relevant analysis previously produced by Prompt 1.

Example input concept:

``` json
{
  "message": "Does my plant need watering?",
  "conversation_context": {
    "plant_name": "Example Plant"
  },
  "plant_data": {
    "SCIENTIFIC_NAME": "Example scientific name",
    "COMMON_NAME": "Example Plant",
    "OPTIMUM_SOIL_MOISTURE_PCT": 45,
    "CRITICAL_DROUGHT_PCT": 20
  },
  "sensor_readings": {
    "soil_moisture_percent": 25
  }
}
```

The values above are illustrative only. The backend must use actual
database records and actual sensor readings.

### Output expected from Prompt 2

Prompt 2 returns a conversational response in the same language as the
user.

For example:

**User:** Does my plant need watering?

**LiveLeaf AI:** Your soil moisture is currently below the recommended
target for this plant. It is not yet at the critical drought threshold,
but you should continue monitoring it. Check the soil condition before
watering to avoid overwatering.

The assistant should keep simple answers short and use structured plant
information only when it is useful.

------------------------------------------------------------------------

## 4. How the Two Prompts Work Together

The two prompts are complementary. They should not be treated as two
versions of the same assistant.

  -----------------------------------------------------------------------
  Feature                 Prompt 1                Prompt 2
  ----------------------- ----------------------- -----------------------
  Main role               Plant analysis          User conversation

  Input                   Plant image and sensor  User message and
                          data                    application context

  Plant identification    Main responsibility     Uses supplied plant
                                                  information

  Health assessment       Detailed image-based    Explains available
                          assessment              health information

  Environmental research  Researches recommended  Uses database
                          ranges                  information first

  Sensor analysis         Detailed comparison     Conversational
                                                  interpretation

  Monitoring intervals    Recommends device       Explains monitoring
                          intervals               information

  Database usage          Not its primary         Prioritizes supplied
                          responsibility          database records

  Output                  Structured JSON         Natural language
  -----------------------------------------------------------------------

### Recommended workflow

**Step 1 -- User uploads a plant image**

The application sends the image and available sensor readings to the
backend.

**Step 2 -- Backend calls Prompt 1**

The backend sends the image and sensor information to the AI model using
Prompt 1 as the system prompt.

**Step 3 -- Prompt 1 analyzes the plant**

The model identifies the plant, assesses its visible health, researches
its environmental requirements when research capabilities are provided,
compares sensor readings, and recommends monitoring intervals.

**Step 4 -- Backend validates and saves the analysis**

The backend validates the JSON response and can save the relevant plant
information and analysis results in the appropriate database tables.

The backend should not automatically execute a monitoring schedule or
initiate watering just because the AI recommended it. Device actions
should be validated and handled by the application's control logic.

**Step 5 -- User starts a conversation**

When the user asks a question, the backend retrieves the relevant plant
information from the LiveLeaf database.

**Step 6 -- Backend calls Prompt 2**

The backend sends the user's message, relevant conversation history,
database records, and available sensor readings to the model using
Prompt 2.

**Step 7 -- Prompt 2 responds**

The assistant explains the available information naturally and provides
appropriate plant-care recommendations.

**Step 8 -- User continues the conversation**

The backend provides relevant conversation history and updated plant or
sensor information for subsequent messages.

------------------------------------------------------------------------

## 5. Database Integration

The LiveLeaf database is an important information source for Prompt 2.

The expected process is:

1.  The user asks a plant-related question.
2.  The backend identifies the plant mentioned in the message or
    conversation context.
3.  The backend queries the `PLANTS` table.
4.  The backend retrieves the relevant fields.
5.  The backend includes the results in the AI request.
6.  Prompt 2 uses those records to formulate its answer.

### Important database rule

The AI model should not be given direct database credentials or
unrestricted database access.

Database operations should be performed by the backend using secure
database connections and parameterized queries. The AI model should
receive only the information required to answer the user's request.

If a plant does not exist in the database, Prompt 2 should explain that
the plant is not currently available in the LiveLeaf database. It may
still provide general plant-care knowledge when appropriate, while
clearly distinguishing it from database information.

------------------------------------------------------------------------

## 6. Sensor and Hardware Integration

Both prompts depend on the backend to provide accurate sensor readings.

A typical sensor data flow is:

``` text
     LIVELEAF MONITORING DEVICE
                 |
        +--------+--------+
        |        |        |
       Soil     Air      Temperature
     Moisture  Humidity     Sensor
        |        |        |
        +--------+--------+
                 |
                 v
          DEVICE / BACKEND
                 |
          Sensor Readings
                 |
          +------+------+
          |             |
          v             v
       PROMPT 1      PROMPT 2
       Detailed      User-friendly
       Analysis      Explanation
```

The device may measure:

-   Soil moisture percentage.
-   Relative air humidity percentage.
-   Temperature in Celsius.

The backend should include timestamps, units, and sensor availability
where possible.

### Monitoring schedule implementation

Prompt 1 recommends monitoring intervals, but the recommendation alone
does not change the device's behavior.

The backend or device firmware must:

1.  Receive the recommended intervals.
2.  Validate them against device limits and safety rules.
3.  Apply the approved schedule.
4.  Monitor device performance.
5.  Send updated readings to the backend.

Soil-moisture sensors may not need to be read as frequently as
temperature or humidity sensors. The application should also account for
battery consumption, sensor accuracy, and calibration.

------------------------------------------------------------------------

## 7. Recommended API Integration

The following is a suggested application-level structure. It is not a
required API implementation.

### Endpoint 1 -- Plant Analysis

Example:

``` http
POST /api/plants/analyze
Content-Type: multipart/form-data
```

Expected responsibilities:

-   Accept the uploaded image.
-   Retrieve the latest available sensor readings.
-   Call the AI model with Prompt 1.
-   Validate the returned JSON.
-   Save the analysis results.
-   Return the analysis to the application.

### Endpoint 2 -- Plant Chat

Example:

``` http
POST /api/chat
Content-Type: application/json
```

Example request:

``` json
{
  "message": "How much sunlight does this plant need?",
  "plant_id": 1,
  "conversation_id": 10
}
```

Expected responsibilities:

-   Receive the user's message.
-   Retrieve the relevant plant record.
-   Retrieve recent conversation history.
-   Retrieve sensor readings when relevant.
-   Call the AI model with Prompt 2.
-   Return the assistant's response.
-   Save the conversation if required.

The actual endpoint names, request formats, and database relationships
should follow the existing LiveLeaf backend implementation.

------------------------------------------------------------------------

## 8. Important Rules for Both Prompts

For reliable operation, the application should follow these principles:

1.  **Never fabricate information:** Missing database values, sensor
    readings, plant identifications, and research results must remain
    unavailable rather than being guessed.
2.  **Keep responsibilities separate:** Prompt 1 handles structured
    plant analysis; Prompt 2 handles conversational assistance.
3.  **Validate AI output:** JSON returned by Prompt 1 must be checked
    before database storage or application use.
4.  **Provide real context:** The backend must supply database records,
    conversation history, and sensor readings when required.
5.  **Protect application data:** Never expose database credentials, API
    keys, or internal system information to the model or user.
6.  **Handle errors:** The application must handle API failures, invalid
    responses, missing data, and unavailable services.
7.  **Control hardware safely:** AI-generated recommendations must pass
    backend or firmware validation before changing device settings or
    triggering physical actions.
8.  **Preserve language consistency:** Prompt 2 should respond in the
    language used by the user.
9.  **Avoid unsupported diagnoses:** Plant diseases suggested from
    images should be treated as possibilities, not confirmed diagnoses.
10. **Respect sensor calibration:** Soil-moisture values must be
    interpreted according to the actual sensor and soil conditions.

------------------------------------------------------------------------

## 9. Final Summary

LiveLeaf AI is designed around two specialized AI prompts that work
together through the application backend.

**Prompt 1 -- Plant Identification and Health Analysis** acts as the
plant analysis engine. It processes plant images, evaluates visible
health conditions, researches environmental requirements when supported
by external research capabilities, analyzes sensor readings, and
recommends automated monitoring intervals. It returns structured JSON
that the backend can validate and process.

**Prompt 2 -- Conversational Plant-Care Assistant** acts as the user's
personal plant-care assistant. It communicates in Arabic and English,
uses plant information retrieved from the LiveLeaf database, interprets
sensor readings, remembers the current conversation context, and
provides practical recommendations in natural language.

The backend connects these two prompts with the LiveLeaf database,
application, AI model, and monitoring hardware.

Together, they provide a system that can identify plants, understand
their environmental needs, monitor their conditions, and help users make
better plant-care decisions.

------------------------------------------------------------------------

## 10. Implementation Checklist

-   [ ] Configure Prompt 1 as the system prompt for the plant-analysis
    workflow.
-   [ ] Configure Prompt 2 as the system prompt for the conversational
    workflow.
-   [ ] Connect the selected AI model to the backend.
-   [ ] Implement image upload and image input handling.
-   [ ] Implement web-search or research capabilities if Prompt 1
    requires external plant references.
-   [ ] Connect the backend securely to the LiveLeaf database.
-   [ ] Retrieve and pass relevant `PLANTS` records to Prompt 2.
-   [ ] Connect the monitoring device and retrieve sensor readings.
-   [ ] Validate Prompt 1 JSON responses.
-   [ ] Store analysis results using the application's database design.
-   [ ] Implement conversation history for Prompt 2.
-   [ ] Validate monitoring recommendations before applying them to
    device firmware.
-   [ ] Test missing data, uncertain identification, invalid responses,
    and API errors.
-   [ ] Test both Arabic and English conversations.
