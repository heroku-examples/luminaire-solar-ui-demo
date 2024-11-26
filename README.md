# Luminaire Solar - Frontend

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Requirements

- Node.js LTS (>v20.x)
- An [Heroku](https://signup.heroku.com/) account
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Installation

Install pnpm

```sh
corepack install -g pnpm@latest
```

> [!NOTE]
> If `corepack` is not installed you can run `npm install -g corepack`

Install dependencies by running:

> [!WARNING]
> Don't mix `pnpm` and `npm`, `pnpm` is more performant and have better cache

Install dependencies by running:

```sh
pnpm install
```

Create an Heroku application with:

```sh
heroku create <app-name>
```

Run the project locally with:

```sh
pnpm run dev
```

## Manual Deployment

To manually deploy to Heroku you can run:

```sh
git push heroku main
```
