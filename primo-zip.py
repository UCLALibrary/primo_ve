# importing required modules
import shutil
import fileinput
import json
import os
import sys
import tempfile
from pathlib import Path


def swap_secrets_and_values(secret_data, directory, secret_visible):
    # look two levels deep for all .js files
    for filename in Path(directory).glob("*/*.js"):
        # find and replace each secret tag with the actual secret
        for secret in secret_data["secret_details"]:
            secret_name = secret["secret_name"]
            secret_value = secret["secret_value"]

            with fileinput.FileInput(filename, inplace=True) as file:
                for line in file:
                    # Replaces secret_name with secret_value when secret_visible is True
                    # Replaces secret_value with secret_name when secret_visible is False
                    if secret_visible:
                        print(line.replace(secret_name, secret_value), end="")
                    else:
                        print(line.replace(secret_value, secret_name), end="")


def zip_up_source(zip_name, directory):
    # create a temp folder so we can remove .DS_Store files
    # tempfile.TemporaryDirectory() creates a folder that will be automatically cleaned up
    with tempfile.TemporaryDirectory() as temp_dir:
        # Primo requires an inner folder with the same name as the zip file
        inner_dir = os.path.join(temp_dir, zip_name)
        os.mkdir(inner_dir)
        # copy the directory to the inner folder, overwriting previous temp folders
        shutil.copytree(directory, inner_dir, dirs_exist_ok=True)
        # remove .DS_Store files
        for filename in Path(inner_dir).glob("**/.DS_Store"):
            os.remove(filename)
        # zip the temp folder
        shutil.make_archive(zip_name, "zip", temp_dir)


def main():
    # user must input zip_name parameter at command line
    if len(sys.argv) > 1:
        zip_name = sys.argv[1]
        # add prefix (institution code) if not already present
        if zip_name[:10] != "01UCS_LAL-":
            zip_name = "01UCS_LAL-" + zip_name
    else:
        sys.exit("Folder name parameter must be specified.")

    # zip info
    directory = "./" + zip_name
    if not os.path.isdir(directory):
        sys.exit(
            (
                "Folder name parameter must match top-level directory name, "
                "with or without prefix (01UCS_LAL-)."
            )
        )

    # source of the secrets
    secrets = open("secrets.json")
    secret_data = json.load(secrets)
    secrets.close()

    # find each file in dir structure, replace tags with secrets
    swap_secrets_and_values(secret_data, directory, secret_visible=True)

    # zip the source for deployment to Primo
    zip_up_source(zip_name, directory)

    # find each file in dir structure, replace secrets with tags
    swap_secrets_and_values(secret_data, directory, secret_visible=False)

    print("Secrets inserted and files zipped: " + zip_name + ".zip")
    print("Secrets cleared: code may now be pushed")


if __name__ == "__main__":
    main()
