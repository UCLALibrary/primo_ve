# primo_ve
Primo VE Production

This repo may be deployed to Primo VE at https://ucla.alma.exlibrisgroup.com/SAML.
A *premium sandbox* (PSB), copied from production, is at https://sandbox02-na.alma.exlibrisgroup.com/institution/01UCS_LAL).

Note: Deployment to either target is a manual process - this repo is used for source control.

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

    - locally, rename the top level folder from ```01UCS_LAL-UCLA``` to the name of the test view you will use
    - run the ```primo-zip.py``` script on the command line, using the desired view's name as a parameter, e.g.
    ```>python3 primo-zip.py 01UCS_LAL-TEST_DEV```
        - note: the view name specified here must match the name of the top-level folder
    - note: ```01UCS_LAL-TEST_DEV``` is created (or updated) with secrets in place; secrets are then erased from the source code (from which the zip file was created)
    - upload to the desired test view using the Primo gui: https://ucla.alma.exlibrisgroup.com/SAML
    - delete the folder and zip file before continuing editing or using git
    - delete the secrets.json file before using git
      - this is a good precaution even though ```*secrets*``` is in the ```.gitignore``` file
    - repeat the copy and zip before each deploy to the Test system
    - reset to Production by renaming the top level folder to ```01UCS_LAL-UCLA```

Deploy to Production

    - ensure that the top level folder is named 01UCS_LAL-UCLA
    - delete any Test folders or zip files
    - run the ```primo-zip.py``` script on the command line, using the production's view name as a parameter
    ```>python3 primo-zip.py 01UCS_LAL-UCLA```
    - note: ```01UCS_LAL-UCLA.zip``` is created (or updated) with secrets in place; secrets are then erased from the source code (from which the zip file was created)
    - upload to the production view using the Primo gui: https://ucla.alma.exlibrisgroup.com/SAML
    - delete the folder and zip file before continuing editing or using git
    - delete the secrets.json file before using git
      - this is a good precaution even though ```*secrets*``` is in the ```.gitignore``` file
    - repeat zip before each deploy to the Test system

Note: Any Alma Primo VE gui settings that are changed in the test view's GUI must be transferred by hand to the *UCLA* view GUI.
