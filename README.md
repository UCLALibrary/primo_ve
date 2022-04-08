# primo_ve
Primo VE Production

This repo may be deployed to Primo VE at https://ucla.alma.exlibrisgroup.com/SAML.
A *premium sandbox* (PSB), copied from production, is at https://sandbox02-na.alma.exlibrisgroup.com/institution/01UCS_LAL).

Note: Deployment to either target is a manual process - this repo is used for source control.
        This repo is defaulted for deployment to Production. Make the changes noted below for deployment to Test.

**Workflow**

Develop your code
- clone primo_ve (this repo)
- work, add, commit, push, merge
- repeat until finished
- ask for the secrets file ```secrets.json``` and place it in the ```primo_ve``` directory
    - add any new secrets: ```secret_name``` and ```secret_value```
    - append a random string to the ```secret_name``` for uniqueness

Structure of a typical ```secrets.json``` file

```
{
    "secret_details": [
        {
            "secret_name":"example_secret_48382304",
            "secret_value":"the_real_secret"            
        },
        {
            "secret_name":"libanswers_secret_86530858",
            "secret_value":"the_real_secret"            
        }
    ]
}
```

Deploy to Test:

    - locally, rename the top level folder from ```01UCS_LAL-UCLA``` to ```01UCS_LAL-Test_00```
    - run the ```primo-zip.py``` script on the command line
    ```>python3 primo-zip.py```
    - note: ```01UCS_LAL-Test_00.zip``` is created (or updated) with secrets in place; secrets are then erased from the source code (from which the zip file was created)
    - upload to the *Test_00* view using the Primo gui: https://ucla.alma.exlibrisgroup.com/SAML
    - delete the folder and zip file before continuing editing or using git
    - delete the secrets.json file before using git
      - this is a good precaution even though ```*secrets*``` is in the ```.gitignore``` file
    - repeat the copy and zip before each deploy to the Test system
    - reset to Production by renaming the top level folder from ```01UCS_LAL-Test_00``` to ```01UCS_LAL-UCLA```

Deploy to Production

    - ensure that the top level folder is named 01UCS_LAL-UCLA
    - delete any Test folders or zip files: ```01UCS_LAL-Test_00``` and/or ```01UCS_LAL-Test_00.zip```
    - run the ```primo-zip.py``` script on the command line
    ```>python3 primo-zip.py```
    - note: ```01UCS_LAL-UCLA.zip``` created (or updated) with secrets in place; secrets are then erased from the source code (from which the zip file was created)
    - upload to the *UCLA* view using the Primo gui: https://ucla.alma.exlibrisgroup.com/SAML
    - delete the folder and zip file before continuing editing or using git
    - delete the secrets.json file before using git
      - this is a good precaution even though ```*secrets*``` is in the ```.gitignore``` file
    - repeat zip before each deploy to the Test system

Note: Any Alma Primo VE gui settings that are changed in the *Test_00* GUI view must be transferred by hand to the *UCLA* GUI view.
