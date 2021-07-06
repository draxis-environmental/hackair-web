# hackAIR web app

## Deprecation notice
This is an old version of the hackAIR web application, and is not actively supported.

## Description
The hackAIR web app enables communitites of citizens to set up an air quality monitoring network by collecting, fusing, publishing and visualizing air pollution data. 
The app has been developed based on Angular v1.

## Instructions
- clone this repository
- `npm install`
- `bower install`
- `gulp serve`

## Project Style
The project is based on [John Papa's styling guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md).

The following changes have been made to the proposed file structure so that it
remains compatible with the Ionic framework:
- App code remains in the ```www``` folder.
- Bower components are stored in the ```www/lib``` folder.

The basic structure is shown below:
- www
  - app
    - core
      - config.js
      - core.module.js
      - core.route.js
      - router
      - logger
      - exception
    - componentX
      - componentX.html
      - componentX.controller.js
      - componentX.route.js
      - componentX.service.js
      - componentX.directive.js
      - componentX.scss
    - app.module.js  
  - scss
  - css
  - img
  - lib
  - index.html

## License
The hackAIR mobile app is licensed under the AGPL v3 licence. You may obtain a copy of the license [here](https://www.gnu.org/licenses/agpl-3.0.en.html).

## Credits
The hackAIR mobile app was created under the scope of hackAIR EU Horizon 2020 Project.
