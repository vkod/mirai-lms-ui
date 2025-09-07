# SecureLife Hackathon

## About Company
    Large multinational insurance company with life insurance products

# Application Overview
    A futuristic Lead Management system powered by AI and uses Agentic flows to manage and convert leads.

# Features

## Menu strucutre
 - Left pane menu should have three items: Dashboard, AI Agent Dojo and Synthetic personas

## 1. AI Agent Dojo
    Shows cards of AI agents with information like below.
    ```{
    "name": "Digital Twin Agent",
    "version": "1.0",
    "goal": "Create an imaginary persona based on data provided and update the digital twin with data as much as possible.If existing_digital_twin information is provided, update it with new or changed information based on clear signals in data",
    "inputs": [
      "Website traffic data",
      "Existing Digital twin if any"
    ],
    "outputs": [
      "Updated/New Digital twin"
    ],
    "metrics": {
      "Data processed": 100,
      "Digital twins created": 78,
      "Digital twins updated": 23,
      "Cost this month": 20000
    }
  }```
### 1.1 AI Agent Details page
- On clicking an Agent, agent details page will be displayed with all agent info.
- There will be a small dashboard section where key metrics will be displayed.
- Metrics could be different for each agent.

## 2. Digital Twins
- Show a list of digital twins with details like persona, product interest, age group , annual income etc.
- Provide search options to search and filter the leads.
- The list should be paginated and should load say 30 records at a time.
- On selection of a lead, Lead page should get displayed

### 2.1 Lead Details page
- Display details of the lead in the page(Decide how to display this in user friendly way)
    - Lead identifier
    - Persona Summary  
    - Personal Information  
    - Demographic Information  
    - Financial Information  
    - Insurance History  
    - Behavioral Signals & Preferences  
    - Engagement & Opportunities  
- Leads photograph also should be displayed.
- Under the photograph there should be a bar with buttons for "Virtual Chat" and "Virtual Call".
- Also there should be a tab to display markdown text of above information in markdown format
- Clicking on Virtual Chat option should bring up Chat window. On top of the chat window, image of the lead and some persona information should be display