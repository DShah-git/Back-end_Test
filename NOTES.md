[2026-05-11]

1. upon researching the algorithm, I see that it is a iterative algorithm where you take a guess and improve upon the guess with the following formula

   root = 0.5 \* (this.guess + this.number / this.guess);

2. I see the initial guess matters for iteration count. I can either start with 1 which google has suggested or half the number of input. Since I care about iterations efficiency, I will go with half of the input number unless its 1.

3. I will just try implementing the class first and worry about the routes later.

4. In test cases, I see that I need to return 0 for negative inputs.

5. Using copilot for Prisma/SQLite installation
   a. Models created in schema.prisma
   b. data in file:dev.db
   c. prisma studio for validation

6. Issues with initializing prisma client in util/database.ts.
   a. Used PrismaBetterSqlite3 to override whatever copilot wrote in database.ts
