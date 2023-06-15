# UCLA Primo VE Development Environment

This is a Dockerized version of the Ex Libris [primo-explore-devenv](https://github.com/ExLibrisGroup/primo-explore-devenv).
It's derived from the excellent [WRLC primo devenv](https://github.com/wrlc-primo-dev/wrlc-primo-devenv), updated to match the new(er) version of Node currently used by Ex Libris, and customized for UCLA's environment and workflow.  Many thanks to WRLC for making their work publicly available!

Developers at other Primo VE sites are welcome to use this as a starting point. However, this repository contains UCLA-specific Primo VE views and other tools for our local environment.

## Setup

1. Install the latest version of [Docker Community Edition](https://www.docker.com/community-edition#/download), and [Docker Compose](https://docs.docker.com/compose/install/#install-compose).

2. Clone this repository. 
```
git clone git@github.com:UCLALibrary/primo_ve.git
```

## Run
From the `primo_ve` directory:
```
# To run in the foreground, showing output:
docker-compose up
# Or use -d to detach and run in background
docker-compose up -d
# After which, show logs if desired:
docker-compose logs -f primo
```
If running this for the first time, the docker image may take a few minutes to build.  The output may show lots of warnings about deprecated packages... this is expected, as the image uses a very old version of Node (version 16.20, the closest image on Docker Hub to the 16.17 LTS version Ex Libris is currently using).

Now visit your local development environment at http://localhost:8003/discovery/search?vid=01UCS_LAL:UCLA. If testing a non-default view, replace `UCLA` with the view's name. (For non-UCLA developers, replace `01UCS_LAL:UCLA` with your full `INSTANCE:VIEW`).  The view name in the URL must match an existing view in the Primo VE instance you're testing against.  However, the name of the view in your local development environment does not have to match that view name.

## Develop
You can make changes to the view you're developing in the views folder and they will be reflected in the local development environment.

## Build packages
Views must be packaged and uploaded via Alma to be available for others to use.

### Secrets
API keys and other secrets should *not* be placed directly in view-related code.  Instead, use specially-named placeholders in the code, with real values in `secrets.json`.  Get this file from a team-mate, and share any updates; this file is not included in the git repository.

Structure of `secrets.json`:
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
Use the relevant `secret_name` in code, like `api-key: 'example_secret_48382304'`.  As part of the packaging process, each placeholder `secret_name` is replaced with the corresponding `secret_value`.

Each `secret_name` includes a random string for uniqueness.

### Packaging
Before others can use / test a view, it must be packaged and uploaded via Alma.  Packaging a view:
* Inserts the `secret_value` for each `secret_name` used in code
* Zips the view into an appropriately-named package file

To do this, run:
`python ./primo-zip.py` with either the full name of the view (e.g., `01UCS_LAL-UCLA`), or just the part after the prefix (e.g., `UCLA`):
```
# These are equivalent:
python ./primo-zip.py 01UCS_LAL-UCLA
python ./primo-zip.py UCLA
```
This would create `01UCS_LAL-UCLA.zip` in the top level of the project (the same directory as `primo-zip.py`).

### Uploading
Uploading a package to Alma requires appropriate permissions.  See [internal documentation](https://docs.library.ucla.edu/x/1BnvEg) for UCLA-specific procedures.

## Troubleshooting

### Naming conventions and the spinning diamond graphic
If you're seeing the diamonds loading graphic, but your page never loads, double check that the name of your view folder matches the name configured in `vars.env`. Note that the url you use to access the view in your browser must use an actual view code in your Primo VE instance. The folder name and view name in `vars.env` does not have to be the same as this view code.

### Colons
View codes for Primo VE have colons, but those colons must be replaced with hyphens when you upload your package. So a package for the view with the code `01UCS_LAL:UCLA` must be uploaded as `01UCS_LAL-UCLA.zip`.
