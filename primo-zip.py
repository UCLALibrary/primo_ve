# importing required modules
import shutil
import fileinput
import json
import os
import sys


def swap_secrets_and_values(secret_data, types_to_check, directory, secret_visible=True):

    # var for file paths list
    file_paths = []

    # crawl the directory structure
    for root, directories, files in os.walk(directory):
        for filename in files:
            if (filename.endswith(types_to_check)):
                filepath = os.path.join(root, filename)
                file_paths.append(filepath)

                # find and replace each secret tag with the actual secret
                cnt = 0
                for i in secret_data['secret_details']:
                    secret_name = str(
                        secret_data['secret_details'][cnt]['secret_name'])
                    secret_value = str(
                        secret_data['secret_details'][cnt]['secret_value'])

                    with fileinput.FileInput(filepath, inplace=True) as file:
                        for line in file:
                            # Replaces secret_name with secret_value when secret_visible is True
                            # Replaces secret_value with secret_name when secret_visible is False
                            if secret_visible:
                                print(line.replace(secret_name, secret_value), end='')
                            else:
                                print(line.replace(secret_value, secret_name), end='')
                    cnt += 1


def zip_up_source(zip_name, base_directory, directory):
    # zip all of the source files
    shutil.make_archive(zip_name, 'zip', base_directory, directory)


def main():
    # user must input zip_name parameter at command line
    if len(sys.argv) > 1:
        zip_name = sys.argv[1]
    else:
        sys.exit("Folder name parameter must be specified.")

    # zip info
    types_to_check = ('.js', '.css', 'html', 'md', 'txt')
    base_directory = '.'
    directory = './' + zip_name

    # source of the secrets
    secrets = open('secrets.json')
    secret_data = json.load(secrets)
    secrets.close()

    # find each file in dir structure, replace tags with secrets
    swap_secrets_and_values(secret_data, types_to_check,
                            directory, secret_visible=True)

    # zip the source for deploymeny to Primo
    zip_up_source(zip_name, base_directory, directory)

    # find each file in dir structure, replace secrets with tags
    swap_secrets_and_values(secret_data, types_to_check,
                            directory, secret_visible=False)

    print('Secrets inserted and files zipped: ' + zip_name + '.zip')
    print('Secrets cleared: code may now be pushed')


if __name__ == "__main__":
    main()
