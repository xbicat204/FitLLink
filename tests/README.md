# Backend tests

The tests exercise FitLink business helpers without connecting to MongoDB or PayOS.

```text
tests/
├── unit/
│   ├── auth.test.js
│   ├── booking.test.js
│   └── payment.test.js
└── README.md
```

Run all unit tests:

```bash
npm test -- --runInBand
```

Generate HTML coverage:

```bash
npm test -- --runInBand --coverage
```

Jest writes the HTML report to `coverage/lcov-report/index.html`. Coverage output is generated, ignored by Git, and should not be checked in.

`tests/mocks/` is intentionally omitted: the selected tests call pure functions and use no external services that need mocking.
