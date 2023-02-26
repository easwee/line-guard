# Line Guard

Validate file line-by-line against a regex pattern of your choice. Each offending line is highlighted.

## Features

- highlight offending lines if they fail to match your custom regex pattern
- specify which files you want to validate

## Requirements

You need to configure a regex string pattern that will be used to validate each line in the file.

## Extension Settings

This extension contributes the following settings:

- `lineGuard.regex`: Regex string. Required if you want the extension to trigger validation. (example input: `^.{1,3}$` the line will match any string that is 3 characters in length, otherwise it is an invalid line. Use `^$` to match the entire line exactly, not just containing characters)
- `lineGuard.fileName`: Comma-delimited file name list of files that are meant to be validated. Use '\*' to include all. File names are case-sensitive. (example value: myFile.txt, anotherFile.db)
- `lineGuard.fileExtensions`: Comma-delimited file extensions list of file types that are meant to be validated. Use '\*' to include all. Extensions are case-sensitive. (example value: .txt, .db)

## Release Notes

### 1.0.0

Initial release

### 1.0.1

Validate only specified file names or specified file extensions.
