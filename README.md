# Event Map

This project provides a map of all of the events specific to an organization's account in Mobilize America. It loads the events via the Mobilize API ([docs for /events endpoint](https://github.com/mobilizeamerica/api#request-2)).

The project originated with the [Tech for Warren group](https://github.com/techforwarren/eventmap) in 2019.

## Working version

The event map is now live at [https://hope-and-code-labs.github.io/eventmap/](https://hope-and-code-labs.github.io/eventmap/)! Future merges to the `gh-pages` branch will update this site.

## Getting Started - Cloning & Installation

You can clone the GitHub repo or download it from the repo page. After it is on your local machine, be sure to run `npm install` to install all dependencies.

Change the `mobilizeOrgId` variable in src/App.js to reflect your organization's id in Mobilize. The default is the organization id for the Warren for President campaign.

## Running App Locally - `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Deploying / Exporting For Github Pages - `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
