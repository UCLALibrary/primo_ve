# importing required modules
import shutil
import fileinput
import json
import os


def swap_secrets_and_values(secret_data, types_to_check, directory, secret_visible=1):

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

                    secret_swap = [secret_name, secret_value]
                    with fileinput.FileInput(filepath, inplace=True) as file:
                        for line in file:
                            # Replaces secret_name with secret_value when secret_visible = 1;
                            #  replaces secret_value with secret_name when secret_visible = 0
                            print(line.replace(
                                str(secret_swap[1-secret_visible]), secret_swap[secret_visible]), end='')
                    cnt += 1


def zip_up_source(zip_name, base_directory, directory):
    # zip all of the source files
    shutil.make_archive(zip_name, 'zip', base_directory, directory)


def main():
    # zip info
    types_to_check = ('.js', '.css', 'html', 'md', 'txt')
    base_directory = '.'
    directory = './01UCS_LAL-UCLA'
    directory_test = './01UCS_LAL-Test_00'
    zip_name = '01UCS_LAL-UCLA'
    zip_name_test = '01UCS_LAL-Test_00'

    # use the test folder if it is present
    isdir = os.path.isdir(directory_test)
    if(isdir):
        directory = directory_test
        zip_name = zip_name_test

    # source of the secrets
    secrets = open('secrets.json')
    secret_data = json.load(secrets)
    secrets.close()

    # find each file in dir structure, replace tags with secrets
    swap_secrets_and_values(secret_data, types_to_check,
                            directory, secret_visible=1)

    # zip the source for deploymeny to Primo
    zip_up_source(zip_name, base_directory, directory)

    # find each file in dir structure, replace secrets with tags
    swap_secrets_and_values(secret_data, types_to_check,
                            directory, secret_visible=0)

    print('Secrets inserted and files zipped: ' + zip_name + '.zip')
    print('Secrets cleared: code may now be pushed')


if __name__ == "__main__":
    main()
