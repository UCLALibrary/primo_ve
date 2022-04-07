# importing required modules
import shutil
import fileinput
import json
import os


def set_secrets_and_zip(secret_data, types_to_check, base_directory, directory, zip_name):

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
                            print(line.replace(
                                str(secret_name), secret_value), end='')
                    cnt += 1

    # zip all files after inserting the secret(s)
    shutil.make_archive(zip_name, 'zip', base_directory, directory)


def clear_secrets(secret_data, types_to_check, directory):

    # var for file paths list
    file_paths = []

    # crawl the directory structure
    for root, directories, files in os.walk(directory):
        for filename in files:
            if (filename.endswith(types_to_check)):
                filepath = os.path.join(root, filename)
                file_paths.append(filepath)

                # find and replace each actual secret with the secret tag
                cnt = 0
                for i in secret_data['secret_details']:
                    secret_name = str(
                        secret_data['secret_details'][cnt]['secret_name'])
                    secret_value = str(
                        secret_data['secret_details'][cnt]['secret_value'])

                    with fileinput.FileInput(filepath, inplace=True) as file:
                        for line in file:
                            print(line.replace(
                                secret_value, str(secret_name)), end='')
                    cnt += 1


def main():
    # zip info
    types_to_check = ('.js', '.css', 'html', 'md', 'txt')
    base_directory = '.'
    directory = './01UCS_LAL-UCLA'
    directory2 = './01UCS_LAL-Test_00'
    zip_name = '01UCS_LAL-UCLA'
    zip_name2 = '01UCS_LAL-Test_00'

    # use the test folder if it is present
    isdir = os.path.isdir(directory2)
    if(isdir):
        directory = directory2
        zip_name = zip_name2

    # source of the secrets
    secrets = open('secrets.json')
    secret_data = json.load(secrets)
    secrets.close()

    # find each file in dir structure, replace tags with secrets then zip all
    set_secrets_and_zip(secret_data, types_to_check,
                        base_directory, directory, zip_name)

    # clear the secrets
    clear_secrets(secret_data, types_to_check, directory)

    print('Secrets inserted and files zipped: ' + zip_name + '.zip')
    print('Secrets cleared: code may now be pushed')


if __name__ == "__main__":
    main()
