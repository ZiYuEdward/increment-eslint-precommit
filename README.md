## Increment eslint precommit
----

**check increasing files or lines problems base on eslint when git precommit**

### Installation

Requires husky and lint-stage for precommit

```
npm i husky@4.3.8 lint-staged@10.5.4 increment-eslint-precommit -D
```

### Usage

```
// package.json

{
    "script": {
        "lint:file": "precommit-file",
        "lint:lines": "precommit-newline"
    },
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged"
        }
    },
    "lint-staged": {
        "src/**/*.js": [
            "npm run lint:file" //or "npm run lint:lines"
        ]
  }
}
```
#### precommit-file

will check all problems in increased or changed files

#### precommit-newline

only check increased or changed lines's problems

#### eslintConfig and eslintIgnore
put .eslintrc.json and .eslintignore in root path or it will use [default config]()

${process.cwd()}/.eslintrc.json

${process.cwd()}/.eslintignore

see more config details [eslint config](https://eslint.org/docs/user-guide/configuring/configuration-files#configuration-file-formats)

### TODO
[] support custom eslintrc.json path

