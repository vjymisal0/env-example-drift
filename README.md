# env-example-drift

Check that `.env` and `.env.example` contain the same variable names.

It is intentionally small: values are ignored, only keys are compared. This makes it useful in CI without leaking secrets.

## Usage

```sh
npx env-example-drift
```

Custom file names:

```sh
npx env-example-drift --example .env.sample --env .env.local
```

## Example

`.env.example`:

```sh
DATABASE_URL=
PORT=3000
```

`.env`:

```sh
DATABASE_URL=postgres://localhost/app
```

Output:

```text
Missing in .env: PORT
```

## Why

Teams often update `.env` locally and forget to update `.env.example`, or add a required example key that is missing locally. This tiny check catches that drift before onboarding or deploys break.

## License

MIT
